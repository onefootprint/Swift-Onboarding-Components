use super::fixtures;
use crate::models::{data_lifetime::DataLifetime, user_vault::UserVault};
use crate::tests::prelude::*;
use macros::db_test_case;
use newtypes::{Fingerprint, IdentityDataKind as IDK};

#[db_test_case(false, false => false; "cant-find-speculative")]
#[db_test_case(true, false => true; "can-find-portablized-active")]
#[db_test_case(false, true => false; "cant-find-speculative-deactivated")]
#[db_test_case(true, true => false; "cant-find-portablized-deactivated")]
fn test_find_portable(conn: &mut TestPgConn, is_portablized: bool, is_deactivated: bool) -> bool {
    let tenant = fixtures::tenant::create(conn);
    let ob_config = fixtures::ob_configuration::create(conn, &tenant.id, true);
    let uv = fixtures::user_vault::create(conn, true).into_inner();
    let su = fixtures::scoped_user::create(conn, &uv.id, &ob_config.id);

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
    fixtures::fingerprint::create(conn, lifetime.id, fingerprint.clone(), IDK::PhoneNumber.into());

    let u = UserVault::find_portable(conn, fingerprint).unwrap();
    u.is_some()
}
