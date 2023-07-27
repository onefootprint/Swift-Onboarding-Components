use super::fixtures;
use crate::models::data_lifetime::DataLifetime;
use crate::tests::prelude::*;
use macros::db_test;
use newtypes::{
    DataLifetimeId, DataLifetimeSeqno, DocumentKind, DocumentSide, IdentityDataKind, ModernIdDocKind,
    ScopedVaultId, TenantId, VaultId,
};
use std::collections::HashSet;

/// Util function to get the set of IDs from &Vec<DataLifetime> or Vec<&DataLifetime>
fn ids<T, TIter>(lifetimes: TIter) -> HashSet<DataLifetimeId>
where
    TIter: IntoIterator<Item = T>,
    T: std::borrow::Borrow<DataLifetime>,
{
    HashSet::from_iter(lifetimes.into_iter().map(|l| l.borrow().id.clone()))
}

struct TestData {
    t_id: TenantId,
    t2_id: TenantId,
    uv_id: VaultId,
    uv2_id: VaultId,
    uvx_id: VaultId,
    su_id: ScopedVaultId,
    seqno0: DataLifetimeSeqno,
    seqno1: DataLifetimeSeqno,
    seqno2: DataLifetimeSeqno,
    seqno3: DataLifetimeSeqno,
    seqno4: DataLifetimeSeqno,
    seqno5: DataLifetimeSeqno,
    seqno6: DataLifetimeSeqno,
    lifetime1: DataLifetime,
    lifetime2: DataLifetime,
    lifetime3: DataLifetime,
    lifetime4: DataLifetime,
    lifetime5: DataLifetime,
    lifetime6: DataLifetime,
}

impl TestData {
    fn build(conn: &mut TestPgConn) -> Self {
        // Create tenants
        let t_id = fixtures::tenant::create(conn).id;
        let t2_id = fixtures::tenant::create(conn).id;

        // Create ob configs
        let ob_config_id = fixtures::ob_configuration::create(conn, &t_id, true).id;
        let ob_config2_id = fixtures::ob_configuration::create(conn, &t2_id, true).id;

        // Create user vaults (without phone number)
        let uv_id = fixtures::vault::create_person(conn, true).into_inner().id;
        let uv2_id = fixtures::vault::create_person(conn, true).into_inner().id;
        let uvx_id = fixtures::vault::create_person(conn, true).into_inner().id;

        // Create scoped users
        let su_id = fixtures::scoped_vault::create(conn, &uv_id, &ob_config_id).id;
        let su2_id = fixtures::scoped_vault::create(conn, &uv2_id, &ob_config_id).id;
        let su3_id = fixtures::scoped_vault::create(conn, &uv_id, &ob_config2_id).id;

        // Timeline of seqnos
        let seqno0 = DataLifetime::get_next_seqno(conn).unwrap();
        let seqno1 = DataLifetime::get_next_seqno(conn).unwrap();
        let seqno2 = DataLifetime::get_next_seqno(conn).unwrap();
        let seqno3 = DataLifetime::get_next_seqno(conn).unwrap();
        let seqno4 = DataLifetime::get_next_seqno(conn).unwrap();
        let seqno5 = DataLifetime::get_next_seqno(conn).unwrap();
        let seqno6 = DataLifetime::get_next_seqno(conn).unwrap();

        // Place some DataLifetimes at various points along the timeline
        let lifetime1 =
            fixtures::data_lifetime::build(conn, &uv_id, &su_id, seqno1, None, None, IdentityDataKind::Email);
        let lifetime2 = fixtures::data_lifetime::build(
            conn,
            &uv_id,
            &su_id,
            seqno1,
            Some(seqno3),
            None,
            IdentityDataKind::FirstName,
        );
        let lifetime3 = fixtures::data_lifetime::build(
            conn,
            &uv_id,
            &su_id,
            seqno1,
            Some(seqno4),
            Some(seqno5),
            IdentityDataKind::LastName,
        );
        // For same user, different scoped user
        let lifetime4 = fixtures::data_lifetime::build(
            conn,
            &uv_id,
            &su3_id,
            seqno1,
            Some(seqno4),
            None,
            IdentityDataKind::PhoneNumber,
        );
        // For different user
        let lifetime5 = fixtures::data_lifetime::build(
            conn,
            &uv2_id,
            &su2_id,
            seqno1,
            None,
            None,
            DocumentKind::Image(ModernIdDocKind::Passport, DocumentSide::Front),
        );
        let lifetime6 = fixtures::data_lifetime::build(
            conn,
            &uv2_id,
            &su2_id,
            seqno1,
            Some(seqno3),
            None,
            IdentityDataKind::AddressLine1,
        );

        Self {
            t_id,
            t2_id,
            uv_id,
            uv2_id,
            uvx_id,
            su_id,
            seqno0,
            seqno1,
            seqno2,
            seqno3,
            seqno4,
            seqno5,
            seqno6,
            lifetime1,
            lifetime2,
            lifetime3,
            lifetime4,
            lifetime5,
            lifetime6,
        }
    }
}

