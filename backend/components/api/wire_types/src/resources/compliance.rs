use newtypes::TenantCompliancePartnershipId;

use crate::*;

#[derive(Debug, Clone, Eq, PartialEq, Serialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub struct ComplianceCompanySummary {
    pub partnership_id: TenantCompliancePartnershipId,
    pub company_name: String,
    pub num_controls_complete: i64,
    pub num_controls_total: i64,
    pub num_active_playbooks: i64,
}
