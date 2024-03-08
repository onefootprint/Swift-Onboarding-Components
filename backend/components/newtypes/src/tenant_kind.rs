use crate::TenantOrPartnerTenantId;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum TenantKind {
    // A Footprint tenant for vaulting, KYC, etc.
    Tenant,
    // A Compliance Partner of a Tenant.
    PartnerTenant,
}

impl<'a> From<TenantOrPartnerTenantId<'a>> for TenantKind {
    fn from(value: TenantOrPartnerTenantId<'a>) -> Self {
        match value {
            TenantOrPartnerTenantId::TenantId(_) => TenantKind::Tenant,
            TenantOrPartnerTenantId::PartnerTenantId(_) => TenantKind::PartnerTenant,
        }
    }
}
