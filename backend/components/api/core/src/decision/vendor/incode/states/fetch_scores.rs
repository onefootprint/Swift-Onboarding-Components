use super::{
    map_to_api_err, save_incode_verification_result, AddFront, Complete, IncodeStateTransition,
    SaveVerificationResultArgs, VerificationSession,
};
use crate::decision::vendor::incode::{state::StateResult, IncodeContext};
use crate::errors::ApiResult;
use crate::vendor_clients::IncodeClients;
use async_trait::async_trait;
use db::{DbPool, TxnPgConn};
use idv::incode::doc::response::{FetchOCRResponse, FetchScoresResponse};
use idv::incode::doc::{IncodeFetchOCRRequest, IncodeFetchScoresRequest};
use newtypes::{DocumentSide, VendorAPI};
use strum::IntoEnumIterator;

pub struct FetchScores {
    ocr_response: FetchOCRResponse,
    score_response: FetchScoresResponse,
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
        save_incode_verification_result(db_pool, score_args).await?;

        // Now ensure we don't have an error
        let score_response = scores_res
            .map_err(map_to_api_err)?
            .result
            .into_success()
            .map_err(map_to_api_err)?;

        // we need an overall score or else we should fail
        score_response.overall_score().map_err(map_to_api_err)?;

        // make the OCR to incode
        let ocr_request = IncodeFetchOCRRequest {
            credentials: session.credentials.clone(),
        };
        let ocr_res = clients.incode_fetch_ocr.make_request(ocr_request).await;

        // Save our result
        let ocr_args = SaveVerificationResultArgs::from(&ocr_res, VendorAPI::IncodeFetchOCR, ctx);
        save_incode_verification_result(db_pool, ocr_args).await?;

        // Now ensure we don't have an error
        let ocr_response = ocr_res
            .map_err(map_to_api_err)?
            .result
            .into_success()
            .map_err(map_to_api_err)?;

        Ok(Some(Self {
            score_response,
            ocr_response,
        }))
    }

    fn transition(
        self,
        conn: &mut TxnPgConn,
        ctx: &IncodeContext,
        _: &VerificationSession,
    ) -> ApiResult<StateResult> {
        let type_of_id = self.ocr_response.type_of_id.as_ref();
        let country_code = self.ocr_response.issuing_country.as_ref();
        match super::parse_type_of_id(ctx, type_of_id, country_code)? {
            Ok(dk) => {
                // TODO could represent enter inside the state transition
                Complete::enter(
                    conn,
                    &ctx.vault,
                    &ctx.sv_id,
                    &ctx.id_doc_id,
                    dk,
                    self.ocr_response,
                    self.score_response,
                )?;
                Ok(Complete::new().into())
            }
            Err(reason) => Ok(StateResult::Retry {
                next_state: AddFront::new(),
                reasons: vec![reason],
                clear_sides: DocumentSide::iter().collect(),
            }),
        }
    }
}
