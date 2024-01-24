use serde::Serialize;
// Enum representing bifrost restrictions on how a document might be uploaded
// In the future, it may make sense to prevent uploading, so we leave the door open to
// a variant like `CaptureOnly`

#[derive(Serialize, Debug, Clone, Copy)]
#[serde(rename_all = "snake_case")]
pub enum DocumentUploadMode {
    // Capture is encouraged, but uploads are allowed
    Default,
    // For document types that are likely to be uploaded (proof of address, leases, bank statements)
    AllowUpload,
}
