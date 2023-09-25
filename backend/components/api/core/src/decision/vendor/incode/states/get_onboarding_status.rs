use super::{
    map_to_api_err, save_incode_verification_result, FetchScores, IncodeStateTransition,
    SaveVerificationResultArgs, VerificationSession,
};
use crate::decision::vendor::incode::state::IncodeState;
use crate::decision::vendor::incode::{state::TransitionResult, IncodeContext};
use crate::errors::ApiResult;
use crate::vendor_clients::IncodeClients;
use async_trait::async_trait;
use db::models::identity_document::{IdentityDocument, IdentityDocumentUpdate};
use db::{DbPool, TxnPgConn};
use idv::incode::doc::IncodeGetOnboardingStatusRequest;
use newtypes::{IdentityDocumentId, IdentityDocumentStatus, VendorAPI};

pub struct GetOnboardingStatus {}

impl GetOnboardingStatus {
    pub fn enter(conn: &mut TxnPgConn, id_doc_id: &IdentityDocumentId) -> ApiResult<()> {
        // Update IdentityDocument to status = complete so we clear the Bifrost req
        // TODO: we are setting status to complete here but set completed_seqno later- is that gunna cause any problems??
        // It would actually be nice to write the timeline event, vault the docs, etc here but it sounds like the problem is our DI data model requires us to know the doc type and we can't confirm that until the processing part of the flow is complete
        let update = IdentityDocumentUpdate {
            status: Some(IdentityDocumentStatus::Complete),
            ..Default::default()
        };
        IdentityDocument::update(conn, id_doc_id, update)?;
        Ok(())
    }
}

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
            session_kind: session.kind.clone(),
            incode_verification_session_id: session.id.clone(),
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
        Ok(FetchScores::new().into())
    }

    fn next_state(_: &VerificationSession) -> IncodeState {
        FetchScores::new()
    }
}
