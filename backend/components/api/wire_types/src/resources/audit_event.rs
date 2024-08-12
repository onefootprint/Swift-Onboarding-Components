use crate::*;
use newtypes::AuditEventId;
use newtypes::AuditEventName;
use newtypes::DataIdentifier;
use newtypes::DecryptionContext;
use newtypes::FpId;
use newtypes::ListEntryCreationId;
use newtypes::ListEntryId;
use newtypes::ListId;
use newtypes::TenantId;
use strum_macros::Display;

/// Describes an event relevant to security as seen by tenants.
#[derive(Debug, Clone, Serialize, Apiv2Response, macros::JsonResponder)]
pub struct AuditEvent {
    pub id: AuditEventId,
    pub timestamp: DateTime<Utc>,
    pub tenant_id: TenantId,
    pub name: AuditEventName,
    pub principal: Actor,

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
    CreateListEntry {
        list_id: ListId,
        list_entry_creation_id: ListEntryCreationId,
    },
    DeleteListEntry {
        list_id: ListId,
        list_entry_id: ListEntryId,
    },
}
