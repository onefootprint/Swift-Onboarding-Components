use crate::{
    auth::tenant::{CheckTenantGuard, TenantGuard, TenantSessionAuth},
    errors::ApiResult,
    types::ResponseData,
    utils::db2api::DbToApi,
    State,
};

use db::models::{
    list::List, list_entry::ListEntry, ob_configuration::ObConfiguration, rule_instance::RuleInstance,
};
use itertools::Itertools;
use newtypes::{ListId, VaultOperation};
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

    let (list, entries_count, all_rules) = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let list = List::get(conn, &tenant_id, is_live, &list_id)?;
            let entries = ListEntry::list(conn, &list_id)?;
            let all_rules = RuleInstance::list_by_playbook(conn, &tenant_id, is_live)?;
            Ok((list, entries.len(), all_rules))
        })
        .await?;

    let playbooks = get_rules_using_list(&all_rules, &list.id);
    ResponseData::ok(api_wire_types::List::from_db((list, playbooks, entries_count))).json()
}

// Take a list of all playbooks/rules and return a list only containing playbooks/rules that use the given list in some condition
pub fn get_rules_using_list(
    all_rules: &[(ObConfiguration, Vec<RuleInstance>)],
    list_id: &ListId,
) -> Vec<(ObConfiguration, Vec<RuleInstance>)> {
    all_rules
        .iter()
        .map(|(obc, rules)| {
            (
                obc.clone(),
                rules
                    .iter()
                    .filter(|r| {
                        r.rule_expression.0.iter().any(|re| match re {
                            newtypes::RuleExpressionCondition::VaultData(VaultOperation::IsIn {
                                field: _,
                                op: _,
                                value,
                            }) => value == list_id,
                            _ => false,
                        })
                    }).cloned()
                    .collect_vec(),
            )
        }).filter(|(_, rules)| !rules.is_empty()) // only keep playbooks that have at least 1 rule using the blocklist
        .collect()
}
