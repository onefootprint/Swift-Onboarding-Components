use super::FetchScores;
use super::IncodeStateTransition;
use super::VerificationSession;
use crate::decision::vendor::incode::state::IncodeState;
use crate::decision::vendor::incode::state::TransitionResult;
use crate::decision::vendor::incode::IncodeContext;
use crate::decision::vendor::into_fp_error;
use crate::decision::vendor::verification_result::SaveVerificationResultArgs;
use crate::vendor_clients::IncodeClients;
use crate::FpResult;
use api_errors::ServerErr;
use async_trait::async_trait;
use db::models::document::Document;
use db::models::document::DocumentImageArgs;
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
        let id_doc_id = ctx.id_doc_id.clone();
        let doc_uploads = db_pool
            .db_query(move |conn| -> FpResult<_> {
                let (id_doc, _) = Document::get(conn, &id_doc_id)?;
                let doc_uploads = id_doc.images(conn, DocumentImageArgs::default())?;
                Ok(doc_uploads)
            })
            .await?;

        // There are 2 cases where we don't want to wait for selfie:
        // 1. if the user has a failure reason that is selfie related, OR
        // 2. if the user has a doc upload that has a terminal failure reason of some sort, since incode
        //    likely won't be able to check the face matching if they can't analyze the template
        let selfie_upload = doc_uploads.iter().find(|d| d.side.is_selfie());
        let selfie_processing_failed =
            selfie_upload.is_some_and(|u| u.failure_reasons.iter().any(|r| r.selfie_processing_failed()));
        let front_upload = doc_uploads
            .iter()
            .find(|d| d.side.is_front())
            .ok_or(ServerErr("missing front upload"))?;
        let document_could_not_be_processed = front_upload
            .failure_reasons
            .iter()
            .any(|r| r.selfie_document_processing_failed());

        // Only wait for selfie if selfie AND doc were successfully processed
        let skip_wait_for_selfie = selfie_processing_failed || document_could_not_be_processed;
        // make the request to incode
        let request = IncodeGetOnboardingStatusRequest {
            credentials: session.credentials.clone(),
            session_kind: session.kind,
            incode_verification_session_id: session.id.clone(),
            skip_wait_for_selfie,
        };
        let res = clients.incode_get_onboarding_status.make_request(request).await;

        // Save our result
        let args = SaveVerificationResultArgs::from(&res, VendorAPI::IncodeGetOnboardingStatus, ctx);
        args.save(db_pool).await?;

        match res {
            Ok(res) => {
                res.result.into_success().map_err(into_fp_error)?;
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
                    Err(into_fp_error(e))?
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
