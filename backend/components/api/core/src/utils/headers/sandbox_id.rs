use super::get_header;
use crate::errors::ApiResult;
use actix_web::http::header::HeaderMap;
use actix_web::FromRequest;
use derive_more::Deref;
use futures_util::Future;
use paperclip::v2::models::{
    DefaultSchemaRaw,
    Parameter,
};
use paperclip::v2::schema::Apiv2Schema;
use serde::{
    Deserialize,
    Serialize,
};
use std::pin::Pin;

#[derive(Debug, Clone, Serialize, Deserialize, Deref)]
/// When provided, creates a sandbox user with the provided sandbox ID.
/// Sandbox IDs allow you to create multiple users with the same contact info. In order to log in
/// using an existing sandbox user, you can provide its Sandbox ID in the Footprint flow.
pub struct SandboxId(pub Option<newtypes::SandboxId>);

impl Apiv2Schema for SandboxId {
    fn required() -> bool {
        false
    }

    fn header_parameter_schema() -> Vec<Parameter<DefaultSchemaRaw>> {
        vec![paperclip::v2::models::Parameter::<DefaultSchemaRaw> {
            name: "x-sandbox-id".to_owned(),
            in_: paperclip::v2::models::ParameterIn::Header,
            description: Some("When provided, creates a sandbox user with the provided sandbox ID. Sandbox IDs allow you to create multiple users with the same contact info. In order to log in using an existing sandbox user, you can provide its Sandbox ID in the Footprint flow.
            ".into()),
            data_type: Some(paperclip::v2::models::DataType::String),
            format: None,
            required: Self::required(),
            ..Default::default()
        }]
    }
}
impl paperclip::actix::OperationModifier for SandboxId {}

impl SandboxId {
    const HEADER_NAME: &'static str = "x-sandbox-id";

    pub fn parse_from_request(headers: &HeaderMap) -> ApiResult<Self> {
        let sandbox_id = if let Some(id) = get_header(Self::HEADER_NAME, headers) {
            let id = newtypes::SandboxId::parse(&id)?;
            Some(id)
        } else {
            None
        };
        Ok(Self(sandbox_id))
    }
}

impl FromRequest for SandboxId {
    type Error = crate::ApiError;
    type Future = Pin<Box<dyn Future<Output = Result<Self, Self::Error>>>>;

    fn from_request(req: &actix_web::HttpRequest, _payload: &mut actix_web::dev::Payload) -> Self::Future {
        let headers_res = SandboxId::parse_from_request(req.headers());
        Box::pin(async move { headers_res })
    }
}
