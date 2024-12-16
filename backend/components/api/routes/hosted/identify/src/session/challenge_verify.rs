use crate::ChallengeData;
use crate::ChallengeState;
use crate::State;
use api_core::auth::session::UpdateSession;
use api_core::auth::user::IdentifyAuthContext;
use api_core::types::ApiResponse;
use api_core::utils::challenge::Challenge;
use api_core::utils::headers::InsightHeaders;
use api_core::utils::vault_wrapper::FingerprintedDataRequest;
use api_core::utils::vault_wrapper::Person;
use api_core::utils::vault_wrapper::VaultWrapper;
use api_core::FpResult;
use api_errors::BadRequest;
use api_errors::BadRequestInto;
use api_errors::ServerErrInto;
use api_wire_types::ChallengeVerifyRequest;
use chrono::Utc;
use db::models::auth_event::AuthEvent;
use db::models::auth_event::NewAuthEventArgs;
use db::models::contact_info::ContactInfo;
use db::models::data_lifetime::DataLifetime;
use db::models::insight_event::CreateInsightEvent;
use db::models::scoped_vault::ScopedVault;
use newtypes::ActionKind;
use newtypes::AuthEventId;
use newtypes::AuthEventKind;
use newtypes::ContactInfoKind;
use newtypes::DataIdentifier as DI;
use newtypes::DataLifetimeId;
use newtypes::DataRequest;
use newtypes::IdentityDataKind as IDK;
use newtypes::PiiString;
use newtypes::ValidateArgs;
use paperclip::actix;
use paperclip::actix::api_v2_operation;
use paperclip::actix::web;
use paperclip::actix::web::Json;
use std::collections::HashMap;

#[api_v2_operation(tags(Identify, Hosted), description = "Verifies the response to a challenge")]
#[actix::post("/hosted/identify/session/challenge/verify")]
pub async fn post(
    state: web::Data<State>,
    request: Json<ChallengeVerifyRequest>,
    identify: IdentifyAuthContext,
    insight_headers: InsightHeaders,
) -> ApiResponse<api_wire_types::Empty> {
    // Note: Challenge::unseal checks for challenge token expiry as well
    let ChallengeVerifyRequest {
        challenge_token,
        challenge_response: c_response,
    } = request.into_inner();
    let challenge_state =
        Challenge::<ChallengeState>::unseal(&state.challenge_sealing_key, &challenge_token)?.data;

    // Verify the challenge response
    let (verified_credential, ae_result) = match challenge_state.data {
        ChallengeData::Sms(s) => {
            let c_response = c_response.ok_or(BadRequest("SMS challenge requires a challenge_response"))?;
            s.verify_response(&c_response)?;
            use ContactInfoKind::Phone;
            let cred =
                on_contact_info_verify(&state, &identify, s.contact_info, s.lifetime_id, Phone).await?;
            (cred, AuthEventResult::Create(AuthEventKind::Sms))
        }
        ChallengeData::SmsLink(s) => {
            let ae_id = s.verify_response(&state).await?;
            use ContactInfoKind::Phone;
            let cred = on_contact_info_verify(&state, &identify, s.e164, s.lifetime_id, Phone).await?;
            (cred, AuthEventResult::Existing(ae_id))
        }
        ChallengeData::Email(s) => {
            let c_response = c_response.ok_or(BadRequest("Email challenge requires a challenge_response"))?;
            s.verify_response(&c_response)?;
            use ContactInfoKind::Email;
            let cred =
                on_contact_info_verify(&state, &identify, s.contact_info, s.lifetime_id, Email).await?;
            (cred, AuthEventResult::Create(AuthEventKind::Email))
        }
        ChallengeData::Passkey(_) => {
            return BadRequestInto("Passkey challenges are not supported for identify sessions");
        }
    };

    let session_key = state.session_sealing_key.clone();
    state
        .db_transaction(move |conn| {
            // Apply auth-method-specific updates
            let VerifiedCredential::ContactInfo(verified_data, ci_dl_id, ci_kind) = verified_credential;
            // For bifrost logins that already have a SV (created in the signup challenge or via
            // API) we can mark the contact info as OTP verified
            let vw = VaultWrapper::<Person>::lock_for_onboarding(conn, &identify.placeholder_su_id)?;

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
                // NOTE: This also marks the SV as active, which allows it to be used for login, even if all
                // identify requirements haven't been met.
                let sv_txn = vw.save_ci_after_otp(conn, verified_data)?;

                if onboarding_tenant_eq_identify_tenant {
                    // Portablize and verify the existing piece of `id.xxx` contact info.
                    DataLifetime::portablize(conn, &sv_txn, &ci.lifetime_id)?;
                    ContactInfo::mark_otp_verified(conn, &ci.id)?;
                }
            }

            let sv = ScopedVault::lock(conn, &identify.placeholder_su_id)?;
            let auth_event = match ae_result {
                AuthEventResult::Create(kind) => {
                    // Record the new auth event
                    let insight = CreateInsightEvent::from(insight_headers).insert_with_conn(conn)?;
                    let sv_txn = DataLifetime::new_sv_txn(conn, sv)?;

                    let ae_args = NewAuthEventArgs {
                        vault_id: identify.placeholder_uv_id.clone(),
                        sv_txn: Some(sv_txn),
                        insight_event_id: Some(insight.id),
                        kind,
                        webauthn_credential_id: None,
                        created_at: Utc::now(),
                        scope: identify.scope,
                        new_auth_method_action: is_first_time_verifying.then_some(ActionKind::AddPrimary),
                    };
                    AuthEvent::save(ae_args, conn)?
                }
                AuthEventResult::Existing(id) => {
                    // The auth event was already created - only used for SmsLink challenges
                    let ae = AuthEvent::get(conn, &id)?;
                    let ae_sv_id = ae.scoped_vault_id.as_ref();
                    if ae_sv_id.is_none() || ae_sv_id != Some(&sv.id) {
                        return ServerErrInto("Auth event does not correspond to the correct user");
                    }
                    ae
                }
            };

            let identify_session = identify.data.session.clone().add_auth_event(auth_event.id);
            identify.update_session(conn, &session_key, identify_session.into())?;

            Ok(())
        })
        .await?;

    Ok(api_wire_types::Empty)
}


async fn on_contact_info_verify(
    state: &State,
    identify: &IdentifyAuthContext,
    contact_info: PiiString,
    lifetime_id: DataLifetimeId,
    cik: ContactInfoKind,
) -> FpResult<VerifiedCredential> {
    let args = ValidateArgs::for_bifrost(identify.uv.is_live);
    let data = HashMap::from_iter([(cik.verified_di(), contact_info)]);
    // The vault should already have `id.phone_number` or `id.email`, let's not derive it here.
    let data = DataRequest::clean_and_validate_str(data, args)?
        .filter(|di| !matches!(di, DI::Id(IDK::PhoneNumber) | DI::Id(IDK::Email)));
    let data =
        FingerprintedDataRequest::build_for_new_user(state, data, &identify.playbook.tenant_id).await?;
    Ok(VerifiedCredential::ContactInfo(data, lifetime_id, cik))
}

enum VerifiedCredential {
    ContactInfo(FingerprintedDataRequest, DataLifetimeId, ContactInfoKind),
}

enum AuthEventResult {
    Existing(AuthEventId),
    Create(AuthEventKind),
}
