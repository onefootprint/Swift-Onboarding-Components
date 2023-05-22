use newtypes::{TenantId, TenantRolebindingId, TenantUserId};
use paperclip::actix::Apiv2Schema;

#[derive(serde::Serialize, serde::Deserialize, Debug, Clone)]
/// Basic auth used for dashboard sessions - this represents an authenticated TenantUser at a
/// single Tenant
pub struct TenantRbSession {
    pub tenant_rolebinding_id: TenantRolebindingId,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
/// Represents a session where a footprint employee is logged in to assume another tenant
pub struct FirmEmployeeSession {
    /// The TenantUserId that is proven to be owned via a workos auth.
    /// Must be a TenantUser with is_firm_employee=true
    pub tenant_user_id: TenantUserId,
    /// The TenantId whose role is being assumed by this firm employee
    pub tenant_id: TenantId,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, Apiv2Schema)]
/// Represents a session where a user has logged in but is part of multiple tenants and hasn't yet
/// selected the tenant whose dashboard they want to view
pub struct WorkOsSession {
    /// The TenantUserId that is proven to be owned via a workos auth
    pub tenant_user_id: TenantUserId,
}
