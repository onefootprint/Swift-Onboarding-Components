use crate::auth::session_data::tenant::ob_public_key::PublicTenantAuthContext;
use crate::types::success::ApiResponseData;
use crate::State;
use crate::{errors::ApiError};
use newtypes::{DataKind, ObConfigurationSettings};
use paperclip::actix::{api_v2_operation, get, web, web::Json, Apiv2Schema};

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
struct OrgConfigResponse {
    name: String,
    required_user_data: Vec<DataKind>,
    settings: ObConfigurationSettings
}

#[api_v2_operation(tags(Org))]
#[get("/config")]
/// Uses tenant public key auth to return information about the tenant
fn get(
    _state: web::Data<State>,
    auth: PublicTenantAuthContext,
) -> actix_web::Result<Json<ApiResponseData<OrgConfigResponse>>, ApiError> {
    let tenant = auth.tenant;
    let ob_config = auth.ob_config;

    Ok(Json(ApiResponseData { data: OrgConfigResponse { name: tenant.name, required_user_data: ob_config.required_user_data, settings: ob_config.settings } }))
}
