use super::RuleInstanceKind;
use crate::DataIdentifier;
use crate::DeviceInsightField;
use crate::FootprintReasonCode;
use crate::ListId;
use crate::PiiString;
use api_errors::AssertionError;
use api_errors::FpResult;
use api_errors::ValidationError;
use diesel::AsExpression;
use diesel::FromSqlRow;
use diesel_as_jsonb::AsJsonb;
use paperclip::actix::Apiv2Schema;
use serde::Deserialize;
use serde::Serialize;

#[derive(Debug, Clone, Deserialize, Eq, PartialEq, Apiv2Schema)]
pub struct UnvalidatedRuleExpression(pub Vec<RuleExpressionCondition>);

impl UnvalidatedRuleExpression {
    pub fn list_ids(&self) -> Vec<ListId> {
        self.0.iter().filter_map(|c| c.list_id().cloned()).collect()
    }

    pub fn validate(self: UnvalidatedRuleExpression) -> FpResult<RuleExpression> {
        let rule_kinds = self.0.iter().map(|rc| rc.kind());
        // make sure all rule expressions are about the same subject
        let (person_rules, business_rules): (Vec<_>, Vec<_>) = rule_kinds
            .clone()
            .filter(|rik| !matches!(rik, RuleInstanceKind::Any)) // don't need to validate `Any rules`
            .partition(|rik| matches!(rik, RuleInstanceKind::Person));

        if !person_rules.is_empty() && !business_rules.is_empty() {
            return ValidationError(
                "Cannot make a rule expression that includes both Person and Business signals",
            )
            .into();
        };


        self.0
            .iter()
            .map(|c| c.kind())
            .min()
            .ok_or(AssertionError("unable to compute rule instance kind"))?;

        Ok(RuleExpression(self.0))
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, AsJsonb, Eq, PartialEq, Apiv2Schema)]
pub struct RuleExpression(pub Vec<RuleExpressionCondition>);

impl RuleExpression {
    pub fn list_ids(&self) -> Vec<ListId> {
        self.0.iter().filter_map(|c| c.list_id().cloned()).collect()
    }

    pub fn data_identifiers(&self) -> Vec<DataIdentifier> {
        self.0
            .iter()
            .filter_map(|c| c.data_identifier().cloned())
            .collect()
    }

    // This has already been validated by UnvalidatedRuleExpression::validate
    pub fn kind(&self) -> RuleInstanceKind {
        self.0
            .iter()
            .map(|c| c.kind())
            .min()
            .unwrap_or(RuleInstanceKind::Any)
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, AsJsonb, Eq, PartialEq, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
#[serde(untagged)]
pub enum RuleExpressionCondition {
    RiskSignal {
        field: FootprintReasonCode,
        op: BooleanOperator,
        value: bool,
    },
    VaultData(VaultOperation),
    DeviceInsight(DeviceInsightOperation),
    // just a proof of concept, not used. would have #[cfg(test)] but vscode is annoying with that
    RiskScore {
        field: RiskScore,
        op: NumberOperator,
        value: i64,
    },
}

impl RuleExpressionCondition {
    pub fn kind(&self) -> RuleInstanceKind {
        match self {
            RuleExpressionCondition::RiskSignal { field, .. } => {
                if field
                    .scopes()
                    .iter()
                    .all(|s| !s.is_for_person() && s.is_for_kyb())
                {
                    RuleInstanceKind::Business
                } else {
                    RuleInstanceKind::Person
                }
            }
            RuleExpressionCondition::VaultData(vault_data) => {
                let field = match vault_data {
                    VaultOperation::Equals { field, .. } => field,
                    VaultOperation::IsIn { field, .. } => field,
                };
                match field {
                    DataIdentifier::Business(_) => RuleInstanceKind::Business,
                    _ => RuleInstanceKind::Person,
                }
            }
            RuleExpressionCondition::RiskScore { .. } => RuleInstanceKind::Person, // todo!
            RuleExpressionCondition::DeviceInsight(..) => RuleInstanceKind::Any,
        }
    }
}

#[derive(Debug, Clone, Eq, PartialEq, Serialize, Deserialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
#[serde(untagged)]
pub enum VaultOperation {
    Equals {
        field: DataIdentifier,
        op: Equals,
        value: PiiString,
    },
    IsIn {
        field: DataIdentifier,
        op: IsIn,
        value: ListId,
    },
}

impl VaultOperation {
    pub fn field(&self) -> &DataIdentifier {
        match self {
            VaultOperation::Equals {
                field,
                op: _,
                value: _,
            } => field,
            VaultOperation::IsIn {
                field,
                op: _,
                value: _,
            } => field,
        }
    }
}

#[derive(Debug, Clone, Eq, PartialEq, Serialize, Deserialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
#[serde(untagged)]
pub enum DeviceInsightOperation {
    IsIn {
        field: DeviceInsightField,
        op: IsIn,
        value: ListId,
    },
}

#[derive(Debug, Clone, Copy, Eq, PartialEq, Serialize, Deserialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub enum Equals {
    #[serde(rename = "eq")]
    Equals,
    #[serde(rename = "not_eq")]
    DoesNotEqual,
}

#[derive(Debug, Clone, Copy, Eq, PartialEq, Serialize, Deserialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub enum IsIn {
    IsIn,
    IsNotIn,
}

