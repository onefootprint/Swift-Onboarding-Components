use newtypes::{DataLifetimeSeqno, DataPriority, Fingerprint, ScopedUserId, SealedVaultBytes, UserVaultId};

use crate::models::email::Email;
use crate::TxnPgConnection;

pub fn create(
    conn: &mut TxnPgConnection,
    uv_id: &UserVaultId,
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
