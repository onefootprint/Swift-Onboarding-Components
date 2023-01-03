use std::{marker::PhantomData, pin::Pin};

use actix_web::{web, FromRequest};
use futures_util::Future;
use paperclip::actix::Apiv2Header;

use crate::{auth::AuthError, State};

#[derive(Debug, Clone, Apiv2Header)]
/// Custodian context guards custodian APIs
pub struct CustodianAuthContext {
    #[allow(unused)]
    #[openapi(
        name = "X-Footprint-Custodian-Key",
        description = "The footprint custodian key"
    )]
    custodian_key: String,
    #[openapi(skip)]
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

        #[allow(clippy::unwrap_used)]
        let expected_custodian_key = req
            .app_data::<web::Data<State>>()
            .unwrap()
            .config
            .custodian_key
            .clone();

        Box::pin(async move {
            let custodian_key = custodian_key?;
            if crypto::safe_compare(custodian_key.as_bytes(), expected_custodian_key.as_bytes()) {
                Ok(Self {
                    custodian_key,
                    phantom: PhantomData,
                })
            } else {
                Err(AuthError::InvalidCustodianAuthHeader.into())
            }
        })
    }
}
