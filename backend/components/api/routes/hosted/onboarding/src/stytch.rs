use crate::auth::user::UserAuthContext;
use crate::auth::user::UserAuthScope;
use crate::types::ApiResponse;
use crate::State;
use actix_web::web::Json;
use api_core::auth::user::UserSessionContext;
use api_core::auth::SessionContext;
use api_core::decision;
use api_core::decision::vendor::verification_result::SaveVerificationResultArgs;
use api_core::utils::headers::TelemetryHeaders;
use api_core::FpResult;
use api_errors::ServerErr;
use api_wire_types::hosted::stytch::StytchTelemetryRequest;
use chrono::Utc;
use db::models::decision_intent::DecisionIntent;
use db::models::risk_signal::RiskSignal;
use db::models::stytch_fingerprint_event::NewStytchFingerprintEvent;
use db::models::stytch_fingerprint_event::StytchFingerprintEvent;
use db::models::vault::Vault;
use db::TxnPgConn;
use idv::stytch::response::LookupResponse;
use idv::stytch::StytchLookupRequest;
use newtypes::DecisionIntentKind;
use newtypes::RiskSignalGroupKind;
use newtypes::ScopedVaultId;
use newtypes::VaultId;
use newtypes::VendorAPI;
use newtypes::VerificationCheckKind;
use newtypes::VerificationResultId;
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
    telemetry: TelemetryHeaders,
) -> FpResult<()> {
    let uv_id = user_auth.user.id.clone();
    let su_id = (user_auth.su_id.clone()).ok_or(ServerErr("auth missing scoped_user_id"))?;
    let wf_id = user_auth.wf_id.clone();
    let req = StytchLookupRequest {
        telemetry_id: telemetry_id.clone(),
    };

    let res = state.vendor_clients.stytch_lookup.make_request(req).await;
    if let Some(Err(e)) = res.as_ref().ok().map(|r| &r.result) {
        tracing::warn!(?e, ?telemetry_id, "Stytch error response");
    }

    // We want to only show a signal set of device signals from Stytch OR Neuro or else it's confusing
    let hide_rs = (user_auth.obc.as_ref())
        .and_then(|o| o.verification_checks().get(VerificationCheckKind::NeuroId))
        .is_some();

    state
        .db_transaction(move |conn| {
            let wf_id = wf_id.as_ref();
            let di = DecisionIntent::create(conn, DecisionIntentKind::DeviceFingerprint, &su_id, wf_id)?;
            let uv = Vault::get(conn, &uv_id)?;

            let pk = user_auth.user.public_key.clone();
            let args = SaveVerificationResultArgs::new_for_stytch(&res, di.id.clone(), su_id.clone(), pk);
            let (vres_id, _) = args.save_sync(conn)?;
            if let Some(res) = res.ok().and_then(|r| r.result.ok()) {
                save_successful_response(conn, res, &uv_id, &su_id, telemetry, vres_id, hide_rs)?;
            }
            Ok(())
        })
        .await?;

    Ok(())
}

#[allow(clippy::too_many_arguments)]
fn save_successful_response(
    conn: &mut TxnPgConn,
    res: LookupResponse,
    uv_id: &VaultId,
    sv_id: &ScopedVaultId,
    telemetry_headers: TelemetryHeaders,
    vres_id: VerificationResultId,
    hide_risk_signals: bool,
) -> FpResult<()> {
    let reason_codes = decision::features::stytch::lookup_response_to_footprint_reason_codes(&res);
    let scope = sv_id.into();

    RiskSignal::bulk_save_for_scope(
        conn,
        scope,
        reason_codes
            .into_iter()
            .map(|rc| (rc, VendorAPI::StytchLookup, vres_id.clone()))
            .collect::<Vec<_>>(),
        RiskSignalGroupKind::WebDevice,
        hide_risk_signals,
    )?;

    let fingerprints = &res.fingerprints;
    StytchFingerprintEvent::create(
        conn,
        NewStytchFingerprintEvent {
            created_at: Utc::now(),
            session_id: telemetry_headers.session_id,
            vault_id: Some(uv_id.clone()),
            scoped_vault_id: Some(sv_id.clone()),
            verification_result_id: vres_id,
            browser_fingerprint: (fingerprints.browser_fingerprint.as_ref())
                .map(|s| s.leak_to_string().into()),
            browser_id: (fingerprints.browser_id.as_ref()).map(|s| s.leak_to_string().into()),
            hardware_fingerprint: (fingerprints.hardware_fingerprint.as_ref())
                .map(|s| s.leak_to_string().into()),
            network_fingerprint: (fingerprints.network_fingerprint.as_ref())
                .map(|s| s.leak_to_string().into()),
            visitor_fingerprint: (fingerprints.visitor_fingerprint.as_ref())
                .map(|s| s.leak_to_string().into()),
            visitor_id: (fingerprints.visitor_id.as_ref()).map(|s| s.leak_to_string().into()),
        },
    )?;
    Ok(())
}
