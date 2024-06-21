use super::get_header;
use crate::types::ApiError;
use crate::ApiResponse;
use actix_web::http::header::HeaderMap;
use actix_web::FromRequest;
use derive_more::Deref;
use futures_util::Future;
use newtypes::input::parse_csv;
use newtypes::DataIdentifier;
use paperclip::actix::Apiv2Schema;
use serde::Deserialize;
use serde::Serialize;
use std::pin::Pin;

#[derive(Debug, Clone, Apiv2Schema, Serialize, Deserialize, Deref)]
/// Optional header to specify which vault fields were bootstrapped into the SDK
pub struct BootstrapFieldsHeader(pub Vec<DataIdentifier>);

impl BootstrapFieldsHeader {
    const HEADER_NAME: &'static str = "x-fp-bootstrapped-fields";

    fn parse_from_request(headers: &HeaderMap) -> ApiResponse<Self> {
        let bootstrapped_fields = get_header(Self::HEADER_NAME, headers);
        let dis = if let Some(s) = bootstrapped_fields {
            parse_csv::<DataIdentifier, serde_json::Error>(&s)?
        } else {
            vec![]
        };
        Ok(Self(dis.into_iter().collect()))
    }
}

impl FromRequest for BootstrapFieldsHeader {
    type Error = ApiError;
    type Future = Pin<Box<dyn Future<Output = Result<Self, Self::Error>>>>;

    fn from_request(req: &actix_web::HttpRequest, _payload: &mut actix_web::dev::Payload) -> Self::Future {
        let headers = BootstrapFieldsHeader::parse_from_request(req.headers());
        Box::pin(async move { headers })
    }
}
