use crate::ProtectedAuth;
use actix_multipart::Multipart;
use actix_web::web::Json;
use actix_web::{
    post,
    web,
    HttpRequest,
};
use api_core::decision::document::meta_headers::MetaHeaders;
use api_core::decision::features::incode_docv::IncodeOcrComparisonDataFields;
use api_core::errors::{
    ApiResult,
    AssertionError,
};
use api_core::types::{
    EmptyResponse,
    JsonApiResponse,
    ResponseData,
};
use api_core::utils::file_upload::handle_file_upload;
use api_core::utils::onboarding::NewOnboardingArgs;
use api_core::utils::vault_wrapper::{
    Any,
    VaultWrapper,
    VwArgs,
};
use api_core::{
    decision,
    State,
};
use api_wire_types::{
    CreateDocumentResponse,
    DocumentResponse,
};
use db::models::decision_intent::DecisionIntent;
use db::models::document::{
    Document,
    NewDocumentArgs,
};
use db::models::document_request::{
    DocumentRequest,
    DocumentRequestIdentifier,
};
use db::models::incode_verification_session::IncodeVerificationSession;
use db::models::insight_event::CreateInsightEvent;
use db::models::ob_configuration::ObConfiguration;
use db::models::scoped_vault::ScopedVault;
use db::models::workflow::Workflow;
use db::DbError;
use newtypes::{
    DecisionIntentKind,
    DocumentId,
    DocumentKind,
    DocumentRequestKind,
    DocumentSide,
    FpId,
    IncodeEnvironment,
    IncodeVerificationSessionId,
    IncodeVerificationSessionKind,
    Iso3166TwoDigitCountryCode,
    ObConfigurationKey,
    ObConfigurationKind,
    TenantId,
    WorkflowSource,
};

#[derive(Debug, serde::Deserialize)]
pub struct Request {
    id: IncodeVerificationSessionId,
    /// Often when re-running an incode machine, the last run failed. In this case, all of the
    /// DocumentUploads for the final side will be marked as failed and you may have to manually
    /// mark one as not failed for it to be picked up by the machine by setting its deactivated_at
    /// to null and failure_reasons to an emptyarray.
    /// Be aware that this will change the display in the dashboard
    i_acknowledge_that_i_re_enabled_my_upload: Option<bool>,
    force_no_selfie: Option<bool>,
    environment: Option<IncodeEnvironment>,
}

#[post("/private/incode/re_run")]
pub async fn rerun_machine(
    state: web::Data<State>,
    request: Json<Request>,
    _: ProtectedAuth,
) -> JsonApiResponse<DocumentResponse> {
    let Request {
        id,
        i_acknowledge_that_i_re_enabled_my_upload,
        force_no_selfie,
        environment,
    } = request.into_inner();
    if !i_acknowledge_that_i_re_enabled_my_upload.unwrap_or_default() {
        return Err(
            AssertionError("Please acknowledge that you re-enabled the relevant DocumentUpload").into(),
        );
    }

    let force_no_selfie = force_no_selfie.unwrap_or_default();

    let (id_doc, dr, su, di, uvw, obc) = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let old_session =
                IncodeVerificationSession::get(conn, &id)?.ok_or(AssertionError("No session found"))?;
            let (id_doc, dr) = Document::get(conn, &old_session.identity_document_id)?;
            let su = ScopedVault::get(conn, &dr.workflow_id)?;
            let uvw = VaultWrapper::build(conn, VwArgs::Tenant(&su.id))?;
            let (obc, _) = ObConfiguration::get(conn, &dr.workflow_id)?;
            // TODO mark the latest DocumentUpload as not deactivated. Right now this needs to be done
            // manually
            let di =
                DecisionIntent::create(conn, DecisionIntentKind::DocScan, &su.id, Some(&dr.workflow_id))?;
            // Deactivate the old IVS
            IncodeVerificationSession::deactivate(conn, &old_session.id)?;
            // Make a new IVS
            let kind = if force_no_selfie {
                IncodeVerificationSessionKind::IdDocument
            } else {
                old_session.kind
            };
            let config_id = old_session.incode_configuration_id.clone();
            IncodeVerificationSession::create(
                conn,
                id_doc.id.clone(),
                config_id,
                kind,
                environment.or(old_session.incode_environment),
                None,
            )?;
            Ok((id_doc, dr, su, di, uvw, obc))
        })
        .await?;

    let response = api_core::utils::incode_helper::handle_incode_request(
        &state,
        id_doc.id,
        su.tenant_id,
        obc,
        di.id,
        &uvw,
        dr.clone(),
        !su.is_live,
        dr.should_collect_selfie(),
        &dr.workflow_id,
        state.ff_client.clone(),
        Some(0),
        true,
        vec![],
    )
    .await?;
    ResponseData::ok(response).json()
}


