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

#[derive(Debug, strum::Display, Clone, Eq, PartialEq, serde::Deserialize, EnumString, EnumIter)]
#[serde(try_from = "&str")]
pub enum IdologyScanOnboardingCaptureResult {
    #[strum(to_string = "capture.completed")]
    #[doc = "Capture completed"]
    Completed,
    #[strum(to_string = "capture.image.error")]
    #[doc = "Capture Image Error"]
    ImageError,
    #[strum(to_string = "capture.internal.error")]
    #[doc = "Capture Internal Error"]
    InternalError,
}

#[derive(Debug, strum::Display, Clone, Eq, PartialEq, serde::Deserialize, EnumString, EnumIter)]
#[serde(try_from = "&str")]
pub enum IdologyScanOnboardingCaptureDecision {
    #[strum(to_string = "result.scan.capture.id.approved")]
    #[doc = "Capture Approved"]
    Approved,
    #[strum(to_string = "result.scan.capture.id.not.approved")]
    #[doc = "Capture Not Approved"]
    NotApproved,
}

#[derive(Debug, strum::Display, Clone, Eq, PartialEq, serde::Deserialize, EnumString, EnumIter)]
pub enum IdologyImageCaptureErrors {
    // The submitted image does not meet the minimum required
    // resolution needed for processing.
    #[strum(to_string = "Image Too Small")]
    #[doc = "Image Too Small"]
    ImageTooSmall,
    // One or more corners of the document not within the borders
    // of the image. Note: This happens when the document is not
    // centered in the frame and edges bleed past the frame of
    // the picture.
    #[strum(to_string = "Document Missing Four Corners")]
    #[doc = "Document Missing Four Corners"]
    DocumentMissingFourCorners,
    // Document image too small within frame. Note: This happens
    // when a scanner is used to capture the image.
    #[strum(to_string = "Document Too Small")]
    #[doc = "Document Too Small"]
    DocumentTooSmall,
    // Document does not have enough high contrast border region.
    // Note: This happens when the document is larger than the edges
    // and there is not enough border that the cropping tool can use.
    #[strum(to_string = "Document Border Too Small")]
    #[doc = "Document Border Too Small"]
    DocumentBorderTooSmall,
    // The image of the Face on the document is not correctly sized,
    // well-lit, or in-focus on the front of photo ID image.
    #[strum(to_string = "Face Image Not Detected")]
    #[doc = "Face Image Not Detected"]
    FaceImageNotDetected,
    // The barcode on the back of the document is missing, damaged,
    // covered, not in focus, not well-lit, or is not PDF417.
    #[strum(to_string = "Barcode Not Detected")]
    #[doc = "Barcode Not Detected"]
    BarcodeNotDetected,
    // One of the following issues occurred:
    // (1) Document Image Load Error,
    // (2) Invalid or Unsupported Document Picture Depth,
    // (3) Too much glare in image,
    // (4) Image does not meet sharpness requirements
    #[strum(to_string = "Image Error")]
    #[doc = "Image Error"]
    ImageError,
    // The JPEG structure check failed (image submitted in format
    // that cannot be processed).
    #[strum(to_string = "Invalid JPEG")]
    #[doc = "Invalid JPEG"]
    InvalidJpeg,
    // The document corner is rotated more than 100 degrees.
    #[strum(to_string = "Document is Skewed")]
    #[doc = "Document is Skewed"]
    DocumentIsSkewed,
}
