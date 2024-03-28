use crate::{
    auth::tenant::{CheckTenantGuard, TenantGuard, TenantSessionAuth},
    errors::ApiResult,
    utils::db2api::DbToApi,
    State,
};
use api_core::types::{OffsetPaginatedResponse, OffsetPaginationRequest};
use db::{
    models::{list::List, list_entry::ListEntry},
    OffsetPagination,
};
use paperclip::actix::{self, api_v2_operation, web, web::Json};

#[api_v2_operation(
    description = "Retrieves all Lists for the Tenant",
    tags(Organization, Private, Lists)
)]
#[actix::get("/org/lists")]
pub async fn list_for_tenant(
    state: web::Data<State>,
    auth: TenantSessionAuth,
    pagination: web::Query<OffsetPaginationRequest>,
) -> ApiResult<Json<OffsetPaginatedResponse<api_wire_types::List>>> {
    let auth = auth.check_guard(TenantGuard::Read)?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let page = pagination.page;
    let page_size = pagination.page_size(&state);
    let pagination = OffsetPagination::new(page, page_size);

    let (lists, next_page, count, entries) = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let (lists, next_page) = List::list(conn, &tenant_id, is_live, pagination)?;
            let count = List::count(conn, &tenant_id, is_live)?;
            let list_ids = lists.iter().map(|list| &list.id).collect::<Vec<_>>();
            let entries = ListEntry::list_bulk(conn, list_ids)?;
            Ok((lists, next_page, count, entries))
        })
        .await?;

    let db_lists = lists
        .into_iter()
        .map(|l| {
            let id = l.id.clone();
            (l, false, entries.get(&id).map(|e| e.len()).unwrap_or_default())
        })
        .map(api_wire_types::List::from_db)
        .collect();
    Ok(Json(OffsetPaginatedResponse::ok(db_lists, next_page, count)))
}
