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
pub struct IdentifySessionContext {
    user_vault: UserVault,
    onboarding: Onboarding,
    session_info: db::models::sessions::Session,
    user_identifier: String,
}

impl IdentifySessionContext {
    pub const SESSION_TOKEN_NAME: &'static str = "ob_session_tok";
    pub const IDENTIFIER_TOKEN_NAME: &'static str = "ob_identifier_tok";

    pub fn session_info(&self) -> &db::models::sessions::Session {
        &self.session_info
    }
    pub fn user_vault(&self) -> &UserVault {
        &self.user_vault
    }
    pub fn onboarding(&self) -> &Onboarding {
        &self.onboarding
    }

    pub fn user_identifier(&self) -> &String {
        &self.user_identifier
    }

    pub fn set_identifier(session: &Session, identifier: String) -> Result<(), AuthError> {
        session
            .insert(Self::IDENTIFIER_TOKEN_NAME, identifier)
            .map_err(AuthError::InvalidSessionJson)
    }

    pub fn set_token(session: &Session, token: String) -> Result<(), AuthError> {
        session
            .insert(Self::SESSION_TOKEN_NAME, token)
            .map_err(AuthError::InvalidSessionJson)
    }
}

impl FromRequest for IdentifySessionContext {
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
                .ok_or(AuthError::MissingOnboardingSessionToken)?;

            let user_identifier: String = session
                .get(Self::IDENTIFIER_TOKEN_NAME)
                .map_err(AuthError::InvalidSessionJson)?
                .ok_or(AuthError::MissingOnboardingSessionToken)?;

            let onboarding = db::onboarding::get_by_session_id(&pool, session_id.clone()).await?;
            let user_vault = db::user_vault::get(&pool, onboarding.user_vault_id.clone()).await?;
            let session_info = db::session::get_by_session_id(&pool, session_id.clone()).await?;
            Ok(Self {
                user_vault,
                onboarding,
                session_info,
                user_identifier,
            })
        })
    }
}
