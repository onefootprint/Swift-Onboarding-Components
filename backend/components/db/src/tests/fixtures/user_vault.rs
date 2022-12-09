use crate::schema::user_vault;
use diesel::prelude::*;
use newtypes::{EncryptedVaultPrivateKey, Fingerprint, SealedVaultBytes, VaultPublicKey};

use crate::{
    models::{
        phone_number::PhoneNumber,
        user_vault::{NewUserVault, NewUserVaultArgs, UserVault},
    },
    TxnPgConnection,
};

pub fn create(conn: &mut TxnPgConnection) -> (UserVault, PhoneNumber) {
    let new_user = NewUserVaultArgs {
        e_private_key: EncryptedVaultPrivateKey(vec![]),
        public_key: VaultPublicKey::unvalidated(vec![]),
        is_live: true,
        e_phone_number: SealedVaultBytes(vec![]),
        sh_phone_number: Fingerprint(vec![]),
        e_phone_country: SealedVaultBytes(vec![]),
        tenant_id: None,
    };
    let (uv, _, phone_number) = UserVault::create(conn, new_user).unwrap();
    (uv, phone_number)
}

/// Uses a non-public API to insert a UserVault into the DB with no phone number, which never
/// happens in prod
pub fn create_no_phone(conn: &mut TxnPgConnection) -> UserVault {
    let new_user_vault = NewUserVault {
        e_private_key: EncryptedVaultPrivateKey(vec![]),
        public_key: VaultPublicKey::unvalidated(vec![]),
        is_live: true,
        is_portable: true,
    };
    diesel::insert_into(user_vault::table)
        .values(new_user_vault)
        .get_result::<UserVault>(conn.conn())
        .unwrap()
}
