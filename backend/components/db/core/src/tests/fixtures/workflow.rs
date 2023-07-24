use newtypes::{KycConfig, ScopedVaultId, WorkflowConfig};

use crate::{models::workflow::Workflow, TxnPgConn};

pub fn create(conn: &mut TxnPgConn, sv_id: &ScopedVaultId) -> Workflow {
    Workflow::create(conn, sv_id, WorkflowConfig::Kyc(KycConfig { is_redo: false })).unwrap()
}
