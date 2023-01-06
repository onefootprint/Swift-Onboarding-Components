use strum::EnumIter;
use strum_macros::EnumString;

/// Status codes returned by Scan Verify Results API call
#[derive(Debug, strum::Display, Clone, Eq, PartialEq, serde::Deserialize, EnumString, EnumIter)]
#[serde(try_from = "&str")]
pub enum IDologyScanVerifyResultCode {
    #[strum(to_string = "result.id.scan.approved")]
    #[doc = "Scan was approved"]
    Approved,
    #[strum(to_string = "result.id.scan.not.approved")]
    #[doc = "Scan was not approved"]
    NotApproved,
    #[strum(to_string = "id.scan.not.readable")]
    #[doc = "Scan was not readable"]
    NotReadable,
    // Likely not used by us since we are collecting the doc ourselves
    #[strum(to_string = "id.scan.abandoned")]
    #[doc = "Consumer abandoned the scan"]
    ConsumerAbandoned,
    // Likely not used by us since we are collecting the doc ourselves
    #[strum(to_string = "id.scan.time.out")]
    #[doc = "Consumer timed out"]
    ConsumerTimedOut,
    #[strum(to_string = "id.scan.pending")]
    #[doc = "Results are still pending"]
    ResultsPending,
}

/// Status codes returned by Scan Verify Results API call
#[derive(Debug, strum::Display, Clone, Eq, PartialEq, serde::Deserialize, EnumString, EnumIter)]
#[serde(try_from = "&str")]
pub enum IDologyScanVerifySummaryResultCode {
    #[strum(to_string = "expectid.scan.id.success")]
    #[doc = "Scan was approved"]
    Success,
    #[strum(to_string = "expectid.scan.id.failure")]
    #[doc = "Scan was not approved"]
    Failure,
}

/// Status codes returned by Scan Verify Results API call
#[derive(Debug, strum::Display, Clone, Eq, PartialEq, serde::Deserialize, EnumString, EnumIter)]
#[serde(try_from = "&str")]
pub enum IDologyScanVerifyVerificationResultCode {
    #[strum(to_string = "result.document.verified")]
    #[doc = "Scan was approved"]
    DocumentVerified,
    #[strum(to_string = "result.document.not.verified")]
    #[doc = "Scan was not approved"]
    DocumentNotVerified,
    #[strum(to_string = "result.ocr.completed")]
    #[doc = "Scan OCR completed"]
    OcrCompleted,
    #[strum(to_string = "result.id.scan.not.readable")]
    #[doc = "Scan was not readable"]
    DocumentNotReadable,
}
