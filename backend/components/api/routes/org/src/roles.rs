use crate::auth::tenant::CheckTenantGuard;
use crate::auth::tenant::TenantGuard;
use crate::auth::tenant::TenantSessionAuth;
use crate::errors::ApiResult;
use crate::types::JsonApiResponse;
use crate::types::OffsetPaginatedResponse;
use crate::types::OffsetPaginationRequest;
use crate::types::ResponseData;
use crate::utils::db2api::DbToApi;
use crate::State;
use api_wire_types::OrgRoleFilters;
use db::models::tenant_role::TenantRole;
use db::models::tenant_role::TenantRoleListFilters;
use db::OffsetPagination;
use newtypes::TenantRoleId;
use newtypes::TenantRoleKind;
use newtypes::TenantScope;
use paperclip::actix::Apiv2Schema;
use paperclip::actix::{api_v2_operation, get, patch, post, web, web::Json};

type RolesResponse = Json<OffsetPaginatedResponse<api_wire_types::OrganizationRole>>;

#[api_v2_operation(
    tags(OrgSettings, Private),
    description = "Returns a list of IAM roles for the tenant."
)]
#[get("/org/roles")]
async fn get(
    state: web::Data<State>,
    filters: web::Query<OrgRoleFilters>,
    pagination: web::Query<OffsetPaginationRequest>,
    auth: TenantSessionAuth,
) -> ApiResult<RolesResponse> {
    let auth = auth.check_guard(TenantGuard::Read)?;
    let tenant = auth.tenant();

    let page = pagination.page;
    let page_size = pagination.page_size(&state);
    let OrgRoleFilters { search, kind } = filters.into_inner();

    let tenant_id = tenant.id.clone();
    let (results, next_page, count) = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let filters = TenantRoleListFilters {
                tenant_id: &tenant_id,
                scopes: None,
                search,
                kind,
            };
            let pagination = OffsetPagination::new(page, page_size);
            let (results, next_page) = TenantRole::list_active(conn, &filters, pagination)?;
            let count = TenantRole::count_active(conn, &filters)?;
            Ok((results, next_page, count))
        })
        .await??;

    let results = results
        .into_iter()
        .map(api_wire_types::OrganizationRole::from_db)
        .collect();
    Ok(Json(OffsetPaginatedResponse::ok(results, next_page, count)))
}

#[derive(Debug, serde::Deserialize, Apiv2Schema)]
struct CreateTenantRoleRequest {
    name: String,
    scopes: Vec<TenantScope>,
    kind: Option<TenantRoleKind>,
}

#[api_v2_operation(
    tags(OrgSettings, Private),
    description = "Create a new IAM role for the tenant."
)]
#[post("/org/roles")]
async fn post(
    state: web::Data<State>,
    request: web::Json<CreateTenantRoleRequest>,
    auth: TenantSessionAuth,
) -> JsonApiResponse<api_wire_types::OrganizationRole> {
    let auth = auth.check_guard(TenantGuard::OrgSettings)?;
    let tenant = auth.tenant();

    let tenant_id = tenant.id.clone();
    let CreateTenantRoleRequest { name, scopes, kind } = request.into_inner();
    let result = state
        .db_pool
        .db_query(move |conn| TenantRole::create(conn, tenant_id, name, scopes, false, kind))
        .await??;

    let result = api_wire_types::OrganizationRole::from_db(result);
    ResponseData::ok(result).json()
}

#[derive(Debug, serde::Deserialize, Apiv2Schema)]
struct UpdateTenantRoleRequest {
    name: Option<String>,
    scopes: Option<Vec<TenantScope>>,
}

#[api_v2_operation(tags(OrgSettings, Private), description = "Updates the provided IAM role.")]
#[patch("/org/roles/{tenant_role_id}")]
async fn patch(
    state: web::Data<State>,
    request: web::Json<UpdateTenantRoleRequest>,
    role_id: web::Path<TenantRoleId>,
    auth: TenantSessionAuth,
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

#[api_v2_operation(
    tags(OrgSettings, Private),
    description = "Deactivates the provided IAM role."
)]
#[post("/org/roles/{tenant_role_id}/deactivate")]
async fn deactivate(
    state: web::Data<State>,
    role_id: web::Path<TenantRoleId>,
    auth: TenantSessionAuth,
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
