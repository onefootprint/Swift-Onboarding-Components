use std::collections::HashMap;

use crate::incode::{error::Error as IncodeError, response::Error, APIResponseToIncodeError};
use chrono::NaiveDateTime;
use newtypes::{
    incode::{IncodeDocumentType, IncodeStatus, IncodeTest},
    IncodeFailureReason, IncodeVerificationSessionKind, PiiString, ScrubbedPiiString,
};

/// Response we get back from adding a document image
#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AddSideResponse {
    pub classification: Option<bool>,
    pub correct_glare: Option<bool>,
    pub correct_sharpness: Option<bool>,
    pub country_code: Option<ScrubbedPiiString>,
    pub glare: Option<i32>,
    pub horizontal_resolution: Option<i32>,
    pub issue_name: Option<ScrubbedPiiString>,
    pub issue_year: Option<i32>,
    pub readability: Option<bool>,
    pub session_status: Option<PiiString>,
    pub sharpness: Option<i32>,
    pub type_of_id: Option<IncodeDocumentType>,
    pub fail_reason: Option<String>,
    #[serde(flatten)]
    pub error: Option<Error>,
}

impl AddSideResponse {
    // Unfortunately, in this case we get a 200 + a non-null `fail_reason`
    pub fn failure_reason(&self) -> Option<IncodeFailureReason> {
        self.fail_reason.as_ref().map(|e| {
            IncodeFailureReason::try_from(e.as_str())
                .unwrap_or_else(|_| IncodeFailureReason::Other(e.clone()))
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
#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
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

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AddSelfieResponse {
    // Value can be 0 or 1. Value 0 means that person on photo is alive. We recommend capturing another photo if value is 1.
    pub confidence: Option<f32>,
    // We recommend capturing another photo if value is false.
    pub is_bright: Option<bool>,
    // We recommend capturing another photo if value is true.
    pub has_lenses: Option<bool>,
    // Checked only if configured in the session flow. We recommend capturing another photo if value is true.
    pub has_face_mask: Option<bool>,
    // Age of th person in the photo.
    pub age: Option<i32>,
    pub session_status: Option<serde_json::Value>,

    #[serde(flatten)]
    pub error: Option<Error>,
}

impl AddSelfieResponse {
    pub fn failure_reasons(&self) -> Vec<IncodeFailureReason> {
        [
            (self.confidence == Some(1.0)).then_some(IncodeFailureReason::SelfieLowConfidence),
            (self.is_bright == Some(false)).then_some(IncodeFailureReason::SelfieTooDark),
            (self.has_lenses == Some(true)).then_some(IncodeFailureReason::SelfieHasLenses),
            (self.has_face_mask == Some(true)).then_some(IncodeFailureReason::SelfieHasFaceMask),
        ]
        .into_iter()
        .flatten()
        .collect()
    }
}

impl APIResponseToIncodeError for AddSelfieResponse {
    fn to_error(&self) -> Option<Error> {
        self.error.clone()
    }
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize, Default)]
#[serde(rename_all = "camelCase")]
// TODO need to PiiStringify eeeeeverything
pub struct FetchOCRResponse {
    pub name: Option<OCRName>,
    // Address as read from id. Address can have two or three lines. Lines are separated by \n.
    pub address: Option<ScrubbedPiiString>,
    pub checked_address: Option<ScrubbedPiiString>,
    pub checked_address_bean: Option<serde_json::Value>,
    pub address_fields: Option<OCRAddress>,
    // Image was classified as one of the following:
    // Unknown, Passport, Visa, DriversLicense, IdentificationCard, Permit, Currency, ResidenceDocument, TravelDocument, BirthCertificate, VehicleRegistration,
    // Other, WeaponLicense, TribalIdentification, VoterIdentification, Military, TaxIdentification, FederalID, MedicalCard
    pub type_of_id: Option<IncodeDocumentType>,
    pub document_front_subtype: Option<PiiString>,
    pub document_back_subtype: Option<PiiString>,
    // Long, UTC millis
    pub birth_date: Option<i64>,
    pub gender: Option<ScrubbedPiiString>,
    pub document_number: Option<ScrubbedPiiString>,
    pub personal_number: Option<ScrubbedPiiString>,
    // Document Reference Number.
    pub ref_number: Option<ScrubbedPiiString>,
    // Optional. Personal tax identification number.
    pub tax_id_number: Option<ScrubbedPiiString>,
    // UTC timestamp, in ms
    pub expire_at: Option<String>,
    // year of expiration
    pub expiration_date: Option<i32>,
    pub additional_timestamps: Option<serde_json::Value>,
    // year of issue
    pub issue_date: Option<i32>,
    pub issuing_country: Option<ScrubbedPiiString>,
    pub issuing_state: Option<ScrubbedPiiString>,
    pub issuing_authority: Option<ScrubbedPiiString>,
    pub nationality: Option<ScrubbedPiiString>,
    // PiiString. Person's nationality as it appears in MRZ (if present).
    pub nationality_mrz: Option<ScrubbedPiiString>,
    // Array. Optional. List of driver's license details elements:
    pub dl_class_details: Option<serde_json::Value>,
    pub ocr_data_confidence: Option<serde_json::Value>,
    pub restrictions: Option<ScrubbedPiiString>,

    #[serde(flatten)]
    pub error: Option<Error>,
}

impl FetchOCRResponse {
    pub fn expiration_date(&self) -> Result<PiiString, IncodeError> {
        let expiration_timestamp = self
            .expire_at
            .clone()
            .ok_or(IncodeError::OcrError("missing field expire_at".into()))?
            .parse::<i64>()?;

        let naive = NaiveDateTime::from_timestamp_opt(expiration_timestamp / 1000, 0).ok_or(
            IncodeError::OcrError("could not parse expiration timestamp".into()),
        )?;

        Ok(PiiString::from(naive.format("%Y-%m-%d")))
    }

    pub fn dob(&self) -> Result<PiiString, IncodeError> {
        let date = self
            .birth_date
            .ok_or(IncodeError::OcrError("missing field birth_date".into()))?;

        // in ms, so divide by 1000
        let naive = NaiveDateTime::from_timestamp_opt(date / 1000, 0).ok_or(IncodeError::OcrError(
            "could not parse birth_date timestamp".into(),
        ))?;

        Ok(PiiString::from(naive.format("%Y-%m-%d")))
    }

    #[allow(non_snake_case)]
    pub fn TEST_ONLY_FIXTURE(
        first_name: Option<PiiString>,
        last_name: Option<PiiString>,
        dob: Option<i64>,
    ) -> serde_json::Value {
        let first_name = first_name.unwrap_or(PiiString::from("Bobby"));
        let last_name = last_name.unwrap_or(PiiString::from("Bobierto"));
        let dob = dob.unwrap_or(529873860000);

        serde_json::json!(
            {"additionalTimestamps":null,
            "address":null,
            "addressFields":null,
            "birthDate":dob,
            "checkedAddress":null,
            "checkedAddressBean":null,
            "dlClassDetails":null,
            "documentBackSubtype":null,
            "documentFrontSubtype":null,
            "documentNumber":"Y12341234",
            "expirationDate":null,
            "expireAt":"1728950400000",
            "gender":"Female",
            "issueDate":null,
            "issuingAuthority":null,
            "issuingCountry":"US",
            "issuingState":"MA",
            "name":{
                "firstName":first_name,
                "fullName":null,
                "givenName":null,
                "givenNameMrz":null,
                "lastNameMrz":null,
                "machineReadableFullName":null,
                "maternalLastName":null,
                "middleName":null,
                "nameSuffix":null,
                "paternalLastName":last_name
            },
            "nationality":null,
            "nationalityMrz":null,
            "ocrDataConfidence":null,
            "personalNumber":null,
            "refNumber":null,
            "restrictions":null,
            "taxIdNumber":null,
            "typeOfId":"DriversLicense"
        })
    }
}

impl APIResponseToIncodeError for FetchOCRResponse {
    fn to_error(&self) -> Option<Error> {
        self.error.clone()
    }
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct GetOnboardingStatusResponse {
    pub onboarding_status: String,
}
impl GetOnboardingStatusResponse {
    pub fn ready(&self, session_kind: IncodeVerificationSessionKind) -> bool {
        match session_kind {
            // When raised it's safe to get scores from the ID Validation Process.  It's also safe to get OCR data
            IncodeVerificationSessionKind::IdDocument => self.onboarding_status == *"ID_VALIDATION_FINISHED",
            // Safe to get scores for liveness, facial recognition and overall (if the flow is simply IDV/selfie)
            IncodeVerificationSessionKind::Selfie => self.onboarding_status == *"FACE_VALIDATION_FINISHED",
        }
    }
}

impl APIResponseToIncodeError for GetOnboardingStatusResponse {
    // no custom error codes here
    // TODO: in future PR handle http errors
    fn to_error(&self) -> Option<Error> {
        None
    }
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct ProcessFaceResponse {
    // Value can be 0 or 1. Value 0 means that selfie doesn't match face photo from ID.
    pub confidence: Option<f32>,
    // Flag indicating if this user already exists in the system.
    pub existing_user: Option<bool>,
    // Session id where user is approved previously (existingUser=true).
    pub existing_interview_id: Option<String>,
    // In case user is approved previously (existingUser=true), flag indicating if names are matching.
    pub name_matched: Option<bool>,
    // In case the session does have an externalId which can be assigned at start call.
    pub existing_external_id: Option<String>,
}
impl APIResponseToIncodeError for ProcessFaceResponse {
    // no custom error codes here
    // TODO: in future PR handle http errors
    fn to_error(&self) -> Option<Error> {
        None
    }
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct OCRName {
    pub full_name: Option<ScrubbedPiiString>,
    pub first_name: Option<ScrubbedPiiString>,
    pub paternal_last_name: Option<ScrubbedPiiString>,
    pub maternal_last_name: Option<ScrubbedPiiString>,
    pub given_name: Option<ScrubbedPiiString>,
    pub middle_name: Option<ScrubbedPiiString>,
    pub name_suffix: Option<ScrubbedPiiString>,
    pub machine_readable_full_name: Option<ScrubbedPiiString>,
    pub given_name_mrz: Option<ScrubbedPiiString>,
    pub last_name_mrz: Option<ScrubbedPiiString>,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct OCRAddress {
    pub street: Option<ScrubbedPiiString>,
    pub colony: Option<ScrubbedPiiString>,
    pub postal_code: Option<ScrubbedPiiString>,
    pub city: Option<ScrubbedPiiString>,
    pub state: Option<ScrubbedPiiString>,
}

#[cfg(test)]
mod tests {
    use newtypes::{
        incode::{IncodeStatus, IncodeTest},
        IncodeFailureReason,
    };

    use crate::incode::doc::response::AddSelfieResponse;

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
        let failure = parsed.failure_reason().unwrap();
        assert_eq!(failure, IncodeFailureReason::WrongDocumentSide);

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
        let failure = parsed.failure_reason();
        assert!(failure.is_none())
    }

    #[test]
    fn test_parse_add_selfie_failure() {
        use IncodeFailureReason::*;

        // One set of errors
        let raw_response_with_failure = serde_json::json!({
            "confidence": 1,
            "isBright": true,
            "hasLenses": true,
            "hasFaceMask": null,
        });

        let parsed: AddSelfieResponse = serde_json::from_value(raw_response_with_failure).unwrap();
        assert_eq!(
            parsed.failure_reasons(),
            vec![SelfieLowConfidence, SelfieHasLenses]
        );

        // And another
        let raw_response_with_failure = serde_json::json!({
            "confidence": 0,
            "isBright": false,
            "hasLenses": null,
            "hasFaceMask": true,
        });

        let parsed: AddSelfieResponse = serde_json::from_value(raw_response_with_failure).unwrap();
        assert_eq!(parsed.failure_reasons(), vec![SelfieTooDark, SelfieHasFaceMask]);

        // No failure
        let raw_response = serde_json::json!({
            "confidence": 0,
            "isBright": true,
            "hasLenses": false,
            "hasFaceMask": null,
        });

        let parsed: AddSelfieResponse = serde_json::from_value(raw_response).unwrap();
        assert!(parsed.failure_reasons().is_empty());
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

        assert_eq!(parsed.expiration_date().unwrap().leak(), "2024-10-15");
        assert_eq!(parsed.dob().unwrap().leak(), "1986-10-16");
    }
}
