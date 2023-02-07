use super::fixtures;
use crate::models::{data_lifetime::DataLifetime, user_vault::UserVault};
use crate::tests::prelude::*;
use macros::db_test;
use newtypes::{Fingerprint, IdentityDataKind as IDK};

#[db_test]
fn test_find_portable(conn: &mut TestPgConn) {
    // Create an ob config
    let tenant = fixtures::tenant::create(conn);
    let ob_config = fixtures::ob_configuration::create(conn, &tenant.id);
    let uv = fixtures::user_vault::create(conn).into_inner();
    let su = fixtures::scoped_user::create(conn, &uv.id, &ob_config.id);

    let seqno = DataLifetime::get_next_seqno(conn).unwrap();

    // Set up a matrix of fingerprints with different statuses
    let f1 = Fingerprint(vec![0]);
    let f2 = Fingerprint(vec![1]);
    let f3 = Fingerprint(vec![2]);
    let f4 = Fingerprint(vec![3]);
    let fingerprints_to_create = vec![
        (f1.clone(), false, false, IDK::PhoneNumber),
        (f2.clone(), true, false, IDK::Email),
        (f3.clone(), false, true, IDK::FirstName),
        (f4.clone(), true, true, IDK::LastName),
    ];

    for (sh_data, is_portablized, is_deactivated, kind) in fingerprints_to_create {
        let lifetime = fixtures::data_lifetime::build(
            conn,
            &uv.id,
            &su.id,
            seqno,
            is_portablized.then_some(seqno),
            is_deactivated.then_some(seqno),
            kind,
        );
        fixtures::fingerprint::create(conn, lifetime.id, sh_data, kind.into());
    }

    // Cannot find by speculative fingerprint
    let u = UserVault::find_portable(conn, f1).unwrap();
    assert!(u.is_none());

    // Can find by portablized, active fingerprint
    let u = UserVault::find_portable(conn, f2).unwrap();
    assert_eq!(u.map(|u| u.id), Some(uv.id));

    // Cannot find by speculative, deactivated fingerprint
    let u = UserVault::find_portable(conn, f3).unwrap();
    assert!(u.is_none());

    // Cannot find by portablized, deactivated fingerprint
    let u = UserVault::find_portable(conn, f4).unwrap();
    assert!(u.is_none());
}
