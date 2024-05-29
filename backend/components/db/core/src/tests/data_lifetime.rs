use super::fixtures;
use crate::models::data_lifetime::DataLifetime;
use crate::tests::prelude::*;
use itertools::Itertools;
use macros::db_test;
use newtypes::{
    DataLifetimeId,
    DataLifetimeSeqno,
    DocumentDiKind,
    DocumentSide,
    IdDocKind,
    IdentityDataKind,
    ScopedVaultId,
    TenantId,
    VaultId,
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
    #[allow(unused)]
    t1: TenantId,
    #[allow(unused)]
    t2: TenantId,
    v1: VaultId,
    v2: VaultId,
    vx: VaultId,
    /// v1, t1
    su: ScopedVaultId,
    /// v2, t1
    su2: ScopedVaultId,
    /// v1, t2
    su3: ScopedVaultId,
    seqno0: DataLifetimeSeqno,
    seqno1: DataLifetimeSeqno,
    seqno2: DataLifetimeSeqno,
    seqno3: DataLifetimeSeqno,
    seqno4: DataLifetimeSeqno,
    seqno5: DataLifetimeSeqno,
    seqno6: DataLifetimeSeqno,
    dl1: DataLifetime,
    dl2: DataLifetime,
    dl3: DataLifetime,
    dl4: DataLifetime,
    dl5: DataLifetime,
    dl6: DataLifetime,
}

impl TestData {
    /**
    Creates a series of DLs for different users with different lifecycles. The table below shows
    the owernship and lifecycle of each fixture DL
    ```
    |     | v | t | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
    |-----|---|---|---|---|---|---|---|---|---|---|
    | DL1 | 1 | 1 |   | C |   |   |   |   |   |   |
    | DL2 | 1 | 1 |   | C |   | P |   |   |   |   |
    | DL3 | 1 | 1 |   | C |   |   | P | D |   |   |
    | DL4 | 1 | 2 |   | C |   |   | P |   |   |   |
    | DL5 | 2 | 1 |   | C |   |   |   |   |   |   |
    | DL6 | 2 | 1 |   | C |   | P |   |   |   |   |
    ````
     */
    fn build(conn: &mut TestPgConn) -> Self {
        // Create tenants
        let t1_id = fixtures::tenant::create(conn).id;
        let t2_id = fixtures::tenant::create(conn).id;

        // Create ob configs
        let ob_config_id = fixtures::ob_configuration::create(conn, &t1_id, true).id;
        let ob_config2_id = fixtures::ob_configuration::create(conn, &t2_id, true).id;

        // Create user vaults (without phone number)
        let v1_id = fixtures::vault::create_person(conn, true).into_inner().id;
        let v2_id = fixtures::vault::create_person(conn, true).into_inner().id;
        let vx_id = fixtures::vault::create_person(conn, true).into_inner().id;

        // Create scoped users
        let su_id = fixtures::scoped_vault::create(conn, &v1_id, &ob_config_id).id;
        let su2_id = fixtures::scoped_vault::create(conn, &v2_id, &ob_config_id).id;
        let su3_id = fixtures::scoped_vault::create(conn, &v1_id, &ob_config2_id).id;

        // Timeline of seqnos
        let seqno0 = DataLifetime::get_next_seqno(conn).unwrap();
        let seqno1 = DataLifetime::get_next_seqno(conn).unwrap();
        let seqno2 = DataLifetime::get_next_seqno(conn).unwrap();
        let seqno3 = DataLifetime::get_next_seqno(conn).unwrap();
        let seqno4 = DataLifetime::get_next_seqno(conn).unwrap();
        let seqno5 = DataLifetime::get_next_seqno(conn).unwrap();
        let seqno6 = DataLifetime::get_next_seqno(conn).unwrap();

        // Place some DataLifetimes at various points along the timeline
        let dl1 =
            fixtures::data_lifetime::build(conn, &v1_id, &su_id, seqno1, None, None, IdentityDataKind::Email);
        let dl2 = fixtures::data_lifetime::build(
            conn,
            &v1_id,
            &su_id,
            seqno1,
            Some(seqno3),
            None,
            IdentityDataKind::FirstName,
        );
        let dl3 = fixtures::data_lifetime::build(
            conn,
            &v1_id,
            &su_id,
            seqno1,
            Some(seqno4),
            Some(seqno5),
            IdentityDataKind::LastName,
        );
        // For same user, different scoped user
        let dl4 = fixtures::data_lifetime::build(
            conn,
            &v1_id,
            &su3_id,
            seqno1,
            Some(seqno4),
            None,
            IdentityDataKind::PhoneNumber,
        );
        // For different user
        let dl5 = fixtures::data_lifetime::build(
            conn,
            &v2_id,
            &su2_id,
            seqno1,
            None,
            None,
            DocumentDiKind::Image(IdDocKind::Passport, DocumentSide::Front),
        );
        let dl6 = fixtures::data_lifetime::build(
            conn,
            &v2_id,
            &su2_id,
            seqno1,
            Some(seqno3),
            None,
            IdentityDataKind::AddressLine1,
        );

        Self {
            t1: t1_id,
            t2: t2_id,
            v1: v1_id,
            v2: v2_id,
            vx: vx_id,
            su: su_id,
            su2: su2_id,
            su3: su3_id,
            seqno0,
            seqno1,
            seqno2,
            seqno3,
            seqno4,
            seqno5,
            seqno6,
            dl1,
            dl2,
            dl3,
            dl4,
            dl5,
            dl6,
        }
    }
}

