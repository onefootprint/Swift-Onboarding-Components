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

fn idempotency_id_regex() -> Regex {
    // Had to out-line this since clippy was being really annoying
    #[allow(clippy::unwrap_used)]
    Regex::new(r"^([A-Za-z0-9\-_\.]+)$").unwrap()
}

lazy_static! {
    pub static ref IDEMPOTENCY_ID_CHARS: Regex = idempotency_id_regex();
}

#[derive(Debug, Clone, Serialize, Deserialize, Deref)]
/// To safely support retrying requests without accidentally performing the same operation multiple
/// times, provide a client-generated `x-idempotency-id`. Requests made with the same
/// x-idempotency-id value will no-op and return the same result
pub struct IdempotencyId(pub Option<String>);

impl Apiv2Schema for IdempotencyId {
    fn required() -> bool {
        false
    }

    fn header_parameter_schema() -> Vec<Parameter<DefaultSchemaRaw>> {
        vec![
            paperclip::v2::models::Parameter::<DefaultSchemaRaw>{
                name: "x-idempotency-id".to_owned(),
                in_: paperclip::v2::models::ParameterIn::Header,
                description: Some("To safely support retrying requests without accidentally performing the same operation multiple times, provide a client-generated `x-idempotency-id`. Requests made with the same `x-idempotency-id` value will no-op and return the same result. Note, if `x-idempotency-id` is provided, initial data may not be specified in the HTTP body.".to_string()),
                data_type: Some(newtypes::IdempotencyId::data_type()),
                format: newtypes::IdempotencyId::format(),
                required: Self::required(),
                ..Default::default()
            }
        ]
    }
}
impl paperclip::actix::OperationModifier for IdempotencyId {}

impl IdempotencyId {
    const HEADER_NAME: &'static str = "x-idempotency-id";

    pub fn parse_from_request(headers: &HeaderMap) -> ApiResult<Self> {
        let idempotency_id = if let Some(id) = get_header(Self::HEADER_NAME, headers) {
            if id.len() < 10 || id.len() > 256 {
                return Err(ApiErrorKind::ValidationError(
                    "Idempotency ID length is invalid. Must be between 10 and 256 characters.".into(),
                ))?;
            }
            if !IDEMPOTENCY_ID_CHARS.is_match(&id) {
                return Err(ApiErrorKind::ValidationError(
                    "Idempotency ID is invalid. Must only include alphanumeric characters, -, _, or .".into(),
                ))?;
            }
            Some(id)
        } else {
            None
        };
        Ok(Self(idempotency_id))
    }
}

impl FromRequest for IdempotencyId {
    type Error = crate::ApiError;
    type Future = Pin<Box<dyn Future<Output = Result<Self, Self::Error>>>>;

    fn from_request(req: &actix_web::HttpRequest, _payload: &mut actix_web::dev::Payload) -> Self::Future {
        let headers_res = IdempotencyId::parse_from_request(req.headers());
        Box::pin(async move { headers_res })
    }
}
