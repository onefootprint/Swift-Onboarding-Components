use super::{BiometricChallengeState, PhoneEmailChallengeState};
use crate::State;
use crate::{ChallengeData, ChallengeState};
use api_core::auth::ob_config::ObConfigAuth;
use api_core::auth::session::user::{AuthFactor, UserSession, UserSessionArgs};
use api_core::auth::session::UpdateSession;
use api_core::auth::user::UserAuthContext;
use api_core::auth::user::UserAuthScope;
use api_core::auth::Any;
use api_core::config::Config;
use api_core::errors::business::BusinessError;
use api_core::errors::challenge::ChallengeError;
use api_core::errors::{ApiError, ApiResult};
use api_core::telemetry::RootSpan;
use api_core::types::response::ResponseData;
use api_core::types::JsonApiResponse;
use api_core::utils::challenge::{Challenge, ChallengeToken};
use api_core::utils::headers::InsightHeaders;
use api_core::utils::liveness::WebauthnConfig;
use api_core::utils::session::AuthSession;
use api_core::utils::vault_wrapper::Person;
use api_core::utils::vault_wrapper::VaultWrapper;
use chrono::{Duration, Utc};
use crypto::sha256;
use db::errors::OptionalExtension;
use db::models::auth_event::NewAuthEvent;
use db::models::business_owner::BusinessOwner;
use db::models::insight_event::CreateInsightEvent;
use db::models::scoped_vault::ScopedVault;
use db::models::vault::Vault;
use db::models::webauthn_credential::WebauthnCredential;
use db::TxnPgConn;
use newtypes::{
    AuthEventKind, DataIdentifier, IdentityDataKind as IDK, ScopedVaultId, SessionAuthToken, VaultId,
    WebauthnCredentialId,
};
use paperclip::actix::{self, api_v2_operation, web, web::Json, Apiv2Schema};

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
pub struct VerifyRequest {
    /// Opaque challenge state token
    challenge_token: ChallengeToken,
    challenge_response: String,
}

#[derive(Debug, Clone, Apiv2Schema, serde::Serialize)]
pub struct VerifyResponse {
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
    root_span: RootSpan,
) -> JsonApiResponse<VerifyResponse> {
    // Note: Challenge::unseal checks for challenge token expiry as well
    let VerifyRequest {
        challenge_token,
        challenge_response: c_response,
    } = request.into_inner();
    let challenge_state =
        Challenge::<ChallengeState>::unseal(&state.challenge_sealing_key, &challenge_token)?.data;

    let config = state.config.clone();
    let session_key = state.session_sealing_key.clone();
    let auth_token = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let (uv_id, auth_factor, event_kind, passkey_cred_id) = match challenge_state.data {
                ChallengeData::Sms(s) => {
                    let tok = validate(conn, s, ob_pk_auth.as_ref(), &c_response, IDK::PhoneNumber.into())?;
                    (tok, AuthFactor::Sms, AuthEventKind::Sms, None)
                }
                ChallengeData::Email(s) => {
                    let tok = validate(conn, s, ob_pk_auth.as_ref(), &c_response, IDK::Email.into())?;
                    (tok, AuthFactor::Email, AuthEventKind::Email, None)
                }
                ChallengeData::Passkey(context) => {
                    let (tok, cred) = validate_biometric_challenge(conn, &config, context, &c_response)?;
                    (
                        tok,
                        AuthFactor::Passkey(cred.clone()),
                        AuthEventKind::Passkey,
                        Some(cred),
                    )
                }
            };

            // Record some properties on the root span
            root_span.record("vault_id", uv_id.to_string());

            // If you authed with passkey, you also get SensitiveProfile
            let sensitive_scope =
                matches!(auth_factor, AuthFactor::Passkey(_)).then_some(UserAuthScope::SensitiveProfile);

            // Determine whether to issue onboardig scopes or my1fp scopes
            let (args, scopes, duration, scoped_vault_id) = if let Some(ob_pk_auth) = ob_pk_auth {
                let obc_id = ob_pk_auth.ob_config().id.clone();
                let (su, sb_id) = onboarding_identifiers(conn, ob_pk_auth, &uv_id)?;
                let duration = Duration::hours(1); // Onboarding is shorter
                let args = UserSessionArgs {
                    su_id: Some(su.id.clone()),
                    sb_id,
                    obc_id: Some(obc_id),
                    // wf_id will be added later in POST /hosted/onboarding
                    wf_id: None,
                };
                root_span.record("fp_id", su.fp_id.to_string());
                root_span.record("tenant_id", su.tenant_id.to_string());
                root_span.record("is_live", su.is_live);
                (args, vec![Some(UserAuthScope::SignUp)], duration, Some(su.id))
            } else {
                let scopes = vec![Some(UserAuthScope::BasicProfile)];
                // TODO we currently infer that a token is for my1fp just because ob config auth
                // isn't provided - but with step up, there are also some auths here that have no
                // ob config auth but are also not my1fp
                let duration = Duration::hours(8); // Issue my1fp token for a long time
                let args = UserSessionArgs::default();
                (args, scopes, duration, None)
            };
            let scopes = scopes.into_iter().chain([sensitive_scope]).flatten().collect();

            let auth_token = if let Some(user_auth) = user_auth {
                // Add the scopes / args to the existing auth token
                let user_auth = user_auth.check_guard(Any)?;
                let token = user_auth.auth_token.clone();
                let data = user_auth.data.clone().update(args, scopes, Some(auth_factor))?;
                user_auth.update_session(conn, &session_key, data)?;
                token
            } else {
                // Otherwise, create a new token with these scopes / args
                let data = UserSession::make(uv_id.clone(), args, scopes, vec![auth_factor])?;
                let (token, _) = AuthSession::create_sync(conn, &session_key, data, duration)?;
                token
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

            Ok(auth_token)
        })
        .await?;

    ResponseData::ok(VerifyResponse { auth_token }).json()
}

