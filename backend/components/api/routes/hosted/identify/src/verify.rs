use super::{BiometricChallengeState, PhoneEmailChallengeState};
use crate::State;
use crate::{ChallengeData, ChallengeState};
use api_core::auth::ob_config::ObConfigAuth;
use api_core::auth::session::user::{AssociatedAuthEvent, UserSession, UserSessionArgs};
use api_core::auth::user::allowed_user_scopes;
use api_core::auth::user::{CheckedUserAuthContext, UserAuthContext};
use api_core::auth::Any;
use api_core::config::Config;
use api_core::errors::business::BusinessError;
use api_core::errors::challenge::ChallengeError;
use api_core::errors::user::UserError;
use api_core::errors::{ApiError, ApiResult, ValidationError};
use api_core::telemetry::RootSpan;
use api_core::types::response::ResponseData;
use api_core::types::JsonApiResponse;
use api_core::utils::challenge::{Challenge, ChallengeToken};
use api_core::utils::headers::InsightHeaders;
use api_core::utils::passkey::WebauthnConfig;
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
    AuthEventKind, DataIdentifier, IdentifyScope, IdentityDataKind as IDK, ObConfigurationKind,
    ScopedVaultId, SessionAuthToken, VaultId, WebauthnCredentialId,
};
use paperclip::actix::{self, api_v2_operation, web, web::Json, Apiv2Schema};

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
pub struct VerifyRequest {
    /// Opaque challenge state token
    challenge_token: ChallengeToken,
    challenge_response: String,
    /// Determines which scopes the issued auth token will have. Request the correct scopes for
    /// your use case in order to get the least permissions required
    scope: IdentifyScope,
}

#[derive(Debug, Clone, Apiv2Schema, serde::Serialize)]
pub struct VerifyResponse {
    auth_token: SessionAuthToken,
}

#[api_v2_operation(
    tags(Identify, Hosted),
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
        scope,
    } = request.into_inner();
    let challenge_state =
        Challenge::<ChallengeState>::unseal(&state.challenge_sealing_key, &challenge_token)?.data;

    let user_auth = user_auth.map(|a| a.check_guard(Any)).transpose()?;

    let config = state.config.clone();
    let session_key = state.session_sealing_key.clone();
    let auth_token = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let obc_auth = ob_pk_auth.as_ref();
            let ua = user_auth.as_ref();
            let (uv_id, event_kind, passkey_cred_id) = match challenge_state.data {
                ChallengeData::Sms(s) => {
                    let vault_id = validate(conn, s, obc_auth, ua, &c_response, IDK::PhoneNumber.into())?;
                    (vault_id, AuthEventKind::Sms, None)
                }
                ChallengeData::Email(s) => {
                    let vault_id = validate(conn, s, obc_auth, ua, &c_response, IDK::Email.into())?;
                    (vault_id, AuthEventKind::Email, None)
                }
                ChallengeData::Passkey(context) => {
                    let (vault_id, cred) = validate_biometric_challenge(conn, &config, context, &c_response)?;
                    (vault_id, AuthEventKind::Passkey, Some(cred))
                }
            };

            // Determine which scopes to issue on the auth token
            let (args, duration, su) = match scope {
                IdentifyScope::Auth => {
                    let obc = ob_pk_auth
                        .as_ref()
                        .map(|a| a.ob_config())
                        .ok_or(UserError::PlaybookMissingForAuth)?;
                    if obc.kind != ObConfigurationKind::Auth {
                        return Err(ChallengeError::IncorrectPlaybookKind(obc.kind, scope).into());
                    }
                    let uv = Vault::lock(conn, &uv_id)?;
                    let su = ScopedVault::get_or_create(conn, &uv, obc.id.clone())?;

                    let duration = Duration::hours(1);
                    let args = UserSessionArgs {
                        su_id: Some(su.id.clone()),
                        obc_id: Some(obc.id.clone()),
                        ..Default::default()
                    };
                    (args, duration, Some(su))
                }
                IdentifyScope::Onboarding => {
                    let bo = ob_pk_auth.as_ref().and_then(|a| a.business_owner());
                    let user_auth_obc = user_auth.as_ref().and_then(|a| a.ob_config());
                    let ob_pk_obc = ob_pk_auth.as_ref().map(|a| a.ob_config());
                    let obc = user_auth_obc.or(ob_pk_obc);
                    let su_id = user_auth.as_ref().and_then(|ua| ua.scoped_user_id());
                    let su = if let Some(su_id) = su_id {
                        // We are stepping up an existing token already attached to a SU
                        ScopedVault::get(conn, &su_id)?
                    } else if let Some(obc) = obc {
                        // We are making a new auth token or adding the SU to a token that doesn't have it
                        if obc.kind == ObConfigurationKind::Auth {
                            return Err(ChallengeError::IncorrectPlaybookKind(obc.kind, scope).into());
                        }
                        // Since only some codepaths above will create a SU, we need to always get_or_create a SU if
                        // created with an ob config. This will create a SU when we are one-clicking onto this tenant
                        let uv = Vault::lock(conn, &uv_id)?;
                        ScopedVault::get_or_create(conn, &uv, obc.id.clone())?
                    } else {
                        return Err(ValidationError(
                            "Must provide either a playbook key or an existing auth token",
                        )
                        .into());
                    };
                    // TODO we should migrate the BO tokens to use these new un-authed, identified tokens
                    let sb_id = bo.map(|bo| get_scoped_business_id(conn, &su, bo)).transpose()?;
                    let duration = Duration::hours(1); // Onboarding is shorter
                    let args = UserSessionArgs {
                        su_id: Some(su.id.clone()),
                        sb_id,
                        obc_id: obc.map(|obc| obc.id.clone()),
                        // wf_id will be added later in POST /hosted/onboarding
                        ..Default::default()
                    };
                    (args, duration, Some(su))
                }
                IdentifyScope::My1fp => {
                    let duration = Duration::hours(8); // Issue my1fp token for a long time
                    let args = UserSessionArgs::default();
                    (args, duration, None)
                }
            };

            // Record some properties on the root span
            root_span.record("vault_id", uv_id.to_string());
            if let Some(su) = su.as_ref() {
                root_span.record("fp_id", su.fp_id.to_string());
                root_span.record("tenant_id", su.tenant_id.to_string());
                root_span.record("is_live", su.is_live);
            }

            // record the new auth event
            let insight = CreateInsightEvent::from(insight_headers).insert_with_conn(conn)?;
            let event = NewAuthEvent {
                vault_id: uv_id.clone(),
                scoped_vault_id: su.map(|su| su.id),
                insight_event_id: Some(insight.id),
                kind: event_kind,
                webauthn_credential_id: passkey_cred_id,
                created_at: Utc::now(),
                scope,
            }
            .create(conn.conn())?;

            let scopes = allowed_user_scopes(vec![event.kind], scope, false);

            let ae = AssociatedAuthEvent::explicit(event.id.clone());
            let data = if let Some(user_auth) = user_auth {
                // Add the new scopes and args to the existing scopes and args on the auth token
                user_auth.data.clone().update(args, scopes, Some(ae))?
            } else {
                // Otherwise, create a new token with these scopes / args
                UserSession::make(uv_id.clone(), args, scopes, vec![event.id], vec![ae])?
            };
            let (token, _) = AuthSession::create_sync(conn, &session_key, data, duration)?;

            Ok(token)
        })
        .await?;

    ResponseData::ok(VerifyResponse { auth_token }).json()
}

