use crate::PgConn;
use newtypes::{EncryptedVaultPrivateKey, VaultPublicKey};

use crate::models::tenant::{NewTenant, Tenant};

pub fn create(conn: &mut PgConn) -> Tenant {
    let new_tenant = NewTenant {
        name: "Test tenant".to_owned(),
        public_key: VaultPublicKey::unvalidated(vec![]),
        e_private_key: EncryptedVaultPrivateKey(vec![]),
        workos_id: None,
        logo_url: None,
        sandbox_restricted: false,
    };
    Tenant::create(conn, new_tenant).expect("Couldn't create tenant")
}
