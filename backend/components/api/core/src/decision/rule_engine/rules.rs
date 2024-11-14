use api_wire_types::CreateRule;
use db::models::rule_instance::RuleInstance;
use newtypes::UnvalidatedRuleExpression;

pub fn copy_rule(r: RuleInstance) -> CreateRule {
    let RuleInstance {
        name,
        rule_expression,
        action: _,
        rule_action,
        is_shadow,

        // Don't copy these fields. Explicitly enumerate them so the compiler complains when a new
        // field is added
        id: _,
        created_at: _,
        created_seqno: _,
        _created_at: _,
        _updated_at: _,
        deactivated_at: _,
        deactivated_seqno: _,
        rule_id: _,
        ob_configuration_id: _,
        actor: _,
        kind: _,
    } = r;

    CreateRule {
        name,
        rule_action: api_wire_types::RuleActionMigration::New(rule_action),
        rule_expression: UnvalidatedRuleExpression(rule_expression.0),
        is_shadow,
    }
}
