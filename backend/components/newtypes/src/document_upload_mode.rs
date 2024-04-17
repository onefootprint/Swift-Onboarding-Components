use serde::Serialize;
// Enum representing bifrost restrictions on how a document might be uploaded
// In the future, it may make sense to prevent uploading, so we leave the door open to
// a variant like `CaptureOnly`

#[derive(Serialize, Debug, Clone, Copy)]
#[serde(rename_all = "snake_case")]
pub enum DocumentUploadMode {
    /// We try to capture first, but uploads are allowed as a fallback if the camera isn't available
    Default,
    /// Give the user the option to either upload or capture the document.
    AllowUpload,
    CaptureOnly,
}
