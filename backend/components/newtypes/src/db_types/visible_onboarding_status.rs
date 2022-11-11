pub use derive_more::Display;
use paperclip::actix::Apiv2Schema;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use strum_macros::{AsRefStr, EnumString};

/// The status of the onboarding. This includes in-progress statuses
#[derive(
    Debug,
    Display,
    Clone,
    Copy,
    PartialEq,
    Eq,
    Deserialize,
    Serialize,
    EnumString,
    AsRefStr,
    Apiv2Schema,
    JsonSchema,
)]
#[strum(serialize_all = "snake_case")]
#[serde(rename_all = "snake_case")]
// This is a dynamically computed status enum that is never saved in the DB.
// It is called "Visible" OnboardingStatus because these are the only API-visible states of an
// onboarding
pub enum VisibleOnboardingStatus {
    ManualReview,
    Pass,
    Fail,
}
