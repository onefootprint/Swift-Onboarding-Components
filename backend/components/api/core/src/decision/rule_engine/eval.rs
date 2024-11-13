use super::engine::VaultDataForRules;
use crate::FpResult;
use api_errors::ServerErr;
use api_errors::ServerErrInto;
use db::models::insight_event::InsightEvent;
use db::models::list_entry::ListWithDecryptedEntries;
use db::models::rule_instance::RuleInstance;
use itertools::Itertools;
use newtypes::email::Email;
use newtypes::BooleanOperator;
use newtypes::BusinessDataKind;
use newtypes::DataIdentifier;
use newtypes::DeviceInsightField;
use newtypes::DeviceInsightOperation;
use newtypes::DocumentRequestConfig;
use newtypes::DocumentRequestConfigIdentifier;
use newtypes::Equals;
use newtypes::FootprintReasonCode;
use newtypes::IdentityDataKind;
use newtypes::IsIn;
use newtypes::ListEntryValue;
use newtypes::ListId;
use newtypes::ListKind;
use newtypes::PhoneNumber;
use newtypes::PiiString;
use newtypes::RuleAction;
use newtypes::RuleActionConfig;
use newtypes::RuleExpression;
use newtypes::RuleExpressionCondition;
use newtypes::VaultOperation;
use std::collections::HashMap;
use std::str::FromStr;

/// Trait that represents a Rule
pub trait HasRule<A: Ord + PartialOrd> {
    fn expression(&self) -> RuleExpression;
    fn action(&self) -> A;
}

/// Trait that represents whether a Rule contains an action that is allowed per the state of the
/// workflow (to avoid infinite step up loops)
pub trait IsActionAllowed<A>
where
    A: Ord + PartialOrd,
    Self: HasRule<A>,
{
    fn is_action_allowed(&self, rule_config: &RuleEvalConfig) -> bool;
}

#[derive(Debug, Clone)]
pub struct Rule {
    pub expression: RuleExpression,
    pub action: RuleAction,
}

/// Rule impl
impl HasRule<RuleAction> for Rule {
    fn expression(&self) -> RuleExpression {
        self.expression.clone()
    }

    fn action(&self) -> RuleAction {
        self.action
    }
}

impl IsActionAllowed<RuleAction> for Rule {
    fn is_action_allowed(&self, _rule_config: &RuleEvalConfig) -> bool {
        true
    }
}

/// Rule instance impl
impl HasRule<RuleActionConfig> for RuleInstance {
    fn expression(&self) -> RuleExpression {
        self.rule_expression.clone()
    }

    fn action(&self) -> RuleActionConfig {
        self.rule_action.clone()
    }
}

impl IsActionAllowed<RuleActionConfig> for RuleInstance {
    fn is_action_allowed(&self, rule_config: &RuleEvalConfig) -> bool {
        rule_config.action_is_allowed(&self.action())
    }
}

// Interface to help map from what we've collected (documents) to the appropriate rules we should
// evaluate
#[derive(Debug, PartialEq, Eq, Clone, Default)]
pub struct RuleEvalConfig {
    pub document_request_identifiers_already_collected: Vec<DocumentRequestConfigIdentifier>,
}
impl RuleEvalConfig {
    pub fn new(doc_configs_already_collected: Vec<DocumentRequestConfig>) -> Self {
        let document_request_identifiers_already_collected = doc_configs_already_collected
            .iter()
            .map(|dr| dr.identifier())
            .collect();
        Self {
            document_request_identifiers_already_collected,
        }
    }

    // convenience method for use in rule eval
    pub fn action_is_allowed(&self, ra: &RuleActionConfig) -> bool {
        match ra {
            RuleActionConfig::StepUp(doc_reqs_from_rule) => {
                // we allow the rule only if non of the docs in the rule have been collected already...
                // maybe we can relax this in the future?
                let rule_doc_configs = doc_reqs_from_rule.iter().map(|dr| dr.identifier()).collect_vec();

                rule_doc_configs
                    .iter()
                    .all(|dr| !self.document_request_identifiers_already_collected.contains(dr))
            }
            RuleActionConfig::PassWithManualReview {}
            | RuleActionConfig::ManualReview {}
            | RuleActionConfig::Fail {} => true,
        }
    }
}

