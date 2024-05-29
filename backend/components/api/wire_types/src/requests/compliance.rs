use crate::*;
use newtypes::{
    ComplianceDocReviewDecision,
    ComplianceDocSubmissionId,
    ComplianceDocTemplateVersionId,
    PartnerTenantId,
    PiiString,
    TenantId,
    TenantUserId,
};

#[derive(Debug, Clone, Eq, PartialEq, Deserialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub struct CompliancePartnershipRequest {
    pub partner_tenant_id: PartnerTenantId,
    pub tenant_id: TenantId,
}

pub type ListComplianceCompaniesResponse = Vec<ComplianceCompanySummary>;
pub type ListComplianceDocumentsResponse = Vec<ComplianceDocSummary>;
pub type ListComplianceDocTemplatesResponse = Vec<ComplianceDocTemplate>;

#[derive(Debug, Clone, Eq, PartialEq, Deserialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub struct CreateComplianceDocTemplateRequest {
    pub name: String,
    pub description: String,
}

#[derive(Debug, Clone, Eq, PartialEq, Deserialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub struct UpdateComplianceDocTemplateRequest {
    pub name: String,
    pub description: String,
}

#[derive(Debug, Clone, Eq, PartialEq, Deserialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub struct CreateComplianceDocRequest {
    pub template_version_id: Option<ComplianceDocTemplateVersionId>,
    pub name: String,
    pub description: String,
}

#[derive(Debug, Clone, Eq, PartialEq, Deserialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub struct ReuploadComplianceDocRequest {
    pub name: String,
    pub description: String,
}

#[derive(Debug, Clone, Eq, PartialEq, Deserialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub struct SubmitExternalUrlRequest {
    pub url: PiiString,
}

#[derive(Debug, Clone, Eq, PartialEq, Deserialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub struct CreateReviewRequest {
    pub submission_id: ComplianceDocSubmissionId,
    pub decision: ComplianceDocReviewDecision,
    pub note: String,
}

#[derive(Debug, Clone, Eq, PartialEq, Deserialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub struct UpdateComplianceDocAssignmentRequest {
    /// Pass none/null to unassign.
    pub user_id: Option<TenantUserId>,
}
