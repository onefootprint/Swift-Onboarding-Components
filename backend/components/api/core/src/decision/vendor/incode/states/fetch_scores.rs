use super::{
    map_to_api_err, save_incode_verification_result, Complete, IncodeStateTransition,
    SaveVerificationResultArgs, VerificationSession,
};
use crate::decision::features::incode_docv::IncodeOcrComparisonDataFields;
use crate::decision::vendor::incode::{state::TransitionResult, IncodeContext};
use crate::errors::{ApiResult, AssertionError};
use crate::utils::vault_wrapper::{Person, TenantVw, VaultWrapper};
use crate::vendor_clients::IncodeClients;
use async_trait::async_trait;
use db::models::ob_configuration::ObConfiguration;
use db::{DbPool, TxnPgConn};
use idv::incode::doc::response::{FetchOCRResponse, FetchScoresResponse};
use idv::incode::doc::{IncodeFetchOCRRequest, IncodeFetchScoresRequest};
use newtypes::{VendorAPI, VerificationResultId};

pub struct FetchScores {
    ocr_response: FetchOCRResponse,
    score_response: FetchScoresResponse,
    vault_data: Option<IncodeOcrComparisonDataFields>,
    score_verification_result_id: VerificationResultId,
    ocr_verification_result_id: VerificationResultId,
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

        // we need an overall score or else we should fail
        score_response.document_score().map_err(map_to_api_err)?;

        // There's a really annoying/subtle thing with the incode API:
        //    if you don't have selfie enabled in the incode flow builder, it will gladly allow you to send selfie image, it just silently doesn't include the selfie in the actual score/result
        // So let's assert here that we have gotten back a score
        if session.kind.requires_selfie() {
            score_response.selfie_match().map_err(map_to_api_err)?;
        }

        // make the OCR to incode
        let ocr_request = IncodeFetchOCRRequest {
            credentials: session.credentials.clone(),
        };
        let ocr_res = clients.incode_fetch_ocr.make_request(ocr_request).await;

        // Save our result
        let ocr_args = SaveVerificationResultArgs::from(&ocr_res, VendorAPI::IncodeFetchOCR, ctx);
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

        Ok(Some(Self {
            score_response,
            ocr_response,
            vault_data,
            score_verification_result_id: score_vres.id,
            ocr_verification_result_id: ocr_vres.id,
        }))
    }

    fn transition(
        self,
        conn: &mut TxnPgConn,
        ctx: &IncodeContext,
        session: &VerificationSession,
    ) -> ApiResult<TransitionResult> {
        let type_of_id = self.ocr_response.type_of_id.as_ref();
        let country_code = self.ocr_response.issuing_country.as_ref();
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

        // TODO could represent enter inside the state transition
        Complete::enter(
            conn,
            &ctx.vault,
            &ctx.sv_id,
            &ctx.id_doc_id,
            dk,
            session.ignored_failure_reasons.clone(),
            self.ocr_response,
            self.score_response,
            self.vault_data,
            session.kind.requires_selfie(),
            self.ocr_verification_result_id,
            self.score_verification_result_id,
        )?;
        Ok(Complete::new().into())
    }
}
