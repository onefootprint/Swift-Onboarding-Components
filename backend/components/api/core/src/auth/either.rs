use super::tenant::{
    GetFirmEmployee,
    InvalidateAuth,
};
use super::AuthError;
use crate::errors::{
    ApiError,
    ApiErrorKind,
    ApiResult,
};
use crate::State;
use actix_web::FromRequest;
use async_trait::async_trait;
use futures_util::Future;
use paperclip::actix::OperationModifier;
use paperclip::v2::models::{
    DefaultOperationRaw,
    DefaultSchemaRaw,
    SecurityScheme,
};
use paperclip::v2::schema::Apiv2Schema;
use std::collections::BTreeMap;
use std::pin::Pin;

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
                    match (e1.into_kind(), e2.into_kind()) {
                        // if both headers are missing
                        (
                            ApiErrorKind::AuthError(AuthError::MissingHeader(h1)),
                            ApiErrorKind::AuthError(AuthError::MissingHeader(h2)),
                        ) => {
                            if h1 == h2 {
                                // Both headers have the same name.
                                Err(ApiError::from(AuthError::MissingHeader(h1)))
                            } else {
                                Err(ApiError::from(AuthError::MissingHeader(format!(
                                    "{} or {}",
                                    h1, h2
                                ))))
                            }
                        }

                        // if there's a non missing header error on one side, pick that one
                        (ApiErrorKind::AuthError(AuthError::MissingHeader(_)), e)
                        | (e, ApiErrorKind::AuthError(AuthError::MissingHeader(_))) => Err(ApiError::from(e)),

                        (e1, e2) => {
                            let e1 = ApiError::from(e1);
                            let e2 = ApiError::from(e2);
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
        panic!("Should never try to get the name of an Either<> since we override OperationModifier");
    }

    fn security_scheme() -> Option<paperclip::v2::models::SecurityScheme> {
        panic!("Should never try to get the name of an Either<> since we override OperationModifier");
    }
}

// This trait controls how schemas are registered globally and with specific operations - we just
// proxy to both A and B's registration functionality
impl<A: OperationModifier, B: OperationModifier> OperationModifier for Either<A, B> {
    fn update_parameter(op: &mut DefaultOperationRaw) {
        A::update_parameter(op);
        B::update_parameter(op);
    }

    fn update_response(op: &mut DefaultOperationRaw) {
        A::update_response(op);
        B::update_response(op);
    }

    fn update_definitions(map: &mut BTreeMap<String, DefaultSchemaRaw>) {
        A::update_definitions(map);
        B::update_definitions(map);
    }

    fn update_security(op: &mut DefaultOperationRaw) {
        A::update_security(op);
        B::update_security(op);
    }

    fn update_security_definitions(map: &mut BTreeMap<String, SecurityScheme>) {
        A::update_security_definitions(map);
        B::update_security_definitions(map);
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

#[async_trait]
impl<A, B> InvalidateAuth for Either<A, B>
where
    A: InvalidateAuth + Send,
    B: InvalidateAuth + Send,
{
    /// invalidate the session token for logout purposes
    async fn invalidate(self, state: &State) -> ApiResult<()> {
        match self {
            Either::Left(l) => l.invalidate(state).await,
            Either::Right(r) => r.invalidate(state).await,
        }
    }
}
