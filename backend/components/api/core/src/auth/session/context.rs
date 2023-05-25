use super::{AllowSessionUpdate, ExtractableAuthSession, GetSessionForUpdate};
use crate::auth::AuthError;
use crate::{errors::ApiError, utils::session::AuthSession, State};
use actix_web::{http::header::HeaderMap, web, FromRequest};
use chrono::{DateTime, Utc};
use derive_more::Deref;
use futures_util::Future;
use newtypes::{PiiString, SessionAuthToken};
use paperclip::actix::OperationModifier;
use paperclip::v2::models::{DefaultSchemaRaw, Parameter, SecurityScheme};
use paperclip::v2::schema::Apiv2Schema;
use std::{marker::PhantomData, pin::Pin};

/// Abstract Session Context Type
#[derive(Debug, Clone, Deref)]
pub struct SessionContext<T> {
    #[deref]
    pub data: T,
    pub auth_token: SessionAuthToken,
    pub headers: MaskedHeaderMap,
    session: AuthSession,
    // prevents external construction
    pub(super) phantom: PhantomData<()>,
}

// Pass along T's implementation of ApiV2Schema for SessionContext<T>
impl<T: Apiv2Schema> Apiv2Schema for SessionContext<T> {
    fn name() -> Option<String> {
        T::name()
    }

    fn description() -> &'static str {
        T::description()
    }

    fn required() -> bool {
        T::required()
    }

    fn raw_schema() -> DefaultSchemaRaw {
        T::raw_schema()
    }

    fn schema_with_ref() -> DefaultSchemaRaw {
        T::schema_with_ref()
    }

    fn security_scheme() -> Option<SecurityScheme> {
        T::security_scheme()
    }

    fn header_parameter_schema() -> Vec<Parameter<DefaultSchemaRaw>> {
        T::header_parameter_schema()
    }
}

impl<T: Apiv2Schema> OperationModifier for SessionContext<T> {}

impl<T> SessionContext<T> {
    pub fn expires_at(&self) -> DateTime<Utc> {
        self.session.expires_at
    }
}

impl<T> GetSessionForUpdate for SessionContext<T>
where
    T: AllowSessionUpdate,
{
    fn session(self) -> AuthSession {
        self.session
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
            let ff_client = state.feature_flag_client.clone();

            let parsed_session_data = state
                .db_pool
                .db_query(move |conn| {
                    T::try_load_session(raw_session_data, conn, ff_client)
                        .map_err(|e| AuthError::ErrorLoadingSession(allowed_headers, format!("{:?}", e)))
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

#[cfg(test)]
mod test {
    use super::{MaskedHeaderMap, SessionContext};
    use crate::{auth::session::AuthSessionData, utils::session::AuthSession};
    use actix_web::http::header::HeaderMap;
    use chrono::Utc;
    use newtypes::SessionAuthToken;
    use std::marker::PhantomData;

    impl<T> SessionContext<T> {
        pub(in crate::auth) fn create_fixture(data: T, session_data: AuthSessionData) -> Self {
            let map = HeaderMap::new();
            let auth_token = SessionAuthToken::generate();
            let session = AuthSession {
                key: auth_token.id(),
                expires_at: Utc::now(),
                data: session_data,
            };
            Self {
                data,
                auth_token,
                headers: MaskedHeaderMap(map),
                session,
                phantom: PhantomData,
            }
        }
    }
}
