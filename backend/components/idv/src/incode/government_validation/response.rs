use newtypes::{incode::IncodeStatus, IncodeFailureReason};
use serde::{Deserialize, Serialize};

use crate::incode::{
    doc::response::{FetchOCRResponse, ValueStatusKey},
    IncodeClientErrorCustomFailureReasons,
};

use strum::{Display, EnumString};

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GovernmentValidationResponse {
    /// Flag stating if request processed successfully.
    pub valid: bool,
    pub status_code: u8,
    pub registral_situation: Option<RegistralSituation>,
    pub government_validation: GovernmentValidation,
    pub custom_fields: Option<serde_json::Value>,
    pub ocr_data: Option<FetchOCRResponse>,
    pub device_info: Option<serde_json::Value>,
    pub error_description: Option<serde_json::Value>,
}

impl GovernmentValidationResponse {
    #[allow(unused)]
    pub fn status_code(&self) -> MXStatusCode {
        self.status_code.into()
    }

    pub fn overall_status(&self) -> Option<IncodeStatus> {
        self.government_validation.overall_status()
    }
}

impl IncodeClientErrorCustomFailureReasons for GovernmentValidationResponse {
    fn custom_failure_reasons(_error: crate::incode::response::Error) -> Option<Vec<IncodeFailureReason>> {
        // TODO?
        None
    }
}

#[derive(Clone, Debug, Display, EnumString, Eq, PartialEq, Serialize)]
#[strum(serialize_all = "SCREAMING_SNAKE_CASE")]
pub enum MXStatusCode {
    Success,
    ValidationError,
    IneConnectionError,
    IneInfrastructureError,
    ModuleNotSupported,
    MissingDocumentId,
    MissingSelfie,
    UserNotFound,
    UserNotFoundInIneDb,
    NotEnoughData,
    LivenessFail,
    IneNotCurrent,
    IneReportedLost,
    IneReportedStolen,
    IneSignatureError,
    IneNotValid,
    ProviderUnavailable,
    CountryNotSupported,
    Other(u8),
}

impl From<u8> for MXStatusCode {
    fn from(value: u8) -> MXStatusCode {
        match value {
            0 => MXStatusCode::Success,
            1 => MXStatusCode::ValidationError,
            2 => MXStatusCode::IneConnectionError,
            3 => MXStatusCode::IneInfrastructureError,
            4 => MXStatusCode::ModuleNotSupported,
            5 => MXStatusCode::MissingDocumentId,
            6 => MXStatusCode::MissingSelfie,
            7 => MXStatusCode::UserNotFound,
            8 => MXStatusCode::UserNotFoundInIneDb,
            9 => MXStatusCode::NotEnoughData,
            10 => MXStatusCode::LivenessFail,
            11 => MXStatusCode::IneNotCurrent,
            12 => MXStatusCode::IneReportedLost,
            13 => MXStatusCode::LivenessFail,
            14 => MXStatusCode::IneSignatureError,
            15 => MXStatusCode::IneNotValid,
            98 => MXStatusCode::ProviderUnavailable,
            99 => MXStatusCode::CountryNotSupported,
            i => MXStatusCode::Other(i),
        }
    }
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RegistralSituation {
    /// Possible values - [ VIGENTE, NO_VIGENTE, DATOS_NO_ENCONTRADOS ]
    pub tipo_situacion_registral: Option<String>,
    /// Possible values - [ null, REPORTE_DE_EXTRAVIO, REPORTE_DE_ROBO, REPORTE_DE_ROBO_TEMPORAL, REPORTE_DE_EXTRAVIO_TEMPORAL ]
    pub tipo_reporte_robo_extravio: Option<String>,
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GovernmentValidation {
    pub validation_status: Option<ValueStatusKey>,
    pub overall: Option<ValueStatusKey>,
    /// keys have possibel values  issueDate, firstName, maternalLastName, paternalLastName, ocr, personalId, electorsKey, emissionNumber, registrationDate
    pub ocr_validation: Option<Vec<ValueStatusKey>>,
    pub ocr_validation_overall: Option<ValueStatusKey>,
}

impl GovernmentValidation {
    pub fn overall_status(&self) -> Option<IncodeStatus> {
        self.overall
            .as_ref()
            .and_then(|s| s.status.as_ref())
            .and_then(|status| IncodeStatus::try_from(status.as_str()).ok())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::test_fixtures;

    #[test]
    fn test_response_deserializes() {
        serde_json::from_value::<GovernmentValidationResponse>(test_fixtures::incode_ine_not_found_in_db())
            .unwrap();
    }
}
