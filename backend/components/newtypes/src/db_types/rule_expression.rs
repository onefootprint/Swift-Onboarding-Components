use crate::{DataIdentifier, FootprintReasonCode, ListId, PiiString};
use diesel::{AsExpression, FromSqlRow};
use diesel_as_jsonb::AsJsonb;
use paperclip::actix::Apiv2Schema;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, AsJsonb, Eq, PartialEq, Apiv2Schema)]
pub struct RuleExpression(pub Vec<RuleExpressionCondition>);

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
    // just a proof of concept, not used. would have #[cfg(test)] but vscode is annoying with that
    RiskScore {
        field: RiskScore,
        op: NumberOperator,
        value: i64,
    },
}

#[derive(Debug, Clone, Eq, PartialEq, Serialize, Deserialize)]
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

#[derive(Debug, Clone, Copy, Eq, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum Equals {
    #[serde(rename = "eq")]
    Equals,
    #[serde(rename = "not_eq")]
    DoesNotEqual,
}

#[derive(Debug, Clone, Copy, Eq, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum IsIn {
    IsIn,
    IsNotIn,
}

#[derive(Debug, Clone, Copy, Eq, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum BooleanOperator {
    #[serde(rename = "eq")]
    Equals,
    #[serde(rename = "not_eq")]
    DoesNotEqual,
}

#[derive(Debug, Clone, Copy, Eq, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum NumberOperator {
    #[serde(rename = "gt")]
    GreaterThan,
    #[serde(rename = "lt")]
    LessThan,
}

#[derive(Debug, Clone, Copy, Eq, PartialEq, Serialize, Deserialize)]
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
            _ => None,
        }
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use crate::{FootprintReasonCode as FRC, IdentityDataKind};
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
}
