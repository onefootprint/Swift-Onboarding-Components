use crate::{
    util::impl_enum_str_diesel, DataIdentifier, DocumentDataId, ListEntryCreationId, ListEntryId, ListId,
    ObConfigurationId, ScopedVaultId, TenantApiKeyId, TenantRoleId, TenantUserId,
};
use diesel::{sql_types::Text, AsExpression, FromSqlRow};
use diesel_as_jsonb::AsJsonb;
use paperclip::actix::Apiv2Schema;
use serde::{Deserialize, Serialize};
use serde_json;
use serde_with::{DeserializeFromStr, SerializeDisplay};
use strum::AsRefStr;
use strum_macros::{Display, EnumDiscriminants, EnumString};

/// Represents the required detail fields used to create new audit_event rows.
#[derive(Display, Debug, Clone)]
pub enum AuditEventDetail {
    CreateUser {
        is_live: bool,
        scoped_vault_id: ScopedVaultId,
        created_fields: Vec<DataIdentifier>,
    },
    UpdateUserData {
        is_live: bool,
        scoped_vault_id: ScopedVaultId,
        updated_fields: Vec<DataIdentifier>,
    },
    DeleteUserData {
        is_live: bool,
        scoped_vault_id: ScopedVaultId,
        deleted_fields: Vec<DataIdentifier>,
    },
    DecryptUserData {
        is_live: bool,
        scoped_vault_id: ScopedVaultId,
        reason: String,
        decrypted_fields: Vec<DataIdentifier>,
    },
    DeleteUser {
        is_live: bool,
        scoped_vault_id: ScopedVaultId,
    },
    CreateUserAnnotation,
    CompleteUserCheckLiveness,
    CompleteUserCheckWatchlist,
    RequestUserData,
    StartUserVerification,
    CompleteUserVerification,
    CollectUserDocument, // TODO: is there a better name for this?
    CreateOrgAPIKey,
    DecryptOrgAPIKey,
    UpdateOrgAPIKey,
    InviteOrgMember,
    UpdateOrgMember,
    LoginOrgMember,
    RemoveOrgMember,
    CreateOrg,
    UpdateOrgSettings,
    CreateOrgRole,
    UpdateOrgRole,
    CreateListEntry {
        is_live: bool,
        list_id: ListId,
        list_entry_creation_id: ListEntryCreationId,
    },
    DeleteListEntry {
        is_live: bool,
        list_id: ListId,
        list_entry_id: ListEntryId,
    },
}

/// Represents a projection of AuditEventDetail onto a common schema.
#[derive(Debug, Clone)]
pub struct CommonAuditEventDetail {
    pub metadata: AuditEventMetadata,

    pub scoped_vault_id: Option<ScopedVaultId>,
    pub ob_configuration_id: Option<ObConfigurationId>,
    pub document_data_id: Option<DocumentDataId>,
    pub tenant_api_key_id: Option<TenantApiKeyId>,
    pub tenant_user_id: Option<TenantUserId>,
    pub tenant_role_id: Option<TenantRoleId>,

    pub is_live: Option<bool>,
    pub list_entry_creation_id: Option<ListEntryCreationId>,
    pub list_entry_id: Option<ListEntryId>,
    pub list_id: Option<ListId>,
}

