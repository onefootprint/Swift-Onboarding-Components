use super::{
    compute_ocr_data, compute_risk_signals, map_to_api_err, save_incode_verification_result, Complete,
    CompleteArgs, IncodeStateTransition, NewRiskSignal, PreCompleteArgs, SaveVerificationResultArgs,
    VerificationSession,
};
use crate::{
    decision::{
        features::incode_docv::IncodeOcrComparisonDataFields,
        vendor::{
            incode::{
                state::{IncodeState, TransitionResult},
                IncodeContext,
            },
            verification_result::save_vreq_and_vres,
            VendorAPIError,
        },
    },
    enclave_client::EnclaveClient,
    errors::{ApiResult, AssertionError},
    utils::vault_wrapper::{Any, EnclaveDecryptOperation, Pii, VaultWrapper},
    vendor_clients::IncodeClients,
    ApiErrorKind,
};
use async_trait::async_trait;
use db::{
    models::{
        decision_intent::DecisionIntent, identity_document::IdentityDocument,
        ob_configuration::ObConfiguration, verification_result::VerificationResult,
    },
    DbPool, TxnPgConn,
};
use feature_flag::BoolFlag;
use http::StatusCode;
use idv::{
    footprint_http_client::{FootprintVendorHttpClient, FpVendorClientArgs},
    incode::{
        client::{AuthenticatedIncodeClientAdapter, IncodeClientAdapter},
        doc::{response::FetchScoresResponse, IncodeFetchOCRRequest, IncodeFetchScoresRequest},
    },
    ParsedResponse, VendorResponse,
};
use newtypes::{
    vendor_credentials::IncodeCredentialsWithToken, DataIdentifier, DataRequest, DecisionIntentKind,
    DocumentKind, DocumentSide, Fingerprints, IdDocKind, IdentityDocumentId, PiiJsonValue, ScopedVaultId,
    VendorAPI, WorkflowId,
};
use selfie_doc::{compare::CompareFacesResponse, AwsSelfieDocClient};
use tracing::Instrument;

pub struct FetchScores {
    score_response: FetchScoresResponse,
    ocr_data: DataRequest<Fingerprints>,
    document_kind: IdDocKind,
    rs: Vec<NewRiskSignal>,
}

#[async_trait]
impl IncodeStateTransition for FetchScores {
    async fn run(
        db_pool: &DbPool,
        clients: &IncodeClients,
        ctx: &IncodeContext,
        session: &VerificationSession,
    ) -> ApiResult<Option<Self>> {
        // make the request to incode
        let request = IncodeFetchScoresRequest {
            credentials: session.credentials.clone(),
        };
        let scores_res = clients.incode_fetch_scores.make_request(request).await;

        // Save our result
        let score_args = SaveVerificationResultArgs::from(&scores_res, VendorAPI::IncodeFetchScores, ctx);
        let score_vres = save_incode_verification_result(db_pool, score_args).await?;

        // Now ensure we don't have an error
        let score_response = scores_res
            .map_err(map_to_api_err)?
            .result
            .into_success()
            .map_err(map_to_api_err)?;

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
        let ocr_vres = save_incode_verification_result(db_pool, ocr_args).await?;

        // Now ensure we don't have an error
        let ocr_response = ocr_res
            .map_err(map_to_api_err)?
            .result
            .into_success()
            .map_err(map_to_api_err)?;

        let wf_id = ctx.wf_id.clone();
        let sv_id = ctx.sv_id.clone();
        let id_doc_id = ctx.id_doc_id.clone();
        let (obc, vw, id_doc, doc_uploads) = db_pool
            .db_query(move |conn| -> ApiResult<_> {
                let (obc, _) = ObConfiguration::get(conn, &wf_id)?;
                let vw = VaultWrapper::build_for_tenant(conn, &sv_id)?;
                let (id_doc, _) = IdentityDocument::get(conn, &id_doc_id)?;
                let doc_uploads = id_doc.images(conn, true)?;
                Ok((obc, vw, id_doc, doc_uploads))
            })
            .await?;

        // If the ID data already exists in the vault, extract it so we can use it to generate
        // OCR data risk signals
        let ocr_comparison_fields = if !obc.is_doc_first {
            let ocr_comparison_fields =
                IncodeOcrComparisonDataFields::compose(&ctx.enclave_client, &vw).await?;
            Some(ocr_comparison_fields)
        } else {
            None
        };

        let type_of_id = ocr_response.type_of_id.as_ref();
        let country_code = ocr_response.issuing_country.as_ref();
        let dk = match super::parse_type_of_id(ctx, type_of_id, ocr_response.document_sub_type().as_ref(), country_code)? {
            Ok(dk) => dk,
            Err(_) => {
                // We had an error parsing the document kind from incode - just use the document
                // kind selected by the user, even though it may be wrong
                ctx.docv_data
                    .document_type
                    .ok_or(AssertionError("Docv data has no document_type"))?
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
            let log_msg = "error marking incode status as complete";

            match resp {
                Ok(r) => {
                    if r.status() != StatusCode::OK {
                        tracing::warn!(status_code = r.status().to_string(), scoped_vault_id=%sv_id2, log_msg)
                    }
                }
                Err(err) => tracing::warn!(err=?err, scoped_vault_id=%sv_id2, log_msg),
            }
        }.in_current_span());

        let args = PreCompleteArgs {
            obc: &obc,
            id_doc: &id_doc,
            dk,
            vw: &vw,
            expect_selfie: session.kind.requires_selfie() && !ctx.disable_selfie,
            fetch_ocr_response: &ocr_response,
            score_response: &score_response,
            doc_uploads: &doc_uploads
        };
        let rs = compute_risk_signals(
            args,
            ocr_comparison_fields,
            ocr_vres.id,
            score_vres.id,
            &session.ignored_failure_reasons,
        )?;
        let ocr_data = compute_ocr_data(&ctx.enclave_client, args, &rs).await?;

        Ok(Some(Self {
            score_response,
            ocr_data,
            document_kind: dk,
            rs,
        }))
    }

