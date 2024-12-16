mod bo_session;
mod ob_public_key;
mod pb_token;

use super::session::identify::BusinessInfo;
use super::session::onboarding::OnboardingSessionTrustedMetadata;
use super::Either;
pub use bo_session::*;
use db::models::ob_configuration::ObConfiguration;
use db::models::playbook::Playbook;
use db::models::tenant::Tenant;
pub use ob_public_key::*;
pub use pb_token::ObSessionAuth;

/// Auth extractor for any header that uniquely identifies an onboarding configuration
pub type ObConfigAuth = Either<PublicOnboardingContext, Either<ObSessionAuth, BoSessionAuth>>;

impl ObConfigAuth {
    /// The playbook associated with this auth method
    pub fn playbook(&self) -> &Playbook {
        match self {
            Either::Left(a) => &a.playbook,
            Either::Right(Either::Left(a)) => &a.playbook,
            Either::Right(Either::Right(a)) => &a.playbook,
        }
    }
}


pub trait ObConfigAuthTrait: Send + 'static {
    /// The ob configuration associated with this auth method
    fn ob_config(&self) -> &ObConfiguration;

    /// The tenant associated with this auth method
    fn tenant(&self) -> &Tenant;

    /// Returns onboarding session metadata, if the current `ObConfigAuth` is an onboarding session
    /// token.
    fn trusted_metadata(&self) -> Option<OnboardingSessionTrustedMetadata>;

    /// Info on the business for secondary BO flows.
    fn business_info(&self) -> Option<BusinessInfo>;
}

impl ObConfigAuthTrait for ObConfigAuth {
    fn ob_config(&self) -> &ObConfiguration {
        match self {
            Either::Left(a) => &a.ob_config,
            Either::Right(Either::Left(a)) => &a.ob_config,
            Either::Right(Either::Right(a)) => &a.ob_config,
        }
    }

    fn tenant(&self) -> &Tenant {
        match self {
            Either::Left(a) => &a.tenant,
            Either::Right(Either::Left(a)) => &a.tenant,
            Either::Right(Either::Right(a)) => &a.tenant,
        }
    }

    fn trusted_metadata(&self) -> Option<OnboardingSessionTrustedMetadata> {
        match self {
            Either::Right(Either::Left(a)) => Some(a.data.data.trusted_metadata.clone()),
            _ => None,
        }
    }

    fn business_info(&self) -> Option<BusinessInfo> {
        match self {
            Either::Right(Either::Right(a)) => {
                let info = BusinessInfo {
                    bo_id: a.bo.id.clone(),
                    bv_id: a.bo.business_vault_id.clone(),
                    biz_wf_id: a.data.data.biz_wf_id.clone(),
                };
                Some(info)
            }
            _ => None,
        }
    }
}
