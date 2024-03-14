use crate::*;
use newtypes::{PartnerTenantId, TenantId};

#[derive(Debug, Clone, Eq, PartialEq, Deserialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub struct CompliancePartnershipRequest {
    pub partner_tenant_id: PartnerTenantId,
    pub tenant_id: TenantId,
}
