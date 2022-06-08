use std::{marker::PhantomData, pin::Pin};

use actix_web::{web, FromRequest};
use db::{
    models::{tenants::Tenant, user_vaults::UserVault},
    DbPool,
};
use futures_util::Future;
use newtypes::{
    tenant::workos::WorkOsSession,
    user::{d2p::D2pSession, onboarding::OnboardingSession},
    HeaderName, ServerSession,
};
use paperclip::actix::Apiv2Security;

use crate::{errors::ApiError, State};

use super::AuthError;

#[derive(Debug, Clone, Apiv2Security)]
#[openapi(apiKey)]
/// Abstract Session Context Type
pub struct SessionContext<T> {
    pub data: T,
    pub auth_token: String,
    // prevents external construction
    phantom: PhantomData<()>,
}

impl<T> FromRequest for SessionContext<T>
where
    T: TryFrom<ServerSession> + HeaderName,
{
    type Error = ApiError;
    type Future = Pin<Box<dyn Future<Output = Result<Self, Self::Error>>>>;

    fn from_request(req: &actix_web::HttpRequest, _payload: &mut actix_web::dev::Payload) -> Self::Future {
        let pool = req.app_data::<web::Data<State>>().unwrap().db_pool.clone();

        let header = T::header_name();

        let auth_token = req
            .headers()
            .get(header.clone())
            .and_then(|hv| hv.to_str().map(|s| s.to_string()).ok())
            .ok_or(AuthError::MissingHeader(header));

        Box::pin(async move {
            let auth_token = auth_token?;

            let session = db::session::get_by_session_id(&pool, auth_token.clone())
                .await?
                .ok_or(AuthError::NoSessionFound)?;

            // Explicit type annotation here (T:: try_from) automatically ensures that a malicious user
            // cannot re-use session tokens for different purposes -- the API endpoints declare the session type "T"
            // that they allow (example: UserSession<OnboardingSessionData>)
            // and if the session associated with the token cannot be converted to type T (in this case, OnboardingSession)
            // we fail
            let session_data =
                T::try_from(session.session_data).map_err(|_| ApiError::InvalidTokenForHeader)?;
            Ok(Self {
                data: session_data,
                auth_token,
                phantom: PhantomData,
            })
        })
    }
}

impl SessionContext<OnboardingSession> {
    pub async fn user_vault(&self, pool: &DbPool) -> Result<UserVault, ApiError> {
        Ok(db::user_vault::get(pool, self.data.user_vault_id.clone()).await?)
    }
}

impl SessionContext<D2pSession> {
    pub async fn user_vault(&self, pool: &DbPool) -> Result<UserVault, ApiError> {
        Ok(db::user_vault::get(pool, self.data.user_vault_id.clone()).await?)
    }
}

impl SessionContext<WorkOsSession> {
    pub async fn tenant(&self, pool: &DbPool) -> Result<Tenant, ApiError> {
        Ok(db::tenant::get_tenant(pool, self.data.tenant_id.clone()).await?)
    }
}
