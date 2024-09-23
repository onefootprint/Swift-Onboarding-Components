use super::IncodeStateTransition;
use super::ValidatedIdDocKind;
use super::VerificationSession;
use crate::decision::features::incode_docv::IncodeOcrComparisonDataFields;
use crate::decision::features::incode_docv::{
    self,
};
use crate::decision::features::incode_utils::ParsedIncodeFields;
use crate::decision::features::incode_utils::ParsedIncodeNames;
use crate::decision::vendor::incode::state::IncodeState;
use crate::decision::vendor::incode::state::TransitionResult;
use crate::decision::vendor::incode::state_machine::IncodeContext;
use crate::errors::ApiCoreError;
use crate::errors::AssertionError;
use crate::utils::file_upload::mime_type_to_extension;
use crate::utils::vault_wrapper::DataRequestSource;
use crate::utils::vault_wrapper::FingerprintedDataRequest;
use crate::utils::vault_wrapper::NewDocument;
use crate::utils::vault_wrapper::Person;
use crate::utils::vault_wrapper::VaultWrapper;
use crate::utils::vault_wrapper::WriteableVw;
use crate::vendor_clients::IncodeClients;
use crate::FpResult;
use crate::State;
use async_trait::async_trait;
use db::models::billing_event::BillingEvent;
use db::models::data_lifetime::DataLifetime;
use db::models::document::Document;
use db::models::document::DocumentImageArgs;
use db::models::document::DocumentUpdate;
use db::models::document_data::DocumentData;
use db::models::document_upload::DocumentUpload;
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
use newtypes::BillingEventKind;
use newtypes::CleanAndValidate;
use newtypes::DataIdentifier;
use newtypes::DataLifetimeSeqno;
use newtypes::DataLifetimeSource;
use newtypes::DataRequest;
use newtypes::DocumentDiKind;
use newtypes::DocumentId;
use newtypes::DocumentReviewStatus;
use newtypes::DocumentStatus;
use newtypes::FootprintReasonCode;
use newtypes::IdDocKind;
use newtypes::IdentityDataKind as IDK;
use newtypes::IncodeFailureReason;
use newtypes::ObConfigurationId;
use newtypes::ObConfigurationKind;
use newtypes::OcrDataKind as ODK;
use newtypes::PiiJsonValue;
use newtypes::PiiString;
use newtypes::ScopedVaultId;
use newtypes::ScrubbedPiiString;
use newtypes::ValidateArgs;
use newtypes::VendorAPI;
use newtypes::VendorValidatedCountryCode;
use newtypes::VerificationResultId;
use newtypes::WorkflowId;
use newtypes::WorkflowKind;
use std::collections::HashMap;
use strum::IntoEnumIterator;

// TODO this is more like the other workflow state transitions where it's actually a function
// of previous states. Our incode state machine workflow doesn't have a general way to handle
// it yet so we do it in a custom way
pub struct Complete {}

#[derive(Copy, Clone)]
pub(super) struct PreCompleteArgs<'a> {
    pub obc: &'a ObConfiguration,
    pub id_doc: &'a Document,
    pub sv_id: &'a ScopedVaultId,
    pub vw: &'a VaultWrapper,
    pub dk: ValidatedIdDocKind,
    pub expect_selfie: bool,
    pub fetch_ocr_response: &'a FetchOCRResponse,
    pub score_response: &'a FetchScoresResponse,
    pub doc_uploads: &'a [DocumentUpload],
}

#[tracing::instrument(skip_all)]
pub(super) async fn compute_ocr_data<'a>(
    state: &State,
    args: PreCompleteArgs<'a>,
    rs: &'a [NewRiskSignal],
) -> FpResult<FingerprintedDataRequest> {
    let PreCompleteArgs {
        obc,
        vw,
        fetch_ocr_response: r,
        sv_id,
        dk,
        ..
    } = args;
    let validate_args = ValidateArgs::for_bifrost(obc.is_live);

    let barcode_read_successfully = rs
        .iter()
        .any(|r| r.0 == FootprintReasonCode::DocumentBarcodeCouldBeRead);

    let data = ParsedIncodeFields::from_fetch_ocr_res(r)
        .0
        .into_iter()
        .map(|pif| {
            let di = DocumentDiKind::OcrData(dk.0, pif.odk).into();
            let v = PiiJsonValue::from_piistring(pif.value);
            (di, v)
        })
        .collect_vec();
    // For doc-first onboardings, populate identity data
    let id_data = if obc.is_doc_first {
        if barcode_read_successfully {
            doc_first_id_data(r, validate_args)
                .into_iter()
                // Don't add OCR data to the vault that already exists
                .filter(|(k, _)| !vw.has_field(k))
                .collect()
        } else {
            tracing::warn!("Skipping prefilling IDK data from doc because !barcode_read_successfully");
            vec![]
        }
    } else {
        vec![]
    };
    let data = HashMap::from_iter(data.into_iter().chain(id_data));
    let data = DataRequest::clean_and_validate(data, validate_args)?;
    let data = FingerprintedDataRequest::build(state, data, sv_id).await?;
    Ok(data)
}

