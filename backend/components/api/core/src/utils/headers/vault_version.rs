use super::get_header;
use crate::ApiResponse;
use actix_web::http::header::HeaderMap;
use actix_web::FromRequest;
use derive_more::Deref;
use futures_util::Future;
use newtypes::PreviewApi;
use newtypes::ScopedVaultVersionNumber;
use paperclip::v2::models::DefaultSchemaRaw;
use paperclip::v2::models::Parameter;
use paperclip::v2::schema::Apiv2Schema;
use serde::Deserialize;
use serde::Serialize;
use std::pin::Pin;

#[derive(Debug, Clone, Serialize, Deserialize, Deref)]
/// When provided as a header, specifies the vault version to use for the given request.
pub struct VaultVersion(pub Option<ScopedVaultVersionNumber>);

impl Apiv2Schema for VaultVersion {
    fn required() -> bool {
        false
    }

    fn header_parameter_schema() -> Vec<Parameter<DefaultSchemaRaw>> {
        let mut param = paperclip::v2::models::Parameter::<DefaultSchemaRaw> {
            name: Self::HEADER_NAME.to_owned(),
            in_: paperclip::v2::models::ParameterIn::Header,
            description: Some(
                "When provided, specifies the vault version to use for the given request.".into(),
            ),
            data_type: Some(paperclip::v2::models::DataType::String),
            required: Self::required(),
            ..Default::default()
        };
        param.extensions.insert(
            "x_fp_preview_gate".to_string(),
            PreviewApi::VaultVersioning.to_string().into(),
        );
        vec![param]
    }
}
impl paperclip::actix::OperationModifier for VaultVersion {}

impl VaultVersion {
    const HEADER_NAME: &'static str = "x-fp-vault-version";

    pub fn parse_from_request(headers: &HeaderMap) -> ApiResponse<Self> {
        let vault_version = get_header(Self::HEADER_NAME, headers)
            .map(|v| match v.parse() {
                Ok(v) if v >= 0.into() => Ok(v),
                _ => Err(newtypes::Error::VaultVersionParseError),
            })
            .transpose()?;

        Ok(Self(vault_version))
    }

    pub fn into_inner(self) -> Option<ScopedVaultVersionNumber> {
        self.0
    }
}

impl FromRequest for VaultVersion {
    type Error = crate::ApiError;
    type Future = Pin<Box<dyn Future<Output = Result<Self, Self::Error>>>>;

    fn from_request(req: &actix_web::HttpRequest, _payload: &mut actix_web::dev::Payload) -> Self::Future {
        let headers_res = VaultVersion::parse_from_request(req.headers());
        Box::pin(async move { headers_res })
    }
}
