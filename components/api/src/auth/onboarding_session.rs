use std::pin::Pin;

use actix_session::Session;
use actix_web::{web, FromRequest};
use db::models::{onboardings::Onboarding, user_vaults::UserVault};
use futures_util::Future;
use paperclip::actix::Apiv2Security;

use crate::{errors::ApiError, State};

use super::AuthError;

#[derive(Debug, Clone, Apiv2Security)]
#[openapi(
    apiKey,
    in = "header",
    name = "Cookie",
    description = "Session state cookie"
)]
pub struct OnboardingSessionContext {
    user_vault: UserVault,
    onboarding: Onboarding,
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

            let token: String = session
                .get(Self::SESSION_TOKEN_NAME)
                .map_err(AuthError::InvalidSessionJson)?
                .ok_or(AuthError::MissingOnboardingSessionToken)?;

            let (user_vault, auth_token) = db::user_vault::get_by_token(&pool, token).await?;
            let onboarding =
                db::onboarding::get_onboarding_by_token(&pool, auth_token.h_token).await?;
            Ok(Self {
                user_vault,
                onboarding,
            })
        })
    }
}
