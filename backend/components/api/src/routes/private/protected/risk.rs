use crate::auth::protected_custodian::ProtectedCustodianAuthContext;
use crate::decision::vendor;
use crate::errors::{ApiError, ApiResult};
use crate::types::response::ResponseData;
use crate::utils::user_vault_wrapper::{UserVaultWrapper, UvwArgs};
use crate::{decision, State};
use db::models::onboarding::Onboarding;
use db::models::scoped_user::ScopedUser;
use db::models::user_vault::UserVault;
use newtypes::{FootprintUserId, TenantId, VerificationRequestId, VerificationResultId};
use paperclip::actix::Apiv2Schema;
use paperclip::actix::{api_v2_operation, post, web, web::Json};

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
pub struct MakeVendorCallsRequest {
    pub tenant_id: TenantId,
    pub fp_user_id: FootprintUserId,
}

#[derive(Debug, Clone, serde::Serialize, Apiv2Schema)]
pub struct MakeVendorCallsResponse {
    request_ids: Vec<VerificationRequestId>,
    response_ids: Vec<VerificationResultId>,
}

#[api_v2_operation(
    description = "Creates new VerificationRequest's, re-pings all vendors, and writes VerificationResults for the passed in fp_user_id",
    tags(Private)
)]
#[post("/private/protected/risk/make_vendor_calls")]
async fn make_vendor_calls(
    state: web::Data<State>,
    _: ProtectedCustodianAuthContext,
    request: Json<MakeVendorCallsRequest>,
) -> actix_web::Result<Json<ResponseData<MakeVendorCallsResponse>>, ApiError> {
    let MakeVendorCallsRequest {
        tenant_id,
        fp_user_id,
    } = request.into_inner();

    let onboarding = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let scoped_user = ScopedUser::get(conn, (&fp_user_id, &tenant_id, true))?;
            let uv = UserVault::get(conn, &scoped_user.id)?;
            let (ob, _, _, _) = Onboarding::get(conn, (&scoped_user.id, &uv.id))?;

            let uvw = UserVaultWrapper::build(conn, UvwArgs::Tenant(&scoped_user.id))?;

            vendor::build_verification_requests_and_checkpoint(conn, &uvw, &ob.id)?;

            Ok(ob)
        })
        .await?;

    let vendor_results = decision::engine::make_outstanding_vendor_requests(
        &onboarding.id,
        &state.db_pool,
        &state.enclave_client,
        state.config.service_config.is_production(),
        &state.feature_flag_client,
        &state.idology_client,
        &state.socure_production_client,
        &state.twilio_client.client,
    )
    .await?;

    let (request_ids, response_ids): (Vec<VerificationRequestId>, Vec<VerificationResultId>) = vendor_results
        .into_iter()
        .map(|r| (r.verification_request_id, r.verification_result_id))
        .unzip();

    Ok(Json(ResponseData::ok(MakeVendorCallsResponse {
        request_ids,
        response_ids,
    })))
}
