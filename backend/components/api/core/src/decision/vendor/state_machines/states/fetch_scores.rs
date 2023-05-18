use super::{
    map_to_api_err, save_incode_verification_result, FetchOCR, IncodeState, IncodeStateTransition,
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
use idv::incode::IncodeFetchScoresRequest;
use newtypes::{IncodeVerificationSessionState, VendorAPI};

pub struct FetchScores {
    pub session: VerificationSession,
    pub fetch_scores_verification_request: VerificationRequest,
}

#[async_trait]
impl IncodeStateTransition for FetchScores {
    async fn run(
        &self,
        db_pool: &DbPool,
        footprint_http_client: &FootprintVendorHttpClient,
        ctx: &IncodeContext,
    ) -> Result<IncodeState, ApiError> {
        let sv_id = ctx.scoped_vault_id.clone();
        let di_id = ctx.decision_intent_id.clone();
        //
        // make the request to incode
        //
        let fetch_scores_vreq_id = self.fetch_scores_verification_request.id.clone();

        let request = IncodeFetchScoresRequest {
            credentials: self.session.credentials.clone(),
        };

        let request_result = footprint_http_client.make_request(request).await;

        //
        // Save our result
        //
        let vres = SaveVerificationResultArgs::from((&request_result, fetch_scores_vreq_id));
        save_incode_verification_result(db_pool, vres, &ctx.vault.public_key).await?;

        // Now ensure we don't have an error
        let fetch_scores_response = request_result
            .map_err(map_to_api_err)?
            .result
            .into_success()
            .map_err(map_to_api_err)?;

        let verification_session_id = self.session.id.clone();
        let fetch_ocr_verification_request = db_pool
            .db_transaction(move |conn| -> ApiResult<VerificationRequest> {
                let req = VerificationRequest::create(conn, &sv_id, &di_id, VendorAPI::IncodeFetchOCR)?;

                let update =
                    UpdateIncodeVerificationSession::set_state(IncodeVerificationSessionState::FetchOCR);

                IncodeVerificationSession::update(conn, verification_session_id, update)?;

                Ok(req)
            })
            .await?;

        Ok(FetchOCR {
            session: self.session.clone(),
            fetch_scores_response,
            fetch_ocr_verification_request,
        }
        .into())
    }
}
