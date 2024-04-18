use crate::incode::IncodeClientErrorCustomFailureReasons;
use newtypes::{IncodeFailureReason, PiiString, ScrubbedPiiJsonValue, ScrubbedPiiString};

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "snake_case")]
pub struct CurpValidationResponse {
    pub success: Option<bool>,
    pub status_curp: Option<String>,
    pub result: Option<ScrubbedPiiString>,
    // Flag indicating if CURP validation passed
    pub renapo_valid: Option<bool>,
    pub curp: Option<ScrubbedPiiString>,
    // HOMBRE || MUJER
    pub sex: Option<ScrubbedPiiString>,
    pub nationality: Option<ScrubbedPiiString>,
    // FIRST + SECOND
    pub names: Option<ScrubbedPiiString>,
    // THIRD
    pub paternal_surname: Option<ScrubbedPiiString>,
    // FOURTH
    pub mothers_maiden_name: Option<ScrubbedPiiString>,
    // DD/MM/YYY
    #[serde(rename(deserialize = "birthdate"))]
    pub birth_date: Option<ScrubbedPiiString>,
    // Birth State, unknown enum
    pub entity_birth: Option<ScrubbedPiiString>,
    pub probation_document: Option<ScrubbedPiiString>,
    pub probation_document_data: Option<ProbationDocumentData>,
    // This is an error that is returned in 200 responses, includes why curp validation failed
    pub error: Option<CurpError>,
}

// Not documented what any of these mean.
#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ProbationDocumentData {
    pub foja: Option<ScrubbedPiiString>,
    pub num_entidad_reg: Option<ScrubbedPiiString>,
    pub libro: Option<ScrubbedPiiString>,
    #[serde(rename(deserialize = "NumRegExtranjeros"))]
    pub num_reg_extranjeros: Option<ScrubbedPiiString>,
    pub cve_entidad_nac: Option<ScrubbedPiiString>,
    pub num_acta: Option<ScrubbedPiiString>,
    #[serde(rename(deserialize = "CRIP"))]
    pub crip: Option<ScrubbedPiiString>,
    pub tomo: Option<ScrubbedPiiString>,
    pub cve_entidad_emisora: Option<ScrubbedPiiString>,
    pub anio_reg: Option<ScrubbedPiiString>,
    pub cve_municipio_reg: Option<ScrubbedPiiString>,
    #[serde(rename(deserialize = "FolioCarta"))]
    pub folio_carta: Option<ScrubbedPiiString>,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CurpError {
    pub codigo_error: Option<String>,
    pub status_oper: Option<String>,
    pub tipo_error: Option<String>,
    #[serde(rename(deserialize = "resultCURPS"))]
    pub result_curps: Option<ScrubbedPiiJsonValue>,
    #[serde(rename(deserialize = "sessionID"))]
    pub session_id: Option<PiiString>,
    pub message: Option<PiiString>,
}

impl CurpError {
    pub fn curp_not_found(&self) -> bool {
        self.codigo_error == Some("06".into())
    }
}

impl IncodeClientErrorCustomFailureReasons for CurpValidationResponse {
    fn custom_failure_reasons(_error: crate::incode::response::Error) -> Option<Vec<IncodeFailureReason>> {
        // TODO: invalid curp is here
        None
    }
}

mod tests {

    #[test]
    fn test_serialization() {
        use super::*;
        use crate::test_fixtures;
        assert!(serde_json::from_value::<CurpValidationResponse>(
            test_fixtures::incode_curp_validation_good_curp()
        )
        .is_ok());

        assert!(serde_json::from_value::<CurpValidationResponse>(
            test_fixtures::incode_curp_validation_bad_curp()
        )
        .is_ok());
    }
}
