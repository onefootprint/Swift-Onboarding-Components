use crate::{
    util::impl_enum_str_diesel, DataIdentifier, DocumentDataId, ObConfigurationId, ScopedVaultId,
    TenantApiKeyId, TenantRoleId, TenantUserId,
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

/// Represents the jsonb metadata column type in the audit_event table.
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
pub enum AuditEventMetadata {
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