fn doc_first_id_data(
    r: &FetchOCRResponse,
    validate_args: ValidateArgs,
) -> Vec<(DataIdentifier, PiiJsonValue)> {
    let parsed_names = ParsedIncodeNames::from_fetch_ocr_res(r);

    // Incode sends full state in one field, and 2 character code in another, so we handle here. we
    // prefer the checked address, since it uses an external service to validate
    let address_checked_bean_state = r.checked_address_bean.as_ref().and_then(|a| a.normalized_state());
    let address_fields_state = r.address_fields.as_ref().and_then(|a| a.normalized_state());
    let state = match address_checked_bean_state.or(address_fields_state) {
        Some(Ok(s)) => Some(s),
        _ => {
            tracing::warn!("incode changed address formats");
            None
        }
    };

    let address = r.checked_address_bean.as_ref().or(r.address_fields.as_ref());
    let zip5 = address.and_then(|a| a.normalized_zip5());

    let (drivers_license_number, drivers_license_state) =
        if r.type_of_id == Some(newtypes::incode::IncodeDocumentType::DriversLicense) {
            let state = r
                .issuing_state_us_2_char()
                .map(|s| s.to_string().into())
                .or(r.normalized_issuing_state());
            (r.document_number.as_ref(), state)
        } else {
            (None, None)
        };

    let all_data = vec![
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
        (IDK::State, state.as_ref()),
        (IDK::Zip, zip5.as_ref()),
        (IDK::Country, r.issuing_country_two_digit().as_ref()),
        (IDK::Dob, r.dob().ok().as_ref()),
        (IDK::DriversLicenseNumber, drivers_license_number),
        (IDK::DriversLicenseState, drivers_license_state.as_ref()),
    ]
    .into_iter()
    .flat_map(|(k, v)| v.map(|v| (DataIdentifier::from(k), PiiString::from(v.clone()))))
    .map(|(k, v)| (k, PiiJsonValue::from_piistring(v)))
    .collect::<HashMap<_, _>>();

    let raw_data = all_data.clone();

    // Don't add OCR data that fails validation - don't want it to block sign up
    all_data
        .into_iter()
        .filter(|(k, v)| {
            k.clone()
                .clean_and_validate(v.clone(), validate_args, &raw_data)
                .is_ok()
        })
        .collect()
}

pub(super) type NewRiskSignal = (FootprintReasonCode, VendorAPI, VerificationResultId);

