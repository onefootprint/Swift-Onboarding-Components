use newtypes::{
    DataIdentifier, DataLifetimeSource, DecisionIntentKind, DocKind, DocumentKind, DocumentRequestKind,
    DocumentScanDeviceType, DocumentSide, IdDocKind, IdentityDocumentFixtureResult, IdentityDocumentId,
    IdentityDocumentStatus, Iso3166TwoDigitCountryCode, S3Url, ScopedVaultId, SealedVaultDataKey, TenantId,
    WorkflowId,
};

use crate::{
    decision,
    errors::{onboarding::OnboardingError, ApiResult},
    utils::file_upload::FileUpload,
    State,
};

use crate::utils::vault_wrapper::{seal_file_and_upload_to_s3, Person, VaultWrapper, VwArgs};
use api_wire_types::{CreateIdentityDocumentRequest, DocumentResponse};
use feature_flag::BoolFlag;

use crate::decision::vendor::incode::states::vault_complete_images;
use db::{
    models::{
        decision_intent::DecisionIntent,
        document_request::DocumentRequest as DbDocumentRequest,
        document_upload::{DocumentUpload, NewDocumentUploadArgs},
        identity_document::{IdentityDocument, IdentityDocumentUpdate, NewIdentityDocumentArgs},
        incode_verification_session::IncodeVerificationSession,
        ob_configuration::ObConfiguration,
        user_consent::UserConsent,
        user_timeline::UserTimeline,
        vault::Vault,
        workflow::Workflow,
    },
    TxnPgConn,
};

use super::meta_headers::MetaHeaders;

/// Route handler for "/hosted/user/documents"
pub async fn handle_document_create(
    state: &State,
    create_identity_document_request: CreateIdentityDocumentRequest,
    tenant_id: TenantId,
    sv_id: ScopedVaultId,
    wf_id: WorkflowId,
) -> ApiResult<IdentityDocumentId> {
    let CreateIdentityDocumentRequest {
        document_type,
        country_code,
        fixture_result,
        skip_selfie,
        device_type,
    } = create_identity_document_request;
    let doc_kind: DocKind = document_type.into();
    let su_id = sv_id.clone();
    let su_id2 = su_id.clone();
    let ff_client = state.feature_flag_client.clone();

    // Handle proof of SSN, which doesn't involve a lot of other checks (at this time)
    if !doc_kind.is_identity() {
        let id_doc_id =
            handle_non_identity_document(state, wf_id, document_type, country_code, device_type, doc_kind)
                .await?;
        return Ok(id_doc_id);
    }

    let uvw = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let uvw: VaultWrapper<_> = VaultWrapper::<Person>::build(conn, VwArgs::Tenant(&su_id2))?;
            Ok(uvw)
        })
        .await?;

    let residential_country = uvw.get_decrypted_country(state).await?;

    let id_doc = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            // If there's no doc requests, nothing to do here
            let doc_request =
                DbDocumentRequest::get(conn, &wf_id, DocumentRequestKind::Identity)?.ok_or(OnboardingError::NoDocumentRequestFound)?;

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

                if matches!(fixture_result, IdentityDocumentFixtureResult::Real) && 
                    !ff_client.flag(BoolFlag::CanMakeDemoIncodeRequestsInSandbox(&tenant_id)) {
                    return Err(OnboardingError::RealDocumentFixtureNotAllowed.into());
                }
            }


            // we don't want any tenant to be able to skip selfie by default, eventually this will
            // be in the OBC
            let can_tenant_skip_selfie = ff_client
                .flag(BoolFlag::CanSkipSelfie(&tenant_id));

            
            let should_skip_selfie = if skip_selfie == Some(true) && doc_request.should_collect_selfie {
                if can_tenant_skip_selfie {
                    tracing::info!(sv_id=%su_id, tenant=%tenant_id, wf_id=%wf_id, device_type=?device_type, requires_selfie=%doc_request.should_collect_selfie, "User skipping selfie");
                    true
                } else {
                    tracing::warn!(sv_id=%su_id, tenant=%tenant_id, wf_id=%wf_id, device_type=?device_type, "User tried skipping selfie, but tenant is not allowed");
                    false
                }

            } else {
                false
            };
            
            let args = NewIdentityDocumentArgs {
                request_id: doc_request.id,
                document_type,
                country_code,
                fixture_result,
                skip_selfie: Some(should_skip_selfie),
                device_type
            };

            let id_doc = IdentityDocument::get_or_create(conn, args)?;
            Ok(id_doc)
        })
        .await?;

    Ok(id_doc.id)
}