#[db_test]
fn test_get_active(conn: &mut TestPgConn) {
    let c = TestData::build(conn);
    // Query for su_id, should return all active lifetimes
    let results = DataLifetime::get_active(conn, &c.uv_id, Some(&c.su_id)).unwrap();
    assert_eq!(ids(results), ids(vec![&c.lifetime1, &c.lifetime2, &c.lifetime4]));

    // Query for only portable data (not scoped to any tenant), should only return portable lifetimes
    let results = DataLifetime::get_active(conn, &c.uv_id, None).unwrap();
    assert_eq!(ids(results), ids(vec![&c.lifetime2, &c.lifetime4]));
}

#[db_test]
fn test_get_bulk_active_for_tenant(conn: &mut TestPgConn) {
    let c = TestData::build(conn);
    // View for tenant 1
    let mut results =
        DataLifetime::get_bulk_active_for_tenant(conn, vec![&c.uv_id, &c.uv2_id, &c.uvx_id], &c.t_id, None)
            .unwrap();
    assert_eq!(
        ids(results.remove(&c.uv_id).unwrap()),
        ids(vec![&c.lifetime1, &c.lifetime2, &c.lifetime4]) // lifetime4 visible from other tenant bc portable
    );
    assert_eq!(
        ids(results.remove(&c.uv2_id).unwrap()),
        ids(vec![&c.lifetime5, &c.lifetime6])
    );
    assert!(results.is_empty()); // No other results

    // View for tenant 2
    let mut results =
        DataLifetime::get_bulk_active_for_tenant(conn, vec![&c.uv_id, &c.uv2_id, &c.uvx_id], &c.t2_id, None)
            .unwrap();
    assert_eq!(
        ids(results.remove(&c.uv_id).unwrap()),
        ids(vec![&c.lifetime2, &c.lifetime4]) //lifetime2 visible from other tenant bc portable
    );
    assert_eq!(ids(results.remove(&c.uv2_id).unwrap()), ids(vec![&c.lifetime6])); // lifetime6 visible from other tenant bc portable
    assert!(results.is_empty()); // No other results
}

