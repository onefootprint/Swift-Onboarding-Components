use super::{BiometricChallengeState, PhoneEmailChallengeState};
use crate::{ChallengeData, ChallengeState, State};
use api_core::{
    auth::{
        session::user::{AssociatedAuthEvent, NewUserSessionContext},
        user::{allowed_user_scopes, CheckedUserAuthContext, UserAuthContext},
        Any,
    },
    config::Config,
    errors::{
        business::BusinessError, challenge::ChallengeError, error_with_code::ErrorWithCode, user::UserError,
        ApiResult, ValidationError,
    },
    telemetry::RootSpan,
    types::{response::ResponseData, JsonApiResponse},
    utils::{
        challenge::Challenge,
        headers::InsightHeaders,
        passkey::WebauthnConfig,
        vault_wrapper::{Person, PrefillKind, VaultWrapper, WriteableVw},
    },
};
use api_wire_types::{IdentifyVerifyRequest, IdentifyVerifyResponse};
use chrono::Utc;
use crypto::sha256;
use db::{
    errors::OptionalExtension,
    models::{
        auth_event::{AuthEvent, NewAuthEventArgs},
        business_owner::BusinessOwner,
        insight_event::CreateInsightEvent,
        scoped_vault::ScopedVault,
        vault::Vault,
        webauthn_credential::WebauthnCredential,
    },
    TxnPgConn,
};
use newtypes::{
    ActionKind, AuthEventKind, BoId, DataIdentifier, IdentifyScope, IdentityDataKind as IDK,
    ObConfigurationKind, VaultId, WebauthnCredentialId,
};
use paperclip::actix::{self, api_v2_operation, web, web::Json};

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
    request: Json<IdentifyVerifyRequest>,
    // When provided, augments the existing user_auth token with the scopes gained from the challenge
    user_auth: UserAuthContext,
    insight_headers: InsightHeaders,
    root_span: RootSpan,
) -> JsonApiResponse<IdentifyVerifyResponse> {
    // Note: Challenge::unseal checks for challenge token expiry as well
    let IdentifyVerifyRequest {
        challenge_token,
        challenge_response: c_response,
        scope,
    } = request.into_inner();
    let challenge_state =
        Challenge::<ChallengeState>::unseal(&state.challenge_sealing_key, &challenge_token)?.data;

    let user_auth = user_auth.check_guard(Any)?;

    let config = state.config.clone();
    let session_key = state.session_sealing_key.clone();
    let (auth_token, portable_vw, su, obc) = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let (uv_id, event_kind, passkey_cred_id, added_auth_method) = match challenge_state.data {
                ChallengeData::Sms(s) => {
                    let (vault_id, added_auth_method) =
                        validate(conn, s, &user_auth, &c_response, IDK::PhoneNumber.into())?;
                    (vault_id, AuthEventKind::Sms, None, added_auth_method)
                }
                ChallengeData::Email(s) => {
                    let (vault_id, added_auth_method) =
                        validate(conn, s, &user_auth, &c_response, IDK::Email.into())?;
                    (vault_id, AuthEventKind::Email, None, added_auth_method)
                }
                ChallengeData::Passkey(context) => {
                    let (vault_id, cred) = validate_biometric_challenge(conn, &config, context, &c_response)?;
                    (vault_id, AuthEventKind::Passkey, Some(cred), false)
                }
            };

            // Determine which scopes to issue on the auth token
            let (context, su, new_su) = match scope {
                IdentifyScope::Auth => {
                    let (su, new_su) = if let Some(obc) = user_auth.ob_config() {
                        if obc.kind != ObConfigurationKind::Auth {
                            return Err(ChallengeError::IncorrectPlaybookKind(obc.kind, scope).into());
                        }
                        let uv = Vault::lock(conn, &uv_id)?;
                        ScopedVault::get_or_create_for_playbook(conn, &uv, obc.id.clone())?
                    } else {
                        let Some(su_from_token) = user_auth.scoped_user() else {
                            // A playbook MUST be provided if we're not stepping up
                            return Err(UserError::PlaybookMissingForAuth.into());
                        };
                        (su_from_token.clone(), false)
                    };

                    let context = NewUserSessionContext {
                        su_id: Some(su.id.clone()),
                        ..Default::default()
                    };
                    (context, Some(su), new_su)
                }
                IdentifyScope::Onboarding => {
                    let obc = user_auth.ob_config();
                    let su_id = user_auth.scoped_user_id();
                    let (su, new_su) = if let Some(su_id) = su_id {
                        // We are stepping up an existing token already attached to a SU
                        (ScopedVault::get(conn, &su_id)?, false)
                    } else if let Some(obc) = obc.as_ref() {
                        // We are adding the SU to a token that doesn't have it
                        if obc.kind == ObConfigurationKind::Auth {
                            return Err(ChallengeError::IncorrectPlaybookKind(obc.kind, scope).into());
                        }
                        // Since only some codepaths above will create a SU, we need to always get_or_create a SU if
                        // created with an ob config. This will create a SU when we are one-clicking onto this tenant
                        let uv = Vault::lock(conn, &uv_id)?;
                        ScopedVault::get_or_create_for_playbook(conn, &uv, obc.id.clone())?
                    } else {
                        return Err(ValidationError("No scoped vault available").into());
                    };
                    if let Some(bo_id) = user_auth.bo_id.as_ref() {
                        register_business_owner(conn, &su, bo_id)?;
                    }
                    let context = NewUserSessionContext {
                        su_id: Some(su.id.clone()),
                        // wf_id will be added later in POST /hosted/onboarding
                        ..Default::default()
                    };
                    (context, Some(su), new_su)
                }
                IdentifyScope::My1fp => {
                    let context = NewUserSessionContext::default();
                    (context, None, false)
                }
            };

            // Record some properties on the root span
            root_span.record("vault_id", uv_id.to_string());
            if let Some(su) = su.as_ref() {
                root_span.record("fp_id", su.fp_id.to_string());
                root_span.record("tenant_id", su.tenant_id.to_string());
                root_span.record("is_live", su.is_live);
            }

            let obc = user_auth.ob_config().cloned();

            // record the new auth event
            let insight = CreateInsightEvent::from(insight_headers).insert_with_conn(conn)?;
            let ae_args = NewAuthEventArgs {
                vault_id: uv_id.clone(),
                scoped_vault_id: su.as_ref().map(|su| su.id.clone()),
                insight_event_id: Some(insight.id),
                kind: event_kind,
                webauthn_credential_id: passkey_cred_id,
                created_at: Utc::now(),
                scope,
                new_auth_method_action: added_auth_method.then_some(ActionKind::AddPrimary),
            };
            let event = AuthEvent::save(ae_args, conn)?;

            let scopes = allowed_user_scopes(vec![event.kind], scope.into(), true);
            let ae = AssociatedAuthEvent::explicit(event.id);
            // Create a new token derived from the provided one, adding new scopes and context
            let session = user_auth.update(context, scopes, scope.into(), Some(ae))?;
            let (token, _) =
                user_auth.create_derived(conn, &session_key, session, Some(scope.token_ttl()))?;
            let portable_vw = if new_su {
                Some(VaultWrapper::<Any>::build_portable(conn, &uv_id)?)
            } else {
                None
            };

            Ok((token, portable_vw, su, obc))
        })
        .await?;

    if let Some(((su, obc), portable_vw)) = su.zip(obc).zip(portable_vw) {
        // If we just created this scoped vault, prefill login methods if any are portable
        let prefill_data = portable_vw
            .get_data_to_prefill(&state, &su, &obc, PrefillKind::Identify)
            .await?;
        state
            .db_pool
            .db_transaction(move |conn| -> ApiResult<_> {
                let tenant_vw: WriteableVw<Any> = VaultWrapper::lock_for_onboarding(conn, &su.id)?;
                tenant_vw.prefill_portable_data(conn, prefill_data, None)?;
                Ok(())
            })
            .await?;
    }

    ResponseData::ok(IdentifyVerifyResponse { auth_token }).json()
}

