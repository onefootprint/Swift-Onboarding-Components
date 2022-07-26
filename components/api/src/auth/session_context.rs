use std::{marker::PhantomData, pin::Pin};

use actix_web::{http::header::HeaderMap, web, FromRequest};
use async_trait::async_trait;
use chrono::{DateTime, Utc};
use db::{
    models::{tenants::Tenant, user_vaults::UserVault},
    DbPool,
};
use futures_util::Future;
use newtypes::{SessionAuthToken, TenantId, UserVaultId};
use paperclip::actix::Apiv2Security;

use crate::{errors::ApiError, utils::session::AuthSession, State};

use super::{
    session_data::{HeaderName, SessionData},
    uv_permission::{HasVaultPermission, VaultPermission},
    AuthError, IsLive, SupportsIsLiveHeader,
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
    phantom: PhantomData<()>,
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
    T: TryFrom<SessionData> + HeaderName,
{
    type Error = ApiError;
    type Future = Pin<Box<dyn Future<Output = Result<Self, Self::Error>>>>;

    fn from_request(req: &actix_web::HttpRequest, _payload: &mut actix_web::dev::Payload) -> Self::Future {
        let state = req.app_data::<web::Data<State>>().unwrap().clone();

        let header = T::header_name();
        let auth_token = req
            .headers()
            .get(header.clone())
            .and_then(|hv| hv.to_str().map(|s| s.to_string()).ok())
            .ok_or(AuthError::MissingHeader(header));
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
            let session_data = T::try_from(session.data.data)
                .map_err(|_| AuthError::InvalidTokenForHeader(T::header_name()))?;
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

/// A helper trait to extract a user vault id on combined types
#[async_trait]
pub trait HasUserVaultId {
    fn user_vault_id(&self) -> UserVaultId;

    async fn user_vault(&self, pool: &DbPool) -> Result<UserVault, ApiError> {
        Ok(db::user_vault::get(pool, self.user_vault_id()).await?)
    }
}

impl<A> HasUserVaultId for SessionContext<A>
where
    A: HasUserVaultId,
{
    fn user_vault_id(&self) -> UserVaultId {
        self.data.user_vault_id()
    }
}

impl<C> HasVaultPermission for SessionContext<C>
where
    C: HasVaultPermission,
{
    fn has_permission(&self, permission: VaultPermission) -> bool {
        self.data.has_permission(permission)
    }
}

/// A helper trait to get a Tenant on combined objects
#[async_trait]
pub trait HasTenant {
    fn tenant_id(&self) -> TenantId;

    fn is_sandbox_restricted(&self) -> bool;

    async fn tenant(&self, pool: &DbPool) -> Result<Tenant, ApiError>;
}

#[async_trait]
impl<C> HasTenant for SessionContext<C>
where
    C: HasTenant + Sync + Send,
{
    fn tenant_id(&self) -> TenantId {
        self.data.tenant_id()
    }

    fn is_sandbox_restricted(&self) -> bool {
        self.data.is_sandbox_restricted()
    }

    async fn tenant(&self, pool: &DbPool) -> Result<Tenant, ApiError> {
        self.data.tenant(pool).await
    }
}

impl<C> SessionContext<C> {
    /// updates the session data and produces a sealed session data
    /// to update in the db
    pub async fn update_session_data(&self, state: &State, new_data: SessionData) -> Result<(), ApiError> {
        AuthSession::update(state, &self.auth_token, new_data, self.expires_at).await?;
        Ok(())
    }
}

impl<C> IsLive for SessionContext<C>
where
    C: SupportsIsLiveHeader + HasTenant,
{
    fn is_live(&self) -> Result<bool, AuthError> {
        let is_live: Option<bool> = self
            .headers
            .0
            .get("x-is-live".to_owned())
            .and_then(|hv| hv.to_str().map(|s| s.to_string()).ok())
            .and_then(|v| v.trim().parse::<bool>().ok());

        // error if the sandbox is restricted
        if self.data.is_sandbox_restricted() && is_live == Some(true) {
            return Err(AuthError::SandboxRestricted);
        }

        // otherwise return the default of the sent header or live if not restricted
        Ok(is_live.unwrap_or_else(|| !self.data.is_sandbox_restricted()))
    }
}
