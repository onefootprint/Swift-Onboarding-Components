use api_core::auth::tenant::CheckTenantGuard;
use api_core::auth::tenant::TenantGuard;
use api_core::auth::tenant::TenantSessionAuth;
use api_core::decision::rule_engine::engine::VaultDataForRules;
use api_core::decision::rule_engine::eval::Rule;
use api_core::decision::rule_engine::eval::RuleEvalConfig;
use api_core::decision::rule_engine::validation::validate_rule_expression;
use api_core::decision::state::common::saturate_list_entries;
use api_core::decision::{
    self,
};
use api_core::errors::ApiResult;
use api_core::errors::AssertionError;
use api_core::types::ModernApiResult;
use api_core::utils::vault_wrapper::Any;
use api_core::utils::vault_wrapper::VaultWrapper;
use api_core::State;
use api_wire_types::EvaluateRuleRequest;
use api_wire_types::RuleEvalResult;
use api_wire_types::RuleEvalStats;
use api_wire_types::RuleResultRuleAction;
use db::models::insight_event::InsightEvent;
use db::models::list::List;
use db::models::list_entry::ListEntry;
use db::models::ob_configuration::ObConfiguration;
use db::models::rule_instance::IncludeRules;
use db::models::rule_instance::RuleInstance;
use db::models::rule_set_result::RuleSetResult;
use db::models::rule_set_result::RuleSetResultSample;
use itertools::chain;
use itertools::Itertools;
use newtypes::ListId;
use newtypes::ObConfigurationId;
use newtypes::RuleAction;
use newtypes::RuleExpression;
use newtypes::RuleId;
use newtypes::RuleInstanceKind;
use paperclip::actix::api_v2_operation;
use paperclip::actix::web;
use paperclip::actix::web::Json;
use paperclip::actix::{
    self,
};
use std::collections::HashMap;

