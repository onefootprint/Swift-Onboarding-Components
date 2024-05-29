use super::get_header;
use crate::errors::ApiResult;
use crate::ApiErrorKind;
use actix_web::http::header::HeaderMap;
use actix_web::FromRequest;
use derive_more::Deref;
use futures_util::Future;
use lazy_static::lazy_static;
use paperclip::v2::models::{
    DefaultSchemaRaw,
    Parameter,
};
use paperclip::v2::schema::{
    Apiv2Schema,
    TypedData,
};
use regex::Regex;
use serde::{
    Deserialize,
    Serialize,
};
use std::pin::Pin;

fn external_id_regex() -> Regex {
    #[allow(clippy::unwrap_used)]
    Regex::new(r"^([A-Za-z0-9\-_\.]+)$").unwrap()
}

lazy_static! {
    pub static ref EXTERNAL_ID_CHARS: Regex = external_id_regex();
}

#[derive(Debug, Clone, Serialize, Deserialize, Deref)]
/// Attach a unique, client-generated `x-external-id` to the request
/// TODO: we may eventually unify this with idempotency id (it's basically the same concept)
pub struct ExternalId(pub Option<newtypes::ExternalId>);

impl Apiv2Schema for ExternalId {
    fn required() -> bool {
        false
    }

    fn header_parameter_schema() -> Vec<Parameter<DefaultSchemaRaw>> {
        vec![
            paperclip::v2::models::Parameter::<DefaultSchemaRaw>{
                name: "x-external-id".to_owned(),
                in_: paperclip::v2::models::ParameterIn::Header,
                description: Some("To support attaching external identifiers (like a foreign user id) to this request, provide a client-generated `x-external-id`. Requests made with the same `x-external-id` value will no-op and return the same result. `x-external-id` must be globally unique to your organization. Note, if `x-external-id` is provided, initial data may not be specified in the HTTP body.".to_string()),
                data_type: Some(newtypes::ExternalId::data_type()),
                format: newtypes::ExternalId::format(),
                required: Self::required(),
                ..Default::default()
            }
        ]
    }
}
impl paperclip::actix::OperationModifier for ExternalId {}

impl ExternalId {
    const HEADER_NAME: &'static str = "x-external-id";

    pub fn parse_from_request(headers: &HeaderMap) -> ApiResult<Self> {
        let external_id = if let Some(id) = get_header(Self::HEADER_NAME, headers) {
            if id.len() < 10 || id.len() > 256 {
                return Err(ApiErrorKind::ValidationError(
                    "External ID length is invalid. Must be between 10 and 256 characters.".into(),
                ))?;
            }
            if !EXTERNAL_ID_CHARS.is_match(&id) {
                return Err(ApiErrorKind::ValidationError(
                    "External ID is invalid. Must only include alphanumeric characters, -, _, or .".into(),
                ))?;
            }
            Some(newtypes::ExternalId::from(id))
        } else {
            None
        };
        Ok(Self(external_id))
    }
}

impl FromRequest for ExternalId {
    type Error = crate::ApiError;
    type Future = Pin<Box<dyn Future<Output = Result<Self, Self::Error>>>>;

    fn from_request(req: &actix_web::HttpRequest, _payload: &mut actix_web::dev::Payload) -> Self::Future {
        let headers_res = ExternalId::parse_from_request(req.headers());
        Box::pin(async move { headers_res })
    }
}
