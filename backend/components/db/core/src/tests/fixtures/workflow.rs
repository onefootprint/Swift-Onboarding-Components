use newtypes::{KycConfig, ScopedVaultId, WorkflowConfig};

use crate::{models::workflow::Workflow, TxnPgConn};

pub fn create(conn: &mut TxnPgConn, sv_id: &ScopedVaultId) -> Workflow {
    let config = WorkflowConfig::Kyc(KycConfig { is_redo: false });
    Workflow::create(conn, sv_id, config, None).unwrap()
}
