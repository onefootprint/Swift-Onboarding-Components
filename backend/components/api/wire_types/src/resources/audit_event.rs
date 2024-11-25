use crate::*;
use newtypes::ApiKeyStatus;
use newtypes::AuditEventId;
use newtypes::AuditEventName;
use newtypes::DataIdentifier;
use newtypes::DecisionStatus;
use newtypes::DecryptionContext;
use newtypes::FpId;
use newtypes::ListEntryCreationId;
use newtypes::ListEntryId;
use newtypes::ListId;
use newtypes::ObConfigurationId;
use newtypes::OrgMemberEmail;
use newtypes::TenantApiKeyId;
use newtypes::TenantId;
use newtypes::TenantRoleId;
use newtypes::TenantScope;
use newtypes::TenantUserId;
use strum_macros::Display;

/// Describes an event relevant to security as seen by tenants.
#[derive(Debug, Clone, Serialize, Apiv2Response, macros::JsonResponder)]
pub struct AuditEvent {
    pub id: AuditEventId,
    pub timestamp: DateTime<Utc>,
    pub tenant_id: TenantId,
    pub name: AuditEventName,
    pub principal: Option<Actor>,

    // insight_event is optional because it is redacted in the end user's view.
    pub insight_event: Option<InsightEvent>,

    pub detail: AuditEventDetail,
}

impl AuditEvent {
    pub fn redact_for_end_user(mut self) -> Self {
        self.insight_event = None;
        self
    }
}

#[derive(Display, Debug, Clone, Serialize, Apiv2Schema)]
#[strum(serialize_all = "snake_case")]
#[serde(rename_all = "snake_case")]
#[serde(tag = "kind", content = "data")]
pub enum AuditEventDetail {
    CreateUser {
        fp_id: FpId,
        created_fields: Vec<DataIdentifier>,
    },
    UpdateUserData {
        fp_id: FpId,
        updated_fields: Vec<DataIdentifier>,
    },
    DeleteUserData {
        fp_id: FpId,
        deleted_fields: Vec<DataIdentifier>,
    },
    DecryptUserData {
        fp_id: FpId,
        reason: String,
        context: DecryptionContext,
        decrypted_fields: Vec<DataIdentifier>,
    },
    DeleteUser {
        fp_id: FpId,
    },
    CreateUserAnnotation,
    CompleteUserCheckLiveness,
    CompleteUserCheckWatchlist,
    RequestUserData,
    StartUserVerification,
    CompleteUserVerification,
    CollectUserDocument, // TODO: is there a better name for this?
    CreateOrgApiKey {
        api_key: AuditEventApiKey,
    },
    DecryptOrgApiKey {
        api_key: AuditEventApiKey,
    },
    UpdateOrgApiKeyRole {
        api_key: AuditEventApiKey,
        old_role: crate::OrganizationRole,
        new_role: crate::OrganizationRole,
    },
    InviteOrgMember {
        email: OrgMemberEmail,
        first_name: Option<String>,
        last_name: Option<String>,
        tenant_role_id: TenantRoleId,
        tenant_role_name: String,
        tenant_name: String,
        scopes: Vec<TenantScope>,
    },
    UpdateOrgMember {
        first_name: Option<String>,
        last_name: Option<String>,
        tenant_user_id: TenantUserId,

        new_role: crate::OrganizationRole,
        old_role: crate::OrganizationRole,
    },
    LoginOrgMember,
    RemoveOrgMember {
        member: AuditEventOrgMember,
    },
    CreateOrg,
    UpdateOrgSettings,
    CreateOrgRole {
        role_name: String,
        scopes: Vec<TenantScope>,
        tenant_role_id: TenantRoleId,
    },
    UpdateOrgRole {
        prev_scopes: Vec<TenantScope>,
        new_scopes: Vec<TenantScope>,
        tenant_role_id: TenantRoleId,
        role_name: String,
    },
    CreateListEntry {
        list_id: ListId,
        list_entry_creation_id: ListEntryCreationId,
    },
    DeleteListEntry {
        list_id: ListId,
        list_entry_id: ListEntryId,
    },
    UpdateOrgApiKeyStatus {
        api_key: AuditEventApiKey,
        status: ApiKeyStatus,
    },
    CreatePlaybook {
        ob_configuration_id: ObConfigurationId,
    },
    DisablePlaybook,
    ManuallyReviewEntity {
        decision_status: DecisionStatus,
        fp_id: FpId,
    },
    EditPlaybook {
        ob_configuration_id: ObConfigurationId,
    },
    DeactivateOrgRole {
        tenant_role_id: TenantRoleId,
        role_name: String,
        scopes: Vec<TenantScope>,
    },
    OrgMemberJoined {
        tenant_role: crate::OrganizationRole,
        first_name: Option<String>,
        last_name: Option<String>,
        email: OrgMemberEmail,
    },
}

#[derive(Debug, Clone, Serialize, Apiv2Schema)]
pub struct AuditEventApiKey {
    pub id: TenantApiKeyId,
    pub name: String,
    pub role: crate::OrganizationRole,
}


#[derive(Debug, Clone, Serialize, Apiv2Schema)]
pub struct AuditEventOrgMember {
    pub id: TenantUserId,
    pub first_name: Option<String>,
    pub last_name: Option<String>,
    pub email: OrgMemberEmail,
}
