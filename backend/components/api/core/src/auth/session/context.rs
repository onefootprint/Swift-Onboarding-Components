use super::{
    ExtractableAuthSession,
    GetSessionForUpdate,
};
use crate::auth::tenant::InvalidateAuth;
use crate::auth::AuthError;
use crate::errors::{
    ApiError,
    ApiResult,
    AssertionError,
};
use crate::utils::session::AuthSession;
use crate::State;
use actix_web::http::header::HeaderMap;
use actix_web::{
    web,
    FromRequest,
};
use async_trait::async_trait;
use chrono::{
    DateTime,
    Utc,
};
use db::models::session::Session;
use derive_more::Deref;
use futures_util::Future;
use http::Method;
use newtypes::{
    PiiString,
    SessionAuthToken,
};
use paperclip::actix::OperationModifier;
use paperclip::v2::models::{
    DefaultSchemaRaw,
    Parameter,
    SecurityScheme,
};
use paperclip::v2::schema::Apiv2Schema;
use std::marker::PhantomData;
use std::pin::Pin;
use tracing_actix_web::RootSpan;

/// Abstract Session Context Type
#[derive(Debug, Clone, Deref)]
pub struct SessionContext<T> {
    #[deref]
    pub data: T,
    pub auth_token: SessionAuthToken,
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

impl<T> GetSessionForUpdate for SessionContext<T> {
    fn session(self) -> AuthSession {
        self.session
    }
}

pub struct RequestInfo {
    pub headers: HeaderMap,
    pub method: Method,
}

impl<'a> From<&'a actix_web::HttpRequest> for RequestInfo {
    fn from(value: &'a actix_web::HttpRequest) -> Self {
        Self {
            headers: value.headers().clone(),
            method: value.method().clone(),
        }
    }
}

impl std::fmt::Debug for RequestInfo {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str("RequestInfo <redacted>")
    }
}

impl<T> SessionContext<T>
where
    T: ExtractableAuthSession,
{
    pub(in super::super) fn build(
        state: web::Data<State>,
        root_span: <RootSpan as FromRequest>::Future,
        auth_token: Option<PiiString>,
        req: RequestInfo,
    ) -> Pin<Box<dyn Future<Output = ApiResult<Self>>>> {
        Box::pin(async move {
            let root_span = root_span
                .await
                .map_err(|_| AssertionError("Cannot extract root span"))?;

            let allowed_headers = T::header_names().join(", "); // Temporary
            let auth_token = auth_token.ok_or_else(|| AuthError::MissingHeader(allowed_headers.clone()))?;
            let auth_token = SessionAuthToken::from(auth_token);

            root_span.record("auth_token_hash", auth_token.id().to_string());
            let session = AuthSession::get(&state, &auth_token).await?;

            // Explicit type annotation here (T:: try_from) automatically ensures that a malicious user
            // cannot re-use session tokens for different purposes -- the API endpoints declare the session
            // type "T" that they allow (example: UserSession<OnboardingSessionData>)
            // and if the session associated with the token cannot be converted to type T (in this case,
            // OnboardingSession) we fail
            let raw_session_data = session.data.clone();
            let ff_client = state.ff_client.clone();

            let parsed_session_data = state
                .db_pool
                .db_query(move |conn| T::try_load_session(raw_session_data, conn, ff_client, req))
                .await
                .map_err(|e| AuthError::ErrorLoadingSession(allowed_headers, e.to_string()))?;
            parsed_session_data.log_authed_principal(root_span);

            Ok(Self {
                data: parsed_session_data,
                auth_token,
                session,
                phantom: PhantomData,
            })
        })
    }
}

impl<T> FromRequest for SessionContext<T>
where
    T: ExtractableAuthSession,
{
    type Error = ApiError;
    type Future = Pin<Box<dyn Future<Output = Result<Self, Self::Error>>>>;

    fn from_request(req: &actix_web::HttpRequest, payload: &mut actix_web::dev::Payload) -> Self::Future {
        #[allow(clippy::unwrap_used)]
        let state = req.app_data::<web::Data<State>>().unwrap().clone();
        let root_span = RootSpan::from_request(req, payload);

        let auth_token = T::header_names()
            .into_iter()
            .filter_map(|h| req.headers().get(h))
            .next()
            .and_then(|hv| hv.to_str().map(PiiString::from).ok());
        let req = RequestInfo::from(req);
        Self::build(state, root_span, auth_token, req)
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
            session,
            phantom,
        } = self;
        SessionContext {
            data: f(data),
            auth_token,
            session,
            phantom,
        }
    }
}

#[async_trait]
impl<T> InvalidateAuth for SessionContext<T>
where
    T: Send,
{
    /// invalidate the session token for logout purposes
    async fn invalidate(self, state: &State) -> ApiResult<()> {
        let key = self.session.key;
        Ok(state
            .db_pool
            .db_query(move |conn| Session::invalidate(key, conn))
            .await?)
    }
}

#[cfg(test)]
mod test {
    use super::SessionContext;
    use crate::auth::session::AuthSessionData;
    use crate::utils::session::AuthSession;
    use chrono::Utc;
    use newtypes::{
        SessionAuthToken,
        SessionAuthTokenKind,
    };
    use std::marker::PhantomData;

    impl<T> SessionContext<T> {
        pub(in crate::auth) fn create_fixture(data: T, session_data: AuthSessionData) -> Self {
            let auth_token = SessionAuthToken::generate(SessionAuthTokenKind::User);
            assert!(auth_token.to_string().starts_with("utok_"));
            let session = AuthSession {
                key: auth_token.id(),
                expires_at: Utc::now(),
                data: session_data,
            };
            Self {
                data,
                auth_token,
                session,
                phantom: PhantomData,
            }
        }
    }
}