pub fn evaluate_rule_set<R, A>(
    rules: Vec<R>,
    reason_codes: &[FootprintReasonCode],
    vault_data: &VaultDataForRules, /* TODO: for waterfall, we won't execute on vault data based rules so
                                     * should probs more explicitly handle that vs having it pass in an
                                     * empty DUR here */
    // a bit annoying to have to put this here, but this is our one case currently where a ruleset is
    // evaluated but a particular action is not allowed. If we have already collected a document or already
    // step'd up, we want to ensure that we don't chose that action again maybe soon we'll put StepUp
    // rules in a separate group and evaluate those separately and then can remove this from here
    insight_events: &[InsightEvent],
    lists: &HashMap<ListId, ListWithDecryptedEntries>,
    rule_config: &RuleEvalConfig,
) -> (Vec<(R, bool)>, Option<A>)
where
    R: HasRule<A> + IsActionAllowed<A>,
    A: Ord + PartialOrd,
{
    let rule_results = rules
        .into_iter()
        .map(|r| {
            let eval = match evaluate_rule_expression(
                &r.expression(),
                reason_codes,
                vault_data,
                insight_events,
                lists,
            ) {
                Ok(r) => r,
                Err(err) => {
                    // !!!! For now, the only possible source of errors is from blocklist rules. If there is
                    // an error, we log and fail open by just treating the eval as false (ie instead of
                    // erroring the entire eval of the ruleset) when the new blocklist
                    // stuff seems more stable, we should maybe change this to a regular hard error
                    tracing::error!(?err, "Error evaluating rule expression, defaulting to `false`");
                    false
                }
            };
            (r, eval)
        })
        .collect_vec();
    // take the most punitive action coming from some rule that evaluated to true
    let action_triggered = rule_results
        .iter()
        .filter_map(|(r, e)| {
            if *e && r.is_action_allowed(rule_config) {
                Some(r.action())
            } else {
                None
            }
        })
        .max();

    (rule_results, action_triggered)
}

pub fn evaluate_rule_expression(
    rule_expression: &RuleExpression,
    reason_codes: &[FootprintReasonCode],
    vault_data: &VaultDataForRules,
    insight_events: &[InsightEvent],
    lists: &HashMap<ListId, ListWithDecryptedEntries>,
) -> FpResult<bool> {
    // Conditions in a Rule are all AND'd together
    // Empty rule_expression's with no conditions shouldn't be possible (should fail validation), but
    // should one of these sneak into existence (ie a bad manual PG fiddle) then we'd want to default to
    // evaluate to false there, not true
    let results = rule_expression
        .0
        .iter()
        .map(|c| evaluate_condition(c, reason_codes, vault_data, insight_events, lists))
        .collect::<Result<Vec<_>, _>>()?;
    Ok(!rule_expression.0.is_empty() && results.into_iter().all(|r| r))
}

// TODO: maybe use a Set here later but honestly at small N its probably moot
fn evaluate_condition(
    cond: &RuleExpressionCondition,
    reason_codes: &[FootprintReasonCode],
    vault_data: &VaultDataForRules,
    insight_events: &[InsightEvent],
    lists: &HashMap<ListId, ListWithDecryptedEntries>,
) -> FpResult<bool> {
    let res = match cond {
        RuleExpressionCondition::RiskSignal { field, op, value } => {
            let field_value = reason_codes.contains(field);
            match op {
                BooleanOperator::Equals => field_value == *value,
                BooleanOperator::DoesNotEqual => field_value != *value,
            }
        }
        RuleExpressionCondition::VaultData(vo) => {
            if let Some(field_value) = vault_data.get(vo.field()) {
                // n.b. We're returning errors if the field value is not of type string,
                // since non-string JSON values may have multiple representations.
                let field_string = field_value
                    .clone()
                    .as_string()
                    .map_err(|_| ServerErr("Only string-typed DIs can be used in vault rules"))?;
                match vo {
                    VaultOperation::Equals { field: _, op, value } => {
                        let is_equal = crypto::safe_compare(
                            field_string.leak().as_bytes(),
                            value.leak_to_string().as_bytes(),
                        );
                        match op {
                            Equals::Equals => is_equal,
                            Equals::DoesNotEqual => !is_equal,
                        }
                    }
                    VaultOperation::IsIn { field, op, value } => {
                        let list = lists
                            .get(value)
                            .ok_or(ServerErr!("Missing List needed for rule evaluation: {}", value))?;
                        let is_in_list = vault_data_is_in_list(field, field_string, list)?;
                        match op {
                            IsIn::IsIn => is_in_list,
                            IsIn::IsNotIn => !is_in_list,
                        }
                    }
                }
            } else {
                // if vault data is missing, never evaluate to true
                false
            }
        }
        RuleExpressionCondition::DeviceInsight(dio) => match dio {
            DeviceInsightOperation::IsIn { field, op, value } => {
                let list = lists
                    .get(value)
                    .ok_or(ServerErr!("Missing List needed for rule evaluation: {}", value))?;
                match op {
                    IsIn::IsIn => insight_field_value_is_in_list(field, insight_events, list)?,
                    IsIn::IsNotIn => !insight_field_value_is_in_list(field, insight_events, list)?,
                }
            }
        },
        RuleExpressionCondition::RiskScore {
            field: _,
            op: _,
            value: _,
        } => return ServerErrInto("RiskScore rules not supported"),
    };
    Ok(res)
}

