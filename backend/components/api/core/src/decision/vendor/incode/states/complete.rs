use super::map_to_api_err;
use super::IncodeStateTransition;
use super::VerificationSession;
use crate::decision::features::incode_docv;
use crate::decision::features::incode_docv::IncodeOcrComparisonDataFields;
use crate::decision::vendor::incode::state::StateResult;
use crate::decision::vendor::incode::state_machine::IncodeContext;
use crate::errors::ApiErrorKind;
use crate::errors::ApiResult;
use crate::errors::AssertionError;
use crate::utils::vault_wrapper::NewDocument;
use crate::utils::vault_wrapper::VaultWrapper;
use crate::vendor_clients::IncodeClients;

use async_trait::async_trait;
use db::models::identity_document::IdentityDocument;
use db::models::identity_document::IdentityDocumentUpdate;
use db::models::ob_configuration::ObConfiguration;
use db::models::risk_signal::RiskSignal;
use db::models::user_timeline::UserTimeline;
use db::models::vault::Vault;
use db::models::workflow::Workflow;
use db::DbPool;
use db::TxnPgConn;
use idv::incode::doc::response::FetchOCRResponse;
use idv::incode::doc::response::FetchScoresResponse;
use itertools::Itertools;
use newtypes::DataIdentifier;
use newtypes::DataLifetimeSource;
use newtypes::DataRequest;
use newtypes::DocumentKind;
use newtypes::FootprintReasonCode;
use newtypes::IdDocKind;
use newtypes::IdentityDataKind as IDK;
use newtypes::IdentityDocumentId;
use newtypes::IdentityDocumentStatus;
use newtypes::OcrDataKind as ODK;
use newtypes::PiiString;
use newtypes::ScopedVaultId;
use newtypes::ScrubbedPiiString;
use newtypes::Validate;
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
        vault_data: Option<IncodeOcrComparisonDataFields>,
        expect_selfie: bool,
        ocr_verification_result_id: VerificationResultId,
        score_verification_result_id: VerificationResultId,
    ) -> ApiResult<()> {
        let uvw = VaultWrapper::lock_for_onboarding(conn, sv_id)?;
        let (id_doc, doc_request) = IdentityDocument::get(conn, id_doc_id)?;
        let (obc, _) = ObConfiguration::get(conn, &doc_request.workflow_id)?;
        let wf = Workflow::get(conn, &doc_request.workflow_id)?;

        // Create a timeline event
        let info = newtypes::IdentityDocumentUploadedInfo {
            id: id_doc_id.clone(),
        };
        UserTimeline::create(conn, info, vault.id.clone(), sv_id.clone())?;

        // Now that we have the correct type of the document, add the images to the vault
        // under the correct type
        let docs = id_doc
            .images(conn, true)?
            .into_iter()
            .map(|u| {
                let kind = DocumentKind::from_id_doc_kind(dk, u.side).into();
                NewDocument {
                    mime_type: "image/png".to_string(),
                    filename: format!("{}.png", kind),
                    kind,
                    e_data_key: u.e_data_key,
                    s3_url: u.s3_url,
                    source: DataLifetimeSource::Hosted,
                }
            })
            .collect_vec();
        uvw.put_documents_unsafe(conn, docs)?;

        // Add some extracted OCR data to the vault.
        let di = |ocr_dk: ODK, pii: Option<ScrubbedPiiString>| -> Option<(DataIdentifier, PiiString)> {
            pii.map(|x| (DataIdentifier::from(DocumentKind::OcrData(dk, ocr_dk)), x.into()))
        };

        let r = fetch_ocr_response.clone();
        let data = vec![
            di(ODK::Dob, r.dob().ok()),
            di(ODK::ExpiresAt, r.expiration_date().ok()),
            di(ODK::IssuedAt, r.issue_date().ok()),
            di(ODK::IssuingCountry, r.issuing_country_two_digit()),
            di(ODK::IssuingState, r.normalized_issuing_state()),
            di(ODK::Gender, r.gender),
            di(ODK::FullAddress, r.address),
            di(ODK::DocumentNumber, r.document_number),
            di(ODK::RefNumber, r.ref_number),
            di(ODK::Nationality, r.nationality_mrz.or(r.nationality)),
            di(
                ODK::FullName,
                // prefer MRZ decoded name to OCR, since OCR has a higher rate of whoopsies
                r.name.and_then(|n| n.machine_readable_full_name.or(n.full_name)),
            ),
            di(ODK::Curp, r.curp),
        ]
        .into_iter()
        .flatten()
        .collect_vec();

        // For doc-first onboardings, populate identity data
        let mut validate_args = ValidateArgs::for_bifrost(vault.is_live);
        // A little bit of a hack to allow vaulting all address fields that exist
        // But, bifrost will display an empty address screen if ANY address field is missing
        validate_args.allow_dangling_keys = true;
        let id_data: Vec<(DataIdentifier, PiiString)> = if obc.is_doc_first && !wf.config.is_redo() {
            let r = &fetch_ocr_response;
            let name = r.name.as_ref();
            let address = r.checked_address_bean.as_ref().or(r.address_fields.as_ref());
            vec![
                (
                    IDK::FirstName,
                    // TODO given name seems to include middle name and be all uppercase
                    name.and_then(|n| n.given_name_mrz.as_ref().or(n.given_name.as_ref())),
                ),
                (
                    IDK::LastName,
                    name.and_then(|n| n.last_name_mrz.as_ref().or(n.paternal_last_name.as_ref())),
                ),
                (IDK::AddressLine1, address.and_then(|n| n.street.as_ref())),
                (IDK::City, address.and_then(|n| n.city.as_ref())),
                (IDK::State, address.and_then(|n| n.state.as_ref())),
                (IDK::Zip, address.and_then(|n| n.postal_code.as_ref())),
                (IDK::Country, r.issuing_country_two_digit().as_ref()),
                (IDK::Dob, r.dob().ok().as_ref()),
            ]
            .into_iter()
            .flat_map(|(k, v)| v.map(|v| (DataIdentifier::from(k), PiiString::from(v.clone()))))
            // Don't add OCR data that fails validation - don't want it to block sign up
            .flat_map(|(k, v)| k.validate(v.clone(), validate_args, &HashMap::new()).is_ok().then_some((k, v)))
            // Don't add OCR data to the vault that already exists
            .filter(|(k, _)| !uvw.has_field(k.clone()))
            .collect()
        } else {
            vec![]
        };

        let data = HashMap::from_iter(data.into_iter().chain(id_data.into_iter()));
        let data = DataRequest::clean_and_validate(data, validate_args)?;
        let data = data.no_fingerprints();
        let source = DataLifetimeSource::Ocr;
        let completed_seqno = uvw.patch_data(conn, data, source)?.seqno;

        let (document_score, _) = score_response.document_score().map_err(map_to_api_err)?;
        let (ocr_confidence_score, _) = score_response.id_ocr_confidence().map_err(map_to_api_err)?;
        let selfie_score = score_response.selfie_match().ok().map(|(s, _)| s);

        let update = IdentityDocumentUpdate {
            completed_seqno: Some(completed_seqno),
            document_score: Some(document_score),
            selfie_score,
            ocr_confidence_score: Some(ocr_confidence_score),
            status: Some(IdentityDocumentStatus::Complete),
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

        let ocr_reason_codes = if !obc.is_doc_first {
            // Only calculate OCR reason codes if we have already collected ID data
            let vault_data = vault_data.ok_or(AssertionError("Vault data not provided"))?;
            incode_docv::reason_codes_from_ocr_response(fetch_ocr_response, vault_data)
                .into_iter()
                .map(|r| (r, VendorAPI::IncodeFetchOCR, ocr_verification_result_id.clone()))
                .collect_vec()
        } else {
            vec![]
        };

        let additional_reason_codes = vec![
            id_doc.should_skip_selfie().then_some((
                FootprintReasonCode::DocumentSelfieWasSkipped,
                VendorAPI::IncodeFetchScores,
                score_verification_result_id.clone(),
            )),
            id_doc.collected_on_desktop().then_some((
                FootprintReasonCode::DocumentCollectedViaDesktop,
                VendorAPI::IncodeFetchScores,
                score_verification_result_id.clone(),
            )),
        ]
        .into_iter()
        .flatten();

        RiskSignal::bulk_create(
            conn,
            sv_id,
            score_reason_codes
                .chain(ocr_reason_codes.into_iter())
                .chain(additional_reason_codes)
                .collect(),
            newtypes::RiskSignalGroupKind::Doc,
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
        Err(ApiErrorKind::AssertionError(
            "Incode machine already complete".into(),
        ))?
    }
}