#[db_test]
fn test_my1fp_get_portable(conn: &mut TestPgConn) {
    // Test getting all of the DLs that are visible in a my1fp context - only the portable ones
    let c = TestData::build(conn);

    let tests = vec![
        //
        // v1
        (&c.v1, c.seqno0, vec![]),
        (&c.v1, c.seqno1, vec![]),
        (&c.v1, c.seqno2, vec![]),
        // DL2 portablized
        (&c.v1, c.seqno3, vec![&c.dl2]),
        // DL3 and DL4 portablized
        (&c.v1, c.seqno4, vec![&c.dl2, &c.dl3, &c.dl4]),
        // DL3 deactivated, but the portable view doesn't respect deactivated_at
        (&c.v1, c.seqno5, vec![&c.dl2, &c.dl3, &c.dl4]),
        (&c.v1, c.seqno6, vec![&c.dl2, &c.dl3, &c.dl4]),
        //
        // v2
        (&c.v2, c.seqno0, vec![]),
        (&c.v2, c.seqno1, vec![]),
        (&c.v2, c.seqno2, vec![]),
        // DL6 portablized
        (&c.v2, c.seqno3, vec![&c.dl6]),
        (&c.v2, c.seqno4, vec![&c.dl6]),
        (&c.v2, c.seqno5, vec![&c.dl6]),
        (&c.v2, c.seqno6, vec![&c.dl6]),
        //
        // vx
        (&c.vx, c.seqno6, vec![]),
    ];

    for (v_id, seqno, expected_dls) in tests {
        let results = DataLifetime::get_portable_at(conn, v_id, seqno).unwrap();
        assert_eq!(ids(results), ids(expected_dls));
    }
}

#[db_test]
fn test_bulk_get_added_by_tenant(conn: &mut TestPgConn) {
    let c = TestData::build(conn);

    let tests = vec![
        //
        // su_id
        (&c.su, c.seqno0, vec![]),
        (&c.su, c.seqno1, vec![&c.dl1, &c.dl2, &c.dl3]),
        (&c.su, c.seqno2, vec![&c.dl1, &c.dl2, &c.dl3]),
        (&c.su, c.seqno3, vec![&c.dl1, &c.dl2, &c.dl3]),
        (&c.su, c.seqno4, vec![&c.dl1, &c.dl2, &c.dl3]),
        (&c.su, c.seqno5, vec![&c.dl1, &c.dl2]),
        (&c.su, c.seqno6, vec![&c.dl1, &c.dl2]),
        //
        // su2_id
        (&c.su2, c.seqno0, vec![]),
        (&c.su2, c.seqno1, vec![&c.dl5, &c.dl6]),
        (&c.su2, c.seqno6, vec![&c.dl5, &c.dl6]),
        //
        // su3_id
        (&c.su3, c.seqno0, vec![]),
        (&c.su3, c.seqno1, vec![&c.dl4]),
        (&c.su3, c.seqno6, vec![&c.dl4]),
    ];

    for (sv_id, seqno, expected_dls) in tests {
        // Test both when we have other users fetched alongside in bulk AND when fetching independently
        let results = DataLifetime::bulk_get_active_at(conn, vec![sv_id], seqno).unwrap();
        assert_eq!(ids(results), ids(expected_dls.clone()));
        let results = DataLifetime::bulk_get_active_at(conn, vec![&c.su, &c.su2, &c.su3], seqno)
            .unwrap()
            .into_iter()
            .filter(|dl| &dl.scoped_vault_id == sv_id)
            .collect_vec();
        assert_eq!(ids(results), ids(expected_dls));
    }
}
