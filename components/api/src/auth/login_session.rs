use super::AuthError;
use crate::errors::ApiError;
use actix_session::Session;
use actix_web::FromRequest;
use chrono::NaiveDateTime;
use futures_util::Future;
use paperclip::actix::Apiv2Security;
use serde::{Deserialize, Serialize};
use std::pin::Pin;

#[derive(Debug, Clone, Apiv2Security)]
#[openapi(
    apiKey,
    in = "header",
    name = "Cookie",
    description = "Identify session state cookie, set by calls to /identify"
)]
/// LoginSessionContext stores encrypted state for the challenge issued to the user during the
/// process of logging them in.
pub struct LoginSessionContext {
    pub challenge_state: ChallengeState,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChallengeState {
    pub phone_number: String,
    pub h_code: Vec<u8>,
    pub created_at: NaiveDateTime,
}

impl ChallengeState {
    pub const COOKIE_NAME: &'static str = "login_session";

    pub fn get(session: &Session) -> Result<Self, AuthError> {
        session
            .get(Self::COOKIE_NAME)
            .map_err(AuthError::InvalidSessionJson)?
            .ok_or(AuthError::MissingSessionTokenCookie)
    }

    pub fn set(self, session: &Session) -> Result<(), AuthError> {
        session
            .insert(Self::COOKIE_NAME, self)
            .map_err(AuthError::InvalidSessionJson)
    }
}

impl FromRequest for LoginSessionContext {
    type Error = ApiError;
    type Future = Pin<Box<dyn Future<Output = Result<Self, Self::Error>>>>;

    fn from_request(
        req: &actix_web::HttpRequest,
        _payload: &mut actix_web::dev::Payload,
    ) -> Self::Future {
        let session = Session::extract(req);

        Box::pin(async move {
            let session = session.await.map_err(AuthError::SessionError)?;
            let challenge_state = ChallengeState::get(&session)?;

            Ok(Self { challenge_state })
        })
    }
}