fn get_scoped_business_id(
    conn: &mut TxnPgConn,
    sv: &ScopedVault,
    bo: &BusinessOwner,
) -> ApiResult<ScopedVaultId> {
    // If we verified with a BoSessionAuth, update the corresponding BO
    let bo = BusinessOwner::lock(conn, &bo.id)?.into_inner();
    let scoped_business = ScopedVault::get(conn, (&bo.business_vault_id, &sv.tenant_id))?;
    if let Some(existing_uv_id) = bo.user_vault_id.as_ref() {
        // If uv on the BO, make sure it is the same UV that was located in identify flow
        if existing_uv_id != &sv.vault_id {
            return Err(BusinessError::BoAlreadyHasVault.into());
        }
    } else {
        // If no uv_id on the BO, add it
        bo.add_user_vault_id(conn, &sv.vault_id)?;
    }
    // TODO this will give the secondary BO perms to update the business vault
    Ok(scoped_business.id)
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
    user_auth: Option<&CheckedUserAuthContext>,
    challenge_response: &str,
    di: DataIdentifier,
) -> Result<VaultId, ApiError> {
    let PhoneEmailChallengeState { h_code, vault_id } = challenge_state;
    if h_code != sha256(challenge_response.as_bytes()).to_vec() {
        return Err(ChallengeError::IncorrectPin.into());
    };

    let existing_sv = if let Some(existing_su_id) = user_auth.and_then(|ua| ua.scoped_user_id()) {
        Some(ScopedVault::get(conn, &existing_su_id)?)
    } else if let Some(ob_pk_auth) = ob_pk_auth {
        ScopedVault::get(conn, (&vault_id, &ob_pk_auth.tenant().id)).optional()?
    } else {
        None
    };
    if let Some(existing_sv) = existing_sv {
        // For bifrost logins that already have a SV (created in the signup challenge or via API)
        // we can mark the contact info as OTP verified
        let vw = VaultWrapper::<Person>::lock_for_onboarding(conn, &existing_sv.id)?;
        vw.on_otp_verified(conn, di)?;

        let obc = user_auth
            .and_then(|ua| ua.ob_config())
            .or(ob_pk_auth.map(|ob| ob.ob_config()));
        if obc.is_some_and(|obc| obc.kind == ObConfigurationKind::Auth) && !vw.vault.is_portable {
            // If this is an auth playbook and the user was previously non-portable, we are
            // currently portablizing an NYPID.
            //
            // This is a little bit different from our portablizing logic for onboarding playbooks:
            // Normally, we only portablize after successful KYC. This is an arbitrary choice
            // we made to increase the probability of the prefill data being accurate when the user
            // later onboards.
            // In some cases, when portablizing an NYPID backfilled into Footprint, the NYPID has
            // already been onboarded onto our tenant, so there is also a good chance the prefill
            // data is accurate.
            vw.portablize_identity_data(conn)?;
        }
    }

    Ok(vault_id)
}
