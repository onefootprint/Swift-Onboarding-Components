#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum TenantKind {
    // A Footprint tenant for vaulting, KYC, etc.
    Tenant,
    // A Compliance Partner of a Tenant.
    PartnerTenant,
}
