use crate::models::vault::{
    NewVaultArgs,
    Vault,
};
use crate::TxnPgConn;
use newtypes::{
    EncryptedVaultPrivateKey,
    Locked,
    SandboxId,
    VaultKind,
    VaultPublicKey,
};

pub fn create_person(conn: &mut TxnPgConn, is_live: bool) -> Locked<Vault> {
    let sandbox_id = (!is_live).then_some(crypto::random::gen_random_alphanumeric_code(10));
    create(conn, VaultKind::Person, sandbox_id, true)
}

pub fn create_business(conn: &mut TxnPgConn) -> Locked<Vault> {
    create(conn, VaultKind::Business, None, true)
}

pub fn new_vault_args(kind: VaultKind, sandbox_id: Option<String>, is_portable: bool) -> NewVaultArgs {
    let e_private_key_bytes = hex::decode("a2616e98181857187718da18e4184818b2188c18c5186518e1182402182718c518ef186b185b182e1871189c1877187418c0182a61639830184a18b0186e1830186a185418530418ff18d918af18a9189f185318e218e7189818bc188f18b2185a185b18b705184e185e1718a8189a188d18b018c20118dd18ce1886184718bd189014189e18da1833187918af182318b518af").unwrap();
    let public_key_bytes = hex::decode("0420ed010cceea287b9a6df2e3ba25a05ad6524c7e91a9aca1a7665c22e9b505870f648130a2a09766fae67647e1ac4c7e721d0822a36e5dc3fdd3c423743bd717").unwrap();
    NewVaultArgs {
        e_private_key: EncryptedVaultPrivateKey(e_private_key_bytes),
        public_key: VaultPublicKey::from_raw_uncompressed(&public_key_bytes).unwrap(),
        is_live: sandbox_id.is_none(),
        sandbox_id: sandbox_id.map(SandboxId::from),
        kind,
        is_fixture: false,
        is_created_via_api: !is_portable,
        duplicate_of_id: None,
    }
}

pub fn create(
    conn: &mut TxnPgConn,
    kind: VaultKind,
    sandbox_id: Option<String>,
    is_portable: bool,
) -> Locked<Vault> {
    let args = new_vault_args(kind, sandbox_id, is_portable);
    Vault::create(conn, args).unwrap()
}
