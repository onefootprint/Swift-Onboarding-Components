use chrono::{DateTime, Utc};
pub use derive_more::Display;
use diesel::{sql_types::Text, AsExpression, FromSqlRow};
use diesel_as_jsonb::AsJsonb;
use paperclip::actix::Apiv2Schema;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use strum_macros::{AsRefStr, EnumString};

use crate::{FpId, OnboardingStatus, ScopedVaultId, TenantId, WatchlistCheckError, WatchlistCheckStatusKind};

// TODO: can probs rename this to task.rs now

#[derive(
    Debug,
    Display,
    Clone,
    Copy,
    Eq,
    PartialEq,
    Ord,
    PartialOrd,
    Deserialize,
    Serialize,
    AsExpression,
    FromSqlRow,
    EnumString,
    AsRefStr,
    Apiv2Schema,
    JsonSchema,
)]
#[strum(serialize_all = "snake_case")]
#[serde(rename_all = "snake_case")]
#[diesel(sql_type = Text)]
pub enum TaskStatus {
    Pending,
    Running,
    Completed,
    Failed,
}

crate::util::impl_enum_str_diesel!(TaskStatus);
#[derive(Debug, Clone, Serialize, Deserialize, Apiv2Schema, AsJsonb)]
#[serde(rename_all = "snake_case")]
#[serde(tag = "kind", content = "data")]
pub enum TaskData {
    LogMessage(LogMessageTaskArgs),
    LogNumTenantApiKeys(LogNumTenantApiKeysArgs), // proof of concept non-trivial task that does DB stuffs, can remove in future
    WatchlistCheck(WatchlistCheckArgs),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LogMessageTaskArgs {
    pub message: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LogNumTenantApiKeysArgs {
    pub tenant_id: TenantId,
    pub is_live: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WatchlistCheckArgs {
    pub scoped_vault_id: ScopedVaultId,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FireWebhookArgs {
    pub scoped_vault_id: ScopedVaultId,
    pub webhook_event: WebhookEvent,
}

#[derive(Debug, strum::Display, Clone, Eq, PartialEq, Serialize, Deserialize)]
pub enum WebhookEvent {
    OnboardingCompleted(OnboardingCompletedPayload),
    OnboardingStatusChanged(OnboardingStatusChangedPayload),
    WatchlistCheckCompleted(WatchlistCheckCompletedPayload),
}
#[derive(Debug, Clone, Eq, PartialEq, Serialize, Deserialize, JsonSchema)]
pub struct OnboardingCompletedPayload {
    pub fp_id: FpId,
    pub footprint_user_id: Option<FpId>,
    pub timestamp: DateTime<Utc>,
    pub status: OnboardingStatus,
    pub requires_manual_review: bool,
}

#[derive(Debug, Clone, Eq, PartialEq, Serialize, Deserialize, JsonSchema)]
pub struct OnboardingStatusChangedPayload {
    pub fp_id: FpId,
    pub footprint_user_id: Option<FpId>,
    pub timestamp: DateTime<Utc>,
    pub new_status: OnboardingStatus,
}

#[derive(Debug, Clone, Eq, PartialEq, Serialize, Deserialize)]

pub struct WatchlistCheckCompletedPayload {
    pub fp_id: FpId,
    pub footprint_user_id: Option<FpId>,
    pub timestamp: DateTime<Utc>,
    pub status: WatchlistCheckStatusKind,
    pub error: Option<WatchlistCheckError>,
}