/// Route handler for "/hosted/user/documents/{id}/upload/{side}"
#[allow(clippy::too_many_arguments)]
pub async fn handle_document_upload(
    state: &State,
    workflow: Workflow,
    sv_id: ScopedVaultId,
    meta: MetaHeaders,
    file: FileUpload,
    document_id: IdentityDocumentId,
    side: DocumentSide,
) -> ApiResult<Option<DocumentResponse>> {
    let wf_id = workflow.id.clone();
    let wf_id2 = wf_id.clone();
    let su_id = sv_id.clone();
    let (id_doc, doc_request, uvw, user_consent) = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let (id_doc, doc_request) = IdentityDocument::get(conn, &document_id)?;
            let uvw: VaultWrapper<Person> = VaultWrapper::build(conn, VwArgs::Tenant(&su_id))?;
            let user_consent = UserConsent::get_for_workflow(conn, &wf_id)?;
            Ok((id_doc, doc_request, uvw, user_consent))
        })
        .await?;
    let meta2 = meta.clone();
    let doc_kind: DocKind = id_doc.document_type.into();

    if id_doc.status != IdentityDocumentStatus::Pending {
        // Do not change this error - the frontend is relying upon it
        return Err(OnboardingError::IdentityDocumentNotPending.into());
    }
    // We support the flow
    let should_collect_selfie = doc_request.should_collect_selfie && !id_doc.should_skip_selfie();

    if side == DocumentSide::Selfie && !should_collect_selfie {
        return Err(OnboardingError::NotExpectingSelfie.into());
    }

    check_consent(user_consent, doc_kind)?;

    // Upload the image to s3
    let di = DataIdentifier::from(DocumentKind::LatestUpload(id_doc.document_type, side));
    let su_id = sv_id.clone();
    let (e_data_key, s3_url) =
        seal_file_and_upload_to_s3(state, &file, di.clone(), &uvw.vault, &su_id).await?;

    // Create uploads for the document
    // Check if we should be initiating requests (e.g. check if we are testing)
    let should_initiate_reqs =
        crate::decision::utils::should_initiate_requests_for_document(&uvw.vault, id_doc.fixture_result)
            .await?
            && doc_kind.should_initiate_incode_requests();

    let missing_sides = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            create_latest_doc_upload(
                conn,
                &su_id,
                di,
                s3_url,
                side,
                id_doc.id.clone(),
                file,
                e_data_key,
                meta2,
            )?;
            let (missing_sides, _) =
                super::utils::get_side_info(conn, &id_doc, should_collect_selfie, Some(side))?;

            // Now that the document is created, either initiate IDV reqs or create fixture data
            if should_initiate_reqs {
                // Initiate IDV reqs once and only once for this id_doc
                DecisionIntent::get_or_create_for_workflow(
                    conn,
                    &su_id,
                    &wf_id2,
                    DecisionIntentKind::DocScan,
                )?;
            };

            Ok(missing_sides)
        })
        .await?;

    // Compose the API response
    let next_side_to_collect = missing_sides.next_side_to_collect();
    let response = if meta.process_separately.unwrap_or_default() {
        // Tracing so we can query for when no requests are being sent with the old API
        tracing::info!("Processing separately");
        // Bogus response - the client isn't reading it anymore
        Some(DocumentResponse {
            next_side_to_collect,
            errors: vec![],
            is_retry_limit_exceeded: false,
        })
    } else {
        None
    };

    Ok(response)
}


