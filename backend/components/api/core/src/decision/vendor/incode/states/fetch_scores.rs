use super::compute_ocr_data;
use super::compute_risk_signals;
use super::Complete;
use super::CompleteArgs;
use super::IncodeStateTransition;
use super::NewRiskSignal;
use super::PreCompleteArgs;
use super::ValidatedIdDocKind;
use super::VerificationSession;
use crate::decision::features::incode_docv::IncodeOcrComparisonDataFields;
use crate::decision::vendor::incode::state::IncodeState;
use crate::decision::vendor::incode::state::TransitionResult;
use crate::decision::vendor::incode::IncodeContext;
use crate::decision::vendor::into_fp_error;
use crate::decision::vendor::vendor_api::loaders;
use crate::decision::vendor::verification_result::save_vreq_and_vres;
use crate::decision::vendor::verification_result::SaveVerificationResultArgs;
use crate::decision::vendor::VendorAPIError;
use crate::utils::vault_wrapper::Any;
use crate::utils::vault_wrapper::EnclaveDecryptOperation;
use crate::utils::vault_wrapper::FingerprintedDataRequest;
use crate::utils::vault_wrapper::Pii;
use crate::utils::vault_wrapper::VaultWrapper;
use crate::vendor_clients::IncodeClients;
use crate::ApiCoreError;
use crate::FpResult;
use api_errors::ServerErr;
use async_trait::async_trait;
use db::models::decision_intent::DecisionIntent;
use db::models::document::Document;
use db::models::document::DocumentImageArgs;
use db::models::incode_customer_session::IncodeCustomerSession;
use db::models::ob_configuration::ObConfiguration;
use db::models::verification_request::VReqIdentifier;
use db::models::verification_result::VerificationResult;
use db::DbPool;
use db::TxnPgConn;
use feature_flag::BoolFlag;
use http::StatusCode;
use idv::footprint_http_client::FootprintVendorHttpClient;
use idv::footprint_http_client::FpVendorClientArgs;
use idv::incode::client::AuthenticatedIncodeClientAdapter;
use idv::incode::client::IncodeClientAdapter;
use idv::incode::doc::response::AddCustomerResponse;
use idv::incode::doc::response::FetchScoresResponse;
use idv::incode::doc::IncodeFetchOCRRequest;
use idv::incode::doc::IncodeFetchScoresRequest;
use idv::incode::IncodeResponse;
use idv::ParsedResponse;
use idv::VendorResponse;
use newtypes::vendor_credentials::IncodeCredentialsWithToken;
use newtypes::DataIdentifier;
use newtypes::DecisionIntentKind;
use newtypes::DocumentDiKind;
use newtypes::DocumentSide;
use newtypes::IncodeAddSelfie;
use newtypes::IncodeVerificationSessionId;
use newtypes::PiiJsonValue;
use newtypes::VendorAPI;
use newtypes::VendorValidatedCountryCode;
use selfie_doc::compare::CompareFacesResponse;
use tracing::Instrument;

pub struct FetchScores {
    score_response: FetchScoresResponse,
    ocr_data: FingerprintedDataRequest,
    document_kind: ValidatedIdDocKind,
    rs: Vec<NewRiskSignal>,
    country_code: Option<VendorValidatedCountryCode>,
}

