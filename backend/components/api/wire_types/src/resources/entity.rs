use std::collections::HashMap;

use crate::*;

/// Details for a specific Entity
#[derive(Debug, Clone, Deserialize, Serialize, Apiv2Schema, JsonSchema)]
#[schemars(rename_all = "camelCase")]
pub struct Entity {
    pub id: FpId,
    pub is_portable: bool,
    /// The kind of entity: Person or Business
    pub kind: VaultKind,
    /// The list of attributes populated on this vault.
    pub attributes: Vec<DataIdentifier>,
    pub start_timestamp: DateTime<Utc>,
    pub watchlist_check: Option<WatchlistCheck>,
    pub onboarding: Option<Onboarding>,
    pub ordering_id: i64,
    pub decrypted_attributes: HashMap<DataIdentifier, PiiString>,
}

export_schema!(Entity);
