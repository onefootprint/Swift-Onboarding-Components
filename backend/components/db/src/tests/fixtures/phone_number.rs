use newtypes::{DataPriority, ScopedUserId, UserVaultId};
use newtypes::{Fingerprint, SealedVaultBytes};

use crate::{
    models::phone_number::{NewPhoneNumberArgs, PhoneNumber},
    TxnPgConn,
};

pub fn create(conn: &mut TxnPgConn, uv_id: &UserVaultId, su_id: Option<&ScopedUserId>) -> PhoneNumber {
    let phone_info = NewPhoneNumberArgs {
        e_phone_number: SealedVaultBytes(vec![]),
        sh_phone_number: Fingerprint(vec![]),
        e_phone_country: SealedVaultBytes(vec![]),
    };
    PhoneNumber::create_verified(conn, uv_id, phone_info, DataPriority::Primary, su_id).unwrap()
}
