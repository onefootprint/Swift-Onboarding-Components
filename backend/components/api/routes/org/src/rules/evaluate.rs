use std::collections::HashMap;

use crate::{
    auth::tenant::{CheckTenantGuard, TenantGuard, TenantSessionAuth},
    errors::ApiResult,
    types::ResponseData,
    State,
};
use api_core::{
    decision::{
        self,
        rule_engine::{
            engine::VaultDataForRules,
            eval::{Rule, RuleEvalConfig},
            validation::validate_rule_expression,
        },
    },
    errors::AssertionError,
};
use api_wire_types::{EvaluateRuleRequest, RuleEvalResult, RuleEvalStats, RuleResultRuleAction};
use db::models::{
    list::List, ob_configuration::ObConfiguration, rule_instance::RuleInstance,
    rule_set_result::RuleSetResult,
};
use itertools::{chain, Itertools};
use newtypes::{ListId, ObConfigurationId, RuleAction, RuleExpression, RuleId};
use paperclip::actix::{self, api_v2_operation, web, web::Json};

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
#[actix::post("/org/onboarding_configs/{id}/rules/evaluate")]
pub async fn evaluate_rule(
    state: web::Data<State>,
    auth: TenantSessionAuth,
    ob_config_id: web::Path<ObConfigurationId>,
    request: Json<EvaluateRuleRequest>,
) -> ApiResult<Json<ResponseData<api_wire_types::RuleEvalResults>>> {
    let auth = auth.check_guard(TenantGuard::OnboardingConfiguration)?; // TODO: new guard for this ?
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let obc_id = ob_config_id.into_inner();

    let EvaluateRuleRequest {
        add,
        edit,
        delete,
        start_timestamp,
        end_timestamp,
    } = request.into_inner();
    let (current_rules, historical_results, adds, edits) = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let (obc, _) = ObConfiguration::get(conn, (&obc_id, &tenant_id, is_live))?;

            let rules = RuleInstance::list(conn, &tenant_id, is_live, &obc_id)?;
            let rule_set_results =
                RuleSetResult::sample_for_eval(conn, &obc.id, start_timestamp, end_timestamp, 100)?;

            let list_ids: Vec<ListId> = chain(
                add.iter()
                    .flatten()
                    .flat_map(|rule| rule.rule_expression.list_ids()),
                edit.iter()
                    .flatten()
                    .flat_map(|rule| rule.rule_expression.list_ids()),
            )
            .collect();
            let lists = List::bulk_get(conn, &tenant_id, is_live, &list_ids)?;

            let adds: Vec<(RuleExpression, RuleAction)> = add
                .into_iter()
                .flatten()
                .map(|rule| -> ApiResult<_> {
                    Ok((
                        validate_rule_expression(rule.rule_expression, &lists, is_live)?,
                        rule.rule_action,
                    ))
                })
                .collect::<ApiResult<_>>()?;

            let edits: Vec<(RuleId, RuleExpression)> = edit
                .into_iter()
                .flatten()
                .map(|rule| -> ApiResult<_> {
                    Ok((
                        rule.rule_id,
                        validate_rule_expression(rule.rule_expression, &lists, is_live)?,
                    ))
                })
                .collect::<ApiResult<_>>()?;

            Ok((rules, rule_set_results, adds, edits))
        })
        .await?;

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

        edit_rules.push(Rule {
            expression: edit_rule_expression,
            action: curr_rule.action,
        });
    }

    // For every add, add that rule to the rules
    let add_rules = adds.into_iter().map(|(rule_expression, rule_action)| Rule {
        expression: rule_expression,
        action: rule_action,
    });

    let all_rules = current_rules
        .into_values()
        .chain(edit_rules)
        .chain(add_rules)
        .collect_vec();

    let results = historical_results
        .into_iter()
        .map(|(sv, rsr, rs)| {
            let frcs = &rs.into_iter().map(|r| r.reason_code).collect_vec();
            let vault_data = VaultDataForRules::empty(); // TODO: add support for this, need to bulk query VW's for every onboarding
            let insight_events = []; // TODO: implement

            let (_, action_triggered) = decision::rule_engine::eval::evaluate_rule_set(
                all_rules.clone(),
                frcs,
                &vault_data,
                &insight_events,
                &HashMap::new(),
                &RuleEvalConfig::default(),
            );
            api_wire_types::RuleEvalResult {
                fp_id: sv.fp_id,
                current_status: sv.status,
                historical_action_triggered: rsr.action_triggered,
                backtest_action_triggered: action_triggered,
            }
        })
        .collect_vec();

    let stats = get_stats(&results);
    ResponseData::ok(api_wire_types::RuleEvalResults { results, stats }).json()
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
    use newtypes::{FpId, OnboardingStatus, RuleAction};

    use super::*;

    #[test]
    fn test_get_stats() {
        let results = vec![
            (
                Some(OnboardingStatus::Pass),
                Some(RuleAction::Fail),
                Some(RuleAction::Fail),
            ),
            (Some(OnboardingStatus::Pass), Some(RuleAction::Fail), None),
            (
                Some(OnboardingStatus::Fail),
                Some(RuleAction::Fail),
                Some(RuleAction::Fail),
            ),
            (Some(OnboardingStatus::Fail), Some(RuleAction::Fail), None),
            (
                Some(OnboardingStatus::Pass),
                Some(RuleAction::identity_stepup()),
                None,
            ),
            (
                Some(OnboardingStatus::Pass),
                Some(RuleAction::identity_stepup()),
                None,
            ),
            (None, Some(RuleAction::identity_stepup()), None),
            (None, Some(RuleAction::identity_stepup()), None),
            (Some(OnboardingStatus::Pass), None, Some(RuleAction::Fail)),
            (Some(OnboardingStatus::Pass), None, Some(RuleAction::Fail)),
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
        t: (Option<OnboardingStatus>, Option<RuleAction>, Option<RuleAction>),
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
