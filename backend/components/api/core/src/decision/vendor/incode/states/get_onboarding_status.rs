use super::{
    map_to_api_err, save_incode_verification_result, FetchScores, IncodeStateTransition,
    SaveVerificationResultArgs, VerificationSession,
};
use crate::decision::vendor::incode::{state::StateResult, IncodeContext};
use crate::decision::vendor::vendor_trait::VendorAPICall;
use crate::errors::ApiResult;
use async_trait::async_trait;
use db::{DbPool, TxnPgConn};
use idv::footprint_http_client::FootprintVendorHttpClient;
use idv::incode::doc::IncodeGetOnboardingStatusRequest;
use newtypes::VendorAPI;

pub struct GetOnboardingStatus {}

#[async_trait]
impl IncodeStateTransition for GetOnboardingStatus {
    async fn run(
        db_pool: &DbPool,
        http_client: &FootprintVendorHttpClient,
        ctx: &IncodeContext,
        session: &VerificationSession,
    ) -> ApiResult<Option<Self>> {
        // make the request to incode
        let request = IncodeGetOnboardingStatusRequest {
            credentials: session.credentials.clone(),
            session_kind: session.kind.clone(),
        };
        let res = http_client.make_request(request).await;

        // Save our result
        let args = SaveVerificationResultArgs::from(&res, VendorAPI::IncodeGetOnboardingStatus, ctx);
        save_incode_verification_result(db_pool, args).await?;

        // Now ensure we don't have an error
        res.map_err(map_to_api_err)?
            .result
            .into_success()
            .map_err(map_to_api_err)?;

        Ok(Some(Self {}))
    }

    fn transition(
        self,
        _: &mut TxnPgConn,
        _: &IncodeContext,
        _: &VerificationSession,
    ) -> ApiResult<StateResult> {
        Ok(FetchScores::new().into())
    }
}
