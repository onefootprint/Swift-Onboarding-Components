mod bo_session;
mod ob_public_key;
mod ob_session;

pub use bo_session::*;
pub use ob_public_key::*;
pub use ob_session::*;

use super::Either;
use db::models::{
    business_owner::BusinessOwner, ob_configuration::ObConfiguration, tenant::Tenant,
};

/// Auth extractor for any header that uniquely identifies an onboarding configuration
pub type ObConfigAuth = Either<PublicOnboardingContext, Either<ObPkSessionAuth, BoSessionAuth>>;

impl ObConfigAuth {
    /// The ob configuration associated with this auth method
    pub fn ob_config(&self) -> &ObConfiguration {
        match self {
            Either::Left(a) => &a.ob_config,
            Either::Right(Either::Left(a)) => &a.ob_config,
            Either::Right(Either::Right(a)) => &a.ob_config,
        }
    }

    /// The tenant associated with this auth method
    pub fn tenant(&self) -> &Tenant {
        match self {
            Either::Left(a) => &a.tenant,
            Either::Right(Either::Left(a)) => &a.tenant,
            Either::Right(Either::Right(a)) => &a.tenant,
        }
    }

    /// The BusinessOwner associated with this auth session. Only non-null for BoSessionAuth
    pub fn business_owner(&self) -> Option<&BusinessOwner> {
        match self {
            Either::Right(Either::Right(a)) => Some(&a.bo),
            _ => None,
        }
    }
}
