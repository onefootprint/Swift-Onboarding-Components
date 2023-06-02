use super::{
    map_to_api_err, save_incode_verification_result, AddConsent, GetOnboardingStatus, IncodeStateTransition,
    SaveVerificationResultArgs, VerificationSession,
};
use crate::decision::vendor::incode::state::IncodeState;
use crate::decision::vendor::incode::{state::StateResult, IncodeContext};
use crate::decision::vendor::vendor_trait::VendorAPICall;
use crate::errors::ApiResult;
use async_trait::async_trait;
use db::{DbPool, TxnPgConn};
use idv::footprint_http_client::FootprintVendorHttpClient;
use idv::incode::doc::IncodeProcessIdRequest;
use newtypes::VendorAPI;

pub struct ProcessId {}

#[async_trait]
impl IncodeStateTransition for ProcessId {
    async fn run(
        db_pool: &DbPool,
        http_client: &FootprintVendorHttpClient,
        ctx: &IncodeContext,
        session: &VerificationSession,
    ) -> ApiResult<Option<Self>> {
        // make the request to incode
        let request = IncodeProcessIdRequest {
            credentials: session.credentials.clone(),
        };
        let res = http_client.make_request(request).await;

        // Save our result
        let args = SaveVerificationResultArgs::from(&res, VendorAPI::IncodeProcessId, ctx);
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
        session: &VerificationSession,
    ) -> ApiResult<StateResult> {
        let next = next_state(session);
        Ok(next.into())
    }
}

// After processing the ID portion, we move on to selfie if applicable, or start polling for scores
fn next_state(session: &VerificationSession) -> IncodeState {
    if session.kind.requires_selfie() {
        AddConsent::new()
    } else {
        GetOnboardingStatus::new()
    }
}
