use actix_web::FromRequest;
use paperclip::actix::web::ServiceConfig;
use paperclip::v2::schema::Apiv2Schema;
use std::future::Future;
use std::pin::Pin;
mod index;
mod reflect;

pub use api_core::*;
use serde_json::json;
use utils::body_bytes::BodyBytes;
use web::Bytes;

/// Limit the body payload to 5MB
const FIVE_MB: usize = 5 * 1024 * 1024;

#[derive(derive_more::Deref, derive_more::DerefMut)]
pub struct VaultProxyBodyBytes(BodyBytes<FIVE_MB>);

impl Apiv2Schema for VaultProxyBodyBytes {
    fn name() -> Option<String> {
        Some("VaultProxyBodyBytes".to_string())
    }

    fn description() -> &'static str {
        "Request body to be used in the vault proxy. The body may contain any number of \"vault proxy tokens,\", which are hydrated with the decrypted data from provided users' vaults."
    }

    fn raw_schema() -> paperclip::v2::models::DefaultSchemaRaw {
        let example = json!({
            "name": "{{ fp_id_Ih14yI0tMugEe5kdpnC0cl.id.first_name | to_uppercase }} {{ fp_id_Ih14yI0tMugEe5kdpnC0cl.id.last_name | to_uppercase }}",
            "dob": r#"{{ fp_id_Ih14yI0tMugEe5kdpnC0cl.id.dob }}"#
        });
        let mut schema = Bytes::raw_schema();
        schema.data_type = Some(paperclip::v2::models::DataType::String);
        schema.example = Some(example);
        schema.description = Some(Self::description().to_string());
        schema
    }
}

impl paperclip::actix::OperationModifier for VaultProxyBodyBytes {
    fn update_parameter(op: &mut paperclip::v2::models::DefaultOperationRaw) {
        op.parameters.push(paperclip::v2::models::Either::Right(
            paperclip::v2::models::Parameter {
                description: Some(Self::description().to_owned()),
                in_: paperclip::v2::models::ParameterIn::Body,
                name: "body".into(),
                schema: Some(Self::raw_schema()),
                required: true,
                max_length: Some(FIVE_MB as u32),
                format: Some(paperclip::v2::models::DataTypeFormat::Other),
                ..Default::default()
            },
        ));
    }
}

impl FromRequest for VaultProxyBodyBytes {
    type Error = ApiError;
    type Future = Pin<Box<dyn Future<Output = Result<Self, Self::Error>>>>;

    fn from_request(req: &web::HttpRequest, payload: &mut actix_web::dev::Payload) -> Self::Future {
        let fut = BodyBytes::<FIVE_MB>::from_request(req, payload);
        let fut = async {
            let body = fut.await?;
            Ok(Self(body))
        };
        Box::pin(fut)
    }
}

pub fn routes(config: &mut ServiceConfig) {
    config.service(index::just_in_time);
    config.service(reflect::post);
    config.service(index::id);
}
