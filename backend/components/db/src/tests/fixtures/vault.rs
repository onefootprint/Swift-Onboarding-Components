use newtypes::{EncryptedVaultPrivateKey, Locked, VaultPublicKey};

use crate::{
    models::vault::{NewPortablePersonUserVaultArgs, Vault},
    TxnPgConn,
};

pub fn create_person(conn: &mut TxnPgConn, is_live: bool) -> Locked<Vault> {
    let public_key_bytes = hex::decode("0474f93a0a152593ca2fc0620296cecf637cb6613e2555557dee62752e7dbeba01fc32b55abf172913ec28a91f379e49d0c67d7d1b4318770cd3f6aa624015a184").unwrap();
    let new_user_vault = NewPortablePersonUserVaultArgs {
        e_private_key: EncryptedVaultPrivateKey(vec![]),
        public_key: VaultPublicKey::from_raw_uncompressed(&public_key_bytes).unwrap(),
        is_live,
        is_portable: true,
    };
    Vault::create_person_vault(conn, new_user_vault).unwrap()
}
