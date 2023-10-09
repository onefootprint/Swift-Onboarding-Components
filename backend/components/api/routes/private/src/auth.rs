use std::pin::Pin;

use actix_web::FromRequest;
use api_core::{
    auth::{
        protected_custodian::ProtectedCustodianAuthContext,
        tenant::{FirmEmployeeAuth, FirmEmployeeAuthContext, FirmEmployeeGuard},
        Either, SessionContext,
    },
    ApiError,
};
use futures_util::Future;

/// Auth that allows either the airplane API key or a risk ops firm employee to perform the action
pub struct ProtectedAuth(Either<ProtectedCustodianAuthContext, SessionContext<FirmEmployeeAuth>>);

impl FromRequest for ProtectedAuth {
    type Error = ApiError;
    type Future = Pin<Box<dyn Future<Output = Result<Self, Self::Error>>>>;

    fn from_request(req: &actix_web::HttpRequest, payload: &mut actix_web::dev::Payload) -> Self::Future {
        let fut =
            Either::<ProtectedCustodianAuthContext, FirmEmployeeAuthContext>::from_request(req, payload);
        Box::pin(async move {
            let result = fut.await?;
            let result = match result {
                Either::Left(auth) => Either::Left(auth),
                // In the extractor, always assert that the firm employee is risk ops
                Either::Right(auth) => Either::Right(auth.check_guard(FirmEmployeeGuard::RiskOps)?),
            };
            Ok(Self(result))
        })
    }
}