fn vault_data_is_in_list(
    field: &DataIdentifier,
    value: PiiString,
    list: &ListWithDecryptedEntries,
) -> FpResult<bool> {
    let (list, entries) = list;

    match (field, list.kind) {
        (DataIdentifier::Id(IdentityDataKind::Email), ListKind::EmailAddress)
        | (DataIdentifier::Id(IdentityDataKind::Email), ListKind::EmailDomain)
        | (DataIdentifier::Id(IdentityDataKind::Ssn9), ListKind::Ssn9)
        | (DataIdentifier::Id(IdentityDataKind::PhoneNumber), ListKind::PhoneNumber)
        | (DataIdentifier::Id(IdentityDataKind::PhoneNumber), ListKind::PhoneCountryCode)
        | (DataIdentifier::Business(BusinessDataKind::PhoneNumber), ListKind::PhoneNumber)
        | (DataIdentifier::Business(BusinessDataKind::PhoneNumber), ListKind::PhoneCountryCode)
        | (DataIdentifier::Custom(_), _) => {}
        (field, _) => {
            // This should have been validated when the rule was written.
            return ServerErrInto!(
                "Cannot check membership of DI {} in list with kind {}",
                field,
                list.kind
            );
        }
    };

    let derived_value = match list.kind {
        ListKind::EmailAddress => value,
        ListKind::EmailDomain => Email::from_str(value.leak())?.domain().into(),
        ListKind::Ssn9 => value,
        ListKind::PhoneNumber => value,
        ListKind::PhoneCountryCode => PhoneNumber::from_str(value.leak())?.country_code(),
        ListKind::IpAddress => {
            // This should have been validated when the rule was written.
            return ServerErrInto("IpAddress list not acceptable in VaultData rule");
        }
    };

    let parsed = ListEntryValue::parse(list.kind, derived_value)?;
    let canon = parsed.canonicalize();
    let canon_bytes = canon.leak().as_bytes();

    let exact_match = entries
        .iter()
        .any(|(_, e)| crypto::safe_compare(canon_bytes, e.leak().as_bytes()));

    Ok(exact_match)
}

fn insight_field_value_is_in_list(
    field: &DeviceInsightField,
    insight_events: &[InsightEvent],
    list: &ListWithDecryptedEntries,
) -> FpResult<bool> {
    let (list, entries) = list;

    if list.kind != ListKind::IpAddress {
        return ServerErrInto!(
            "Cannot check membership of Device Insight field {} in list with kind {}",
            field,
            list.kind
        );
    }

    for event in insight_events {
        let value = match field {
            DeviceInsightField::IpAddress => event.ip_address.clone(),
        };
        let Some(value) = value else { continue };

        let parsed = ListEntryValue::parse(list.kind, value.into())?;
        let canon = parsed.canonicalize();
        let canon_bytes = canon.leak().as_bytes();

        let exact_match = entries
            .iter()
            .any(|(_, e)| crypto::safe_compare(canon_bytes, e.leak().as_bytes()));
        if exact_match {
            return Ok(true);
        }
    }

    Ok(false)
}

#[cfg(test)]
pub mod tests {
    use super::*;
    use crate::decision::rule_engine::engine::VaultDataForRules;
    use newtypes::BooleanOperator as BO;
    use newtypes::DataIdentifier as DI;
    use newtypes::FootprintReasonCode as FRC;
    use newtypes::IdentityDataKind;
    use newtypes::InvestorProfileKind;
    use newtypes::PiiJsonValue;
    use newtypes::RuleAction as RA;
    use newtypes::RuleExpression as RE;
    use newtypes::RuleExpressionCondition as REC;
    use newtypes::StepUpKind;
    use std::collections::HashMap;
    use test_case::test_case;

