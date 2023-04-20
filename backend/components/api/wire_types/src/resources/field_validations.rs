use newtypes::decision::MatchLevel;

use crate::*;

#[derive(Debug, Clone, Deserialize, Serialize, Apiv2Schema, JsonSchema)]
#[schemars(rename_all = "snake_case")]
pub struct FieldValidationDetail {
    pub reason_code: FootprintReasonCode,
    pub note: String,
    pub description: String,
    pub severity: SignalSeverity,
    pub match_level: MatchLevel,
}
/// A risk event
#[derive(Debug, Clone, Deserialize, Serialize, Apiv2Schema, JsonSchema)]
#[schemars(rename_all = "snake_case")]
pub struct FieldValidation {
    pub match_level: MatchLevel,
    pub signals: Vec<FieldValidationDetail>,
}

#[derive(Debug, Clone, Deserialize, Serialize, Apiv2Schema, JsonSchema)]
#[schemars(rename_all = "snake_case")]
pub struct GetFieldValidationResponse {
    pub email: FieldValidation,
    pub phone: FieldValidation,
    pub name: FieldValidation,
    pub address: FieldValidation,
    pub dob: FieldValidation,
    pub ssn: FieldValidation,
}

export_schema!(GetFieldValidationResponse);
