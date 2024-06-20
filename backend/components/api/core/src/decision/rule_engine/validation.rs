use crate::errors::ApiResult;
use crate::errors::AssertionError;
use crate::errors::ValidationError;
use api_wire_types::UnvalidatedRuleExpression;
use db::models::list::List;
use newtypes::AllData;
use newtypes::BusinessDataKind;
use newtypes::CardDataKind;
use newtypes::CleanAndValidate;
use newtypes::DataIdentifier;
use newtypes::DeviceInsightField;
use newtypes::DeviceInsightOperation;
use newtypes::IdentityDataKind;
use newtypes::ListId;
use newtypes::ListKind;
use newtypes::PiiJsonValue;
use newtypes::RuleExpression;
use newtypes::RuleExpressionCondition;
use newtypes::RuleInstanceKind;
use newtypes::ValidateArgs;
use newtypes::VaultOperation;
use std::collections::HashMap;

// We only support quality rules for DIs that are not sensitive (low cardinality and un-interesting
// even when correlated with other non-sensitive DIs). This helps avoid leaking sensitive data or
// using backtesting of vault equality rules to brute-force sensitive data.
fn di_supports_equality_rules(field: &DataIdentifier) -> bool {
    match field {
        DataIdentifier::Id(kind) => match kind {
            IdentityDataKind::Country
            | IdentityDataKind::UsLegalStatus
            | IdentityDataKind::VisaKind
            | IdentityDataKind::DriversLicenseState => true,
            IdentityDataKind::FirstName
            | IdentityDataKind::MiddleName
            | IdentityDataKind::LastName
            | IdentityDataKind::Dob
            | IdentityDataKind::Ssn4
            | IdentityDataKind::Ssn9
            | IdentityDataKind::AddressLine1
            | IdentityDataKind::AddressLine2
            | IdentityDataKind::City
            | IdentityDataKind::State
            | IdentityDataKind::Zip
            | IdentityDataKind::Email
            | IdentityDataKind::PhoneNumber
            | IdentityDataKind::VisaExpirationDate
            | IdentityDataKind::Nationality
            | IdentityDataKind::Citizenships
            | IdentityDataKind::DriversLicenseNumber => false,
        },
        DataIdentifier::Card(card_info) => match card_info.kind {
            CardDataKind::BillingCountry | CardDataKind::Issuer => true,
            CardDataKind::Number
            | CardDataKind::Expiration
            | CardDataKind::Cvc
            | CardDataKind::Name
            | CardDataKind::BillingZip
            | CardDataKind::ExpMonth
            | CardDataKind::ExpYear
            | CardDataKind::Last4 => false,
        },
        DataIdentifier::Custom(_) => false,
        DataIdentifier::Business(_) => false,
        DataIdentifier::InvestorProfile(_) => false,
        DataIdentifier::Document(_) => false,
    }
}

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
                    if !di_supports_equality_rules(field) {
                        return ValidationError(&format!(
                            "Vaulted field {} does not support equality rules",
                            field
                        ))
                        .into();
                    }
                    let all_data = AllData::new();
                    field.clone().clean_and_validate(
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

#[cfg(test)]
mod tests {
    use super::*;
    use crate::ApiError;
    use chrono::Utc;
    use newtypes::data_identifier::Error as DiValidationError;
    use newtypes::AliasId;
    use newtypes::BooleanOperator;
    use newtypes::CardInfo;
    use newtypes::DataIdentifier as DI;
    use newtypes::DataLifetimeSeqno;
    use newtypes::DbActor;
    use newtypes::Equals;
    use newtypes::Error as NewtypeError;
    use newtypes::FootprintReasonCode as FRC;
    use newtypes::IsIn;
    use newtypes::ListAlias;
    use newtypes::ListId;
    use newtypes::ListKind;
    use newtypes::SealedVaultDataKey;
    use newtypes::TenantId;
    use std::str::FromStr;
    use test_case::test_case;

    fn test_list_id() -> ListId {
        ListId::from("l1234".to_string())
    }
    fn test_list(kind: ListKind) -> List {
        List {
            id: test_list_id(),
            created_at: Utc::now(),
            created_seqno: DataLifetimeSeqno::default(),
            _created_at: Utc::now(),
            _updated_at: Utc::now(),
            deactivated_at: None,
            deactivated_seqno: None,
            tenant_id: TenantId::from_str("t1234").unwrap(),
            is_live: true,
            actor: DbActor::Footprint,
            name: "l1".into(),
            alias: ListAlias::from_str("la1234").unwrap(),
            kind,
            e_data_key: SealedVaultDataKey(vec![]),
        }
    }

    fn validation_error(s: &str) -> ApiError {
        ValidationError(s).into()
    }

    #[test_case(vec![
        RuleExpressionCondition::RiskSignal {
            field: FRC::DobCouldNotMatch,
            op: BooleanOperator::Equals,
            value: true,
        },
        RuleExpressionCondition::RiskSignal {
            field: FRC::IdNotLocated,
            op: BooleanOperator::Equals,
            value: true,
        },
        RuleExpressionCondition::DeviceInsight(
            DeviceInsightOperation::IsIn {
                field: DeviceInsightField::IpAddress,
                op: IsIn::IsIn,
                value: test_list_id(),
            },
        )
    ], Ok(RuleInstanceKind::Person))]
    #[test_case(vec![
        RuleExpressionCondition::RiskSignal {
            field: FRC::BusinessAddressIncompleteMatch,
            op: BooleanOperator::Equals,
            value: true,
        },
        RuleExpressionCondition::RiskSignal {
            field: FRC::BusinessAddressCloseMatch,
            op: BooleanOperator::Equals,
            value: true,
        },
        RuleExpressionCondition::DeviceInsight(
            DeviceInsightOperation::IsIn {
                field: DeviceInsightField::IpAddress,
                op: IsIn::IsIn,
                value: test_list_id(),
            },
        )
    ], Ok(RuleInstanceKind::Business))]
    #[test_case(vec![
        RuleExpressionCondition::DeviceInsight(
            DeviceInsightOperation::IsIn {
                field: DeviceInsightField::IpAddress,
                op: IsIn::IsIn,
                value: test_list_id(),
            },
        )], Ok(RuleInstanceKind::Any))]
    #[test_case(vec![
        RuleExpressionCondition::RiskSignal {
            field: FRC::BusinessAddressIncompleteMatch,
            op: BooleanOperator::Equals,
            value: true,
        },
        RuleExpressionCondition::RiskSignal {
            field: FRC::IdNotLocated,
            op: BooleanOperator::Equals,
            value: true,
        },
       ], Err(validation_error("Cannot make a rule expression that includes both Person and Business signals")))]
    #[test_case(vec![
        RuleExpressionCondition::VaultData(
            VaultOperation::Equals {
                field: DI::Id(IdentityDataKind::Email),
                op: Equals::Equals,
                value: "abc@123.com".into(),
            }
        ),
    ], Err(validation_error("Vaulted field id.email does not support equality rules")))]
    #[test_case(vec![
        RuleExpressionCondition::VaultData(
            VaultOperation::Equals {
                field: DI::Id(IdentityDataKind::Ssn9),
                op: Equals::DoesNotEqual,
                value: "123-12-1234".into(),
            }
        ),
    ], Err(validation_error("Vaulted field id.ssn9 does not support equality rules")))]
    #[test_case(vec![
        RuleExpressionCondition::VaultData(
            VaultOperation::Equals {
                field: DI::Business(BusinessDataKind::Name),
                op: Equals::Equals,
                value: "Acme Inc.".into(),
            }
        ),
    ], Err(validation_error("Vaulted field business.name does not support equality rules")))]
    #[test_case(vec![
        RuleExpressionCondition::VaultData(
            VaultOperation::Equals {
                field: DI::Card(CardInfo{ alias: AliasId::fixture(), kind: CardDataKind::Issuer}),
                op: Equals::Equals,
                value: "visa".into(),
            }
        ),
    ], Ok(RuleInstanceKind::Person))]
    #[test_case(vec![
        RuleExpressionCondition::VaultData(
            VaultOperation::Equals {
                field: DI::Card(CardInfo{ alias: AliasId::fixture(), kind: CardDataKind::BillingCountry}),
                op: Equals::DoesNotEqual,
                value: "US".into(),
            }
        ),
    ], Ok(RuleInstanceKind::Person))]
    #[test_case(vec![
        RuleExpressionCondition::VaultData(
            VaultOperation::Equals {
                field: DI::Card(CardInfo{ alias: AliasId::fixture(), kind: CardDataKind::BillingCountry}),
                op: Equals::DoesNotEqual,
                value: "not-a-country".into(),
            }
        ),
    ], Err(ApiError::from(NewtypeError::ParsingError(DiValidationError::InvalidCountry))))]
    #[test_case(vec![
        RuleExpressionCondition::VaultData(
            VaultOperation::Equals {
                field: DI::Id(IdentityDataKind::VisaKind),
                op: Equals::Equals,
                value: "not-a-visa-kind".into(),
            }
        ),
    ], Err(ApiError::from(NewtypeError::ParsingError(DiValidationError::CannotParseEnum(strum::ParseError::VariantNotFound)))))]
    fn test_validate_rule_expression_for_rule_instance_kind(
        recs: Vec<RuleExpressionCondition>,
        expected_kind: ApiResult<RuleInstanceKind>,
    ) {
        let unvalidated = UnvalidatedRuleExpression(recs);
        let lists = HashMap::from_iter([(test_list_id(), test_list(ListKind::IpAddress))]);

        let rule_instance_kind = validate_rule_expression(unvalidated, &lists, true).map(|(_, rik)| rik);
        match (rule_instance_kind, expected_kind) {
            (Ok(rik), Ok(expected_rik)) => assert_eq!(rik, expected_rik),
            (Err(err), Err(expected_err)) => {
                if err.to_string() != expected_err.to_string() {
                    panic!("expected {:?}, got {:?}", expected_err, err);
                }
            }
            (got, expected) => panic!("expected {:?}, got {:?}", expected, got),
        }
    }
}
