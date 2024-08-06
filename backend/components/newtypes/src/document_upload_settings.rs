use strum::EnumString;

#[derive(
    Debug,
    strum_macros::Display,
    serde_with::SerializeDisplay,
    serde_with::DeserializeFromStr,
    Clone,
    Copy,
    EnumString,
    macros::SerdeAttr,
)]
#[strum(serialize_all = "snake_case")]
#[serde(rename_all = "snake_case")]
pub enum DocumentUploadSettings {
    /// Useful for documents that are usually uploaded as a captured image, like an SSN card or
    /// driver's license. When on desktop, we prefer to hand off these document requirements to
    /// mobile for capture. And on mobile, we will show the capture interface with an option to
    /// upload.
    PreferCapture,
    /// Useful for documents that are usually uploaded as a file image, like a lease or utility
    /// bill. When on desktop, we first give the option to upload on desktop but fall back to
    /// handoff to mobile. And on mobile, we will show the option to upload or capture.
    PreferUpload,
    /// Not configurable by tenants yet, only used by Coba for their identity documents.
    /// On mobile, only allows capturing without the option to upload.
    /// On desktop though, we will allow uploading if the user didn't hand off
    CaptureOnlyOnMobile,
}