/*
In the ideal case, you are backtesting only on onboardings that have occurred since the last rule edit was made. If that is the case then the results of the backtest are purely a function of the hypothetical edits.
There is nuance when you are backtesting over onboardings that span other subsequent rule edits. There are basically 2 kinds of errors this introduces:
- (1) Backtest Results including diff that *does not* come from the Hypothetical Edits
    - Some onboarding’s backtest result is a function of not only the Hypothetical Edits but also every other rule edit that occurred since the onboarding and now.
    - This even means that you could have 0 changes in your Hypothetical Edits (ie just backtesting the current rule set), and you would see diff in the backtest results.
    - Why does this matter?
        - The user is expecting to gauge what impact their Hypothetical Edits will have but now what they are seeing is some function of other factors. Furthermore, it is not easy to know how much impact those other factors are having.
- (2) Backtest Results *not* including diff from the Hypothetical Edits
    - eg: User onboards, then Rule A is added, and now we are backtesting Deleting Rule A.
        - There is no chance for any diff to come from this user in the backtest. However, Rule A could possibly actually trigger for the user and deleting it would indeed have an impact for that user.
    - eg: Rule A_v1 added, user onboards, now rule edited to Rule A_v2, and now we are backtesting another edit Rule A_v3.
        - If Rule A_v1 and Rule A_v3 evaluate to the same thing, but this is different from what Rule A_v2 evaluates to, then no diff will be shown in the backtest.
    - Why does this matter?
        - The user is expecting to gauge what impact their Hypothetical Edits will have, and there could be changes that are actually very impactful, but now there is some population of onboardings that are “impervious” to these changes just by virtue of the rule not existing or existing in a different from at the time of their onboarding. This can make the edits appear less impactful in the backtest than they actually are.
*/
#[api_v2_operation(
    description = "Evaluates a hypothetical rule against a sample of recent onboardings",
    tags(Playbooks, Organization, Private, Rules)
)]
#[actix::post("/org/onboarding_configs/{obc_id}/rules/evaluate")]
pub async fn evaluate_rule(
    state: web::Data<State>,
    auth: TenantSessionAuth,
    ob_config_id: web::Path<ObConfigurationId>,
    request: Json<EvaluateRuleRequest>,
) -> ModernApiResult<api_wire_types::RuleEvalResults> {
    let auth = auth.check_guard(TenantGuard::OnboardingConfiguration)?; // TODO: new guard for this ?
    let tenant = auth.tenant();
    let tenant_id = tenant.id.clone();
    let is_live = auth.is_live()?;
    let obc_id = ob_config_id.into_inner();

    let EvaluateRuleRequest {
        add,
        edit,
        delete,
        start_timestamp,
        end_timestamp,
    } = request.into_inner();
    let (current_rules, historical_results, adds, edits, lists_with_entries, vws, insight_events) = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let (obc, _) = ObConfiguration::get(conn, (&obc_id, &tenant_id, is_live))?;

            let rules = RuleInstance::list(conn, &tenant_id, is_live, &obc_id, IncludeRules::All)?;
            let samples = RuleSetResult::sample_for_eval(conn, &obc.id, start_timestamp, end_timestamp, 100)?;

            let list_ids: Vec<ListId> = chain!(
                rules.iter().flat_map(|rule| rule.rule_expression.list_ids()),
                add.iter()
                    .flatten()
                    .flat_map(|rule| rule.rule_expression.list_ids()),
                edit.iter()
                    .flatten()
                    .flat_map(|rule| rule.rule_expression.list_ids()),
            )
            .collect();
            let lists = List::bulk_get(conn, &tenant_id, is_live, &list_ids)?;

            let adds: Vec<((RuleExpression, RuleInstanceKind), RuleAction)> = add
                .into_iter()
                .flatten()
                .map(|rule| -> ApiResult<_> {
                    Ok((
                        validate_rule_expression(rule.rule_expression, &lists, is_live)?,
                        rule.rule_action,
                    ))
                })
                .collect::<ApiResult<_>>()?;

            let edits: Vec<(RuleId, (RuleExpression, RuleInstanceKind))> = edit
                .into_iter()
                .flatten()
                .map(|rule| -> ApiResult<_> {
                    Ok((
                        rule.rule_id,
                        validate_rule_expression(rule.rule_expression, &lists, is_live)?,
                    ))
                })
                .collect::<ApiResult<_>>()?;

            let lists_with_entries = ListEntry::list_bulk(conn, &list_ids)?;

            let users = samples
                .iter()
                .map(|sample| (sample.scoped_vault.clone(), sample.vault.clone()))
                .collect_vec();
            let vws = VaultWrapper::<Any>::multi_get_for_tenant(
                conn, users, None, // Get latest vault data.
            )?;

            let insight_events = InsightEvent::get_latest_for_obc(
                conn,
                &obc_id,
                &samples
                    .iter()
                    .map(|sample| sample.scoped_vault.id.clone())
                    .collect_vec(),
            )?;

            Ok((
                rules,
                samples,
                adds,
                edits,
                lists_with_entries,
                vws,
                insight_events,
            ))
        })
        .await?;

    let lists = saturate_list_entries(&state, tenant, lists_with_entries).await?;

    let mut current_rules: HashMap<RuleId, Rule> = current_rules
        .into_iter()
        .map(|r| {
            (
                r.rule_id.clone(),
                Rule {
                    expression: r.rule_expression,
                    action: r.action,
                },
            )
        })
        .collect();

    // For every delete, remove that rule from our current_rules set
    if let Some(delete) = delete {
        for rule_id in delete {
            current_rules
                .remove(&rule_id)
                .ok_or(AssertionError(&format!("Rule not found: {}", rule_id)))?;
        }
    }

    // For every edit, remove that rule from our current_rules set and add a new version with the edit
    let mut edit_rules = vec![];
    for (edit_rule_id, edit_rule_expression) in edits {
        let curr_rule = current_rules
            .remove(&edit_rule_id)
            .ok_or(AssertionError(&format!("Rule not found: {}", edit_rule_id)))?;
        let (expression, _) = edit_rule_expression;

        edit_rules.push(Rule {
            expression,
            action: curr_rule.action,
        });
    }

    // For every add, add that rule to the rules
    let add_rules = adds.into_iter().map(|((rule_expression, _), rule_action)| Rule {
        expression: rule_expression,
        action: rule_action,
    });

    let all_rules = current_rules
        .into_values()
        .chain(edit_rules)
        .chain(add_rules)
        .collect_vec();

    let rule_expressions = all_rules.iter().map(|r| &r.expression).collect_vec();
    let vault_data_by_sv_id =
        VaultDataForRules::bulk_decrypt_for_rules(&state, vws, &rule_expressions).await?;

    let results = historical_results
        .into_iter()
        .map(|sample| {
            let RuleSetResultSample {
                scoped_vault: sv,
                vault: _,
                rule_set_result,
                risk_signals,
            } = sample;

            let frcs = &risk_signals.into_iter().map(|r| r.reason_code).collect_vec();

            let no_insight_events = vec![];
            let sv_insight_events = insight_events.get(&sv.id).unwrap_or(&no_insight_events);

            let no_vault_data = VaultDataForRules::empty();
            let vault_data = vault_data_by_sv_id.get(&sv.id).unwrap_or(&no_vault_data);

            let (_, action_triggered) = decision::rule_engine::eval::evaluate_rule_set(
                all_rules.clone(),
                frcs,
                vault_data,
                sv_insight_events,
                &lists,
                &RuleEvalConfig::default(),
            );

            Ok(api_wire_types::RuleEvalResult {
                fp_id: sv.fp_id,
                current_status: sv.status,
                historical_action_triggered: rule_set_result.action_triggered,
                backtest_action_triggered: action_triggered,
            })
        })
        .collect::<ApiResult<Vec<_>>>()?;

    let stats = get_stats(&results);
    Ok(api_wire_types::RuleEvalResults { results, stats })
}

