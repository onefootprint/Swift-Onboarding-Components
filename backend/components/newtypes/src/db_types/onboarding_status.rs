pub use derive_more::Display;
use paperclip::actix::Apiv2Schema;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use strum_macros::{AsRefStr, EnumString};

use crate::DecisionStatus;

/// The status of the onboarding, a go, no-go decision.
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
pub enum OnboardingStatus {
    Pass,
    Fail,
    Incomplete,
    Pending,
}

impl OnboardingStatus {
    pub fn is_complete(&self) -> bool {
        match self {
            OnboardingStatus::Pass => true,
            OnboardingStatus::Fail => true,
            OnboardingStatus::Incomplete => false,
            OnboardingStatus::Pending => true,
        }
    }
}

#[derive(
    Debug, Display, Clone, Copy, PartialEq, Eq, Deserialize, EnumString, AsRefStr, Apiv2Schema, JsonSchema,
)]
#[strum(serialize_all = "snake_case")]
#[serde(rename_all = "snake_case")]
pub enum OnboardingStatusFilter {
    Pass,
    Fail,
    Incomplete,
    VaultOnly,
}

impl DecisionStatus {
    pub fn try_from(value: &OnboardingStatusFilter) -> Option<Self> {
        match value {
            OnboardingStatusFilter::Pass => Some(Self::Pass),
            OnboardingStatusFilter::Fail => Some(Self::Fail),
            OnboardingStatusFilter::Incomplete => None,
            OnboardingStatusFilter::VaultOnly => None,
        }
    }
}

impl Default for OnboardingStatus {
    fn default() -> Self {
        Self::Pass
    }
}

impl From<DecisionStatus> for OnboardingStatus {
    fn from(s: DecisionStatus) -> Self {
        match s {
            DecisionStatus::Fail => OnboardingStatus::Fail,
            DecisionStatus::Pass => OnboardingStatus::Pass,
        }
    }
}
