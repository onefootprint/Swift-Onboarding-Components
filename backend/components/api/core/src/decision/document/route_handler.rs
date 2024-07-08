use super::meta_headers::MetaHeaders;
use crate::decision;
use crate::errors::error_with_code::ErrorWithCode;
use crate::errors::onboarding::OnboardingError;
use crate::errors::ValidationError;
use crate::utils::file_upload::FileUpload;
use crate::utils::vault_wrapper::seal_file_and_upload_to_s3;
use crate::utils::vault_wrapper::Any;
use crate::utils::vault_wrapper::Person;
use crate::utils::vault_wrapper::VaultWrapper;
use crate::utils::vault_wrapper::VwArgs;
use crate::FpResult;
use crate::State;
use api_wire_types::CreateDocumentRequest;
use api_wire_types::DocumentResponse;
use db::models::data_lifetime::DataLifetime;
use db::models::decision_intent::DecisionIntent;
use db::models::document::Document;
use db::models::document::DocumentUpdate;
use db::models::document::NewDocumentArgs;
use db::models::document_request::DocumentRequest as DbDocumentRequest;
use db::models::document_request::DocumentRequestIdentifier;
use db::models::document_upload::DocumentUpload;
use db::models::document_upload::NewDocumentUploadArgs;
use db::models::incode_verification_session::IncodeVerificationSession;
use db::models::insight_event::CreateInsightEvent;
use db::models::ob_configuration::ObConfiguration;
use db::models::user_consent::UserConsent;
use db::models::user_timeline::UserTimeline;
use db::models::vault::Vault;
use db::models::workflow::Workflow;
use feature_flag::BoolFlag;
use newtypes::DataLifetimeSource;
use newtypes::DecisionIntentKind;
use newtypes::DocumentFixtureResult;
use newtypes::DocumentId;
use newtypes::DocumentRequestKind;
use newtypes::DocumentReviewStatus;
use newtypes::DocumentSide;
use newtypes::DocumentStatus;
use newtypes::IdDocKind;
use newtypes::IncodeConfigurationId;
use newtypes::ScopedVaultId;
use newtypes::TenantId;
use newtypes::WorkflowId;

/// Route handler for "/hosted/documents"
pub async fn handle_document_create(
    state: &State,
    create_identity_document_request: CreateDocumentRequest,
    tenant_id: TenantId,
    sv_id: ScopedVaultId,
    wf_id: WorkflowId,
    insight: CreateInsightEvent,
) -> FpResult<DocumentId> {
    let CreateDocumentRequest {
        document_type,
        country_code,
        fixture_result,
        skip_selfie,
        device_type,
        request_id,
    } = create_identity_document_request;
    let doc_kind: DocumentRequestKind = document_type.into();
    let su_id = sv_id.clone();
    let su_id2 = su_id.clone();
    let ff_client = state.ff_client.clone();

    tracing::info!(has_request_id=%request_id.is_some(), "Creating document with request_id");

    let workflow_id = wf_id.clone();
    let dr = state
        .db_pool
        .db_query(move |conn| -> FpResult<_> {
            let id = if let Some(request_id) = request_id.as_ref() {
                DocumentRequestIdentifier::Id(request_id)
            } else {
                DocumentRequestIdentifier::Kind(doc_kind)
            };
            let dr = DbDocumentRequest::get(conn, &workflow_id, id)?
                .ok_or(OnboardingError::NoDocumentRequestFound)?;
            Ok(dr)
        })
        .await?;

    if DocumentRequestKind::from(document_type) != dr.kind {
        return ValidationError("Document type not compatible with document request kind").into();
    }

    if !dr.kind.is_identity() {
        // Non-identity documents don't require many checks, we can just create the doc
        let id = state
            .db_pool
            .db_transaction(move |conn| -> FpResult<_> {
                let args = NewDocumentArgs {
                    request_id: dr.id,
                    document_type,
                    country_code,
                    fixture_result: None,
                    skip_selfie: None,
                    device_type,
                    insight,
                };
                let id_doc = Document::get_or_create(conn, args)?;
                Ok(id_doc.id)
            })
            .await?;
        return Ok(id);
    }

    let uvw = state
        .db_pool
        .db_query(move |conn| -> FpResult<_> {
            let uvw: VaultWrapper<_> = VaultWrapper::<Person>::build(conn, VwArgs::Tenant(&su_id2))?;
            Ok(uvw)
        })
        .await?;

    let residential_country = uvw.get_decrypted_country(state).await?;
    let document_type = IdDocKind::try_from(document_type)?;

    let id_doc = state
        .db_pool
        .db_transaction(move |conn| -> FpResult<_> {
            let country_code =
                country_code.ok_or(ValidationError("Identity document requires country code"))?;
            let (obc, _) = ObConfiguration::get(conn, &wf_id)?;
            crate::decision::vendor::incode::validate_doc_type_is_allowed(
                &obc,
                document_type,
                residential_country,
                country_code,
            )?;

            if let Some(fixture_result) = fixture_result {
                // Check we're in sandbox
                let vault = Vault::get(conn, &su_id)?;
                if vault.is_live {
                    return Err(OnboardingError::CannotCreateFixtureResultForNonSandbox.into());
                }

                if matches!(fixture_result, DocumentFixtureResult::Real)
                    && !ff_client.flag(BoolFlag::CanMakeDemoIncodeRequestsInSandbox(&tenant_id))
                {
                    return Err(OnboardingError::RealDocumentFixtureNotAllowed.into());
                }
            }

            // we don't want any tenant to be able to skip selfie by default, eventually this will
            // be in the OBC
            let can_tenant_skip_selfie = ff_client.flag(BoolFlag::CanSkipSelfie(&tenant_id));

            let should_skip_selfie = if skip_selfie == Some(true) && dr.should_collect_selfie() {
                if can_tenant_skip_selfie {
                    tracing::info!(sv_id=%su_id, tenant=%tenant_id, wf_id=%wf_id, device_type=?device_type, requires_selfie=%dr.should_collect_selfie(), "User skipping selfie");
                    true
                } else {
                    tracing::warn!(sv_id=%su_id, tenant=%tenant_id, wf_id=%wf_id, device_type=?device_type, "User tried skipping selfie, but tenant is not allowed");
                    false
                }
            } else {
                false
            };

            let args = NewDocumentArgs {
                request_id: dr.id,
                document_type: document_type.into(),
                country_code: Some(country_code),
                fixture_result,
                skip_selfie: Some(should_skip_selfie),
                device_type,
                insight,
            };

            let id_doc = Document::get_or_create(conn, args)?;
            Ok(id_doc)
        })
        .await?;

    Ok(id_doc.id)
}

