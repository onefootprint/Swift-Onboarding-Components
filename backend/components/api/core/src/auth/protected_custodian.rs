use crate::auth::AuthError;
use crate::State;
use actix_web::web;
use actix_web::FromRequest;
use futures_util::Future;
use paperclip::actix::Apiv2Security;
use std::marker::PhantomData;
use std::pin::Pin;

/// Protected custodian context guards protected custodian APIs
#[derive(Debug, Clone, Apiv2Security)]
#[openapi(
    apiKey,
    alias = "Protected API Key",
    in = "header",
    name = "X-Fp-Protected-Custodian-Key",
    description = "The protected custodian key"
)]
pub struct ProtectedCustodianAuthContext {
    phantom: PhantomData<()>,
}

const HEADER_NAME: &str = "X-Fp-Protected-Custodian-Key";

impl FromRequest for ProtectedCustodianAuthContext {
    type Error = crate::ModernApiError;
    type Future = Pin<Box<dyn Future<Output = Result<Self, Self::Error>>>>;

    fn from_request(req: &actix_web::HttpRequest, _payload: &mut actix_web::dev::Payload) -> Self::Future {
        let custodian_key = req
            .headers()
            .get(HEADER_NAME)
            .and_then(|hv| hv.to_str().map(|s| s.to_string()).ok())
            .ok_or_else(|| AuthError::MissingHeader(HEADER_NAME.to_owned()));

        #[allow(clippy::unwrap_used)]
        let expected_custodian_key = req
            .app_data::<web::Data<State>>()
            .unwrap()
            .config
            .protected_custodian_key
            .clone();

        Box::pin(async move {
            let Some(expected_custodian_key) = expected_custodian_key else {
                tracing::error!("protected custodian key not set, aborting");
                return Err(AuthError::InvalidHeader(HEADER_NAME.to_owned()).into());
            };

            let custodian_key = custodian_key?;
            if crypto::safe_compare(custodian_key.as_bytes(), expected_custodian_key.as_bytes()) {
                Ok(Self { phantom: PhantomData })
            } else {
                Err(AuthError::InvalidHeader(HEADER_NAME.to_owned()).into())
            }
        })
    }
}
