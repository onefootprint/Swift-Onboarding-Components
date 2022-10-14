use crate::auth::tenant::{CheckTenantPermissions, WorkOsAuthContext};
use crate::errors::ApiError;
use crate::types::response::ResponseData;
use crate::types::EmptyResponse;
use crate::State;
use db::models::tenant::UpdateTenantNameOrLogo;
use newtypes::TenantPermission;
use paperclip::actix::{self, api_v2_operation, web, web::Json, Apiv2Schema};

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub struct UpdateRequest {
    /// tenant name
    name: Option<String>,
    /// logo url
    logo_url: Option<String>,
}

#[api_v2_operation(
    description = "Updates tenant configuration settings.",
    tags(Organization, PublicApi)
)]
#[actix::post("/org/settings")]
pub async fn post(
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