/// Route handler for "/hosted/documents/{id}/upload/{side}"
#[allow(clippy::too_many_arguments)]
pub async fn handle_document_upload(
    state: &State,
    wf_id: WorkflowId,
    sv_id: ScopedVaultId,
    meta: MetaHeaders,
    file: FileUpload,
    document_id: DocumentId,
    side: DocumentSide,
) -> FpResult<()> {
    let su_id = sv_id.clone();
    let (wf, doc, doc_request, uvw, user_consent) = state
        .db_pool
        .db_query(move |conn| -> FpResult<_> {
            let wf = Workflow::get(conn, &wf_id)?;
            let (doc, doc_request) = Document::get(conn, &document_id)?;
            let uvw: VaultWrapper<Person> = VaultWrapper::build(conn, VwArgs::Tenant(&su_id))?;
            let user_consent = UserConsent::get_for_workflow(conn, &wf_id)?;
            Ok((wf, doc, doc_request, uvw, user_consent))
        })
        .await?;

    if doc.status != DocumentStatus::Pending {
        return Err(ErrorWithCode::DocumentNotPending.into());
    }
    let should_collect_selfie = doc_request.should_collect_selfie() && !doc.should_skip_selfie();
    if side == DocumentSide::Selfie && !should_collect_selfie {
        return Err(OnboardingError::NotExpectingSelfie.into());
    }
    if user_consent.is_none() && doc_request.kind.is_identity() {
        return Err(OnboardingError::UserConsentNotFound.into());
    }

    // Upload the image to s3
    let di = doc.identifier(&doc_request.config, side)?;
    let su_id = sv_id.clone();
    let (e_data_key, s3_url) = seal_file_and_upload_to_s3(state, &file, &di, &uvw.vault, &su_id).await?;

    // Create uploads for the document
    // Check if we should be initiating requests (e.g. check if we are testing)
    let should_initiate_reqs =
        crate::decision::utils::should_initiate_requests_for_document(&uvw.vault, doc.fixture_result).await?
            && doc_request.kind.should_initiate_incode_requests();

    state
        .db_pool
        .db_transaction(move |conn| -> FpResult<_> {
            let uvw = VaultWrapper::lock_for_onboarding(conn, &su_id)?;
            // Vault the images under latest uploads
            let source = DataLifetimeSource::LikelyHosted;
            let (d, seqno) = uvw.put_document_unsafe(
                conn,
                di,
                file.mime_type,
                file.filename,
                e_data_key,
                s3_url,
                source,
                None,
                false,
            )?;
            let args = NewDocumentUploadArgs {
                document_id: doc.id,
                side,
                s3_url: d.s3_url,
                e_data_key: d.e_data_key,
                created_seqno: seqno,
                is_instant_app: meta.is_instant_app,
                is_app_clip: meta.is_app_clip,
                is_manual: meta.is_manual,
                is_extra_compressed: meta.is_extra_compressed,
                is_upload: meta.is_upload,
                is_forced_upload: meta.is_forced_upload,
            };
            DocumentUpload::create(conn, args)?;

            // Now that the document is created, either initiate IDV reqs or create fixture data
            if should_initiate_reqs {
                // Initiate IDV reqs once and only once for this id_doc
                DecisionIntent::get_or_create_for_workflow(
                    conn,
                    &su_id,
                    &wf.id,
                    DecisionIntentKind::DocScan,
                )?;
            };
            Ok(())
        })
        .await?;

    Ok(())
}

