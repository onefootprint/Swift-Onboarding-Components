use std::collections::HashMap;

use super::{IncodeState, IncodeStateTransition};
use crate::decision::vendor::state_machines::incode_state_machine::IncodeContext;
use crate::errors::ApiResult;
use crate::utils::vault_wrapper::VaultWrapper;
use crate::ApiError;
use async_trait::async_trait;
use db::models::identity_document::IdentityDocument;
use db::models::identity_document::IdentityDocumentUpdate;
use db::DbPool;
use db::TxnPgConn;
use idv::footprint_http_client::FootprintVendorHttpClient;
use idv::incode::response::FetchOCRResponse;
use idv::incode::response::FetchScoresResponse;
use newtypes::DocumentKind;
use newtypes::DocumentSide;
use newtypes::IdDocKind;
use newtypes::IdentityDocumentId;
use newtypes::ScopedVaultId;

pub struct Complete {
    pub fetch_scores_response: FetchScoresResponse,
    pub fetch_ocr_response: FetchOCRResponse,
}

impl Complete {
    /// Must call this before instantiating Complete
    pub fn enter(
        conn: &mut TxnPgConn,
        sv_id: &ScopedVaultId,
        id_doc_id: &IdentityDocumentId,
        dk: IdDocKind,
        fetch_scores_response: FetchScoresResponse,
        fetch_ocr_response: FetchOCRResponse,
    ) -> ApiResult<Self> {
        // Now that we have the correct type of the document, add the images to the vault
        // under the correct type
        let uvw = VaultWrapper::lock_for_onboarding(conn, sv_id)?;
        let id_doc = IdentityDocument::get(conn, id_doc_id)?.0;
        let e_data_key = id_doc.e_data_key.clone();
        let mut lifetime_ids: HashMap<_, _> = id_doc
            .images()
            .into_iter()
            .map(|(side, url)| -> ApiResult<_> {
                let kind = DocumentKind::from_id_doc_kind(dk, side);
                let name = format!("{}.png", kind);
                let mime_type = "image/png".to_string();
                let r = uvw.put_document(conn, kind, mime_type, name, e_data_key.clone(), url)?;
                Ok((side, r.lifetime_id))
            })
            .collect::<ApiResult<_>>()?;

        let update = IdentityDocumentUpdate {
            front_lifetime_id: lifetime_ids.remove(&DocumentSide::Front),
            back_lifetime_id: lifetime_ids.remove(&DocumentSide::Back),
            selfie_lifetime_id: lifetime_ids.remove(&DocumentSide::Selfie),
        };
        IdentityDocument::update(conn, id_doc_id, update)?;

        // TODO add some more OCR data to the vault

        Ok(Self {
            fetch_scores_response,
            fetch_ocr_response,
        })
    }
}

#[async_trait]
impl IncodeStateTransition for Complete {
    async fn run(
        &self,
        _db_pool: &DbPool,
        _footprint_http_client: &FootprintVendorHttpClient,
        _ctx: &IncodeContext,
    ) -> Result<IncodeState, ApiError> {
        Err(ApiError::AssertionError("incode already complete".into()))
    }
}
