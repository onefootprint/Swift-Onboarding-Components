mod bo_session;
mod ob_public_key;
mod pb_token;

use super::Either;
pub use bo_session::*;
use db::models::business_owner::BusinessOwner;
use db::models::ob_configuration::ObConfiguration;
use db::models::tenant::Tenant;
pub use ob_public_key::*;
pub use pb_token::ObSessionAuth;

/// Auth extractor for any header that uniquely identifies an onboarding configuration
pub type ObConfigAuth = Either<PublicOnboardingContext, Either<ObSessionAuth, BoSessionAuth>>;

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
    pub fn secondary_business_owner(&self) -> Option<&BusinessOwner> {
        match self {
            Either::Right(Either::Right(a)) => Some(&a.bo),
            _ => None,
        }
    }
}
