pub use self::payloads::{
    OnboardingCompletedPayload, OnboardingStatusChangedPayload, WatchlistCheckCompletedPayload,
};
use chrono::{DateTime, Utc};
use newtypes::{FpId, ObConfigurationId, OnboardingStatus};
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

    #[strum(serialize = "footprint.watchlist_check.completed")]
    #[strum(message = "A watchlist check has run for the vault")]
    WatchlistCheckCompleted(WatchlistCheckCompletedPayload),
}

/// all of the payload bodies
mod payloads {
    use newtypes::{WatchlistCheckError, WatchlistCheckStatusKind};

    use super::*;

    #[derive(Debug, Clone, Eq, PartialEq, Serialize, Deserialize, JsonSchema, Default)]
    #[schemars(example = "OnboardingCompletedPayload::example")]
    pub struct OnboardingCompletedPayload {
        /// the footprint id of the entity that completed onboarding
        pub fp_id: FpId,
        /// deprecated (replaced by fp_id)        
        #[schemars(skip)]
        #[serde(skip_serializing_if = "Option::is_none")]
        pub footprint_user_id: Option<FpId>,
        pub timestamp: DateTime<Utc>,
        pub status: OnboardingStatus,
        pub requires_manual_review: bool,
        pub onboarding_configuration_id: ObConfigurationId,
    }

    #[derive(Debug, Clone, Eq, PartialEq, Serialize, Deserialize, JsonSchema, Default)]
    #[schemars(example = "OnboardingStatusChangedPayload::example")]

    pub struct OnboardingStatusChangedPayload {
        /// the footprint id of the entity that completed onboarding
        pub fp_id: FpId,
        /// deprecated (replaced by fp_id)        
        #[schemars(skip)]
        #[serde(skip_serializing_if = "Option::is_none")]
        pub footprint_user_id: Option<FpId>,
        pub timestamp: DateTime<Utc>,
        pub new_status: OnboardingStatus,
    }

    #[derive(Debug, Clone, Eq, PartialEq, Serialize, Deserialize, JsonSchema, Default)]
    #[schemars(example = "WatchlistCheckCompletedPayload::example")]

    pub struct WatchlistCheckCompletedPayload {
        /// the footprint id of the entity that completed onboarding
        pub fp_id: FpId,
        /// deprecated (replaced by fp_id)        
        #[schemars(skip)]
        #[serde(skip_serializing_if = "Option::is_none")]
        pub footprint_user_id: Option<FpId>,
        pub timestamp: DateTime<Utc>,
        pub status: WatchlistCheckStatusKind,
        pub error: Option<WatchlistCheckError>,
    }
}

mod examples {
    use super::*;

    impl OnboardingCompletedPayload {
        pub fn example() -> Self {
            OnboardingCompletedPayload {
                fp_id: FpId::test_data("fp_id_xyz".into()),
                footprint_user_id: None,
                timestamp: Utc::now(),
                status: Default::default(),
                requires_manual_review: false,
                onboarding_configuration_id: ObConfigurationId::test_data("ob_config_id_abc".into()),
            }
        }
    }

    impl OnboardingStatusChangedPayload {
        pub fn example() -> Self {
            OnboardingStatusChangedPayload {
                fp_id: FpId::test_data("fp_id_xyz".into()),
                footprint_user_id: None,
                timestamp: Utc::now(),
                new_status: Default::default(),
            }
        }
    }

    impl WatchlistCheckCompletedPayload {
        pub fn example() -> Self {
            WatchlistCheckCompletedPayload {
                fp_id: FpId::test_data("fp_id_xyz".into()),
                footprint_user_id: None,
                timestamp: Utc::now(),
                status: Default::default(),
                error: None,
            }
        }
    }
}

impl WebhookEvent {
    pub fn event_type(&self) -> String {
        self.to_string()
    }
}
