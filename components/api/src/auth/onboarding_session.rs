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
    description = "Onboarding session state cookie, set by successful call to /verify"
)]
/// Onboarding session context sets encrpyted state that authenticates the client and allows hte
/// server to quickly look up the relavant user information
pub struct OnboardingSessionContext {
    user_vault: UserVault,
    onboarding: Onboarding,
    pub session_id: String,
}

impl OnboardingSessionContext {
    pub const SESSION_TOKEN_NAME: &'static str = "ob_session_tok";

    pub fn user_vault(&self) -> &UserVault {
        &self.user_vault
    }

    pub fn onboarding(&self) -> &Onboarding {
        &self.onboarding
    }

    pub fn set(session: &Session, token: String) -> Result<(), AuthError> {
        session
            .insert(Self::SESSION_TOKEN_NAME, token)
            .map_err(AuthError::InvalidSessionJson)
    }
}

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
                .get(Self::SESSION_TOKEN_NAME)
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
                session_id,
            })
        })
    }
}
