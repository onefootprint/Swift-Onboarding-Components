use std::pin::Pin;

use actix_session::Session;
use actix_web::{web, FromRequest};
use futures_util::Future;
use paperclip::actix::Apiv2Security;
use serde::{Deserialize, Serialize};

use crate::{errors::ApiError, State};

use crate::auth::AuthError;

#[derive(Debug, Clone, Apiv2Security)]
#[openapi(
    apiKey,
    in = "header",
    name = "Cookie",
    description = "Session state cookie"
)]
pub struct LivenessVerificationAuthContext {
    _session_info: db::models::sessions::Session,
    pub local_state: WebAuthnCookieSessionState,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WebAuthnCookieSessionState {
    pub session_id: String,
    pub user_vault_id: String,
    pub state: WebAuthnState,
}

impl WebAuthnCookieSessionState {
    pub const COOKIE_NAME: &'static str = "liveness_session";

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

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum WebAuthnState {
    Register(RegisterState),
    Auth(AuthState),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum RegisterState {
    NotStarted,
    RegisterChallenge(webauthn_rs::RegistrationState),
    RegisterSuccess,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AuthState {
    NotStarted,
    AuthChallenge(webauthn_rs::AuthenticationState),
    AuthSuccess,
}

impl FromRequest for LivenessVerificationAuthContext {
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
            let local_state = WebAuthnCookieSessionState::get(&session)?;

            let session_info =
                db::session::get_by_session_id(&pool, local_state.session_id.clone()).await?;

            Ok(Self {
                _session_info: session_info,
                local_state,
            })
        })
    }
}