// setting is_re_run skips any retries due to errors received from Incode
pub struct IsRerun(pub bool);
pub struct IncodeConfigurationIdOverride(pub Option<IncodeConfigurationId>);

/// Route handler for /hosted/documents/{id}/process
/// TODO: appclip special logic
pub async fn handle_document_process(
    state: &State,
    sv_id: ScopedVaultId,
    wf_id: WorkflowId,
    tenant_id: TenantId,
    doc_id: DocumentId,
    is_re_run: IsRerun,
    configuration_id_override: IncodeConfigurationIdOverride,
) -> FpResult<DocumentResponse> {
    let su_id = sv_id.clone();
    let wf_id2 = wf_id.clone();
    let wf_id3 = wf_id.clone();
    let (di, id_doc, dr, failed_attempts, uvw, missing_sides, should_collect_selfie, obc) = state
        .db_pool
        .db_transaction(move |conn| -> FpResult<_> {
            let di = DecisionIntent::get_or_create_for_workflow(
                conn,
                &su_id,
                &wf_id,
                DecisionIntentKind::DocScan,
            )?;

            let (obc, _) = ObConfiguration::get(conn, &wf_id)?;
            let (id_doc, dr) = Document::get(conn, &doc_id)?;
            let side_from_session: Option<DocumentSide> = IncodeVerificationSession::get(conn, &id_doc.id)?
                .and_then(|session| session.side_from_session());

            let uvw: VaultWrapper<Person> = VaultWrapper::build(conn, VwArgs::Tenant(&su_id))?;
            let should_collect_selfie = dr.should_collect_selfie() && !id_doc.should_skip_selfie();
            let (missing_sides, attempts_for_side) =
                super::utils::get_side_info(conn, &id_doc, should_collect_selfie, side_from_session)?;

            Ok((
                di,
                id_doc,
                dr,
                attempts_for_side,
                uvw,
                missing_sides,
                should_collect_selfie,
                obc,
            ))
        })
        .await?;

    let is_sandbox = id_doc.fixture_result.is_some();
    let is_non_identity_document = !dr.kind.is_identity();
    let should_initiate_reqs =
        crate::decision::utils::should_initiate_requests_for_document(&uvw.vault, id_doc.fixture_result)
            .await?
            && dr.kind.should_initiate_incode_requests();

    let response = if should_initiate_reqs {
        // Not sandbox - make our request to vendors!
        crate::utils::incode_helper::handle_incode_request(
            state,
            id_doc.id,
            tenant_id,
            obc,
            di.id,
            &uvw,
            dr,
            is_sandbox,
            should_collect_selfie,
            &wf_id3,
            state.ff_client.clone(),
            failed_attempts,
            is_re_run.0,
            missing_sides.0,
            configuration_id_override,
        )
        .await?
    } else {
        // If we are done collecting sides, it means we can either:
        // 1) write sandbox fixtures
        // 2) complete the proof of ssn upload
        let next_side_to_collect = missing_sides.next_side_to_collect();
        if next_side_to_collect.is_none() {
            let sv_id = sv_id.clone();
            if is_non_identity_document {
                complete_non_identity_document(state, id_doc, sv_id).await?;
            } else {
                decision::vendor::incode::states::save_incode_fixtures(
                    state,
                    &sv_id,
                    &wf_id2,
                    obc,
                    id_doc,
                    should_collect_selfie,
                )
                .await?;
            }
        }
        DocumentResponse {
            next_side_to_collect,
            errors: vec![],
            is_retry_limit_exceeded: false,
        }
    };
    Ok(response)
}

pub async fn complete_non_identity_document(
    state: &State,
    id_doc: Document,
    sv_id: ScopedVaultId,
) -> FpResult<()> {
    state
        .db_pool
        .db_transaction(move |conn| -> FpResult<()> {
            let id_doc_id = id_doc.id.clone();
            let dk = id_doc.document_type;
            let uvw = VaultWrapper::<Any>::lock_for_onboarding(conn, &sv_id)?;
            let seqno = DataLifetime::get_current_seqno(conn)?;
            // Create a timeline event
            let info = newtypes::DocumentUploadedInfo {
                id: id_doc_id.clone(),
            };
            UserTimeline::create(conn, info, uvw.vault.id.clone(), sv_id.clone())?;
            // mark identity doc as complete
            let update = DocumentUpdate {
                completed_seqno: Some(seqno),
                document_score: None,
                selfie_score: None,
                ocr_confidence_score: None,
                status: Some(DocumentStatus::Complete),
                vaulted_document_type: Some(dk),
                curp_completed_seqno: None,
                validated_country_code: None,
                // Non-ID docs need to be reviewed by a human - put them into a review required state
                review_status: Some(DocumentReviewStatus::PendingHumanReview),
            };
            Document::update(conn, &id_doc_id, update)?;

            Ok(())
        })
        .await?;

    Ok(())
}
