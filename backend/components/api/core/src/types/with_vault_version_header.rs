use super::Apiv2Headers;
use super::ResponseWithHeaders;
use newtypes::PreviewApi;
use newtypes::ScopedVaultVersionNumber;
use std::collections::BTreeMap;

pub type WithVaultVersionHeader<TBody> = ResponseWithHeaders<TBody, ScopedVaultVersionResponseHeader>;

impl<T: actix_web::Responder> WithVaultVersionHeader<T> {
    pub fn new(body: T, vault_version: Option<ScopedVaultVersionNumber>) -> Self {
        let headers = ScopedVaultVersionResponseHeader { vault_version };
        Self { body, headers }
    }
}

pub struct ScopedVaultVersionResponseHeader {
    vault_version: Option<ScopedVaultVersionNumber>,
}

impl ScopedVaultVersionResponseHeader {
    const HEADER_NAME: &'static str = "x-fp-vault-version";
}

impl Apiv2Headers for ScopedVaultVersionResponseHeader {
    fn header_schema() -> BTreeMap<String, paperclip::v2::models::Header> {
        let mut header = paperclip::v2::models::Header {
            description: Some(
                "The resulting version of the vault after applying any updates in this request.".into(),
            ),
            data_type: Some(paperclip::v2::models::DataType::String),
            ..Default::default()
        };
        header.extensions.insert(
            "x_fp_preview_gate".to_string(),
            PreviewApi::VaultVersioning.to_string().into(),
        );

        let mut headers = BTreeMap::new();
        headers.insert(Self::HEADER_NAME.to_string(), header);
        headers
    }

    fn headers(self) -> Vec<(String, String)> {
        self.vault_version
            .map(|v| (Self::HEADER_NAME.to_string(), v.to_string()))
            .into_iter()
            .collect()
    }
}
