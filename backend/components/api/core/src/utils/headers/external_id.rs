use super::get_header;
use crate::ApiResponse;
use actix_web::http::header::HeaderMap;
use actix_web::FromRequest;
use derive_more::Deref;
use futures_util::Future;
use paperclip::v2::models::DefaultSchemaRaw;
use paperclip::v2::models::Parameter;
use paperclip::v2::schema::Apiv2Schema;
use paperclip::v2::schema::TypedData;
use serde::Deserialize;
use serde::Serialize;
use std::pin::Pin;
use std::str::FromStr;

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
                description: Some("Optionally, this user's identifier in your own database. This will be associated with the user as their `external_id`, which is may be used in the future to look up a user in Footprint using your own user identifier. `x-external-id` must be globally unique to your organization. Can only be composed of alphanumeric characters, underscores, hyphens, and periods. Note, if `x-external-id` is provided, initial data may not be specified in the HTTP body.".to_string()),
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

    pub fn parse_from_request(headers: &HeaderMap) -> ApiResponse<Self> {
        let external_id = get_header(Self::HEADER_NAME, headers)
            .map(|id| newtypes::ExternalId::from_str(&id))
            .transpose()?;
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
