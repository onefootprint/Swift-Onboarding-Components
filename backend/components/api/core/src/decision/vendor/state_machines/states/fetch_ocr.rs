use super::{
    map_to_api_err, save_incode_verification_result, Complete, IncodeState, IncodeStateTransition,
    SaveVerificationResultArgs, VerificationSession,
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
use idv::incode::response::FetchScoresResponse;
use idv::incode::IncodeFetchOCRRequest;
use newtypes::IncodeVerificationSessionState;

pub struct FetchOCR {
    pub session: VerificationSession,
    pub fetch_ocr_verification_request: VerificationRequest,
    pub fetch_scores_response: FetchScoresResponse,
}

#[async_trait]
impl IncodeStateTransition for FetchOCR {
    async fn run(
        &self,
        db_pool: &DbPool,
        footprint_http_client: &FootprintVendorHttpClient,
        ctx: &IncodeContext,
    ) -> Result<IncodeState, ApiError> {
        //
        // make the request to incode
        //
        let fetch_ocr_vreq_id = self.fetch_ocr_verification_request.id.clone();

        let request = IncodeFetchOCRRequest {
            credentials: self.session.credentials.clone(),
        };

        let request_result = footprint_http_client.make_request(request).await;

        //
        // Save our result
        //
        let vres = SaveVerificationResultArgs::from((&request_result, fetch_ocr_vreq_id));
        save_incode_verification_result(db_pool, vres, &ctx.vault.public_key).await?;

        // Now ensure we don't have an error
        let fetch_ocr_response = request_result
            .map_err(map_to_api_err)?
            .result
            .into_success()
            .map_err(map_to_api_err)?;

        let verification_session_id = self.session.id.clone();
        db_pool
            .db_transaction(move |conn| -> ApiResult<()> {
                let update =
                    UpdateIncodeVerificationSession::set_state(IncodeVerificationSessionState::Complete);

                IncodeVerificationSession::update(conn, verification_session_id, update)?;

                Ok(())
            })
            .await?;

        // We're done!
        Ok(Complete {
            fetch_scores_response: self.fetch_scores_response.clone(),
            fetch_ocr_response,
        }
        .into())
    }
}
