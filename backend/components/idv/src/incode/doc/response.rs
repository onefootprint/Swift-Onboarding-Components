use std::{collections::HashMap, str::FromStr};

use crate::{
    incode::{error::Error as IncodeError, response::Error, APIResponseToIncodeError},
    test_fixtures::{self, DocTestOpts},
};
use chrono::{NaiveDate, NaiveDateTime, Utc};
use itertools::Itertools;
use newtypes::{
    incode::{IncodeDocumentRestriction, IncodeDocumentType, IncodeStatus, IncodeTest},
    IdentityDocumentFixtureResult, IncodeFailureReason, IncodeVerificationSessionKind,
    Iso3166ThreeDigitCountryCode, Iso3166TwoDigitCountryCode, PiiString, ScrubbedPiiInt, ScrubbedPiiLong,
    ScrubbedPiiString, DATE_FORMAT,
};

use super::normalize_issuing_state;

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
    pub issue_name: Option<String>,
    pub issue_year: Option<i32>,
    pub readability: Option<bool>,
    pub session_status: Option<PiiString>,
    pub sharpness: Option<i32>,
    pub type_of_id: Option<IncodeDocumentType>,
    pub fail_reason: Option<String>,
    #[serde(flatten)]
    pub error: Option<Error>,
}

// https://onefootprint.slack.com/archives/C0514LEFUCS/p1692735019118229
// Only for US atm
// No documentation for these enum values
const DRIVERS_LICENSE_PERMIT_IDENTIFIERS: [&str; 9] = [
    "LEARNERS_PERMIT",
    "LEARNERS_PERMIT_UNDER21",
    "PROVISIONAL_DRIVERS_LICENSE_UNDER21",
    "PROVISIONAL_DRIVERS_LICENSE",
    "INTERMEDIATE_DRIVERS_LICENSE_UNDER21",
    "JUNIOR_DRIVERS_LICENSE",
    "JUNIOR_OPERATORS_LICENSE_UNDER21",
    "ENHANCED_LEARNERS_PERMIT_UNDER21",
    "ENHANCED_PROVISIONAL_DRIVERS_LICENSE_UNDER21",
];

impl AddSideResponse {
    // Unfortunately, in this case we get a 200 + a non-null `fail_reason`
    pub fn failure_reasons(&self, restrictions: Vec<IncodeDocumentRestriction>) -> Vec<IncodeFailureReason> {
        let restrictions_fail_reasons = restrictions.into_iter().map(|r| self.handle_restriction(r));
        let fail_reason = self.fail_reason.as_ref().map(|e| {
            IncodeFailureReason::try_from(e.as_str())
                .unwrap_or_else(|_| IncodeFailureReason::Other(e.clone()))
        });

        [fail_reason]
            .into_iter()
            .chain(restrictions_fail_reasons)
            .flatten()
            .collect()
    }

    fn handle_restriction(&self, restriction: IncodeDocumentRestriction) -> Option<IncodeFailureReason> {
        match restriction {
            IncodeDocumentRestriction::NoDriverLicensePermit => {
                self.is_drivers_license_permit().and_then(|is_permit| {
                    is_permit.then_some(IncodeFailureReason::DriversLicensePermitNotAllowed)
                })
            }
            IncodeDocumentRestriction::ConservativeGlare => {
                (self.correct_glare == Some(false)).then_some(IncodeFailureReason::DocumentGlare)
            }
            IncodeDocumentRestriction::ConservativeSharpness => {
                (self.correct_sharpness == Some(false)).then_some(IncodeFailureReason::DocumentSharpness)
            }
        }
    }

    fn is_drivers_license_permit(&self) -> Option<bool> {
        self.issue_name.as_ref().map(|issue_name| {
            DRIVERS_LICENSE_PERMIT_IDENTIFIERS
                .iter()
                .any(|i| issue_name.contains(i))
        })
    }
}

impl APIResponseToIncodeError for AddSideResponse {
    fn to_error(&self) -> Option<Error> {
        self.error.clone()
    }

