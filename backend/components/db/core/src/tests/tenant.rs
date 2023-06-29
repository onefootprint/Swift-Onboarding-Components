use super::fixtures;
use crate::models::tenant::Tenant;
use crate::tests::prelude::*;
use macros::db_test;

#[db_test]
fn test_get(conn: &mut TestPgConn) {
    let tenant = fixtures::tenant::create(conn);
    let ob_config = fixtures::ob_configuration::create(conn, &tenant.id, true);
    let uv = fixtures::vault::create_person(conn, true).into_inner();
    let su = fixtures::scoped_vault::create(conn, &uv.id, &ob_config.id);

    let tenant_from_db = Tenant::get(conn, &tenant.id).unwrap();
    assert_eq!(tenant_from_db.id, tenant.id);

    let tenant_from_db_from_su = Tenant::get(conn, &su.id).unwrap();
    assert_eq!(tenant_from_db_from_su.id, tenant.id);
}
