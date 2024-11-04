use crate::errors::ValidationError;
use crate::FpResult;
use api_wire_types::MultiUpdateRuleRequest;
use db::models::list::List;
use db::models::rule_instance::MultiRuleUpdate;
use db::models::rule_instance::NewRule;
use db::models::rule_instance::RuleInstanceUpdate;
use db::PgConn;
use itertools::chain;
use itertools::Itertools;
use newtypes::AllData;
use newtypes::BankDataKind;
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
use newtypes::TenantId;
use newtypes::UnvalidatedRuleExpression;
use newtypes::ValidateArgs;
use newtypes::VaultOperation;
use std::collections::HashMap;
use std::collections::HashSet;

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
            | IdentityDataKind::VerifiedEmail
            | IdentityDataKind::PhoneNumber
            | IdentityDataKind::VerifiedPhoneNumber
            | IdentityDataKind::VisaExpirationDate
            | IdentityDataKind::Nationality
            | IdentityDataKind::Citizenships
            | IdentityDataKind::DriversLicenseNumber
            | IdentityDataKind::UsTaxId
            | IdentityDataKind::Itin => false,
        },
        DataIdentifier::Card(card_info) => match card_info.kind {
            CardDataKind::BillingCountry | CardDataKind::Issuer | CardDataKind::Fingerprint => true,
            CardDataKind::Number
            | CardDataKind::Expiration
            | CardDataKind::Cvc
            | CardDataKind::Name
            | CardDataKind::BillingZip
            | CardDataKind::ExpMonth
            | CardDataKind::ExpYear
            | CardDataKind::Last4 => false,
        },
        DataIdentifier::Bank(bank_info) => match bank_info.kind {
            BankDataKind::AchRoutingNumber
            | BankDataKind::AchAccountId
            | BankDataKind::AccountType
            | BankDataKind::Name
            | BankDataKind::Fingerprint => true,
            BankDataKind::AchAccountNumber => false,
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
) -> FpResult<RuleExpression> {
    for condition in rule_expression.0.iter() {
        match condition {
            RuleExpressionCondition::RiskSignal { .. } => {}
            RuleExpressionCondition::VaultData(vault_op) => match vault_op {
                VaultOperation::Equals {
                    ref field,
                    op: _,
                    value,
                } => {
                    if !di_supports_equality_rules(field) {
                        return ValidationError(&format!(
                            "Vaulted field {} does not support equality rules",
                            field
                        ))
                        .into();
                    }
                    let all_data = AllData::new();
                    field.clone().clean_and_validate(
                        PiiJsonValue::from(value.clone()),
                        ValidateArgs {
                            for_bifrost: false,
                            ignore_luhn_validation: true,
                            is_live,
                        },
                        &all_data,
                    )?;
                }
                VaultOperation::IsIn {
                    field,
                    op: _,
                    ref value,
                } => {
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
                DeviceInsightOperation::IsIn {
                    field,
                    op: _,
                    ref value,
                } => {
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

    let rule_expression = rule_expression.validate()?;

    Ok(rule_expression)
}

// TODO: TEST compared to .kind
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


pub fn validate_rules_request(
    conn: &mut PgConn,
    tenant_id: &TenantId,
    is_live: bool,
    req: MultiUpdateRuleRequest,
) -> FpResult<MultiRuleUpdate> {
    let MultiUpdateRuleRequest {
        expected_rule_set_version,
        add,
        edit,
        delete,
    } = req;

    let list_ids: Vec<ListId> = chain(
        add.iter()
            .flatten()
            .flat_map(|rule| rule.rule_expression.list_ids()),
        edit.iter()
            .flatten()
            .flat_map(|rule| rule.rule_expression.list_ids()),
    )
    .collect();
    let lists = List::bulk_get(conn, tenant_id, is_live, &list_ids)?;

    let new_rules = add
        .unwrap_or_default()
        .into_iter()
        .map(|r| -> FpResult<_> {
            let rule_expression = validate_rule_expression(r.rule_expression, &lists, is_live)?;

            let (action, rule_action) = match r.rule_action {
                api_wire_types::RuleActionMigration::Legacy(rule_action) => {
                    (rule_action, rule_action.to_rule_action())
                }
                api_wire_types::RuleActionMigration::New(rule_action_config) => {
                    (rule_action_config.clone().into(), rule_action_config)
                }
            };
            Ok(NewRule {
                rule_expression,
                action,
                rule_action,
                name: r.name,
                is_shadow: r.is_shadow,
            })
        })
        .collect::<FpResult<Vec<_>>>()?;

    // check that the same rule isn't being edited and deleted
    let edit_rule_ids: HashSet<_> = edit
        .as_ref()
        .map(|v| v.iter().map(|e| e.rule_id.clone()).collect())
        .unwrap_or_default();
    let delete_rule_ids: HashSet<_> = delete
        .as_ref()
        .map(|v| v.iter().cloned().collect())
        .unwrap_or_default();
    let overlap = edit_rule_ids.intersection(&delete_rule_ids).collect_vec();
    if !overlap.is_empty()
        || edit_rule_ids.len() != edit.as_ref().map(|e| e.len()).unwrap_or(0)
        || delete_rule_ids.len() != delete.as_ref().map(|e| e.len()).unwrap_or(0)
    {
        return Err(ValidationError("Cannot perform multiple edits on the same rule").into());
    }

    let edit_updates = edit
        .unwrap_or_default()
        .into_iter()
        .map(|e| {
            let rule_expression = validate_rule_expression(e.rule_expression, &lists, is_live)?;
            Ok(RuleInstanceUpdate::update(
                e.rule_id,
                None,
                Some(rule_expression.clone()),
                None,
            ))
        })
        .collect::<FpResult<Vec<_>>>()?;

    let delete_updates = delete
        .unwrap_or_default()
        .into_iter()
        .map(RuleInstanceUpdate::delete)
        .collect_vec();

    let all_updates = edit_updates.into_iter().chain(delete_updates).collect_vec();

    if new_rules.is_empty() && all_updates.is_empty() {
        return Err(ValidationError("At least one update must be provided").into());
    }

    Ok(MultiRuleUpdate {
        expected_rule_set_version: Some(expected_rule_set_version),
        new_rules,
        updates: all_updates,
    })
}


#[cfg(test)]
mod tests {
    use super::*;
    use crate::FpError;
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

    fn validation_error(s: &str) -> FpError {
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
    ], Err(FpError::from(NewtypeError::ParsingError(DiValidationError::InvalidCountry))))]
    #[test_case(vec![
        RuleExpressionCondition::VaultData(
            VaultOperation::Equals {
                field: DI::Id(IdentityDataKind::VisaKind),
                op: Equals::Equals,
                value: "not-a-visa-kind".into(),
            }
        ),
    ], Err(FpError::from(NewtypeError::ParsingError(DiValidationError::CannotParseEnum(strum::ParseError::VariantNotFound)))))]
    fn test_validate_rule_expression_for_rule_instance_kind(
        recs: Vec<RuleExpressionCondition>,
        expected_kind: FpResult<RuleInstanceKind>,
    ) {
        let unvalidated = UnvalidatedRuleExpression(recs);
        let lists = HashMap::from_iter([(test_list_id(), test_list(ListKind::IpAddress))]);

        let rule_expression = validate_rule_expression(unvalidated, &lists, true);
        match (rule_expression.map(|re| re.kind()), expected_kind) {
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
