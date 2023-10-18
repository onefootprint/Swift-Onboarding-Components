use super::{
    map_to_api_err, save_incode_verification_result, GetOnboardingStatus, IncodeStateTransition, ProcessFace,
    SaveVerificationResultArgs, VerificationSession,
};
use crate::decision::vendor::incode::state::IncodeState;
use crate::decision::vendor::incode::{state::TransitionResult, IncodeContext};
use crate::errors::ApiResult;
use crate::vendor_clients::IncodeClients;
use async_trait::async_trait;
use db::{DbPool, TxnPgConn};
use idv::incode::doc::IncodeProcessIdRequest;
use newtypes::VendorAPI;

pub struct ProcessId {}

#[async_trait]
impl IncodeStateTransition for ProcessId {
    async fn run(
        db_pool: &DbPool,
        clients: &IncodeClients,
        ctx: &IncodeContext,
        session: &VerificationSession,
    ) -> ApiResult<Option<Self>> {
        process_id_inner(db_pool, clients, ctx, session).await?;

        Ok(Some(Self {}))
    }

    fn transition(
        self,
        _: &mut TxnPgConn,
        _: &IncodeContext,
        session: &VerificationSession,
    ) -> ApiResult<TransitionResult> {
        let next = Self::next_state(session);
        Ok(next.into())
    }

    // After processing the ID portion, we move on to selfie if applicable, or start polling for scores
    fn next_state(session: &VerificationSession) -> IncodeState {
        if session.kind.requires_selfie() {
            ProcessFace::new()
        } else {
            GetOnboardingStatus::new()
        }
    }
}

async fn process_id_inner(
    db_pool: &DbPool,
    clients: &IncodeClients,
    ctx: &IncodeContext,
    session: &VerificationSession,
) -> ApiResult<()> {
    // make the request to incode
    let request = IncodeProcessIdRequest {
        credentials: session.credentials.clone(),
    };
    let res = clients.incode_process_id.make_request(request).await;

    // Save our result
    let args = SaveVerificationResultArgs::from(&res, VendorAPI::IncodeProcessId, ctx);
    save_incode_verification_result(db_pool, args).await?;

    // Now ensure we don't have an error
    res.map_err(map_to_api_err)?
        .result
        .into_success()
        .map_err(map_to_api_err)?;

    Ok(())
}
