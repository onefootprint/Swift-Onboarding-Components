use crate::auth::AuthError;
use crate::State;
use actix_web::web;
use actix_web::FromRequest;
use api_errors::FpError;
use futures_util::Future;
use paperclip::actix::Apiv2Security;
use std::marker::PhantomData;
use std::pin::Pin;
use tracing::Instrument;

/// Custodian context guards custodian APIs
#[derive(Debug, Clone, Apiv2Security)]
#[openapi(
    apiKey,
    alias = "Custodian API Key",
    in = "header",
    name = "X-Fp-Protected-Custodian-Key",
    description = "The custodian key"
)]
pub struct CustodianAuthContext {
    phantom: PhantomData<()>,
}

const HEADER_NAME: &str = "X-Footprint-Custodian-Key";

impl FromRequest for CustodianAuthContext {
    type Error = crate::ApiError;
    type Future = Pin<Box<dyn Future<Output = Result<Self, Self::Error>>>>;

    #[tracing::instrument("CustodianAuthContext::from_request", skip_all)]
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
            .custodian_key
            .clone();

        let extractor = async move {
            let custodian_key = custodian_key.map_err(FpError::from)?;
            if crypto::safe_compare(custodian_key.as_bytes(), expected_custodian_key.as_bytes()) {
                Ok(Self { phantom: PhantomData })
            } else {
                Err(FpError::from(AuthError::InvalidHeader(HEADER_NAME.to_owned())).into())
            }
        };
        Box::pin(extractor.in_current_span())
    }
}
