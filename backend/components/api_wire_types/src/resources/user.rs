use crate::*;

/// Details for a specific User
#[derive(Debug, Clone, Deserialize, Serialize, Apiv2Schema, JsonSchema)]
#[schemars(rename_all = "camelCase")]
pub struct User {
    pub id: FootprintUserId,
    pub is_portable: bool,
    /// The list of attributes populated on this user vault.
    pub attributes: Vec<DataIdentifier>,
    /// The list of identity attributes populated on this user vault. Deprecated
    pub identity_data_attributes: Vec<IdentityDataKind>,
    pub identity_document_info: Vec<IdentityDocumentKindForUser>,
    pub start_timestamp: DateTime<Utc>,
    pub onboarding: Option<Onboarding>,
    pub ordering_id: i64,
}

export_schema!(User);

#[derive(Debug, Clone, Deserialize, Serialize, Apiv2Schema, JsonSchema)]
#[schemars(rename_all = "camelCase")]

pub struct IdentityDocumentKindForUser {
    #[serde(rename = "type")]
    /// Deprecated
    pub kind: IdDocKind,
    /// The data identifier for this document
    pub data_identifier: DataIdentifier,
    pub status: UserFacingCollectedDocumentStatus,
    pub selfie_collected: bool,
}

export_schema!(IdentityDocumentKindForUser);
