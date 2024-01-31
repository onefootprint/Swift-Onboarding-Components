use db::models::{rule_instance::RuleInstance, rule_result::RuleResult, rule_set_result::RuleSetResult};

use crate::utils::db2api::DbToApi;

impl DbToApi<RuleInstance> for api_wire_types::Rule {
    fn from_db(rule: RuleInstance) -> Self {
        let RuleInstance {
            rule_id,
            created_at,
            name,
            rule_expression,
            action,
            is_shadow,
            ..
        } = rule;

        Self {
            rule_id,
            created_at,
            name,
            rule_expression,
            action: action.into(), // TODO: move FE to RA
            is_shadow,
        }
    }
}

impl DbToApi<(RuleSetResult, Vec<(RuleResult, RuleInstance)>)> for api_wire_types::RuleSetResult {
    fn from_db(result: (RuleSetResult, Vec<(RuleResult, RuleInstance)>)) -> Self {
        let (rule_set_result, rule_results) = result;

        let RuleSetResult {
            created_at,
            ob_configuration_id,
            action_triggered,
            ..
        } = rule_set_result;

        Self {
            created_at,
            ob_configuration_id,
            action_triggered: action_triggered.map(|ra| ra.into()),
            rule_results: rule_results
                .into_iter()
                .map(api_wire_types::RuleResult::from_db)
                .collect(),
        }
    }
}

impl DbToApi<(RuleResult, RuleInstance)> for api_wire_types::RuleResult {
    fn from_db(result: (RuleResult, RuleInstance)) -> Self {
        let (result, rule_instance) = result;
        Self {
            rule: api_wire_types::Rule::from_db(rule_instance),
            result: result.result,
        }
    }
}
