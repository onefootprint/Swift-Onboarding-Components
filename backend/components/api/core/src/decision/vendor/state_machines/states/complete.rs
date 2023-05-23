use super::{IncodeState, IncodeStateTransition};
use crate::decision::vendor::state_machines::incode_state_machine::IncodeContext;
use crate::errors::ApiResult;
use crate::utils::vault_wrapper::VaultWrapper;
use crate::ApiError;
use async_trait::async_trait;
use db::models::document_request::DocumentRequestUpdate;
use db::models::identity_document::IdentityDocument;
use db::models::identity_document::IdentityDocumentUpdate;
use db::models::user_timeline::UserTimeline;
use db::models::vault::Vault;
use db::DbPool;
use db::TxnPgConn;
use idv::footprint_http_client::FootprintVendorHttpClient;
use idv::incode::doc::response::FetchOCRResponse;
use idv::incode::doc::response::FetchScoresResponse;
use newtypes::DataIdentifier;
use newtypes::DataRequest;
use newtypes::DocumentKind;
use newtypes::DocumentRequestStatus;
use newtypes::DocumentSide;
use newtypes::IdDocKind;
use newtypes::IdentityDocumentId;
use newtypes::KvDataKey;
use newtypes::ScopedVaultId;
use newtypes::ValidateArgs;
use std::collections::HashMap;
use std::str::FromStr;

pub struct Complete {
    pub fetch_scores_response: FetchScoresResponse,
    pub fetch_ocr_response: FetchOCRResponse,
}

impl Complete {
    /// Must call this before instantiating Complete
    pub fn enter(
        conn: &mut TxnPgConn,
        vault: &Vault,
        sv_id: &ScopedVaultId,
        id_doc_id: &IdentityDocumentId,
        dk: IdDocKind,
        fetch_scores_response: FetchScoresResponse,
        fetch_ocr_response: FetchOCRResponse,
    ) -> ApiResult<Self> {
        let uvw = VaultWrapper::lock_for_onboarding(conn, sv_id)?;
        let (id_doc, doc_req) = IdentityDocument::get(conn, id_doc_id)?;

        // Mark the document request as complete
        let update = DocumentRequestUpdate::status(DocumentRequestStatus::Complete);
        doc_req.update(conn, update)?;

        // Create a timeline event
        let info = newtypes::IdentityDocumentUploadedInfo {
            id: id_doc_id.clone(),
        };
        UserTimeline::create(conn, info, vault.id.clone(), sv_id.clone())?;

        // Now that we have the correct type of the document, add the images to the vault
        // under the correct type
        let mut lifetime_ids: HashMap<_, _> = id_doc
            .images(conn)?
            .into_iter()
            .map(|u| -> ApiResult<_> {
                let kind = DocumentKind::from_id_doc_kind(dk, u.side);
                let name = format!("{}.png", kind);
                let mime_type = "image/png".to_string();
                let r = uvw.put_document_unsafe(conn, kind, mime_type, name, u.e_data_key, u.s3_url)?;
                Ok((u.side, r.lifetime_id))
            })
            .collect::<ApiResult<_>>()?;

        let update = IdentityDocumentUpdate {
            front_lifetime_id: lifetime_ids.remove(&DocumentSide::Front),
            back_lifetime_id: lifetime_ids.remove(&DocumentSide::Back),
            selfie_lifetime_id: lifetime_ids.remove(&DocumentSide::Selfie),
        };
        IdentityDocument::update(conn, id_doc_id, update)?;

        // Add some extracted OCR data to the vault.
        // For now, it will take the format of `custom.{document_type}.{attribute}`, like
        // custom.id_card.document_number.
        // In the future, we might want to make a formal DI for these
        let di = |key: &str| -> Result<DataIdentifier, newtypes::Error> {
            Ok(KvDataKey::from_str(&format!("{}.{}", dk, key))?.into())
        };
        let r = fetch_ocr_response.clone();
        let data = [
            // TODO Do we want to error when these don't exist?
            r.expiration_date().map(|x| (di("expiration_date"), x)).ok(),
            r.dob().map(|x| (di("dob"), x)).ok(),
            r.document_number.map(|x| (di("document_number"), x)),
            r.issuing_state.map(|x| (di("issuing_state"), x)),
            // TODO add more OCR data
        ]
        .into_iter()
        .flatten()
        .map(|(di, pii)| Ok((di?, pii)))
        .collect::<ApiResult<Vec<_>>>()?;

        let data = HashMap::from_iter(data);
        let data = DataRequest::clean_and_validate(data, ValidateArgs::for_bifrost(vault.is_live))?;
        let data = data.no_fingerprints();
        uvw.patch_data(conn, data)?;

        Ok(Self {
            fetch_scores_response,
            fetch_ocr_response,
        })
    }
}

#[async_trait]
impl IncodeStateTransition for Complete {
    async fn run(
        self,
        _db_pool: &DbPool,
        _footprint_http_client: &FootprintVendorHttpClient,
        _ctx: &IncodeContext,
    ) -> Result<IncodeState, ApiError> {
        Err(ApiError::AssertionError("incode already complete".into()))
    }
}
