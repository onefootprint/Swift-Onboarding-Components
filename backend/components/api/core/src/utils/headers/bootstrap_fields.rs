use super::get_bool_header;
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
use paperclip::v2::models::DataType;
use paperclip::v2::models::DefaultSchemaRaw;
use paperclip::v2::models::Parameter;
use serde::Deserialize;
use serde::Serialize;
use std::pin::Pin;

// TODO: deprecate
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

#[derive(Debug, Clone, Serialize, Deserialize, Deref)]
pub struct IsBootstrapHeader(pub bool);

impl IsBootstrapHeader {
    const HEADER_NAME: &'static str = "x-fp-is-bootstrap";

    fn parse_from_request(headers: &HeaderMap) -> ApiResponse<Self> {
        let value = get_bool_header(Self::HEADER_NAME, headers).unwrap_or_default();
        Ok(Self(value))
    }
}

impl paperclip::v2::schema::Apiv2Schema for IsBootstrapHeader {
    fn required() -> bool {
        false
    }

    fn header_parameter_schema() -> Vec<Parameter<DefaultSchemaRaw>> {
        vec![paperclip::v2::models::Parameter::<DefaultSchemaRaw> {
            name: Self::HEADER_NAME.to_owned(),
            in_: paperclip::v2::models::ParameterIn::Header,
            description: Some("Provide `true` if the data in the request is bootstrap data.".to_string()),
            data_type: Some(DataType::Boolean),
            required: Self::required(),
            ..Default::default()
        }]
    }
}
impl paperclip::actix::OperationModifier for IsBootstrapHeader {}


impl FromRequest for IsBootstrapHeader {
    type Error = ApiError;
    type Future = Pin<Box<dyn Future<Output = Result<Self, Self::Error>>>>;

    fn from_request(req: &actix_web::HttpRequest, _payload: &mut actix_web::dev::Payload) -> Self::Future {
        let is_bootstrap = Self::parse_from_request(req.headers());
        Box::pin(async move { is_bootstrap })
    }
}
