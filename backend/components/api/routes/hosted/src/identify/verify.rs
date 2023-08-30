use super::BiometricChallengeState;
use crate::auth::ob_config::ObConfigAuth;
use crate::auth::user::UserAuthScope;
use crate::errors::challenge::ChallengeError;
use crate::errors::{ApiError, ApiResult};
use crate::identify::{ChallengeData, ChallengeState};
use crate::types::response::ResponseData;
use crate::utils::challenge::{Challenge, ChallengeToken};
use crate::utils::liveness::WebauthnConfig;
use crate::utils::session::AuthSession;
use crate::utils::vault_wrapper::VaultWrapper;
use crate::State;
use api_core::auth::session::user::{AuthFactor, UserSession};
use api_core::auth::session::UpdateSession;
use api_core::auth::user::UserAuthContext;
use api_core::auth::Any;
use api_core::config::Config;
use api_core::errors::business::BusinessError;
use api_core::errors::onboarding::OnboardingError;
use api_core::utils::headers::InsightHeaders;
use api_core::utils::vault_wrapper::AuthedData;
use chrono::{Duration, Utc};
use crypto::sha256;
use db::models::auth_event::NewAuthEvent;
use db::models::business_owner::BusinessOwner;
use db::models::insight_event::CreateInsightEvent;
use db::models::ob_configuration::ObConfiguration;
use db::models::scoped_vault::ScopedVault;
use db::models::vault::Vault;
use db::models::webauthn_credential::WebauthnCredential;
use db::TxnPgConn;
use itertools::Itertools;
use newtypes::email::Email;
use newtypes::fingerprinter::GlobalFingerprintKind;
use newtypes::{
    AuthEventKind, DataIdentifier, EncryptedVaultPrivateKey, Fingerprint, Fingerprinter, PhoneNumber,
    SandboxId, ScopedVaultId, SessionAuthToken, VaultId, VaultPublicKey, WebauthnCredentialId,
};
use paperclip::actix::{self, api_v2_operation, web, web::Json, Apiv2Schema};
use std::str::FromStr;

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
pub struct VerifyRequest {
    /// Opaque challenge state token
    challenge_token: ChallengeToken,
    challenge_response: String,
}

#[derive(Debug, Clone, Apiv2Schema, serde::Serialize)]
#[serde(rename_all = "snake_case")]
pub enum VerifyKind {
    UserCreated,
    UserInherited,
}

#[derive(Debug, Clone, Apiv2Schema, serde::Serialize)]
pub struct VerifyResponse {
    kind: VerifyKind,
    auth_token: SessionAuthToken,
}

