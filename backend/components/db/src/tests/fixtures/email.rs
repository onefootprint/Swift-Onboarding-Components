use newtypes::{DataLifetimeSeqno, DataPriority, Fingerprint, ScopedUserId, SealedVaultBytes, VaultId};

use crate::models::email::Email;
use crate::TxnPgConn;

pub fn create(
    conn: &mut TxnPgConn,
    uv_id: &VaultId,
    su_id: &ScopedUserId,
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
