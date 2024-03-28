use crate::{
    auth::tenant::{CheckTenantGuard, TenantGuard, TenantSessionAuth},
    errors::ApiResult,
    types::ResponseData,
    utils::db2api::DbToApi,
    State,
};

use db::models::{list::List, list_entry::ListEntry};
use newtypes::ListId;
use paperclip::actix::{api_v2_operation, get, web, web::Json};

#[api_v2_operation(tags(Playbooks, Organization, Private), description = "Returns a blocklist.")]
#[get("/org/lists/{id}")]
async fn get_detail(
    state: web::Data<State>,
    list_id: web::Path<ListId>,
    auth: TenantSessionAuth,
) -> ApiResult<Json<ResponseData<api_wire_types::List>>> {
    let auth = auth.check_guard(TenantGuard::Read)?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;

    let (list, entries_count) = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let list = List::get(conn, &tenant_id, is_live, &list_id)?;
            let entries = ListEntry::list(conn, &list_id)?;
            Ok((list, entries.len()))
        })
        .await?;

    // TODO (belce): implement the logic to get whether list is used in playbook
    ResponseData::ok(api_wire_types::List::from_db((list, false, entries_count))).json()
}
