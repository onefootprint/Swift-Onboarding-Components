use super::fixtures;
use crate::models::{data_lifetime::DataLifetime, vault::Vault};
use crate::tests::prelude::*;
use macros::db_test_case;
use newtypes::{Fingerprint, FingerprintScopeKind, IdentityDataKind as IDK, SandboxId};

#[db_test_case(false, false => false; "cant-find-speculative")]
#[db_test_case(true, false => true; "can-find-portablized-active")]
#[db_test_case(false, true => false; "cant-find-speculative-deactivated")]
#[db_test_case(true, true => false; "cant-find-portablized-deactivated")]
fn test_find_portable(conn: &mut TestPgConn, is_portablized: bool, is_deactivated: bool) -> bool {
    let tenant = fixtures::tenant::create(conn);
    let ob_config = fixtures::ob_configuration::create(conn, &tenant.id, true);
    let uv = fixtures::vault::create_person(conn, true).into_inner();
    let su = fixtures::scoped_vault::create(conn, &uv.id, &ob_config.id);

    let seqno = DataLifetime::get_next_seqno(conn).unwrap();

    let fingerprint = Fingerprint(vec![10]);
    let lifetime = fixtures::data_lifetime::build(
        conn,
        &uv.id,
        &su.id,
        seqno,
        is_portablized.then_some(seqno),
        is_deactivated.then_some(seqno),
        IDK::PhoneNumber,
    );
    fixtures::fingerprint::create(
        conn,
        lifetime.id,
        fingerprint.clone(),
        IDK::PhoneNumber.into(),
        FingerprintScopeKind::Global,
    );

    // Should never be able to find with wrong sandbox id
    let inverse_sandbox_id = if uv.sandbox_id.is_some() {
        None
    } else {
        Some(SandboxId::from("FLERP".to_owned()))
    };
    assert!(
        Vault::find_portable(conn, &[fingerprint.clone()], inverse_sandbox_id)
            .unwrap()
            .is_none()
    );

    let u = Vault::find_portable(conn, &[fingerprint], uv.sandbox_id).unwrap();
    u.is_some()
}
