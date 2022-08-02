use crate::types::success::ApiResponseData;
use crate::{auth::key_context::ob_public_key::PublicTenantAuthContext, errors::ApiError};
use newtypes::DataKind;
use paperclip::actix::{api_v2_operation, get, web::Json, Apiv2Schema};

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
struct PublicOnboardingConfigResponse {
    org_name: String,
    name: String,
    must_collect_data_kinds: Vec<DataKind>,
    can_access_data_kinds: Vec<DataKind>,
    is_live: bool,
}

#[api_v2_operation(tags(Org))]
#[get("/config")]
/// Uses tenant public key auth to return information about the tenant
fn get(
    auth: PublicTenantAuthContext,
) -> actix_web::Result<Json<ApiResponseData<PublicOnboardingConfigResponse>>, ApiError> {
    let tenant = auth.tenant;
    let ob_config = auth.ob_config;

    Ok(Json(ApiResponseData {
        data: PublicOnboardingConfigResponse {
            org_name: tenant.name,
            name: ob_config.name,
            must_collect_data_kinds: ob_config.must_collect_data_kinds.clone(),
            can_access_data_kinds: ob_config.can_access_data_kinds,
            is_live: ob_config.is_live,
        },
    }))
}
