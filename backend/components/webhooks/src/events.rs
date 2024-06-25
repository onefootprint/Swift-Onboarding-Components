use chrono::DateTime;
use chrono::Utc;
use newtypes::FpId;
use newtypes::ObConfigurationKey;
use newtypes::OnboardingCompletedPayload as NTOnboardingCompletedPayload;
use newtypes::OnboardingStatus;
use newtypes::OnboardingStatusChangedPayload as NTOnboardingStatusChangedPayload;
use newtypes::UserSpecificWebhookPayload;
use newtypes::WatchlistCheckCompletedPayload as NTWatchlistCheckCompletedPayload;
use newtypes::WatchlistCheckError;
use newtypes::WatchlistCheckStatusKind;
use newtypes::WebhookEvent as NTWebhookEvent;
use schemars::JsonSchema;
use serde::Serialize;
use serde_with::SerializeDisplay;
use strum::EnumDiscriminants;
use strum::EnumIter;
use strum::EnumMessage;
use strum::IntoEnumIterator;

/// Defines supported webhook event types and payloads
#[derive(Debug, Clone, Eq, PartialEq, Serialize, EnumDiscriminants)]
#[strum_discriminants(name(WebhookEventKind))]
#[strum_discriminants(derive(strum_macros::Display, SerializeDisplay, EnumMessage, EnumIter))]
#[serde(untagged)]
pub enum WebhookEvent {
    #[strum_discriminants(strum(serialize = "footprint.onboarding.completed"))]
    #[strum_discriminants(strum(
        message = "The user has completed onboarding onto a playbook and we have a terminal status.\n\nIn most cases, this will fire as the user finishes the onboarding flow. In some cases (like KYB), the terminal verification status may not come until a few minutes after the user has exited the onboarding flow. You should always retrieve the fp_id after onboarding and attempt to fetch the status. If the status after onboarding is non-terminal, you will receive an update with the terminal status via this webhook."
    ))]
    OnboardingCompleted(OnboardingCompletedPayload),

    #[strum_discriminants(strum(serialize = "footprint.onboarding.status_changed"))]
    #[strum_discriminants(strum(
        message = "NOTE: This webhook is deprecated in favor of the more descriptive footprint.onboarding.completed and footprint.user.manual_review events.\n\nA user's status has been changed after finishing onboarding, manual review, or internal updates to the user's status. Generally, the pending and incomplete statuses aren't important to listen to here."
    ))]
    OnboardingStatusChanged(OnboardingStatusChangedPayload),

    #[strum_discriminants(strum(serialize = "footprint.watchlist_check.completed"))]
    #[strum_discriminants(strum(message = "A watchlist check has run for the user."))]
    WatchlistCheckCompleted(WatchlistCheckCompletedPayload),

    #[strum_discriminants(strum(serialize = "footprint.user.info_requested"))]
    #[strum_discriminants(strum(
        message = "A Footprint dashboard user has requested this user to provide more information during the course of manual review. When responding to this webhook, you can see more context on the information requested using the GET /users/{fp_id} API."
    ))]
    UserInfoRequested(UserInfoRequestedPayload),

    #[strum_discriminants(strum(serialize = "footprint.user.manual_review"))]
    #[strum_discriminants(strum(
        message = "A Footprint dashboard user has changed the user's status during manual review. When responding to this webhook, you can see more context on the user's up-to-date status using the GET /users/{fp_id} API."
    ))]
    UserManualReview(UserManualReviewPayload),
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

#[derive(Debug, Clone, Eq, PartialEq, Serialize, JsonSchema)]
#[schemars(example = "OnboardingCompletedPayload::example")]
pub struct OnboardingCompletedPayload {
    pub event_kind: WebhookEventKind,
    #[schemars(with = "String")]
    pub fp_id: FpId,
    pub timestamp: DateTime<Utc>,
    #[schemars(with = "OnboardingStatusShadow")]
    pub status: OnboardingStatus,
    #[schemars(with = "String")]
    pub playbook_key: ObConfigurationKey,
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

#[derive(Debug, Clone, Eq, PartialEq, Serialize, JsonSchema)]
#[schemars(example = "UserInfoRequestedPayload::example")]
pub struct UserInfoRequestedPayload {
    pub event_kind: WebhookEventKind,
    #[schemars(with = "String")]
    pub fp_id: FpId,
    pub timestamp: DateTime<Utc>,
    pub is_live: bool,
}

#[derive(Debug, Clone, Eq, PartialEq, Serialize, JsonSchema)]
#[schemars(example = "UserManualReviewPayload::example")]
pub struct UserManualReviewPayload {
    pub event_kind: WebhookEventKind,
    #[schemars(with = "String")]
    pub fp_id: FpId,
    pub timestamp: DateTime<Utc>,
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
    #[allow(unused)]
    None,
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

mod examples {
    use super::*;
    use newtypes::ObConfigurationKey;

    impl OnboardingCompletedPayload {
        pub fn example() -> Self {
            OnboardingCompletedPayload {
                event_kind: WebhookEventKind::OnboardingCompleted,
                fp_id: FpId::test_data("fp_id_xyz".into()),
                timestamp: Utc::now(),
                status: OnboardingStatus::Pass,
                playbook_key: ObConfigurationKey::test_data("pb_test_QoEYTOve49Q2IAmaKVYnPs".into()),
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
                new_status: OnboardingStatus::Pass,
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

    impl UserInfoRequestedPayload {
        pub fn example() -> Self {
            UserInfoRequestedPayload {
                event_kind: WebhookEventKind::UserInfoRequested,
                fp_id: FpId::test_data("fp_id_xyz".into()),
                timestamp: Utc::now(),
                is_live: false,
            }
        }
    }

    impl UserManualReviewPayload {
        pub fn example() -> Self {
            UserManualReviewPayload {
                event_kind: WebhookEventKind::UserManualReview,
                fp_id: FpId::test_data("fp_id_xyz".into()),
                timestamp: Utc::now(),
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
            NTWebhookEvent::UserInfoRequested(v) => WebhookEvent::UserInfoRequested(v.into()),
            NTWebhookEvent::UserManualReview(v) => WebhookEvent::UserManualReview(v.into()),
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
            playbook_key: value.playbook_key,
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

impl From<UserSpecificWebhookPayload> for UserInfoRequestedPayload {
    fn from(value: UserSpecificWebhookPayload) -> Self {
        Self {
            event_kind: WebhookEventKind::UserInfoRequested,
            fp_id: value.fp_id,
            timestamp: value.timestamp,
            is_live: value.is_live,
        }
    }
}

impl From<UserSpecificWebhookPayload> for UserManualReviewPayload {
    fn from(value: UserSpecificWebhookPayload) -> Self {
        Self {
            event_kind: WebhookEventKind::UserManualReview,
            fp_id: value.fp_id,
            timestamp: value.timestamp,
            is_live: value.is_live,
        }
    }
}
