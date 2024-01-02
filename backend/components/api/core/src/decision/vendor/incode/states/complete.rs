use super::IncodeStateTransition;
use super::VerificationSession;
use crate::decision::features::incode_docv;
use crate::decision::features::incode_docv::IncodeOcrComparisonDataFields;
use crate::decision::features::incode_utils::ParsedIncodeFields;
use crate::decision::features::incode_utils::ParsedIncodeNames;
use crate::decision::vendor::incode::state::IncodeState;
use crate::decision::vendor::incode::state::TransitionResult;
use crate::decision::vendor::incode::state_machine::IncodeContext;
use crate::enclave_client::EnclaveClient;
use crate::errors::ApiErrorKind;
use crate::errors::ApiResult;
use crate::errors::AssertionError;
use crate::utils::file_upload::mime_type_to_extension;
use crate::utils::vault_wrapper::NewDocument;
use crate::utils::vault_wrapper::Person;
use crate::utils::vault_wrapper::VaultWrapper;
use crate::utils::vault_wrapper::WriteableVw;
use crate::vendor_clients::IncodeClients;
use async_trait::async_trait;
use db::models::data_lifetime::DataLifetime;
use db::models::document_data::DocumentData;
use db::models::identity_document::IdentityDocument;
use db::models::identity_document::IdentityDocumentUpdate;
use db::models::ob_configuration::ObConfiguration;
use db::models::risk_signal::RiskSignal;
use db::models::user_timeline::UserTimeline;
use db::models::vault::Vault;
use db::DbPool;
use db::TxnPgConn;
use idv::incode::doc::response::FetchOCRResponse;
use idv::incode::doc::response::FetchScoresResponse;
use itertools::Itertools;
use newtypes::DataIdentifier;
use newtypes::DataLifetimeSeqno;
use newtypes::DataLifetimeSource;
use newtypes::DataRequest;
use newtypes::DocumentKind;
use newtypes::Fingerprints;
use newtypes::FootprintReasonCode;
use newtypes::IdDocKind;
use newtypes::IdentityDataKind as IDK;
use newtypes::IdentityDocumentId;
use newtypes::IdentityDocumentStatus;
use newtypes::IncodeFailureReason;
use newtypes::OcrDataKind as ODK;
use newtypes::PiiJsonValue;
use newtypes::PiiString;
use newtypes::ScopedVaultId;
use newtypes::ScrubbedPiiString;
use newtypes::Validate;
use newtypes::ValidateArgs;
use newtypes::VendorAPI;
use newtypes::VerificationResultId;
use std::collections::HashMap;
use strum::IntoEnumIterator;

// TODO this is more like the other workflow state transitions where it's actually a function
// of previous states. Our incode state machine workflow doesn't have a general way to handle
// it yet so we do it in a custom way
pub struct Complete {}

#[derive(Copy, Clone)]
pub(super) struct PreCompleteArgs<'a> {
    pub obc: &'a ObConfiguration,
    pub id_doc: &'a IdentityDocument,
    pub vw: &'a VaultWrapper<Person>,
    pub dk: IdDocKind,
    pub expect_selfie: bool,
    pub fetch_ocr_response: &'a FetchOCRResponse,
    pub score_response: &'a FetchScoresResponse,
}

pub(super) async fn compute_ocr_data<'a>(
    enclave_client: &EnclaveClient,
    args: PreCompleteArgs<'a>,
    rs: &'a [NewRiskSignal],
) -> ApiResult<DataRequest<Fingerprints>> {
    let PreCompleteArgs {
        obc,
        vw,
        fetch_ocr_response: r,
        dk,
        ..
    } = args;
    let mut validate_args = ValidateArgs::for_bifrost(obc.is_live);
    validate_args.allow_dangling_keys = true;

    let barcode_read_successfully = rs
        .iter()
        .any(|r| r.0 == FootprintReasonCode::DocumentBarcodeCouldBeRead);

    let data = ParsedIncodeFields::from_fetch_ocr_res(r)
        .0
        .into_iter()
        .map(|pif| (DocumentKind::OcrData(dk, pif.odk).into(), pif.value))
        .collect_vec();
    // For doc-first onboardings, populate identity data
    let id_data = if obc.is_doc_first {
        if barcode_read_successfully {
            doc_first_id_data(r, validate_args)
                .into_iter()
                // Don't add OCR data to the vault that already exists
                .filter(|(k, _)| !vw.has_field(k.clone()))
                .collect()
        } else {
            tracing::warn!("Skipping prefilling IDK data from doc because !barcode_read_successfully");
            vec![]
        }
    } else {
        vec![]
    };
    let data = HashMap::from_iter(data.into_iter().chain(id_data));
    let data = DataRequest::clean_and_validate_str(data, validate_args)?;
    let data = data.build_fingerprints(enclave_client, &obc.tenant_id).await?;
    Ok(data)
}

