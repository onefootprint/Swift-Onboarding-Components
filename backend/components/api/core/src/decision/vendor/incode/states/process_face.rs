use super::{
    map_to_api_err, save_incode_verification_result, GetOnboardingStatus, IncodeStateTransition,
    SaveVerificationResultArgs, VerificationSession,
};
use crate::decision::vendor::incode::state::IncodeState;
use crate::decision::vendor::incode::{state::TransitionResult, IncodeContext};
use crate::errors::ApiResult;
use crate::vendor_clients::IncodeClients;
use async_trait::async_trait;
use db::{DbPool, TxnPgConn};
use idv::incode::doc::IncodeProcessFaceRequest;
use newtypes::VendorAPI;

pub struct ProcessFace {}

#[async_trait]
impl IncodeStateTransition for ProcessFace {
    async fn run(
        db_pool: &DbPool,
        clients: &IncodeClients,
        ctx: &IncodeContext,
        session: &VerificationSession,
    ) -> ApiResult<Option<Self>> {
        process_face_inner(db_pool, clients, ctx, session).await?;

        Ok(Some(Self {}))
    }

    fn transition(
        self,
        _: &mut TxnPgConn,
        _: &IncodeContext,
        session: &VerificationSession,
    ) -> ApiResult<TransitionResult> {
        Ok(Self::next_state(session).into())
    }

    fn next_state(_: &VerificationSession) -> IncodeState {
        GetOnboardingStatus::new()
    }
}

pub async fn process_face_inner(
    db_pool: &DbPool,
    clients: &IncodeClients,
    ctx: &IncodeContext,
    session: &VerificationSession,
) -> ApiResult<()> {
    // make the request to incode
    let request = IncodeProcessFaceRequest {
        credentials: session.credentials.clone(),
    };
    let res = clients.incode_process_face.make_request(request).await;

    // Save our result
    let args = SaveVerificationResultArgs::from(&res, VendorAPI::IncodeProcessFace, ctx);
    save_incode_verification_result(db_pool, args).await?;

    // Now ensure we don't have an error
    res.map_err(map_to_api_err)?
        .result
        .into_success()
        .map_err(map_to_api_err)?;

    Ok(())
}
