use db::models::rule_instance::RuleInstance;
use itertools::Itertools;
use newtypes::{BooleanOperator, FootprintReasonCode, RuleAction, RuleExpression, RuleExpressionCondition};

// pub struct Rule(pub RuleExpression, pub RuleAction);

pub trait HasRule {
    fn expression(&self) -> RuleExpression;
    fn action(&self) -> RuleAction;
}

#[derive(Debug)]
pub struct Rule {
    pub expression: RuleExpression,
    pub action: RuleAction,
}

impl HasRule for Rule {
    fn expression(&self) -> RuleExpression {
        self.expression.clone()
    }

    fn action(&self) -> RuleAction {
        self.action
    }
}

impl HasRule for RuleInstance {
    fn expression(&self) -> RuleExpression {
        self.rule_expression.clone()
    }

    fn action(&self) -> RuleAction {
        self.action
    }
}

pub fn evaluate_rule_set<T: HasRule>(
    rules: Vec<T>,
    input: &[FootprintReasonCode],
    // a bit annoying to have to put this here, but this is our one case currently where a ruleset is evaluated but a particular action is not allowed. If we have already collected a document or already step'd up, we want to ensure that we don't chose that action again
    // maybe soon we'll put StepUp rules in a separate group and evaluate those separately and then can remove this from here
    allow_stepup: bool,
) -> (Vec<(T, bool)>, Option<RuleAction>) {
    let rule_results = rules
        .into_iter()
        .map(|r| {
            let eval = evaluate_rule_expression(&r.expression(), input);
            (r, eval)
        })
        .collect_vec();

    // take the most punitive action coming from some rule that evaluated to true
    let action_triggered = rule_results
        .iter()
        .filter_map(|(r, e)| {
            if *e && (allow_stepup || !matches!(r.action(), RuleAction::StepUp)) {
                Some(r.action())
            } else {
                None
            }
        })
        .max();

    (rule_results, action_triggered)
}

pub fn evaluate_rule_expression(rule_expression: &RuleExpression, input: &[FootprintReasonCode]) -> bool {
    // Conditions in a Rule are all AND'd together
    // Empty rule_expression's with no conditions shouldn't be possible (should fail validation), but should one of these sneak into existence (ie a bad manual PG fiddle) then we'd want to default to evaluate to false there, not true
    !rule_expression.0.is_empty() && rule_expression.0.iter().all(|c| evaluate_condition(c, input))
}

// TODO: maybe use a Set here later but honestly at small N its probably moot
fn evaluate_condition(cond: &RuleExpressionCondition, input: &[FootprintReasonCode]) -> bool {
    match cond {
        RuleExpressionCondition::RiskSignal { field, op, value } => {
            let field_value = input.contains(field);
            match op {
                BooleanOperator::Equals => field_value == *value,
                BooleanOperator::DoesNotEqual => field_value != *value,
            }
        }
    }
}

#[cfg(test)]
pub mod tests {
    use super::*;
    use newtypes::{
        BooleanOperator as BO, FootprintReasonCode as FRC, RuleAction as RA, RuleExpression as RE,
        RuleExpressionCondition as REC,
    };
    use test_case::test_case;

    // just to avoid having to make RuleInstance's. Also proves that we could use evaluate_rules in a RAM-only way (ie for backtesting or whatever)
    pub struct TRule(pub RE, pub RA);
    impl HasRule for TRule {
        fn expression(&self) -> RE {
            self.0.clone()
        }

        fn action(&self) -> RA {
            self.1
        }
    }

