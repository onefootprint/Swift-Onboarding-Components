use paperclip::actix::Apiv2Schema;
use serde::Serialize;

/// This status is used to group and display decrypted documents in the dashboard
/// It is derived from `DocumentRequestStatus` in that it represents whether or not the document
/// was successfully uploaded AND usable by our vendors to make a determination.
///
/// It does NOT represent whether the document was verified or not.
#[derive(Debug, Clone, Apiv2Schema, Serialize)]
#[serde(rename_all = "snake_case")]
pub enum UserFacingCollectedDocumentStatus {
    Success,
    Fail,
}
