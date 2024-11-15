use super::get_bool_header;
use crate::ApiResponse;
use actix_web::http::header::HeaderMap;
use actix_web::FromRequest;
use derive_more::Deref;
use futures_util::Future;
use paperclip::v2::models::DefaultSchemaRaw;
use paperclip::v2::models::Parameter;
use paperclip::v2::schema::Apiv2Schema;
use serde::Deserialize;
use serde::Serialize;
use std::pin::Pin;

#[derive(Debug, Clone, Serialize, Deserialize, Deref)]
/// When provided as a header, specifies the request should be a dry-run.
pub struct DryRun(pub bool);

impl Apiv2Schema for DryRun {
    fn required() -> bool {
        false
    }

    fn header_parameter_schema() -> Vec<Parameter<DefaultSchemaRaw>> {
        vec![paperclip::v2::models::Parameter::<DefaultSchemaRaw> {
            name: Self::HEADER_NAME.to_owned(),
            in_: paperclip::v2::models::ParameterIn::Header,
            description: Some("When provided as a header, specifies the request should be a dry-run".into()),
            data_type: Some(paperclip::v2::models::DataType::Boolean),
            format: None,
            required: Self::required(),
            ..Default::default()
        }]
    }
}
impl paperclip::actix::OperationModifier for DryRun {}

impl DryRun {
    const HEADER_NAME: &'static str = "x-fp-dry-run";

    pub fn parse_from_request(headers: &HeaderMap) -> ApiResponse<Self> {
        let value = get_bool_header(Self::HEADER_NAME, headers).unwrap_or_default();
        Ok(Self(value))
    }

    pub fn into_inner(self) -> bool {
        self.0
    }
}

impl FromRequest for DryRun {
    type Error = crate::ApiError;
    type Future = Pin<Box<dyn Future<Output = Result<Self, Self::Error>>>>;

    fn from_request(req: &actix_web::HttpRequest, _payload: &mut actix_web::dev::Payload) -> Self::Future {
        let headers_res = DryRun::parse_from_request(req.headers());
        Box::pin(async move { headers_res })
    }
}
