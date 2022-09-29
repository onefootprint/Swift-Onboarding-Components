use crate::auth::tenant::{VerifiedTenantAuth, WorkOsAuthContext};
use crate::errors::ApiError;
use crate::types::response::ResponseData;
use crate::types::EmptyResponse;
use crate::State;
use db::models::tenant::UpdateTenantNameOrLogo;
use newtypes::TenantPermission;
use paperclip::actix::{api_v2_operation, post, web, web::Json, Apiv2Schema};

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
struct UpdateRequest {
    /// tenant name
    name: Option<String>,
    /// logo url
    logo_url: Option<String>,
}

#[api_v2_operation(
    summary = "/org/settings",
    operation_id = "org-settings-post",
    description = "Updates tenant configuration settings.",
    tags(PublicApi)
)]
#[post("/")]
fn handler(
    state: web::Data<State>,
    request: Json<UpdateRequest>,
    auth: WorkOsAuthContext,
) -> actix_web::Result<Json<ResponseData<EmptyResponse>>, ApiError> {
    let auth = auth.check_permissions(vec![TenantPermission::OrgSettings])?;
    let request = request.into_inner();

    // update the tenant name
    UpdateTenantNameOrLogo {
        id: auth.tenant().id.clone(),
        name: request.name,
        logo_url: request.logo_url,
    }
    .update(&state.db_pool)
    .await?;

    Ok(Json(EmptyResponse::ok()))
}