fn doc_first_id_data(r: &FetchOCRResponse, validate_args: ValidateArgs) -> Vec<(DataIdentifier, PiiString)> {
    let parsed_names = ParsedIncodeNames::from_fetch_ocr_res(r);

    let address = r.checked_address_bean.as_ref().or(r.address_fields.as_ref());
    vec![
        (
            IDK::FirstName,
            parsed_names.first_name.map(ScrubbedPiiString::from).as_ref(),
        ),
        (
            IDK::MiddleName,
            parsed_names.middle_name.map(ScrubbedPiiString::from).as_ref(),
        ),
        (
            IDK::LastName,
            parsed_names.last_name.map(ScrubbedPiiString::from).as_ref(),
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
    .filter(|(k, v)| k.clone().validate(PiiJsonValue::from_piistring(v.clone()), validate_args, &HashMap::new()).is_ok())
    .collect()
}

pub(super) type NewRiskSignal = (FootprintReasonCode, VendorAPI, VerificationResultId);

pub(super) fn compute_risk_signals<'a>(
    args: PreCompleteArgs<'a>,
    vault_data: Option<IncodeOcrComparisonDataFields>,
    ocr_vres_id: VerificationResultId,
    score_vres_id: VerificationResultId,
    ignored_failure_reasons: &'a [IncodeFailureReason],
) -> ApiResult<Vec<NewRiskSignal>> {
    let PreCompleteArgs {
        obc,
        id_doc,
        dk,
        expect_selfie,
        fetch_ocr_response,
        score_response,
        ..
    } = args;
    if fetch_ocr_response.age().ok().is_some_and(|a| a < 18) {
        tracing::error!("document submitted with age under 18");
    }

    let score_reason_codes =
        incode_docv::reason_codes_from_score_response(score_response, fetch_ocr_response, expect_selfie, dk)
            .into_iter()
            .map(|r| (r, VendorAPI::IncodeFetchScores, score_vres_id.clone()));

    let pii_matching_ocr_reason_codes = if !obc.is_doc_first {
        // Only calculate OCR reason codes if we have already collected ID data
        let vault_data = vault_data.ok_or(AssertionError("Vault data not provided"))?;
        incode_docv::pii_matching_reason_codes_from_ocr_response(fetch_ocr_response, vault_data)
            .into_iter()
            .map(|r| (r, VendorAPI::IncodeFetchOcr, ocr_vres_id.clone()))
            .collect_vec()
    } else {
        vec![]
    };

    let additional_reason_codes = vec![
        id_doc.should_skip_selfie().then_some((
            FootprintReasonCode::DocumentSelfieWasSkipped,
            VendorAPI::IncodeFetchScores,
            score_vres_id.clone(),
        )),
        id_doc.collected_on_desktop().then_some((
            FootprintReasonCode::DocumentCollectedViaDesktop,
            VendorAPI::IncodeFetchScores,
            score_vres_id.clone(),
        )),
    ]
    .into_iter()
    .flatten();

    // For all ignored errors from incode, generate a reason code.
    // Some of these reason codes will trigger a rule that puts the user in manual review
    let ignored_error_reason_codes = ignored_failure_reasons
        .iter()
        .filter_map(|r| r.reason_code())
        .map(|rc| {
            (
                rc,
                // Note: this is an incorrect vendor API
                VendorAPI::IncodeFetchScores,
                score_vres_id.clone(),
            )
        })
        .unique();

    let s = score_reason_codes
        .chain(pii_matching_ocr_reason_codes)
        .chain(additional_reason_codes)
        .chain(ignored_error_reason_codes)
        .collect();
    Ok(s)
}

/// Now that we have the correct type of the document, add the images to the vault under the correct type
pub fn vault_complete_images(
    conn: &mut TxnPgConn,
    vw: &WriteableVw<Person>,
    dk: IdDocKind,
    id_doc: &IdentityDocument,
) -> ApiResult<(Vec<DocumentData>, DataLifetimeSeqno)> {
    // When we vault .latest_upload, we use the document_type that is provided by the user, not the eventual doc_type from incode which is the one
    // we vault the complete images for
    let doc_type_for_latest_upload = id_doc.document_type;
    let docs = id_doc
        .images(conn, true)?
        .into_iter()
        .map(|u| {
            let mime_type = vw
                .get_mime_type(DocumentKind::LatestUpload(doc_type_for_latest_upload, u.side))
                .unwrap_or("image/png");
            let file_extension = mime_type_to_extension(mime_type).unwrap_or("png");
            let kind = DocumentKind::from_id_doc_kind(dk, u.side).into();
            NewDocument {
                mime_type: mime_type.to_owned(),
                filename: format!("{}.{}", kind, file_extension),
                kind,
                e_data_key: u.e_data_key,
                s3_url: u.s3_url,
                source: DataLifetimeSource::Hosted,
            }
        })
        .collect_vec();
    vw.put_documents_unsafe(conn, docs, None)
}

pub struct CompleteArgs<'a> {
    pub vault: &'a Vault,
    pub sv_id: &'a ScopedVaultId,
    pub id_doc_id: &'a IdentityDocumentId,
    pub dk: IdDocKind,
    pub ocr_data: DataRequest<Fingerprints>,
    pub score_response: FetchScoresResponse,
    pub rs: Vec<NewRiskSignal>,
}

