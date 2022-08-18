use crate::auth::session_data::workos::WorkOs;
use crate::auth::{HasTenant, SessionContext};
use crate::errors::ApiError;
use crate::types::response::ApiResponseData;
use crate::types::EmptyResponse;
use crate::State;
use db::models::tenant::UpdateTenantNameOrLogo;
use paperclip::actix::{api_v2_operation, post, web, web::Json, Apiv2Schema};

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
struct UpdateRequest {
    /// tenant name
    name: Option<String>,
    /// logo url
    logo_url: Option<String>,
}

#[api_v2_operation(tags(PublicApi))]
#[post("/")]
/// Update tenant configuration settings
fn handler(
    state: web::Data<State>,
    request: Json<UpdateRequest>,
    auth: SessionContext<WorkOs>,
) -> actix_web::Result<Json<ApiResponseData<EmptyResponse>>, ApiError> {
    let request = request.into_inner();

    // update the tenant name
    UpdateTenantNameOrLogo {
        id: auth.tenant().id.clone(),
        name: request.name,
        logo_url: request.logo_url,
    }
    .update(&state.db_pool)
    .await?;

    Ok(Json(ApiResponseData { data: EmptyResponse }))
}
