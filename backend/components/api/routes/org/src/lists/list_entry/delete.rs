use api_core::auth::tenant::{
    CheckTenantGuard,
    TenantGuard,
    TenantSessionAuth,
};
use api_core::errors::ApiResult;
use api_core::types::ModernApiResult;
use api_core::utils::headers::InsightHeaders;
use api_core::State;
use db::models::insight_event::CreateInsightEvent;
use db::models::list::List;
use db::models::list_entry::ListEntry;
use newtypes::{
    ListEntryId,
    ListId,
};
use paperclip::actix::{
    self,
    api_v2_operation,
    web,
};

#[api_v2_operation(description = "Delete the List", tags(Lists, Organization, Private))]
#[actix::delete("/org/lists/{list_id}/entries/{list_entry_id}")]
pub async fn deactivate_list_entry(
    state: web::Data<State>,
    auth: TenantSessionAuth,
    ids: web::Path<(ListId, ListEntryId)>,
    insights: InsightHeaders,
) -> ModernApiResult<api_wire_types::Empty> {
    let auth = auth.check_guard(TenantGuard::WriteLists)?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let (list_id, list_entry_id) = ids.into_inner();
    let actor = auth.actor();

    let insight = CreateInsightEvent::from(insights);
    state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            List::get(conn, &tenant_id, is_live, &list_id)?;
            let list_entry = ListEntry::lock(conn, &list_entry_id)?;
            let ie = insight.insert_with_conn(conn)?;
            ListEntry::deactivate(conn, list_entry, &actor.into(), &tenant_id, is_live, &ie.id)?;
            Ok(())
        })
        .await?;

    Ok(api_wire_types::Empty)
}
