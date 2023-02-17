pub use self::payloads::{OnboardingCompletedPayload, OnboardingStatusChangedPayload};
use chrono::{DateTime, Utc};
use newtypes::{FootprintUserId, ObConfigurationId, OnboardingStatus};
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use strum::{EnumIter, EnumMessage};

/// Defines supported webhook event types and payloads
#[derive(
    Debug, strum::Display, Clone, Eq, PartialEq, Serialize, Deserialize, JsonSchema, EnumIter, EnumMessage,
)]
#[serde(untagged)]
pub enum WebhookEvent {
    #[strum(serialize = "footprint.onboarding.completed")]
    #[strum(message = "An onboarding was just completed")]
    OnboardingCompleted(OnboardingCompletedPayload),

    #[strum(serialize = "footprint.onboarding.status_changed")]
    #[strum(message = "The status of an onboarding has changed")]
    OnboardingStatusChanged(OnboardingStatusChangedPayload),
}

/// all of the payload bodies
mod payloads {
    use super::*;

    #[derive(Debug, Clone, Eq, PartialEq, Serialize, Deserialize, JsonSchema, Default)]
    pub struct OnboardingCompletedPayload {
        pub footprint_user_id: FootprintUserId,
        pub timestamp: DateTime<Utc>,
        pub status: OnboardingStatus,
        pub requires_manual_review: bool,
        pub onboarding_configuration_id: ObConfigurationId,
    }

    #[derive(Debug, Clone, Eq, PartialEq, Serialize, Deserialize, JsonSchema, Default)]
    pub struct OnboardingStatusChangedPayload {
        pub footprint_user_id: FootprintUserId,
        pub timestamp: DateTime<Utc>,
        pub new_status: OnboardingStatus,
    }
}

impl WebhookEvent {
    pub fn event_type(&self) -> String {
        self.to_string()
    }
}
