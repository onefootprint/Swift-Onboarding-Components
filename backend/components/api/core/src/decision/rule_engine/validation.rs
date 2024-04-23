use crate::errors::{ApiResult, ValidationError};
use api_wire_types::UnvalidatedRuleExpression;
use db::models::list::List;
use newtypes::{
    AllData, BusinessDataKind, DataIdentifier, IdentityDataKind, ListId, ListKind, PiiJsonValue,
    RuleExpression, RuleExpressionCondition, Validate, ValidateArgs, VaultOperation,
};
use std::collections::HashMap;

pub fn validate_rule_expression(
    rule_expression: UnvalidatedRuleExpression,
    lists: &HashMap<ListId, List>,
    is_live: bool,
) -> ApiResult<RuleExpression> {
    for condition in rule_expression.0.iter() {
        match condition {
            RuleExpressionCondition::RiskSignal { .. } => {}
            RuleExpressionCondition::VaultData(vault_data) => match vault_data {
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
            RuleExpressionCondition::RiskScore { .. } => {}
        }
    }

    Ok(RuleExpression(rule_expression.0))
}
