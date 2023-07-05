use newtypes::decision::MatchLevel;

use crate::*;

#[derive(Debug, Clone, Serialize, Apiv2Schema, JsonSchema)]
#[schemars(rename_all = "snake_case")]
pub struct FieldValidationDetail {
    pub reason_code: FootprintReasonCode,
    pub note: String,
    pub description: String,
    pub severity: SignalSeverity,
    pub match_level: MatchLevel,
}
/// A risk event
#[derive(Debug, Clone, Serialize, Apiv2Schema, JsonSchema)]
#[schemars(rename_all = "snake_case")]
pub struct FieldValidation {
    pub match_level: MatchLevel,
    pub signals: Vec<FieldValidationDetail>,
}

#[derive(Debug, Clone, Serialize, Apiv2Schema, JsonSchema)]
#[schemars(rename_all = "snake_case")]
pub struct GetFieldValidationResponse {
    pub email: Option<FieldValidation>,
    pub phone: Option<FieldValidation>,
    pub name: Option<FieldValidation>,
    pub address: Option<FieldValidation>,
    pub dob: Option<FieldValidation>,
    pub ssn: Option<FieldValidation>,
    pub document: Option<FieldValidation>,
}

export_schema!(GetFieldValidationResponse);
