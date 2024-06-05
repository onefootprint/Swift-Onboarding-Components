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
use serde::Serialize;
use serde_with::SerializeDisplay;
use strum::{
    EnumDiscriminants,
    EnumIter,
    EnumMessage,
    IntoEnumIterator,
};

/// Defines supported webhook event types and payloads
#[derive(Debug, Clone, Eq, PartialEq, Serialize, EnumDiscriminants)]
#[strum_discriminants(name(WebhookEventKind))]
#[strum_discriminants(derive(strum_macros::Display, SerializeDisplay, EnumMessage, EnumIter))]
#[serde(untagged)]
pub enum WebhookEvent {
    #[strum_discriminants(strum(serialize = "footprint.onboarding.completed"))]
    #[strum_discriminants(strum(message = "An onboarding was just completed"))]
    OnboardingCompleted(OnboardingCompletedPayload),

    #[strum_discriminants(strum(serialize = "footprint.onboarding.status_changed"))]
    #[strum_discriminants(strum(message = "The status of an onboarding has changed"))]
    OnboardingStatusChanged(OnboardingStatusChangedPayload),

    #[strum_discriminants(strum(serialize = "footprint.watchlist_check.completed"))]
    #[strum_discriminants(strum(message = "A watchlist check has run for the vault"))]
    WatchlistCheckCompleted(WatchlistCheckCompletedPayload),
}

impl schemars::JsonSchema for WebhookEventKind {
    fn schema_name() -> std::string::String {
        "WebhookEventKind".to_owned()
    }

    fn schema_id() -> std::borrow::Cow<'static, str> {
        std::borrow::Cow::Borrowed(std::concat!(std::module_path!(), "::", "WebhookEventKind"))
    }

    fn json_schema(_: &mut schemars::gen::SchemaGenerator) -> schemars::schema::Schema {
        schemars::_private::apply_metadata(
            schemars::schema::Schema::Object(schemars::schema::SchemaObject {
                instance_type: Some(schemars::schema::InstanceType::String.into()),
                enum_values: Some(WebhookEventKind::iter().map(|k| k.to_string().into()).collect()),
                ..Default::default()
            }),
            schemars::schema::Metadata { ..Default::default() },
        )
    }
}

/// all of the payload bodies
mod payloads {
    use super::*;
    use newtypes::{
        WatchlistCheckError,
        WatchlistCheckStatusKind,
    };

    #[derive(Debug, Clone, Eq, PartialEq, Serialize, JsonSchema)]
    #[schemars(example = "OnboardingCompletedPayload::example")]
    pub struct OnboardingCompletedPayload {
        pub event_kind: WebhookEventKind,
        #[schemars(with = "String")]
        pub fp_id: FpId,
        pub timestamp: DateTime<Utc>,
        #[schemars(with = "OnboardingStatusShadow")]
        pub status: OnboardingStatus,
        pub requires_manual_review: bool,
        pub is_live: bool,
    }

    #[derive(Debug, Clone, Eq, PartialEq, Serialize, JsonSchema)]
    #[schemars(example = "OnboardingStatusChangedPayload::example")]

    pub struct OnboardingStatusChangedPayload {
        pub event_kind: WebhookEventKind,
        #[schemars(with = "String")]
        pub fp_id: FpId,
        pub timestamp: DateTime<Utc>,
        #[schemars(with = "OnboardingStatusShadow")]
        pub new_status: OnboardingStatus,
        pub requires_manual_review: bool,
        pub is_live: bool,
    }

    #[derive(Debug, Clone, Eq, PartialEq, Serialize, JsonSchema)]
    #[schemars(example = "WatchlistCheckCompletedPayload::example")]

    pub struct WatchlistCheckCompletedPayload {
        pub event_kind: WebhookEventKind,
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
        Pass,
        #[allow(unused)]
        Fail,
        #[allow(unused)]
        Incomplete,
        #[allow(unused)]
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
                event_kind: WebhookEventKind::OnboardingCompleted,
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
                event_kind: WebhookEventKind::OnboardingStatusChanged,
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
                event_kind: WebhookEventKind::WatchlistCheckCompleted,
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
        WebhookEventKind::from(self).to_string()
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
            event_kind: WebhookEventKind::OnboardingCompleted,
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
            event_kind: WebhookEventKind::OnboardingStatusChanged,
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
            event_kind: WebhookEventKind::WatchlistCheckCompleted,
            fp_id: value.fp_id,
            timestamp: value.timestamp,
            status: value.status,
            error: value.error,
            is_live: value.is_live,
        }
    }
}