fn get_stats(results: &[RuleEvalResult]) -> RuleEvalStats {
    let count_by_historical_action_triggered = results
        .iter()
        .map(|r| RuleResultRuleAction::from(r.historical_action_triggered))
        .counts();

    let count_by_backtest_action_triggered = results
        .iter()
        .map(|r| RuleResultRuleAction::from(r.backtest_action_triggered))
        .counts();

    let count_by_historical_and_backtest_action_triggered = results
        .iter()
        .into_group_map_by(|r| RuleResultRuleAction::from(r.historical_action_triggered))
        .into_iter()
        .map(|(historical_action, backtest_actions)| {
            (
                historical_action,
                backtest_actions
                    .iter()
                    .map(|r| RuleResultRuleAction::from(r.backtest_action_triggered))
                    .counts(),
            )
        })
        .collect();

    RuleEvalStats {
        total: results.len(),
        count_by_historical_action_triggered,
        count_by_backtest_action_triggered,
        count_by_historical_and_backtest_action_triggered,
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use newtypes::FpId;
    use newtypes::OnboardingStatus;
    use newtypes::RuleAction;

    #[test]
    fn test_get_stats() {
        let results = vec![
            (
                OnboardingStatus::Pass,
                Some(RuleAction::Fail),
                Some(RuleAction::Fail),
            ),
            (OnboardingStatus::Pass, Some(RuleAction::Fail), None),
            (
                OnboardingStatus::Fail,
                Some(RuleAction::Fail),
                Some(RuleAction::Fail),
            ),
            (OnboardingStatus::Fail, Some(RuleAction::Fail), None),
            (OnboardingStatus::Pass, Some(RuleAction::identity_stepup()), None),
            (OnboardingStatus::Pass, Some(RuleAction::identity_stepup()), None),
            (OnboardingStatus::None, Some(RuleAction::identity_stepup()), None),
            (OnboardingStatus::None, Some(RuleAction::identity_stepup()), None),
            (OnboardingStatus::Pass, None, Some(RuleAction::Fail)),
            (OnboardingStatus::Pass, None, Some(RuleAction::Fail)),
        ]
        .into_iter()
        .map(make_rule_eval_result)
        .collect_vec();
        let stats = get_stats(&results);
        let expected_stats = RuleEvalStats {
            total: 10,
            count_by_historical_action_triggered: HashMap::from_iter([
                (RuleResultRuleAction::Fail, 4),
                (RuleResultRuleAction::StepUp, 4),
                (RuleResultRuleAction::Pass, 2),
            ]),
            count_by_backtest_action_triggered: HashMap::from_iter([
                (RuleResultRuleAction::Fail, 4),
                (RuleResultRuleAction::Pass, 6),
            ]),
            count_by_historical_and_backtest_action_triggered: HashMap::from_iter([
                (
                    RuleResultRuleAction::Fail,
                    HashMap::from_iter([(RuleResultRuleAction::Fail, 2), (RuleResultRuleAction::Pass, 2)]),
                ),
                (
                    RuleResultRuleAction::StepUp,
                    HashMap::from_iter([(RuleResultRuleAction::Pass, 4)]),
                ),
                (
                    RuleResultRuleAction::Pass,
                    HashMap::from_iter([(RuleResultRuleAction::Fail, 2)]),
                ),
            ]),
        };
        assert_eq!(expected_stats, stats)
    }

    fn make_rule_eval_result(
        t: (OnboardingStatus, Option<RuleAction>, Option<RuleAction>),
    ) -> RuleEvalResult {
        let (current_status, historical_action_triggered, backtest_action_triggered) = t;
        RuleEvalResult {
            fp_id: FpId::from("fp123".to_string()),
            current_status,
            historical_action_triggered,
            backtest_action_triggered,
        }
    }
}
