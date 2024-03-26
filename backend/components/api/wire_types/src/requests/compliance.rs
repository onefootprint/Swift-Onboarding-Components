use crate::*;
use newtypes::{ComplianceDocTemplateVersionId, PartnerTenantId, TenantId};

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
