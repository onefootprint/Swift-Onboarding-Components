use newtypes::{BooleanOperator, FootprintReasonCode, RuleExpression, RuleExpressionCondition};

pub fn example_rule_expression() -> RuleExpression {
    RuleExpression(vec![RuleExpressionCondition::RiskSignal {
        field: FootprintReasonCode::IdFlagged,
        op: BooleanOperator::Equals,
        value: true,
    }])
}
