use crate::auth::custodian::CustodianAuthContext;
use crate::errors::ApiError;
use crate::types::response::ResponseData;
use crate::State;
use newtypes::TenantId;
use paperclip::actix::Apiv2Schema;
use paperclip::actix::{api_v2_operation, post, web, web::Json};

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
pub struct TestLaunchDarklyRequest {
    pub tenant_id: TenantId,
}

#[derive(Debug, Clone, serde::Serialize, Apiv2Schema)]
pub struct TestLaunchDarklyResponse {
    message: String,
}

#[api_v2_operation(
    description = "Private endpoint to test Launch Darkly flag integration.",
    tags(Private)
)]
#[post("/private/test_launch_darkly")]
async fn post(
    state: web::Data<State>,
    _custodian: CustodianAuthContext,
    request: Json<TestLaunchDarklyRequest>,
) -> actix_web::Result<Json<ResponseData<TestLaunchDarklyResponse>>, ApiError> {
    let feature_flag_client = &state.feature_flag_client;
    let test_flag_value = feature_flag_client.bool_flag("TestFlag")?;
    let test_tenant_flag_value =
        feature_flag_client.bool_flag_by_tenant_id("TestTenantSpecificFlag", &request.tenant_id)?;

    let message = format!("TestFlag: {test_flag_value}, TestTenantSpecificFlag: {test_tenant_flag_value}");

    Ok(Json(ResponseData::ok(TestLaunchDarklyResponse { message })))
}
