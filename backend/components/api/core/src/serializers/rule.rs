use crate::utils::db2api::DbToApi;
use db::models::rule_instance::RuleInstance;
use db::models::rule_result::RuleResult;
use db::models::rule_set_result::RuleSetResult;

impl DbToApi<RuleInstance> for api_wire_types::Rule {
    fn from_db(rule: RuleInstance) -> Self {
        let RuleInstance {
            rule_id,
            created_at,
            name,
            rule_expression,
            action,
            rule_action,
            is_shadow,
            kind,
            ..
        } = rule;

        Self {
            rule_id,
            created_at,
            name,
            rule_expression,
            action,
            is_shadow,
            kind,
            rule_action,
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
            rule_action_triggered,
            ..
        } = rule_set_result;

        Self {
            created_at,
            ob_configuration_id,
            action_triggered,
            rule_action_triggered,
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
