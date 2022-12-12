use newtypes::{DataPriority, ScopedUserId, UserVaultId};
use newtypes::{Fingerprint, SealedVaultBytes};

use crate::{
    models::phone_number::{NewPhoneNumberArgs, PhoneNumber},
    TxnPgConnection,
};

pub fn create(conn: &mut TxnPgConnection, uv_id: &UserVaultId, su_id: Option<&ScopedUserId>) -> PhoneNumber {
    let phone_info = NewPhoneNumberArgs {
        e_phone_number: SealedVaultBytes(vec![]),
        sh_phone_number: Fingerprint(vec![]),
        e_phone_country: SealedVaultBytes(vec![]),
    };
    PhoneNumber::create_verified(
        conn,
        uv_id.clone(),
        phone_info,
        DataPriority::Primary,
        su_id.cloned(),
    )
    .unwrap()
}
