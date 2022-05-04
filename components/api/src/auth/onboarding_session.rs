use super::AuthError;
use crate::{errors::ApiError, State};
use actix_session::Session;
use actix_web::{web, FromRequest};
use db::models::session_data::SessionState;
use db::models::{onboardings::Onboarding, user_vaults::UserVault};
use futures_util::Future;
use paperclip::actix::Apiv2Security;
use std::pin::Pin;

#[derive(Debug, Clone, Apiv2Security)]
#[openapi(
    apiKey,
    in = "header",
    name = "Cookie",
    description = "Session state cookie"
)]
/// LoggedInSessionContext extracts the UserVault and Onboarding from the session ID specified in the cookie sent by the client.
/// Only a LoggedInSession is attached to a UserVault and an Onboarding
pub struct OnboardingSessionContext {
    user_vault: UserVault,
    onboarding: Onboarding,
}

impl OnboardingSessionContext {
    pub fn user_vault(&self) -> &UserVault {
        &self.user_vault
    }

    pub fn onboarding(&self) -> &Onboarding {
        &self.onboarding
    }
}

const SESSION_TOKEN_NAME: &str = "ob_session_tok";

impl FromRequest for OnboardingSessionContext {
    type Error = ApiError;
    type Future = Pin<Box<dyn Future<Output = Result<Self, Self::Error>>>>;

    fn from_request(
        req: &actix_web::HttpRequest,
        _payload: &mut actix_web::dev::Payload,
    ) -> Self::Future {
        let session = Session::extract(req);
        let pool = req.app_data::<web::Data<State>>().unwrap().db_pool.clone();

        Box::pin(async move {
            let session = session.await.map_err(AuthError::SessionError)?;

            let session_id: String = session
                .get(SESSION_TOKEN_NAME)
                .map_err(AuthError::InvalidSessionJson)?
                .ok_or(AuthError::MissingSessionTokenCookie)?;

            let session = db::session::get_by_session_id(&pool, session_id.clone()).await?;
            // Actually verify that the session is the correct type
            if let SessionState::OnboardingSession(_) = session.session_data.clone() {
                Ok(())
            } else {
                Err(AuthError::SessionTypeError)
            }?;
            let onboarding = db::onboarding::get_by_session_id(&pool, session_id.clone()).await?;
            let user_vault = db::user_vault::get(&pool, onboarding.user_vault_id.clone()).await?;

            Ok(Self {
                user_vault,
                onboarding,
            })
        })
    }
}
