use db::models::rule_instance::RuleInstance;
use itertools::Itertools;
use newtypes::{
    BooleanOperator, DocumentRequestKind, Equals, FootprintReasonCode, RuleAction, RuleExpression, RuleExpressionCondition, StepUpKind, VaultOperation
};
use strum::IntoEnumIterator;

use super::engine::VaultDataForRules;

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

// Interface to help map from what we've collected (documents) to the appropriate rules we should evaluate
#[derive(Debug, PartialEq, Eq, Clone)]
pub struct RuleEvalConfig {
    pub allowed_rule_actions: Vec<RuleAction>,
}
impl RuleEvalConfig {
    pub fn new(doc_kinds_collected: Vec<DocumentRequestKind>) -> Self {
        let excluded_rule_actions = Self::excluded_rule_actions(doc_kinds_collected);
        let allowed_rule_actions = RuleAction::all_rule_actions()
            .into_iter()
            .filter(|ra| !excluded_rule_actions.contains(ra))
            .collect();

        Self { allowed_rule_actions }
    }

    // convenience method for use in rule eval
    pub fn action_is_allowed(&self, ra: &RuleAction) -> bool {
        self.allowed_rule_actions.contains(ra)
    }

    // see what eligible risk actions we can take from a set of documents we already collected
    fn excluded_rule_actions(doc_kinds_collected: Vec<DocumentRequestKind>) -> Vec<RuleAction> {
        StepUpKind::iter()
            .filter(|suk| {
                let doc_kinds_from_suk = suk.to_doc_kinds();
                // only allow stepups to doc kinds we haven't collected yet
                doc_kinds_collected
                    .iter()
                    .any(|ex| doc_kinds_from_suk.contains(ex))
            })
            .map(RuleAction::StepUp)
            .collect()
    }
}

impl Default for RuleEvalConfig {
    fn default() -> Self {
        let allowed_rule_actions = RuleAction::all_rule_actions();

        Self { allowed_rule_actions }
    }
}

pub fn evaluate_rule_set<T: HasRule>(
    rules: Vec<T>,
    input: &[FootprintReasonCode],
    vault_data: &VaultDataForRules, // TODO: for waterfall, we won't execute on vault data based rules so should probs more explicitly handle that vs having it pass in an empty DUR here
    // a bit annoying to have to put this here, but this is our one case currently where a ruleset is evaluated but a particular action is not allowed. If we have already collected a document or already step'd up, we want to ensure that we don't chose that action again
    // maybe soon we'll put StepUp rules in a separate group and evaluate those separately and then can remove this from here
    rule_config: &RuleEvalConfig,
) -> (Vec<(T, bool)>, Option<RuleAction>) {
    let rule_results = rules
        .into_iter()
        .map(|r| {
            let eval = evaluate_rule_expression(&r.expression(), input, vault_data);
            (r, eval)
        })
        .collect_vec();
    // take the most punitive action coming from some rule that evaluated to true
    let action_triggered = rule_results
        .iter()
        .filter_map(|(r, e)| {
            if *e && (rule_config.action_is_allowed(&r.action())) {
                Some(r.action())
            } else {
                None
            }
        })
        .max();

    (rule_results, action_triggered)
}

pub fn evaluate_rule_expression(rule_expression: &RuleExpression, input: &[FootprintReasonCode], vault_data: &VaultDataForRules) -> bool {
    // Conditions in a Rule are all AND'd together
    // Empty rule_expression's with no conditions shouldn't be possible (should fail validation), but should one of these sneak into existence (ie a bad manual PG fiddle) then we'd want to default to evaluate to false there, not true
    !rule_expression.0.is_empty() && rule_expression.0.iter().all(|c| evaluate_condition(c, input, vault_data))
}