impl From<AuditEventDetail> for CommonAuditEventDetail {
    fn from(value: AuditEventDetail) -> Self {
        match value {
            AuditEventDetail::CreateUser {
                is_live,
                scoped_vault_id,
                created_fields,
            } => Self {
                metadata: AuditEventMetadata::CreateUser {
                    fields: created_fields,
                },
                scoped_vault_id: Some(scoped_vault_id),
                ob_configuration_id: None,
                document_data_id: None,
                tenant_api_key_id: None,
                tenant_user_id: None,
                tenant_role_id: None,
                is_live: Some(is_live),
                list_entry_creation_id: None,
                list_entry_id: None,
                list_id: None,
            },
            AuditEventDetail::UpdateUserData {
                is_live,
                scoped_vault_id,
                updated_fields,
            } => Self {
                metadata: AuditEventMetadata::UpdateUserData {
                    fields: updated_fields,
                },
                scoped_vault_id: Some(scoped_vault_id),
                ob_configuration_id: None,
                document_data_id: None,
                tenant_api_key_id: None,
                tenant_user_id: None,
                tenant_role_id: None,
                is_live: Some(is_live),
                list_entry_creation_id: None,
                list_entry_id: None,
                list_id: None,
            },
            AuditEventDetail::DeleteUserData {
                is_live,
                scoped_vault_id,
                deleted_fields,
            } => Self {
                metadata: AuditEventMetadata::DeleteUserData {
                    fields: deleted_fields,
                },
                scoped_vault_id: Some(scoped_vault_id),
                ob_configuration_id: None,
                document_data_id: None,
                tenant_api_key_id: None,
                tenant_user_id: None,
                tenant_role_id: None,
                is_live: Some(is_live),
                list_entry_creation_id: None,
                list_entry_id: None,
                list_id: None,
            },
            AuditEventDetail::DecryptUserData {
                is_live,
                scoped_vault_id,
                reason,
                decrypted_fields,
            } => Self {
                metadata: AuditEventMetadata::DecryptUserData {
                    reason,
                    fields: decrypted_fields,
                },
                scoped_vault_id: Some(scoped_vault_id),
                ob_configuration_id: None,
                document_data_id: None,
                tenant_api_key_id: None,
                tenant_user_id: None,
                tenant_role_id: None,
                is_live: Some(is_live),
                list_entry_creation_id: None,
                list_entry_id: None,
                list_id: None,
            },
            AuditEventDetail::DeleteUser {
                is_live,
                scoped_vault_id,
            } => Self {
                metadata: AuditEventMetadata::DeleteUser,
                scoped_vault_id: Some(scoped_vault_id),
                ob_configuration_id: None,
                document_data_id: None,
                tenant_api_key_id: None,
                tenant_user_id: None,
                tenant_role_id: None,
                is_live: Some(is_live),
                list_entry_creation_id: None,
                list_entry_id: None,
                list_id: None,
            },
            AuditEventDetail::CreateListEntry {
                is_live,
                list_id,
                list_entry_creation_id,
            } => Self {
                metadata: AuditEventMetadata::CreateListEntry,
                scoped_vault_id: None,
                ob_configuration_id: None,
                document_data_id: None,
                tenant_api_key_id: None,
                tenant_user_id: None,
                tenant_role_id: None,
                is_live: Some(is_live),
                list_entry_creation_id: Some(list_entry_creation_id),
                list_entry_id: None,
                list_id: Some(list_id),
            },
            AuditEventDetail::DeleteListEntry {
                is_live,
                list_id,
                list_entry_id,
            } => Self {
                metadata: AuditEventMetadata::DeleteListEntry,
                scoped_vault_id: None,
                ob_configuration_id: None,
                document_data_id: None,
                tenant_api_key_id: None,
                tenant_user_id: None,
                tenant_role_id: None,
                is_live: Some(is_live),
                list_entry_creation_id: None,
                list_entry_id: Some(list_entry_id),
                list_id: Some(list_id),
            },
            AuditEventDetail::CreateUserAnnotation => todo!(),
            AuditEventDetail::CompleteUserCheckLiveness => todo!(),
            AuditEventDetail::CompleteUserCheckWatchlist => todo!(),
            AuditEventDetail::RequestUserData => todo!(),
            AuditEventDetail::StartUserVerification => todo!(),
            AuditEventDetail::CompleteUserVerification => todo!(),
            AuditEventDetail::CollectUserDocument => todo!(),
            AuditEventDetail::CreateOrgAPIKey => todo!(),
            AuditEventDetail::DecryptOrgAPIKey => todo!(),
            AuditEventDetail::UpdateOrgAPIKey => todo!(),
            AuditEventDetail::InviteOrgMember => todo!(),
            AuditEventDetail::UpdateOrgMember => todo!(),
            AuditEventDetail::LoginOrgMember => todo!(),
            AuditEventDetail::RemoveOrgMember => todo!(),
            AuditEventDetail::CreateOrg => todo!(),
            AuditEventDetail::UpdateOrgSettings => todo!(),
            AuditEventDetail::CreateOrgRole => todo!(),
            AuditEventDetail::UpdateOrgRole => todo!(),
        }
    }
}

#[derive(
    Display,
    Debug,
    Clone,
    Eq,
    PartialEq,
    EnumDiscriminants,
    Serialize,
    Deserialize,
    AsJsonb,
    Apiv2Schema,
    macros::SerdeAttr,
)]
#[strum(serialize_all = "snake_case")]
#[serde(rename_all = "snake_case")]
#[serde(tag = "kind", content = "data")]
#[strum_discriminants(
    name(AuditEventName),
    derive(
        Display,
        EnumString,
        AsRefStr,
        DeserializeFromStr,
        SerializeDisplay,
        FromSqlRow,
        AsExpression,
        Apiv2Schema,
        macros::SerdeAttr,
    ),
    vis(pub),
    strum(serialize_all = "snake_case"),
    diesel(sql_type = Text)
)]
/// Represents the jsonb metadata column type in the audit_event table.
pub enum AuditEventMetadata {
    // TODO: distinguish between users and businesses.
    //
    // The names of these fields are used in jsonb queries. The compiler
    // won't be able to check that they are properly used in filters, since diesel doesn't support
    // filtering on nested jsonb values without dropping into SQL.
    CreateUser {
        fields: Vec<DataIdentifier>,
    },
    UpdateUserData {
        fields: Vec<DataIdentifier>,
    },
    DeleteUserData {
        fields: Vec<DataIdentifier>,
    },
    DecryptUserData {
        reason: String,
        fields: Vec<DataIdentifier>,
    },
    DeleteUser,
    CreateUserAnnotation,
    CompleteUserCheckLiveness,
    CompleteUserCheckWatchlist,
    RequestUserData,
    StartUserVerification,
    CompleteUserVerification,
    CollectUserDocument, // TODO: is there a better name for this?
    CreateOrgApiKey,
    DecryptOrgApiKey,
    UpdateOrgApiKey,
    InviteOrgMember,
    UpdateOrgMember,
    LoginOrgMember,
    RemoveOrgMember,
    CreateOrg,
    UpdateOrgSettings,
    CreateOrgRole,
    UpdateOrgRole,
    CreateListEntry,
    DeleteListEntry,
}

impl_enum_str_diesel!(AuditEventName);

#[cfg(test)]
mod tests {
    use crate::IdentityDataKind;

    use super::*;

    #[test]
    fn test_audit_event_metadata() {
        let json_str = r#"{
            "kind": "decrypt_user_data",
            "data": {
                "reason": "an example reason",
                "fields": ["id.phone_number", "id.last_name"]
            }
        }"#;

        let meta: AuditEventMetadata = serde_json::from_str(json_str).unwrap();
        assert_eq!(
            meta,
            AuditEventMetadata::DecryptUserData {
                reason: "an example reason".to_owned(),
                fields: vec![
                    DataIdentifier::Id(IdentityDataKind::PhoneNumber),
                    DataIdentifier::Id(IdentityDataKind::LastName),
                ],
            }
        )
    }
}
