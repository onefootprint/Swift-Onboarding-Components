use std::collections::HashSet;

use crate::{
    auth::tenant::{CheckTenantGuard, TenantGuard, TenantSessionAuth},
    errors::ApiResult,
    types::ResponseData,
    utils::db2api::DbToApi,
    State,
};
use api_core::{decision::rule_engine::validation::validate_rule_expression, errors::ValidationError};
use api_wire_types::{MultiUpdateRuleRequest, UpdateRuleRequest};
use db::{
    models::{
        list::List,
        ob_configuration::ObConfiguration,
        rule_instance::{MultiRuleUpdate, NewRule, RuleInstance, RuleInstanceUpdate},
    },
    PgConn,
};
use itertools::{chain, Itertools};
use newtypes::{ListId, ObConfigurationId, RuleId, TenantId};
use paperclip::actix::{self, api_v2_operation, web, web::Json};

/// Note: Being deprecated in favor of bulk edit API
#[api_v2_operation(description = "Updates a Rule", tags(Playbooks, Organization, Private, Rules))]
#[actix::patch("/org/onboarding_configs/{obc_id}/rules/{rule_id}")]
pub async fn update_rule(
    state: web::Data<State>,
    auth: TenantSessionAuth,
    path: web::Path<(ObConfigurationId, RuleId)>,
    request: Json<UpdateRuleRequest>,
) -> ApiResult<Json<ResponseData<api_wire_types::Rule>>> {
    let auth = auth.check_guard(TenantGuard::OnboardingConfiguration)?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let actor = auth.actor();

    let (ob_config_id, rule_id) = path.into_inner();
    let UpdateRuleRequest {
        name,
        rule_expression,
        is_shadow,
    } = request.into_inner();

    if name.is_none() && rule_expression.is_none() && is_shadow.is_none() {
        return Err(ValidationError("No field given to update").into());
    }

    let rule = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let rule_expression = rule_expression
                .map(|expr| -> ApiResult<_> {
                    let list_ids = expr.list_ids();
                    let lists = List::bulk_get(conn, &tenant_id, is_live, &list_ids)?;
                    validate_rule_expression(expr, &lists, is_live)
                })
                .transpose()?;

            let (obc, _) = ObConfiguration::get(conn, (&ob_config_id, &tenant_id, is_live))?;
            let obc = ObConfiguration::lock(conn, &obc.id)?;

            Ok(RuleInstance::update(
                conn,
                &obc,
                &actor.into(),
                RuleInstanceUpdate::update(rule_id, name, rule_expression, is_shadow),
            )?)
        })
        .await?;

    ResponseData::ok(api_wire_types::Rule::from_db(rule)).json()
}


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
) -> ApiResult<Json<ResponseData<Vec<api_wire_types::Rule>>>> {
    let auth = auth.check_guard(TenantGuard::OnboardingConfiguration)?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let actor = auth.actor();

    let obc_id = path.into_inner();
    let req = request.into_inner();

    let rules = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let update = validate_request(conn, &tenant_id, is_live, req)?;

            let (obc, _) = ObConfiguration::get(conn, (&obc_id, &tenant_id, is_live))?;
            let obc = ObConfiguration::lock(conn, &obc.id)?;

            RuleInstance::bulk_edit(conn, &obc, &actor.into(), update)?;
            // retrieve and return full latest list of Rules for FE for convenience
            Ok(RuleInstance::list(conn, &tenant_id, is_live, &obc.id)?)
        })
        .await?;

    ResponseData::ok(rules.into_iter().map(api_wire_types::Rule::from_db).collect_vec()).json()
}


fn validate_request(
    conn: &mut PgConn,
    tenant_id: &TenantId,
    is_live: bool,
    req: MultiUpdateRuleRequest,
) -> ApiResult<MultiRuleUpdate> {
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
        .map(|a| -> ApiResult<_> {
            let rule_expression = validate_rule_expression(a.rule_expression, &lists, is_live)?;
            Ok(NewRule {
                rule_expression,
                action: a.rule_action,
                name: None, // TODO: we dont actaully use name yet so remove this
            })
        })
        .collect::<ApiResult<Vec<_>>>()?;

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
            let rule_expression = validate_rule_expression(e.rule_expression, &lists, is_live)?;
            Ok(RuleInstanceUpdate::update(
                e.rule_id,
                None,
                Some(rule_expression.clone()),
                None,
            ))
        })
        .collect::<ApiResult<Vec<_>>>()?;

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
