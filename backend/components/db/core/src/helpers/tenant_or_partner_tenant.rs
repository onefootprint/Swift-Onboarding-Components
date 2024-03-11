use crate::{
    models::{partner_tenant::PartnerTenant, tenant::Tenant},
    DbError,
};
use derive_more::From;
use newtypes::{TenantKind, TenantOrPartnerTenantId};

#[derive(Debug, Clone, From)]
#[allow(clippy::large_enum_variant)]
pub enum TenantOrPartnerTenant {
    Tenant(Tenant),
    PartnerTenant(PartnerTenant),
}

impl TenantOrPartnerTenant {
    pub fn id(&self) -> TenantOrPartnerTenantId<'_> {
        match self {
            TenantOrPartnerTenant::Tenant(t) => (&t.id).into(),
            TenantOrPartnerTenant::PartnerTenant(pt) => (&pt.id).into(),
        }
    }
}

impl From<TenantOrPartnerTenant> for TenantKind {
    fn from(value: TenantOrPartnerTenant) -> Self {
        match value {
            TenantOrPartnerTenant::Tenant(_) => TenantKind::Tenant,
            TenantOrPartnerTenant::PartnerTenant(_) => TenantKind::PartnerTenant,
        }
    }
}

impl TryFrom<(Option<Tenant>, Option<PartnerTenant>)> for TenantOrPartnerTenant {
    type Error = DbError;

    fn try_from(value: (Option<Tenant>, Option<PartnerTenant>)) -> Result<Self, Self::Error> {
        let ret = match value {
            (Some(tenant), None) => TenantOrPartnerTenant::Tenant(tenant),
            (None, Some(partner_tenant)) => TenantOrPartnerTenant::PartnerTenant(partner_tenant),
            _ => {
                return Err(DbError::AssertionError(
                    "tenant and partner tenant options are mutually exclusive".to_owned(),
                ))
            }
        };
        Ok(ret)
    }
}
