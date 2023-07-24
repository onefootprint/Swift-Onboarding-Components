use super::get_header;
use actix_web::{http::header::HeaderMap, FromRequest};
use derive_more::Deref;
use futures_util::Future;
use paperclip::actix::Apiv2Schema;
use serde::{Deserialize, Serialize};
use std::pin::Pin;

#[derive(Debug, Clone, Apiv2Schema, Serialize, Deserialize, Deref)]
/// When value is "true," relaxes some card validation constraints when adding data to a vault
pub struct IgnoreCardValidation(pub bool);

impl IgnoreCardValidation {
    const HEADER_NAME: &str = "x-fp-ignore-card-validation";

    pub fn parse_from_request(headers: &HeaderMap) -> Self {
        let allow_extra_fields = get_header(Self::HEADER_NAME, headers)
            .map(|h| h == "true")
            .unwrap_or_default();
        Self(allow_extra_fields)
    }
}

impl FromRequest for IgnoreCardValidation {
    type Error = crate::ApiError;
    type Future = Pin<Box<dyn Future<Output = Result<Self, Self::Error>>>>;

    fn from_request(req: &actix_web::HttpRequest, _payload: &mut actix_web::dev::Payload) -> Self::Future {
        let headers = IgnoreCardValidation::parse_from_request(req.headers());
        Box::pin(async move { Ok(headers) })
    }
}