#[async_trait]
impl IncodeStateTransition for FetchScores {
    #[tracing::instrument("FetchScores::run", skip_all)]
    async fn run(
        db_pool: &DbPool,
        clients: &IncodeClients,
        ctx: &IncodeContext,
        session: &VerificationSession,
    ) -> FpResult<Option<Self>> {
        // make the request to incode
        let request = IncodeFetchScoresRequest {
            credentials: session.credentials.clone(),
        };
        let scores_res = clients.incode_fetch_scores.make_request(request).await;

        // Save our result
        let score_args = SaveVerificationResultArgs::from(&scores_res, VendorAPI::IncodeFetchScores, ctx);
        let (score_vres, _) = score_args.save(db_pool).await?;

        // Now ensure we don't have an error
        let score_response = scores_res?.result.into_success().map_err(into_fp_error)?;

        let (overall_score, overall_status) = score_response.document_score();
        if overall_score.is_none() || overall_status.is_none() {
            tracing::error!("[FetchScores] overall_score or overall_status is null");
        }

        // make the OCR to incode
        let ocr_request = IncodeFetchOCRRequest {
            credentials: session.credentials.clone(),
        };
        let ocr_res = clients.incode_fetch_ocr.make_request(ocr_request).await;

        // Save our result
        let ocr_args = SaveVerificationResultArgs::from(&ocr_res, VendorAPI::IncodeFetchOcr, ctx);
        let (ocr_vres, _) = ocr_args.save(db_pool).await?;

        // Now ensure we don't have an error
        let ocr_response = ocr_res?.result.into_success().map_err(into_fp_error)?;

        let wf_id = ctx.wf_id.clone();
        let sv_id = ctx.sv_id.clone();
        let id_doc_id = ctx.id_doc_id.clone();
        let (playbook, obc, vw, id_doc, doc_uploads) = db_pool
            .db_query(move |conn| {
                let (playbook, obc) = ObConfiguration::get(conn, &wf_id)?;
                let vw = VaultWrapper::build_for_tenant(conn, &sv_id)?;
                let (id_doc, _) = Document::get(conn, &id_doc_id)?;
                let doc_uploads = id_doc.images(conn, DocumentImageArgs::default())?;
                Ok((playbook, obc, vw, id_doc, doc_uploads))
            })
            .await?;

        // If the ID data already exists in the vault, extract it so we can use it to generate
        // OCR data risk signals
        let ocr_comparison_fields = if !obc.is_doc_first {
            let ocr_comparison_fields =
                IncodeOcrComparisonDataFields::compose(&ctx.state.enclave_client, &vw).await?;
            Some(ocr_comparison_fields)
        } else {
            None
        };

        let type_of_id = ocr_response.type_of_id.as_ref();
        let country_code = ocr_response.issuing_country.as_ref();
        let dk = match super::parse_type_of_id(
            ctx,
            type_of_id,
            ocr_response.document_sub_type().as_ref(),
            country_code,
        )? {
            Ok(dk) => dk,
            Err(_) => {
                // We had an error parsing the document kind from incode - just use the document
                // kind selected by the user, even though it may be wrong
                ValidatedIdDocKind(
                    ctx.docv_data
                        .document_type
                        .ok_or(ServerErr("Docv data has no document_type"))?,
                )
            }
        };

        // Run AWS if we have a selfie
        // TODO: integrate doc extraction
        if ctx.ff_client.flag(BoolFlag::RunAwsRekognition(&ctx.tenant_id)) && session.kind.requires_selfie() {
            match run_aws_rekognition(db_pool, ctx).await {
                Ok(selfie_res) => {
                    tracing::info!(
                        incode_result = score_response.selfie_match().1.map(|i| i.to_string()),
                        aws_result = ?selfie_res.map(|s| s.0.similarity),
                        "incode aws selfie result"
                    )
                }
                Err(e) => tracing::warn!(err=?e, "error running aws rekognition"),
            }
        }

        let creds = session.credentials.clone();
        let sv_id2 = ctx.sv_id.clone();
        tokio::spawn(async move {
            let resp = mark_status_as_complete(creds).await;
            let message = "error marking incode status as complete";

            match resp {
                Ok(r) => {
                    if r.status() != StatusCode::OK {
                        tracing::warn!(status_code = r.status().to_string(), scoped_vault_id=%sv_id2, message)
                    }
                }
                Err(err) => tracing::warn!(err=?err, scoped_vault_id=%sv_id2, message),
            }
        }.in_current_span());

        // Incode suggests this might be an interesting risk signal
        if session.kind.is_selfie() {
            let selfie_age = loaders::load_response_for_vendor_api(
                &ctx.state,
                VReqIdentifier::WfId(ctx.wf_id.clone()),
                &ctx.vault.e_private_key,
                IncodeAddSelfie,
            )
            .await
            .ok()
            .and_then(|r| r.ok())
            .and_then(|(resp, _)| resp.age);
            let document_age = &ocr_response.age().ok();

            if let (Some(sa), Some(da)) = (selfie_age, document_age) {
                let diff = (da - sa as i64).abs();
                tracing::info!(
                    ?diff,
                    document_age=%da,
                    selfie_age=%sa,
                    ivs_id=%session.id,
                    sv_id=%&ctx.sv_id,
                    wf_id=%&ctx.wf_id,
                    "incode selfie age"
                );
            }
        }


        let args = PreCompleteArgs {
            playbook: &playbook,
            obc: &obc,
            id_doc: &id_doc,
            dk,
            sv_id: &ctx.sv_id,
            vw: &vw,
            expect_selfie: session.kind.requires_selfie() && !ctx.disable_selfie,
            fetch_ocr_response: &ocr_response,
            score_response: &score_response,
            doc_uploads: &doc_uploads,
        };
        let rs = compute_risk_signals(
            args,
            ocr_comparison_fields,
            ocr_vres.id,
            score_vres.id,
            &session.ignored_failure_reasons,
        )?;
        let ocr_data = compute_ocr_data(&ctx.state, args, &rs).await?;

        Ok(Some(Self {
            score_response,
            ocr_data,
            document_kind: dk,
            rs,
            country_code: ocr_response
                .issuing_country_two_digit_code()
                .map(VendorValidatedCountryCode),
        }))
    }