// TODO: maybe use a Set here later but honestly at small N its probably moot
fn evaluate_condition(cond: &RuleExpressionCondition, input: &[FootprintReasonCode], vault_data: &VaultDataForRules) -> bool {
    match cond {
        RuleExpressionCondition::RiskSignal { field, op, value } => {
            let field_value = input.contains(field);
            match op {
                BooleanOperator::Equals => field_value == *value,
                BooleanOperator::DoesNotEqual => field_value != *value,
            }
        }
        RuleExpressionCondition::VaultData(vo) => {
            let Some(field_value) = vault_data.get_di(vo.field().clone()).ok() else {
                // if vault data is missing, never evaluate to true
                return false
            };
            match vo {
                VaultOperation::Equals { field:_, op, value } => match op {
                    Equals::Equals => field_value.leak_to_string() == *value.leak_to_string(),
                    Equals::DoesNotEqual => field_value.leak_to_string() != *value.leak_to_string(),
                },
                VaultOperation::IsIn { field:_, op: _, value: _ } => unimplemented!(),
            }
        },
        RuleExpressionCondition::RiskScore { field:_, op:_, value:_ } => unimplemented!(),
    }
}

#[cfg(test)]
pub mod tests {
    use std::collections::HashMap;

    use crate::{decision::rule_engine::engine::VaultDataForRules, utils::vault_wrapper::{DecryptUncheckedResult, EnclaveDecryptOperation}};