#[api_v2_operation(
    tags(Hosted, Bifrost),
    description = "Verifies the response to either an SMS or biometric challenge. When the \
    challenge response is verified, we will return an auth token for the user. If no user exists \
    (which may only happen after a phone challenge), we will create a new user with the provided \
    phone number"
)]
#[actix::post("/hosted/identify/verify")]
pub async fn post(
    state: web::Data<State>,
    request: Json<VerifyRequest>,
    ob_pk_auth: Option<ObConfigAuth>,
    // When provided, augments the existing user_auth token with the scopes gained from the challenge
    user_auth: Option<UserAuthContext>,
    insight_headers: InsightHeaders,
) -> actix_web::Result<Json<ResponseData<VerifyResponse>>, ApiError> {
    // Note: Challenge::unseal checks for challenge token expiry as well
    let VerifyRequest {
        challenge_token,
        challenge_response,
    } = request.into_inner();
    let challenge_state =
        Challenge::<ChallengeState>::unseal(&state.challenge_sealing_key, &challenge_token)?.data;

    // Generate fingerprints and keypairs async if needed
    let challenge_data = match challenge_state.data {
        ChallengeData::Sms(challenge_state) => {
            let authed_data = AuthedData::Phone(PhoneNumber::parse(challenge_state.phone_number.clone())?);
            let sandbox_id = challenge_state.sandbox_id.clone();
            let vault_context = make_vault_context(
                &state,
                ob_pk_auth.as_ref(),
                authed_data,
                sandbox_id,
                challenge_state.h_code.clone(),
            )
            .await?;

            ChallengeContext::Sms(vault_context)
        }
        ChallengeData::Passkey(challenge_state) => ChallengeContext::Passkey(challenge_state),
        ChallengeData::Email(challenge_state) => {
            let vault_context = make_vault_context(
                &state,
                ob_pk_auth.as_ref(),
                AuthedData::Email(Email::from_str(challenge_state.email.leak())?),
                challenge_state.sandbox_id.clone(),
                challenge_state.h_code.clone(),
            )
            .await?;

            ChallengeContext::Email(vault_context)
        }
    };

    let config = state.config.clone();
    let session_key = state.session_sealing_key.clone();
    let (auth_token, user_kind) = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let (uv_id, user_kind, auth_factor, event_kind, passkey_cred_id) = match challenge_data {
                ChallengeContext::Sms(ctx) => {
                    let (tok, uk) = validate(conn, ctx, &challenge_response)?;
                    (tok, uk, AuthFactor::Sms, AuthEventKind::Sms, None)
                }
                ChallengeContext::Email(ctx) => {
                    let (tok, uk) = validate(conn, ctx, &challenge_response)?;
                    (tok, uk, AuthFactor::Email, AuthEventKind::Email, None)
                }
                ChallengeContext::Passkey(context) => {
                    let (tok, uk, cred) =
                        validate_biometric_challenge(conn, &config, context, &challenge_response)?;
                    (
                        tok,
                        uk,
                        AuthFactor::Passkey(cred.clone()),
                        AuthEventKind::Passkey,
                        Some(cred),
                    )
                }
            };

            // If you authed with passkey, you also get SensitiveProfile
            let sensitive_scope =
                matches!(auth_factor, AuthFactor::Passkey(_)).then_some(UserAuthScope::SensitiveProfile);

            let (auth_token, scoped_vault_id) = if let Some(user_auth) = user_auth {
                // If you provided an existing auth token, add the warranted scopes
                let user_auth = user_auth.check_guard(Any)?;
                let token = user_auth.auth_token.clone();
                let data = user_auth.data.clone().session_with_added_scopes_and_auth(
                    sensitive_scope.into_iter().collect(),
                    Some(auth_factor),
                );
                let scoped_vault_id = user_auth.scoped_user_id();
                user_auth.update_session(conn, &session_key, data)?;
                (token, scoped_vault_id)
            } else {
                // Otherwise, create a new token with the scopes for bifrost or my1fp
                let (new_token_scopes, duration, scoped_vault_id) = if let Some(ob_pk_auth) = ob_pk_auth {
                    let (sv_id, scopes) = onboarding_scopes(conn, ob_pk_auth, &uv_id)?;
                    let duration = Duration::minutes(30); // Onboarding is pretty short
                    (scopes.into_iter(), duration, Some(sv_id))
                } else {
                    let scopes = vec![Some(UserAuthScope::BasicProfile)].into_iter();
                    let duration = Duration::hours(8); // Issue my1fp token for a long time
                    (scopes, duration, None)
                };

                // Create the auth token for this user
                let scopes = new_token_scopes.chain([sensitive_scope]).flatten().collect();
                let data = UserSession::make(uv_id.clone(), scopes, vec![auth_factor]);
                let (token, _) = AuthSession::create_sync(conn, &session_key, data, duration)?;
                (token, scoped_vault_id)
            };

            // record the new auth event
            let insight = CreateInsightEvent::from(insight_headers).insert_with_conn(conn)?;
            NewAuthEvent {
                vault_id: uv_id,
                scoped_vault_id,
                insight_event_id: Some(insight.id),
                kind: event_kind,
                webauthn_credential_id: passkey_cred_id,
                created_at: Utc::now(),
            }
            .create(conn.conn())?;

            Ok((auth_token, user_kind))
        })
        .await?;

    Ok(Json(ResponseData {
        data: VerifyResponse {
            kind: user_kind,
            auth_token,
        },
    }))
}

pub enum ChallengeContext {
    Sms(VaultContext),
    Passkey(BiometricChallengeState),
    Email(VaultContext),
}

/// Determines the auth scopes to issue to allow a user to complete onboarding
fn onboarding_scopes(
    conn: &mut TxnPgConn,
    ob_pk_auth: ObConfigAuth,
    uv_id: &VaultId,
) -> ApiResult<(ScopedVaultId, Vec<Option<UserAuthScope>>)> {
    let obc = ob_pk_auth.ob_config();
    // Since only some codepaths above will create a SU, we need to always get_or_create a SU if
    // created with an ob config
    let uv = Vault::lock(conn, uv_id)?;
    let su = ScopedVault::get_or_create(conn, &uv, obc.id.clone())?;

    // If we verified with a BoSessionAuth, update the corresponding BO
    let bo_scope = if let Some(bo) = ob_pk_auth.business_owner() {
        let bo = BusinessOwner::lock(conn, &bo.id)?.into_inner();
        let scoped_business = ScopedVault::get(conn, (&bo.business_vault_id, &obc.tenant_id))?;
        if let Some(existing_uv_id) = bo.user_vault_id.as_ref() {
            // If uv on the BO, make sure it is the same UV that was located in identify flow
            if existing_uv_id != &uv.id {
                return Err(BusinessError::BoAlreadyHasVault.into());
            }
        } else {
            // If no uv_id on the BO, add it
            bo.add_user_vault_id(conn, &uv.id)?;
        }
        // TODO this scope will give the secondary BO perms to update the business vault
        Some(UserAuthScope::Business(scoped_business.id))
    } else {
        None
    };

    Ok((
        su.id.clone(),
        vec![
            Some(UserAuthScope::SignUp),
            Some(UserAuthScope::OrgOnboarding {
                id: su.id,
                ob_configuration_id: Some(obc.id.clone()),
            }),
            // Business owner scope, if any
            bo_scope,
        ],
    ))
}