pub(super) fn compute_risk_signals<'a>(
    args: PreCompleteArgs<'a>,
    vault_data: Option<IncodeOcrComparisonDataFields>,
    ocr_vres_id: VerificationResultId,
    score_vres_id: VerificationResultId,
    ignored_failure_reasons: &'a [IncodeFailureReason],
) -> FpResult<Vec<NewRiskSignal>> {
    let PreCompleteArgs {
        obc,
        id_doc,
        dk,
        expect_selfie,
        fetch_ocr_response,
        score_response,
        doc_uploads,
        ..
    } = args;
    if fetch_ocr_response.age().ok().is_some_and(|a| a < 18) {
        // TODO: add RS
        tracing::warn!("document submitted with age under 18");
    }

    let score_reason_codes = incode_docv::reason_codes_from_score_response(
        score_response,
        fetch_ocr_response,
        expect_selfie,
        dk.into_inner(),
    )
    .into_iter()
    .map(|r| (r, VendorAPI::IncodeFetchScores, score_vres_id.clone()));

    // Since doc first means we are vaulting `id.*` data from the document and obc.kind == Document
    // means we are _just_ collecting document, we don't have any data to actually match to
    let pii_matching_ocr_reason_codes = if !(obc.is_doc_first || obc.kind == ObConfigurationKind::Document) {
        // Only calculate OCR reason codes if we have already collected ID data
        let vault_data = vault_data.ok_or(AssertionError("Vault data not provided"))?;
        incode_docv::pii_matching_reason_codes_from_ocr_response(fetch_ocr_response, vault_data)
            .into_iter()
            .map(|r| (r, VendorAPI::IncodeFetchOcr, ocr_vres_id.clone()))
            .collect_vec()
    } else {
        vec![]
    };

    let drivers_license_features =
        incode_docv::drivers_license_features_from_ocr_response(fetch_ocr_response)
            .into_iter()
            .map(|r| (r, VendorAPI::IncodeFetchOcr, ocr_vres_id.clone()))
            .collect_vec();

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
        doc_uploads
            .iter()
            .any(|du| du.is_upload.unwrap_or(false))
            .then_some((
                FootprintReasonCode::DocumentNotLiveCapture,
                VendorAPI::IncodeFetchScores,
                score_vres_id.clone(),
            )),
        doc_uploads
            .iter()
            .any(|du| du.is_forced_upload.unwrap_or(false))
            .then_some((
                FootprintReasonCode::DocumentLiveCaptureFailed,
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
        .chain(drivers_license_features)
        .unique()
        .collect();
    Ok(s)
}

/// Now that we have the correct type of the document, add the images to the vault under the correct
/// type
#[tracing::instrument(skip_all)]
fn vault_complete_images(
    conn: &mut TxnPgConn,
    vw: &WriteableVw<Person>,
    dk: IdDocKind,
    id_doc: &Document,
) -> FpResult<(Vec<DocumentData>, DataLifetimeSeqno)> {
    // When we vault .latest_upload, we use the document_type that is provided by the user, not the
    // eventual doc_type from incode which is the one we vault the complete images for
    let doc_type = IdDocKind::try_from(id_doc.document_type)?;
    let docs = id_doc
        .images(conn, DocumentImageArgs::default())?
        .into_iter()
        .map(|u| {
            let di = DocumentDiKind::LatestUpload(doc_type, u.side).into();
            let mime_type = vw.get_mime_type(&di).unwrap_or("image/png");
            let file_extension = mime_type_to_extension(mime_type).unwrap_or("png");
            let kind = DocumentDiKind::from_id_doc_kind(dk, u.side).into();
            NewDocument {
                mime_type: mime_type.to_owned(),
                filename: format!("{}.{}", kind, file_extension),
                kind,
                e_data_key: u.e_data_key,
                s3_url: u.s3_url,
                source: DataLifetimeSource::LikelyHosted,
            }
        })
        .collect_vec();
    vw.put_documents_unsafe(conn, docs, None, false)
}

pub struct CompleteArgs<'a> {
    pub vault: &'a Vault,
    pub sv_id: &'a ScopedVaultId,
    pub wf_id: &'a WorkflowId,
    pub obc_id: &'a ObConfigurationId,
    pub id_doc_id: &'a DocumentId,
    pub dk: ValidatedIdDocKind,
    pub country_code: Option<VendorValidatedCountryCode>,
    pub ocr_data: FingerprintedDataRequest,
    pub score_response: FetchScoresResponse,
    pub rs: Vec<NewRiskSignal>,
}

impl Complete {
    /// Must call this before instantiating Complete
    #[tracing::instrument("Complete::enter", skip_all)]
    pub fn enter(conn: &mut TxnPgConn, args: CompleteArgs) -> FpResult<()> {
        let CompleteArgs {
            vault,
            sv_id,
            wf_id,
            obc_id,
            id_doc_id,
            dk,
            country_code,
            ocr_data,
            score_response,
            rs,
        } = args;
        let uvw = VaultWrapper::lock_for_onboarding(conn, sv_id)?;
        let (id_doc, _) = Document::get(conn, id_doc_id)?;
        let validated_doc_kind = dk.into_inner();

        // Create a timeline event
        let info = newtypes::DocumentUploadedInfo {
            id: id_doc_id.clone(),
        };
        UserTimeline::create(conn, info, vault.id.clone(), sv_id.clone())?;

        // The images were only vaulted under `.latest_upload` DIs. Now, vault them under the `.image` DIs.
        // Note that the dk here may be incorrect if we can't extract it from incode
        vault_complete_images(conn, &uvw, validated_doc_kind, &id_doc)?;

        // Clear all OCR data for this document kind, even if we're not replacing it
        let odks_to_clear = ODK::iter()
            .map(|odk| DocumentDiKind::OcrData(validated_doc_kind, odk).into())
            .collect();
        let seqno = DataLifetime::get_next_seqno(conn, &uvw.sv)?;
        DataLifetime::bulk_deactivate_kinds(conn, &uvw.sv, odks_to_clear, seqno)?;

        // Save Risk Signals
        RiskSignal::bulk_create(conn, sv_id, rs, newtypes::RiskSignalGroupKind::Doc, false)?;

        // Then add some extracted OCR data to the vault.
        let seqno = uvw.patch_data(conn, ocr_data, DataRequestSource::Ocr)?.seqno;

        let (document_score, _) = score_response.document_score();
        let (ocr_confidence_score, _) = score_response.id_ocr_confidence();
        let selfie_score = score_response.selfie_match().0;

        let wf = Workflow::get(conn, wf_id)?;
        let terminal_review_status = match wf.kind {
            // Documents in a document workflow must always be reviewed by a human
            WorkflowKind::Document => DocumentReviewStatus::PendingHumanReview,
            _ => DocumentReviewStatus::ReviewedByMachine,
        };

        let update = DocumentUpdate {
            completed_seqno: Some(seqno),
            document_score,
            selfie_score,
            ocr_confidence_score,
            status: Some(DocumentStatus::Complete),
            vaulted_document_type: Some(validated_doc_kind.into()),
            curp_completed_seqno: None,
            validated_country_code: country_code.map(|c| c.0),
            review_status: Some(terminal_review_status),
        };
        Document::update(conn, id_doc_id, update)?;

        BillingEvent::create(conn, sv_id, Some(obc_id), BillingEventKind::IdentityDocument)?;

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
    ) -> FpResult<Option<Self>> {
        Ok(None)
    }

    fn transition(
        self,
        _: &mut TxnPgConn,
        _: &IncodeContext,
        _: &VerificationSession,
    ) -> FpResult<TransitionResult> {
        Err(ApiCoreError::AssertionError(
            "Incode machine already complete".into(),
        ))?
    }

    fn next_state(_: &VerificationSession) -> IncodeState {
        Complete::new()
    }
}
