use crate::auth::tenant::{
    CheckTenantGuard,
    TenantGuard,
};
use crate::utils::db2api::DbToApi;
use crate::State;
use api_core::auth::tenant::SecretTenantAuthContext;
use api_core::errors::ApiResult;
use api_core::types::{
    OffsetPaginatedResponse,
    OffsetPaginationRequest,
};
use api_core::utils::fp_id_path::FpIdPath;
use api_core::ModernApiResult;
use db::models::auth_event::AuthEvent;
use db::models::scoped_vault::ScopedVault;
use db::OffsetPagination;
use newtypes::PreviewApi;
use paperclip::actix::web::Json;
use paperclip::actix::{
    api_v2_operation,
    get,
    web,
};

#[api_v2_operation(description = "View a user's recent device insights", tags(Users, Preview))]
#[get("/users/{fp_id}/auth_events")]
pub async fn get(
    state: web::Data<State>,
    request: FpIdPath,
    auth: SecretTenantAuthContext,
    pagination: web::Query<OffsetPaginationRequest>,
) -> ModernApiResult<Json<OffsetPaginatedResponse<api_wire_types::PublicAuthEvent>>> {
    auth.check_preview_guard(PreviewApi::AuthEventsList)?;
    // For now, the only consumer of this is coba to get the IP address from where onboarding occurred
    // We might want to migrate them to a /cip_metadata endpoint
    let auth = auth.check_guard(TenantGuard::Read)?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let fp_id = request.into_inner();
    let page = pagination.page;
    let page_size = pagination.page_size(&state);
    let pagination = OffsetPagination::new(page, page_size);

    let (events, next_page, count) = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let sv = ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?;
            let (events, next_page) = AuthEvent::list(conn, &sv.id, Some(pagination))?;
            let count = AuthEvent::count(conn, &sv.id)?;
            Ok((events, next_page, count))
        })
        .await?;

    let results = events
        .into_iter()
        .map(api_wire_types::PublicAuthEvent::from_db)
        .collect::<Vec<_>>();
    Ok(Json(OffsetPaginatedResponse::ok(results, next_page, count)))
}
