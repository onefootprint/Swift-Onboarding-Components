use super::IncodeStateTransition;
use super::VerificationSession;
use crate::decision::vendor::incode::state::StateResult;
use crate::decision::vendor::incode::IncodeContext;
use crate::errors::ApiErrorKind;
use crate::errors::ApiResult;
use crate::vendor_clients::IncodeClients;

use async_trait::async_trait;
use db::models::document_request::DocumentRequestUpdate;
use db::models::identity_document::IdentityDocument;
use db::models::user_timeline::UserTimeline;
use db::DbPool;
use db::TxnPgConn;
use newtypes::DocumentRequestStatus;

// TODO this is more like the other workflow state transitions where it has behavior that must be
// atomic with entering the state.
// Need to add a generic way to handle this
pub struct Fail {}

impl Fail {
    pub fn enter(conn: &mut TxnPgConn, ctx: &IncodeContext) -> ApiResult<()> {
        // Mark the document request as failed
        let update = DocumentRequestUpdate::status(DocumentRequestStatus::Failed);
        let (_, doc_req) = IdentityDocument::get(conn, &ctx.id_doc_id)?;

        doc_req.update(conn, update)?;
        // Create a timeline event
        let info = newtypes::IdentityDocumentUploadedInfo {
            id: ctx.id_doc_id.clone(),
        };
        UserTimeline::create(conn, info, ctx.vault.id.clone(), ctx.sv_id.clone())?;

        Ok(())
    }
}

#[async_trait]
impl IncodeStateTransition for Fail {
    async fn run(
        _: &DbPool,
        _: &IncodeClients,
        _: &IncodeContext,
        _: &VerificationSession,
    ) -> ApiResult<Option<Self>> {
        Ok(None)
    }

    fn transition(
        self,
        _: &mut TxnPgConn,
        _: &IncodeContext,
        _: &VerificationSession,
    ) -> ApiResult<StateResult> {
        Err(ApiErrorKind::AssertionError("Incode machine already failed".into()))?
    }
}
