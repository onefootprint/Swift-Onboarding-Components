mod ob_public_key;
mod ob_session;

use db::models::{ob_configuration::ObConfiguration, tenant::Tenant};
pub use ob_public_key::*;
pub use ob_session::*;

use super::{Either, SessionContext};

/// Auth extractor for a short-lived session that represents the onboarding
pub type ObPkSessionAuth = SessionContext<ParsedOnboardingSession>;

/// Auth extractor for methods that
pub type ObPkAuth = Either<PublicOnboardingContext, ObPkSessionAuth>;

impl ObPkAuth {
    pub fn ob_config(&self) -> &ObConfiguration {
        match self {
            Either::Left(l) => &l.ob_config,
            Either::Right(r) => &r.data.ob_config,
        }
    }

    pub fn tenant(&self) -> &Tenant {
        match self {
            Either::Left(l) => &l.tenant,
            Either::Right(r) => &r.data.tenant,
        }
    }
}
