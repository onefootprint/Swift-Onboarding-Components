use std::pin::Pin;

use actix_web::FromRequest;
use db::models::tenant::Tenant;
use futures_util::Future;
use paperclip::actix::Apiv2Security;

use crate::errors::ApiError;

use super::{AuthError, CheckTenantPermissions, TenantAuth};

#[derive(Debug, Clone, Apiv2Security)]
#[openapi(apiKey)]
/// Abstract Session Context Type
pub enum Either<A, B> {
    Left(A),
    Right(B),
}

impl<A, B> FromRequest for Either<A, B>
where
    A: FromRequest<Error = ApiError> + 'static,
    B: FromRequest<Error = ApiError> + 'static,
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

                // The goal here is to produce a better error message
                // as it's possible there's a real auth error or some headers are missing
                (Err(e1), Err(e2)) => {
                    match (e1, e2) {
                        // if both headers are missing
                        (
                            ApiError::AuthError(AuthError::MissingHeader(h1)),
                            ApiError::AuthError(AuthError::MissingHeader(h2)),
                        ) => Err(ApiError::AuthError(AuthError::MissingHeader(format!(
                            "{} or {}",
                            h1, h2
                        )))),

                        // if there's a non missing header error on one side, pick that one
                        (ApiError::AuthError(AuthError::MissingHeader(_)), e)
                        | (e, ApiError::AuthError(AuthError::MissingHeader(_))) => Err(e),

                        (e1, e2) => {
                            tracing::warn!(error1=?e1, error2=?e2, "Got dual error in Either FromRequest");
                            // arbitrarily choose the first one
                            Err(e1)
                        }
                    }
                }
            }
        })
    }
}

impl<A, B> TenantAuth for Either<A, B>
where
    A: TenantAuth,
    B: TenantAuth,
{
    fn tenant(&self) -> &Tenant {
        match self {
            Either::Left(s) => s.tenant(),
            Either::Right(s) => s.tenant(),
        }
    }

    fn format_principal(&self) -> String {
        match self {
            Either::Left(l) => l.format_principal(),
            Either::Right(r) => r.format_principal(),
        }
    }

    fn is_live(&self) -> Result<bool, ApiError> {
        match self {
            Either::Left(l) => l.is_live(),
            Either::Right(r) => r.is_live(),
        }
    }
}

impl<A, B> CheckTenantPermissions for Either<A, B>
where
    A: CheckTenantPermissions,
    B: CheckTenantPermissions,
{
    fn check_permissions(
        self,
        permissions: Vec<newtypes::TenantPermission>,
    ) -> Result<Box<dyn TenantAuth>, AuthError> {
        match self {
            Either::Left(l) => l.check_permissions(permissions),
            Either::Right(r) => r.check_permissions(permissions),
        }
    }
}
