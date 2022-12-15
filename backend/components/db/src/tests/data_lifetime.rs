use std::collections::HashSet;

use macros::db_test;
use newtypes::{DataLifetimeId, DataLifetimeKind, DataLifetimeSeqno, ScopedUserId, TenantId, UserVaultId};

use crate::models::scoped_user::ScopedUser;
use crate::tests::prelude::*;
use crate::TxnPgConnection;

use crate::models::data_lifetime::DataLifetime;

use super::fixtures;

/// Util function to create multiple DataLifetimes with the provided info
fn build_lifetime(
    conn: &mut TxnPgConnection,
    uv_id: &UserVaultId,
    su_id: &ScopedUserId,
    created_seqno: DataLifetimeSeqno,
    committed_seqno: Option<DataLifetimeSeqno>,
    deactivated_seqno: Option<DataLifetimeSeqno>,
    kind: DataLifetimeKind,
) -> DataLifetime {
    let mut lifetime = DataLifetime::bulk_create(
        conn,
        uv_id.clone(),
        Some(su_id.clone()),
        vec![kind],
        created_seqno,
    )
    .unwrap()
    .pop()
    .unwrap();
    if let Some(committed_seqno) = committed_seqno {
        lifetime = lifetime.commit(conn, committed_seqno).unwrap();
    }
    if let Some(deactivated_seqno) = deactivated_seqno {
        lifetime = DataLifetime::bulk_deactivate(conn, vec![lifetime.id], deactivated_seqno)
            .unwrap()
            .pop()
            .unwrap();
    }
    lifetime
}

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
    uv_id: UserVaultId,
    uv2_id: UserVaultId,
    uvx_id: UserVaultId,
    su_id: ScopedUserId,
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
    fn build(conn: &mut TxnPgConnection) -> Self {
        // Create tenants
        let t_id = TenantId::test_data("org_merp".to_owned());
        let t2_id = TenantId::test_data("org_merp2".to_owned());

        // Create user vaults (without phone number)
        let uv_id = fixtures::user_vault::create(conn).id;
        let uv2_id = fixtures::user_vault::create(conn).id;
        let uvx_id = fixtures::user_vault::create(conn).id;

        // Create scoped users
        let su_id = ScopedUser::get_or_create(conn, uv_id.clone(), t_id.clone(), true, None)
            .unwrap()
            .id;
        let su2_id = ScopedUser::get_or_create(conn, uv2_id.clone(), t_id.clone(), true, None)
            .unwrap()
            .id;
        let su3_id = ScopedUser::get_or_create(conn, uv_id.clone(), t2_id.clone(), true, None)
            .unwrap()
            .id;

        // Timeline of seqnos
        let seqno0 = DataLifetime::get_next_seqno(conn).unwrap();
        let seqno1 = DataLifetime::get_next_seqno(conn).unwrap();
        let seqno2 = DataLifetime::get_next_seqno(conn).unwrap();
        let seqno3 = DataLifetime::get_next_seqno(conn).unwrap();
        let seqno4 = DataLifetime::get_next_seqno(conn).unwrap();
        let seqno5 = DataLifetime::get_next_seqno(conn).unwrap();
        let seqno6 = DataLifetime::get_next_seqno(conn).unwrap();

        // Place some DataLifetimes at various points along the timeline
        let lifetime1 = build_lifetime(conn, &uv_id, &su_id, seqno1, None, None, DataLifetimeKind::Email);
        let lifetime2 = build_lifetime(
            conn,
            &uv_id,
            &su_id,
            seqno1,
            Some(seqno3),
            None,
            DataLifetimeKind::FirstName,
        );
        let lifetime3 = build_lifetime(
            conn,
            &uv_id,
            &su_id,
            seqno1,
            Some(seqno4),
            Some(seqno5),
            DataLifetimeKind::LastName,
        );
        // For same user, different scoped user
        let lifetime4 = build_lifetime(
            conn,
            &uv_id,
            &su3_id,
            seqno1,
            Some(seqno4),
            None,
            DataLifetimeKind::PhoneNumber,
        );
        // For different user
        let lifetime5 = build_lifetime(
            conn,
            &uv2_id,
            &su2_id,
            seqno1,
            None,
            None,
            DataLifetimeKind::IdentityDocument,
        );
        let lifetime6 = build_lifetime(
            conn,
            &uv2_id,
            &su2_id,
            seqno1,
            Some(seqno3),
            None,
            DataLifetimeKind::AddressLine1,
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
fn test_get_active(conn: &mut TestPgConnection) {
    let c = TestData::build(conn);
    // Query for su_id, should return all active lifetimes
    let results = DataLifetime::get_active(conn, &c.uv_id, Some(&c.su_id)).unwrap();
    assert_eq!(ids(&results), ids(vec![&c.lifetime1, &c.lifetime2, &c.lifetime4]));

    // Query for only committed data (not scoped to any tenant), should only return committed lifetimes
    let results = DataLifetime::get_active(conn, &c.uv_id, None).unwrap();
    assert_eq!(ids(&results), ids(vec![&c.lifetime2, &c.lifetime4]));
}

#[db_test]
fn test_get_bulk_active_for_tenant(conn: &mut TestPgConnection) {
    let c = TestData::build(conn);
    // View for tenant 1
    let mut results =
        DataLifetime::get_bulk_active_for_tenant(conn, vec![&c.uv_id, &c.uv2_id, &c.uvx_id], &c.t_id)
            .unwrap();
    assert_eq!(
        ids(results.remove(&c.uv_id).unwrap()),
        ids(vec![&c.lifetime1, &c.lifetime2, &c.lifetime4]) // lifetime4 visible from other tenant bc committed
    );
    assert_eq!(
        ids(results.remove(&c.uv2_id).unwrap()),
        ids(vec![&c.lifetime5, &c.lifetime6])
    );
    assert!(results.is_empty()); // No other results

    // View for tenant 2
    let mut results =
        DataLifetime::get_bulk_active_for_tenant(conn, vec![&c.uv_id, &c.uv2_id, &c.uvx_id], &c.t2_id)
            .unwrap();
    assert_eq!(
        ids(results.remove(&c.uv_id).unwrap()),
        ids(vec![&c.lifetime2, &c.lifetime4]) //lifetime2 visible from other tenant bc committed
    );
    assert_eq!(ids(results.remove(&c.uv2_id).unwrap()), ids(vec![&c.lifetime6])); // lifetime6 visible from other tenant bc committed
    assert!(results.is_empty()); // No other results
}

#[db_test]
fn test_get_active_at_for_tenant(conn: &mut TestPgConnection) {
    let c = TestData::build(conn);
    let tests = vec![
        (c.seqno0, vec![]),                                         // Nothing exists
        (c.seqno1, vec![&c.lifetime1, &c.lifetime2, &c.lifetime3]), // l1, l2, l3 created for tenant
        (c.seqno2, vec![&c.lifetime1, &c.lifetime2, &c.lifetime3]), // Nothing happens here
        (c.seqno3, vec![&c.lifetime1, &c.lifetime2, &c.lifetime3]), // l2 committed
        (
            c.seqno4,
            vec![&c.lifetime1, &c.lifetime2, &c.lifetime3, &c.lifetime4],
        ), // l3 committed, l4 committed at other tenant
        (c.seqno5, vec![&c.lifetime1, &c.lifetime2, &c.lifetime4]), // l3 deactivated
        (c.seqno6, vec![&c.lifetime1, &c.lifetime2, &c.lifetime4]), // Nothing happens here
    ];
    for test in tests {
        let (seqno, expected_results) = test;
        let results = DataLifetime::get_active_at(conn, &c.uv_id, Some(&c.su_id), seqno).unwrap();
        assert_eq!(ids(&results), ids(expected_results));
    }
}

#[db_test]
fn test_get_active_at_only_committed(conn: &mut TestPgConnection) {
    let c = TestData::build(conn);

    let tests = vec![
        (c.seqno0, vec![]),                                         // Nothing exists
        (c.seqno1, vec![]),             // l1, l2, l3 created for tenant, not visible yet
        (c.seqno2, vec![]),             // Nothing happens here
        (c.seqno3, vec![&c.lifetime2]), // l2 committed
        (c.seqno4, vec![&c.lifetime2, &c.lifetime3, &c.lifetime4]), // l3 committed, l4 committed at other tenant
        (c.seqno5, vec![&c.lifetime2, &c.lifetime4]),               // l3 deactivated
        (c.seqno6, vec![&c.lifetime2, &c.lifetime4]),               // Nothing happens here
    ];
    for test in tests {
        let (seqno, expected_results) = test;
        let results = DataLifetime::get_active_at(conn, &c.uv_id, None, seqno).unwrap();
        assert_eq!(ids(&results), ids(expected_results));
    }
}
