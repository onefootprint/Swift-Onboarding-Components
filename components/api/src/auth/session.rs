use super::AuthError;
use crate::{errors::ApiError, State};
use actix_session::Session;
use actix_web::{web, FromRequest};
use db::models::session_data::{ChallengeData, SessionState};
use db::models::{onboardings::Onboarding, user_vaults::UserVault};
use futures_util::Future;
use paperclip::actix::Apiv2Security;
use std::pin::Pin;

const SESSION_TOKEN_NAME: &str = "ob_session_tok";
const IDENTIFIER_TOKEN_NAME: &str = "ob_identifier_tok";

pub fn set_identifier_cookie(session: &Session, identifier: String) -> Result<(), AuthError> {
    session
        .insert(IDENTIFIER_TOKEN_NAME, identifier)
        .map_err(AuthError::InvalidSessionJson)
}

pub fn set_token_cookie(session: &Session, token: String) -> Result<(), AuthError> {
    session
        .insert(SESSION_TOKEN_NAME, token)
        .map_err(AuthError::InvalidSessionJson)
}

#[derive(Debug, Clone, Apiv2Security)]
#[openapi(
    apiKey,
    in = "header",
    name = "Cookie",
    description = "Session state cookie"
)]
/// IdentifySessionContext extracts the ChallengeData from the session ID specified in the cookie sent by the client
pub struct IdentifySessionContext {
    h_session_id: String,
    challenge_data: ChallengeData,
    user_identifier: String,
}

impl IdentifySessionContext {
    pub fn h_session_id(&self) -> &str {
        &self.h_session_id
    }

    pub fn challenge_data(&self) -> &ChallengeData {
        &self.challenge_data
    }

    pub fn user_identifier(&self) -> &String {
        &self.user_identifier
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
                .get(SESSION_TOKEN_NAME)
                .map_err(AuthError::InvalidSessionJson)?
                .ok_or(AuthError::MissingSessionTokenCookie)?;

            let user_identifier: String = session
                .get(IDENTIFIER_TOKEN_NAME)
                .map_err(AuthError::InvalidSessionJson)?
                .ok_or(AuthError::MissingUserIdentifierCookie)?;

            println!("IN IDENTIFY CONTEXT {}", session_id);
            let session = db::session::get_by_session_id(&pool, session_id.clone()).await?;
            // Actually verify that the session is the correct type
            let challenge_data = if let SessionState::IdentifySession(challenge_data) =
                session.session_data.clone()
            {
                Ok(challenge_data)
            } else {
                Err(AuthError::SessionTypeError)
            }?;

            Ok(Self {
                h_session_id: session.h_session_id,
                challenge_data,
                user_identifier,
            })
        })
    }
}

#[derive(Debug, Clone, Apiv2Security)]
#[openapi(
    apiKey,
    in = "header",
    name = "Cookie",
    description = "Session state cookie"
)]
/// LoggedInSessionContext extracts the UserVault and Onboarding from the session ID specified in the cookie sent by the client.
/// Only a LoggedInSession is attached to a UserVault and an Onboarding
pub struct LoggedInSessionContext {
    user_vault: UserVault,
    onboarding: Onboarding,
}

impl LoggedInSessionContext {
    pub fn user_vault(&self) -> &UserVault {
        &self.user_vault
    }

    pub fn onboarding(&self) -> &Onboarding {
        &self.onboarding
    }
}

impl FromRequest for LoggedInSessionContext {
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

            println!("HELLO super before loading {}", session_id);
            let session = db::session::get_by_session_id(&pool, session_id.clone()).await?;
            // Actually verify that the session is the correct type
            if let SessionState::LoggedInSession(_) = session.session_data.clone() {
                Ok(())
            } else {
                Err(AuthError::SessionTypeError)
            }?;
            println!("HELLO before loading");
            let onboarding = db::onboarding::get_by_session_id(&pool, session_id.clone()).await?;
            println!("HELLO mid loading");
            let user_vault = db::user_vault::get(&pool, onboarding.user_vault_id.clone()).await?;
            println!("HELLO after loading");

            Ok(Self {
                user_vault,
                onboarding,
            })
        })
    }
}
