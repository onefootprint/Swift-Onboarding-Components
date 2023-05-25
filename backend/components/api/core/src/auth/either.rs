use std::pin::Pin;

use actix_web::FromRequest;
use db::models::{tenant::Tenant, tenant_rolebinding::TenantRolebinding};
use futures_util::Future;
use paperclip::{actix::OperationModifier, v2::schema::Apiv2Schema};

use crate::errors::ApiError;

use super::{
    tenant::{GetFirmEmployee, TenantAuth},
    AuthError,
};

#[derive(Debug, Clone)]
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

impl<A: Apiv2Schema, B: Apiv2Schema> Apiv2Schema for Either<A, B> {
    fn name() -> Option<String> {
        let a = A::name().unwrap_or_default();
        let b = B::name().unwrap_or_default();
        Some(format!("{a} OR {b}"))
    }

    fn security_scheme() -> Option<paperclip::v2::models::SecurityScheme> {
        let a_description = A::security_scheme()?.description.unwrap_or_default();
        let b_description = B::security_scheme()?.description.unwrap_or_default();
        Some(paperclip::v2::models::SecurityScheme {
            type_: "apiKey".to_string(),
            // TODO implement any of these?
            name: None, // This is the name of the header, can't actually give an example since it could be any
            in_: None,
            flow: None,
            auth_url: None,
            token_url: None,
            scopes: std::collections::BTreeMap::new(),
            description: Some(format!(
                "{:}\n==============OR==============\n{:}",
                a_description, b_description,
            )),
        })
    }

    // TODO other functions?
}
impl<A: Apiv2Schema, B: Apiv2Schema> OperationModifier for Either<A, B> {}

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

    fn rolebinding(&self) -> Option<&TenantRolebinding> {
        match self {
            Either::Left(s) => s.rolebinding(),
            Either::Right(s) => s.rolebinding(),
        }
    }

    fn is_live(&self) -> Result<bool, ApiError> {
        match self {
            Either::Left(l) => l.is_live(),
            Either::Right(r) => r.is_live(),
        }
    }

    fn actor(&self) -> super::tenant::AuthActor {
        match self {
            Either::Left(l) => l.actor(),
            Either::Right(r) => r.actor(),
        }
    }
}

impl<A, B> GetFirmEmployee for Either<A, B>
where
    A: GetFirmEmployee,
    B: GetFirmEmployee,
{
    fn firm_employee_user(&self) -> crate::errors::ApiResult<db::models::tenant_user::TenantUser> {
        match self {
            Either::Left(l) => l.firm_employee_user(),
            Either::Right(r) => r.firm_employee_user(),
        }
    }
}
