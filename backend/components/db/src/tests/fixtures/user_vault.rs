use newtypes::{EncryptedVaultPrivateKey, Fingerprint, SealedVaultBytes, VaultPublicKey};

use crate::{
    models::{
        phone_number::PhoneNumber,
        user_vault::{NewUserVaultArgs, UserVault},
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
