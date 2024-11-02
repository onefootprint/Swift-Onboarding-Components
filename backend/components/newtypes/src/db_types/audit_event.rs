use super::DecryptionContext;
use crate::util::impl_enum_str_diesel;
use crate::DataIdentifier;
use crate::DocumentDataId;
use crate::ListEntryCreationId;
use crate::ListEntryId;
use crate::ListId;
use crate::ObConfigurationId;
use crate::OrgMemberEmail;
use crate::ScopedVaultId;
use crate::TenantApiKeyId;
use crate::TenantRoleId;
use crate::TenantScope;
use crate::TenantUserId;
use diesel::sql_types::Text;
use diesel::AsExpression;
use diesel::FromSqlRow;
use diesel_as_jsonb::AsJsonb;
use paperclip::actix::Apiv2Schema;
use serde::Deserialize;
use serde::Serialize;
use serde_json;
use serde_with::DeserializeFromStr;
use serde_with::SerializeDisplay;
use strum::AsRefStr;
use strum_macros::Display;
use strum_macros::EnumDiscriminants;
use strum_macros::EnumString;

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
        context: DecryptionContext,
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
    InviteOrgMember {
        email: OrgMemberEmail,
        first_name: Option<String>,
        last_name: Option<String>,
        tenant_role_id: TenantRoleId,
    },
    UpdateOrgMember,
    LoginOrgMember,
    RemoveOrgMember,
    CreateOrg,
    UpdateOrgSettings,
    CreateOrgRole {
        is_live: bool,
        scopes: Vec<TenantScope>,
        tenant_role_id: TenantRoleId,
    },
    UpdateOrgRole {
        is_live: bool,
        prev_scopes: Vec<TenantScope>,
        new_scopes: Vec<TenantScope>,
        tenant_role_id: TenantRoleId,
    },
    DeactivateOrgRole {
        tenant_role_id: TenantRoleId,
    },
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
    CreatePlaybook,
    DisablePlaybook,
    ManuallyReviewEntity,
    EditPlaybook,
}