/// After logging into a vault in the context of multi-KYC KYB, save the authed vault as a business
/// owner of the provided business.
fn register_business_owner(conn: &mut TxnPgConn, sv: &ScopedVault, bo_id: &BoId) -> ApiResult<()> {
    // If we verified with a BoSessionAuth, update the corresponding BO
    let bo = BusinessOwner::lock(conn, bo_id)?.into_inner();
    if let Some(existing_uv_id) = bo.user_vault_id.as_ref() {
        // If uv on the BO, make sure it is the same UV that was located in identify flow
        if existing_uv_id != &sv.vault_id {
            return Err(BusinessError::BoAlreadyHasVault.into());
        }
    } else {
        // If no uv_id on the BO, add it
        bo.add_user_vault_id(conn, &sv.vault_id)?;
    }
    Ok(())
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
        WebauthnCredential::get_by_credential_id(conn, &challenge_state.user_vault_id, &result.cred_id().0)?;

    // if the credential's backup state has changed:
    // update the backup state to learn that a credential is now portable across devices
    if result.backup_state() && challenge_state.non_synced_cred_ids.contains(result.cred_id()) {
        credential.update_backup_state(conn)?;
    }

    Ok((challenge_state.user_vault_id, credential.id))
}

/// Identify verify can be used for both log in and sign up.
pub type AddedAuthMethod = bool;

fn validate(
    conn: &mut TxnPgConn,
    challenge_state: PhoneEmailChallengeState,
    user_auth: &CheckedUserAuthContext,
    challenge_response: &str,
    di: DataIdentifier,
) -> ApiResult<(VaultId, AddedAuthMethod)> {
    let PhoneEmailChallengeState { h_code, vault_id } = challenge_state;
    if h_code != sha256(challenge_response.as_bytes()).to_vec() {
        return Err(ErrorWithCode::IncorrectPin.into());
    };

    let existing_sv = if let Some(existing_su_id) = user_auth.scoped_user_id() {
        Some(ScopedVault::get(conn, &existing_su_id)?)
    } else if let Some(obc) = user_auth.ob_config() {
        ScopedVault::get(conn, (&vault_id, &obc.tenant_id)).optional()?
    } else {
        None
    };

    let added_auth_method = if let Some(existing_sv) = existing_sv {
        // For bifrost logins that already have a SV (created in the signup challenge or via API)
        // we can mark the contact info as OTP verified
        let vw = VaultWrapper::<Person>::lock_for_onboarding(conn, &existing_sv.id)?;
        let added_auth_method = vw.on_otp_verified(conn, di)?;

        let obc = user_auth.ob_config();
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
        added_auth_method
    } else {
        false
    };

    Ok((vault_id, added_auth_method))
}