    // just to avoid having to make RuleInstance's. Also proves that we could use evaluate_rules in a
    // RAM-only way (ie for backtesting or whatever)
    pub struct TRule(pub RE, pub RA);
    impl HasRule<RA> for TRule {
        fn expression(&self) -> RE {
            self.0.clone()
        }

        fn action(&self) -> RA {
            self.1
        }
    }
    impl IsActionAllowed<RA> for TRule {
        fn is_action_allowed(&self, rule_config: &RuleEvalConfig) -> bool {
            rule_config.action_is_allowed(&self.action().to_rule_action())
        }
    }

    fn id_doc_collected() -> Vec<DocumentRequestConfig> {
        vec![DocumentRequestConfig::Identity {
            collect_selfie: true,
            document_types_and_countries: None,
        }]
    }

    fn poa_doc_collected() -> Vec<DocumentRequestConfig> {
        vec![DocumentRequestConfig::ProofOfAddress {
            requires_human_review: true,
        }]
    }

    fn id_poa_collected() -> Vec<DocumentRequestConfig> {
        vec![
            DocumentRequestConfig::Identity {
                collect_selfie: true,
                document_types_and_countries: None,
            },
            DocumentRequestConfig::ProofOfAddress {
                requires_human_review: true,
            },
        ]
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
        docs_collected: Vec<DocumentRequestConfig>,
    ) -> (Vec<bool>, Option<RuleAction>) {
        let config = RuleEvalConfig::new(docs_collected);
        let (rule_results, action) = evaluate_rule_set(
            rules,
            &input,
            &VaultDataForRules::empty(),
            &[],
            &HashMap::new(),
            &config,
        );
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
        evaluate_rule_expression(&re, &input, &VaultDataForRules::empty(), &[], &HashMap::new()).unwrap()
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
        evaluate_condition(&cond, &input, &VaultDataForRules::empty(), &[], &HashMap::new()).unwrap()
    }


    #[test]
    pub fn test_basic_vault_data_setup() {
        let vault_data: HashMap<DataIdentifier, PiiJsonValue> = HashMap::from([
            (
                DataIdentifier::Id(IdentityDataKind::FirstName),
                PiiJsonValue::string("Bob"),
            ),
            (
                DataIdentifier::InvestorProfile(InvestorProfileKind::Declarations),
                PiiJsonValue::parse_from_str("[\"affiliated_with_us_broker\"]").unwrap(),
            ),
            (
                DataIdentifier::InvestorProfile(InvestorProfileKind::InvestmentGoals),
                PiiJsonValue::parse_from_str("[\"buy_a_home\", \"speculation\"]").unwrap(),
            ),
        ]);
        let vd = VaultDataForRules::new(vault_data);

        assert!(evaluate_condition(
            &REC::VaultData(VaultOperation::Equals {
                field: DataIdentifier::Id(IdentityDataKind::FirstName),
                op: Equals::Equals,
                value: "Bob".into(),
            }),
            &Vec::<FRC>::new(),
            &vd,
            &[],
            &HashMap::new()
        )
        .unwrap());

        assert!(!evaluate_condition(
            &REC::VaultData(VaultOperation::Equals {
                field: DataIdentifier::Id(IdentityDataKind::FirstName),
                op: Equals::Equals,
                value: "Alice".into(),
            }),
            &Vec::<FRC>::new(),
            &vd,
            &[],
            &HashMap::new()
        )
        .unwrap());
    }

