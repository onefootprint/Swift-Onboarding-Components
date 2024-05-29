use crate::*;
use newtypes::decision::MatchLevel;
use newtypes::{
    FootprintReasonCode,
    SignalSeverity,
};

#[derive(Debug, Clone, Serialize, Apiv2Schema)]
pub struct FieldValidationDetail {
    pub reason_code: FootprintReasonCode,
    pub note: String,
    pub description: String,
    pub severity: SignalSeverity,
    pub match_level: MatchLevel,
}
/// A risk event
#[derive(Debug, Clone, Serialize, Apiv2Schema)]
pub struct FieldValidation {
    pub match_level: MatchLevel,
    pub signals: Vec<FieldValidationDetail>,
}

#[derive(Debug, Clone, Serialize, Apiv2Schema)]
pub struct GetFieldValidationResponse {
    pub email: Option<FieldValidation>,
    pub phone: Option<FieldValidation>,
    pub name: Option<FieldValidation>,
    pub address: Option<FieldValidation>,
    pub dob: Option<FieldValidation>,
    pub ssn: Option<FieldValidation>,
    pub document: Option<FieldValidation>,
    pub business_name: Option<FieldValidation>,
    pub business_phone_number: Option<FieldValidation>,
    pub business_tin: Option<FieldValidation>,
    pub business_address: Option<FieldValidation>,
    pub business_beneficial_owners: Option<FieldValidation>,
    pub business_dba: Option<FieldValidation>,
}