    fn custom_failure_reasons(error: crate::incode::response::Error) -> Option<Vec<IncodeFailureReason>> {
        let e = match error.status {
            1003 => vec![IncodeFailureReason::FaceCroppingFailure],
            4019 => vec![IncodeFailureReason::FaceNotFound],
            500 => vec![IncodeFailureReason::UnexpectedErrorOccurred],
            _ => vec![IncodeFailureReason::UnexpectedErrorOccurred],
        };

        Some(e)
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

    fn custom_failure_reasons(_error: crate::incode::response::Error) -> Option<Vec<IncodeFailureReason>> {
        None
    }
}

/// Response from fetch scores
#[derive(Debug, Clone, serde::Deserialize, serde::Serialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct FetchScoresResponse {
    pub id_validation: Option<IdValidation>,
    pub liveness: Option<Liveness>,
    pub face_recognition: Option<FaceRecognition>,
    pub id_ocr_confidence: Option<IdOcrConfidence>,
    pub overall: Option<IdTest>,

    #[serde(flatten)]
    pub error: Option<Error>,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct Liveness {
    pub overall: Option<IdTest>,
    pub photo_quality: Option<IdTest>,
    pub liveness_score: Option<IdTest>,
}

impl FetchScoresResponse {
    pub fn document_score(&self) -> (Option<f64>, Option<IncodeStatus>) {
        let overall_test = &self.id_validation.as_ref().and_then(|i| i.overall.clone());
        Self::score_and_status(overall_test)
    }