fn validate_biometric_challenge(
    conn: &mut TxnPgConn,
    config: &Config,
    challenge_state: BiometricChallengeState,
    challenge_response: &str,
) -> ApiResult<(VaultId, VerifyKind, WebauthnCredentialId)> {
    // Decode and validate the response to the biometric challenge
    let webauthn = WebauthnConfig::new(config);
    let auth_resp = serde_json::from_str(challenge_response)?;

    let result = webauthn
        .webauthn()
        .authenticate_credential(&auth_resp, &challenge_state.state)?;

    let credential: WebauthnCredential =
        WebauthnCredential::get_by_credential_id(conn, &challenge_state.user_vault_id, &result.cred_id.0)?;

    // if the credential's backup state has changed:
    // update the backup state to learn that a credential is now portable across devices
    if result.backup_state && challenge_state.non_synced_cred_ids.contains(&result.cred_id) {
        credential.update_backup_state(conn)?;
    }

    Ok((
        challenge_state.user_vault_id,
        VerifyKind::UserInherited,
        credential.id,
    ))
}

/// Info extracted when an onboarding config auth is provided that allows creating a new vault
pub struct OnboardingInfo {
    obc: ObConfiguration,
    tenant_sh: Fingerprint,
}

pub struct VaultContext {
    pub h_code: Vec<u8>,
    pub authed_data: AuthedData,
    pub keypair: (VaultPublicKey, EncryptedVaultPrivateKey),
    pub global_sh: Fingerprint,
    pub sandbox_id: Option<SandboxId>,
    pub ob_info: Option<OnboardingInfo>,
}

async fn make_vault_context(
    state: &State,
    ob_pk_auth: Option<&ObConfigAuth>,
    authed_data: AuthedData,
    sandbox_id: Option<SandboxId>,
    h_code: Vec<u8>,
) -> ApiResult<VaultContext> {
    // TODO this keypair won't always be used... but helps to generate this proactively.
    let keypair = state.enclave_client.generate_sealed_keypair().await?;

    let di: DataIdentifier = (&authed_data).into();
    let data = authed_data.data();

    let global_sh = state
        .compute_fingerprint(GlobalFingerprintKind::try_from(di.clone())?, &data)
        .await?;
    let ob_info = if let Some(ob_pk_auth) = ob_pk_auth {
        // If we are in identify for a specific tenant, also look up by a tenant-scoped FP
        let tenant_sh = state
            .compute_fingerprint((&di, &ob_pk_auth.tenant().id), &data)
            .await?;
        let obc = ob_pk_auth.ob_config().clone();
        Some(OnboardingInfo { obc, tenant_sh })
    } else {
        None
    };

    Ok(VaultContext {
        h_code,
        authed_data,
        keypair,
        global_sh,
        sandbox_id,
        ob_info,
    })
}

fn validate(
    conn: &mut TxnPgConn,
    ctx: VaultContext,
    challenge_response: &str,
) -> Result<(VaultId, VerifyKind), ApiError> {
    if ctx.h_code != sha256(challenge_response.as_bytes()).to_vec() {
        return Err(ChallengeError::IncorrectPin.into());
    };

    let fps_to_search = vec![
        Some(ctx.global_sh.clone()),
        ctx.ob_info.as_ref().map(|i| i.tenant_sh.clone()),
    ]
    .into_iter()
    .flatten()
    .collect_vec();

    let existing_user = Vault::find_portable(conn, &fps_to_search, ctx.sandbox_id.clone())?;
    let result = match existing_user {
        Some(uv) => (uv.id, VerifyKind::UserInherited),
        None => {
            // The user does not exist. Create a new user vault.
            // Must have ob_info to create a new user vault
            let OnboardingInfo { obc, tenant_sh } = ctx.ob_info.ok_or(OnboardingError::MissingObPkAuth)?;
            let (uv, _) = VaultWrapper::create_user_vault(
                conn,
                ctx.keypair,
                obc,
                ctx.authed_data,
                ctx.global_sh,
                tenant_sh,
                ctx.sandbox_id,
            )?;
            (uv.into_inner().id, VerifyKind::UserCreated)
        }
    };
    Ok(result)
}
