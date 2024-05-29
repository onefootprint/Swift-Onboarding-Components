use crate::auth::protected_custodian::ProtectedCustodianAuthContext;
use crate::auth::tenant::{
    FirmEmployeeAuth,
    FirmEmployeeAuthContext,
    FirmEmployeeGuard,
};
use crate::auth::{
    Either,
    SessionContext,
};
use crate::ApiError;
use actix_web::FromRequest;
use futures_util::Future;
use std::pin::Pin;

/// Auth that allows either the airplane API key or a risk ops firm employee to perform the action
pub struct ProtectedAuth(
    #[allow(unused)] Either<ProtectedCustodianAuthContext, SessionContext<FirmEmployeeAuth>>,
);

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
