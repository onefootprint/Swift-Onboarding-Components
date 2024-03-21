use newtypes::{
    ComplianceDocId, ComplianceDocStatus, ComplianceDocTemplateId, ComplianceDocTemplateVersionId,
    TenantCompliancePartnershipId,
};

use crate::*;

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
    pub status: ComplianceDocStatus,
    pub assigned_to: Option<LiteOrgMember>,
    pub last_updated: Option<DateTime<Utc>>,
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
    pub created_by_partner_tenant_user: LiteOrgMember,

    pub name: String,
    pub description: String,
}
