use crate::*;
use newtypes::{PartnerTenantId, TenantId};

#[derive(Debug, Clone, Eq, PartialEq, Deserialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub struct CompliancePartnershipRequest {
    pub partner_tenant_id: PartnerTenantId,
    pub tenant_id: TenantId,
}

#[derive(Debug, Clone, Eq, PartialEq, Serialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub struct GetComplianceCompaniesResponse {
    pub companies: Vec<ComplianceCompanySummary>,
}