    pub fn liveness_score(&self) -> (Option<f64>, Option<IncodeStatus>) {
        let overall_test = &self.liveness.as_ref().and_then(|i| i.overall.clone());
        Self::score_and_status(overall_test)
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
            .chain(id_specific_tests)
            .chain(custom_field_tests)
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

    pub fn get_face_test_results(&self) -> (Option<bool>, Option<bool>) {
        let had_lenses = self
            .face_recognition
            .as_ref()
            .and_then(|fr| fr.lenses_check.as_ref())
            .and_then(|lc| lc.status.as_ref())
            .map(|status| IncodeStatus::try_from(status.as_str()).ok() == Some(IncodeStatus::Fail));

        let had_mask = self
            .face_recognition
            .as_ref()
            .and_then(|fr| fr.mask_check.as_ref())
            .and_then(|lc| lc.status.as_ref())
            .map(|status| IncodeStatus::try_from(status.as_str()).ok() == Some(IncodeStatus::Fail));

        (had_lenses, had_mask)
    }

    pub fn id_ocr_confidence(&self) -> (Option<f64>, Option<IncodeStatus>) {
        Self::score_and_status(
            &self
                .id_ocr_confidence
                .as_ref()
                .and_then(|i| i.overall_confidence.clone()),
        )
    }

    pub fn selfie_match(&self) -> (Option<f64>, Option<IncodeStatus>) {
        Self::score_and_status(&self.face_recognition.as_ref().and_then(|i| i.overall.clone()))
    }

    pub fn fixture_response(fixture: Option<IdentityDocumentFixtureResult>) -> Result<Self, IncodeError> {
        let doc_opts = if let Some(f) = fixture {
            match f {
                IdentityDocumentFixtureResult::Fail => Ok(DocTestOpts {
                    overall: IncodeStatus::Fail,
                    tamper: IncodeStatus::Fail,
                    fake: IncodeStatus::Fail,
                    ..Default::default()
                }),
                IdentityDocumentFixtureResult::Pass => Ok(DocTestOpts::default()),
                IdentityDocumentFixtureResult::Real => Err(IncodeError::FixtureResultMismatch),
            }
        } else {
            Ok(DocTestOpts::default())
        }?;
        let resp: Self = serde_json::from_value(test_fixtures::incode_fetch_scores_response(doc_opts))?;

        Ok(resp)
    }

    fn score_and_status(id_test: &Option<IdTest>) -> (Option<f64>, Option<IncodeStatus>) {
        let status = id_test
            .as_ref()
            .and_then(|o| o.status.as_ref())
            .and_then(|s| IncodeStatus::try_from(s.as_str()).ok());

        let score = id_test
            .as_ref()
            .and_then(|o| o.value.as_ref())
            .and_then(|s| s.parse::<f64>().ok());

        (score, status)
    }
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct IdValidation {
    pub photo_security_and_quality: Option<Vec<IdTest>>,
    pub id_specific: Option<Vec<IdTest>>,
    pub custom_fields: Option<Vec<IdTest>>,
    pub applied_rule: Option<serde_json::Value>,
    pub overall: Option<IdTest>,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct IdOcrConfidence {
    pub overall_confidence: Option<IdTest>,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FaceRecognition {
    pub existing_user: Option<bool>,
    // Session ID, in case the user, is approved in another session.,
    pub existing_interview_id: Option<String>,
    // External ID, in case the user, is approved in another session.,
    pub existing_external_id: Option<String>,
    // Shows info if the user was wearing a mask during selfie capture,
    pub mask_check: Option<IdTest>,
    pub face_brightness: Option<IdTest>,
    pub lenses_check: Option<IdTest>,
    // Shows if the name matches the previously used (only in case the user is already approved in another session),
    pub name_match: Option<IdTest>,
    // Specific rule from rule engine for faceValidation:,
    pub applied_rule: Option<serde_json::Value>,
    // Shows how much face from ID matches the selfie,
    pub overall: Option<IdTest>,
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

    fn custom_failure_reasons(_error: crate::incode::response::Error) -> Option<Vec<IncodeFailureReason>> {
        None
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

    fn custom_failure_reasons(_error: crate::incode::response::Error) -> Option<Vec<IncodeFailureReason>> {
        None
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
            // currently Incode was a weird bug where if `confidence` is missing from the response then that indicates an internal "UNSATISFIED_BRIGHTNESS_LEVEL" error on their end. so for now we treat the same as brightness check failing
            (self.confidence.is_none()).then_some(IncodeFailureReason::SelfieTooDark),
            (self.is_bright == Some(false)).then_some(IncodeFailureReason::SelfieTooDark),
            (self.has_lenses == Some(true)).then_some(IncodeFailureReason::SelfieHasLenses),
        ]
        .into_iter()
        .unique()
        .flatten()
        .collect()
    }
}

impl APIResponseToIncodeError for AddSelfieResponse {
    fn to_error(&self) -> Option<Error> {
        self.error.clone()
    }

    fn custom_failure_reasons(error: crate::incode::response::Error) -> Option<Vec<IncodeFailureReason>> {
        let e = match error.status {
            4019 => vec![IncodeFailureReason::SelfieFaceNotFound],
            4010 => vec![IncodeFailureReason::SelfieFaceNotFound],
            1001 => vec![IncodeFailureReason::FaceCroppingFailure],
            1003 => vec![IncodeFailureReason::FaceCroppingFailure],
            3002 => vec![IncodeFailureReason::FaceCroppingFailure],
            3004 => vec![IncodeFailureReason::FaceCroppingFailure],
            3005 => vec![IncodeFailureReason::FaceCroppingFailure],
            3006 => vec![IncodeFailureReason::SelfieBlurry],
            3007 => vec![IncodeFailureReason::SelfieGlare],
            3008 => vec![IncodeFailureReason::SelfieImageSizeUnsupported],
            3009 => vec![IncodeFailureReason::SelfieImageOrientationIncorrect],
            3010 => vec![IncodeFailureReason::SelfieBadImageCompression],
            500 => vec![IncodeFailureReason::UnexpectedErrorOccurred],
            6000 => {
                tracing::error!("6000 selfie error from incode");
                vec![IncodeFailureReason::UnexpectedErrorOccurred]
            }
            _ => vec![IncodeFailureReason::UnexpectedErrorOccurred],
        };

        Some(e)
    }
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct CheckedAddress {
    pub street: Option<ScrubbedPiiString>,
    pub colony: Option<ScrubbedPiiString>,
    pub postal_code: Option<ScrubbedPiiString>,
    pub city: Option<ScrubbedPiiString>,
    pub state: Option<ScrubbedPiiString>,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize, Default)]
#[serde(rename_all = "camelCase")]
// TODO need to PiiStringify eeeeeverything
pub struct FetchOCRResponse {
    pub name: Option<OCRName>,
    // Address as read from id. Address can have two or three lines. Lines are separated by \n.
    pub address: Option<ScrubbedPiiString>,
    pub checked_address: Option<ScrubbedPiiString>,
    pub checked_address_bean: Option<OCRAddress>,
    pub address_fields: Option<OCRAddress>,
    // Image was classified as one of the following:
    // Unknown, Passport, Visa, DriversLicense, IdentificationCard, Permit, Currency, ResidenceDocument, TravelDocument, BirthCertificate, VehicleRegistration,
    // Other, WeaponLicense, TribalIdentification, VoterIdentification, Military, TaxIdentification, FederalID, MedicalCard
    pub type_of_id: Option<IncodeDocumentType>,
    pub document_front_subtype: Option<PiiString>,
    pub document_back_subtype: Option<PiiString>,
    // Long, UTC millis
    pub birth_date: Option<ScrubbedPiiLong>,
    pub gender: Option<ScrubbedPiiString>,
    pub document_number: Option<ScrubbedPiiString>,
    pub personal_number: Option<ScrubbedPiiString>,
    // Document Reference Number.
    pub ref_number: Option<ScrubbedPiiString>,
    // Optional. Personal tax identification number.
    pub tax_id_number: Option<ScrubbedPiiString>,
    // UTC timestamp, in ms
    pub expire_at: Option<ScrubbedPiiString>,
    // UTC timestamp, in ms
    pub issued_at: Option<ScrubbedPiiString>,
    // year of expiration
    pub expiration_date: Option<ScrubbedPiiInt>,
    pub additional_timestamps: Option<serde_json::Value>,
    // year of issue
    pub issue_date: Option<ScrubbedPiiInt>,
    // Three-digit ISO, it seems
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
    // MX specific
    pub curp: Option<ScrubbedPiiString>,
    pub cic: Option<ScrubbedPiiString>,
    pub mrz1: Option<ScrubbedPiiString>,
    pub mrz2: Option<ScrubbedPiiString>,
    pub birth_place: Option<ScrubbedPiiString>,

    #[serde(flatten)]
    pub error: Option<Error>,
}

pub struct IncodeOcrFixtureResponseFields {
    pub first_name: Option<PiiString>,
    pub last_name: Option<PiiString>,
    pub dob: Option<PiiString>,
}

impl FetchOCRResponse {
    fn format_date(date: Option<&ScrubbedPiiString>) -> Result<ScrubbedPiiString, IncodeError> {
        let expiration_timestamp = date
            .ok_or(IncodeError::OcrError("missing timestamp field".into()))?
            .leak()
            .parse::<i64>()?;

        let naive = NaiveDateTime::from_timestamp_opt(expiration_timestamp / 1000, 0)
            .ok_or(IncodeError::OcrError("could not parse timestamp".into()))?;

        Ok(ScrubbedPiiString::from(naive.format(DATE_FORMAT)))
    }

    pub fn expiration_date(&self) -> Result<ScrubbedPiiString, IncodeError> {
        Self::format_date(self.expire_at.as_ref())
    }

    pub fn issue_date(&self) -> Result<ScrubbedPiiString, IncodeError> {
        Self::format_date(self.issued_at.as_ref())
    }

    pub fn normalized_issuing_state(&self) -> Option<ScrubbedPiiString> {
        self.issuing_state
            .as_ref()
            .map(|is| ScrubbedPiiString::from(normalize_issuing_state(is.leak_to_string())))
    }

    pub fn issuing_country_two_digit(&self) -> Option<ScrubbedPiiString> {
        self.issuing_country
            .as_ref()
            .and_then(|i| Iso3166ThreeDigitCountryCode::from_str(i.leak()).ok())
            .map(Iso3166TwoDigitCountryCode::from)
            .map(ScrubbedPiiString::from)
    }

    pub fn dob(&self) -> Result<ScrubbedPiiString, IncodeError> {
        let date = self
            .birth_date
            .as_ref()
            .ok_or(IncodeError::OcrError("missing field birth_date".into()))?;

        // in ms, so divide by 1000
        let naive = NaiveDateTime::from_timestamp_opt(date.leak() / 1000, 0).ok_or(IncodeError::OcrError(
            "could not parse birth_date timestamp".into(),
        ))?;

        Ok(ScrubbedPiiString::from(naive.format(DATE_FORMAT)))
    }

    pub fn age(&self) -> Result<i64, IncodeError> {
        let dob = NaiveDate::parse_from_str(self.dob()?.leak(), DATE_FORMAT)
            .map_err(|_| IncodeError::OcrError("error parsing dob".into()))?;

        let today = Utc::now().naive_utc().date();

        Ok((today - dob).num_days() / 365)
    }

    pub fn fixture_response<T: Into<IncodeOcrFixtureResponseFields>>(data: Option<T>) -> serde_json::Value {
        let data: Option<IncodeOcrFixtureResponseFields> = data.map(|d| d.into());
        let first_name = data
            .as_ref()
            .and_then(|d| d.first_name.clone())
            .unwrap_or(PiiString::from("Piip"));
        let last_name = data
            .as_ref()
            .and_then(|d| d.last_name.clone())
            .unwrap_or(PiiString::from("Penguin"));
        let full_name = format!("{} {}", first_name.leak(), last_name.leak());
        let dob = data
            .as_ref()
            .and_then(|d| d.dob.as_ref())
            .and_then(|dob| NaiveDate::parse_from_str(dob.leak(), DATE_FORMAT).ok())
            .and_then(|d| d.and_hms_milli_opt(0, 0, 0, 0))
            .map(|d| d.timestamp_millis())
            .unwrap_or(529873860000);

        serde_json::json!(
            {"additionalTimestamps":null,
            "address": "567 HAYES ST SAN FRANCISCO CA 941020000 USA",
            "addressFields": {
                "street": "567 HAYES ST",
                "colony": null,
                "postalCode": "941020000",
                "city": "SAN FRANCISCO",
                "state": "CA"
            },
            "birthDate":dob,
            "checkedAddress": "567 Hayes St, San Francisco, CA 94102, United States",
            "checkedAddressBean": {
                "street": "567 Hayes St",
                "colony": "Hayes Valley",
                "postalCode": "94102",
                "city": "San Francisco",
                "state": "CA",
                "label": "567 Hayes St, San Francisco, CA 94102, United States",
                "latitude": 37.01795,
                "longitude": -122.01123,
                "zipColonyOptions": []
            },
            "dlClassDetails":null,
            "documentBackSubtype":null,
            "documentFrontSubtype":null,
            "documentNumber":"Y12341234",
            "expirationDate":null,
            "expireAt":"1728950400000",
            "gender":"M",
            "issueDate":2022,
            "issuingAuthority":null,
            "issuingCountry":"USA",
            "issuingState":"CALIFORNIA",
            "name":{
                "firstName":first_name,
                "fullName":full_name,
                "givenName":first_name,
                "givenNameMrz":null,
                "lastNameMrz":null,
                "machineReadableFullName":full_name,
                "maternalLastName":null,
                "middleName":null,
                "nameSuffix":null,
                "paternalLastName":last_name
            },
            "nationality":null,
            "nationalityMrz":null,
            "ocrDataConfidence":null,
            "personalNumber":null,
            "refNumber": "03/05/2020503OD/BBFD/24",
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

    fn custom_failure_reasons(_error: crate::incode::response::Error) -> Option<Vec<IncodeFailureReason>> {
        None
    }
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct GetOnboardingStatusResponse {
    pub onboarding_status: String,

    #[serde(flatten)]
    pub error: Option<Error>,
}
impl GetOnboardingStatusResponse {
    pub fn ready(&self, session_kind: &IncodeVerificationSessionKind, wait_for_selfie: bool) -> bool {
        match session_kind {
            // When raised it's safe to get scores from the ID Validation Process.  It's also safe to get OCR data
            IncodeVerificationSessionKind::IdDocument => {
                (self.onboarding_status == *"ID_VALIDATION_FINISHED")
                    || (self.onboarding_status == *"POST_PROCESSING_FINISHED")
            }
            // Safe to get scores for liveness, facial recognition and overall (if the flow is simply IDV/selfie)
            IncodeVerificationSessionKind::Selfie => {
                if wait_for_selfie {
                    self.onboarding_status == *"FACE_VALIDATION_FINISHED"
                } else {
                    (self.onboarding_status == *"ID_VALIDATION_FINISHED")
                        || (self.onboarding_status == *"POST_PROCESSING_FINISHED"
                            || self.onboarding_status == *"FACE_VALIDATION_FINISHED")
                }
            }
        }
    }
}

impl APIResponseToIncodeError for GetOnboardingStatusResponse {
    // no custom error codes here
    // TODO: in future PR handle http errors
    fn to_error(&self) -> Option<Error> {
        self.error.clone()
    }

    fn custom_failure_reasons(_error: crate::incode::response::Error) -> Option<Vec<IncodeFailureReason>> {
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

    #[serde(flatten)]
    pub error: Option<Error>,
}
impl APIResponseToIncodeError for ProcessFaceResponse {
    // no custom error codes here
    // TODO: in future PR handle http errors
    fn to_error(&self) -> Option<Error> {
        self.error.clone()
    }

    fn custom_failure_reasons(_error: crate::incode::response::Error) -> Option<Vec<IncodeFailureReason>> {
        // does this need to be something???
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

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize, Default)]
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
        incode::{IncodeDocumentRestriction, IncodeStatus, IncodeTest},
        IncodeFailureReason, PiiLong, ScrubbedPiiLong,
    };

    use crate::{
        incode::{
            doc::response::{AddSelfieResponse, ProcessFaceResponse},
            IncodeAPIResult,
        },
        test_fixtures::{self, DocTestOpts},
    };

    use super::{AddSideResponse, FetchOCRResponse, FetchScoresResponse};

    #[test]
    pub fn test_parse_fetch_scores() {
        let raw_response = test_fixtures::incode_fetch_scores_response(DocTestOpts::default());

        let parsed: FetchScoresResponse = serde_json::from_value(raw_response).unwrap();
        assert_eq!(parsed.id_ocr_confidence().1.unwrap(), IncodeStatus::Ok);
        assert_eq!(parsed.selfie_match().1.unwrap(), IncodeStatus::Ok);
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
        assert_eq!(parsed.document_score().1.unwrap(), IncodeStatus::Ok)
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
            "issueName": "USA DriversLicense ENHANCED_DRIVERS_LICENSE_UNDER21",
            "sessionStatus": "Alive",
            "failReason": "WRONG_DOCUMENT_SIDE"
        });

        let parsed: AddSideResponse = serde_json::from_value(raw_response_with_failure).unwrap();
        // disallow permits, but it's not a permit
        let failures = parsed.failure_reasons(vec![IncodeDocumentRestriction::NoDriverLicensePermit]);
        assert_eq!(failures, vec![IncodeFailureReason::WrongDocumentSide,]);

        let raw_response_with_failure = serde_json::json!({
            "sharpness": 100,
            "glare": 100,
            "horizontalResolution": 0,
            "classification": false,
            "typeOfId": "DriversLicense",
            "issueYear": 2016,
            "issueName": "USA DriversLicense LEARNERS_PERMIT_UNDER21",
            "sessionStatus": "Alive",
            "failReason": "UNABLE_TO_ALIGN_DOCUMENT"
        });

        let parsed: AddSideResponse = serde_json::from_value(raw_response_with_failure).unwrap();
        // disallow permits
        let failures = parsed.failure_reasons(vec![IncodeDocumentRestriction::NoDriverLicensePermit]);
        assert_eq!(
            failures,
            vec![
                IncodeFailureReason::UnableToAlignDocument,
                IncodeFailureReason::DriversLicensePermitNotAllowed
            ]
        );

        // No failure
        let raw_response = serde_json::json!({
            "sharpness": 100,
            "glare": 100,
            "horizontalResolution": 0,
            "classification": false,
            "typeOfId": "DriversLicense",
            "countryCode": "USA",
            "issueYear": 2016,
            "issueName": "USA DriversLicense DRIVERS_LICENSE",
            "sessionStatus": "Alive",
        });

        let parsed: AddSideResponse = serde_json::from_value(raw_response).unwrap();
        let failure = parsed.failure_reasons(vec![]);
        assert!(failure.is_empty())
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
        assert_eq!(parsed.failure_reasons(), vec![SelfieTooDark]);

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
    fn test_add_selfie_error() {
        let raw_response = serde_json::json!(
            {"timestamp":1695335887367i64,"status":4019,"error":"Face not found.","path":"/omni/add/face/third-party"}
        );
        let res = IncodeAPIResult::<AddSelfieResponse>::try_from(raw_response).unwrap();
        let e = res.into_success().unwrap_err();
        assert!(matches!(e, crate::incode::error::Error::APIResponseError(_)));
    }

    #[test]
    fn test_process_face_error() {
        let raw_response = serde_json::json!(
            {"timestamp":1698201468377i64,"status":6000,"error":"Processing error","path":"/omni/process/face"}
        );
        let res = IncodeAPIResult::<ProcessFaceResponse>::try_from(raw_response).unwrap();
        let e = res.into_success().unwrap_err();
        assert!(matches!(e, crate::incode::error::Error::APIResponseError(_)));
    }

    #[test]
    fn test_parse_ocr() {
        let raw_response = test_fixtures::incode_fetch_ocr_response(None);

        let mut parsed: FetchOCRResponse = serde_json::from_value(raw_response).unwrap();
        // serde_json doens't like i32, so add in the bday
        parsed.birth_date = Some(ScrubbedPiiLong::new(PiiLong::new(529873860000)));

        assert_eq!(parsed.expiration_date().unwrap().leak(), "2024-10-15");
        assert_eq!(parsed.dob().unwrap().leak(), "1986-10-16");

        // check negatives
        parsed.birth_date = Some(ScrubbedPiiLong::new(PiiLong::new(-631152000000)));
        assert_eq!(parsed.dob().unwrap().leak(), "1950-01-01");
    }
}
