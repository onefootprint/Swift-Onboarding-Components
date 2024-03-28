use crate::{
    auth::tenant::{CheckTenantGuard, TenantGuard, TenantSessionAuth},
    errors::ApiResult,
    types::ResponseData,
    State,
};
use api_core::types::EmptyResponse;
use db::models::{list::List, list_entry::ListEntry};
use newtypes::{ListEntryId, ListId};
use paperclip::actix::{self, api_v2_operation, web, web::Json};

#[api_v2_operation(description = "Delete the List", tags(Organization, Private, Lists))]
#[actix::delete("/org/lists/{list_id}/entries/{list_entry_id}")]
pub async fn deactivate_list_entry(
    state: web::Data<State>,
    auth: TenantSessionAuth,
    ids: web::Path<(ListId, ListEntryId)>,
) -> ApiResult<Json<ResponseData<EmptyResponse>>> {
    let auth = auth.check_guard(TenantGuard::WriteLists)?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let (list_id, list_entry_id) = ids.into_inner();

    state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            List::get(conn, &tenant_id, is_live, &list_id)?;
            let list_entry = ListEntry::lock(conn, &list_entry_id)?;
            ListEntry::deactivate(conn, list_entry)?;
            Ok(())
        })
        .await?;

    EmptyResponse::ok().json()
}
