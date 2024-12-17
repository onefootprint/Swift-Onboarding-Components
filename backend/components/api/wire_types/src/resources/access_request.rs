use crate::*;
use chrono::DateTime;
use chrono::Utc;
use newtypes::OrgMemberEmail;
use newtypes::SuperAdminAccessRequestId;
use newtypes::TenantScope;

#[derive(Debug, Clone, Serialize, Apiv2Response, macros::JsonResponder)]
pub struct AccessRequest {
    pub id: SuperAdminAccessRequestId,
    pub requester: OrgMemberEmail,
    pub scopes: Vec<TenantScope>,
    pub created_at: DateTime<Utc>,
    pub expires_at: DateTime<Utc>,
    pub responder: Option<OrgMemberEmail>,
    pub responded_at: Option<DateTime<Utc>>,
    pub approved: Option<bool>,
    pub reason: Option<String>,
}