#[derive(Debug, Clone, Copy, Eq, PartialEq, Serialize, Deserialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub enum BooleanOperator {
    #[serde(rename = "eq")]
    Equals,
    #[serde(rename = "not_eq")]
    DoesNotEqual,
}

#[derive(Debug, Clone, Copy, Eq, PartialEq, Serialize, Deserialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub enum NumberOperator {
    #[serde(rename = "gt")]
    GreaterThan,
    #[serde(rename = "lt")]
    LessThan,
}

#[derive(Debug, Clone, Copy, Eq, PartialEq, Serialize, Deserialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub enum RiskScore {
    ExperianScore,
    IncodeSelfieMatchScore,
}

impl RuleExpressionCondition {
    pub fn list_id(&self) -> Option<&ListId> {
        match self {
            RuleExpressionCondition::VaultData(VaultOperation::IsIn {
                field: _,
                op: _,
                value,
            }) => Some(value),
            RuleExpressionCondition::DeviceInsight(DeviceInsightOperation::IsIn {
                field: _,
                op: _,
                value,
            }) => Some(value),
            _ => None,
        }
    }

    pub fn data_identifier(&self) -> Option<&DataIdentifier> {
        match self {
            RuleExpressionCondition::VaultData(op) => Some(op.field()),
            _ => None,
        }
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use crate::FootprintReasonCode as FRC;
    use crate::IdentityDataKind;
    use serde_json::json;

    #[test]
    fn test_deser() {
        let re = RuleExpression(vec![
            RuleExpressionCondition::RiskSignal {
                field: FRC::NameDoesNotMatch,
                op: BooleanOperator::Equals,
                value: true,
            },
            RuleExpressionCondition::RiskSignal {
                field: FRC::DocumentSelfieDoesNotMatch,
                op: BooleanOperator::DoesNotEqual,
                value: false,
            },
            RuleExpressionCondition::RiskScore {
                field: RiskScore::ExperianScore,
                op: NumberOperator::GreaterThan,
                value: 500,
            },
            RuleExpressionCondition::RiskScore {
                field: RiskScore::IncodeSelfieMatchScore,
                op: NumberOperator::LessThan,
                value: 70,
            },
        ]);
        let json = serde_json::to_value(re.clone()).unwrap();
        assert_eq!(
            json!(
                [
                    {"field":"name_does_not_match","op":"eq","value":true},
                    {"field":"document_selfie_does_not_match","op":"not_eq","value":false},
                    {"field":"experian_score","op":"gt","value":500},
                    {"field":"incode_selfie_match_score","op":"lt","value":70}
                ]
            ),
            json
        );

        assert_eq!(re, serde_json::from_value(json).unwrap());
    }

    #[test]
    fn test_deser_vault_data_equals() {
        let re = RuleExpression(vec![RuleExpressionCondition::VaultData(VaultOperation::Equals {
            field: DataIdentifier::Id(IdentityDataKind::FirstName),
            op: Equals::Equals,
            value: "Bob".into(),
        })]);

        let json = serde_json::to_value(re.clone()).unwrap();

        assert_eq!(
            json!(
                [
                    {"field":"id.first_name","op":"eq","value":"Bob"},
                ]
            ),
            json
        );
        assert_eq!(re, serde_json::from_value(json).unwrap());
    }

    #[test]
    fn test_deser_vault_data_isin() {
        let re = RuleExpression(vec![RuleExpressionCondition::VaultData(VaultOperation::IsIn {
            field: DataIdentifier::Id(IdentityDataKind::Ssn9),
            op: IsIn::IsIn,
            value: ListId::from("lst_123".to_string()),
        })]);

        let json = serde_json::to_value(re.clone()).unwrap();

        assert_eq!(
            json!(
                [
                    {"field":"id.ssn9","op":"is_in","value":"lst_123"},
                ]
            ),
            json
        );
        assert_eq!(re, serde_json::from_value(json).unwrap());
    }

    #[test]
    fn test_deser_device_insight_isin() {
        let re = RuleExpression(vec![RuleExpressionCondition::DeviceInsight(
            DeviceInsightOperation::IsIn {
                field: DeviceInsightField::IpAddress,
                op: IsIn::IsIn,
                value: ListId::from("lst_123".to_string()),
            },
        )]);

        let json = serde_json::to_value(re.clone()).unwrap();

        assert_eq!(
            json!(
                [
                    {"field":"ip_address","op":"is_in","value":"lst_123"},
                ]
            ),
            json
        );
        assert_eq!(re, serde_json::from_value(json).unwrap());
    }
}
