use crate::incode::error::Error as IncodeError;
use crate::incode::IncodeClientErrorCustomFailureReasons;
use crate::test_fixtures::DocTestOpts;
use crate::test_fixtures::{
    self,
};
use chrono::NaiveDate;
use chrono::NaiveDateTime;
use chrono::Utc;
use itertools::Itertools;
use newtypes::incode::IncodeDocumentRestriction;
use newtypes::incode::IncodeDocumentSubType;
use newtypes::incode::IncodeDocumentType;
use newtypes::incode::IncodeStatus;
use newtypes::incode::IncodeTest;
use newtypes::DocumentFixtureResult;
use newtypes::IdDocKind;
use newtypes::IncodeFailureReason;
use newtypes::IncodeVerificationSessionKind;
use newtypes::Iso3166ThreeDigitCountryCode;
use newtypes::Iso3166TwoDigitCountryCode;
use newtypes::PiiString;
use newtypes::ScrubbedPiiInt;
use newtypes::ScrubbedPiiLong;
use newtypes::ScrubbedPiiString;
use newtypes::UsState;
use newtypes::UsStateFull;
use newtypes::DATE_FORMAT;
use std::collections::HashMap;
use std::str::FromStr;

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
}

// https://onefootprint.slack.com/archives/C0514LEFUCS/p1692735019118229
// Only for US atm
// No documentation for these enum values
const DRIVERS_LICENSE_PERMIT_IDENTIFIERS: [&str; 9] = [
    // TODO: replace with IncodeDocumentSubType
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
        let military_id_reason = if self.type_of_id == Some(IncodeDocumentType::Military) {
            vec![Some(IncodeFailureReason::MilitaryIdNotAllowed)]
        } else {
            vec![]
        };

        [fail_reason]
            .into_iter()
            .chain(restrictions_fail_reasons)
            .chain(military_id_reason)
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

    pub fn document_sub_type(&self) -> Option<IncodeDocumentSubType> {
        // note: DL's will have this last token be the state and not really a document subtype which is
        // kinda annoying
        self.issue_name
            .as_ref()
            .and_then(|i| i.split(' ').last())
            .and_then(|s| IncodeDocumentSubType::from_str(s).ok())
    }
}

impl IncodeClientErrorCustomFailureReasons for AddSideResponse {
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
}

