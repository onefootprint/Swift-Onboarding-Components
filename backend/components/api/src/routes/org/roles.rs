use crate::auth::tenant::CheckTenantGuard;
use crate::auth::tenant::TenantGuard;
use crate::auth::tenant::TenantUserAuthContext;
use crate::errors::ApiResult;
use crate::types::JsonApiResponse;
use crate::types::PaginatedResponseData;
use crate::types::PaginationRequest;
use crate::types::ResponseData;
use crate::utils::db2api::DbToApi;
use crate::State;
use api_wire_types::OrgRoleFilters;
use db::models::tenant_role::TenantRole;
use newtypes::TenantRoleId;
use newtypes::TenantScope;
use paperclip::actix::Apiv2Schema;
use paperclip::actix::{api_v2_operation, get, patch, post, web, web::Json};

type RolesResponse = Json<PaginatedResponseData<Vec<api_wire_types::OrganizationRole>, String>>;

#[api_v2_operation(
    tags(OrgSettings),
    description = "Returns a list of IAM roles for the tenant."
)]
#[get("/org/roles")]
async fn get(
    state: web::Data<State>,
    filters: web::Query<OrgRoleFilters>,
    pagination: web::Query<PaginationRequest<String>>,
    auth: TenantUserAuthContext,
) -> ApiResult<RolesResponse> {
    let auth = auth.check_guard(TenantGuard::Read)?;
    let tenant = auth.tenant();

    let cursor = pagination.cursor.clone();
    let page_size = pagination.page_size(&state);
    let OrgRoleFilters { scopes, name } = filters.into_inner();
    let scopes = scopes.map(|s| s.0);

    let tenant_id = tenant.id.clone();
    let results = state
        .db_pool
        .db_query(move |conn| {
            TenantRole::list_active(conn, &tenant_id, scopes, name, cursor, (page_size + 1) as i64)
        })
        .await??;

    let cursor = pagination.cursor_item(&state, &results).map(|x| x.name.clone());
    let results = results
        .into_iter()
        .take(page_size)
        .map(api_wire_types::OrganizationRole::from_db)
        .collect::<Vec<api_wire_types::OrganizationRole>>();
    Ok(Json(PaginatedResponseData::ok(results, cursor, None)))
}

#[derive(Debug, serde::Deserialize, Apiv2Schema)]
struct CreateTenantRoleRequest {
    name: String,
    scopes: Vec<TenantScope>,
}

#[api_v2_operation(tags(OrgSettings), description = "Create a new IAM role for the tenant.")]
#[post("/org/roles")]
async fn post(
    state: web::Data<State>,
    request: web::Json<CreateTenantRoleRequest>,
    auth: TenantUserAuthContext,
) -> JsonApiResponse<api_wire_types::OrganizationRole> {
    let auth = auth.check_guard(TenantGuard::OrgSettings)?;
    let tenant = auth.tenant();

    let tenant_id = tenant.id.clone();
    let CreateTenantRoleRequest { name, scopes } = request.into_inner();
    let result = state
        .db_pool
        .db_query(move |conn| TenantRole::create(conn, tenant_id, name, scopes, false))
        .await??;

    let result = api_wire_types::OrganizationRole::from_db(result);
    ResponseData::ok(result).json()
}

#[derive(Debug, serde::Deserialize, Apiv2Schema)]
struct UpdateTenantRoleRequest {
    name: Option<String>,
    scopes: Option<Vec<TenantScope>>,
}

#[api_v2_operation(tags(OrgSettings), description = "Updates the provided IAM role.")]
#[patch("/org/roles/{tenant_role_id}")]
async fn patch(
    state: web::Data<State>,
    request: web::Json<UpdateTenantRoleRequest>,
    role_id: web::Path<TenantRoleId>,
    auth: TenantUserAuthContext,
) -> JsonApiResponse<api_wire_types::OrganizationRole> {
    let auth = auth.check_guard(TenantGuard::OrgSettings)?;
    let tenant = auth.tenant();

    let tenant_id = tenant.id.clone();
    let UpdateTenantRoleRequest { name, scopes } = request.into_inner();
    let result = state
        .db_pool
        .db_transaction(move |conn| TenantRole::update(conn, &tenant_id, &role_id, name, scopes))
        .await?;

    let result = api_wire_types::OrganizationRole::from_db(result);
    ResponseData::ok(result).json()
}

#[api_v2_operation(tags(OrgSettings), description = "Deactivates the provided IAM role.")]
#[post("/org/roles/{tenant_role_id}/deactivate")]
async fn deactivate(
    state: web::Data<State>,
    role_id: web::Path<TenantRoleId>,
    auth: TenantUserAuthContext,
) -> JsonApiResponse<api_wire_types::OrganizationRole> {
    let auth = auth.check_guard(TenantGuard::OrgSettings)?;
    let tenant = auth.tenant();
    let tenant_id = tenant.id.clone();

    let result = state
        .db_pool
        .db_transaction(move |conn| TenantRole::deactivate(conn, &role_id, &tenant_id))
        .await?;

    let result = api_wire_types::OrganizationRole::from_db(result);
    ResponseData::ok(result).json()
}
