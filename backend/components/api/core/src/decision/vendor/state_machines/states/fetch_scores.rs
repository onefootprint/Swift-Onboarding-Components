use super::{
    map_to_api_err, save_incode_verification_result, FetchOCR, IncodeState, IncodeStateTransition,
    SaveVerificationResultArgs, VerificationSession,
};
use crate::decision::vendor::state_machines::incode_state_machine::IncodeContext;
use crate::decision::vendor::vendor_trait::VendorAPICall;
use crate::errors::ApiResult;
use async_trait::async_trait;
use db::{DbPool, TxnPgConn};
use idv::footprint_http_client::FootprintVendorHttpClient;
use idv::incode::doc::IncodeFetchScoresRequest;
use newtypes::{IncodeFailureReason, VendorAPI};

pub struct FetchScores {}

#[async_trait]
impl IncodeStateTransition for FetchScores {
    /// Initializes a state of this type, performing all async operations needed before the atomic
    /// bookkeeping and state transition.
    /// If None is returned, the state is not ready to run
    async fn init(
        db_pool: &DbPool,
        http_client: &FootprintVendorHttpClient,
        ctx: &IncodeContext,
        session: &VerificationSession,
    ) -> ApiResult<Option<Self>> {
        // make the request to incode
        let request = IncodeFetchScoresRequest {
            credentials: session.credentials.clone(),
        };
        let res = http_client.make_request(request).await;

        // Save our result
        let args = SaveVerificationResultArgs::from(&res, VendorAPI::IncodeFetchScores, ctx);
        save_incode_verification_result(db_pool, args).await?;

        // Now ensure we don't have an error
        res.map_err(map_to_api_err)?
            .result
            .into_success()
            .map_err(map_to_api_err)?;
        Ok(Some(Self {}))
    }

    /// Perform any bookkeeping that must be atomic with the state transition. Can access any
    /// context created in `init`
    fn transition(
        self,
        _: &mut TxnPgConn,
        _: &IncodeContext,
    ) -> ApiResult<(IncodeState, Option<IncodeFailureReason>)> {
        Ok((FetchOCR::new(), None))
    }
}
