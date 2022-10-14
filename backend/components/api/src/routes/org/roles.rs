use crate::auth::tenant::CheckTenantPermissions;
use crate::auth::tenant::WorkOsAuthContext;

use crate::errors::ApiResult;
use crate::types::EmptyRequest;
use crate::types::JsonApiResponse;
use crate::types::PaginatedRequest;
use crate::types::PaginatedResponseData;
use crate::types::ResponseData;
use crate::utils::db2api::DbToApi;
use crate::State;
use chrono::{DateTime, Utc};
use db::models::tenant_role::TenantRole;
use newtypes::{TenantPermission, TenantRoleId};
use paperclip::actix::Apiv2Schema;
use paperclip::actix::{api_v2_operation, get, patch, post, web, web::Json};

type RolesResponse = Json<PaginatedResponseData<Vec<api_wire_types::OrganizationRole>, DateTime<Utc>>>;

#[api_v2_operation(tags(Private), description = "Returns a list of IAM roles for the tenant.")]
#[get("/org/roles")]
async fn get(
    state: web::Data<State>,
    request: web::Query<PaginatedRequest<EmptyRequest, DateTime<Utc>>>,
    auth: WorkOsAuthContext,
) -> ApiResult<RolesResponse> {
    let auth = auth.check_permissions(vec![TenantPermission::OrgSettings])?;
    let tenant = auth.tenant();
    let cursor = request.cursor;
    let page_size = request.page_size(&state);

    let tenant_id = tenant.id.clone();
    let results = state
        .db_pool
        .db_query(move |conn| TenantRole::list_active(conn, &tenant_id, cursor, (page_size + 1) as i64))
        .await??;

    let cursor = request.cursor_item(&state, &results).map(|x| x.created_at);
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
    permissions: Vec<TenantPermission>,
}

#[api_v2_operation(tags(Private), description = "Create a new IAM role for the tenant.")]
#[post("/org/roles")]
async fn post(
    state: web::Data<State>,
    request: web::Json<CreateTenantRoleRequest>,
    auth: WorkOsAuthContext,
) -> JsonApiResponse<api_wire_types::OrganizationRole> {
    let auth = auth.check_permissions(vec![TenantPermission::Admin])?;
    let tenant = auth.tenant();

    let tenant_id = tenant.id.clone();
    let CreateTenantRoleRequest { name, permissions } = request.into_inner();
    let result = state
        .db_pool
        .db_query(move |conn| TenantRole::create(conn, tenant_id, name, permissions))
        .await??;

    let result = api_wire_types::OrganizationRole::from_db(result);
    ResponseData::ok(result).json()
}

#[derive(Debug, serde::Deserialize, Apiv2Schema)]
struct UpdateTenantRoleRequest {
    name: Option<String>,
    permissions: Option<Vec<TenantPermission>>,
}

#[api_v2_operation(tags(Private), description = "Updates the provided role.")]
#[patch("/org/roles/{tenant_role_id}")]
async fn patch(
    state: web::Data<State>,
    request: web::Json<UpdateTenantRoleRequest>,
    role_id: web::Path<TenantRoleId>,
    auth: WorkOsAuthContext,
) -> JsonApiResponse<api_wire_types::OrganizationRole> {
    let auth = auth.check_permissions(vec![TenantPermission::Admin])?;
    let tenant = auth.tenant();

    let tenant_id = tenant.id.clone();
    let UpdateTenantRoleRequest { name, permissions } = request.into_inner();
    let permissions = permissions.map(|p| p.into());
    let result = state
        .db_pool
        .db_transaction(move |conn| TenantRole::update(conn, &tenant_id, &role_id, name, permissions))
        .await?;

    let result = api_wire_types::OrganizationRole::from_db(result);
    ResponseData::ok(result).json()
}

#[api_v2_operation(tags(Private), description = "Deactivates the provided role.")]
#[post("/org/roles/{tenant_role_id}/deactivate")]
async fn deactivate(
    state: web::Data<State>,
    role_id: web::Path<TenantRoleId>,
    auth: WorkOsAuthContext,
) -> JsonApiResponse<api_wire_types::OrganizationRole> {
    let auth = auth.check_permissions(vec![TenantPermission::Admin])?;
    let tenant = auth.tenant();
    let tenant_id = tenant.id.clone();

    let result = state
        .db_pool
        .db_transaction(move |conn| TenantRole::deactivate(conn, &role_id, &tenant_id))
        .await?;

    let result = api_wire_types::OrganizationRole::from_db(result);
    ResponseData::ok(result).json()
}

impl DbToApi<TenantRole> for api_wire_types::OrganizationRole {
    fn from_db(target: TenantRole) -> Self {
        let TenantRole {
            id,
            name,
            permissions,
            created_at,
            ..
        } = target;
        Self {
            id,
            name,
            permissions,
            created_at,
        }
    }
}