    #[tracing::instrument("FetchScores::transition", skip_all)]
    fn transition(
        self,
        conn: &mut TxnPgConn,
        ctx: &IncodeContext,
        _session: &VerificationSession,
    ) -> FpResult<TransitionResult> {
        // TODO could represent enter inside the state transition
        let args = CompleteArgs {
            sv_id: &ctx.sv_id,
            wf_id: &ctx.wf_id,
            obc_id: &ctx.obc.id,
            id_doc_id: &ctx.id_doc_id,
            dk: self.document_kind,
            ocr_data: self.ocr_data,
            score_response: self.score_response,
            rs: self.rs,
            country_code: self.country_code,
        };
        Complete::enter(conn, args)?;
        Ok(Complete::new().into())
    }

    fn next_state(_: &VerificationSession) -> IncodeState {
        Complete::new()
    }
}

#[tracing::instrument(skip_all)]
async fn run_aws_rekognition(
    db_pool: &DbPool,
    ctx: &IncodeContext,
) -> FpResult<Option<(CompareFacesResponse, VerificationResult)>> {
    let enclave_client = &ctx.state.enclave_client;
    let id_doc_id = ctx.id_doc_id.clone();
    let sv_id = ctx.sv_id.clone();
    let wf_id = ctx.wf_id.clone();
    let client = &ctx.aws_selfie_client;

    let sv_id2 = ctx.sv_id.clone();
    let (id_doc, vw) = db_pool
        .db_query(move |conn| {
            let (id_doc, _) = Document::get(conn, &id_doc_id)?;
            let vw = VaultWrapper::<Any>::build_for_tenant(conn, &sv_id2)?;
            Ok((id_doc, vw))
        })
        .await?;
    let doc_kind = id_doc.document_type.try_into()?;

    // At this point, until we reach `Complete`, we have not vaulted the images under the
    // DocumentKind::Image DIs
    let doc_id_op: EnclaveDecryptOperation =
        DataIdentifier::Document(DocumentDiKind::LatestUpload(doc_kind, DocumentSide::Front)).into();
    // make this conditional
    let selfie_id_op: EnclaveDecryptOperation =
        DataIdentifier::Document(DocumentDiKind::LatestUpload(doc_kind, DocumentSide::Selfie)).into();

    let results = vw
        .fn_decrypt_unchecked_raw(enclave_client, vec![doc_id_op.clone(), selfie_id_op.clone()])
        .await?;

    let doc_pii_bytes = match results.get(&doc_id_op).ok_or(ApiCoreError::ResourceNotFound)? {
        Pii::Bytes(bytes) => bytes,
        _ => return Err(ApiCoreError::AssertionError("unexpected pii type".into()))?,
    };
    let selfie_pii_bytes = match results.get(&selfie_id_op).ok_or(ApiCoreError::ResourceNotFound)? {
        Pii::Bytes(bytes) => bytes,
        _ => return Err(ApiCoreError::AssertionError("unexpected pii type".into()))?,
    };

    let comparison_result = client.doc_to_selfie(doc_pii_bytes, selfie_pii_bytes, None).await;
    let (result, res_to_save) = match comparison_result {
        Ok(r) => {
            let j: PiiJsonValue = serde_json::to_value(r.clone())?.into();
            (
                Some(r),
                Ok(VendorResponse {
                    raw_response: j.clone(),
                    response: ParsedResponse::AwsRekognition(j),
                }),
            )
        }
        Err(e) => {
            tracing::warn!(err=?e, "error making aws rekognition request");

            let err = idv::Error::from(e);
            (
                None,
                Err(VendorAPIError {
                    vendor_api: VendorAPI::AwsRekognition,
                    error: err.into(),
                }),
            )
        }
    };

    let vres = db_pool
        .db_query(move |conn| {
            let di = DecisionIntent::create(conn, DecisionIntentKind::DocScan, &sv_id, Some(&wf_id))?;
            let (_, vres) =
                save_vreq_and_vres(conn, &vw.vault.public_key.clone(), &sv_id, &di.id, res_to_save)?;

            Ok(vres)
        })
        .await?;

    Ok(result.map(|r| (r, vres)))
}

