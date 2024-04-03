use crate::*;
use newtypes::{
    ComplianceDocId, ComplianceDocRequestId, ComplianceDocReviewDecision, ComplianceDocReviewId,
    ComplianceDocStatus, ComplianceDocSubmissionId, ComplianceDocTemplateId, ComplianceDocTemplateVersionId,
    PiiString, TenantCompliancePartnershipId, TenantKind,
};
use serde_with::SerializeDisplay;
use strum::EnumDiscriminants;

#[derive(Debug, Clone, Eq, PartialEq, Serialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub struct ComplianceCompanySummary {
    pub id: TenantCompliancePartnershipId,
    pub company_name: String,
    pub num_controls_complete: i64,
    pub num_controls_total: i64,
    pub num_active_playbooks: i64,
}

#[derive(Debug, Clone, Eq, PartialEq, Serialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub struct ComplianceDocSummary {
    pub id: ComplianceDocId,
    pub name: String,
    pub description: String,
    pub status: ComplianceDocStatus,
    pub partner_tenant_assignee: Option<LiteOrgMember>,
    pub tenant_assignee: Option<LiteOrgMember>,
    pub last_updated: Option<DateTime<Utc>>,

    pub active_request_id: Option<ComplianceDocRequestId>,
    pub active_submission_id: Option<ComplianceDocSubmissionId>,
    pub active_review_id: Option<ComplianceDocReviewId>,

    pub template_id: Option<ComplianceDocTemplateId>,
}

#[derive(Debug, Clone, Eq, PartialEq, Serialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub struct ComplianceDocTemplate {
    pub id: ComplianceDocTemplateId,
    pub latest_version: ComplianceDocTemplateVersion,
}

#[derive(Debug, Clone, Eq, PartialEq, Serialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub struct ComplianceDocTemplateVersion {
    pub id: ComplianceDocTemplateVersionId,
    pub template_id: ComplianceDocTemplateId,

    pub created_at: DateTime<Utc>,
    pub created_by_partner_tenant_user: Option<LiteOrgMember>,

    pub name: String,
    pub description: String,
}

#[derive(Debug, Clone, Eq, PartialEq, Serialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub struct ComplianceDocRequest {
    pub id: ComplianceDocRequestId,
    pub created_at: DateTime<Utc>,
    pub name: String,
    pub description: String,
    pub requested_by_partner_tenant_user: LiteOrgMember,
    pub compliance_doc_id: ComplianceDocId,
}

#[derive(Debug, Clone, Eq, PartialEq, Serialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub struct ComplianceDocEvent {
    pub timestamp: DateTime<Utc>,
    pub actor: LiteUserAndOrg,
    pub event: ComplianceDocEventType,
}

#[derive(Debug, Clone, Eq, PartialEq, Serialize, Apiv2Schema, macros::SerdeAttr)]
#[serde(rename_all = "snake_case")]
#[serde(tag = "kind", content = "data")]
pub enum ComplianceDocEventType {
    Requested(ComplianceDocEventRequested),
    RequestRetracted {},
    Submitted(ComplianceDocEventSubmitted),
    Reviewed(ComplianceDocEventReviewed),
    Assigned(ComplianceDocEventAssigned),
}

#[derive(Debug, Clone, Eq, PartialEq, Serialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub struct ComplianceDocEventRequested {
    pub template_id: Option<ComplianceDocTemplateId>,

    pub name: String,
    pub description: String,
}

#[derive(Debug, Clone, Eq, PartialEq, Serialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub struct ComplianceDocEventSubmitted {
    pub submission_id: ComplianceDocSubmissionId,
    pub kind: ComplianceDocDataKind,
}

#[derive(Debug, Clone, Eq, PartialEq, Serialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub struct ComplianceDocEventReviewed {
    pub decision: ComplianceDocReviewDecision,
    pub note: String,
}

#[derive(Debug, Clone, Eq, PartialEq, Serialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub struct ComplianceDocEventAssigned {
    pub kind: TenantKind,

    /// None if the doc is unassigned.
    pub assigned_to: Option<LiteUserAndOrg>,
}

#[derive(Debug, Clone, Eq, PartialEq, Serialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub struct ComplianceDocSubmission {
    pub id: ComplianceDocSubmissionId,
    pub created_at: DateTime<Utc>,
    pub data: ComplianceDocData,
}

#[derive(Debug, Clone, Eq, PartialEq, Apiv2Schema, Serialize, EnumDiscriminants, macros::SerdeAttr)]
#[strum_discriminants(
    name(ComplianceDocDataKind),
    vis(pub),
    derive(Display, SerializeDisplay, Apiv2Schema, macros::SerdeAttr),
    serde(rename_all = "snake_case"),
    strum(serialize_all = "snake_case")
)]
#[serde(rename_all = "snake_case")]
#[serde(tag = "kind", content = "data")]
pub enum ComplianceDocData {
    ExternalUrl { url: PiiString },
    FileUpload { filename: String, data: PiiString },
}

impl From<&newtypes::ComplianceDocData> for ComplianceDocDataKind {
    fn from(data: &newtypes::ComplianceDocData) -> Self {
        match data {
            newtypes::ComplianceDocData::ExternalUrl { .. } => ComplianceDocDataKind::ExternalUrl,
            newtypes::ComplianceDocData::SealedUpload { .. } => ComplianceDocDataKind::FileUpload,
        }
    }
}