    #[test_case(
        (DI::Id(IdentityDataKind::VisaKind), Equals::Equals, "e3"),
        vec![(DI::Id(IdentityDataKind::VisaKind), "e3")]
    => true)]
    #[test_case(
        (DI::Id(IdentityDataKind::VisaKind), Equals::Equals, "e3"),
        vec![
            (DI::Id(IdentityDataKind::VisaKind), "other"),
            (DI::Id(IdentityDataKind::VisaKind), "e3"),
        ]
    => true)]
    #[test_case(
        (DI::Id(IdentityDataKind::VisaKind), Equals::Equals, "e3"),
        vec![(DI::Id(IdentityDataKind::VisaKind), "other")]
    => false)]
    pub fn test_evaluate_vault_condition_equality(
        rule: (DI, Equals, &str),
        vault_data: Vec<(DI, &str)>,
    ) -> bool {
        let vault_data = vault_data
            .into_iter()
            .map(|(di, v)| (di, PiiJsonValue::string(v)))
            .collect();
        let vd = VaultDataForRules::new(vault_data);

        let (rule_field, rule_op, value) = rule;
        let cond = REC::VaultData(VaultOperation::Equals {
            field: rule_field,
            op: rule_op,
            value: value.into(),
        });

        evaluate_condition(&cond, &[], &vd, &[], &HashMap::new()).unwrap()
    }

    #[test_case(
        (ListKind::EmailAddress, vec![]),
        (DI::Id(IdentityDataKind::Email), IsIn::IsIn),
        vec![(DI::Id(IdentityDataKind::Email), "bob@bobertotech.org"),]
    => false; "no entries")]
    #[test_case(
        (ListKind::EmailAddress, vec![]),
        (DI::Id(IdentityDataKind::Email), IsIn::IsIn),
        vec![]
    => false; "no entries, no vd")]
    #[test_case(
        (ListKind::EmailAddress, vec![]),
        (DI::Id(IdentityDataKind::Email), IsIn::IsNotIn),
        vec![(DI::Id(IdentityDataKind::Email), "bob@bobertotech.org"),]
    => true; "no entries, IsNotIn")]
    #[test_case(
        (ListKind::EmailAddress, vec![]),
        (DI::Id(IdentityDataKind::Email), IsIn::IsNotIn),
        vec![]
    => false; "no entries, no vd, IsNotIn (vd not present always evals to false)")]
    #[test_case(
        (ListKind::EmailAddress, vec!["bob@bobertotech.org"]),
        (DI::Id(IdentityDataKind::Email), IsIn::IsIn),
        vec![(DI::Id(IdentityDataKind::AddressLine1), "bob@bobertotech.org"),]
    => false; "single entry, different vd kind")]
    #[test_case(
        (ListKind::EmailAddress, vec!["bob@bobertotech.org"]),
        (DI::Id(IdentityDataKind::Email), IsIn::IsIn),
        vec![(DI::Id(IdentityDataKind::Email), "bob@bobertotech.org"),]
    => true; "single entry, matching vd")]
    #[test_case(
        (ListKind::EmailAddress, vec!["baddies@wenotgood.com", "bob@bobertotech.org", "aksdfj@fasdjk.net"]),
        (DI::Id(IdentityDataKind::Email), IsIn::IsIn),
        vec![(DI::Id(IdentityDataKind::Email), "bob@bobertotech.org"),]
    => true; "multiple entries, matching vd")]
    #[test_case(
        (ListKind::EmailAddress, vec!["baddies@wenotgood.com", "bob@bobertotech.org", "aksdfj@fasdjk.net"]),
        (DI::Id(IdentityDataKind::Email), IsIn::IsIn),
        vec![(DI::Id(IdentityDataKind::Email), "bob3421@bobertotech.org"),]
    => false; "multiple entries, no matching vd")]
    #[test_case(
        (ListKind::EmailDomain, vec!["bobertotech.org"]),
        (DI::Id(IdentityDataKind::Email), IsIn::IsIn),
        vec![(DI::Id(IdentityDataKind::Email), "alice@bobertotech.org"),]
    => true; "EmailDomain, matches")]
    #[test_case(
        (ListKind::EmailDomain, vec!["bobertotech.org"]),
        (DI::Id(IdentityDataKind::Email), IsIn::IsIn),
        vec![(DI::Id(IdentityDataKind::Email), "alice@bobertotech.net"),]
    => false; "EmailDomain, no match")]
    #[test_case(
        (ListKind::Ssn9, vec!["222222222"]),
        (DI::Id(IdentityDataKind::Ssn9), IsIn::IsIn),
        vec![(DI::Id(IdentityDataKind::Ssn9), "222222222"),]
    => true; "ssn9, matches")]
    #[test_case(
        (ListKind::Ssn9, vec!["111111111", "222222222"]),
        (DI::Id(IdentityDataKind::Ssn9), IsIn::IsIn),
        vec![(DI::Id(IdentityDataKind::Ssn9), "333333333"),]
    => false; "ssn9, no match")]
    #[test_case(
        (ListKind::PhoneNumber, vec!["+15555555555"]),
        (DI::Id(IdentityDataKind::PhoneNumber), IsIn::IsIn),
        vec![(DI::Id(IdentityDataKind::PhoneNumber), "+15555555555"),]
    => true; "PhoneNumber, matches")]
    #[test_case(
        (ListKind::PhoneNumber, vec!["+15555555555"]),
        (DI::Id(IdentityDataKind::PhoneNumber), IsIn::IsIn),
        vec![(DI::Id(IdentityDataKind::PhoneNumber), "+14444444444"),]
    => false; "PhoneNumber, no match")]
    #[test_case(
        (ListKind::PhoneCountryCode, vec!["1"]),
        (DI::Id(IdentityDataKind::PhoneNumber), IsIn::IsIn),
        vec![(DI::Id(IdentityDataKind::PhoneNumber), "+15555555555"),]
    => true; "PhoneCountryCode, matches")]
    #[test_case(
        (ListKind::PhoneCountryCode, vec!["1", "2"]),
        (DI::Id(IdentityDataKind::PhoneNumber), IsIn::IsIn),
        vec![(DI::Id(IdentityDataKind::PhoneNumber), "+35555555555"),]
    => false; "PhoneCountryCode, no match")]
    pub fn test_evaluate_vault_condition_lists(
        list: (ListKind, Vec<&str>),
        rule: (DI, IsIn),
        vault_data: Vec<(DI, &str)>,
    ) -> bool {
        let (list_kind, list_entries) = list;
        let (rule_field, rule_op) = rule;

        let vault_data = vault_data
            .into_iter()
            .map(|(di, v)| (di, PiiJsonValue::string(v)))
            .collect();
        let vd = VaultDataForRules::new(vault_data);

        let list = db::tests::fixtures::list::create_in_memory(list_kind);
        let list_id = list.id.clone();
        let list_entries = list_entries
            .into_iter()
            .map(|s| (db::tests::fixtures::list_entry::create_in_memory(), s.into()))
            .collect();
        let lists = HashMap::from_iter([(list_id.clone(), (list, list_entries))]);

        let cond = REC::VaultData(VaultOperation::IsIn {
            field: rule_field,
            op: rule_op,
            value: list_id,
        });

        evaluate_condition(&cond, &[], &vd, &[], &lists).unwrap()
    }

    #[test_case(
        (ListKind::IpAddress, vec!["1.2.3.4", "5.6.7.8"]),
        (DeviceInsightField::IpAddress, IsIn::IsIn),
        vec![
            InsightEvent{
                ip_address: Some("2.4.6.8".to_owned()),
                ..InsightEvent::default()
            },
        ]
    => false; "IP address, no match")]
    #[test_case(
        (ListKind::IpAddress, vec!["1.2.3.4", "5.6.7.8"]),
        (DeviceInsightField::IpAddress, IsIn::IsIn),
        vec![
            InsightEvent{
                ip_address: Some("1.2.3.4".to_owned()),
                ..InsightEvent::default()
            },
        ]
    => true; "IP address, match IPv4")]
    #[test_case(
        (ListKind::IpAddress, vec!["1.2.3.4", "3f02:cad:1ce7:8b65:fa3d:9c4b:17ef:ac12"]),
        (DeviceInsightField::IpAddress, IsIn::IsIn),
        vec![
            InsightEvent{
                ip_address: Some("3f02:cad:1ce7:8b65:fa3d:9c4b:17ef:ac12".to_owned()),
                ..InsightEvent::default()
            },
        ]
    => true; "IP address, match IPv6")]
    #[test_case(
        (ListKind::IpAddress, vec!["1.2.3.4", "5.6.7.8"]),
        (DeviceInsightField::IpAddress, IsIn::IsIn),
        vec![
            InsightEvent{
                ip_address: Some("::ffff:1.2.3.4".to_owned()),
                ..InsightEvent::default()
            },
        ]
    => true; "IP address, match canonicalized")]
    pub fn test_evaluate_insight_condition_lists(
        list: (ListKind, Vec<&str>),
        rule: (DeviceInsightField, IsIn),
        insight_events: Vec<InsightEvent>,
    ) -> bool {
        let (list_kind, list_entries) = list;
        let (rule_field, rule_op) = rule;

        let list = db::tests::fixtures::list::create_in_memory(list_kind);
        let list_id = list.id.clone();
        let list_entries = list_entries
            .into_iter()
            .map(|s| (db::tests::fixtures::list_entry::create_in_memory(), s.into()))
            .collect();
        let lists = HashMap::from_iter([(list_id.clone(), (list, list_entries))]);

        let cond = REC::DeviceInsight(DeviceInsightOperation::IsIn {
            field: rule_field,
            op: rule_op,
            value: list_id,
        });

        evaluate_condition(&cond, &[], &VaultDataForRules::empty(), &insight_events, &lists).unwrap()
    }
}