/// Route handler for /hosted/user/documents/{id}/process
/// TODO: appclip special logic
pub async fn handle_document_process(
    state: &State,
    sv_id: ScopedVaultId,
    wf_id: WorkflowId,
    tenant_id: TenantId,
    doc_id: IdentityDocumentId,
) -> ApiResult<DocumentResponse> {
    let su_id = sv_id.clone();
    let wf_id2 = wf_id.clone();
    let wf_id3 = wf_id.clone();
    let (di, id_doc, dr, failed_attempts, uvw, missing_sides, should_collect_selfie, obc) = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let di = DecisionIntent::get_or_create_for_workflow(
                conn,
                &su_id,
                &wf_id,
                DecisionIntentKind::DocScan,
            )?;

            let (obc, _) = ObConfiguration::get(conn, &wf_id)?;
            let (id_doc, dr) = IdentityDocument::get(conn, &doc_id)?;
            let side_from_session: Option<DocumentSide> = IncodeVerificationSession::get(conn, &id_doc.id)?
                .and_then(|session| session.side_from_session());

            let uvw: VaultWrapper<Person> = VaultWrapper::build(conn, VwArgs::Tenant(&su_id))?;
            let should_collect_selfie = dr.should_collect_selfie && !id_doc.should_skip_selfie();
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
    let doc_kind: DocKind = id_doc.document_type.into();
    let is_non_identity_document = !doc_kind.is_identity();
    let should_initiate_reqs =
        crate::decision::utils::should_initiate_requests_for_document(&uvw.vault, id_doc.fixture_result)
            .await?
            && doc_kind.should_initiate_incode_requests();

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
            state.feature_flag_client.clone(),
            failed_attempts,
            false,
            missing_sides.0,
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
    id_doc: IdentityDocument,
    sv_id: ScopedVaultId,
) -> ApiResult<()> {
    state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<()> {
            let id_doc_id = id_doc.id.clone();
            let dk = id_doc.document_type;
            let uvw = VaultWrapper::lock_for_onboarding(conn, &sv_id)?;
            // TODO: doc_type might need to come from incode once we get to that point
            let (_, seqno) = vault_complete_images(conn, &uvw, dk, &id_doc)?;
            // Create a timeline event
            let info = newtypes::IdentityDocumentUploadedInfo {
                id: id_doc_id.clone(),
            };
            UserTimeline::create(conn, info, uvw.vault.id.clone(), sv_id.clone())?;
            // mark identity doc as complete

            let update = IdentityDocumentUpdate {
                completed_seqno: Some(seqno),
                document_score: None,
                selfie_score: None,
                ocr_confidence_score: None,
                status: Some(IdentityDocumentStatus::Complete),
                vaulted_document_type: Some(dk),
            };
            IdentityDocument::update(conn, &id_doc_id, update)?;

            Ok(())
        })
        .await?;

    Ok(())
}

async fn handle_non_identity_document(
    state: &State,
    workflow_id: WorkflowId,
    document_type: IdDocKind,
    country_code: Iso3166TwoDigitCountryCode,
    device_type: Option<DocumentScanDeviceType>,
    doc_kind: DocKind,
) -> ApiResult<IdentityDocumentId> {
    state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            // If there's no doc request, nothing to do here
            let doc_request = DbDocumentRequest::get(conn, &workflow_id, doc_kind.into())?
                .ok_or(OnboardingError::NoDocumentRequestFound)?;


            let args = NewIdentityDocumentArgs {
                request_id: doc_request.id,
                document_type,
                country_code,
                fixture_result: None,
                skip_selfie: None,
                device_type,
            };

            let id_doc = IdentityDocument::get_or_create(conn, args)?;
            Ok(id_doc.id)
        })
        .await
}

#[allow(clippy::too_many_arguments)]
fn create_latest_doc_upload(
    conn: &mut TxnPgConn,
    sv_id: &ScopedVaultId,
    di: DataIdentifier,
    s3_url: S3Url,
    side: DocumentSide,
    identity_document_id: IdentityDocumentId,
    file: FileUpload,
    e_data_key: SealedVaultDataKey,
    meta: MetaHeaders,
) -> ApiResult<()> {
    let uvw = VaultWrapper::lock_for_onboarding(conn, sv_id)?;
    // Vault the images under latest uploads
    let source = DataLifetimeSource::Hosted;
    let (d, seqno) = uvw.put_document_unsafe(
        conn,
        di,
        file.mime_type,
        file.filename,
        e_data_key,
        s3_url,
        source,
        None,
    )?;
    let args = NewDocumentUploadArgs {
        document_id: identity_document_id,
        side,
        s3_url: d.s3_url,
        e_data_key: d.e_data_key,
        created_seqno: seqno,
        is_instant_app: meta.is_instant_app,
        is_app_clip: meta.is_app_clip,
        is_manual: meta.is_manual,
        is_extra_compressed: meta.is_extra_compressed,
    };
    DocumentUpload::create(conn, args)?;
    Ok(())
}

fn check_consent(user_consent: Option<UserConsent>, doc_kind: DocKind) -> ApiResult<()> {
    if user_consent.is_none() && doc_kind.is_identity() {
        Err(OnboardingError::UserConsentNotFound.into())
    } else {
        Ok(())
    }
}
