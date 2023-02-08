use crate::*;

#[derive(Debug, Clone, Deserialize, Serialize, Apiv2Schema, JsonSchema)]
#[schemars(rename_all = "camelCase")]

pub struct User {
    pub id: FootprintUserId,
    pub is_portable: bool,
    /// The list of attributes populated on this user vault.
    pub attributes: Vec<DataIdentifier>,
    /// The list of identity attributes populated on this user vault. Deprecated
    pub identity_data_attributes: Vec<IdentityDataKind>,
    /// The list of document attributes populated on this user vault. Deprecated
    pub identity_document_types: Vec<IdDocKind>,
    /// The list of selfie attributes populated on this user vault. Deprecated
    pub selfie_document_types: Vec<IdDocKind>,
    pub start_timestamp: DateTime<Utc>,
    pub onboarding: Option<Onboarding>,
    pub ordering_id: i64,
}

export_schema!(User);