impl IncodeClientErrorCustomFailureReasons for ProcessIdResponse {
    fn custom_failure_reasons(error: crate::incode::response::Error) -> Option<Vec<IncodeFailureReason>> {
        let e = match error.status {
            // incode will not proceed and user gets stuck if error 6000 is returned from here
            // so we need to put user in DocUploadFailed
            6000 => vec![IncodeFailureReason::ProcessIdCouldNotProcess],
            _ => vec![IncodeFailureReason::UnexpectedErrorOccurred],
        };

        Some(e)
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
    pub overall: Option<ValueStatusKey>,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AddCustomerResponse {
    pub success: bool,
    #[serde(rename = "uuid")]
    pub customer_id: Option<String>,
    // Access token to be used for newly created customer, in case approval was successful.
    // Note: it has diff permissions than the omni/start one AFAICT
    pub token: Option<String>,
    pub total_score: Option<String>,
    pub existing_customer: Option<bool>,
}

impl IncodeClientErrorCustomFailureReasons for AddCustomerResponse {
    fn custom_failure_reasons(_e: crate::incode::response::Error) -> Option<Vec<IncodeFailureReason>> {
        None
    }
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct Liveness {
    pub overall: Option<ValueStatusKey>,
    pub photo_quality: Option<ValueStatusKey>,
    pub liveness_score: Option<ValueStatusKey>,
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

    pub fn fixture_response(fixture: Option<DocumentFixtureResult>) -> Result<Self, IncodeError> {
        let doc_opts = if let Some(f) = fixture {
            match f {
                DocumentFixtureResult::Fail => Ok(DocTestOpts {
                    overall: IncodeStatus::Fail,
                    tamper: IncodeStatus::Fail,
                    fake: IncodeStatus::Fail,
                    ..Default::default()
                }),
                DocumentFixtureResult::Pass => Ok(DocTestOpts::default()),
                DocumentFixtureResult::Real => Err(IncodeError::FixtureResultMismatch),
            }
        } else {
            Ok(DocTestOpts::default())
        }?;
        let resp: Self = serde_json::from_value(test_fixtures::incode_fetch_scores_response(doc_opts))?;

        Ok(resp)
    }

    fn score_and_status(id_test: &Option<ValueStatusKey>) -> (Option<f64>, Option<IncodeStatus>) {
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
    pub photo_security_and_quality: Option<Vec<ValueStatusKey>>,
    pub id_specific: Option<Vec<ValueStatusKey>>,
    pub custom_fields: Option<Vec<ValueStatusKey>>,
    pub applied_rule: Option<serde_json::Value>,
    pub overall: Option<ValueStatusKey>,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct IdOcrConfidence {
    pub overall_confidence: Option<ValueStatusKey>,
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
    pub mask_check: Option<ValueStatusKey>,
    pub face_brightness: Option<ValueStatusKey>,
    pub lenses_check: Option<ValueStatusKey>,
    // Shows if the name matches the previously used (only in case the user is already approved in another
    // session),
    pub name_match: Option<ValueStatusKey>,
    // Specific rule from rule engine for faceValidation:,
    pub applied_rule: Option<serde_json::Value>,
    // Shows how much face from ID matches the selfie,
    pub overall: Option<ValueStatusKey>,
    // Incode can identity a user across sessions
    pub customer_id: Option<String>,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ValueStatusKey {
    pub value: Option<String>,
    pub status: Option<String>,
    pub key: Option<String>,
}

impl IncodeClientErrorCustomFailureReasons for FetchScoresResponse {
    fn custom_failure_reasons(_error: crate::incode::response::Error) -> Option<Vec<IncodeFailureReason>> {
        None
    }
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AddConsentResponse {
    pub success: bool,
}

impl IncodeClientErrorCustomFailureReasons for AddConsentResponse {
    fn custom_failure_reasons(_error: crate::incode::response::Error) -> Option<Vec<IncodeFailureReason>> {
        None
    }
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AddSelfieResponse {
    // Value can be 0 or 1. Value 0 means that person on photo is alive. We recommend capturing another photo
    // if value is 1.
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
}

impl AddSelfieResponse {
    pub fn failure_reasons(&self) -> Vec<IncodeFailureReason> {
        [
            (self.confidence == Some(1.0)).then_some(IncodeFailureReason::SelfieLowConfidence),
            // currently Incode was a weird bug where if `confidence` is missing from the response then that
            // indicates an internal "UNSATISFIED_BRIGHTNESS_LEVEL" error on their end. so for now we treat
            // the same as brightness check failing
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

impl IncodeClientErrorCustomFailureReasons for AddSelfieResponse {
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
                tracing::warn!("6000 selfie error from incode");
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
    // Unknown, Passport, Visa, DriversLicense, IdentificationCard, Permit, Currency, ResidenceDocument,
    // TravelDocument, BirthCertificate, VehicleRegistration, Other, WeaponLicense, TribalIdentification,
    // VoterIdentification, Military, TaxIdentification, FederalID, MedicalCard
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
    // String. Optional. Person's driver licence classes.
    pub classes: Option<PiiString>,
    // String. Optional. Person's driver licence mentions.
    pub mentions: Option<PiiString>,
    // String. Optional. Person's driver licence conditions.
    pub cond: Option<PiiString>,
    // Array. Optional. List of driver's license details elements:
    // Note: We don't seem to ever get this
    pub dl_class_details: Option<serde_json::Value>,
    pub restrictions: Option<ScrubbedPiiString>,
    pub ocr_data_confidence: Option<OcrDataConfidence>,
    // MX specific
    pub curp: Option<ScrubbedPiiString>,
    pub cic: Option<ScrubbedPiiString>,
    pub mrz1: Option<ScrubbedPiiString>,
    pub mrz2: Option<ScrubbedPiiString>,
    pub mrz3: Option<ScrubbedPiiString>,
    //
    // Leaving a lot of these Values just in case they aren't consistent across diff countries...
    pub full_name_mrz: Option<serde_json::Value>,
    pub birth_place: Option<serde_json::Value>,
    pub numero_emision_credencial: Option<serde_json::Value>,
    pub full_address: Option<serde_json::Value>,
    pub invalid_address: Option<serde_json::Value>,
    pub exterior_number: Option<serde_json::Value>,
    pub interior_number: Option<serde_json::Value>,
    pub clave_de_elector: Option<serde_json::Value>,
    // not sure - i think this is MX specific
    pub ocr: Option<serde_json::Value>,
    pub registration_date: Option<serde_json::Value>,
    // unsure, i32 in response. number of not extracted fields?
    pub not_extracted: Option<serde_json::Value>,
    pub not_extracted_details: Option<serde_json::Value>,
    pub document_number_check_digit: Option<serde_json::Value>,
    pub date_of_birth_check_digit: Option<serde_json::Value>,
    pub expiration_date_check_digit: Option<serde_json::Value>,
}

/// A struct that produces a fixture OCR response from incode
#[derive(Default, Clone)]
pub struct IncodeOcrFixtureResponseFields {
    pub first_name: Option<PiiString>,
    pub last_name: Option<PiiString>,
    pub dob: Option<PiiString>,
    // just used for MX now, but in future will extend and de-private
    pub curp: Option<PiiString>,
    pub type_of_id: Option<IncodeDocumentType>,
}

impl IncodeOcrFixtureResponseFields {
    pub fn set_doc_kind_fields(mut self, doc_kind: IdDocKind) -> Self {
        let (curp, type_of_id) = {
            let (type_of_id, _) = doc_kind.into();
            let curp = match doc_kind {
                IdDocKind::VoterIdentification | IdDocKind::Passport => Some(test_fixtures::TEST_CURP.into()),
                _ => None,
            };

            (curp, type_of_id)
        };
        self.curp = curp;
        self.type_of_id = type_of_id;
        self
    }
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

    pub fn document_sub_type(&self) -> Option<IncodeDocumentSubType> {
        // maybe error or alert or something fancier if they arent the same??
        self.document_front_subtype
            .as_ref()
            .and_then(|s| IncodeDocumentSubType::from_str(s.leak()).ok())
            .or(self
                .document_back_subtype
                .as_ref()
                .and_then(|s| IncodeDocumentSubType::from_str(s.leak()).ok()))
    }

    // From https://onefootprint.slack.com/archives/C0514LEFUCS/p1692979980826089
    fn normalize_issuing_state(raw_state: String) -> String {
        let state = raw_state.to_uppercase();
        match state.trim() {
            "BAJA_CALIFORNIA_SUR" => "BAJA_CALIFORNIA".into(),
            "VIRGIN ISLANDS (U.S.)" => "VIRGIN_ISLANDS".into(),
            s => s.replace(' ', "_"),
        }
    }

    pub fn normalized_issuing_state(&self) -> Option<ScrubbedPiiString> {
        self.issuing_state
            .as_ref()
            .map(|is| ScrubbedPiiString::from(Self::normalize_issuing_state(is.leak_to_string())))
    }

    pub fn issuing_state_us_2_char(&self) -> Option<UsState> {
        self.issuing_state.as_ref().and_then(|raw_state| {
            let from_2_char = UsState::from_raw_string(raw_state.leak()).ok();
            let from_full: Option<UsState> = UsStateFull::from_raw_string(raw_state.leak())
                .ok()
                .map(|s| s.into());

            from_2_char.or(from_full)
        })
    }

    pub fn normalized_class(&self) -> Option<PiiString> {
        self.classes
            .clone()
            .as_ref()
            .map(|c| c.leak_to_string().to_uppercase().trim().into())
    }

    pub fn is_permit_or_provisional_license(&self) -> Option<bool> {
        // Mapping of Incode's issuingState to the state's license class
        // Seemed unnecessary to do a full enum dance here
        let map: HashMap<&str, Vec<&str>> = HashMap::from_iter([(
            // https://dds.georgia.gov/license-classes#:~:text=Class%20C%20(Non%2DCommercial%20and,of%20vehicles%20has%20a%20gross
            "GEORGIA",
            vec![
                "CP", // non-commercial permit
                "EP", // non-commercial permit
                "FP", // non-commercial permit
                // Flexcar wants to review these, per Jon Coombs
                // https://onefootprint.slack.com/archives/C053U235V7G/p1704983453042549?thread_ts=1704915173.697349&cid=C053U235V7G
                "AP", // commercial permit
                "BP", // commercial permit
                "D",  // provisional license for commercial vehicles
                "MP", // Motorcyle permit, a little unclear on this one but low N
            ],
        )]);
        match (
            self.normalized_issuing_state(),
            self.normalized_class(),
            self.type_of_id.as_ref(),
            self.document_sub_type().as_ref(),
        ) {
            (Some(state), Some(class), Some(doc_type), doc_sub_type) => {
                // Only apply these to DLs
                let is_dl = IdDocKind::try_from((doc_type, doc_sub_type))
                    .ok()
                    .map(|dk| dk == IdDocKind::DriversLicense)
                    .is_some_and(|is_dl| is_dl);

                if is_dl {
                    map.get(&state.leak())
                        .map(|permit_classes| permit_classes.contains(&class.leak()))
                } else {
                    None
                }
            }
            (None, _, _, _) | (_, None, _, _) | (_, _, None, _) => None,
        }
    }

    pub fn issuing_country_two_digit(&self) -> Option<ScrubbedPiiString> {
        self.issuing_country_two_digit_code().map(ScrubbedPiiString::from)
    }

    pub fn issuing_country_two_digit_code(&self) -> Option<Iso3166TwoDigitCountryCode> {
        self.issuing_country
            .as_ref()
            .and_then(|i| Iso3166ThreeDigitCountryCode::from_str(i.leak()).ok())
            .map(Iso3166TwoDigitCountryCode::from)
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

    pub fn fixture_response(data: Option<IncodeOcrFixtureResponseFields>) -> serde_json::Value {
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
        let curp = data.as_ref().and_then(|d| d.curp.clone());
        let type_of_id = data
            .as_ref()
            .and_then(|d| d.type_of_id.clone())
            .unwrap_or(IncodeDocumentType::DriversLicense)
            .to_string();

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
            "typeOfId":type_of_id,
            "curp": curp
        })
    }
}

impl IncodeClientErrorCustomFailureReasons for FetchOCRResponse {
    fn custom_failure_reasons(_error: crate::incode::response::Error) -> Option<Vec<IncodeFailureReason>> {
        None
    }
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct GetOnboardingStatusResponse {
    pub onboarding_status: String,
}
impl GetOnboardingStatusResponse {
    pub fn ready(&self, session_kind: &IncodeVerificationSessionKind, wait_for_selfie: bool) -> bool {
        match session_kind {
            // When raised it's safe to get scores from the ID Validation Process.  It's also safe to get OCR
            // data
            IncodeVerificationSessionKind::IdDocument => {
                (self.onboarding_status == *"ID_VALIDATION_FINISHED")
                    || (self.onboarding_status == *"POST_PROCESSING_FINISHED")
            }
            // Safe to get scores for liveness, facial recognition and overall (if the flow is simply
            // IDV/selfie)
            IncodeVerificationSessionKind::Selfie => {
                if wait_for_selfie {
                    self.onboarding_status == *"FACE_VALIDATION_FINISHED"
                } else {
                    (self.onboarding_status == *"ID_VALIDATION_FINISHED")
                        || (self.onboarding_status == *"POST_PROCESSING_FINISHED"
                            || self.onboarding_status == *"FACE_VALIDATION_FINISHED")
                }
            }
            IncodeVerificationSessionKind::CurpValidation => false,
            IncodeVerificationSessionKind::GovernmentValidation => false,
        }
    }
}

impl IncodeClientErrorCustomFailureReasons for GetOnboardingStatusResponse {
    // no custom error codes here
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
}
impl IncodeClientErrorCustomFailureReasons for ProcessFaceResponse {
    // no custom error codes here

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

impl OCRAddress {
    // returns None if no state, returns Result if there's a state inside that we tried to parse
    pub fn normalized_state(&self) -> Option<Result<ScrubbedPiiString, strum::ParseError>> {
        self.state.as_ref().map(|s| {
            let from_2_char = UsState::from_raw_string(s.leak()).ok();
            let from_full: Option<UsState> = UsStateFull::from_raw_string(s.leak()).ok().map(|s| s.into());
            // try to parse our state, otherwise error
            let parsed: Option<ScrubbedPiiString> = from_2_char.or(from_full).map(|s| s.to_string().into());
            if let Some(p) = parsed {
                Ok(p)
            } else {
                Err(strum::ParseError::VariantNotFound)
            }
        })
    }

    // Note: this field is used for multiple country's postal codes, not just the US
    pub fn normalized_zip5(&self) -> Option<ScrubbedPiiString> {
        self.postal_code.as_ref().and_then(|p| {
            let z = p.leak();

            match z.len().cmp(&5) {
                // don't want to return a zip that isn't at least 5
                std::cmp::Ordering::Less => None,
                std::cmp::Ordering::Equal => Some(z.into()),
                std::cmp::Ordering::Greater => Some(z[..5].into()),
            }
        })
    }
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct OcrDataConfidence {
    pub birth_date_confidence: Option<f32>,
    pub name_confidence: Option<f32>,
    pub given_name_confidence: Option<f32>,
    pub first_name_confidence: Option<f32>,
    pub middle_name_confidence: Option<f32>,
    pub name_suffix_confidence: Option<f32>,
    pub mothers_surname_confidence: Option<f32>,
    pub fathers_surname_confidence: Option<f32>,
    pub nick_name_confidence: Option<f32>,
    pub full_name_mrz_confidence: Option<f32>,
    pub mothers_name_confidence: Option<f32>,
    pub fathers_name_confidence: Option<f32>,
    pub address_confidence: Option<f32>,
    pub street_confidence: Option<f32>,
    pub colony_confidence: Option<f32>,
    pub postal_code_confidence: Option<f32>,
    pub city_confidence: Option<f32>,
    pub state_confidence: Option<f32>,
    pub state_code_confidence: Option<f32>,
    pub country_code_confidence: Option<f32>,
    pub gender_confidence: Option<f32>,
    pub issue_date_confidence: Option<f32>,
    pub expiration_date_confidence: Option<f32>,
    pub issued_at_confidence: Option<f32>,
    pub expire_at_confidence: Option<f32>,
    pub issuing_authority_confidence: Option<f32>,
    pub mrz_1_confidence: Option<f32>,
    pub mrz_2_confidence: Option<f32>,
    pub mrz_3_confidence: Option<f32>,
    pub mrz_full_confidence: Option<f32>,
    pub document_number_confidence: Option<f32>,
    pub back_number_confidence: Option<f32>,
    pub personal_number_confidence: Option<f32>,
    pub clave_de_elector_confidence: Option<f32>,
    pub numero_emision_credencial_confidence: Option<f32>,
    pub curp_confidence: Option<f32>,
    pub nue_confidence: Option<f32>,
    pub registration_date_confidence: Option<f32>,
    pub height_confidence: Option<f32>,
    pub birth_place_confidence: Option<f32>,
    pub blood_type_confidence: Option<f32>,
    pub eye_color_confidence: Option<f32>,
    pub classes_confidence: Option<f32>,
    pub cond_confidence: Option<f32>,
    pub mentions_confidence: Option<f32>,
    pub ref_number_confidence: Option<f32>,
    pub weight_confidence: Option<f32>,
    pub hair_confidence: Option<f32>,
    pub restrictions_confidence: Option<f32>,
    pub nationality_confidence: Option<f32>,
    pub nationality_mrz_confidence: Option<f32>,
    pub marital_status_confidence: Option<f32>,
    pub race_confidence: Option<f32>,
    pub tax_id_number_confidence: Option<f32>,
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::incode::doc::response::AddSelfieResponse;
    use crate::incode::doc::response::ProcessFaceResponse;
    use crate::incode::IncodeAPIResult;
    use crate::test_fixtures::DocTestOpts;
    use crate::test_fixtures::{
        self,
    };
    use newtypes::incode::IncodeDocumentRestriction;
    use newtypes::incode::IncodeDocumentType;
    use newtypes::incode::IncodeStatus;
    use newtypes::incode::IncodeTest;
    use newtypes::IdDocKind;
    use newtypes::IncodeFailureReason;
    use newtypes::PiiLong;
    use newtypes::ScrubbedPiiLong;

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
        assert!(failure.is_empty());

        // With a failure
        let raw_response_with_military = serde_json::json!({
            "sharpness": 100,
            "glare": 100,
            "horizontalResolution": 0,
            "classification": false,
            "typeOfId": "Military",
            "issueYear": 2016,
            "issueName": "USA DriversLicense Military",
            "sessionStatus": "Alive",
            "failReason": null
        });
        let parsed: AddSideResponse = serde_json::from_value(raw_response_with_military).unwrap();
        let failure = parsed.failure_reasons(vec![]);
        assert_eq!(failure, vec![IncodeFailureReason::MilitaryIdNotAllowed]);
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

    #[test_case(Some("New York") => Some(Some("NY".into())))]
    #[test_case(Some(" ny") => Some(Some("NY".into())))]
    #[test_case(Some("GA") => Some(Some("GA".into())))]
    #[test_case(Some("Georgia    ") => Some(Some("GA".into())))]
    #[test_case(Some("BobbyZone") => Some(None))]
    #[test_case(None => None)]
    fn test_ocr_address(raw: Option<&str>) -> Option<Option<String>> {
        let state = raw.map(|r| r.into());
        let address1 = OCRAddress {
            state,
            ..Default::default()
        };

        address1
            .normalized_state()
            .map(|r| r.ok().map(|s| s.leak_to_string()))
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

    #[test]
    fn test_ocr_fixture() {
        let (type_of_id, _) = IdDocKind::DriversLicense.into();
        let opts = IncodeOcrFixtureResponseFields {
            first_name: Some("Bobby".to_string().into()),
            last_name: Some("Bobierto".to_string().into()),
            dob: None,
            curp: None,
            type_of_id,
        };
        let raw_response = FetchOCRResponse::fixture_response(Some(opts.clone()));
        let parsed: FetchOCRResponse = serde_json::from_value(raw_response).unwrap();

        assert!(parsed.curp.is_none());
        assert_eq!(parsed.type_of_id.unwrap(), IncodeDocumentType::DriversLicense);
        assert_eq!(
            parsed.name.clone().unwrap().first_name.unwrap(),
            "Bobby".to_string().into()
        );
        assert_eq!(
            parsed.name.unwrap().paternal_last_name.unwrap(),
            "Bobierto".to_string().into()
        );

        // now set diff fields
        let mx_opts = opts.set_doc_kind_fields(IdDocKind::VoterIdentification);
        let raw_response = FetchOCRResponse::fixture_response(Some(mx_opts));
        let parsed: FetchOCRResponse = serde_json::from_value(raw_response).unwrap();
        assert!(parsed.curp.is_some());
        assert_eq!(
            parsed.type_of_id.unwrap(),
            IncodeDocumentType::VoterIdentification
        );
        assert_eq!(
            parsed.name.clone().unwrap().first_name.unwrap(),
            "Bobby".to_string().into()
        );
        assert_eq!(
            parsed.name.unwrap().paternal_last_name.unwrap(),
            "Bobierto".to_string().into()
        );
    }

    use test_case::test_case;

    #[test_case("AGUASCALIENTES" => "AGUASCALIENTES"; "test for AGUASCALIENTES (rand_suffix_181)")]
    #[test_case("ALABAMA" => "ALABAMA"; "test for ALABAMA (rand_suffix_742)")]
    #[test_case("ALASKA" => "ALASKA"; "test for ALASKA (rand_suffix_385)")]
    #[test_case("ALBERTA" => "ALBERTA"; "test for ALBERTA (rand_suffix_324)")]
    #[test_case("ALL" => "ALL"; "test for ALL (rand_suffix_157)")]
    #[test_case("AMERICAN SAMOA" => "AMERICAN_SAMOA"; "test for AMERICAN SAMOA (rand_suffix_508)")]
    #[test_case("AMERICAN_SAMOA" => "AMERICAN_SAMOA"; "test for AMERICAN_SAMOA (rand_suffix_035)")]
    #[test_case("ANDHRA_PRADESH" => "ANDHRA_PRADESH"; "test for ANDHRA_PRADESH (rand_suffix_744)")]
    #[test_case("ARIZONA" => "ARIZONA"; "test for ARIZONA (rand_suffix_756)")]
    #[test_case("ARKANSAS" => "ARKANSAS"; "test for ARKANSAS (rand_suffix_220)")]
    #[test_case("ASSAM" => "ASSAM"; "test for ASSAM (rand_suffix_764)")]
    #[test_case("BAJA_CALIFORNIA" => "BAJA_CALIFORNIA"; "test for BAJA_CALIFORNIA (rand_suffix_445)")]
    #[test_case("BAJA_CALIFORNIA_SUR" => "BAJA_CALIFORNIA"; "test for BAJA_CALIFORNIA_SUR (rand_suffix_753)")]
    #[test_case("BRITISH_COLUMBIA" => "BRITISH_COLUMBIA"; "test for BRITISH_COLUMBIA (rand_suffix_584)")]
    #[test_case("CALIFORNIA" => "CALIFORNIA"; "test for CALIFORNIA (rand_suffix_769)")]
    #[test_case("CDMX" => "CDMX"; "test for CDMX (rand_suffix_367)")]
    #[test_case("CHIHUAHUA" => "CHIHUAHUA"; "test for CHIHUAHUA (rand_suffix_687)")]
    #[test_case("COAHUILA" => "COAHUILA"; "test for COAHUILA (rand_suffix_916)")]
    #[test_case("COLIMA" => "COLIMA"; "test for COLIMA (rand_suffix_600)")]
    #[test_case("COLORADO" => "COLORADO"; "test for COLORADO (rand_suffix_692)")]
    #[test_case("CONNECTICUT" => "CONNECTICUT"; "test for CONNECTICUT (rand_suffix_294)")]
    #[test_case("DELAWARE" => "DELAWARE"; "test for DELAWARE (rand_suffix_358)")]
    #[test_case("DELHI" => "DELHI"; "test for DELHI (rand_suffix_934)")]
    #[test_case("DISTRICT OF COLUMBIA" => "DISTRICT_OF_COLUMBIA"; "test for DISTRICT OF COLUMBIA (rand_suffix_126)")]
    #[test_case("DISTRICT_OF_COLUMBIA" => "DISTRICT_OF_COLUMBIA"; "test for DISTRICT_OF_COLUMBIA (rand_suffix_358)")]
    #[test_case("FLORIDA" => "FLORIDA"; "test for FLORIDA (rand_suffix_149)")]
    #[test_case("GEORGIA" => "GEORGIA"; "test for GEORGIA (rand_suffix_159)")]
    #[test_case("GOA" => "GOA"; "test for GOA (rand_suffix_312)")]
    #[test_case("GUAM" => "GUAM"; "test for GUAM (rand_suffix_509)")]
    #[test_case("GUANAJUATO" => "GUANAJUATO"; "test for GUANAJUATO (rand_suffix_097)")]
    #[test_case("GUERRERO" => "GUERRERO"; "test for GUERRERO (rand_suffix_509)")]
    #[test_case("HARYANA" => "HARYANA"; "test for HARYANA (rand_suffix_745)")]
    #[test_case("HAWAII" => "HAWAII"; "test for HAWAII (rand_suffix_651)")]
    #[test_case("HIDALGO" => "HIDALGO"; "test for HIDALGO (rand_suffix_144)")]
    #[test_case("IDAHO" => "IDAHO"; "test for IDAHO (rand_suffix_697)")]
    #[test_case("ILLINOIS" => "ILLINOIS"; "test for ILLINOIS (rand_suffix_532)")]
    #[test_case("INDIA" => "INDIA"; "test for INDIA (rand_suffix_223)")]
    #[test_case("INDIANA" => "INDIANA"; "test for INDIANA (rand_suffix_370)")]
    #[test_case("IOWA" => "IOWA"; "test for IOWA (rand_suffix_154)")]
    #[test_case("JALISCO" => "JALISCO"; "test for JALISCO (rand_suffix_504)")]
    #[test_case("JHARKHAND" => "JHARKHAND"; "test for JHARKHAND (rand_suffix_500)")]
    #[test_case("KANSAS" => "KANSAS"; "test for KANSAS (rand_suffix_868)")]
    #[test_case("KARNATAKA" => "KARNATAKA"; "test for KARNATAKA (rand_suffix_984)")]
    #[test_case("KENTUCKY" => "KENTUCKY"; "test for KENTUCKY (rand_suffix_449)")]
    #[test_case("LOUISIANA" => "LOUISIANA"; "test for LOUISIANA (rand_suffix_469)")]
    #[test_case("MACAU" => "MACAU"; "test for MACAU (rand_suffix_663)")]
    #[test_case("MAINE" => "MAINE"; "test for MAINE (rand_suffix_720)")]
    #[test_case("MANITOBA" => "MANITOBA"; "test for MANITOBA (rand_suffix_713)")]
    #[test_case("MARIANA_ISLANDS" => "MARIANA_ISLANDS"; "test for MARIANA_ISLANDS (rand_suffix_588)")]
    #[test_case("MARYLAND" => "MARYLAND"; "test for MARYLAND (rand_suffix_261)")]
    #[test_case("MASSACHUSETTS" => "MASSACHUSETTS"; "test for MASSACHUSETTS (rand_suffix_780)")]
    #[test_case("MEXICO" => "MEXICO"; "test for MEXICO (rand_suffix_002)")]
    #[test_case("MICHIGAN" => "MICHIGAN"; "test for MICHIGAN (rand_suffix_946)")]
    #[test_case("MICHOACAN" => "MICHOACAN"; "test for MICHOACAN (rand_suffix_467)")]
    #[test_case("MINNESOTA" => "MINNESOTA"; "test for MINNESOTA (rand_suffix_310)")]
    #[test_case("MISSISSIPPI" => "MISSISSIPPI"; "test for MISSISSIPPI (rand_suffix_997)")]
    #[test_case("MISSOURI" => "MISSOURI"; "test for MISSOURI (rand_suffix_874)")]
    #[test_case("MONTANA" => "MONTANA"; "test for MONTANA (rand_suffix_827)")]
    #[test_case("MUNICIPAL" => "MUNICIPAL"; "test for MUNICIPAL (rand_suffix_745)")]
    #[test_case("NEBRASKA" => "NEBRASKA"; "test for NEBRASKA (rand_suffix_297)")]
    #[test_case("NEVADA" => "NEVADA"; "test for NEVADA (rand_suffix_096)")]
    #[test_case("NEW HAMPSHIRE" => "NEW_HAMPSHIRE"; "test for NEW HAMPSHIRE (rand_suffix_423)")]
    #[test_case("NEW JERSEY" => "NEW_JERSEY"; "test for NEW JERSEY (rand_suffix_980)")]
    #[test_case("NEW MEXICO" => "NEW_MEXICO"; "test for NEW MEXICO (rand_suffix_294)")]
    #[test_case("NEW YORK" => "NEW_YORK"; "test for NEW YORK (rand_suffix_867)")]
    #[test_case("NEWFOUNDLAND" => "NEWFOUNDLAND"; "test for NEWFOUNDLAND (rand_suffix_784)")]
    #[test_case("NEWFOUNDLAND_AND_LABRADOR" => "NEWFOUNDLAND_AND_LABRADOR"; "test for NEWFOUNDLAND_AND_LABRADOR (rand_suffix_534)")]
    #[test_case("NEW_HAMPSHIRE" => "NEW_HAMPSHIRE"; "test for NEW_HAMPSHIRE (rand_suffix_808)")]
    #[test_case("NEW_JERSEY" => "NEW_JERSEY"; "test for NEW_JERSEY (rand_suffix_369)")]
    #[test_case("NEW_MEXICO" => "NEW_MEXICO"; "test for NEW_MEXICO (rand_suffix_344)")]
    #[test_case("NEW_YORK" => "NEW_YORK"; "test for NEW_YORK (rand_suffix_461)")]
    #[test_case("NORTH CAROLINA" => "NORTH_CAROLINA"; "test for NORTH CAROLINA (rand_suffix_699)")]
    #[test_case("NORTH DAKOTA" => "NORTH_DAKOTA"; "test for NORTH DAKOTA (rand_suffix_831)")]
    #[test_case("NORTHERN MARIANA ISLANDS" => "NORTHERN_MARIANA_ISLANDS"; "test for NORTHERN MARIANA ISLANDS (rand_suffix_240)")]
    #[test_case("NORTH_CAROLINA" => "NORTH_CAROLINA"; "test for NORTH_CAROLINA (rand_suffix_046)")]
    #[test_case("NORTH_DAKOTA" => "NORTH_DAKOTA"; "test for NORTH_DAKOTA (rand_suffix_217)")]
    #[test_case("NUEVO_LEON" => "NUEVO_LEON"; "test for NUEVO_LEON (rand_suffix_468)")]
    #[test_case("NUNAVUT" => "NUNAVUT"; "test for NUNAVUT (rand_suffix_216)")]
    #[test_case("ODISHA" => "ODISHA"; "test for ODISHA (rand_suffix_513)")]
    #[test_case("OHIO" => "OHIO"; "test for OHIO (rand_suffix_554)")]
    #[test_case("OKLAHOMA" => "OKLAHOMA"; "test for OKLAHOMA (rand_suffix_334)")]
    #[test_case("ONTARIO" => "ONTARIO"; "test for ONTARIO (rand_suffix_088)")]
    #[test_case("OREGON" => "OREGON"; "test for OREGON (rand_suffix_090)")]
    #[test_case("PENNSYLVANIA" => "PENNSYLVANIA"; "test for PENNSYLVANIA (rand_suffix_914)")]
    #[test_case("PUEBLA" => "PUEBLA"; "test for PUEBLA (rand_suffix_630)")]
    #[test_case("PUERTO RICO" => "PUERTO_RICO"; "test for PUERTO RICO (rand_suffix_485)")]
    #[test_case("PUERTO_RICO" => "PUERTO_RICO"; "test for PUERTO_RICO (rand_suffix_758)")]
    #[test_case("PUNJAB" => "PUNJAB"; "test for PUNJAB (rand_suffix_431)")]
    #[test_case("QUEBEC" => "QUEBEC"; "test for QUEBEC (rand_suffix_831)")]
    #[test_case("QUEENSLAND" => "QUEENSLAND"; "test for QUEENSLAND (rand_suffix_597)")]
    #[test_case("RHODE ISLAND" => "RHODE_ISLAND"; "test for RHODE ISLAND (rand_suffix_930)")]
    #[test_case("RHODE_ISLAND" => "RHODE_ISLAND"; "test for RHODE_ISLAND (rand_suffix_436)")]
    #[test_case("SINALOA" => "SINALOA"; "test for SINALOA (rand_suffix_238)")]
    #[test_case("SONORA" => "SONORA"; "test for SONORA (rand_suffix_242)")]
    #[test_case("SOUTH CAROLINA" => "SOUTH_CAROLINA"; "test for SOUTH CAROLINA (rand_suffix_133)")]
    #[test_case("SOUTH DAKOTA" => "SOUTH_DAKOTA"; "test for SOUTH DAKOTA (rand_suffix_899)")]
    #[test_case("SOUTH_CAROLINA" => "SOUTH_CAROLINA"; "test for SOUTH_CAROLINA (rand_suffix_201)")]
    #[test_case("SOUTH_DAKOTA" => "SOUTH_DAKOTA"; "test for SOUTH_DAKOTA (rand_suffix_881)")]
    #[test_case("TAMAULIPAS" => "TAMAULIPAS"; "test for TAMAULIPAS (rand_suffix_471)")]
    #[test_case("TAMIL_NADU" => "TAMIL_NADU"; "test for TAMIL_NADU (rand_suffix_349)")]
    #[test_case("TASMANIA" => "TASMANIA"; "test for TASMANIA (rand_suffix_325)")]
    #[test_case("TELANGANA" => "TELANGANA"; "test for TELANGANA (rand_suffix_104)")]
    #[test_case("TENNESSEE" => "TENNESSEE"; "test for TENNESSEE (rand_suffix_300)")]
    #[test_case("TEXAS" => "TEXAS"; "test for TEXAS (rand_suffix_220)")]
    #[test_case("UNITED STATES" => "UNITED_STATES"; "test for UNITED STATES (rand_suffix_408)")]
    #[test_case("USCIS" => "USCIS"; "test for USCIS (rand_suffix_730)")]
    #[test_case("US_COAST_GUARD" => "US_COAST_GUARD"; "test for US_COAST_GUARD (rand_suffix_055)")]
    #[test_case("US_DEPARTMENT_OF_DEFENSE" => "US_DEPARTMENT_OF_DEFENSE"; "test for US_DEPARTMENT_OF_DEFENSE (rand_suffix_356)")]
    #[test_case("US_DEPARTMENT_OF_STATE" => "US_DEPARTMENT_OF_STATE"; "test for US_DEPARTMENT_OF_STATE (rand_suffix_750)")]
    #[test_case("US_VIRGIN_ISLANDS" => "US_VIRGIN_ISLANDS"; "test for US_VIRGIN_ISLANDS (rand_suffix_906)")]
    #[test_case("UTAH" => "UTAH"; "test for UTAH (rand_suffix_642)")]
    #[test_case("UTTARAKHAND" => "UTTARAKHAND"; "test for UTTARAKHAND (rand_suffix_369)")]
    #[test_case("UTTAR_PRADESH" => "UTTAR_PRADESH"; "test for UTTAR_PRADESH (rand_suffix_717)")]
    #[test_case("VERMONT" => "VERMONT"; "test for VERMONT (rand_suffix_484)")]
    #[test_case("VICTORIA" => "VICTORIA"; "test for VICTORIA (rand_suffix_121)")]
    #[test_case("VIRGIN ISLANDS" => "VIRGIN_ISLANDS"; "test for VIRGIN ISLANDS (rand_suffix_640)")]
    #[test_case("VIRGIN ISLANDS (U.S.)" => "VIRGIN_ISLANDS"; "test for VIRGIN ISLANDS (U.S.) (rand_suffix_130)")]
    #[test_case("VIRGINIA" => "VIRGINIA"; "test for VIRGINIA (rand_suffix_513)")]
    #[test_case("WASHINGTON" => "WASHINGTON"; "test for WASHINGTON (rand_suffix_702)")]
    #[test_case("WEST VIRGINIA" => "WEST_VIRGINIA"; "test for WEST VIRGINIA (rand_suffix_024)")]
    #[test_case("WEST_BENGAL" => "WEST_BENGAL"; "test for WEST_BENGAL (rand_suffix_150)")]
    #[test_case("WEST_VIRGINIA" => "WEST_VIRGINIA"; "test for WEST_VIRGINIA (rand_suffix_928)")]
    #[test_case("WISCONSIN" => "WISCONSIN"; "test for WISCONSIN (rand_suffix_200)")]
    #[test_case("WYOMING" => "WYOMING"; "test for WYOMING (rand_suffix_725)")]
    #[test_case("YUKON" => "YUKON"; "test for YUKON (rand_suffix_789)")]
    #[test_case("ZACATECAS" => "ZACATECAS"; "test for ZACATECAS (rand_suffix_340)")]
    fn test_normalize_issuing_state(s: &str) -> String {
        super::FetchOCRResponse::normalize_issuing_state(s.into())
    }
}
