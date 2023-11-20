use super::{
    map_to_api_err, save_incode_verification_result, Complete, IncodeStateTransition,
    SaveVerificationResultArgs, VerificationSession,
};
use crate::decision::features::incode_docv::IncodeOcrComparisonDataFields;
use crate::decision::vendor::incode::state::IncodeState;
use crate::decision::vendor::incode::{state::TransitionResult, IncodeContext};
use crate::decision::vendor::verification_result::save_vreq_and_vres;
use crate::decision::vendor::VendorAPIError;
use crate::enclave_client::EnclaveClient;
use crate::errors::{ApiResult, AssertionError};
use crate::utils::vault_wrapper::{EnclaveDecryptOperation, Person, Pii, TenantVw, VaultWrapper};
use crate::vendor_clients::IncodeClients;
use crate::ApiErrorKind;
use async_trait::async_trait;
use db::models::decision_intent::DecisionIntent;
use db::models::identity_document::IdentityDocument;
use db::models::ob_configuration::ObConfiguration;
use db::models::verification_result::VerificationResult;
use db::{DbPool, TxnPgConn};
use feature_flag::BoolFlag;
use http::StatusCode;
use idv::footprint_http_client::FootprintVendorHttpClient;
use idv::incode::client::{AuthenticatedIncodeClientAdapter, IncodeClientAdapter};
use idv::incode::doc::response::{FetchOCRResponse, FetchScoresResponse};
use idv::incode::doc::{IncodeFetchOCRRequest, IncodeFetchScoresRequest};
use idv::{ParsedResponse, VendorResponse};
use newtypes::vendor_credentials::IncodeCredentialsWithToken;
use newtypes::{
    DataIdentifier, DecisionIntentKind, DocumentKind, DocumentSide, IdDocKind, IdentityDocumentId,
    PiiJsonValue, ScopedVaultId, VendorAPI, VerificationResultId, WorkflowId,
};
use selfie_doc::{compare::CompareFacesResponse, AwsSelfieDocClient};
use tracing::Instrument;

pub struct FetchScores {
    ocr_response: FetchOCRResponse,
    score_response: FetchScoresResponse,
    vault_data: Option<IncodeOcrComparisonDataFields>,
    score_verification_result_id: VerificationResultId,
    ocr_verification_result_id: VerificationResultId,
    document_kind: IdDocKind,
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
        let (obc, _) = db_pool
            .db_query(move |conn| ObConfiguration::get(conn, &wf_id))
            .await??;

        // If the ID data already exists in the vault, extract it so we can use it to generate
        // OCR data risk signals
        let vault_data = if !obc.is_doc_first {
            let sv_id = ctx.sv_id.clone();
            let uvw: TenantVw<Person> = db_pool
                .db_query(move |conn| VaultWrapper::build_for_tenant(conn, &sv_id))
                .await??;
            let vault_data = IncodeOcrComparisonDataFields::compose(&ctx.enclave_client, &uvw).await?;
            Some(vault_data)
        } else {
            None
        };

        let type_of_id = ocr_response.type_of_id.as_ref();
        let country_code = ocr_response.issuing_country.as_ref();
        let dk = match super::parse_type_of_id(ctx, type_of_id, country_code)? {
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

        Ok(Some(Self {
            score_response,
            ocr_response,
            vault_data,
            score_verification_result_id: score_vres.id,
            ocr_verification_result_id: ocr_vres.id,
            document_kind: dk,
        }))
    }

    fn transition(
        self,
        conn: &mut TxnPgConn,
        ctx: &IncodeContext,
        session: &VerificationSession,
    ) -> ApiResult<TransitionResult> {
        // TODO could represent enter inside the state transition
        Complete::enter(
            conn,
            &ctx.vault,
            &ctx.sv_id,
            &ctx.id_doc_id,
            self.document_kind,
            session.ignored_failure_reasons.clone(),
            self.ocr_response,
            self.score_response,
            self.vault_data,
            session.kind.requires_selfie() && !ctx.disable_selfie,
            self.ocr_verification_result_id,
            self.score_verification_result_id,
        )?;
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
            let vw = VaultWrapper::<crate::utils::vault_wrapper::Any>::build_for_tenant(conn, &sv_id2)?;

            Ok((id_doc, vw))
        })
        .await??;

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
        .await??;

    Ok(result.map(|r| (r, vres)))
}

async fn mark_status_as_complete(credentials: IncodeCredentialsWithToken) -> ApiResult<reqwest::Response> {
    let http_client = FootprintVendorHttpClient::new()?;
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