#[derive(Debug, serde::Deserialize)]
pub struct AdhocCreateDocumentRequest {
    pub document_type: DocumentKind,
    pub playbook_key: ObConfigurationKey,
    pub country_code: Iso3166TwoDigitCountryCode,
    pub fp_id: FpId,
    pub tenant_id: TenantId,
    pub is_live: bool,
}
#[post("/private/incode/adhoc/documents")]
pub async fn adhoc_create_document_and_workflow(
    state: web::Data<State>,
    request: Json<AdhocCreateDocumentRequest>,
    _: ProtectedAuth,
) -> JsonApiResponse<CreateDocumentResponse> {
    // check NPV, can always relax this
    let AdhocCreateDocumentRequest {
        document_type,
        playbook_key,
        country_code,
        fp_id,
        tenant_id,
        is_live,
    } = request.into_inner();

    let doc_kind: DocumentRequestKind = document_type.into();

    let (vw, document_request) = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let sv = ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?;
            let uvw = VaultWrapper::<Any>::build(conn, VwArgs::Tenant(&sv.id))?;

            let (obc, _) = ObConfiguration::get_enabled(conn, (&playbook_key, &tenant_id, is_live))
                .map_err(|_| DbError::PlaybookNotFound)?;

            if obc.kind != ObConfigurationKind::Document {
                return Err(AssertionError("Must use playbook of kind Document").into());
            }

            let args = NewOnboardingArgs {
                existing_wf_id: None,
                wfr_id: None,
                force_create: false,
                sv: &sv,
                obc: &obc,
                insight_event: None,
                new_biz_args: None,
                source: WorkflowSource::Unknown,
                actor: None,
                maybe_prefill_data: None,
                is_neuro_enabled: false,
                fixture_result: None,
            };


            let (wf_id, _) = api_core::utils::onboarding::get_or_start_onboarding(conn, args)?;
            let document_request =
                DocumentRequest::get(conn, &wf_id, DocumentRequestIdentifier::Kind(doc_kind))?
                    .ok_or(AssertionError("No document request found"))?;

            Ok((uvw, document_request))
        })
        .await?;

    // check NPV
    if !vw.vault.is_created_via_api {
        return Err(AssertionError("Cannot run for a portable vault").into());
    }

    // check we've vaulted the fields, could probably ignore this in the req maybe
    let ocr_comparison_fields = IncodeOcrComparisonDataFields::compose(&state.enclave_client, &vw).await?;
    if ocr_comparison_fields == IncodeOcrComparisonDataFields::default() {
        return Err(AssertionError("id data not vaulted").into());
    }

    // Create our identity document now
    let doc_id = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let args = NewDocumentArgs {
                request_id: document_request.id,
                document_type,
                country_code: Some(country_code),
                fixture_result: None,
                skip_selfie: None,
                device_type: None,
                insight: CreateInsightEvent::default(),
            };

            let id_doc = Document::get_or_create(conn, args)?;
            Ok(id_doc)
        })
        .await?;


    ResponseData::ok(CreateDocumentResponse { id: doc_id.id }).json()

    // create workflow
}


#[post("/private/incode/adhoc/{id}/upload/{side}")]
pub async fn adhoc_upload_and_process(
    state: web::Data<State>,
    _: ProtectedAuth,
    args: web::Path<(DocumentId, DocumentSide)>,
    mut payload: Multipart,
    request: HttpRequest,
    meta: MetaHeaders,
) -> JsonApiResponse<EmptyResponse> {
    let file = handle_file_upload(&mut payload, &request, None, 5_242_880, 100).await?;

    let (document_id, side) = args.into_inner();
    let (iddoc, wf, tenant_id) = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let (iddoc, doc_req) = Document::get(conn, &document_id)?;
            let wf = Workflow::get(conn, &doc_req.workflow_id)?;
            let sv = ScopedVault::get(conn, &wf.scoped_vault_id)?;

            Ok((iddoc, wf, sv.tenant_id))
        })
        .await?;
    let sv_id = wf.scoped_vault_id.clone();
    let wf_id = wf.id.clone();

    decision::document::route_handler::handle_document_upload(
        &state,
        wf,
        sv_id.clone(),
        meta,
        file,
        iddoc.id.clone(),
        side,
    )
    .await?;

    // TODO: thread through a incode config ID override
    let response = decision::document::route_handler::handle_document_process(
        &state,
        sv_id.clone(),
        wf_id,
        tenant_id,
        iddoc.id.clone(),
    )
    .await?;

    if !response.errors.is_empty() {
        tracing::info!(errors=?response.errors, ?side, document_id=%iddoc.id, sv_id=?sv_id,  "errors processing adhoc document");
    }

    ResponseData::ok(EmptyResponse {}).json()
}
