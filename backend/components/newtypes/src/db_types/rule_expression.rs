use crate::FootprintReasonCode;
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
    // just a proof of concept, for now we only support RiskSignal based conditions
    #[cfg(test)]
    RiskScore {
        field: RiskScore,
        op: NumberOperator,
        value: i64,
    },
}

#[derive(Debug, Clone, Copy, Eq, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum BooleanOperator {
    #[serde(rename = "eq")]
    Equals,
    #[serde(rename = "not_eq")]
    DoesNotEqual,
}

#[cfg(test)]
#[derive(Debug, Clone, Copy, Eq, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum NumberOperator {
    #[serde(rename = "gt")]
    GreaterThan,
    #[serde(rename = "lt")]
    LessThan,
}

#[cfg(test)]
#[derive(Debug, Clone, Copy, Eq, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum RiskScore {
    ExperianScore,
    IncodeSelfieMatchScore,
}

#[cfg(test)]
mod test {
    use super::*;
    use crate::FootprintReasonCode as FRC;
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
}