impl Complete {
    /// Must call this before instantiating Complete
    pub fn enter(conn: &mut TxnPgConn, args: CompleteArgs) -> ApiResult<()> {
        let CompleteArgs {
            vault,
            sv_id,
            id_doc_id,
            dk,
            ocr_data,
            score_response,
            rs,
        } = args;
        let uvw = VaultWrapper::lock_for_onboarding(conn, sv_id)?;
        let (id_doc, _) = IdentityDocument::get(conn, id_doc_id)?;

        // Create a timeline event
        let info = newtypes::IdentityDocumentUploadedInfo {
            id: id_doc_id.clone(),
        };
        UserTimeline::create(conn, info, vault.id.clone(), sv_id.clone())?;

        // The images were only vaulted under `.latest_upload` DIs. Now, vault them under the `.image` DIs.
        // Note that the dk here may be incorrect if we can't extract it from incode
        vault_complete_images(conn, &uvw, dk, &id_doc)?;

        // Clear all OCR data for this document kind, even if we're not replacing it
        let odks_to_clear = ODK::iter()
            .map(|odk| DocumentKind::OcrData(dk, odk).into())
            .collect();
        let seqno = DataLifetime::get_next_seqno(conn)?;
        DataLifetime::bulk_deactivate_kinds(conn, sv_id, odks_to_clear, seqno)?;

        // Save Risk Signals
        RiskSignal::bulk_create(conn, sv_id, rs, newtypes::RiskSignalGroupKind::Doc, false)?;

        // Then add some extracted OCR data to the vault.
        let source = DataLifetimeSource::Ocr;
        let seqno = uvw.patch_data(conn, ocr_data, source, None)?.seqno;

        let (document_score, _) = score_response.document_score();
        let (ocr_confidence_score, _) = score_response.id_ocr_confidence();
        let selfie_score = score_response.selfie_match().0;

        let update = IdentityDocumentUpdate {
            completed_seqno: Some(seqno),
            document_score,
            selfie_score,
            ocr_confidence_score,
            status: Some(IdentityDocumentStatus::Complete),
            vaulted_document_type: Some(dk),
        };
        IdentityDocument::update(conn, id_doc_id, update)?;

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
    ) -> ApiResult<TransitionResult> {
        Err(ApiErrorKind::AssertionError(
            "Incode machine already complete".into(),
        ))?
    }

    fn next_state(_: &VerificationSession) -> IncodeState {
        Complete::new()
    }
}
