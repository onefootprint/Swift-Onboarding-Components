use db::models::rule_instance::RuleInstance;

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
            action,
            is_shadow,
        }
    }
}
