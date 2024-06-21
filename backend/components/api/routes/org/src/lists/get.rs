use api_core::auth::tenant::CheckTenantGuard;
use api_core::auth::tenant::TenantGuard;
use api_core::auth::tenant::TenantSessionAuth;
use api_core::types::ModernApiResult;
use api_core::utils::db2api::DbToApi;
use api_core::FpResult;
use api_core::State;
use db::models::list::List;
use db::models::rule_instance::RuleInstance;
use newtypes::ListId;
use paperclip::actix::api_v2_operation;
use paperclip::actix::get;
use paperclip::actix::web;

#[api_v2_operation(tags(Lists, Organization, Private), description = "Returns a blocklist.")]
#[get("/org/lists/{list_id}")]
async fn get_detail(
    state: web::Data<State>,
    list_id: web::Path<ListId>,
    auth: TenantSessionAuth,
) -> ModernApiResult<api_wire_types::ListDetails> {
    let auth = auth.check_guard(TenantGuard::Read)?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;

    let (list, rules_using_list) = state
        .db_pool
        .db_query(move |conn| -> FpResult<_> {
            let list = List::get(conn, &tenant_id, is_live, &list_id)?;
            let rules_using_list = RuleInstance::list_using_list(conn, &list.id)?;
            Ok((list, rules_using_list))
        })
        .await?;

    Ok(api_wire_types::ListDetails::from_db((list, rules_using_list)))
}
