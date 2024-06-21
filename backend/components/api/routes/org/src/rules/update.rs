use api_core::auth::tenant::CheckTenantGuard;
use api_core::auth::tenant::TenantGuard;
use api_core::auth::tenant::TenantSessionAuth;
use api_core::decision::rule_engine::validation::validate_rule_expression;
use api_core::errors::ValidationError;
use api_core::types::JsonApiListResponse;
use api_core::utils::db2api::DbToApi;
use api_core::FpResult;
use api_core::State;
use api_wire_types::MultiUpdateRuleRequest;
use db::models::list::List;
use db::models::ob_configuration::ObConfiguration;
use db::models::rule_instance::IncludeRules;
use db::models::rule_instance::MultiRuleUpdate;
use db::models::rule_instance::NewRule;
use db::models::rule_instance::RuleInstance;
use db::models::rule_instance::RuleInstanceUpdate;
use db::PgConn;
use itertools::chain;
use itertools::Itertools;
use newtypes::ListId;
use newtypes::ObConfigurationId;
use newtypes::ObConfigurationKind;
use newtypes::RuleInstanceKind;
use newtypes::TenantId;
use paperclip::actix::api_v2_operation;
use paperclip::actix::web;
use paperclip::actix::web::Json;
use paperclip::actix::{
    self,
};
use std::collections::HashSet;

#[api_v2_operation(
    description = "Performs 1 or more edits (additions, deletions, edits) to rules for the playbooks",
    tags(Playbooks, Organization, Private, Rules)
)]
#[actix::patch("/org/onboarding_configs/{obc_id}/rules")]
pub async fn multi_update_rules(
    state: web::Data<State>,
    auth: TenantSessionAuth,
    path: web::Path<ObConfigurationId>,
    request: Json<MultiUpdateRuleRequest>,
) -> JsonApiListResponse<api_wire_types::Rule> {
    let auth = auth.check_guard(TenantGuard::OnboardingConfiguration)?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let actor = auth.actor();

    let obc_id = path.into_inner();
    let req = request.into_inner();

    let rules = state
        .db_pool
        .db_transaction(move |conn| -> FpResult<_> {
            let update = validate_rules_request(conn, &tenant_id, is_live, req)?;

            let (obc, _) = ObConfiguration::get(conn, (&obc_id, &tenant_id, is_live))?;
            let obc = ObConfiguration::lock(conn, &obc.id)?;

            RuleInstance::bulk_edit(conn, &obc, &actor.into(), update)?;
            // retrieve and return full latest list of Rules for FE for convenience
            let rules = RuleInstance::list(conn, &tenant_id, is_live, &obc.id, IncludeRules::All)?;

            // Make sure we're not removing all rules, unless this is a document-only playbook
            let is_pb_allowed_to_have_no_rules = obc.kind == ObConfigurationKind::Document;
            if rules.is_empty() && !is_pb_allowed_to_have_no_rules {
                return Err(ValidationError("Proceeding would remove all rules on your playbook").into());
            }

            let should_pb_have_no_rules = obc.kind == ObConfigurationKind::Kyb && obc.skip_kyb;
            if should_pb_have_no_rules && rules.iter().any(|r| matches!(r.kind, RuleInstanceKind::Business)) {
                return Err(ValidationError(
                    "Cannot add Business related rules to a playbook that is skipping running KYB",
                )
                .into());
            }
            Ok(rules)
        })
        .await?;

    Ok(rules.into_iter().map(api_wire_types::Rule::from_db).collect())
}

pub(crate) fn validate_rules_request(
    conn: &mut PgConn,
    tenant_id: &TenantId,
    is_live: bool,
    req: MultiUpdateRuleRequest,
) -> FpResult<MultiRuleUpdate> {
    let MultiUpdateRuleRequest {
        expected_rule_set_version,
        add,
        edit,
        delete,
    } = req;

    let list_ids: Vec<ListId> = chain(
        add.iter()
            .flatten()
            .flat_map(|rule| rule.rule_expression.list_ids()),
        edit.iter()
            .flatten()
            .flat_map(|rule| rule.rule_expression.list_ids()),
    )
    .collect();
    let lists = List::bulk_get(conn, tenant_id, is_live, &list_ids)?;

    let new_rules = add
        .unwrap_or_default()
        .into_iter()
        .map(|r| -> FpResult<_> {
            let (rule_expression, rule_instance_kind) =
                validate_rule_expression(r.rule_expression, &lists, is_live)?;
            Ok(NewRule {
                rule_expression,
                kind: rule_instance_kind,
                action: r.rule_action,
                name: r.name,
                is_shadow: r.is_shadow,
            })
        })
        .collect::<FpResult<Vec<_>>>()?;

    // check that the same rule isn't being edited and deleted
    let edit_rule_ids: HashSet<_> = edit
        .as_ref()
        .map(|v| v.iter().map(|e| e.rule_id.clone()).collect())
        .unwrap_or_default();
    let delete_rule_ids: HashSet<_> = delete
        .as_ref()
        .map(|v| v.iter().cloned().collect())
        .unwrap_or_default();
    let overlap = edit_rule_ids.intersection(&delete_rule_ids).collect_vec();
    if !overlap.is_empty()
        || edit_rule_ids.len() != edit.as_ref().map(|e| e.len()).unwrap_or(0)
        || delete_rule_ids.len() != delete.as_ref().map(|e| e.len()).unwrap_or(0)
    {
        return Err(ValidationError("Cannot perform multiple edits on the same rule").into());
    }

    let edit_updates = edit
        .unwrap_or_default()
        .into_iter()
        .map(|e| {
            let (rule_expression, kind) = validate_rule_expression(e.rule_expression, &lists, is_live)?;
            Ok(RuleInstanceUpdate::update(
                e.rule_id,
                None,
                Some(rule_expression.clone()),
                None,
                Some(kind),
            ))
        })
        .collect::<FpResult<Vec<_>>>()?;

    let delete_updates = delete
        .unwrap_or_default()
        .into_iter()
        .map(RuleInstanceUpdate::delete)
        .collect_vec();

    let all_updates = edit_updates.into_iter().chain(delete_updates).collect_vec();

    if new_rules.is_empty() && all_updates.is_empty() {
        return Err(ValidationError("At least one update must be provided").into());
    }

    Ok(MultiRuleUpdate {
        expected_rule_set_version: Some(expected_rule_set_version),
        new_rules,
        updates: all_updates,
    })
}
