use std::collections::HashMap;

use crate::{InsightEvent, WatchlistCheck};
use chrono::{DateTime, Utc};
use newtypes::{DataIdentifier, FpId, PiiString, SandboxId, TenantId, VaultKind};
use paperclip::actix::Apiv2Schema;

use serde::Serialize;
use serde_with::{DeserializeFromStr, SerializeDisplay};
use strum_macros::EnumString;

/// Details for a specific Entity
#[derive(Debug, Clone, Serialize, Apiv2Schema)]

pub struct Entity {
    pub id: FpId,
    pub sandbox_id: Option<SandboxId>,
    pub is_portable: bool,
    /// The kind of entity: Person or Business
    pub kind: VaultKind,
    /// The list of attributes populated on this vault.
    pub attributes: Vec<DataIdentifier>,
    pub start_timestamp: DateTime<Utc>,
    pub watchlist_check: Option<WatchlistCheck>,
    pub ordering_id: i64,
    /// The list of attributes and their values that are decrypted by default
    pub decrypted_attributes: HashMap<DataIdentifier, PiiString>,
    /// The list of attributes that are allowed to be decrypted by the authed user
    pub decryptable_attributes: Vec<DataIdentifier>,
    // These are a representation of the associated workflows
    pub status: Option<EntityStatus>,
    pub insight_event: Option<InsightEvent>,
    pub requires_manual_review: bool,
    pub is_created_via_api: bool,
}

/// Mostly just OnboardingStatus but with other statuses that don't exist in OnboardingStatus
#[derive(
    Debug,
    Clone,
    Copy,
    DeserializeFromStr,
    SerializeDisplay,
    Apiv2Schema,
    EnumString,
    strum_macros::Display,
    macros::SerdeAttr,
)]
#[strum(serialize_all = "snake_case")]
#[serde(rename_all = "snake_case")]
pub enum EntityStatus {
    Pass,
    Fail,
    Incomplete,
    InProgress,
    Pending,
}

#[derive(Debug, Clone, Serialize, Apiv2Schema)]

pub struct SuperAdminEntity {
    pub id: FpId,
    pub is_live: bool,
    pub tenant_id: TenantId,
}
