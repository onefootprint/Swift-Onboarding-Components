use crate::auth::CheckTenantPermissions;
use crate::auth::WorkOsAuth;
use crate::errors::ApiError;
use crate::types::tenant_role::FpTenantRole;
use crate::types::EmptyRequest;
use crate::types::PaginatedRequest;
use crate::types::PaginatedResponseData;
use crate::State;
use chrono::{DateTime, Utc};
use db::models::tenant_role::TenantRole;
use newtypes::TenantPermission;
use paperclip::actix::{api_v2_operation, get, web, web::Json};

#[api_v2_operation(
    summary = "/org/roles",
    operation_id = "org-roles",
    tags(Private),
    description = "Returns a list of dashboard roles for the tenant."
)]
#[get("/roles")]
async fn get(
    state: web::Data<State>,
    request: web::Query<PaginatedRequest<EmptyRequest, DateTime<Utc>>>,
    auth: WorkOsAuth,
) -> actix_web::Result<Json<PaginatedResponseData<Vec<FpTenantRole>, DateTime<Utc>>>, ApiError> {
    let auth = auth.check_permissions(vec![TenantPermission::OrgSettings])?;
    let tenant = auth.tenant();
    let cursor = request.cursor;
    let page_size = request.page_size(&state);

    let tenant_id = tenant.id.clone();
    let results = state
        .db_pool
        .db_query(move |conn| TenantRole::list(conn, &tenant_id, cursor, (page_size + 1) as i64))
        .await??;

    let cursor = request.cursor_item(&state, &results).map(|x| x.created_at);
    let results = results
        .into_iter()
        .take(page_size)
        .map(FpTenantRole::from)
        .collect::<Vec<FpTenantRole>>();
    Ok(Json(PaginatedResponseData::ok(results, cursor, None)))
}
