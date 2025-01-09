use crate::ChallengeData;
use crate::ChallengeState;
use crate::State;
use api_core::auth::session::user::AssociatedAuthEvent;
use api_core::auth::session::user::AssociatedAuthEventKind;
use api_core::auth::session::user::UserSessionBuilder;
use api_core::auth::user::allowed_user_scopes;
use api_core::auth::user::CheckedUserAuthContext;
use api_core::auth::user::UserAuthContext;
use api_core::auth::Any;
use api_core::errors::business::BusinessError;
use api_core::errors::challenge::ChallengeError;
use api_core::telemetry::RootSpan;
use api_core::types::ApiResponse;
use api_core::utils::challenge::Challenge;
use api_core::utils::headers::InsightHeaders;
use api_core::utils::passkey::WebauthnConfig;
use api_core::utils::vault_wrapper::FingerprintedDataRequest;
use api_core::utils::vault_wrapper::Person;
use api_core::utils::vault_wrapper::PrefillData;
use api_core::utils::vault_wrapper::PrefillKind;
use api_core::utils::vault_wrapper::VaultWrapper;
use api_core::utils::vault_wrapper::WriteableVw;
use api_core::FpResult;
use api_errors::BadRequest;
use api_errors::FpDbOptionalExtension;
use api_errors::ServerErr;
use api_errors::ServerErrInto;
use api_wire_types::IdentifyVerifyRequest;
use api_wire_types::IdentifyVerifyResponse;
use chrono::Utc;
use db::models::auth_event::AuthEvent;
use db::models::auth_event::NewAuthEventArgs;
use db::models::business_owner::BusinessOwner;
use db::models::contact_info::ContactInfo;
use db::models::data_lifetime::DataLifetime;
use db::models::insight_event::CreateInsightEvent;
use db::models::passkey::Passkey;
use db::models::playbook::Playbook;
use db::models::scoped_vault::ScopedVault;
use db::models::vault::Vault;
use db::TxnPgConn;
use newtypes::ActionKind;
use newtypes::AuthEventId;
use newtypes::AuthEventKind;
use newtypes::BoId;
use newtypes::ContactInfoKind;
use newtypes::DataIdentifier as DI;
use newtypes::DataLifetimeId;
use newtypes::DataRequest;
use newtypes::IdentifyScope;
use newtypes::IdentityDataKind as IDK;
use newtypes::ObConfigurationKind;
use newtypes::PiiString;
use newtypes::ValidateArgs;
use paperclip::actix::api_v2_operation;
use paperclip::actix::web;
use paperclip::actix::web::Json;
use paperclip::actix::{
    self,
};
use std::collections::HashMap;
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

    // Validate the playbook is consistent with the requested IdentifyScope
    let obc = user_auth.obc.as_ref();
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
    let (verified_credential, ae_result) = match challenge_state.data {
        ChallengeData::Sms(s) => {
            s.verify_response(&c_response)?;
            use ContactInfoKind::Phone;
            let cred =
                on_contact_info_verify(&state, &user_auth, s.contact_info, s.lifetime_id, Phone).await?;
            (cred, AuthEventResult::Create(AuthEventKind::Sms))
        }
        ChallengeData::SmsLink(s) => {
            let ae_id = s.verify_response(&state).await?;
            use ContactInfoKind::Phone;
            let cred = on_contact_info_verify(&state, &user_auth, s.e164, s.lifetime_id, Phone).await?;
            (cred, AuthEventResult::Existing(ae_id))
        }
        ChallengeData::Email(s) => {
            s.verify_response(&c_response)?;
            use ContactInfoKind::Email;
            let cred =
                on_contact_info_verify(&state, &user_auth, s.contact_info, s.lifetime_id, Email).await?;
            (cred, AuthEventResult::Create(AuthEventKind::Email))
        }
        ChallengeData::Passkey(s) => {
            let webauthn = WebauthnConfig::new(&state.config);
            let c_resp = serde_json::from_str(&c_response)?;
            let result = webauthn.webauthn().authenticate_credential(&c_resp, &s.state)?;
            let cred = VerifiedCredential::Passkey(result);
            (cred, AuthEventResult::Create(AuthEventKind::Passkey))
        }
    };

    let prefill_data = get_prefill_data(&state, &user_auth).await?;

    let session_key = state.session_sealing_key.clone();
    let auth_token = state
        .db_transaction(move |conn| {
            let uv_id = &user_auth.user_vault_id;

            // Get or create the ScopedVault for non-my1fp flows
            let sv = if let Some(su_id) = user_auth.su_id.as_ref() {
                let sv = ScopedVault::lock(conn, su_id)?;
                Some(sv)
            } else if let Some(obc) = user_auth.obc.as_ref() {
                // Create a ScopedVault for this tenant if we are onboarding onto a new tenant.
                let uv = Vault::lock(conn, uv_id)?;
                let playbook = Playbook::get(conn, &obc.playbook_id)?;
                let (sv, is_new_sv) = ScopedVault::lock_or_create_for_tenant(conn, &uv, &playbook.tenant_id)?;
                root_span.record_su(&sv);
                if is_new_sv {
                    // If the scoped vault is brand new, prefill its data
                    let tenant_vw: WriteableVw<Any> = VaultWrapper::lock_for_onboarding(conn, &sv.id)?;
                    let prefill_data = prefill_data.ok_or(ServerErr("Missing prefill data for new SV"))?;
                    tenant_vw.prefill_portable_data(conn, prefill_data, None)?;
                    Passkey::prefill_to_new_sv(conn, &sv.vault_id, &sv.id)?;
                }
                Some(sv)
            } else {
                // We're allowed to not have a ScopedVault only for my1fp
                None
            };

            // Apply auth-method-specific updates
            let (passkey_cred_id, added_auth_method) = match verified_credential {
                VerifiedCredential::ContactInfo(verified_data, ci_dl_id, ci_kind) => {
                    let added_auth_methods = if let Some((su, data)) = sv.as_ref().zip(verified_data) {
                        // For bifrost logins that already have a SV (created in the signup challenge or via
                        // API) we can mark the contact info as OTP verified
                        let vw = VaultWrapper::<Person>::lock_for_onboarding(conn, &su.id)?;

                        // The contact info used for identifying the user may be from a different
                        // tenant if we're onboarding to a new tenant.
                        let ci = ContactInfo::get(conn, &ci_dl_id)?;
                        let onboarding_tenant_eq_identify_tenant = vw
                            .get(&ci_kind.di())
                            .is_some_and(|ci_dl| ci_dl.lifetime_id() == &ci_dl_id);

                        // Note, this arbitrarily doesn't allow portablizing data that was written
                        // by the tenant, even after it's been OTP-verified by the user. We need to
                        // better think through when to portablize login methods.
                        let is_first_time_verifying = !ci.is_otp_verified();
                        if is_first_time_verifying {
                            // Save the `id.verified_xxx` data.
                            let sv_txn = vw.save_ci_after_otp(conn, data)?;

                            if onboarding_tenant_eq_identify_tenant {
                                // Portablize and verify the existing piece of `id.xxx` contact info.
                                DataLifetime::portablize(conn, &sv_txn, &ci.lifetime_id)?;
                                ContactInfo::mark_otp_verified(conn, &ci.id)?;
                            }
                        }
                        is_first_time_verifying
                    } else {
                        false
                    };

                    (None, added_auth_methods)
                }
                VerifiedCredential::Passkey(result) => {
                    let cred_id = &result.cred_id().0;
                    if result.backup_state() {
                        Passkey::set_backup_state(conn, uv_id, cred_id)?;
                    }

                    // Since the challenge generated for the client allows using one of multiple webauthn
                    // credentials, find the exact Passkey id that was utilized
                    let identifier = if let Some(su_id) = sv.as_ref().map(|su| &su.id) {
                        su_id.into()
                    } else {
                        uv_id.into() // Only m1fp
                    };
                    let credential = Passkey::get_by_credential_id(conn, identifier, cred_id)?;
                    (Some(credential.id), false)
                }
            };

            let event = match ae_result {
                AuthEventResult::Create(kind) => {
                    // Record the new auth event
                    let insight = CreateInsightEvent::from(insight_headers).insert_with_conn(conn)?;
                    let sv_txn = sv
                        .as_ref()
                        .map(|sv| DataLifetime::new_sv_txn(conn, sv))
                        .transpose()?;

                    let ae_args = NewAuthEventArgs {
                        vault_id: uv_id.clone(),
                        sv_txn,
                        insight_event_id: Some(insight.id),
                        kind,
                        webauthn_credential_id: passkey_cred_id,
                        created_at: Utc::now(),
                        scope,
                        new_auth_method_action: added_auth_method.then_some(ActionKind::AddPrimary),
                    };
                    AuthEvent::save(ae_args, conn)?
                }
                AuthEventResult::Existing(id) => {
                    // The auth event was already created - only used for SmsLink challenges
                    let ae = AuthEvent::get(conn, &id)?;
                    let ae_sv_id = ae.scoped_vault_id.as_ref();
                    if ae_sv_id.is_none() || ae_sv_id != sv.as_ref().map(|su| &su.id) {
                        return ServerErrInto("Auth event does not correspond to the correct user");
                    }
                    ae
                }
            };

            // Token-specific handling
            let su_id = match scope {
                IdentifyScope::Auth => {
                    let su = sv.ok_or(BadRequest("No scoped vault available"))?;
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

                    Some(su.into_inner().id)
                }
                IdentifyScope::Onboarding => {
                    let su = sv.ok_or(BadRequest("No scoped vault available"))?;
                    if let Some(bo_id) = user_auth.bo_id.as_ref() {
                        register_business_owner(conn, &su, bo_id)?;
                    }
                    Some(su.into_inner().id)
                }
                IdentifyScope::My1fp => None,
            };

            // Create a new token derived from the provided one, adding new scopes and context
            let ae = AssociatedAuthEvent::explicit(event.id.clone());
            let scopes = allowed_user_scopes(&[(event, AssociatedAuthEventKind::Explicit)], scope.into());
            let session = UserSessionBuilder::from_existing(&user_auth, scope.into())?
                .replace_su_id(su_id)
                .add_scopes(scopes)
                .add_auth_events(vec![ae])
                .finish()?;
            let (token, _) =
                user_auth.create_derived(conn, &session_key, session, Some(scope.token_ttl()))?;

            Ok(token)
        })
        .await?;

    Ok(IdentifyVerifyResponse { auth_token })
}

