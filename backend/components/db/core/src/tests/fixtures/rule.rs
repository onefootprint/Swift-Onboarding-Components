use newtypes::BooleanOperator;
use newtypes::FootprintReasonCode;
use newtypes::RuleExpression;
use newtypes::RuleExpressionCondition;

pub fn example_rule_expression() -> RuleExpression {
    RuleExpression(vec![RuleExpressionCondition::RiskSignal {
        field: FootprintReasonCode::IdFlagged,
        op: BooleanOperator::Equals,
        value: true,
    }])
}

pub fn example_rule_expression2() -> RuleExpression {
    RuleExpression(vec![RuleExpressionCondition::RiskSignal {
        field: FootprintReasonCode::SubjectDeceased,
        op: BooleanOperator::Equals,
        value: true,
    }])
}

pub fn example_rule_expression3() -> RuleExpression {
    RuleExpression(vec![RuleExpressionCondition::RiskSignal {
        field: FootprintReasonCode::DeviceHighRisk,
        op: BooleanOperator::Equals,
        value: true,
    }])
}
