use super::{
    map_to_api_err, save_incode_verification_result, IncodeStateTransition, SaveVerificationResultArgs,
    VerificationSession,
};
use crate::decision::vendor::incode::{state::TransitionResult, IncodeContext};
use crate::errors::ApiResult;
use crate::vendor_clients::IncodeClients;
use async_trait::async_trait;

use db::{DbPool, TxnPgConn};
use idv::incode::doc::IncodeGetOnboardingStatusRequest;
use newtypes::VendorAPI;

pub struct GetOnboardingStatus {}

#[async_trait]
impl IncodeStateTransition for GetOnboardingStatus {
    async fn run(
        db_pool: &DbPool,
        clients: &IncodeClients,
        ctx: &IncodeContext,
        session: &VerificationSession,
    ) -> ApiResult<Option<Self>> {
        // make the request to incode
        let request = IncodeGetOnboardingStatusRequest {
            credentials: session.credentials.clone(),
            session_kind: session.kind,
            incode_verification_session_id: session.id.clone(),
            wait_for_selfie: !session
                .ignored_failure_reasons
                .iter()
                .any(|r| r.selfie_processing_failed()),
        };
        let res = clients.incode_get_onboarding_status.make_request(request).await;

        // Save our result
        let args = SaveVerificationResultArgs::from(&res, VendorAPI::IncodeGetOnboardingStatus, ctx);
        save_incode_verification_result(db_pool, args).await?;

        match res {
            Ok(res) => {
                res.result.into_success().map_err(map_to_api_err)?;
                Ok(Some(Self {}))
            }
            Err(e) => {
                // If polling Incode times out, return None to terminate the state machine.
                // This prevents us from hard erroring during Bifrost and allows us to re-run the Incode state machine later (in /proceed or async thereafter)
                if matches!(e, idv::incode::error::Error::ResultsNotReady) {
                    tracing::error!(
                        "IncodeStateTransition::GetOnboardingStatus ResultsNotReady, not transitioning"
                    );
                    Ok(None)
                } else {
                    Err(map_to_api_err(e))?
                }
            }
        }
    }

    fn transition(
        self,
        _: &mut TxnPgConn,
        _: &IncodeContext,
        _: &VerificationSession,
    ) -> ApiResult<TransitionResult> {
        Ok(TransitionResult::default())
    }
}