    use super::*;
    use newtypes::{
        BooleanOperator as BO, DataIdentifier, FootprintReasonCode as FRC, IdentityDataKind, InvestorProfileKind, PiiString, RuleAction as RA, RuleExpression as RE, RuleExpressionCondition as REC
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

    fn id_doc_collected() -> Vec<DocumentRequestKind> {
        vec![DocumentRequestKind::Identity]
    }

    fn poa_doc_collected() -> Vec<DocumentRequestKind> {
        vec![DocumentRequestKind::ProofOfAddress]
    }

    fn id_poa_collected() -> Vec<DocumentRequestKind> {
        vec![DocumentRequestKind::Identity, DocumentRequestKind::ProofOfAddress]
    }

    #[test_case(vec![TRule(RE(vec![REC::RiskSignal {
        field: FRC::SsnDoesNotMatch,
        op: BO::Equals,
        value: true,
    }]), RA::Fail)], vec![FRC::SsnDoesNotMatch], vec![] => (vec![true], Some(RA::Fail)); "single trigger, Fail")]
    #[test_case(vec![TRule(RE(vec![REC::RiskSignal {
        field: FRC::SsnDoesNotMatch,
        op: BO::Equals,
        value: true,
    }]), RA::ManualReview)], vec![FRC::SsnDoesNotMatch], vec![] => (vec![true], Some(RA::ManualReview)); "single trigger, ManualReview")]
    #[test_case(vec![TRule(RE(vec![REC::RiskSignal {
        field: FRC::SsnDoesNotMatch,
        op: BO::Equals,
        value: true,
    }]), RA::ManualReview)], vec![], vec![] => (vec![false], None); "empty input FRCs")]
    #[test_case(vec![TRule(RE(vec![REC::RiskSignal {
        field: FRC::SsnDoesNotMatch,
        op: BO::Equals,
        value: true,
    }]), RA::Fail)], vec![FRC::NameDoesNotMatch], vec![] => (vec![false], None); "non-matching FRC")]
    #[test_case(vec![TRule(RE(vec![REC::RiskSignal {
        field: FRC::SsnDoesNotMatch,
        op: BO::Equals,
        value: true,
    }]), RA::Fail), TRule(RE(vec![REC::RiskSignal {
        field: FRC::NameDoesNotMatch,
        op: BO::Equals,
        value: true,
    }]), RA::Fail)], vec![FRC::NameDoesNotMatch], vec![] => (vec![false, true], Some(RA::Fail)); "2 rules, 1 trigger")]
    #[test_case(vec![TRule(RE(vec![REC::RiskSignal {
        field: FRC::SsnDoesNotMatch,
        op: BO::Equals,
        value: true,
    }]), RA::Fail), TRule(RE(vec![REC::RiskSignal {
        field: FRC::NameDoesNotMatch,
        op: BO::Equals,
        value: true,
    }]), RA::Fail)], vec![FRC::SsnDoesNotMatch, FRC::NameDoesNotMatch], vec![] => (vec![true, true], Some(RA::Fail)); "2 rules trigger")]
    #[test_case(vec![TRule(RE(vec![REC::RiskSignal {
        field: FRC::SsnDoesNotMatch,
        op: BO::Equals,
        value: true,
    }]), RA::ManualReview), TRule(RE(vec![REC::RiskSignal {
        field: FRC::NameDoesNotMatch,
        op: BO::Equals,
        value: true,
    }]), RA::Fail)], vec![FRC::SsnDoesNotMatch, FRC::NameDoesNotMatch], vec![] => (vec![true, true], Some(RA::Fail)); "2 rules trigger, different actions")]
    #[test_case(vec![TRule(RE(vec![REC::RiskSignal {
        field: FRC::SsnDoesNotMatch,
        op: BO::Equals,
        value: true,
    }]), RA::Fail), TRule(RE(vec![REC::RiskSignal {
        field: FRC::NameDoesNotMatch,
        op: BO::Equals,
        value: true,
    }]), RA::ManualReview)], vec![FRC::SsnDoesNotMatch, FRC::NameDoesNotMatch], vec![] => (vec![true, true], Some(RA::Fail)); "2 rules trigger, different actions reversed")]
    #[test_case(vec![TRule(RE(vec![REC::RiskSignal {
        field: FRC::SsnDoesNotMatch,
        op: BO::Equals,
        value: true,
    }]), RA::identity_stepup())], vec![FRC::SsnDoesNotMatch], id_doc_collected() => (vec![true], None); "single trigger but StepUp not allowed")]
    #[test_case(vec![TRule(RE(vec![REC::RiskSignal {
        field: FRC::SsnDoesNotMatch,
        op: BO::Equals,
        value: true,
    }]), RA::identity_stepup()), TRule(RE(vec![REC::RiskSignal {
        field: FRC::NameDoesNotMatch,
        op: BO::Equals,
        value: true,
    }]), RA::ManualReview)], vec![FRC::SsnDoesNotMatch, FRC::NameDoesNotMatch], id_doc_collected() => (vec![true, true], Some(RA::ManualReview)); "2 rules trigger, StepUp not allowed")]
    #[test_case(vec![TRule(RE(vec![REC::RiskSignal {
        field: FRC::SsnDoesNotMatch,
        op: BO::Equals,
        value: true,
    }]), RA::StepUp(StepUpKind::Identity)), TRule(RE(vec![REC::RiskSignal {
        field: FRC::NameDoesNotMatch,
        op: BO::Equals,
        value: true,
    }]), RA::StepUp(StepUpKind::IdentityProofOfSsnProofOfAddress))], vec![FRC::SsnDoesNotMatch, FRC::NameDoesNotMatch], vec![] => (vec![true, true], Some(RA::StepUp(StepUpKind::IdentityProofOfSsnProofOfAddress))); "2 rules trigger, different stepup actions, we choose the one with more documents")]
    #[test_case(vec![TRule(RE(vec![REC::RiskSignal {
        field: FRC::SsnDoesNotMatch,
        op: BO::Equals,
        value: true,
    }]), RA::StepUp(StepUpKind::Identity)), TRule(RE(vec![REC::RiskSignal {
        field: FRC::NameDoesNotMatch,
        op: BO::Equals,
        value: true,
    }]), RA::StepUp(StepUpKind::ProofOfAddress))], vec![FRC::SsnDoesNotMatch, FRC::NameDoesNotMatch], vec![] => (vec![true, true], Some(RA::StepUp(StepUpKind::ProofOfAddress))); "2 rules trigger, different stepup actions, we choose the max StepUpKind")]
    #[test_case(vec![TRule(RE(vec![REC::RiskSignal {
        field: FRC::SsnDoesNotMatch,
        op: BO::Equals,
        value: true,
    }]), RA::StepUp(StepUpKind::Identity)), TRule(RE(vec![REC::RiskSignal {
        field: FRC::NameDoesNotMatch,
        op: BO::Equals,
        value: true,
    }]), RA::StepUp(StepUpKind::ProofOfAddress))], vec![FRC::SsnDoesNotMatch, FRC::NameDoesNotMatch], poa_doc_collected() => (vec![true, true], Some(RA::StepUp(StepUpKind::Identity))); "2 rules trigger, different stepup actions, but we've already collected proof of address")]
    #[test_case(vec![TRule(RE(vec![REC::RiskSignal {
        field: FRC::SsnDoesNotMatch,
        op: BO::Equals,
        value: true,
    }]), RA::StepUp(StepUpKind::Identity)), TRule(RE(vec![REC::RiskSignal {
        field: FRC::NameDoesNotMatch,
        op: BO::Equals,
        value: true,
    }]), RA::StepUp(StepUpKind::ProofOfAddress))], vec![FRC::SsnDoesNotMatch, FRC::NameDoesNotMatch], id_poa_collected() => (vec![true, true], None); "2 rules trigger, different stepup actions, but we've already collected both docs so we pass")]
    pub fn test_evaluate_rule_set(
        rules: Vec<TRule>,
        input: Vec<FRC>,
        docs_collected: Vec<DocumentRequestKind>,
    ) -> (Vec<bool>, Option<RuleAction>) {
        let config = RuleEvalConfig::new(docs_collected);
        let (rule_results, action) = evaluate_rule_set(rules, &input, &VaultDataForRules::empty(), &config); // TODO: tests with vault data
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
        evaluate_rule_expression(&re, &input, &VaultDataForRules::empty()) // TODO: vault data rules
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
        evaluate_condition(&cond, &input, &VaultDataForRules::empty()) // TODO: vault data condition
    }


    #[test_case(
        vec![DocumentRequestKind::Identity], 
        vec![
            RA::StepUp(StepUpKind::Identity), 
            RA::StepUp(StepUpKind::IdentityProofOfSsn), 
            RA::StepUp(StepUpKind::IdentityProofOfSsnProofOfAddress)
        ])]
    #[test_case(
        vec![DocumentRequestKind::Identity, DocumentRequestKind::ProofOfAddress], 
        vec![
            RA::StepUp(StepUpKind::Identity), 
            RA::StepUp(StepUpKind::IdentityProofOfSsn), 
            RA::StepUp(StepUpKind::IdentityProofOfSsnProofOfAddress),
            RA::StepUp(StepUpKind::ProofOfAddress),
        ])]
    #[test_case(vec![], vec![])]
    #[test_case(
        vec![DocumentRequestKind::ProofOfSsn], 
        vec![
            RA::StepUp(StepUpKind::IdentityProofOfSsn), 
            RA::StepUp(StepUpKind::IdentityProofOfSsnProofOfAddress),
        ])]
    fn test_rule_eval_config(doc_kinds: Vec<DocumentRequestKind>, expected_disallowed_rule_actions: Vec<RuleAction>) {
        let rc = RuleEvalConfig::new(doc_kinds);
        expected_disallowed_rule_actions
            .iter()
            .for_each(|a| assert!(!rc.action_is_allowed(a)));

        // check all others are allowed
        RuleAction::all_rule_actions().iter().filter(|ra| !expected_disallowed_rule_actions.contains(ra))
            .for_each(|a| assert!(rc.action_is_allowed(a)));  
    }

    #[test]
    pub fn test_basic_vault_data_setup() {
        let results: HashMap<EnclaveDecryptOperation, PiiString> = HashMap::from_iter([
            (DataIdentifier::Id(IdentityDataKind::FirstName).into(), "Bob".into()),
            (DataIdentifier::InvestorProfile(InvestorProfileKind::Declarations).into(), "[\"affiliated_with_us_broker\"]".into()),
            (DataIdentifier::InvestorProfile(InvestorProfileKind::InvestmentGoals).into(), "[\"buy_a_home\", \"speculation\"]".into()),
        ]);
        let decrypted_dis = results.keys().cloned().collect();
        let vault_data = DecryptUncheckedResult {
            results,
            decrypted_dis,
        };
        let vd = VaultDataForRules::new(vault_data);

        assert!(evaluate_condition(&REC::VaultData(VaultOperation::Equals {
            field: DataIdentifier::Id(IdentityDataKind::FirstName),
            op: Equals::Equals,
            value: "Bob".into(),
        }), &Vec::<FRC>::new(), &vd));
        
        assert!(!evaluate_condition(&REC::VaultData(VaultOperation::Equals {
            field: DataIdentifier::Id(IdentityDataKind::FirstName),
            op: Equals::Equals,
            value: "Alice".into(),
        }), &Vec::<FRC>::new(), &vd));
    }

}
