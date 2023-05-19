use std::collections::HashMap;

use crate::incode::error::Error as IncodeError;
use chrono::{NaiveDate, NaiveDateTime};
use newtypes::{
    incode::{IncodeStatus, IncodeTest},
    IdDocKind, IncodeVerificationFailureReason, PiiString,
};

use super::APIResponseToIncodeError;

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct OnboardingStartResponse {
    // token: String. Up to 256 characters. Internal JWT token used for the future subsequent calls.
    // !Important!:
    //    It is the value for X-Incode-Hardware-Id header in all other calls.
    pub token: PiiString,
    // interviewCode: String. 6 characters. This value is used for connecting to conference call.
    pub interview_code: Option<String>,
    // interviewId: String. 24 characters. Identifies the onboarding session that is initialized. Can be used for fetching data about that session in future calls.
    pub interview_id: String,
    // flowType: String, optional (only if configurationId is sent in request). Type of the flow used. Could be flow (in most cases), or legacy type configuration (not used anymore).
    pub flow_type: Option<String>,
    // idCaptureTimeout: Integer. Number of seconds after which manual capture button should be shown to the user, while capturing ID.
    pub id_capture_timeout: Option<i32>,
    // idCaptureRetries: Integer. Number of ID captures after which user should be taken to next screen.
    pub id_capture_retries: Option<i32>,
    // selfieCaptureTimeout: Integer. Number of seconds after which manual capture button should be shown to the user, while capturing selfie.
    pub selfie_capture_timeout: Option<i32>,
    // selfieCaptureRetries: Integer. Number of selfie captures after which user should be taken to next screen.
    pub selfie_capture_retries: Option<i32>,
    // curpValidationRetries: Integer. Number of curp validations after which user should be taken to next screen. (only for Mexico)
    pub curp_validation_retries: Option<i32>,
    // clientId: String. Customer specific clientId that corresponds to api key.
    pub client_id: Option<PiiString>,
    // env: Sting. Server environment. Could be one of: stage, demo, saas.
    pub env: Option<String>,
    // existingSession: Boolean. It's true if interviewId corresponds to an existing Onboarding Session.
    pub existing_session: Option<bool>,
    // Some 4xx errors that could be handled programmatically include status of an error and message that briefly explains the error reported.
    #[serde(flatten)]
    pub error: Option<Error>,
}

impl APIResponseToIncodeError for OnboardingStartResponse {
    fn to_error(&self) -> Option<Error> {
        self.error.clone()
    }
}

/// Common Error struct that will occur across multiple Incode endpoints
#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
pub struct Error {
    pub timestamp: i64,
    pub status: i32,
    pub error: String,
    pub message: String,
    pub path: String,
}
impl std::fmt::Display for Error {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(
            f,
            "IncodeAPIResponseError {}: {} in {}>",
            self.error, self.message, self.path
        )
    }
}

/// Response we get back from adding a document image
#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AddSideResponse {
    pub classification: Option<bool>,
    pub correct_glare: Option<bool>,
    pub correct_sharpness: Option<bool>,
    pub country_code: Option<String>,
    pub glare: Option<i32>,
    pub horizontal_resolution: Option<i32>,
    pub issue_name: Option<String>,
    pub issue_year: Option<i32>,
    pub readability: Option<bool>,
    pub session_status: Option<String>,
    pub sharpness: Option<i32>,
    pub type_of_id: Option<String>,
    pub fail_reason: Option<String>,
    #[serde(flatten)]
    pub error: Option<Error>,
}

impl AddSideResponse {
    // Unfortunately, in this case we get a 200 + a non-null `fail_reason`
    pub fn add_side_failure_reason(&self) -> Option<IncodeVerificationFailureReason> {
        self.fail_reason.as_ref().map(|e| {
            IncodeVerificationFailureReason::try_from(e.as_str())
                .unwrap_or(IncodeVerificationFailureReason::Other(e.clone()))
        })
    }
}

