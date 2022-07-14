use crate::auth::session_data::tenant::ob_public_key::PublicTenantAuthContext;
use crate::errors::ApiError;
use crate::types::success::ApiResponseData;
use crate::State;
use newtypes::{DataKind, ObConfigurationSettings};
use paperclip::actix::{api_v2_operation, get, web, web::Json, Apiv2Schema};

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
struct OrgConfigResponse {
    name: String,
    required_user_data: Vec<DataKind>,
    must_collect_data_kinds: Vec<DataKind>,
    can_access_data_kinds: Vec<DataKind>,
    settings: ObConfigurationSettings,
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

    Ok(Json(ApiResponseData {
        data: OrgConfigResponse {
            name: tenant.name,
            must_collect_data_kinds: ob_config.must_collect_data_kinds.clone(),
            can_access_data_kinds: ob_config.can_access_data_kinds,
            settings: ob_config.settings,
            // TODO Remove this once the client is migrated to read the new fields
            // https://linear.app/footprint/issue/FP-611/update-client-to-differentiate-between-must-collect-and-can-access
            required_user_data: ob_config.must_collect_data_kinds,
        },
    }))
}
