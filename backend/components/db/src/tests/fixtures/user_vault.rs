use newtypes::{EncryptedVaultPrivateKey, VaultPublicKey};

use crate::{
    models::user_vault::{NewUserVaultArgs, UserVault},
    TxnPgConnection,
};

pub fn create(conn: &mut TxnPgConnection) -> UserVault {
    let new_user_vault = NewUserVaultArgs {
        e_private_key: EncryptedVaultPrivateKey(vec![]),
        public_key: VaultPublicKey::unvalidated(vec![]),
        is_live: true,
        is_portable: true,
    };
    UserVault::create(conn, new_user_vault).unwrap()
}
