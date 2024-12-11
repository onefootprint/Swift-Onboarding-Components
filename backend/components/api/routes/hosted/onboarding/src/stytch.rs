use crate::auth::user::UserAuthContext;
use crate::auth::user::UserAuthScope;
use crate::types::ApiResponse;
use crate::State;
use actix_web::web::Json;
use api_core::auth::user::UserSessionContext;
use api_core::auth::SessionContext;
use api_core::decision;
use api_core::decision::vendor;
use api_core::utils::headers::TelemetryHeaders;
use api_core::FpError;
use api_core::FpResult;
use api_errors::ServerErr;
use api_wire_types::hosted::stytch::StytchTelemetryRequest;
use chrono::Utc;
use db::models::decision_intent::DecisionIntent;
use db::models::risk_signal::RiskSignal;
use db::models::stytch_fingerprint_event::NewStytchFingerprintEvent;
use db::models::stytch_fingerprint_event::StytchFingerprintEvent;
use db::models::vault::Vault;
use db::models::verification_request::VerificationRequest;
use db::TxnPgConn;
use either::Either;
use idv::stytch::StytchLookupRequest;
use idv::stytch::StytchLookupResponse;
use idv::ParsedResponse;
use idv::VendorResponse;
use newtypes::DecisionIntentKind;
use newtypes::RiskSignalGroupKind;
use newtypes::ScopedVaultId;
use newtypes::VaultId;
use newtypes::VaultPublicKey;
use newtypes::VendorAPI;
use newtypes::VerificationCheckKind;
use paperclip::actix::api_v2_operation;
use paperclip::actix::web;
use paperclip::actix::{
    self,
};

#[api_v2_operation(
    tags(Onboarding, Hosted),
    description = "Performs a lookup with Stytch on the passed up telemetry_id and records the response + risk signals"
)]
#[actix::post("/hosted/onboarding/tel")]
pub async fn post(
    _request: Json<StytchTelemetryRequest>,
    _state: web::Data<State>,
    user_auth: UserAuthContext,
    _telemetry_headers: TelemetryHeaders,
) -> ApiResponse<api_wire_types::Empty> {
    let _user_auth = user_auth.check_guard(UserAuthScope::SignUp)?;
    // let StytchTelemetryRequest { telemetry_id } = request.into_inner();
    // 2024-08-02, temporarily disabling since stytch seems to be down
    // post_inner(&state, telemetry_id).await?;

    Ok(api_wire_types::Empty)
}

#[allow(unused)]
async fn post_inner(
    state: &State,
    telemetry_id: String,
    user_auth: SessionContext<UserSessionContext>,
    telemetry_headers: TelemetryHeaders,
) -> FpResult<()> {
    let req = StytchLookupRequest {
        telemetry_id: telemetry_id.clone(),
    };
    let res = state.vendor_clients.stytch_lookup.make_request(req).await;
    let res = match res {
        Ok(res) => Either::Left(res),
        Err(err) => match err {
            idv::stytch::error::Error::ErrorWithResponse(err) => {
                tracing::warn!(?err, ?telemetry_id, "Stytch error response");
                Either::Right(err.response.clone())
            }
            _ => Err(FpError::from(idv::Error::from(err)))?,
        },
    };

    let uv_id = user_auth.user.id.clone();
    let su_id = (user_auth.su_id.clone()).ok_or(ServerErr("auth missing scoped_user_id"))?;
    let wf_id = user_auth.wf_id.clone();

    // We want to only show a signal set of device signals from Stytch OR Neuro or else it's confusing
    let should_hide_risk_signals = (user_auth.obc.as_ref())
        .map(|o| {
            o.verification_checks()
                .get(VerificationCheckKind::NeuroId)
                .is_some()
        })
        .unwrap_or(false);

    state
        .db_transaction(move |conn: &mut db::TxnPgConn<'_>| -> FpResult<_> {
            let wf_id = wf_id.as_ref();
            let di = DecisionIntent::create(conn, DecisionIntentKind::DeviceFingerprint, &su_id, wf_id)?;
            let vreq = VerificationRequest::create(conn, (&su_id, &di.id, VendorAPI::StytchLookup).into())?;
            let uv = Vault::get(conn, &uv_id)?;

            match res {
                // successful response
                Either::Left(res) => {
                    save_successful_response(
                        conn,
                        vreq,
                        res,
                        &uv.public_key,
                        &uv_id,
                        &su_id,
                        telemetry_headers,
                        should_hide_risk_signals,
                    )?;
                }
                // error response
                Either::Right(res) => {
                    vendor::verification_result::save_error_verification_result(
                        conn,
                        &(vreq, Some(res)),
                        &uv.public_key,
                    )?;
                }
            };

            Ok(())
        })
        .await?;

    Ok(())
}
#[allow(clippy::too_many_arguments)]
fn save_successful_response(
    conn: &mut TxnPgConn,
    vreq: VerificationRequest,
    res: StytchLookupResponse,
    public_key: &VaultPublicKey,
    uv_id: &VaultId,
    sv_id: &ScopedVaultId,
    telemetry_headers: TelemetryHeaders,
    hide_risk_signals: bool,
) -> FpResult<()> {
    let vendor_response = VendorResponse {
        response: ParsedResponse::StytchLookup(res.parsed_response.clone()),
        raw_response: res.raw_response,
    };
    let vres =
        vendor::verification_result::save_verification_result(conn, &(vreq, vendor_response), public_key)?;

    let reason_codes =
        decision::features::stytch::lookup_response_to_footprint_reason_codes(&res.parsed_response);
    let scope = sv_id.into();

    let _rs = RiskSignal::bulk_save_for_scope(
        conn,
        scope,
        reason_codes
            .into_iter()
            .map(|rc| (rc, VendorAPI::StytchLookup, vres.id.clone()))
            .collect::<Vec<_>>(),
        RiskSignalGroupKind::WebDevice,
        hide_risk_signals,
    )?;

    let _e = StytchFingerprintEvent::create(
        conn,
        NewStytchFingerprintEvent {
            created_at: Utc::now(),
            session_id: telemetry_headers.session_id,
            vault_id: Some(uv_id.clone()),
            scoped_vault_id: Some(sv_id.clone()),
            verification_result_id: vres.id,
            browser_fingerprint: res
                .parsed_response
                .fingerprints
                .browser_fingerprint
                .map(|s| s.leak_to_string().into()),
            browser_id: res
                .parsed_response
                .fingerprints
                .browser_id
                .map(|s| s.leak_to_string().into()),
            hardware_fingerprint: res
                .parsed_response
                .fingerprints
                .hardware_fingerprint
                .map(|s| s.leak_to_string().into()),
            network_fingerprint: res
                .parsed_response
                .fingerprints
                .network_fingerprint
                .map(|s| s.leak_to_string().into()),
            visitor_fingerprint: res
                .parsed_response
                .fingerprints
                .visitor_fingerprint
                .map(|s| s.leak_to_string().into()),
            visitor_id: res
                .parsed_response
                .fingerprints
                .visitor_id
                .map(|s| s.leak_to_string().into()),
        },
    )?;
    Ok(())
}