    fn transition(
        self,
        conn: &mut TxnPgConn,
        ctx: &IncodeContext,
        _session: &VerificationSession,
    ) -> ApiResult<TransitionResult> {
        // TODO could represent enter inside the state transition
        let args = CompleteArgs {
            vault: &ctx.vault,
            sv_id: &ctx.sv_id,
            id_doc_id: &ctx.id_doc_id,
            dk: self.document_kind,
            ocr_data: self.ocr_data,
            score_response: self.score_response,
            rs: self.rs,
        };
        Complete::enter(conn, args)?;
        Ok(Complete::new().into())
    }

    fn next_state(_: &VerificationSession) -> IncodeState {
        Complete::new()
    }
}

#[tracing::instrument(skip_all)]
pub async fn run_aws_rekognition(
    db_pool: &DbPool,
    ctx: &IncodeContext,
) -> ApiResult<Option<(CompareFacesResponse, VerificationResult)>> {
    let enclave_client = ctx.enclave_client.clone();
    let pool = db_pool.clone();
    let id_doc_id = ctx.id_doc_id.clone();
    let sv_id = ctx.sv_id.clone();
    let wf_id = ctx.wf_id.clone();
    let aws_client = ctx.aws_selfie_client.clone();

    // Run AWS selfie<>doc comparison in order to compare results
    run_aws_inner(&pool, &enclave_client, aws_client, sv_id, wf_id, id_doc_id).await
}

async fn run_aws_inner(
    db_pool: &DbPool,
    enclave_client: &EnclaveClient,
    client: AwsSelfieDocClient,
    sv_id: ScopedVaultId,
    wf_id: WorkflowId,
    id_doc_id: IdentityDocumentId,
) -> ApiResult<Option<(CompareFacesResponse, VerificationResult)>> {
    let sv_id2 = sv_id.clone();
    let (id_doc, vw) = db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let (id_doc, _) = IdentityDocument::get(conn, &id_doc_id)?;
            let vw = VaultWrapper::<Any>::build_for_tenant(conn, &sv_id2)?;
            Ok((id_doc, vw))
        })
        .await?;

    // At this point, until we reach `Complete`, we have not vaulted the images under the DocumentKind::Image DIs
    let doc_id_op: EnclaveDecryptOperation = DataIdentifier::Document(DocumentKind::LatestUpload(
        id_doc.document_type,
        DocumentSide::Front,
    ))
    .into();

    // make this conditional
    let selfie_id_op: EnclaveDecryptOperation = DataIdentifier::Document(DocumentKind::LatestUpload(
        id_doc.document_type,
        DocumentSide::Selfie,
    ))
    .into();

    let results = vw
        .fn_decrypt_unchecked_raw(enclave_client, vec![doc_id_op.clone(), selfie_id_op.clone()])
        .await?;

    let doc_pii_bytes = match results.get(&doc_id_op).ok_or(ApiErrorKind::ResourceNotFound)? {
        Pii::Bytes(bytes) => bytes,
        _ => return Err(ApiErrorKind::AssertionError("unexpected pii type".into()))?,
    };
    let selfie_pii_bytes = match results.get(&selfie_id_op).ok_or(ApiErrorKind::ResourceNotFound)? {
        Pii::Bytes(bytes) => bytes,
        _ => return Err(ApiErrorKind::AssertionError("unexpected pii type".into()))?,
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
                    error: err,
                }),
            )
        }
    };

    let vres = db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let di = DecisionIntent::create(conn, DecisionIntentKind::DocScan, &sv_id, Some(&wf_id))?;
            let (_, vres) =
                save_vreq_and_vres(conn, &vw.vault.public_key.clone(), &sv_id, &di.id, res_to_save)?;

            Ok(vres)
        })
        .await?;

    Ok(result.map(|r| (r, vres)))
}

async fn mark_status_as_complete(credentials: IncodeCredentialsWithToken) -> ApiResult<reqwest::Response> {
    let http_client = FootprintVendorHttpClient::new(FpVendorClientArgs::default())?;
    let client = IncodeClientAdapter::new(credentials.credentials).map_err(map_to_api_err)?;
    let authenticated_client =
        AuthenticatedIncodeClientAdapter::new(client, credentials.authentication_token)
            .map_err(map_to_api_err)?;

    let res = authenticated_client
        .mark_session_complete(&http_client)
        .await
        .map_err(map_to_api_err)?;

    Ok(res)
}