impl APIResponseToIncodeError for AddSideResponse {
    fn to_error(&self) -> Option<Error> {
        self.error.clone()
    }
}

/// Response we get from telling Incode to process the image
#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ProcessIdResponse {
    pub success: Option<bool>,
    #[serde(flatten)]
    pub error: Option<Error>,
}

impl APIResponseToIncodeError for ProcessIdResponse {
    fn to_error(&self) -> Option<Error> {
        self.error.clone()
    }
}

/// Response from fetch scores
// TODO!
#[derive(Debug, Clone, serde::Deserialize, serde::Serialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct FetchScoresResponse {
    pub id_validation: Option<IdValidation>,
    pub liveness: Option<serde_json::Value>,
    pub face_recognition: Option<serde_json::Value>,
    pub id_ocr_confidence: Option<IdOcrConfidence>,
    pub overall: Option<IdTest>,

    #[serde(flatten)]
    pub error: Option<Error>,
}

impl FetchScoresResponse {
    pub fn overall_score(&self) -> Result<IncodeStatus, IncodeError> {
        self.overall
            .as_ref()
            .and_then(|o| o.status.as_ref())
            .and_then(|s| IncodeStatus::try_from(s.as_str()).ok())
            .ok_or(IncodeError::AssertionError("missing score status".into()))
    }

    pub fn get_id_tests(&self) -> HashMap<IncodeTest, IncodeStatus> {
        let photo_sec_tests = self
            .id_validation
            .as_ref()
            .and_then(|i| i.photo_security_and_quality.as_ref())
            .cloned()
            .unwrap_or(vec![]);

        let id_specific_tests = self
            .id_validation
            .as_ref()
            .and_then(|i| i.id_specific.as_ref())
            .cloned()
            .unwrap_or(vec![]);

        let custom_field_tests = self
            .id_validation
            .as_ref()
            .and_then(|i: &IdValidation| i.custom_fields.as_ref())
            .cloned()
            .unwrap_or(vec![]);

        photo_sec_tests
            .into_iter()
            .chain(id_specific_tests.into_iter())
            .chain(custom_field_tests.into_iter())
            .filter_map(|test| {
                let (key, status) = match (test.key, test.status) {
                    (Some(key), Some(status)) => (
                        IncodeTest::try_from(key.as_str()).ok(),
                        IncodeStatus::try_from(status.as_str()).ok(),
                    ),
                    _ => (None, None),
                };

                key.and_then(|k| status.map(|s| (k, s)))
            })
            .collect()
    }

