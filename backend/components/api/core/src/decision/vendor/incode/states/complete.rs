use super::map_to_api_err;
use super::IncodeStateTransition;
use super::VerificationSession;
use crate::decision::features::incode_docv;
use crate::decision::features::incode_docv::IncodeOcrComparisonDataFields;
use crate::decision::vendor::incode::state::StateResult;
use crate::decision::vendor::incode::state_machine::IncodeContext;
use crate::errors::ApiErrorKind;
use crate::errors::ApiResult;
use crate::utils::vault_wrapper::VaultWrapper;
use crate::vendor_clients::IncodeClients;

use async_trait::async_trait;
use db::models::document_request::DocumentRequestUpdate;
use db::models::identity_document::IdentityDocument;
use db::models::identity_document::IdentityDocumentUpdate;
use db::models::risk_signal::RiskSignal;
use db::models::user_timeline::UserTimeline;
use db::models::vault::Vault;
use db::DbPool;
use db::TxnPgConn;
use idv::incode::doc::response::FetchOCRResponse;
use idv::incode::doc::response::FetchScoresResponse;
use itertools::Itertools;
use newtypes::DataIdentifier;
use newtypes::DataRequest;
use newtypes::DocumentKind;
use newtypes::DocumentRequestStatus;
use newtypes::DocumentSide;
use newtypes::IdDocKind;
use newtypes::IdentityDocumentId;
use newtypes::OcrDataKind as ODK;
use newtypes::PiiString;
use newtypes::ScopedVaultId;
use newtypes::ScrubbedPiiString;
use newtypes::ValidateArgs;
use newtypes::VendorAPI;
use newtypes::VerificationResultId;
use std::collections::HashMap;

// TODO this is more like the other workflow state transitions where it's actually a function
// of previous states. Our incode state machine workflow doesn't have a general way to handle
// it yet so we do it in a custom way
pub struct Complete {}

impl Complete {
    #[allow(clippy::too_many_arguments)]
    /// Must call this before instantiating Complete
    pub fn enter(
        conn: &mut TxnPgConn,
        vault: &Vault,
        sv_id: &ScopedVaultId,
        id_doc_id: &IdentityDocumentId,
        dk: IdDocKind,
        fetch_ocr_response: FetchOCRResponse,
        score_response: FetchScoresResponse,
        vault_data: IncodeOcrComparisonDataFields,
        expect_selfie: bool,
        ocr_verification_result_id: VerificationResultId,
        score_verification_result_id: VerificationResultId,
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
            .images(conn, true)?
            .into_iter()
            .map(|u| -> ApiResult<_> {
                let kind = DocumentKind::from_id_doc_kind(dk, u.side).into();
                let name = format!("{}.png", kind);
                let mime_type = "image/png".to_string();
                let (r, _) = uvw.put_document_unsafe(conn, kind, mime_type, name, u.e_data_key, u.s3_url)?;
                Ok((u.side, r.lifetime_id))
            })
            .collect::<ApiResult<_>>()?;

        // Add some extracted OCR data to the vault.
        let di = |ocr_dk: ODK, pii: Option<ScrubbedPiiString>| -> Option<(DataIdentifier, PiiString)> {
            pii.map(|x| (DataIdentifier::from(DocumentKind::OcrData(dk, ocr_dk)), x.into()))
        };

        let r = fetch_ocr_response.clone();
        let data = vec![
            di(ODK::Dob, r.dob().ok()),
            di(ODK::ExpiresAt, r.expiration_date().ok()),
            di(ODK::IssuedAt, r.issue_date().ok()),
            di(ODK::Gender, r.gender),
            di(ODK::FullAddress, r.address),
            di(ODK::DocumentNumber, r.document_number),
            di(ODK::IssuingState, r.issuing_state),
            di(ODK::IssuingCountry, r.issuing_country),
            di(ODK::RefNumber, r.ref_number),
            di(ODK::FullName, r.name.and_then(|n| n.full_name)),
        ]
        .into_iter()
        .flatten()
        .collect_vec();

        let data = HashMap::from_iter(data);
        let data = DataRequest::clean_and_validate(data, ValidateArgs::for_bifrost(vault.is_live))?;
        let data = data.no_fingerprints();
        let completed_seqno = uvw.patch_data(conn, data)?.seqno;

        let (document_score, _) = score_response.document_score().map_err(map_to_api_err)?;
        let (ocr_confidence_score, _) = score_response.id_ocr_confidence().map_err(map_to_api_err)?;
        let selfie_score = score_response.selfie_match().ok().map(|(s, _)| s);

        let update = IdentityDocumentUpdate {
            front_lifetime_id: lifetime_ids.remove(&DocumentSide::Front),
            back_lifetime_id: lifetime_ids.remove(&DocumentSide::Back),
            selfie_lifetime_id: lifetime_ids.remove(&DocumentSide::Selfie),
            completed_seqno: Some(completed_seqno),
            document_score: Some(document_score),
            selfie_score,
            ocr_confidence_score: Some(ocr_confidence_score),
        };
        IdentityDocument::update(conn, id_doc_id, update)?;

        // ////////////
        // Save Risk Signals
        // ////////////
        let score_reason_codes =
            incode_docv::reason_codes_from_score_response(score_response, expect_selfie)?
                .into_iter()
                .map(|r| {
                    (
                        r,
                        VendorAPI::IncodeFetchScores,
                        score_verification_result_id.clone(),
                    )
                });
        let ocr_reason_codes = incode_docv::reason_codes_from_ocr_response(fetch_ocr_response, vault_data)?
            .into_iter()
            .map(|r| (r, VendorAPI::IncodeFetchOCR, ocr_verification_result_id.clone()));

        RiskSignal::bulk_create(
            conn,
            sv_id,
            score_reason_codes.chain(ocr_reason_codes).collect(),
            newtypes::RiskSignalGroupKind::Doc,
            // TODO: FP-5062
            false,
        )?;

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
        Err(ApiErrorKind::AssertionError("Incode machine already complete".into()))?
    }
}
