use crate::decision::rule_engine::eval::HasRule;
use crate::decision::rule_engine::eval::IsActionAllowed;
use crate::decision::rule_engine::eval::RuleEvalConfig;
use newtypes::BooleanOperator;
use newtypes::FootprintReasonCode;
use newtypes::RuleExpression;
use newtypes::RuleExpressionCondition;
use serde::Serialize;
use serde_with::SerializeDisplay;
use strum::Display;

#[derive(Clone, Copy, PartialEq, Eq, PartialOrd, Ord, SerializeDisplay, Display)]
#[strum(serialize_all = "snake_case")]
pub(super) enum WaterfallRuleAction {
    IdFlagged,
    RuleTriggered,
}

#[derive(Serialize)]
pub(super) struct WaterfallRule(pub RuleExpression, pub WaterfallRuleAction);
impl HasRule<WaterfallRuleAction> for WaterfallRule {
    fn action(&self) -> WaterfallRuleAction {
        self.1
    }

    fn expression(&self) -> RuleExpression {
        self.0.clone()
    }
}
impl IsActionAllowed<WaterfallRuleAction> for WaterfallRule {
    fn is_action_allowed(&self, _rule_config: &RuleEvalConfig) -> bool {
        true
    }
}

pub(super) fn waterfall_rules() -> Vec<WaterfallRule> {
    vec![
        (
            FootprintReasonCode::IdNotLocated,
            WaterfallRuleAction::RuleTriggered,
        ),
        (FootprintReasonCode::IdFlagged, WaterfallRuleAction::IdFlagged),
        (
            FootprintReasonCode::SsnDoesNotMatch,
            WaterfallRuleAction::RuleTriggered,
        ),
        (
            FootprintReasonCode::SsnPartiallyMatches,
            WaterfallRuleAction::RuleTriggered,
        ),
        (
            FootprintReasonCode::SsnInputIsInvalid,
            WaterfallRuleAction::RuleTriggered,
        ),
        (
            FootprintReasonCode::SsnLocatedIsInvalid,
            WaterfallRuleAction::RuleTriggered,
        ),
        (
            FootprintReasonCode::AddressInputIsPoBox,
            WaterfallRuleAction::RuleTriggered,
        ),
    ]
    .into_iter()
    .map(|(frc, action)| {
        let expression = RuleExpression(vec![RuleExpressionCondition::RiskSignal {
            field: frc,
            op: BooleanOperator::Equals,
            value: true,
        }]);

        WaterfallRule(expression, action)
    })
    .collect()
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::cmp::Ordering;
    use test_case::test_case;
    #[test_case(WaterfallRuleAction::IdFlagged, WaterfallRuleAction::RuleTriggered => Ordering::Less)]
    fn test_cmp_waterfall_rule_action(s1: WaterfallRuleAction, s2: WaterfallRuleAction) -> Ordering {
        s1.cmp(&s2)
    }
}
