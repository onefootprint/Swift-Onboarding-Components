use crate::incode::IncodeClientErrorCustomFailureReasons;
use newtypes::IncodeFailureReason;
use newtypes::PiiString;
use newtypes::ScrubbedPiiJsonValue;
use newtypes::ScrubbedPiiString;
use std::str::FromStr;

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
    // we mostly care about "01" Errors related to business rules and processing in the application layer.
    pub tipo_error: Option<String>,
    #[serde(rename(deserialize = "resultCURPS"))]
    pub result_curps: Option<ScrubbedPiiJsonValue>,
    #[serde(rename(deserialize = "sessionID"))]
    pub session_id: Option<PiiString>,
    pub message: Option<PiiString>,
}

impl CurpError {
    pub fn curp_error(&self) -> RenapoError {
        let error = if self.tipo_error == Some("99".to_string()) {
            Some(RenapoError::ServiceNotAvailable)
        } else if self.tipo_error == Some("01".to_string()) {
            self.codigo_error
                .clone()
                .and_then(|e| RenapoError::from_str(e.as_str()).ok())
        } else {
            Some(RenapoError::Unknown)
        };

        error.unwrap_or(RenapoError::Unknown)
    }
}

// Based on the documentation, this API interface with RENAPO allows for two main functions:

// - Validating an existing CURP
// - Registering a new CURP

// for us, we are just validating
// Based on the documentation, these appear to be the relevant error codes:
// (tipo_error)
//  - 01 06 - "La CURP no se encuentra en la base de datos." (The CURP is not found in the database)
//  - 01 09 - "La llave de la CURP no está bien formada." (The CURP key is malformed)
//  - 01 20 - "Más de una CURP para estos datos" (More than one CURP for this data)
//  - 01 06 would be returned if the provided CURP code does not match any record in RENAPO's
//    database.
//  - 01 09 indicates the submitted CURP code is malformed or invalid (does not follow the
//    18-character structure).
//  - 01 20 suggests that the personal data tied to the provided CURP matches multiple CURP records
//    in their system, which should not occur since CURPs are meant to be unique.
#[derive(Clone, Debug, strum::EnumString, PartialEq, Eq)]
pub enum RenapoError {
    // 01 - Changes not applied due to equality with previous version
    #[strum(serialize = "01")]
    EqualToPreviousVersion,
    // 02 - No data was modified
    #[strum(serialize = "02")]
    NoDataModified,
    // 03 - Some selected data was not modified
    #[strum(serialize = "03")]
    SomeDataNotModified,
    // 04 - CURP was previously deactivated
    #[strum(serialize = "04")]
    CurpPreviouslyDeactivated,
    // 05 - Could not deactivate, CURP has a new version
    #[strum(serialize = "05")]
    CannotDeactivateNewVersion,
    // 06 - CURP not found in database
    #[strum(serialize = "06")]
    CurpNotFoundInDatabase,
    // 07 - Could not deactivate, CURP not found
    #[strum(serialize = "07")]
    CannotDeactivateNotFound,
    // 08 - Supporting document is malformed
    #[strum(serialize = "08")]
    MalformedSupportingDocument,
    // 09 - CURP key is malformed
    #[strum(serialize = "09")]
    MalformedCurpKey,
    // 10 - Could not retrieve CURP
    #[strum(serialize = "10")]
    CannotRetrieveCurp,
    // 11 - Change could not be made
    #[strum(serialize = "11")]
    CannotMakeChange,
    // 12 - Specified CURP not found
    #[strum(serialize = "12")]
    SpecifiedCurpNotFound,
    // 13 - Error processing request, try again
    #[strum(serialize = "13")]
    ProcessingError,
    // 14 - Could not complete query, try again
    #[strum(serialize = "14")]
    CannotCompleteQuery,
    // 15 - Could not retrieve risk factors
    #[strum(serialize = "15")]
    CannotRetrieveRiskFactors,
    // 16 - Could not make special change, try again
    #[strum(serialize = "16")]
    CannotMakeSpecialChange,
    // 17 - Could not register, try again
    #[strum(serialize = "17")]
    CannotRegister,
    // 18 - Invalid user
    #[strum(serialize = "18")]
    InvalidUser,
    // 19 - CURP already exists in database
    #[strum(serialize = "19")]
    CurpAlreadyExists,
    // 20 - More than one CURP for these data
    #[strum(serialize = "20")]
    MultipleResultsForData,
    // "The CURP validation service is not available"
    ServiceNotAvailable,
    Unknown,
}

impl IncodeClientErrorCustomFailureReasons for CurpValidationResponse {
    fn custom_failure_reasons(error: crate::incode::response::Error) -> Option<Vec<IncodeFailureReason>> {
        if error
            .message
            .as_ref()
            .map(|m| m.trim().to_lowercase().contains("invalid curp"))
            .unwrap_or(false)
        {
            Some(vec![IncodeFailureReason::InvalidCurp])
        } else {
            None
        }
    }
}

#[cfg(test)]
mod tests {
    use super::CurpValidationResponse;
    use super::RenapoError;
    use crate::test_incode_fixtures;
    use test_case::test_case;

    #[test]
    fn test_serialization() {
        use super::*;
        assert!(serde_json::from_value::<CurpValidationResponse>(
            test_incode_fixtures::incode_curp_validation_good_curp()
        )
        .is_ok());

        assert!(serde_json::from_value::<CurpValidationResponse>(
            test_incode_fixtures::incode_curp_validation_bad_curp("01", "06")
        )
        .is_ok());
    }

    #[test_case("01", "06" => RenapoError::CurpNotFoundInDatabase)]
    #[test_case("01", "20" => RenapoError::MultipleResultsForData)]
    #[test_case("99", "20" => RenapoError::ServiceNotAvailable)]
    fn test_error(tipo: &str, codigo: &str) -> RenapoError {
        let parsed = serde_json::from_value::<CurpValidationResponse>(
            test_incode_fixtures::incode_curp_validation_bad_curp(tipo, codigo),
        )
        .unwrap();

        parsed.error.unwrap().curp_error()
    }
}
