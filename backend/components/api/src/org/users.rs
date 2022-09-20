use crate::auth::CheckTenantPermissions;
use crate::auth::WorkOsAuth;
use crate::errors::ApiError;
use crate::types::tenant_user::FpTenantUser;
use crate::types::EmptyRequest;
use crate::types::EmptyResponse;
use crate::types::JsonApiResponse;
use crate::types::PaginatedRequest;
use crate::types::PaginatedResponseData;
use crate::State;
use chrono::{DateTime, Utc};
use db::models::tenant_user::TenantUser;
use newtypes::TenantPermission;
use newtypes::TenantRoleId;
use newtypes::TenantUserId;
use paperclip::actix::Apiv2Schema;
use paperclip::actix::{api_v2_operation, get, patch, web, web::Json};

#[api_v2_operation(
    summary = "/org/users",
    operation_id = "org-users",
    tags(Private),
    description = "Returns a list of dashboard users for the tenant."
)]
#[get("/users")]
async fn get(
    state: web::Data<State>,
    request: web::Query<PaginatedRequest<EmptyRequest, DateTime<Utc>>>,
    auth: WorkOsAuth,
) -> actix_web::Result<Json<PaginatedResponseData<Vec<FpTenantUser>, DateTime<Utc>>>, ApiError> {
    let auth = auth.check_permissions(vec![TenantPermission::OrgSettings])?;
    let tenant = auth.tenant();
    let cursor = request.cursor;
    let page_size = request.page_size(&state);

    let tenant_id = tenant.id.clone();
    let results = state
        .db_pool
        .db_query(move |conn| TenantUser::list(conn, &tenant_id, cursor, (page_size + 1) as i64))
        .await??;

    let cursor = request.cursor_item(&state, &results).map(|x| x.0.created_at);
    let results = results
        .into_iter()
        .take(page_size)
        .map(FpTenantUser::from)
        .collect::<Vec<FpTenantUser>>();
    Ok(Json(PaginatedResponseData::ok(results, cursor, None)))
}

#[derive(Debug, serde::Deserialize, Apiv2Schema)]
struct UpdateTenantUserRequest {
    role_id: Option<TenantRoleId>,
    // TODO add status
}

#[api_v2_operation(
    summary = "/org/users",
    operation_id = "org-users-patch",
    tags(Private),
    description = "Updates the provided user."
)]
#[patch("/users/{tenant_user_id}")]
async fn patch(
    state: web::Data<State>,
    request: web::Json<UpdateTenantUserRequest>,
    user_id: web::Path<TenantUserId>,
    auth: WorkOsAuth,
) -> JsonApiResponse<EmptyResponse> {
    let auth = auth.check_permissions(vec![TenantPermission::Admin])?;
    let tenant = auth.tenant();

    let tenant_id = tenant.id.clone();
    let UpdateTenantUserRequest { role_id } = request.into_inner();
    state
        .db_pool
        .db_transaction(move |conn| TenantUser::update(conn, &tenant_id, &user_id, role_id))
        .await?;

    EmptyResponse::ok().json()
}
