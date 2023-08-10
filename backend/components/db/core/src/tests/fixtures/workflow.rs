use newtypes::{KycConfig, ScopedVaultId, WorkflowConfig};

use crate::{
    models::workflow::{NewWorkflowArgs, Workflow},
    TxnPgConn,
};

pub fn create(conn: &mut TxnPgConn, sv_id: &ScopedVaultId) -> Workflow {
    let config = WorkflowConfig::Kyc(KycConfig { is_redo: false });
    let args = NewWorkflowArgs {
        scoped_vault_id: sv_id.clone(),
        config,
        fixture_result: None,
        ob_configuration_id: None,
        insight_event_id: None,
    };
    Workflow::create(conn, args).unwrap()
}
