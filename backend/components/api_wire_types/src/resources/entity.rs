use crate::*;

/// Details for a specific Entity
#[derive(Debug, Clone, Deserialize, Serialize, Apiv2Schema, JsonSchema)]
#[schemars(rename_all = "camelCase")]
pub struct Entity {
    pub id: FootprintUserId,
    pub is_portable: bool,
    /// The kind of entity: Person or Business
    pub kind: VaultKind,
    /// The list of attributes populated on this vault.
    pub attributes: Vec<DataIdentifier>,
    pub start_timestamp: DateTime<Utc>,
    pub onboarding: Option<Onboarding>,
    pub ordering_id: i64,
}

export_schema!(Entity);