/// If we're about to make a new ScopedVault because this user is onboarding onto a new tenant,
/// calculate the prefill data
async fn get_prefill_data(
    state: &State,
    user_auth: &CheckedUserAuthContext,
) -> FpResult<Option<PrefillData>> {
    let Some(playbook) = user_auth.playbook.as_ref() else {
        // My1fp
        return Ok(None);
    };
    let Some(obc) = user_auth.obc.as_ref() else {
        // My1fp
        return Ok(None);
    };
    if user_auth.su_id.is_some() {
        // ScopedVault already exists, no need to prefill
        return Ok(None);
    }
    let t_id = playbook.tenant_id.clone();
    let uv_id = user_auth.user_vault_id.clone();
    let portable_vw = state
        .db_query(move |conn| {
            let existing_sv = ScopedVault::get(conn, (&uv_id, &t_id)).optional()?;
            let portable_vw = existing_sv
                .is_none()
                .then(|| VaultWrapper::<Any>::build_portable(conn, &uv_id))
                .transpose()?;
            Ok(portable_vw)
        })
        .await?;
    let Some(portable_vw) = portable_vw else {
        // ScopedVault for this tenant exists, it just wasn't yet bound in the session
        return Ok(None);
    };
    let prefill_data = portable_vw
        .get_data_to_prefill(state, playbook, obc, PrefillKind::LoginMethods)
        .await?;
    Ok(Some(prefill_data))
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

async fn on_contact_info_verify(
    state: &State,
    user_auth: &CheckedUserAuthContext,
    contact_info: PiiString,
    lifetime_id: DataLifetimeId,
    cik: ContactInfoKind,
) -> FpResult<VerifiedCredential> {
    let data = if let Some(playbook) = user_auth.playbook.as_ref() {
        let args = ValidateArgs::for_bifrost(user_auth.user.is_live);
        let data = HashMap::from_iter([(cik.verified_di(), contact_info)]);
        // The vault should already have `id.phone_number` or `id.email`, let's not derive it here.
        let data = DataRequest::clean_and_validate_str(data, args)?
            .filter(|di| !matches!(di, DI::Id(IDK::PhoneNumber) | DI::Id(IDK::Email)));
        let data = FingerprintedDataRequest::build_for_new_user(state, data, &playbook.tenant_id).await?;
        Some(data)
    } else {
        None
    };
    Ok(VerifiedCredential::ContactInfo(data, lifetime_id, cik))
}

enum VerifiedCredential {
    ContactInfo(Option<FingerprintedDataRequest>, DataLifetimeId, ContactInfoKind),
    Passkey(WebauthnAuthenticationResult),
}

enum AuthEventResult {
    Existing(AuthEventId),
    Create(AuthEventKind),
}
