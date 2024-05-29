pub use self::payloads::{
    OnboardingCompletedPayload,
    OnboardingStatusChangedPayload,
    WatchlistCheckCompletedPayload,
};
use chrono::{
    DateTime,
    Utc,
};
use newtypes::{
    FpId,
    OnboardingCompletedPayload as NTOnboardingCompletedPayload,
    OnboardingStatus,
    OnboardingStatusChangedPayload as NTOnboardingStatusChangedPayload,
    WatchlistCheckCompletedPayload as NTWatchlistCheckCompletedPayload,
    WebhookEvent as NTWebhookEvent,
};
use schemars::JsonSchema;
use serde::{
    Deserialize,
    Serialize,
};
use strum::{
    EnumIter,
    EnumMessage,
};

/// Defines supported webhook event types and payloads
#[derive(Debug, strum::Display, Clone, Eq, PartialEq, Serialize, Deserialize, EnumIter, EnumMessage)]
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
    use super::*;
    use newtypes::{
        WatchlistCheckError,
        WatchlistCheckStatusKind,
    };

    #[derive(Debug, Clone, Eq, PartialEq, Serialize, Deserialize, Default, JsonSchema)]
    #[schemars(example = "OnboardingCompletedPayload::example")]
    pub struct OnboardingCompletedPayload {
        /// the footprint id of the entity that completed onboarding
        #[schemars(with = "String")]
        pub fp_id: FpId,
        pub timestamp: DateTime<Utc>,
        #[schemars(with = "OnboardingStatusShadow")]
        pub status: OnboardingStatus,
        pub requires_manual_review: bool,
        pub is_live: bool,
    }

    #[derive(Debug, Clone, Eq, PartialEq, Serialize, Deserialize, Default, JsonSchema)]
    #[schemars(example = "OnboardingStatusChangedPayload::example")]

    pub struct OnboardingStatusChangedPayload {
        /// the footprint id of the entity that completed onboarding
        #[schemars(with = "String")]
        pub fp_id: FpId,
        pub timestamp: DateTime<Utc>,
        #[schemars(with = "OnboardingStatusShadow")]
        pub new_status: OnboardingStatus,
        pub requires_manual_review: bool,
        pub is_live: bool,
    }

    #[derive(Debug, Clone, Eq, PartialEq, Serialize, Deserialize, Default, JsonSchema)]
    #[schemars(example = "WatchlistCheckCompletedPayload::example")]

    pub struct WatchlistCheckCompletedPayload {
        /// the footprint id of the entity that completed onboarding
        #[schemars(with = "String")]
        pub fp_id: FpId,
        pub timestamp: DateTime<Utc>,
        #[schemars(with = "WatchlistCheckStatusKindShadow")]
        pub status: WatchlistCheckStatusKind,
        #[schemars(with = "Option<WatchlistCheckErrorShadow>")]
        pub error: Option<WatchlistCheckError>,
        pub is_live: bool,
    }

    // This is just a copy of the remote data structure that Schemars can use to
    // create a suitable JsonSchema impl.
    #[derive(JsonSchema)]
    #[serde(remote = "OnboardingStatus")]
    #[serde(rename_all = "snake_case")]
    enum OnboardingStatusShadow {
        #[allow(unused)]
        /// Passed all checks
        Pass,
        #[allow(unused)]
        /// Failed one or more check
        Fail,
        #[allow(unused)]
        /// The user has not yet finished entering all information
        Incomplete,
        #[allow(unused)]
        /// All required data has been collected. We are waiting for a firm decision
        Pending,
    }

    #[derive(JsonSchema)]
    #[serde(remote = "WatchlistCheckStatusKind")]
    #[serde(rename_all = "snake_case")]
    enum WatchlistCheckStatusKindShadow {
        #[allow(unused)]
        Pending,
        #[allow(unused)]
        Pass,
        #[allow(unused)]
        Fail,
        #[allow(unused)]
        Error,
        #[allow(unused)]
        NotNeeded,
    }

    #[derive(JsonSchema)]
    #[serde(remote = "WatchlistCheckError")]
    #[serde(rename_all = "snake_case")]
    enum WatchlistCheckErrorShadow {
        #[allow(unused)]
        RequiredDataNotPresent,
    }
}

mod examples {
    use super::*;

    impl OnboardingCompletedPayload {
        pub fn example() -> Self {
            OnboardingCompletedPayload {
                fp_id: FpId::test_data("fp_id_xyz".into()),
                timestamp: Utc::now(),
                status: Default::default(),
                requires_manual_review: false,
                is_live: false,
            }
        }
    }

    impl OnboardingStatusChangedPayload {
        pub fn example() -> Self {
            OnboardingStatusChangedPayload {
                fp_id: FpId::test_data("fp_id_xyz".into()),
                timestamp: Utc::now(),
                new_status: Default::default(),
                requires_manual_review: false,
                is_live: false,
            }
        }
    }

    impl WatchlistCheckCompletedPayload {
        pub fn example() -> Self {
            WatchlistCheckCompletedPayload {
                fp_id: FpId::test_data("fp_id_xyz".into()),
                timestamp: Utc::now(),
                status: Default::default(),
                error: None,
                is_live: false,
            }
        }
    }
}

impl WebhookEvent {
    pub fn event_type(&self) -> String {
        self.to_string()
    }
}

impl From<NTWebhookEvent> for WebhookEvent {
    fn from(value: newtypes::WebhookEvent) -> Self {
        match value {
            NTWebhookEvent::OnboardingCompleted(v) => WebhookEvent::OnboardingCompleted(v.into()),
            NTWebhookEvent::OnboardingStatusChanged(v) => WebhookEvent::OnboardingStatusChanged(v.into()),
            NTWebhookEvent::WatchlistCheckCompleted(v) => WebhookEvent::WatchlistCheckCompleted(v.into()),
        }
    }
}

impl From<NTOnboardingCompletedPayload> for OnboardingCompletedPayload {
    fn from(value: NTOnboardingCompletedPayload) -> Self {
        Self {
            fp_id: value.fp_id,
            timestamp: value.timestamp,
            status: value.status,
            requires_manual_review: value.requires_manual_review,
            is_live: value.is_live,
        }
    }
}

impl From<NTOnboardingStatusChangedPayload> for OnboardingStatusChangedPayload {
    fn from(value: NTOnboardingStatusChangedPayload) -> Self {
        Self {
            fp_id: value.fp_id,
            timestamp: value.timestamp,
            new_status: value.new_status,
            requires_manual_review: value.requires_manual_review,
            is_live: value.is_live,
        }
    }
}

impl From<NTWatchlistCheckCompletedPayload> for WatchlistCheckCompletedPayload {
    fn from(value: NTWatchlistCheckCompletedPayload) -> Self {
        Self {
            fp_id: value.fp_id,
            timestamp: value.timestamp,
            status: value.status,
            error: value.error,
            is_live: value.is_live,
        }
    }
}
