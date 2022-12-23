use crate::idology::error as IdologyError;
use crate::idology::response_common::{IDologyQualifiers, KeyResponse};

// Given a raw response, deserialize
pub fn parse_response(value: serde_json::Value) -> Result<ScanVerifyAPIResponse, IdologyError::Error> {
    let response: ScanVerifyAPIResponse = serde_json::value::from_value(value)?;
    Ok(response)
}

pub fn parse_submission_response(
    value: serde_json::Value,
) -> Result<ScanVerifySubmissionAPIResponse, IdologyError::Error> {
    let response: ScanVerifySubmissionAPIResponse = serde_json::value::from_value(value)?;
    Ok(response)
}

pub type IdNumber = u64;

/// Our ExpectID Scan Verify service provides clients with the ability to capture images of a customer’s photo
/// ID for the purpose of validating the individual’s identity.
///
/// When the customer submits the images, a programmatic document review is performed to determine if the document template and attributes are valid.
/// These data attributes are also stripped from the images for additional identity verification.
///
/// This service can also be combined with ExpectID Scan Verify Rules, which acts as a scorecard and allows you to configure specific rules
/// that can be used for decisioning.
///
/// https://web.idologylive.com/api_portal.php#introduction-subtitle-introduction-scan-verify
#[derive(Debug, Clone, serde::Deserialize)]
pub struct ScanVerifySubmissionAPIResponse {
    pub status: String,
}

#[derive(Debug, Clone, serde::Deserialize)]
pub struct ScanVerifyAPIResponse {
    pub response: ScanVerifyResponse,
}

/// https://web.idologylive.com/api_portal.php#step-3-obtaining-scan-verify-results-subtitle-step-3-scan-verify
#[derive(Debug, Clone, serde::Deserialize)]
#[serde(rename_all = "kebab-case")]
pub struct ScanVerifyResponse {
    pub qualifiers: Option<IDologyQualifiers>,
    // TODO should these be options?
    pub results: Option<KeyResponse>,
    /// The ExpectID Scan Verify result. This should be one of two possible results:
    /// * result.id.scan.approved
    /// * result.id.scan.not.approved
    ///
    /// TODO: Except the docs say futher below, might also be "id.scan.not.readable" or "id.scan.time.out"?
    pub id_scan_result: Option<KeyResponse>,
    /// Summary result based on our rules configured in the Idology Enterprise Portal
    ///    If Scan Verify Rules are not enabled, <id-scan-summary-result> will be FAILURE by default;
    ///    otherwise, it will display PASS or FAILURE depending on the Scan Verify Rules configuration and enablement.
    /// Two possible values:
    ///  * expectid.scan.id.success
    ///  * expectid.scan.id.failure
    pub id_scan_summary_result: Option<KeyResponse>,
    /// The results of the verification. This will be one of four possible results:
    ///  * result.document.verified
    ///  * result.ocr.completed
    ///  * result.document.not.verified
    ///  * result.id.scan.not.readable
    pub id_scan_verification_result: Option<KeyResponse>,
    // TODO(argoff): this has PII, so to use this, we need to figure out how to encrypt it before we save in various places
    // pub located_id_scan_record: Option<LocatedIdScanRecord>,
    pub id_number: Option<IdNumber>,
}

/// ExpectID Scan Verify can also be configured to return the customer data scraped from the license through the service.
/// Additionally, a confidence score is also returned that indicates the "confidence level" in the authenticity of the document based on how closely the
/// document matches the template of the State and/or Country in which it was issued.
/// When all of this information is returned, it is contained in the <located-id-scan-record> tag.
///
/// Note that in <id-scan-state>, the Country and State are always returned.
/// These values are returned in ISO-3166-2 format (e.g. "US-CA" for California) and "CA-BC" for British Columbia).
///
/// https://web.idologylive.com/api_portal.php#returning-additional-data-in-response
#[derive(Debug, Clone, serde::Deserialize)]
#[serde(rename_all = "kebab-case")]
pub struct LocatedIdScanRecord {
    pub id_scan_first_name: Option<String>,
    pub id_scan_last_name: Option<String>,
    pub id_scan_street_number: Option<i32>,
    pub id_scan_street_name: Option<String>,
    pub id_scan_city: Option<String>,
    pub id_scan_state: Option<String>,
    pub id_scan_zip: Option<String>,
    pub id_scan_date_of_birth: Option<LocatedIdScanDate>,
    pub id_scan_country: Option<String>,
    pub id_scan_issuance_state: Option<String>,
    pub id_scan_date_of_issuance: Option<LocatedIdScanDate>,
    pub id_scan_expiration_date: Option<LocatedIdScanDate>,
    pub id_scan_document_number: Option<i64>,
    pub id_scan_document_type: Option<String>,
    pub id_scan_template_type: Option<String>,
    pub id_scan_confidence_score: Option<i32>,
}

#[derive(Debug, Clone, serde::Deserialize)]
pub struct LocatedIdScanDate {
    pub year: Option<i32>,
    pub month: Option<String>,
}
