use super::FetchScores;
use super::IncodeStateTransition;
use super::VerificationSession;
use crate::decision::vendor::incode::state::IncodeState;
use crate::decision::vendor::incode::state::TransitionResult;
use crate::decision::vendor::incode::IncodeContext;
use crate::decision::vendor::map_to_api_error;
use crate::decision::vendor::verification_result::SaveVerificationResultArgs;
use crate::vendor_clients::IncodeClients;
use crate::FpResult;
use async_trait::async_trait;
use db::DbPool;
use db::TxnPgConn;
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
    ) -> FpResult<Option<Self>> {
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
        args.save(db_pool).await?;

        match res {
            Ok(res) => {
                res.result.into_success().map_err(map_to_api_error)?;
                Ok(Some(Self {}))
            }
            Err(e) => {
                // If polling Incode times out, return None to terminate the state machine.
                // This prevents us from hard erroring during Bifrost and allows us to re-run the Incode state
                // machine later (in /proceed or async thereafter)
                if matches!(e, idv::incode::error::Error::ResultsNotReady) {
                    tracing::error!(
                        "IncodeStateTransition::GetOnboardingStatus ResultsNotReady, not transitioning"
                    );
                    Ok(None)
                } else {
                    Err(map_to_api_error(e))?
                }
            }
        }
    }

    fn transition(
        self,
        _: &mut TxnPgConn,
        _: &IncodeContext,
        _: &VerificationSession,
    ) -> FpResult<TransitionResult> {
        Ok(FetchScores::new().into())
    }

    fn next_state(_: &VerificationSession) -> IncodeState {
        FetchScores::new()
    }
}
