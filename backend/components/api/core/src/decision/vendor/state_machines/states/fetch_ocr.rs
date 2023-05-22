use super::{
    map_to_api_err, save_incode_verification_result, Complete, IncodeState, IncodeStateTransition,
    RetryUpload, SaveVerificationResultArgs, VerificationSession,
};
use crate::decision::vendor::state_machines::incode_state_machine::IncodeContext;
use crate::decision::vendor::vendor_trait::VendorAPICall;
use crate::errors::ApiResult;
use crate::ApiError;
use async_trait::async_trait;
use db::models::incode_verification_session::{IncodeVerificationSession, UpdateIncodeVerificationSession};
use db::models::verification_request::VerificationRequest;
use db::DbPool;
use idv::footprint_http_client::FootprintVendorHttpClient;
use idv::incode::doc::response::FetchScoresResponse;
use idv::incode::doc::IncodeFetchOCRRequest;
use newtypes::{IncodeVerificationFailureReason, IncodeVerificationSessionState};

pub struct FetchOCR {
    pub session: VerificationSession,
    pub fetch_ocr_verification_request: VerificationRequest,
    pub fetch_scores_response: FetchScoresResponse,
}

#[async_trait]
impl IncodeStateTransition for FetchOCR {
    async fn run(
        self,
        db_pool: &DbPool,
        footprint_http_client: &FootprintVendorHttpClient,
        ctx: &IncodeContext,
    ) -> Result<IncodeState, ApiError> {
        //
        // make the request to incode
        //
        let fetch_ocr_vreq_id = self.fetch_ocr_verification_request.id;

        let request = IncodeFetchOCRRequest {
            credentials: self.session.credentials.clone(),
        };

        let request_result = footprint_http_client.make_request(request).await;

        //
        // Save our result
        //
        // TODO this isn't atomic with the rest of the operations so could happen twice
        let vres = SaveVerificationResultArgs::from((&request_result, fetch_ocr_vreq_id));
        save_incode_verification_result(db_pool, vres, &ctx.vault.public_key).await?;

        // Now ensure we don't have an error
        let fetch_ocr_response = request_result
            .map_err(map_to_api_err)?
            .result
            .into_success()
            .map_err(map_to_api_err)?;

        let ctx = ctx.clone();
        let next_step = db_pool
            .db_transaction(move |conn| -> ApiResult<_> {
                let next_step = match fetch_ocr_response.document_kind() {
                    Ok(dk) => {
                        let update = UpdateIncodeVerificationSession::set_state(
                            IncodeVerificationSessionState::Complete,
                        );
                        IncodeVerificationSession::update(conn, &self.session.id, update)?;

                        Complete::enter(
                            conn,
                            &ctx.vault,
                            &ctx.sv_id,
                            &ctx.id_doc_id,
                            dk,
                            self.fetch_scores_response,
                            fetch_ocr_response,
                        )?
                        .into()
                    }
                    Err(_) => {
                        let update = UpdateIncodeVerificationSession::set_state_to_retry_with_failure_reason(
                            IncodeVerificationFailureReason::UnknownDocumentType,
                        );
                        IncodeVerificationSession::update(conn, &self.session.id, update)?;

                        // TODO If the document uploaded isn't supported, retry.
                        // Should we include some context on the error here?
                        RetryUpload::enter(conn, &ctx, self.session)?.into()
                    }
                };

                Ok(next_step)
            })
            .await?;

        Ok(next_step)
    }
}
