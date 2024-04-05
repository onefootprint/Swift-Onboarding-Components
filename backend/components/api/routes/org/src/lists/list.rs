use crate::{
    auth::tenant::{CheckTenantGuard, TenantGuard, TenantSessionAuth},
    errors::ApiResult,
    utils::db2api::DbToApi,
    State,
};
use api_core::types::{OffsetPaginatedResponse, OffsetPaginationRequest};
use db::{
    models::{list::List, list_entry::ListEntry, rule_instance::RuleInstance},
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

    let (lists, next_page, count, entries, list_ids_used_in_playbook) = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let (lists, next_page) = List::list(conn, &tenant_id, is_live, pagination)?;
            let count = List::count(conn, &tenant_id, is_live)?;
            let list_ids = lists.iter().map(|list| list.id.clone()).collect::<Vec<_>>();
            let list_ids_used_in_playbook = RuleInstance::get_is_used_in_some_playbook(conn, &list_ids)?;
            let entries = ListEntry::list_bulk(conn, &list_ids)?;
            Ok((lists, next_page, count, entries, list_ids_used_in_playbook))
        })
        .await?;

    let db_lists = lists
        .into_iter()
        .map(|l| {
            let id = l.id.clone();
            (
                l,
                entries.get(&id).map(|(_, e)| e.len()).unwrap_or_default(),
                list_ids_used_in_playbook.contains(&id),
            )
        })
        .map(api_wire_types::List::from_db)
        .collect();
    Ok(Json(OffsetPaginatedResponse::ok(db_lists, next_page, count)))
}