async fn mark_status_as_complete(credentials: IncodeCredentialsWithToken) -> FpResult<reqwest::Response> {
    let http_client = FootprintVendorHttpClient::new(FpVendorClientArgs::default())?;
    let client = IncodeClientAdapter::new(credentials.credentials).map_err(into_fp_error)?;
    let authenticated_client =
        AuthenticatedIncodeClientAdapter::new(client, credentials.authentication_token)
            .map_err(into_fp_error)?;

    let res = authenticated_client
        .mark_session_complete(&http_client)
        .await
        .map_err(into_fp_error)?;

    Ok(res)
}

#[allow(unused)]
#[tracing::instrument(skip_all)]
async fn add_customer_and_save_session(
    db_pool: &DbPool,
    credentials: IncodeCredentialsWithToken,
    ctx: IncodeContext,
    ivs_id: IncodeVerificationSessionId,
) -> FpResult<()> {
    let sv_id2 = ctx.sv_id.clone();
    let ivs_id2 = ivs_id.clone();

    // check existing
    let existing = db_pool
        .db_query(move |conn| IncodeCustomerSession::list(conn, (&sv_id2, &ivs_id2)))
        .await?;

    if !existing.is_empty() {
        tracing::info!(
            ivs_id = %&ivs_id,
            sv_id = %&ctx.sv_id,
            "already have incode customer for ivs"
        );
        return Ok(());
    }
    // Otherwise, let's approve
    let http_client = FootprintVendorHttpClient::new(FpVendorClientArgs::default())?;
    let client = IncodeClientAdapter::new(credentials.credentials).map_err(into_fp_error)?;
    let authenticated_client =
        AuthenticatedIncodeClientAdapter::new(client, credentials.authentication_token)
            .map_err(into_fp_error)?;

    let resp = authenticated_client.add_customer(&http_client).await;
    let res = match resp {
        Ok(r) => Ok(IncodeResponse::from_response(r).await),
        Err(e) => Err(e.into()),
    };

    // Save vres
    let session_args = SaveVerificationResultArgs::from(&res, VendorAPI::IncodeApproveSession, &ctx);
    session_args.save(db_pool).await?;

    let parsed: AddCustomerResponse = res?.result.into_success().map_err(into_fp_error)?;

    let log_success = parsed.success;
    let mut log_created_customer = false;
    let log_total_score = parsed.total_score.clone();
    let log_sv_id = ctx.sv_id.clone();
    let log_ivs_id = ivs_id.clone();
    if let Some(customer_id) = parsed.customer_id {
        if parsed.success {
            db_pool
                .db_query(move |conn| {
                    IncodeCustomerSession::create(conn, ctx.sv_id, ctx.tenant_id, ivs_id, customer_id.into())
                })
                .await?;

            log_created_customer = true;
        }
    }

    tracing::info!(
        success=?log_success,
        created_customer=?log_created_customer,
        total_score=?log_total_score,
        sv_id=?log_sv_id,
        ivs_id=?log_ivs_id,
        "IncodeCustomerSession creation result"
    );

    Ok(())
}
