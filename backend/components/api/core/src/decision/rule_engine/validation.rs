use crate::errors::{ApiResult, AssertionError, ValidationError};
use api_wire_types::UnvalidatedRuleExpression;
use db::models::list::List;
use newtypes::{
    AllData, BusinessDataKind, DataIdentifier, DeviceInsightField, DeviceInsightOperation, IdentityDataKind,
    ListId, ListKind, PiiJsonValue, RuleExpression, RuleExpressionCondition, RuleInstanceKind, Validate,
    ValidateArgs, VaultOperation,
};
use std::collections::HashMap;

pub fn validate_rule_expression(
    rule_expression: UnvalidatedRuleExpression,
    lists: &HashMap<ListId, List>,
    is_live: bool,
) -> ApiResult<(RuleExpression, RuleInstanceKind)> {
    for condition in rule_expression.0.iter() {
        match condition {
            RuleExpressionCondition::RiskSignal { .. } => {}
            RuleExpressionCondition::VaultData(vault_op) => match vault_op {
                VaultOperation::Equals { field, op: _, value } => {
                    let all_data = AllData::new();
                    field.clone().validate(
                        PiiJsonValue::from_piistring(value.clone()),
                        ValidateArgs {
                            for_bifrost: false,
                            allow_dangling_keys: true,
                            ignore_luhn_validation: true,
                            is_live,
                        },
                        &all_data,
                    )?;
                }
                VaultOperation::IsIn { field, op: _, value } => {
                    let Some(list) = lists.get(value) else {
                        return ValidationError(&format!("List with ID {} not found", value)).into();
                    };

                    if list.is_live != is_live {
                        return ValidationError("List is_live does not match is_live context").into();
                    }

                    let di_matches_list_kind = match list.kind {
                        ListKind::EmailAddress | ListKind::EmailDomain => {
                            matches!(
                                field,
                                DataIdentifier::Id(IdentityDataKind::Email) | DataIdentifier::Custom(_)
                            )
                        }
                        ListKind::Ssn9 => {
                            matches!(
                                field,
                                DataIdentifier::Id(IdentityDataKind::Ssn9) | DataIdentifier::Custom(_)
                            )
                        }
                        ListKind::PhoneNumber | ListKind::PhoneCountryCode => {
                            matches!(
                                field,
                                DataIdentifier::Id(IdentityDataKind::PhoneNumber)
                                    | DataIdentifier::Custom(_)
                                    | DataIdentifier::Business(BusinessDataKind::PhoneNumber)
                            )
                        }
                        ListKind::IpAddress => false,
                    };

                    if !di_matches_list_kind {
                        return ValidationError(
                            format!(
                                "Vaulted field {} can not be matched against list with kind {}",
                                field, list.kind
                            )
                            .as_str(),
                        )
                        .into();
                    }
                }
            },
            RuleExpressionCondition::DeviceInsight(insight_op) => match insight_op {
                DeviceInsightOperation::IsIn { field, op: _, value } => {
                    let Some(list) = lists.get(value) else {
                        return ValidationError(&format!("List with ID {} not found", value)).into();
                    };

                    if list.is_live != is_live {
                        return ValidationError("List is_live does not match is_live context").into();
                    }

                    let di_matches_list_kind = match list.kind {
                        ListKind::IpAddress => *field == DeviceInsightField::IpAddress,
                        ListKind::EmailAddress
                        | ListKind::EmailDomain
                        | ListKind::Ssn9
                        | ListKind::PhoneNumber
                        | ListKind::PhoneCountryCode => false,
                    };

                    if !di_matches_list_kind {
                        return ValidationError(
                            format!(
                                "Device Insight field {} can not be matched against list with kind {}",
                                field, list.kind
                            )
                            .as_str(),
                        )
                        .into();
                    }
                }
            },
            RuleExpressionCondition::RiskScore { .. } => {}
        }
    }

    let rule_kinds = rule_expression.0.iter().map(rule_instance_kind_from_condition);
    // make sure all rule expressions are about the same subject
    let (person_rules, business_rules): (Vec<_>, Vec<_>) = rule_kinds
        .clone()
        .filter(|rik| !matches!(rik, RuleInstanceKind::Any)) // don't need to validate `Any rules`
        .partition(|rik| matches!(rik, RuleInstanceKind::Person));

    // TODO: add RIK type that can be combined with person OR business
    if !person_rules.is_empty() && !business_rules.is_empty() {
        return ValidationError(
            "Cannot make a rule expression that includes both Person and Business signals",
        )
        .into();
    };

    // If a rule includes a Person condition AND an `Any` condition, consider it a Person rule only.
    let rule_instance_kind = rule_kinds
        .min()
        .ok_or(AssertionError("unable to compute rule instance kind"))?;


    Ok((RuleExpression(rule_expression.0), rule_instance_kind))
}


// TODO: test
pub fn rule_instance_kind_from_condition(condition: &RuleExpressionCondition) -> RuleInstanceKind {
    let is_business = match condition {
        RuleExpressionCondition::RiskSignal { field, .. } => field
            .scopes()
            .iter()
            .all(|s| !s.is_for_person() && s.is_for_kyb()),
        RuleExpressionCondition::VaultData(vault_data) => match vault_data {
            VaultOperation::Equals { field, .. } => matches!(field, DataIdentifier::Business(_)),
            VaultOperation::IsIn { field, .. } => matches!(field, DataIdentifier::Business(_)),
        },
        RuleExpressionCondition::RiskScore { .. } => false, // TODO
        RuleExpressionCondition::DeviceInsight(..) => false,
    };

    // These can span Business and Person
    let is_device_insight = matches!(condition, RuleExpressionCondition::DeviceInsight(_));

    if is_business {
        RuleInstanceKind::Business
    } else if is_device_insight {
        RuleInstanceKind::Any
    } else {
        RuleInstanceKind::Person
    }
}
