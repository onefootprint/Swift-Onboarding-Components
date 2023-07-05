use super::IncodeStateTransition;
use super::VerificationSession;
use crate::decision::vendor::incode::state::StateResult;
use crate::decision::vendor::incode::state_machine::IncodeContext;
use crate::errors::ApiResult;
use crate::utils::vault_wrapper::VaultWrapper;
use crate::vendor_clients::IncodeClients;
use crate::ApiError;
use async_trait::async_trait;
use db::models::document_request::DocumentRequestUpdate;
use db::models::identity_document::IdentityDocument;
use db::models::identity_document::IdentityDocumentUpdate;
use db::models::user_timeline::UserTimeline;
use db::models::vault::Vault;
use db::DbPool;
use db::TxnPgConn;
use idv::incode::doc::response::FetchOCRResponse;
use itertools::Itertools;
use newtypes::DataIdentifier;
use newtypes::DataRequest;
use newtypes::DocumentKind;
use newtypes::DocumentRequestStatus;
use newtypes::DocumentSide;
use newtypes::IdDocKind;
use newtypes::IdentityDocumentId;
use newtypes::PiiString;
use newtypes::ScopedVaultId;
use newtypes::ValidateArgs;
use std::collections::HashMap;

// TODO this is more like the other workflow state transitions where it's actually a function
// of previous states. Our incode state machine workflow doesn't have a general way to handle
// it yet so we do it in a custom way
pub struct Complete {}

impl Complete {
    /// Must call this before instantiating Complete
    pub fn enter(
        conn: &mut TxnPgConn,
        vault: &Vault,
        sv_id: &ScopedVaultId,
        id_doc_id: &IdentityDocumentId,
        dk: IdDocKind,
        fetch_ocr_response: FetchOCRResponse,
    ) -> ApiResult<()> {
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
                let kind = DocumentKind::from_id_doc_kind(dk, u.side).into();
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
        fn di<I: Into<DataIdentifier>>(i: I, pii: Option<PiiString>) -> Option<(DataIdentifier, PiiString)> {
            pii.map(|x| (i.into(), x))
        }

        use DocumentKind::*;
        let r = fetch_ocr_response;
        let data = match dk {
            IdDocKind::IdCard => vec![
                di(IdCardExpiration, r.expiration_date().ok()),
                di(IdCardNumber, r.document_number.map(|p| (*p).clone())),
            ],
            IdDocKind::DriverLicense => vec![
                di(DriversLicenseExpiration, r.expiration_date().ok()),
                di(DriversLicenseDob, r.dob().ok()),
                di(DriversLicenseNumber, r.document_number.map(|p| (*p).clone())),
                di(DriversLicenseIssuingState, r.issuing_state.map(|p| (*p).clone())),
            ],
            IdDocKind::Passport => vec![
                di(PassportExpiration, r.expiration_date().ok()),
                di(PassportDob, r.dob().ok()),
                di(PassportNumber, r.document_number.map(|p| (*p).clone())),
            ],
        }
        .into_iter()
        .flatten()
        .collect_vec();

        let data = HashMap::from_iter(data);
        let data = DataRequest::clean_and_validate(data, ValidateArgs::for_bifrost(vault.is_live))?;
        let data = data.no_fingerprints();
        uvw.patch_data(conn, data)?;

        // TODO: still need to fingerprint data afterwards!

        Ok(())
    }
}

#[async_trait]
impl IncodeStateTransition for Complete {
    async fn run(
        _: &DbPool,
        _: &IncodeClients,
        _: &IncodeContext,
        _: &VerificationSession,
    ) -> ApiResult<Option<Self>> {
        Ok(None)
    }

    fn transition(
        self,
        _: &mut TxnPgConn,
        _: &IncodeContext,
        _: &VerificationSession,
    ) -> ApiResult<StateResult> {
        Err(ApiError::AssertionError("Incode machine already complete".into()))
    }
}
