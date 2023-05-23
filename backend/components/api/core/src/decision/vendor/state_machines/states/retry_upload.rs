use super::{AddFront, IncodeState, IncodeStateTransition, VerificationSession};
use crate::decision::vendor::state_machines::incode_state_machine::IncodeContext;
use crate::errors::ApiResult;
use crate::ApiError;
use async_trait::async_trait;
use db::models::document_request::{DocumentRequest, DocumentRequestUpdate};
use db::models::incode_verification_session::{IncodeVerificationSession, UpdateIncodeVerificationSession};
use db::models::user_timeline::UserTimeline;
use db::{DbPool, PgConn, TxnPgConn};
use idv::footprint_http_client::FootprintVendorHttpClient;
use newtypes::{
    DocumentRequestStatus, IdentityDocumentUploadedInfo, IncodeVerificationSessionState, ScopedVaultId,
};

/// Document upload has failed and user needs to retry
pub struct RetryUpload {}

const NUM_RETRIES: i64 = 3;

/// We only allow users to have NUM_RETRIES tries. We'll handle Failed vs. UpploadFailed differently when creating a decision
pub fn document_retry_limit_exceeded(conn: &mut PgConn, scoped_user_id: &ScopedVaultId) -> ApiResult<bool> {
    let failed_statuses = vec![DocumentRequestStatus::Failed, DocumentRequestStatus::UploadFailed];
    let num_failed = DocumentRequest::count_statuses(conn, scoped_user_id, failed_statuses)?;
    Ok(num_failed >= NUM_RETRIES)
}

impl RetryUpload {
    /// Create an instance of RetryUpload from any other state
    pub fn enter(conn: &mut TxnPgConn, ctx: &IncodeContext) -> ApiResult<Self> {
        // Create a timeline event
        let info = IdentityDocumentUploadedInfo {
            id: ctx.id_doc_id.clone(),
        };
        UserTimeline::create(conn, info, ctx.vault.id.clone(), ctx.sv_id.clone())?;

        // Move our status to failed since we need a new doc verification request
        let update = DocumentRequestUpdate::status(DocumentRequestStatus::Failed);
        let doc_request = DocumentRequest::update_by_id(conn, &ctx.doc_request_id, update)?;
        // If we have exceeded our retry limit, we no longer want to create new document requests and
        // we're done. GETting the status at this point will return `RetryLimitExceed` to the frontend
        //
        // Note (2023-01-19):
        //   There's a the question of how to represent this in the document request status, if at all.
        //   Since "failing due to retries" is a part of the overall bifrost "Doc collection" step, and not an individual doc request itself.
        //   I think in order to maintain a serialized log of why an entire set of document requests failed, we'd need a new data model and this just seemed simpler for now to encode in runtime logic
        if !document_retry_limit_exceeded(conn, &doc_request.scoped_vault_id)? {
            // Create a new document request.
            // ref_id is None here since we are retrying scan onboarding!
            let sv_id = ctx.sv_id.clone();
            let collect_selfie = doc_request.should_collect_selfie;
            DocumentRequest::create(conn, sv_id, None, collect_selfie, Some(doc_request.id))?;
        }
        Ok(Self {})
    }
}

#[async_trait]
impl IncodeStateTransition for RetryUpload {
    async fn run(
        self,
        db_pool: &DbPool,
        _footprint_http_client: &FootprintVendorHttpClient,
        ctx: &IncodeContext,
        session: &VerificationSession,
    ) -> Result<IncodeState, ApiError> {
        let session_id = session.id.clone();
        let id_doc_id = ctx.id_doc_id.clone();
        //
        // Set up the next state transition
        //
        // Save the next stage's Vreq
        db_pool
            .db_transaction(move |conn| -> ApiResult<_> {
                // Update our state to the next stage and add in the new identity document
                let update = UpdateIncodeVerificationSession::set_state_and_identity_document(
                    IncodeVerificationSessionState::AddFront,
                    id_doc_id,
                );
                IncodeVerificationSession::update(conn, &session_id, update)?;

                Ok(())
            })
            .await?;

        Ok(AddFront {}.into())
    }
}