#[db_test]
fn test_get_bulk_active_for_tenant_seqno(conn: &mut TestPgConn) {
    let c = TestData::build(conn);

    let tests = vec![
        (Some(c.seqno0), (vec![], vec![]), (vec![], vec![])), // Nothing exists
        (
            Some(c.seqno1),
            (
                vec![&c.lifetime1, &c.lifetime2, &c.lifetime3],
                vec![&c.lifetime5, &c.lifetime6],
            ),
            (vec![&c.lifetime4], vec![]),
        ), // 1,2,3 added for (t1, uv1), 5,6 added for (t1, uv2), 4 added for (t2, uv1)
        (
            Some(c.seqno3),
            (
                vec![&c.lifetime1, &c.lifetime2, &c.lifetime3],
                vec![&c.lifetime5, &c.lifetime6],
            ),
            (vec![&c.lifetime4, &c.lifetime2], vec![&c.lifetime6]),
        ), // 2,6 portabalized
        (
            Some(c.seqno4),
            (
                vec![&c.lifetime1, &c.lifetime2, &c.lifetime3, &c.lifetime4],
                vec![&c.lifetime5, &c.lifetime6],
            ),
            (vec![&c.lifetime4, &c.lifetime2, &c.lifetime3], vec![&c.lifetime6]),
        ), // 3,4 portabalized
        (
            Some(c.seqno5),
            (
                vec![&c.lifetime1, &c.lifetime2, &c.lifetime4],
                vec![&c.lifetime5, &c.lifetime6],
            ),
            (vec![&c.lifetime4, &c.lifetime2], vec![&c.lifetime6]),
        ), // 3 deactivated
        (
            None,
            (
                vec![&c.lifetime1, &c.lifetime2, &c.lifetime4],
                vec![&c.lifetime5, &c.lifetime6],
            ),
            (vec![&c.lifetime4, &c.lifetime2], vec![&c.lifetime6]),
        ),
    ];
    for test in tests {
        let (seqno, (t1_u1_expected, t1_u2_expected), (t2_u1_expected, t2_u2_expected)) = test;

        let mut t1_results = DataLifetime::get_bulk_active_for_tenant(
            conn,
            vec![&c.uv_id, &c.uv2_id, &c.uvx_id],
            &c.t_id,
            seqno,
        )
        .unwrap();

        // View for tenant 1
        assert_eq!(
            ids(t1_u1_expected),
            ids(t1_results.remove(&c.uv_id).unwrap_or_default())
        );
        assert_eq!(
            ids(t1_u2_expected),
            ids(t1_results.remove(&c.uv2_id).unwrap_or_default())
        );
        assert!(t1_results.is_empty()); // No other results

        // View for tenant 2
        let mut t2_results = DataLifetime::get_bulk_active_for_tenant(
            conn,
            vec![&c.uv_id, &c.uv2_id, &c.uvx_id],
            &c.t2_id,
            seqno,
        )
        .unwrap();
        assert_eq!(
            ids(t2_u1_expected),
            ids(t2_results.remove(&c.uv_id).unwrap_or_default())
        );
        assert_eq!(
            ids(t2_u2_expected),
            ids(t2_results.remove(&c.uv2_id).unwrap_or_default())
        );
        assert!(t2_results.is_empty()); // No other results
    }
}

#[db_test]
fn test_get_active_at_for_tenant(conn: &mut TestPgConn) {
    let c = TestData::build(conn);
    let tests = vec![
        (c.seqno0, vec![]),                                         // Nothing exists
        (c.seqno1, vec![&c.lifetime1, &c.lifetime2, &c.lifetime3]), // l1, l2, l3 created for tenant
        (c.seqno2, vec![&c.lifetime1, &c.lifetime2, &c.lifetime3]), // Nothing happens here
        (c.seqno3, vec![&c.lifetime1, &c.lifetime2, &c.lifetime3]), // l2 portable
        (
            c.seqno4,
            vec![&c.lifetime1, &c.lifetime2, &c.lifetime3, &c.lifetime4],
        ), // l3 portable, l4 portable at other tenant
        (c.seqno5, vec![&c.lifetime1, &c.lifetime2, &c.lifetime4]), // l3 deactivated
        (c.seqno6, vec![&c.lifetime1, &c.lifetime2, &c.lifetime4]), // Nothing happens here
    ];
    for test in tests {
        let (seqno, expected_results) = test;
        let results = DataLifetime::get_active_at(conn, &c.uv_id, Some(&c.su_id), seqno).unwrap();
        assert_eq!(ids(results), ids(expected_results));
    }
}

#[db_test]
fn test_get_active_at_only_portable(conn: &mut TestPgConn) {
    let c = TestData::build(conn);

    let tests = vec![
        (c.seqno0, vec![]),                                         // Nothing exists
        (c.seqno1, vec![]),             // l1, l2, l3 created for tenant, not visible yet
        (c.seqno2, vec![]),             // Nothing happens here
        (c.seqno3, vec![&c.lifetime2]), // l2 portable
        (c.seqno4, vec![&c.lifetime2, &c.lifetime3, &c.lifetime4]), // l3 portable, l4 portable at other tenant
        (c.seqno5, vec![&c.lifetime2, &c.lifetime4]),               // l3 deactivated
        (c.seqno6, vec![&c.lifetime2, &c.lifetime4]),               // Nothing happens here
    ];
    for test in tests {
        let (seqno, expected_results) = test;
        let results = DataLifetime::get_active_at(conn, &c.uv_id, None, seqno).unwrap();
        assert_eq!(ids(results), ids(expected_results));
    }
}
