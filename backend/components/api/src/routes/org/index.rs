use crate::auth::tenant::SecretTenantAuthContext;
use crate::auth::tenant::{CheckTenantPermissions, TenantUserAuthContext};
use crate::auth::Either;
use crate::errors::ApiError;
use crate::types::response::ResponseData;
use crate::types::{EmptyResponse, JsonApiResponse};
use crate::utils::db2api::DbToApi;
use crate::State;
use actix_web::web;
use api_wire_types::UpdateTenantRequest;
use db::models::tenant::{Tenant, UpdateTenant};
use newtypes::TenantPermission;
use paperclip::actix::patch;
use paperclip::actix::{self, api_v2_operation, web::Json};

#[api_v2_operation(
    tags(Organization, PublicApi),
    description = "Returns basic info about the authed tenant"
)]
#[actix::get("/org")]
pub async fn get(
    auth: Either<TenantUserAuthContext, SecretTenantAuthContext>,
) -> JsonApiResponse<api_wire_types::Organization> {
    let auth = auth.check_permissions(vec![])?; // No permissions needed to access this endpoint
    let tenant = auth.tenant().clone();

    Ok(Json(ResponseData::ok(api_wire_types::Organization::from_db(
        tenant,
    ))))
}

#[api_v2_operation(tags(Organization, PublicApi), description = "Updates the Tenant")]
#[patch("/org")]
async fn patch(
    state: web::Data<State>,
    request: web::Json<UpdateTenantRequest>,
    auth: TenantUserAuthContext,
) -> actix_web::Result<Json<ResponseData<EmptyResponse>>, ApiError> {
    let auth = auth.check_permissions(vec![TenantPermission::Admin])?;
    let tenant = auth.tenant();

    let tenant_id = tenant.id.clone();
    let UpdateTenantRequest {
        name,
        website_url,
        company_size,
        logo_url,
    } = request.into_inner();

    let update_tenant = UpdateTenant {
        name,
        logo_url,
        website_url,
        company_size,
    };
    let _result = state
        .db_pool
        .db_query(move |conn| Tenant::update(conn, tenant_id, update_tenant))
        .await??;

    Ok(Json(EmptyResponse::ok()))
}
