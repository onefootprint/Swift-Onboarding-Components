use super::get_bool_header;
use actix_web::http::header::HeaderMap;
use actix_web::FromRequest;
use derive_more::Deref;
use futures_util::Future;
use paperclip::actix::Apiv2Schema;
use serde::{
    Deserialize,
    Serialize,
};
use std::pin::Pin;

#[derive(Debug, Clone, Apiv2Schema, Serialize, Deserialize, Deref)]
/// When value is "true," relaxes some card validation constraints when adding data to a vault
pub struct IgnoreLuhnValidation(pub bool);

impl IgnoreLuhnValidation {
    const HEADER_NAME: &'static str = "x-fp-ignore-luhn-validation";

    pub fn parse_from_request(headers: &HeaderMap) -> Self {
        let allow_extra_fields = get_bool_header(Self::HEADER_NAME, headers).unwrap_or_default();
        Self(allow_extra_fields)
    }
}

impl FromRequest for IgnoreLuhnValidation {
    type Error = crate::ModernApiError;
    type Future = Pin<Box<dyn Future<Output = Result<Self, Self::Error>>>>;

    fn from_request(req: &actix_web::HttpRequest, _payload: &mut actix_web::dev::Payload) -> Self::Future {
        let headers = IgnoreLuhnValidation::parse_from_request(req.headers());
        Box::pin(async move { Ok(headers) })
    }
}
