use super::{
    map_to_api_err, save_incode_verification_result, FetchScores, IncodeState, IncodeStateTransition,
    SaveVerificationResultArgs, VerificationSession,
};
use crate::decision::vendor::state_machines::incode_state_machine::IncodeContext;
use crate::decision::vendor::vendor_trait::VendorAPICall;
use crate::errors::ApiResult;
use crate::ApiError;
use async_trait::async_trait;
use db::models::incode_verification_session::{IncodeVerificationSession, UpdateIncodeVerificationSession};
use db::DbPool;
use idv::footprint_http_client::FootprintVendorHttpClient;
use idv::incode::doc::IncodeProcessIdRequest;
use newtypes::{IncodeVerificationSessionState, VendorAPI};

pub struct ProcessId {}

#[async_trait]
impl IncodeStateTransition for ProcessId {
    async fn run(
        self,
        db_pool: &DbPool,
        footprint_http_client: &FootprintVendorHttpClient,
        ctx: &IncodeContext,
        session: &VerificationSession,
    ) -> Result<IncodeState, ApiError> {
        //
        // make the request to incode
        //
        let request = IncodeProcessIdRequest {
            credentials: session.credentials.clone(),
        };
        let res = footprint_http_client.make_request(request).await;

        //
        // Save our result
        //
        let args = SaveVerificationResultArgs::from(&res, VendorAPI::IncodeProcessId, ctx);
        save_incode_verification_result(db_pool, args).await?;

        // Now ensure we don't have an error
        res.map_err(map_to_api_err)?
            .result
            .into_success()
            .map_err(map_to_api_err)?;

        //
        // Set up the next state transition
        //
        // Save the next stage's Vreq
        let session_id = session.id.clone();
        db_pool
            .db_transaction(move |conn| -> ApiResult<_> {
                let update =
                    UpdateIncodeVerificationSession::set_state(IncodeVerificationSessionState::FetchScores);
                IncodeVerificationSession::update(conn, &session_id, update)?;
                Ok(())
            })
            .await?;

        Ok(FetchScores {}.into())
    }
}
