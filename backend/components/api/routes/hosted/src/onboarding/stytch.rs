use crate::auth::user::{UserAuthContext, UserAuthGuard};
use crate::types::{EmptyResponse, JsonApiResponse};
use crate::State;
use actix_web::web::Json;
use api_core::auth::user::UserAuth;
use api_core::decision;
use api_core::decision::vendor;
use api_core::errors::{ApiResult, AssertionError};
use api_core::utils::headers::TelemetryHeaders;
use api_core::ApiError;
use api_wire_types::hosted::stytch::StytchTelemetryRequest;
use chrono::Utc;
use db::models::decision_intent::DecisionIntent;
use db::models::risk_signal::RiskSignal;
use db::models::stytch_fingerprint_event::{NewStytchFingerprintEvent, StytchFingerprintEvent};
use db::models::vault::Vault;
use db::models::verification_request::VerificationRequest;
use db::TxnPgConn;
use either::Either;
use idv::stytch::{StytchLookupRequest, StytchLookupResponse};
use idv::{ParsedResponse, VendorResponse};
use newtypes::{DecisionIntentKind, RiskSignalGroupKind, ScopedVaultId, VaultId, VaultPublicKey, VendorAPI};
use paperclip::actix::{self, api_v2_operation, web};

#[api_v2_operation(
    tags(Hosted),
    description = "Performs a lookup with Stytch on the passed up telemetry_id and records the response + risk signals"
)]
#[actix::post("/hosted/onboarding/tel")]
pub async fn post(
    request: Json<StytchTelemetryRequest>,
    state: web::Data<State>,
    user_auth: UserAuthContext,
    telemetry_headers: TelemetryHeaders,
) -> JsonApiResponse<EmptyResponse> {
    let user_auth = user_auth.check_guard(UserAuthGuard::OrgOnboarding)?;
    let StytchTelemetryRequest { telemetry_id } = request.into_inner();

    let req = StytchLookupRequest { telemetry_id };
    let res = state.vendor_clients.stytch_lookup.make_request(req).await;
    let res = match res {
        Ok(res) => Either::Left(res),
        Err(e) => match e {
            idv::stytch::error::Error::ErrorWithResponse(e) => {
                tracing::error!(error=?e, "Stytch error response");
                Either::Right(e.response.clone())
            }
            _ => Err(ApiError::from(idv::Error::from(e)))?,
        },
    };

    let uv_id = user_auth.user_vault_id().clone();
    let sv_id = user_auth
        .scoped_user_id()
        .ok_or(AssertionError("auth missing scoped_user_id"))?;
    state
        .db_pool
        .db_transaction(move |conn: &mut db::TxnPgConn<'_>| -> ApiResult<_> {
            let di = DecisionIntent::create(conn, DecisionIntentKind::DeviceFingerprint, &sv_id, None)?;
            let vreq = VerificationRequest::create(conn, &sv_id, &di.id, VendorAPI::StytchLookup)?;
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
                        &sv_id,
                        telemetry_headers,
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

    EmptyResponse::ok().json()
}

fn save_successful_response(
    conn: &mut TxnPgConn,
    vreq: VerificationRequest,
    res: StytchLookupResponse,
    public_key: &VaultPublicKey,
    uv_id: &VaultId,
    sv_id: &ScopedVaultId,
    telemetry_headers: TelemetryHeaders,
) -> ApiResult<()> {
    let vendor_response = VendorResponse {
        response: ParsedResponse::StytchLookup(res.parsed_response.clone()),
        raw_response: res.raw_response,
    };
    let vres =
        vendor::verification_result::save_verification_result(conn, &(vreq, vendor_response), public_key)?;

    let reason_codes =
        decision::features::stytch::lookup_response_to_footprint_reason_codes(&res.parsed_response);

    let _rs = RiskSignal::bulk_create(
        conn,
        sv_id,
        reason_codes
            .into_iter()
            .map(|rc| (rc, VendorAPI::StytchLookup, vres.id.clone()))
            .collect::<Vec<_>>(),
        RiskSignalGroupKind::WebDevice,
        false,
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