#[derive(Debug, Clone, Default)]
pub struct AuditEventOptionalArgs {
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

/// Represents a projection of AuditEventDetail onto a common schema.
#[derive(Debug, Clone)]
pub struct CommonAuditEventDetail {
    pub metadata: AuditEventMetadata,
    pub args: AuditEventOptionalArgs,
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
                args: AuditEventOptionalArgs {
                    scoped_vault_id: Some(scoped_vault_id),
                    is_live: Some(is_live),
                    ..Default::default()
                },
            },
            AuditEventDetail::UpdateUserData {
                is_live,
                scoped_vault_id,
                updated_fields,
            } => Self {
                metadata: AuditEventMetadata::UpdateUserData {
                    fields: updated_fields,
                },
                args: AuditEventOptionalArgs {
                    scoped_vault_id: Some(scoped_vault_id),
                    is_live: Some(is_live),
                    ..Default::default()
                },
            },
            AuditEventDetail::DeleteUserData {
                is_live,
                scoped_vault_id,
                deleted_fields,
            } => Self {
                metadata: AuditEventMetadata::DeleteUserData {
                    fields: deleted_fields,
                },
                args: AuditEventOptionalArgs {
                    scoped_vault_id: Some(scoped_vault_id),
                    is_live: Some(is_live),
                    ..Default::default()
                },
            },
            AuditEventDetail::DecryptUserData {
                is_live,
                scoped_vault_id,
                reason,
                context,
                decrypted_fields,
            } => Self {
                metadata: AuditEventMetadata::DecryptUserData {
                    reason,
                    context,
                    fields: decrypted_fields,
                },
                args: AuditEventOptionalArgs {
                    scoped_vault_id: Some(scoped_vault_id),
                    is_live: Some(is_live),
                    ..Default::default()
                },
            },
            AuditEventDetail::DeleteUser {
                is_live,
                scoped_vault_id,
            } => Self {
                metadata: AuditEventMetadata::DeleteUser,
                args: AuditEventOptionalArgs {
                    scoped_vault_id: Some(scoped_vault_id),
                    is_live: Some(is_live),
                    ..Default::default()
                },
            },
            AuditEventDetail::CreateListEntry {
                is_live,
                list_id,
                list_entry_creation_id,
            } => Self {
                metadata: AuditEventMetadata::CreateListEntry,
                args: AuditEventOptionalArgs {
                    is_live: Some(is_live),
                    list_entry_creation_id: Some(list_entry_creation_id),
                    list_id: Some(list_id),
                    ..Default::default()
                },
            },
            AuditEventDetail::DeleteListEntry {
                is_live,
                list_id,
                list_entry_id,
            } => Self {
                metadata: AuditEventMetadata::DeleteListEntry,
                args: AuditEventOptionalArgs {
                    is_live: Some(is_live),
                    list_entry_id: Some(list_entry_id),
                    list_id: Some(list_id),
                    ..Default::default()
                },
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
            AuditEventDetail::InviteOrgMember {
                email,
                tenant_role_id,
                first_name,
                last_name,
            } => Self {
                metadata: AuditEventMetadata::InviteOrgMember {
                    email,
                    first_name,
                    last_name,
                },
                args: AuditEventOptionalArgs {
                    tenant_role_id: Some(tenant_role_id),
                    ..Default::default()
                },
            },
            AuditEventDetail::UpdateOrgMember => todo!(),
            AuditEventDetail::LoginOrgMember => todo!(),
            AuditEventDetail::RemoveOrgMember => todo!(),
            AuditEventDetail::CreateOrg => todo!(),
            AuditEventDetail::UpdateOrgSettings => todo!(),
            AuditEventDetail::CreateOrgRole {
                is_live,
                scopes,
                tenant_role_id,
            } => Self {
                metadata: AuditEventMetadata::CreateOrgRole { scopes },
                args: AuditEventOptionalArgs {
                    tenant_role_id: Some(tenant_role_id),
                    is_live: Some(is_live),
                    ..Default::default()
                },
            },
            AuditEventDetail::UpdateOrgRole {
                is_live,
                prev_scopes,
                new_scopes,
                tenant_role_id,
            } => Self {
                metadata: AuditEventMetadata::UpdateOrgRole {
                    prev_scopes,
                    new_scopes,
                },
                args: AuditEventOptionalArgs {
                    is_live: Some(is_live),
                    tenant_role_id: Some(tenant_role_id),
                    ..Default::default()
                },
            },
            AuditEventDetail::DeactivateOrgRole { tenant_role_id } => Self {
                metadata: AuditEventMetadata::DeactivateOrgRole,
                args: AuditEventOptionalArgs {
                    tenant_role_id: Some(tenant_role_id),
                    ..Default::default()
                },
            },
            AuditEventDetail::CreatePlaybook => todo!(),
            AuditEventDetail::DisablePlaybook => todo!(),
            AuditEventDetail::EditPlaybook => todo!(),
            AuditEventDetail::ManuallyReviewEntity => todo!(),
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
        context: DecryptionContext,
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
    InviteOrgMember {
        email: OrgMemberEmail,
        first_name: Option<String>,
        last_name: Option<String>,
    },
    UpdateOrgMember,
    LoginOrgMember,
    RemoveOrgMember,
    CreateOrg,
    UpdateOrgSettings,
    CreateOrgRole {
        scopes: Vec<TenantScope>,
    },
    UpdateOrgRole {
        prev_scopes: Vec<TenantScope>,
        new_scopes: Vec<TenantScope>,
    },
    CreateListEntry,
    DeleteListEntry,
    CreatePlaybook,
    DisablePlaybook,
    ManuallyReviewEntity,
    EditPlaybook,
    DeactivateOrgRole,
}

impl_enum_str_diesel!(AuditEventName);

#[cfg(test)]
mod tests {
    use super::*;
    use crate::IdentityDataKind;

    #[test]
    fn test_audit_event_metadata() {
        let json_str = r#"{
            "kind": "decrypt_user_data",
            "data": {
                "reason": "an example reason",
                "context": "api",
                "fields": ["id.phone_number", "id.last_name"]
            }
        }"#;

        let meta: AuditEventMetadata = serde_json::from_str(json_str).unwrap();
        assert_eq!(
            meta,
            AuditEventMetadata::DecryptUserData {
                reason: "an example reason".to_owned(),
                context: DecryptionContext::Api,
                fields: vec![
                    DataIdentifier::Id(IdentityDataKind::PhoneNumber),
                    DataIdentifier::Id(IdentityDataKind::LastName),
                ],
            }
        )
    }
}
