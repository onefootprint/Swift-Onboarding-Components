use newtypes::{DataPriority, Fingerprint, ScopedUserId, SealedVaultBytes, UserVaultId};

use crate::models::email::Email;
use crate::TxnPgConnection;

pub fn create(conn: &mut TxnPgConnection, uv_id: &UserVaultId, su_id: &ScopedUserId) -> Email {
    Email::create(
        conn,
        uv_id.clone(),
        SealedVaultBytes(vec![]),
        Fingerprint(vec![]),
        DataPriority::Primary,
        su_id.clone(),
    )
    .unwrap()
}