/// Determines the identifiers to add to the auth token to allow a user to complete onboarding
fn onboarding_identifiers(
    conn: &mut TxnPgConn,
    ob_pk_auth: ObConfigAuth,
    uv_id: &VaultId,
) -> ApiResult<(ScopedVault, Option<ScopedVaultId>)> {
    let obc = ob_pk_auth.ob_config();
    // Since only some codepaths above will create a SU, we need to always get_or_create a SU if
    // created with an ob config. This will create a SU when we are one-clicking onto this tenant
    let uv = Vault::lock(conn, uv_id)?;
    let su = ScopedVault::get_or_create(conn, &uv, obc.id.clone())?;

    // If we verified with a BoSessionAuth, update the corresponding BO
    let sb_id = if let Some(bo) = ob_pk_auth.business_owner() {
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
        // TODO this will give the secondary BO perms to update the business vault
        Some(scoped_business.id)
    } else {
        None
    };

    Ok((su, sb_id))
}

fn validate_biometric_challenge(
    conn: &mut TxnPgConn,
    config: &Config,
    challenge_state: BiometricChallengeState,
    challenge_response: &str,
) -> ApiResult<(VaultId, WebauthnCredentialId)> {
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

    Ok((challenge_state.user_vault_id, credential.id))
}

fn validate(
    conn: &mut TxnPgConn,
    challenge_state: PhoneEmailChallengeState,
    ob_pk_auth: Option<&ObConfigAuth>,
    challenge_response: &str,
    di: DataIdentifier,
) -> Result<VaultId, ApiError> {
    let PhoneEmailChallengeState { h_code, vault_id } = challenge_state;
    if h_code != sha256(challenge_response.as_bytes()).to_vec() {
        return Err(ChallengeError::IncorrectPin.into());
    };

    // We're on the new codepath where the vault was pre-created in the signup challenge.
    if let Some(obc) = ob_pk_auth {
        let tenant_id = &obc.tenant().id;
        let sv = ScopedVault::get(conn, (&vault_id, tenant_id)).optional()?;
        if let Some(sv) = sv {
            // For bifrost logins that already have a SV (likely created in the signup challenge),
            // we can mark the contact info as OTP verified
            let vw = VaultWrapper::<Person>::lock_for_onboarding(conn, &sv.id)?;
            vw.on_otp_verified(conn, di)?;
        }
    }

    Ok(vault_id)
}
