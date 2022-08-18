use std::{marker::PhantomData, pin::Pin};

use actix_web::{http::header::HeaderMap, web, FromRequest};
use async_trait::async_trait;
use chrono::{DateTime, Utc};
use db::DbPool;
use futures_util::Future;
use newtypes::{SessionAuthToken, TenantId, UserVaultId};
use paperclip::actix::Apiv2Security;

use crate::{errors::ApiError, utils::session::AuthSession, State};

use super::{
    AuthError, ExtractableAuthSession, HasTenant, IsLive, Principal, SupportsIsLiveHeader, VerifiedUserAuth,
};

#[derive(Debug, Clone, Apiv2Security)]
#[openapi(apiKey)]
/// Abstract Session Context Type
pub struct SessionContext<T> {
    pub data: T,
    pub auth_token: SessionAuthToken,
    pub expires_at: DateTime<Utc>,
    pub headers: MaskedHeaderMap,
    // prevents external construction
    pub(super) phantom: PhantomData<()>,
}

#[derive(Clone)]
pub struct MaskedHeaderMap(HeaderMap);

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
        let state = req.app_data::<web::Data<State>>().unwrap().clone();

        let allowed_headers = T::header_names().join(", "); // Temporary
        let auth_token = T::header_names()
            .into_iter()
            .filter_map(|h| req.headers().get(h))
            .next()
            .and_then(|hv| hv.to_str().map(|s| s.to_string()).ok())
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
            let session_data =
                T::try_from(session.data).map_err(|_| AuthError::InvalidTokenForHeader(allowed_headers))?;
            Ok(Self {
                data: session_data,
                auth_token,
                expires_at: session.expires_at,
                headers: MaskedHeaderMap(headers),
                phantom: PhantomData,
            })
        })
    }
}

impl<A> VerifiedUserAuth for SessionContext<A>
where
    A: VerifiedUserAuth,
{
    fn user_vault_id(&self) -> UserVaultId {
        self.data.user_vault_id()
    }
}

#[async_trait]
impl<C> HasTenant for SessionContext<C>
where
    C: HasTenant + Sync + Send,
{
    fn tenant_id(&self) -> TenantId {
        self.data.tenant_id()
    }
}

#[async_trait]
impl<C> IsLive for SessionContext<C>
where
    C: SupportsIsLiveHeader + HasTenant + Sync + Send,
{
    async fn is_live(&self, pool: &DbPool) -> Result<bool, ApiError> {
        let is_live: Option<bool> = self
            .headers
            .0
            .get("x-is-live".to_owned())
            .and_then(|hv| hv.to_str().map(|s| s.to_string()).ok())
            .and_then(|v| v.trim().parse::<bool>().ok());

        // error if the tenant is sandbox-restricted but is requesting live data
        let is_sandbox_restricted = self.data.tenant(pool).await?.sandbox_restricted;
        if is_sandbox_restricted && is_live == Some(true) {
            return Err(AuthError::SandboxRestricted.into());
        }

        // otherwise return the default of the sent header or live if not restricted
        Ok(is_live.unwrap_or(!is_sandbox_restricted))
    }
}

impl<C> Principal for SessionContext<C>
where
    C: Principal,
{
    fn format_principal(&self) -> String {
        self.data.format_principal()
    }
}
