use super::IncodeStateTransition;
use super::VerificationSession;
use crate::decision::vendor::incode::state::IncodeState;
use crate::decision::vendor::incode::state::TransitionResult;
use crate::decision::vendor::incode::IncodeContext;
use crate::errors::ApiCoreError;
use crate::vendor_clients::IncodeClients;
use crate::FpResult;
use async_trait::async_trait;
use db::models::document::Document;
use db::models::document::DocumentUpdate;
use db::models::risk_signal::RiskSignal;
use db::models::risk_signal_group::RiskSignalGroupScope;
use db::models::user_timeline::UserTimeline;
use db::DbPool;
use db::TxnPgConn;
use newtypes::DocumentId;
use newtypes::DocumentStatus;
use newtypes::FootprintReasonCode;
use newtypes::ScopedVaultId;
use newtypes::VaultId;
use newtypes::VendorAPI;
use newtypes::VerificationResultId;
use newtypes::WorkflowId;

// TODO this is more like the other workflow state transitions where it has behavior that must be
// atomic with entering the state.
// Need to add a generic way to handle this
pub struct Fail {}

impl Fail {
    #[tracing::instrument("Fail::enter", skip_all)]
    pub fn enter(
        conn: &mut TxnPgConn,
        sv_id: &ScopedVaultId,
        vault_id: &VaultId,
        wf_id: &WorkflowId,
        id_doc_id: &DocumentId,
        vres_id: VerificationResultId,
        vendor_api: VendorAPI,
    ) -> FpResult<()> {
        // Mark the id doc as failed
        let update = DocumentUpdate {
            status: Some(DocumentStatus::Failed),
            ..Default::default()
        };
        let scope = RiskSignalGroupScope::WorkflowId { id: wf_id, sv_id };
        let _ = RiskSignal::bulk_save_for_scope(
            conn,
            scope,
            vec![(FootprintReasonCode::DocumentUploadFailed, vendor_api, vres_id)],
            newtypes::RiskSignalGroupKind::Doc,
            false,
        );

        Document::update(conn, id_doc_id, update)?;
        // Create a timeline event
        let info = newtypes::DocumentUploadedInfo {
            id: id_doc_id.clone(),
        };
        UserTimeline::create(conn, info, vault_id.clone(), sv_id.clone())?;

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
    ) -> FpResult<Option<Self>> {
        Ok(None)
    }

    fn transition(
        self,
        _: &mut TxnPgConn,
        _: &IncodeContext,
        _: &VerificationSession,
    ) -> FpResult<TransitionResult> {
        Err(ApiCoreError::AssertionError(
            "Incode machine already failed".into(),
        ))?
    }

    fn next_state(_: &VerificationSession) -> IncodeState {
        Fail::new()
    }
}
