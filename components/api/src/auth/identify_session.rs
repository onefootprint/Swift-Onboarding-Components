use super::AuthError;
use crate::{errors::ApiError, State};
use actix_session::Session;
use actix_web::{web, FromRequest};
use db::models::session_data::{ChallengeData, SessionState};
use futures_util::Future;
use paperclip::actix::Apiv2Security;
use serde::{Deserialize, Serialize};
use std::pin::Pin;

#[derive(Debug, Clone, Apiv2Security)]
#[openapi(
    apiKey,
    in = "header",
    name = "Cookie",
    description = "Session state cookie"
)]
/// IdentifySessionContext extracts the ChallengeData from the session ID specified in the cookie sent by the client
pub struct IdentifySessionContext {
    pub challenge_data: ChallengeData,
    pub state: IdentifySessionState,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IdentifySessionState {
    pub session_id: String,
    pub user_identifier: String,
}

impl IdentifySessionState {
    pub const COOKIE_NAME: &'static str = "identify_session";

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
            let state = IdentifySessionState::get(&session)?;

            let session = db::session::get_by_session_id(&pool, state.session_id.clone()).await?;
            // Actually verify that the session is the correct type
            let challenge_data = match session.session_data {
                SessionState::IdentifySession(challenge_data) => Ok(challenge_data),
                _ => Err(AuthError::SessionTypeError),
            }?;

            Ok(Self {
                challenge_data,
                state,
            })
        })
    }
}
