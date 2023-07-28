use crate::auth::user::{UserAuthContext, UserAuthGuard};
use crate::types::{EmptyResponse, JsonApiResponse};
use crate::State;
use actix_web::web::Json;
use api_core::auth::user::UserAuth;
use api_core::decision;
use api_core::decision::vendor;
use api_core::errors::{ApiResult, AssertionError};
use api_core::ApiError;
use api_wire_types::hosted::stytch::StytchTelemetryRequest;
use db::models::decision_intent::DecisionIntent;
use db::models::risk_signal::RiskSignal;
use db::models::vault::Vault;
use db::models::verification_request::VerificationRequest;
use idv::stytch::StytchLookupRequest;
use idv::{ParsedResponse, VendorResponse};
use newtypes::{DecisionIntentKind, RiskSignalGroupKind, VendorAPI};
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
) -> JsonApiResponse<EmptyResponse> {
    let user_auth = user_auth.check_guard(UserAuthGuard::OrgOnboarding)?;
    let StytchTelemetryRequest { telemetry_id } = request.into_inner();

    let req = StytchLookupRequest { telemetry_id };
    let res = state
        .vendor_clients
        .stytch_lookup
        .make_request(req)
        .await
        .map_err(|e| ApiError::from(idv::Error::from(e)))?;

    let uv_id = user_auth.user_vault_id().clone();
    let sv_id = user_auth
        .scoped_user_id()
        .ok_or(AssertionError("auth missing scoped_user_id"))?;
    state
        .db_pool
        .db_transaction(move |conn: &mut db::TxnPgConn<'_>| -> ApiResult<_> {
            let vendor_api = VendorAPI::StytchLookup;
            let di = DecisionIntent::create(conn, DecisionIntentKind::DeviceFingerprint, &sv_id, None)?;
            let vreq = VerificationRequest::create(conn, &sv_id, &di.id, vendor_api)?;

            let uv = Vault::get(conn, &uv_id)?;
            let vendor_response = VendorResponse {
                response: ParsedResponse::StytchLookup(res.parsed_response.clone()),
                raw_response: res.raw_response,
            };
            let vres = vendor::verification_result::save_verification_result(
                conn,
                &(vreq, vendor_response),
                &uv.public_key,
            )?;

            let reason_codes =
                decision::features::stytch::lookup_response_to_footprint_reason_codes(&res.parsed_response);

            let _rs = RiskSignal::bulk_create(
                conn,
                &sv_id,
                reason_codes
                    .into_iter()
                    .map(|rc| (rc, vendor_api, vres.id.clone()))
                    .collect::<Vec<_>>(),
                RiskSignalGroupKind::WebDevice,
                false,
            )?;
            Ok(())
        })
        .await?;

    EmptyResponse::ok().json()
}
