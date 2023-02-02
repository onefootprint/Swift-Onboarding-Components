use crate::PgConnection;
use newtypes::{EncryptedVaultPrivateKey, VaultPublicKey};

use crate::models::tenant::{NewTenant, Tenant};

pub fn create(conn: &mut PgConnection) -> Tenant {
    let new_tenant = NewTenant {
        name: "Test tenant".to_owned(),
        public_key: VaultPublicKey::unvalidated(vec![]),
        e_private_key: EncryptedVaultPrivateKey(vec![]),
        workos_id: None,
        logo_url: None,
        sandbox_restricted: false,
    };
    Tenant::save(conn, new_tenant).expect("Couldn't create tenant")
}
