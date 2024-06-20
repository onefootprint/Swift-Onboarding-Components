use super::AuthActor;
use super::PartnerTenantAuth;
use super::TenantAuth;
use crate::auth::Either;
use crate::errors::ApiResult;
use db::helpers::TenantOrPartnerTenantRef;
use newtypes::OrgIdentifierRef;

pub type TenantOrPartnerTenantAuth = Either<Box<dyn TenantAuth>, Box<dyn PartnerTenantAuth>>;

impl TenantOrPartnerTenantAuth {
    pub fn actor(&self) -> AuthActor {
        match &self {
            Either::Left(t) => t.actor(),
            Either::Right(pt) => pt.actor(),
        }
    }

    pub fn is_live(&self) -> ApiResult<bool> {
        Ok(match &self {
            Either::Left(t) => t.is_live()?,
            Either::Right(_) => true,
        })
    }

    pub fn org(&self) -> TenantOrPartnerTenantRef {
        match &self {
            Either::Left(t) => TenantOrPartnerTenantRef::Tenant(t.tenant()),
            Either::Right(pt) => TenantOrPartnerTenantRef::PartnerTenant(pt.partner_tenant()),
        }
    }

    pub fn org_identifier(&self) -> OrgIdentifierRef {
        match &self {
            Either::Left(t) => OrgIdentifierRef::TenantId(&t.tenant().id),
            Either::Right(pt) => OrgIdentifierRef::PartnerTenantId(&pt.partner_tenant().id),
        }
    }
}
