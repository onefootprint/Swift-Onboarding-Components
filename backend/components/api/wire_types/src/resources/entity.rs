use crate::{
    EntityTag,
    InsightEvent,
    WatchlistCheck,
};
use chrono::{
    DateTime,
    Utc,
};
use newtypes::{
    DataIdentifier,
    DataLifetimeSource,
    ExternalId,
    FilterFunction,
    FpId,
    LabelKind,
    ManualReviewKind,
    ObConfigurationId,
    OnboardingStatus,
    PiiString,
    SandboxId,
    TenantId,
    VaultKind,
};
use paperclip::actix::Apiv2Schema;
use serde::Serialize;
use serde_with::{
    DeserializeFromStr,
    SerializeDisplay,
};
use std::collections::HashMap;
use strum_macros::EnumString;

/// Details for a specific Entity
#[derive(Debug, Clone, Serialize, Apiv2Schema)]

pub struct Entity {
    pub id: FpId,
    pub sandbox_id: Option<SandboxId>,
    pub is_portable: bool,
    pub is_identifiable: bool,
    /// The kind of entity: Person or Business
    pub kind: VaultKind,
    pub start_timestamp: DateTime<Utc>,
    pub watchlist_check: Option<WatchlistCheck>,
    pub ordering_id: i64,
    // These are a representation of the associated workflows
    pub status: EntityStatus,
    pub requires_manual_review: bool,
    pub manual_review_kinds: Vec<ManualReviewKind>,
    pub is_created_via_api: bool,
    /// These are not sorted
    pub workflows: Vec<EntityWorkflow>,
    pub has_outstanding_workflow_request: bool,
    pub external_id: Option<ExternalId>,
    pub last_activity_at: DateTime<Utc>,
    pub label: Option<LabelKind>,
    pub tags: Vec<EntityTag>,

    /// Metadata on the data that exists in this vault.
    pub data: Vec<EntityAttribute>,

    /// DEPRECATED.
    /// The list of attributes populated on this vault.
    pub attributes: Vec<DataIdentifier>,
    /// DEPRECATED.
    /// The list of attributes and their values that are decrypted by default
    pub decrypted_attributes: HashMap<DataIdentifier, PiiString>,
    /// DEPRECATED.
    /// The list of attributes that are allowed to be decrypted by the authed user
    pub decryptable_attributes: Vec<DataIdentifier>,
}

#[derive(Debug, Clone, Serialize, Apiv2Schema)]
pub struct EntityAttribute {
    pub identifier: DataIdentifier,
    pub source: DataLifetimeSource,
    pub is_decryptable: bool,
    pub data_kind: DataAttributeKind,
    /// Decrypted, plaintext value if already decrypted
    pub value: Option<PiiString>,
    /// Decrypted transforms of this attribute, if already decrypted
    pub transforms: HashMap<FilterFunction, PiiString>,
}

#[derive(Debug, Clone, Serialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub enum DataAttributeKind {
    VaultData,
    DocumentData,
}

#[derive(Debug, Clone, Serialize, Apiv2Schema)]
pub struct EntityWorkflow {
    pub created_at: DateTime<Utc>,
    pub playbook_id: ObConfigurationId,
    pub status: OnboardingStatus,
    pub insight_event: Option<InsightEvent>,
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
    None,
}

#[derive(Debug, Clone, Serialize, Apiv2Schema)]

pub struct SuperAdminEntity {
    pub id: FpId,
    pub is_live: bool,
    pub tenant_id: TenantId,
}
