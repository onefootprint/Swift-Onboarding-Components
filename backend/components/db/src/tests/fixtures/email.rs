use newtypes::{DataLifetimeSeqno, DataPriority, Fingerprint, ScopedVaultId, SealedVaultBytes, VaultId};

use crate::models::email::Email;
use crate::TxnPgConn;

pub fn create(
    conn: &mut TxnPgConn,
    uv_id: &VaultId,
    su_id: &ScopedVaultId,
    seqno: DataLifetimeSeqno,
) -> Email {
    Email::create(
        conn,
        uv_id,
        SealedVaultBytes(vec![]),
        Fingerprint(vec![]),
        DataPriority::Primary,
        su_id,
        seqno,
    )
    .unwrap()
}
