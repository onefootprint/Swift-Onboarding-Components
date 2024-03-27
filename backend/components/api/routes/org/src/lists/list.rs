use std::collections::HashMap;

use crate::{
    auth::tenant::{CheckTenantGuard, TenantGuard, TenantSessionAuth},
    errors::ApiResult,
    types::ResponseData,
    utils::db2api::DbToApi,
    State,
};
use db::models::{list::List, list_entry::ListEntry};
use newtypes::ListId;
use paperclip::actix::{self, api_v2_operation, web, web::Json};

#[api_v2_operation(
    description = "Retrieves all Lists for the Tenant",
    tags(Organization, Private, Lists)
)]
#[actix::get("/org/lists")]
pub async fn list_for_tenant(
    state: web::Data<State>,
    auth: TenantSessionAuth,
) -> ApiResult<Json<ResponseData<Vec<api_wire_types::List>>>> {
    let auth = auth.check_guard(TenantGuard::Read)?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;

    let (lists, entries): (Vec<_>, HashMap<ListId, Vec<ListEntry>>) = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let lists = List::list(conn, &tenant_id, is_live)?;
            let list_ids = lists.iter().map(|list| &list.id).collect::<Vec<_>>();
            let entries = ListEntry::list_bulk(conn, list_ids)?;
            Ok((lists, entries))
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
    ResponseData::ok(db_lists).json()
}
