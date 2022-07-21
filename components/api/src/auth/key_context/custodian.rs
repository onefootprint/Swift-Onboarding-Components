use std::{marker::PhantomData, pin::Pin};

use actix_web::{web, FromRequest};
use futures_util::Future;
use paperclip::actix::Apiv2Security;

use crate::{auth::AuthError, State};

#[derive(Debug, Clone, Apiv2Security)]
#[openapi(
    apiKey,
    in = "header",
    name = "X-Footprint-Custodian-Key",
    description = "Custodian secret key for internal methods"
)]
/// Custodian context guards custodian APIs
pub struct CustodianAuthContext {
    phantom: PhantomData<()>,
}

const HEADER_NAME: &str = "X-Footprint-Custodian-Key";

impl FromRequest for CustodianAuthContext {
    type Error = crate::ApiError;
    type Future = Pin<Box<dyn Future<Output = Result<Self, Self::Error>>>>;

    fn from_request(req: &actix_web::HttpRequest, _payload: &mut actix_web::dev::Payload) -> Self::Future {
        let custodian_key = req
            .headers()
            .get(HEADER_NAME)
            .and_then(|hv| hv.to_str().map(|s| s.to_string()).ok())
            .ok_or(AuthError::MissingCustodianAuthHeader);

        let expected_custodian_key = req
            .app_data::<web::Data<State>>()
            .unwrap()
            .config
            .custodian_key
            .clone();

        Box::pin(async move {
            if crypto::safe_compare(custodian_key?.as_bytes(), expected_custodian_key.as_bytes()) {
                Ok(Self { phantom: PhantomData })
            } else {
                Err(AuthError::InvalidCustodianAuthHeader.into())
            }
        })
    }
}
