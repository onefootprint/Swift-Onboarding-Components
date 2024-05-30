use serde_with::SerializeDisplay;
use strum::Display;
use strum_macros::EnumString;

#[derive(Display, Debug, EnumString, Eq, PartialEq, SerializeDisplay)]
pub enum SambaWebhookEventType {
    #[strum(serialize = "activityhistory.error")]
    ActivityHistoryError,
    #[strum(serialize = "activityhistory.received")]
    ActivityHistoryReceived,
    #[strum(serialize = "licensevalidation.error")]
    LicenseValidationError,
    #[strum(serialize = "licensevalidation.received")]
    LicenseValidationReceived,
}
