use std::{marker::PhantomData, pin::Pin};

use actix_web::{http::header::HeaderMap, web, FromRequest};
use chrono::{DateTime, Utc};
use crypto::aead::ScopedSealingKey;
use db::PgConnection;
use futures_util::Future;
use newtypes::{PiiString, SessionAuthToken};
use paperclip::actix::Apiv2Security;

use crate::{
    errors::{ApiError, ApiResult},
    utils::session::AuthSession,
    State,
};

use super::{AuthSessionData, ExtractableAuthSession};
use crate::auth::AuthError;

/// Abstract Session Context Type
#[derive(Debug, Clone, Apiv2Security)]
#[openapi(apiKey, description = "Session authentication key")]
pub struct SessionContext<T> {
    pub data: T,
    pub auth_token: SessionAuthToken,
    pub headers: MaskedHeaderMap,
    session: AuthSession,
    // prevents external construction
    pub(super) phantom: PhantomData<()>,
}

impl<T> SessionContext<T> {
    pub fn expires_at(&self) -> DateTime<Utc> {
        self.session.expires_at
    }
}

pub trait AllowSessionUpdate {}

impl<T> SessionContext<T>
where
    T: AllowSessionUpdate,
{
    /// Replace the session data for the session used to authenticate this SessionContext with the
    /// new provided data
    pub fn update_session(
        self, // Intentionally consume to prevent reading stale value
        conn: &mut PgConnection,
        session_sealing_key: &ScopedSealingKey,
        data: AuthSessionData,
    ) -> ApiResult<()> {
        self.session.update(conn, session_sealing_key, data)?;
        Ok(())
    }
}

#[derive(Clone)]
pub struct MaskedHeaderMap(pub(in super::super) HeaderMap);

impl std::fmt::Debug for MaskedHeaderMap {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str("<redacted>")
    }
}

impl<T> FromRequest for SessionContext<T>
where
    T: ExtractableAuthSession,
{
    type Error = ApiError;
    type Future = Pin<Box<dyn Future<Output = Result<Self, Self::Error>>>>;

    fn from_request(req: &actix_web::HttpRequest, _payload: &mut actix_web::dev::Payload) -> Self::Future {
        #[allow(clippy::unwrap_used)]
        let state = req.app_data::<web::Data<State>>().unwrap().clone();

        let allowed_headers = T::header_names().join(", "); // Temporary
        let auth_token = T::header_names()
            .into_iter()
            .filter_map(|h| req.headers().get(h))
            .next()
            .and_then(|hv| hv.to_str().map(PiiString::from).ok())
            .ok_or_else(|| AuthError::MissingHeader(allowed_headers.clone()));
        let headers = req.headers().clone();

        Box::pin(async move {
            let auth_token = SessionAuthToken::from(auth_token?);

            let session = AuthSession::get(&state, &auth_token)
                .await?
                .ok_or(AuthError::NoSessionFound)?;

            // Explicit type annotation here (T:: try_from) automatically ensures that a malicious user
            // cannot re-use session tokens for different purposes -- the API endpoints declare the session type "T"
            // that they allow (example: UserSession<OnboardingSessionData>)
            // and if the session associated with the token cannot be converted to type T (in this case, OnboardingSession)
            // we fail
            let raw_session_data = session.data.clone();
            let parsed_session_data = state
                .db_pool
                .db_query(move |conn| {
                    T::try_from(raw_session_data, conn)
                        .map_err(|_| AuthError::InvalidTokenForHeader(allowed_headers))
                })
                .await??;
            Ok(Self {
                data: parsed_session_data,
                auth_token,
                headers: MaskedHeaderMap(headers),
                session,
                phantom: PhantomData,
            })
        })
    }
}

impl<A> SessionContext<A> {
    pub fn map<B, F>(self, f: F) -> SessionContext<B>
    where
        F: FnOnce(A) -> B,
    {
        let SessionContext {
            data,
            auth_token,
            headers,
            session,
            phantom,
        } = self;
        SessionContext {
            data: f(data),
            auth_token,
            headers,
            session,
            phantom,
        }
    }
}