    #[allow(non_snake_case)]
    pub fn TEST_ONLY_FIXTURE() -> Self {
        Self { ..Default::default() }
    }
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct IdValidation {
    pub photo_security_and_quality: Option<Vec<IdTest>>,
    pub id_specific: Option<Vec<IdTest>>,
    pub custom_fields: Option<Vec<IdTest>>,
    pub applied_rule: Option<serde_json::Value>,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct IdOcrConfidence {
    pub overall_confidence: Option<IdTest>,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct IdTest {
    pub value: Option<String>,
    pub status: Option<String>,
    pub key: Option<String>,
}

impl APIResponseToIncodeError for FetchScoresResponse {
    fn to_error(&self) -> Option<Error> {
        self.error.clone()
    }
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AddConsentResponse {
    pub success: bool,
    #[serde(flatten)]
    pub error: Option<Error>,
}

impl APIResponseToIncodeError for AddConsentResponse {
    fn to_error(&self) -> Option<Error> {
        self.error.clone()
    }
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct FetchOCRResponse {
    pub name: Option<OCRName>,
    // Address as read from id. Address can have two or three lines. Lines are separated by \n.
    pub address: Option<String>,
    pub checked_address: Option<String>,
    pub checked_address_bean: Option<serde_json::Value>,
    pub address_fields: Option<OCRAddress>,
    // Image was classified as one of the following:
    // Unknown, Passport, Visa, DriversLicense, IdentificationCard, Permit, Currency, ResidenceDocument, TravelDocument, BirthCertificate, VehicleRegistration,
    // Other, WeaponLicense, TribalIdentification, VoterIdentification, Military, TaxIdentification, FederalID, MedicalCard
    pub type_of_id: Option<String>,
    pub document_front_subtype: Option<String>,
    pub document_back_subtype: Option<String>,
    // Long, UTC millis
    pub birth_date: Option<i64>,
    pub gender: Option<String>,
    pub document_number: Option<String>,
    pub personal_number: Option<String>,
    // Document Reference Number.
    pub ref_number: Option<String>,
    // Optional. Personal tax identification number.
    pub tax_id_number: Option<String>,
    // UTC timestamp, in ms
    pub expire_at: Option<String>,
    // year of expiration
    pub expiration_date: Option<i32>,
    pub additional_timestamps: Option<serde_json::Value>,
    // year of issue
    pub issue_date: Option<i32>,
    pub issuing_country: Option<String>,
    pub issuing_state: Option<String>,
    pub issuing_authority: Option<String>,
    pub nationality: Option<String>,
    // String. Person's nationality as it appears in MRZ (if present).
    pub nationality_mrz: Option<String>,
    // Array. Optional. List of driver's license details elements:
    pub dl_class_details: Option<serde_json::Value>,
    pub ocr_data_confidence: Option<serde_json::Value>,
    pub restrictions: Option<String>,

    #[serde(flatten)]
    pub error: Option<Error>,
}

impl FetchOCRResponse {
    pub fn expiration_date(&self) -> Result<NaiveDate, IncodeError> {
        let expiration_timestamp = self
            .expire_at
            .clone()
            .ok_or(IncodeError::OcrError("missing field expire_at".into()))?
            .parse::<i64>()?;

        let naive = NaiveDateTime::from_timestamp_opt(expiration_timestamp / 1000, 0).ok_or(
            IncodeError::OcrError("could not parse expiration timestamp".into()),
        )?;

        Ok(naive.date())
    }

    pub fn dob(&self) -> Result<NaiveDate, IncodeError> {
        let expiration_timestamp = self
            .birth_date
            .ok_or(IncodeError::OcrError("missing field birth_date".into()))?;

        // in ms, so divide by 1000
        let naive = NaiveDateTime::from_timestamp_opt(expiration_timestamp / 1000, 0).ok_or(
            IncodeError::OcrError("could not parse birth_date timestamp".into()),
        )?;

        Ok(naive.date())
    }

    pub fn document_kind(&self) -> Result<IdDocKind, IncodeError> {
        let Some(type_of_id) = self.type_of_id.as_ref() else {
            return Err(IncodeError::OcrError("Missing type_of_id".into()));
        };
        let result = match type_of_id.as_str() {
            "Passport" => IdDocKind::Passport,
            "DriversLicense" => IdDocKind::DriverLicense,
            "IdentificationCard" => IdDocKind::IdCard,
            t => return Err(IncodeError::OcrError(format!("Unsupported document type: {}", t))),
        };
        Ok(result)
    }

    #[allow(non_snake_case)]
    pub fn TEST_ONLY_FIXTURE() -> Self {
        Self { ..Default::default() }
    }
}

impl APIResponseToIncodeError for FetchOCRResponse {
    fn to_error(&self) -> Option<Error> {
        self.error.clone()
    }
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct OCRName {
    pub full_name: Option<String>,
    pub first_name: Option<String>,
    pub paternal_last_name: Option<String>,
    pub maternal_last_name: Option<String>,
    pub given_name: Option<String>,
    pub middle_name: Option<String>,
    pub name_suffix: Option<String>,
    pub machine_readable_full_name: Option<String>,
    pub given_name_mrz: Option<String>,
    pub last_name_mrz: Option<String>,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct OCRAddress {
    pub street: Option<String>,
    pub colony: Option<String>,
    pub postal_code: Option<String>,
    pub city: Option<String>,
    pub state: Option<String>,
}

#[cfg(test)]
mod tests {
    use chrono::NaiveDate;
    use newtypes::{
        incode::{IncodeStatus, IncodeTest},
        IncodeVerificationFailureReason,
    };

    use super::{AddSideResponse, FetchOCRResponse, FetchScoresResponse};

    #[test]
    pub fn test_parse_fetch_scores() {
        let raw_response = serde_json::json!({"idValidation":{"photoSecurityAndQuality":[{"value":"PASSED","status":"OK","key":"tamperCheck"},{"value":"PASSED","status":"OK","key":"postitCheck"}, {"value":"PASSED","status":"OK","key":"alignment"},{"value":"OK","status":"OK","key":"screenIdLiveness"},{"value":"OK","status":"OK","key":"paperIdLiveness"},{"value":"PASSED","status":"OK","key":"idAlreadyUsedCheck"},{"value":"96","status":"OK","key":"balancedLightFront"},{"value":"99","status":"OK","key":"sharpnessFront"}],"idSpecific":[{"value":"100","status":"WARN","key":"documentClassification"},{"value":"100","status":"OK","key":"birthDateValidity"},{"value":"100","status":"OK","key":"visiblePhotoFeatures"},{"value":"100","status":"FAIL","key":"expirationDateValidity"},{"value":"100","status":"OK","key":"documentExpired"}],"customFields":[{"value":"firstNameMatch","status":"FAIL","key":"firstNameMatch"},{"value":"lastNameMatch","status":"FAIL","key":"lastNameMatch"}],"appliedRule":null},"liveness":null,"faceRecognition":null,"idOcrConfidence":{"overallConfidence":{"value":"99.0","status":"OK","key":null}},"overall":{"value":"100.0","status":"OK","key":null}});

        let parsed: FetchScoresResponse = serde_json::from_value(raw_response).unwrap();
        let parsed_tests = parsed.get_id_tests();

        // Check a few tests
        assert_eq!(
            parsed_tests.get(&IncodeTest::TamperCheck).unwrap(),
            &IncodeStatus::Ok
        );
        assert_eq!(
            parsed_tests.get(&IncodeTest::ScreenIdLiveness).unwrap(),
            &IncodeStatus::Ok
        );
        assert_eq!(
            parsed_tests.get(&IncodeTest::PaperIdLiveness).unwrap(),
            &IncodeStatus::Ok
        );
        assert_eq!(
            parsed_tests.get(&IncodeTest::ExpirationDateValidity).unwrap(),
            &IncodeStatus::Fail
        );
        assert_eq!(
            parsed_tests.get(&IncodeTest::PostitCheck).unwrap(),
            &IncodeStatus::Ok
        );
        assert_eq!(
            parsed_tests.get(&IncodeTest::DocumentClassification).unwrap(),
            &IncodeStatus::Warn
        );
        assert_eq!(
            parsed_tests.get(&IncodeTest::BirthDateValidity).unwrap(),
            &IncodeStatus::Ok
        );

        assert_eq!(
            parsed_tests.get(&IncodeTest::FirstNameMatch).unwrap(),
            &IncodeStatus::Fail
        );
        assert_eq!(
            parsed_tests.get(&IncodeTest::LastNameMatch).unwrap(),
            &IncodeStatus::Fail
        );

        // Overall score
        assert_eq!(parsed.overall_score().unwrap(), IncodeStatus::Ok)
    }

    #[test]
    fn test_parse_add_side_failure() {
        // With a failure
        let raw_response_with_failure = serde_json::json!({
            "sharpness": 100,
            "glare": 100,
            "horizontalResolution": 0,
            "classification": false,
            "typeOfId": "DriversLicense",
            "issueYear": 2016,
            "issueName": "USA DriversLicense DRIVERS_LICENSE",
            "sessionStatus": "Alive",
            "failReason": "WRONG_DOCUMENT_SIDE"
        });

        let parsed: AddSideResponse = serde_json::from_value(raw_response_with_failure).unwrap();
        let failure = parsed.add_side_failure_reason().unwrap();
        assert_eq!(failure, IncodeVerificationFailureReason::WrongDocumentSide);

        // No failure
        let raw_response = serde_json::json!({
            "sharpness": 100,
            "glare": 100,
            "horizontalResolution": 0,
            "classification": false,
            "typeOfId": "DriversLicense",
            "issueYear": 2016,
            "issueName": "USA DriversLicense DRIVERS_LICENSE",
            "sessionStatus": "Alive",
        });

        let parsed: AddSideResponse = serde_json::from_value(raw_response).unwrap();
        let failure = parsed.add_side_failure_reason();
        assert!(failure.is_none())
    }

    #[test]
    fn test_parse_ocr() {
        let raw_response = serde_json::json!({
          "name": {
            "fullName": "ALEX GINMAN",
            "firstName": "ALEX",
            "givenName": "ALEX",
            "paternalLastName": "GINMAN"
          },
          "address": "76 PARKER HILL AVE 1\nBOSTON, MA 02120",
          "addressFields": {
            "state": "MA"
          },
          "checkedAddress": "76 Parker Hill Ave, Boston, MA 02120, United States",
          "checkedAddressBean": {
            "street": "76 Parker Hill Ave",
            "postalCode": "02120",
            "city": "Boston",
            "state": "MA",
            "label": "76 Parker Hill Ave, Boston, MA 02120, United States",
            "zipColonyOptions": []
          },
          "typeOfId": "DriversLicense",
          "documentFrontSubtype": "DRIVERS_LICENSE",
          "documentBackSubtype": "DRIVERS_LICENSE",
          "birthDate": 5298048, // serde_json overflows, so this is artificially truncated
          "gender": "M",
          "documentNumber": "S3441243",
          "refNumber": "06/13/2015 Rev 02/22/2016",
          "issuedAt": "1560384000000",
          "expireAt": "1728950400000",
          "expirationDate": 2024,
          "issueDate": 2019,
          "additionalTimestamps": [],
          "issuingCountry": "USA",
          "issuingState": "MASSACHUSETTS",
          "height": "5 '  11",
          "restrictions": "NONE",
          "ocrDataConfidence": {
            "birthDateConfidence": 0.9975609,
            "nameConfidence": 0.98470485,
            "givenNameConfidence": 0.98787415,
            "firstNameConfidence": 0.98787415,
            "fathersSurnameConfidence": 0.98153555,
            "addressConfidence": 0.91200954,
            "genderConfidence": 0.9834226,
            "issueDateConfidence": 0.99,
            "expirationDateConfidence": 0.99,
            "issuedAtConfidence": 0.99948984,
            "expireAtConfidence": 0.9990068,
            "documentNumberConfidence": 0.9766761,
            "heightConfidence": 0.9645301,
            "refNumberConfidence": 0.9727157,
            "restrictionsConfidence": 0.92769164
          }
        });

        let mut parsed: FetchOCRResponse = serde_json::from_value(raw_response).unwrap();
        // serde_json doens't like i32, so add in the bday
        parsed.birth_date = Some(529873860000);

        let expected_expiration = NaiveDate::parse_from_str("2024-10-15", "%Y-%m-%d").unwrap();
        let expected_dob = NaiveDate::parse_from_str("1986-10-16", "%Y-%m-%d").unwrap();
        assert_eq!(parsed.expiration_date().unwrap(), expected_expiration);
        assert_eq!(parsed.dob().unwrap(), expected_dob);
    }
}
