use super::AuthSessionData;
use super::ExtractableAuthSession;
use super::GetSessionForUpdate;
use super::LoadSessionContext;
use super::RequestInfo;
use crate::auth::tenant::InvalidateAuth;
use crate::auth::AuthError;
use crate::utils::session::AuthSession;
use crate::ApiError;
use crate::ApiResponse;
use crate::FpResult;
use crate::State;
use actix_web::web;
use actix_web::FromRequest;
use api_errors::ServerErr;
use async_trait::async_trait;
use chrono::DateTime;
use chrono::Duration;
use chrono::Utc;
use crypto::aead::ScopedSealingKey;
use db::models::session::Session;
use derive_more::Deref;
use futures_util::Future;
use itertools::Itertools;
use newtypes::PiiString;
use newtypes::SessionAuthToken;
use paperclip::actix::OperationModifier;
use paperclip::v2::models::DefaultSchemaRaw;
use paperclip::v2::models::Parameter;
use paperclip::v2::models::SecurityScheme;
use paperclip::v2::schema::Apiv2Schema;
use std::any::type_name;
use std::marker::PhantomData;
use std::pin::Pin;
use tracing::Instrument;
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

    /// Creates a new auth token with an expiry derived off of the current auth token.
    /// This function guarantees that we won't create a derived token that expires after the source
    /// token.
    pub fn create_derived(
        &self,
        conn: &mut db::PgConn,
        session_key: &ScopedSealingKey,
        session: AuthSessionData,
        max_duration: Option<Duration>,
    ) -> FpResult<(SessionAuthToken, DateTime<Utc>)> {
        self.session
            .create_derived(conn, session_key, session, max_duration)
    }
}

impl<T> GetSessionForUpdate for SessionContext<T> {
    fn session(self) -> AuthSession {
        self.session
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
    ) -> Pin<Box<dyn Future<Output = ApiResponse<Self>>>> {
        let extractor = async move {
            let root_span = root_span
                .await
                .map_err(|_| ServerErr("Cannot extract root span"))?;

            let allowed_headers = T::header_names_for_err()
                .into_iter()
                .map(|s| s.to_owned())
                .collect_vec();
            let auth_token = auth_token.ok_or_else(|| AuthError::MissingHeader(allowed_headers.clone()))?;
            let auth_token = SessionAuthToken::from(auth_token);
            root_span.record("auth_token_hash", auth_token.id().to_string());

            let ctx = LoadSessionContext {
                ff_client: state.ff_client.clone(),
                sealing_key: state.session_sealing_key.clone(),
                req,
            };
            let (session, parsed_session_data, auth_token) = state
                .db_query(move |conn| {
                    let session = AuthSession::get(conn, &ctx.sealing_key, &auth_token)?;
                    let parsed_session_data = T::try_load_session(conn, session.data.clone(), ctx)
                        .map_err(|e| AuthError::ErrorLoadingSession(allowed_headers.join(" or "), e))?;
                    Ok((session, parsed_session_data, auth_token))
                })
                .await?;

            parsed_session_data.log_authed_principal(root_span);

            let result = Self {
                data: parsed_session_data,
                auth_token,
                session,
                phantom: PhantomData,
            };
            Ok(result)
        };
        Box::pin(extractor.in_current_span())
    }
}

impl<T> FromRequest for SessionContext<T>
where
    T: ExtractableAuthSession,
{
    type Error = ApiError;
    type Future = Pin<Box<dyn Future<Output = Result<Self, Self::Error>>>>;

    #[tracing::instrument("SessionContext::<T>::from_request", skip_all, fields(T=tracing::field::Empty))]
    fn from_request(req: &actix_web::HttpRequest, payload: &mut actix_web::dev::Payload) -> Self::Future {
        let span = tracing::Span::current();
        span.record("T", type_name::<T>());

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
    async fn invalidate(self, state: &State) -> FpResult<()> {
        let key = self.session.key;
        Ok(state.db_query(move |conn| Session::invalidate(key, conn)).await?)
    }
}

#[cfg(test)]
mod test {
    use super::SessionContext;
    use crate::auth::session::AuthSessionData;
    use crate::utils::session::AuthSession;
    use chrono::Utc;
    use newtypes::SessionAuthToken;
    use std::marker::PhantomData;

    impl<T> SessionContext<T> {
        pub(in crate::auth) fn create_fixture(data: T, session_data: AuthSessionData) -> Self {
            let auth_token = SessionAuthToken::generate("u");
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
