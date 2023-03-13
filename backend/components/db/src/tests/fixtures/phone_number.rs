use crate::{
    models::phone_number::{NewPhoneNumberArgs, PhoneNumber},
    TxnPgConn,
};
use newtypes::{DataPriority, ScopedVaultId, VaultId};
use newtypes::{Fingerprint, SealedVaultBytes};
use rand::Rng;

fn random_phone_number() -> String {
    let mut rng = rand::thread_rng();

    format!(
        "+1{}",
        (0..10)
            .map(|_| rng.gen_range(0..10).to_string())
            .collect::<Vec<String>>()
            .join("")
    )
}

pub fn create(conn: &mut TxnPgConn, uv_id: &VaultId, su_id: Option<&ScopedVaultId>) -> PhoneNumber {
    let phone_info = NewPhoneNumberArgs {
        e_phone_number: SealedVaultBytes(vec![]),
        sh_phone_number: Fingerprint(random_phone_number().as_bytes().to_vec()),
    };
    PhoneNumber::create_verified(conn, uv_id, phone_info, DataPriority::Primary, su_id).unwrap()
}
