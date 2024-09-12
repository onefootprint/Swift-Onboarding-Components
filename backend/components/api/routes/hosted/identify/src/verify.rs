use crate::ChallengeData;
use crate::ChallengeState;
use crate::State;
use api_core::auth::session::user::AssociatedAuthEvent;
use api_core::auth::session::user::NewUserSessionContext;
use api_core::auth::user::allowed_user_scopes;
use api_core::auth::user::UserAuthContext;
use api_core::auth::Any;
use api_core::errors::business::BusinessError;
use api_core::errors::challenge::ChallengeError;
use api_core::errors::ValidationError;
use api_core::telemetry::RootSpan;
use api_core::types::ApiResponse;
use api_core::utils::challenge::Challenge;
use api_core::utils::headers::InsightHeaders;
use api_core::utils::passkey::WebauthnConfig;
use api_core::utils::vault_wrapper::Person;
use api_core::utils::vault_wrapper::PrefillKind;
use api_core::utils::vault_wrapper::VaultWrapper;
use api_core::utils::vault_wrapper::WriteableVw;
use api_core::FpResult;
use api_wire_types::IdentifyVerifyRequest;
use api_wire_types::IdentifyVerifyResponse;
use chrono::Utc;
use db::models::auth_event::AuthEvent;
use db::models::auth_event::NewAuthEventArgs;
use db::models::business_owner::BusinessOwner;
use db::models::insight_event::CreateInsightEvent;
use db::models::scoped_vault::ScopedVault;
use db::models::vault::Vault;
use db::models::webauthn_credential::WebauthnCredential;
use db::TxnPgConn;
use newtypes::ActionKind;
use newtypes::AuthEventKind;
use newtypes::BoId;
use newtypes::DataIdentifier;
use newtypes::IdentifyScope;
use newtypes::IdentityDataKind as IDK;
use newtypes::ObConfigurationKind;
use paperclip::actix::api_v2_operation;
use paperclip::actix::web;
use paperclip::actix::web::Json;
use paperclip::actix::{
    self,
};
use webauthn_rs_core::proto::AuthenticationResult as WebauthnAuthenticationResult;

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
) -> ApiResponse<IdentifyVerifyResponse> {
    let user_auth = user_auth.check_guard(Any)?;
    // Note: Challenge::unseal checks for challenge token expiry as well
    let IdentifyVerifyRequest {
        challenge_token,
        challenge_response: c_response,
        scope,
    } = request.into_inner();
    let challenge_state =
        Challenge::<ChallengeState>::unseal(&state.challenge_sealing_key, &challenge_token)?.data;

    let event_kind = AuthEventKind::from(&challenge_state.data);

    // Validate the playbook is consistent with the requested IdentifyScope
    let obc = user_auth.ob_config();
    match scope {
        IdentifyScope::Auth if obc.is_some_and(|obc| obc.kind != ObConfigurationKind::Auth) => {
            // Playbook can be None in update_auth_methods flow
            return Err(ChallengeError::InvalidPlaybook(scope).into());
        }
        IdentifyScope::Onboarding if obc.is_some_and(|obc| obc.kind == ObConfigurationKind::Auth) => {
            // Playbook can be None for user-specific sessions with playbook specified in SDK
            return Err(ChallengeError::InvalidPlaybook(scope).into());
        }
        IdentifyScope::My1fp if obc.is_some() => {
            return Err(ChallengeError::InvalidPlaybook(scope).into());
        }
        _ => (),
    }

    // Verify the challenge response
    let verified_credential = match challenge_state.data {
        ChallengeData::Sms(s) => {
            s.verify_response(&c_response)?;
            VerifiedCredential::ContactInfo(IDK::PhoneNumber.into())
        }
        ChallengeData::Email(s) => {
            s.verify_response(&c_response)?;
            VerifiedCredential::ContactInfo(IDK::Email.into())
        }
        ChallengeData::Passkey(context) => {
            let webauthn = WebauthnConfig::new(&state.config);
            let auth_resp = serde_json::from_str(&c_response)?;

            let result = webauthn
                .webauthn()
                .authenticate_credential(&auth_resp, &context.state)?;
            VerifiedCredential::Passkey(result)
        }
    };

    // Create the ScopedVault if we're onboarding an existing user onto a new tenant
    let (su, user_auth, portable_vw) = state
        .db_pool
        .db_transaction(move |conn| -> FpResult<_> {
            let uv_id = &user_auth.user_vault_id;
            let (su, is_new_su) = if let Some(sv_id) = user_auth.scoped_user_id() {
                let su = ScopedVault::get(conn, &sv_id)?;
                (Some(su), false)
            } else if let Some(obc) = user_auth.ob_config() {
                // Create a ScopedVault for this tenant if we are onboarding onto a new tenant.
                let uv = Vault::lock(conn, uv_id)?;
                let (su, is_new_su) = ScopedVault::get_or_create_for_playbook(conn, &uv, obc.id.clone())?;
                (Some(su), is_new_su)
            } else {
                // We're allowed to not have a ScopedVault only for my1fp
                (None, false)
            };

            let portable_vw = is_new_su
                .then(|| VaultWrapper::<Any>::build_portable(conn, uv_id))
                .transpose()?;
            Ok((su, user_auth, portable_vw))
        })
        .await?;

    // Record some properties on the root span
    root_span.record("vault_id", user_auth.user_vault_id.to_string());
    if let Some(su) = su.as_ref() {
        root_span.record("fp_id", su.fp_id.to_string());
        root_span.record("tenant_id", su.tenant_id.to_string());
        root_span.record("is_live", su.is_live);
    }

    // For new scoped vaults, we may need to prefill some existing info into the new vault
    let obc = user_auth.ob_config();
    let prefill_data = if let Some(((su, obc), portable_vw)) = su.clone().zip(obc).zip(portable_vw) {
        // If we just created this scoped vault, prefill login methods if any are portable
        let prefill_data = portable_vw
            .get_data_to_prefill(&state, &su, obc, PrefillKind::Identify)
            .await?;
        Some((su, prefill_data))
    } else {
        None
    };

    let session_key = state.session_sealing_key.clone();
    let auth_token = state
        .db_pool
        .db_transaction(move |conn| -> FpResult<_> {
            let uv_id = &user_auth.user_vault_id;
            // If we made a new scoped vault here, prefill its data
            if let Some((su, prefill_data)) = prefill_data {
                // TODO in a future PR, will need to prefill passkey when it is tenant-specific
                let tenant_vw: WriteableVw<Any> = VaultWrapper::lock_for_onboarding(conn, &su.id)?;
                tenant_vw.prefill_portable_data(conn, prefill_data, None)?;
            }

            // Apply auth-method-specific updates
            let (passkey_cred_id, added_auth_method) = match verified_credential {
                VerifiedCredential::ContactInfo(di) => {
                    let added_auth_methods = if let Some(su) = su.as_ref() {
                        // For bifrost logins that already have a SV (created in the signup challenge or via
                        // API) we can mark the contact info as OTP verified
                        let vw = VaultWrapper::<Person>::lock_for_onboarding(conn, &su.id)?;
                        vw.on_otp_verified(conn, di)?
                    } else {
                        false
                    };
                    (None, added_auth_methods)
                }
                VerifiedCredential::Passkey(result) => {
                    let cred_id = &result.cred_id().0;
                    // Since the challenge generated for the client allows using one of multiple webauthn
                    // credentials, find the exact WebauthnCredential id that was utilized
                    let credential =
                        WebauthnCredential::get_by_credential_id(conn, &user_auth.user_vault_id, cred_id)?;
                    if result.backup_state() {
                        credential.update_backup_state(conn)?;
                    }
                    (Some(credential.id), false)
                }
            };

            // Record the new auth event
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

            // Token-specific handling
            let su_id = match scope {
                IdentifyScope::Auth => {
                    let su = su.ok_or(ValidationError("No scoped vault available"))?;
                    if !user_auth.user.is_portable {
                        // If this is an auth playbook and the user was previously non-portable, we are
                        // currently portablizing an NYPID.
                        //
                        // This is a little bit different from our portablizing logic for onboarding
                        // playbooks: Normally, we only portablize after successful
                        // KYC. This is an arbitrary choice we made to increase the
                        // probability of the prefill data being accurate when the user
                        // later onboards.
                        // In some cases, when portablizing an NYPID backfilled into Footprint, the NYPID has
                        // already been onboarded onto our tenant, so there is also a good chance the prefill
                        // data is accurate.
                        let vw = VaultWrapper::<Person>::lock_for_onboarding(conn, &su.id)?;
                        vw.portablize_identity_data(conn)?;
                    }

                    Some(su.id)
                }
                IdentifyScope::Onboarding => {
                    let su = su.ok_or(ValidationError("No scoped vault available"))?;
                    if let Some(bo_id) = user_auth.bo_id.as_ref() {
                        register_business_owner(conn, &su, bo_id)?;
                    }
                    Some(su.id)
                }
                IdentifyScope::My1fp => None,
            };

            // Create a new token derived from the provided one, adding new scopes and context
            let scopes = allowed_user_scopes(vec![event.kind], scope.into(), true);
            let ae = AssociatedAuthEvent::explicit(event.id);
            let context = NewUserSessionContext {
                su_id,
                ..Default::default()
            };
            let session = user_auth.update(context, scopes, scope.into(), Some(ae))?;
            let (token, _) =
                user_auth.create_derived(conn, &session_key, session, Some(scope.token_ttl()))?;

            Ok(token)
        })
        .await?;

    Ok(IdentifyVerifyResponse { auth_token })
}

/// After logging into a vault in the context of multi-KYC KYB, save the authed vault as a business
/// owner of the provided business.
fn register_business_owner(conn: &mut TxnPgConn, sv: &ScopedVault, bo_id: &BoId) -> FpResult<()> {
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

enum VerifiedCredential {
    ContactInfo(DataIdentifier),
    Passkey(WebauthnAuthenticationResult),
}
