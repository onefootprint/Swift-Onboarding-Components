use std::collections::HashMap;

use crate::{
    auth::tenant::{CheckTenantGuard, TenantGuard, TenantSessionAuth},
    errors::ApiResult,
    types::ResponseData,
    State,
};
use api_core::decision;
use api_wire_types::{Counts, EvaluateRuleRequest, RuleEvalResult, RuleEvalStats, RuleResultRuleAction};
use db::{
    models::{ob_configuration::ObConfiguration, rule_set_result::RuleSetResult},
    DbError,
};
use itertools::Itertools;
use newtypes::{ObConfigurationId, OnboardingStatus};
use paperclip::actix::{self, api_v2_operation, web, web::Json};

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

    let EvaluateRuleRequest { rule_expression } = request.into_inner();
    let historical_results = state
        .db_pool
        .db_query(move |conn| -> Result<_, DbError> {
            let (obc, _) = ObConfiguration::get(conn, (&ob_config_id.into_inner(), &tenant_id, is_live))?;
            RuleSetResult::sample_for_eval(conn, &obc.id, 100)
        })
        .await?;

    let results = historical_results
        .into_iter()
        .map(|(sv, rsr, rs)| {
            let backtest_rule_result = decision::rule_engine::eval::evaluate_rule_expression(
                &rule_expression,
                &rs.into_iter().map(|r| r.reason_code).collect_vec(),
            );
            api_wire_types::RuleEvalResult {
                fp_id: sv.fp_id,
                current_status: sv.status,
                historical_action_triggered: rsr.action_triggered,
                backtest_rule_result,
            }
        })
        .collect();

    let stats = get_stats(&results);
    ResponseData::ok(api_wire_types::RuleEvalResults { results, stats }).json()
}

fn get_stats(results: &Vec<RuleEvalResult>) -> RuleEvalStats {
    let mut cnts = results.iter().map(|r| r.backtest_rule_result).counts();
    let counts = Counts::new(cnts.remove(&true).unwrap_or(0), cnts.remove(&false).unwrap_or(0));

    let counts_by_current_status: HashMap<OnboardingStatus, Counts> = count_by(results, |r| {
        r.current_status.unwrap_or(OnboardingStatus::Incomplete)
    });

    let counts_by_historical_action_triggered: HashMap<RuleResultRuleAction, Counts> =
        count_by(results, |r| r.historical_action_triggered.into());

    RuleEvalStats {
        total: results.len(),
        counts,
        counts_by_current_status,
        counts_by_historical_action_triggered,
    }
}

fn count_by<K, F>(results: &[RuleEvalResult], key_fn: F) -> HashMap<K, Counts>
where
    K: std::hash::Hash + Eq + Clone,
    F: Fn(&RuleEvalResult) -> K,
{
    results
        .iter()
        .map(|r| (key_fn(r), r.backtest_rule_result))
        .into_group_map()
        .into_iter()
        .map(|(k, bt_results)| {
            let (triggered, not_triggered): (Vec<_>, Vec<_>) = bt_results.into_iter().partition(|r| *r);
            let triggered_cnt = triggered.len();
            let not_triggered_cnt = not_triggered.len();
            (k.clone(), Counts::new(triggered_cnt, not_triggered_cnt))
        })
        .collect::<HashMap<_, Counts>>()
}

#[cfg(test)]
mod tests {
    use newtypes::{FpId, RuleAction};

    use super::*;

    #[test]
    fn test_get_stats() {
        let results = vec![
            (Some(OnboardingStatus::Pass), Some(RuleAction::Fail), true),
            (Some(OnboardingStatus::Pass), Some(RuleAction::Fail), false),
            (Some(OnboardingStatus::Fail), Some(RuleAction::Fail), true),
            (Some(OnboardingStatus::Fail), Some(RuleAction::Fail), false),
            (
                Some(OnboardingStatus::Pass),
                Some(RuleAction::identity_stepup()),
                false,
            ),
            (
                Some(OnboardingStatus::Pass),
                Some(RuleAction::identity_stepup()),
                false,
            ),
            (None, Some(RuleAction::identity_stepup()), false),
            (None, Some(RuleAction::identity_stepup()), false),
            (Some(OnboardingStatus::Pass), None, true),
            (Some(OnboardingStatus::Pass), None, true),
        ]
        .into_iter()
        .map(make_rule_eval_result)
        .collect_vec();
        let stats = get_stats(&results);
        let expected_stats = RuleEvalStats {
            total: 10,
            counts: Counts {
                triggered: 4,
                not_triggered: 6,
                triggered_rate: 0.4,
            },
            counts_by_current_status: HashMap::from_iter([
                (
                    OnboardingStatus::Pass,
                    Counts {
                        triggered: 3,
                        not_triggered: 3,
                        triggered_rate: 0.5,
                    },
                ),
                (
                    OnboardingStatus::Fail,
                    Counts {
                        triggered: 1,
                        not_triggered: 1,
                        triggered_rate: 0.5,
                    },
                ),
                (
                    OnboardingStatus::Incomplete,
                    Counts {
                        triggered: 0,
                        not_triggered: 2,
                        triggered_rate: 0.0,
                    },
                ),
            ]),
            counts_by_historical_action_triggered: HashMap::from_iter([
                (
                    RuleResultRuleAction::Fail,
                    Counts {
                        triggered: 2,
                        not_triggered: 2,
                        triggered_rate: 0.5,
                    },
                ),
                (
                    RuleResultRuleAction::StepUp,
                    Counts {
                        triggered: 0,
                        not_triggered: 4,
                        triggered_rate: 0.0,
                    },
                ),
                (
                    RuleResultRuleAction::Pass,
                    Counts {
                        triggered: 2,
                        not_triggered: 0,
                        triggered_rate: 1.0,
                    },
                ),
            ]),
        };
        assert_eq!(expected_stats, stats)
    }

    fn make_rule_eval_result(t: (Option<OnboardingStatus>, Option<RuleAction>, bool)) -> RuleEvalResult {
        let (current_status, historical_action_triggered, backtest_rule_result) = t;
        RuleEvalResult {
            fp_id: FpId::from("fp123".to_string()),
            current_status,
            historical_action_triggered,
            backtest_rule_result,
        }
    }
}
