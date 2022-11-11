pub use derive_more::Display;
use paperclip::actix::Apiv2Schema;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use strum_macros::{AsRefStr, EnumString};

use crate::DecisionStatus;

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
pub enum OnboardingStatus {
    Pass,
    Fail,
}

impl From<DecisionStatus> for Option<OnboardingStatus> {
    fn from(s: DecisionStatus) -> Self {
        match s {
            DecisionStatus::Fail => Some(OnboardingStatus::Fail),
            DecisionStatus::Pass => Some(OnboardingStatus::Pass),
            // OnboardingStatus has no way of representing in-progress onboardings
            // since we hide in-progress onboardings from the API
            DecisionStatus::StepUpRequired => None,
        }
    }
}

impl From<OnboardingStatus> for DecisionStatus {
    fn from(s: OnboardingStatus) -> Self {
        match s {
            OnboardingStatus::Fail => Self::Fail,
            OnboardingStatus::Pass => Self::Pass,
        }
    }
}