    #[test_case(vec![TRule(RE(vec![REC::RiskSignal {
        field: FRC::SsnDoesNotMatch,
        op: BO::Equals,
        value: true,
    }]), RA::Fail)], vec![FRC::SsnDoesNotMatch], true  => (vec![true], Some(RA::Fail)); "single trigger, Fail")]
    #[test_case(vec![TRule(RE(vec![REC::RiskSignal {
        field: FRC::SsnDoesNotMatch,
        op: BO::Equals,
        value: true,
    }]), RA::ManualReview)], vec![FRC::SsnDoesNotMatch], true  => (vec![true], Some(RA::ManualReview)); "single trigger, ManualReview")]
    #[test_case(vec![TRule(RE(vec![REC::RiskSignal {
        field: FRC::SsnDoesNotMatch,
        op: BO::Equals,
        value: true,
    }]), RA::ManualReview)], vec![], true  => (vec![false], None); "empty input FRCs")]
    #[test_case(vec![TRule(RE(vec![REC::RiskSignal {
        field: FRC::SsnDoesNotMatch,
        op: BO::Equals,
        value: true,
    }]), RA::Fail)], vec![FRC::NameDoesNotMatch], true  => (vec![false], None); "non-matching FRC")]
    #[test_case(vec![TRule(RE(vec![REC::RiskSignal {
        field: FRC::SsnDoesNotMatch,
        op: BO::Equals,
        value: true,
    }]), RA::Fail), TRule(RE(vec![REC::RiskSignal {
        field: FRC::NameDoesNotMatch,
        op: BO::Equals,
        value: true,
    }]), RA::Fail)], vec![FRC::NameDoesNotMatch], true  => (vec![false, true], Some(RA::Fail)); "2 rules, 1 trigger")]
    #[test_case(vec![TRule(RE(vec![REC::RiskSignal {
        field: FRC::SsnDoesNotMatch,
        op: BO::Equals,
        value: true,
    }]), RA::Fail), TRule(RE(vec![REC::RiskSignal {
        field: FRC::NameDoesNotMatch,
        op: BO::Equals,
        value: true,
    }]), RA::Fail)], vec![FRC::SsnDoesNotMatch, FRC::NameDoesNotMatch], true  => (vec![true, true], Some(RA::Fail)); "2 rules trigger")]
    #[test_case(vec![TRule(RE(vec![REC::RiskSignal {
        field: FRC::SsnDoesNotMatch,
        op: BO::Equals,
        value: true,
    }]), RA::ManualReview), TRule(RE(vec![REC::RiskSignal {
        field: FRC::NameDoesNotMatch,
        op: BO::Equals,
        value: true,
    }]), RA::Fail)], vec![FRC::SsnDoesNotMatch, FRC::NameDoesNotMatch], true  => (vec![true, true], Some(RA::Fail)); "2 rules trigger, different actions")]
    #[test_case(vec![TRule(RE(vec![REC::RiskSignal {
        field: FRC::SsnDoesNotMatch,
        op: BO::Equals,
        value: true,
    }]), RA::Fail), TRule(RE(vec![REC::RiskSignal {
        field: FRC::NameDoesNotMatch,
        op: BO::Equals,
        value: true,
    }]), RA::ManualReview)], vec![FRC::SsnDoesNotMatch, FRC::NameDoesNotMatch], true  => (vec![true, true], Some(RA::Fail)); "2 rules trigger, different actions reversed")]
    #[test_case(vec![TRule(RE(vec![REC::RiskSignal {
        field: FRC::SsnDoesNotMatch,
        op: BO::Equals,
        value: true,
    }]), RA::StepUp)], vec![FRC::SsnDoesNotMatch], false  => (vec![true], None); "single trigger but StepUp not allowed")]
    #[test_case(vec![TRule(RE(vec![REC::RiskSignal {
        field: FRC::SsnDoesNotMatch,
        op: BO::Equals,
        value: true,
    }]), RA::StepUp), TRule(RE(vec![REC::RiskSignal {
        field: FRC::NameDoesNotMatch,
        op: BO::Equals,
        value: true,
    }]), RA::ManualReview)], vec![FRC::SsnDoesNotMatch, FRC::NameDoesNotMatch], false  => (vec![true, true], Some(RA::ManualReview)); "2 rules trigger, StepUp not allowed")]
    pub fn test_evaluate_rule_set(
        rules: Vec<TRule>,
        input: Vec<FRC>,
        allow_stepup: bool,
    ) -> (Vec<bool>, Option<RuleAction>) {
        let (rule_results, action) = evaluate_rule_set(rules, &input, allow_stepup);
        (rule_results.into_iter().map(|(_, e)| e).collect_vec(), action)
    }

    #[test_case(RE(vec![]), vec![]  => false)]
    #[test_case(RE(vec![REC::RiskSignal {
        field: FRC::IdNotLocated,
        op: BO::Equals,
        value: true,
    }]), vec![FRC::IdNotLocated]  => true)]
    #[test_case(RE(vec![REC::RiskSignal {
        field: FRC::IdNotLocated,
        op: BO::Equals,
        value: true,
    }, REC::RiskSignal {
        field: FRC::NameDoesNotMatch,
        op: BO::Equals,
        value: true,
    }]), vec![FRC::IdNotLocated]  => false)]
    #[test_case(RE(vec![REC::RiskSignal {
        field: FRC::IdNotLocated,
        op: BO::Equals,
        value: true,
    }, REC::RiskSignal {
        field: FRC::NameDoesNotMatch,
        op: BO::Equals,
        value: false,
    }]), vec![FRC::IdNotLocated]  => true)]
    #[test_case(RE(vec![REC::RiskSignal {
        field: FRC::IdNotLocated,
        op: BO::Equals,
        value: true,
    }, REC::RiskSignal {
        field: FRC::NameDoesNotMatch,
        op: BO::Equals,
        value: true,
    }]), vec![FRC::IdNotLocated, FRC::NameDoesNotMatch]  => true)]
    #[test_case(RE(vec![REC::RiskSignal {
        field: FRC::IdNotLocated,
        op: BO::Equals,
        value: true,
    }, REC::RiskSignal {
        field: FRC::NameDoesNotMatch,
        op: BO::Equals,
        value: true,
    }]), vec![FRC::IdNotLocated, FRC::NameDoesNotMatch, FRC::SsnNotProvided]  => true)]
    pub fn test_evaluate_rule_expression(re: RE, input: Vec<FRC>) -> bool {
        evaluate_rule_expression(&re, &input)
    }

    #[test_case(REC::RiskSignal {
        field: FRC::IdNotLocated,
        op: BO::Equals,
        value: true,
    }, vec![FRC::IdNotLocated]  => true)]
    #[test_case(REC::RiskSignal {
        field: FRC::IdNotLocated,
        op: BO::Equals,
        value: false,
    }, vec![FRC::IdNotLocated]  => false)]
    #[test_case(REC::RiskSignal {
        field: FRC::IdNotLocated,
        op: BO::DoesNotEqual,
        value: true,
    }, vec![FRC::IdNotLocated]  => false)]
    #[test_case(REC::RiskSignal {
        field: FRC::IdNotLocated,
        op: BO::DoesNotEqual,
        value: false,
    }, vec![FRC::IdNotLocated]  => true)]
    #[test_case(REC::RiskSignal {
        field: FRC::IdNotLocated,
        op: BO::Equals,
        value: true,
    }, vec![]  => false)]
    #[test_case(REC::RiskSignal {
        field: FRC::IdNotLocated,
        op: BO::Equals,
        value: false,
    }, vec![]  => true)]
    #[test_case(REC::RiskSignal {
        field: FRC::IdNotLocated,
        op: BO::DoesNotEqual,
        value: true,
    }, vec![]  => true)]
    #[test_case(REC::RiskSignal {
        field: FRC::IdNotLocated,
        op: BO::DoesNotEqual,
        value: false,
    }, vec![]  => false)]
    pub fn test_evaluate_condition(cond: REC, input: Vec<FRC>) -> bool {
        evaluate_condition(&cond, &input)
    }
}
