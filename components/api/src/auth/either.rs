use std::pin::Pin;

use actix_web::FromRequest;
use db::{models::tenants::Tenant, DbPool};
use futures_util::Future;
use newtypes::{
    tenant::workos::WorkOsSession,
    user::{d2p::D2pSession, onboarding::OnboardingSession},
    D2pSessionStatus, UserVaultId, UserVaultPermissions,
};
use paperclip::actix::Apiv2Security;

use crate::errors::ApiError;

use super::{client_secret_key::SecretTenantAuthContext, session_context::SessionContext, AuthError};

#[derive(Debug, Clone, Apiv2Security)]
#[openapi(apiKey)]
/// Abstract Session Context Type
pub enum Either<A, B> {
    Left(A),
    Right(B),
}

impl<A, B> FromRequest for Either<A, B>
where
    A: FromRequest + 'static,
    B: FromRequest + 'static,
{
    type Error = ApiError;
    type Future = Pin<Box<dyn Future<Output = Result<Self, Self::Error>>>>;

    fn from_request(req: &actix_web::HttpRequest, payload: &mut actix_web::dev::Payload) -> Self::Future {
        let fut_a = A::from_request(req, payload);
        let fut_b = B::from_request(req, payload);
        let fut = futures_util::future::join(fut_a, fut_b);

        Box::pin(async move {
            let out = fut.await;

            match out {
                (Ok(a), _) => Ok(Either::Left(a)),
                (_, Ok(b)) => Ok(Either::Right(b)),
                _ => Err(AuthError::MissingHeader("missing a valid header".to_string()))?,
            }
        })
    }
}

impl Either<SessionContext<D2pSession>, SessionContext<OnboardingSession>> {
    pub fn is_valid_biometric_session(&self) -> bool {
        match self {
            Either::Left(s) => matches!(s.data.status, D2pSessionStatus::InProgress),
            Either::Right(_) => true,
        }
    }

    pub fn user_vault_id(&self) -> UserVaultId {
        match self {
            Either::Left(s) => s.data.user_vault_id.clone(),
            Either::Right(s) => s.data.user_vault_id.clone(),
        }
    }
}

impl Either<SessionContext<WorkOsSession>, SecretTenantAuthContext> {
    pub async fn tenant(&self, pool: &DbPool) -> Result<Tenant, ApiError> {
        match self {
            Either::Left(s) => Ok(s.tenant(pool).await?),
            Either::Right(s) => Ok(s.tenant().clone()),
        }
    }
}

impl UserVaultPermissions for Either<SessionContext<WorkOsSession>, SecretTenantAuthContext> {
    fn can_decrypt(&self) -> bool {
        true
    }

    fn can_modify(&self) -> bool {
        false
    }
}
