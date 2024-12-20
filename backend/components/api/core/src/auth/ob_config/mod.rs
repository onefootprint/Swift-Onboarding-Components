mod bo_session;
mod ob_public_key;
mod pb_token;

use super::session::user::NewUserSessionContext;
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

    /// Computes all arguments on NewUserSessionContext that do not pertain to the user. These are
    /// the fields that originate from ObConfigAuth.
    pub fn ob_config_auth_context(&self) -> NewUserSessionContext {
        let (bo_id, sb_id, biz_wf_id) = match self {
            Either::Right(Either::Right(bo_session)) => (
                Some(bo_session.bo.id.clone()),
                Some(bo_session.sb.id.clone()),
                Some(bo_session.data.data.biz_wf_id.clone()),
            ),
            _ => Default::default(),
        };
        let metadata = match self {
            Either::Right(Either::Left(ob_session)) => Some(ob_session.data.data.trusted_metadata.clone()),
            _ => None,
        };
        NewUserSessionContext {
            obc_id: Some(self.ob_config().id.clone()),
            // Business info
            sb_id,
            bo_id,
            biz_wf_id,
            // Metadata, from onboarding session tokens
            metadata,
            // We omit any user fields
            su_id: None,
            ..Default::default()
        }
    }
}
