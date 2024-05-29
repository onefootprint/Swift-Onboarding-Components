use crate::helpers::WorkosAuthIdentity;
use crate::models::partner_tenant::PartnerTenant;
use crate::models::tenant::Tenant;
use crate::DbError;
use derive_more::From;
use newtypes::{
    OrgIdentifierRef,
    TenantKind,
};

#[derive(Debug, Clone, From)]
#[allow(clippy::large_enum_variant)]
pub enum TenantOrPartnerTenant {
    Tenant(Tenant),
    PartnerTenant(PartnerTenant),
}

impl TenantOrPartnerTenant {
    pub fn id(&self) -> OrgIdentifierRef<'_> {
        match self {
            TenantOrPartnerTenant::Tenant(t) => (&t.id).into(),
            TenantOrPartnerTenant::PartnerTenant(pt) => (&pt.id).into(),
        }
    }
}

#[derive(Debug, Clone, Copy, From)]
pub enum TenantOrPartnerTenantRef<'a> {
    Tenant(&'a Tenant),
    PartnerTenant(&'a PartnerTenant),
}

impl<'a> TenantOrPartnerTenantRef<'a> {
    pub fn id(&self) -> OrgIdentifierRef<'_> {
        match self {
            TenantOrPartnerTenantRef::Tenant(t) => (&t.id).into(),
            TenantOrPartnerTenantRef::PartnerTenant(pt) => (&pt.id).into(),
        }
    }
}

impl From<&TenantOrPartnerTenant> for TenantKind {
    fn from(value: &TenantOrPartnerTenant) -> Self {
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

impl WorkosAuthIdentity for TenantOrPartnerTenant {
    fn supports_auth_method(&self, auth_method: newtypes::WorkosAuthMethod) -> bool {
        match self {
            TenantOrPartnerTenant::Tenant(tenant) => tenant.supports_auth_method(auth_method),
            TenantOrPartnerTenant::PartnerTenant(partner_tenant) => {
                partner_tenant.supports_auth_method(auth_method)
            }
        }
    }
}
