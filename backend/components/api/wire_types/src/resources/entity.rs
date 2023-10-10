use std::collections::HashMap;

use crate::*;

/// Details for a specific Entity
#[derive(Debug, Clone, Serialize, JsonSchema, Apiv2Schema)]
#[schemars(rename_all = "camelCase")]
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
    pub status: Option<OnboardingStatus>,
    pub insight_event: Option<InsightEvent>,
    pub requires_manual_review: bool,
}

#[derive(Debug, Clone, Serialize, JsonSchema, Apiv2Schema)]
#[schemars(rename_all = "camelCase")]
pub struct SuperAdminEntity {
    pub id: FpId,
    pub is_live: bool,
    pub tenant_id: TenantId,
}

export_schema!(Entity);
