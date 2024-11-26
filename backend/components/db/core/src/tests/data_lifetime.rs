use super::fixtures;
use crate::models::data_lifetime::DataLifetime;
use crate::tests::prelude::*;
use itertools::Itertools;
use macros::db_test;
use newtypes::DataLifetimeId;
use newtypes::DataLifetimeSeqno;
use newtypes::DataLifetimeSource;
use newtypes::DocumentDiKind;
use newtypes::DocumentSide;
use newtypes::IdDocKind;
use newtypes::IdentityDataKind as IDK;
use newtypes::ScopedVaultId;
use newtypes::TenantId;
use newtypes::VaultId;
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
    seqnos: Vec<DataLifetimeSeqno>,
    dl1: DataLifetime,
    dl2: DataLifetime,
    dl3: DataLifetime,
    dl4: DataLifetime,
    dl5: DataLifetime,
    dl6: DataLifetime,
}

impl TestData {
    /**
    Creates a series of DLs for different users with different lifecycles.
     */
    fn build(conn: &mut TestPgConn) -> Self {
        // Create tenants
        let t1_id = fixtures::tenant::create(conn).id;
        let t2_id = fixtures::tenant::create(conn).id;

        // Create user vaults (without phone number)
        let v1_id = fixtures::vault::create_person(conn, true).into_inner().id;
        let v2_id = fixtures::vault::create_person(conn, true).into_inner().id;
        let vx_id = fixtures::vault::create_person(conn, true).into_inner().id;

        // Create scoped users
        let sv1 = fixtures::scoped_vault::create(conn, &v1_id, &t1_id);
        let sv2 = fixtures::scoped_vault::create(conn, &v1_id, &t2_id);
        let sv3 = fixtures::scoped_vault::create(conn, &v2_id, &t1_id);

        // Timeline of seqnos
        let mut seqnos = vec![];

        let start_seqno = DataLifetime::get_current_seqno(conn).unwrap();
        seqnos.push(start_seqno);

        let source = DataLifetimeSource::LikelyHosted;

        // Place some DataLifetimes at various points along the timeline
        let txn = DataLifetime::new_sv_txn(conn, &sv1).unwrap();
        let (dl1, svvn) = DataLifetime::create(conn, &txn, IDK::Email.into(), source, None).unwrap();
        assert_eq!(
            svvn,
            1.into(),
            "ScopedVaultVersion should be 1 for entire first txn"
        );
        let (dl2, svvn) = DataLifetime::create(conn, &txn, IDK::FirstName.into(), source, None).unwrap();
        assert_eq!(
            svvn,
            1.into(),
            "ScopedVaultVersion should be 1 for entire first txn"
        );
        seqnos.push(txn.seqno());

        let txn = DataLifetime::new_sv_txn(conn, &sv1).unwrap();
        let (dl3, svvn) = DataLifetime::create(conn, &txn, IDK::LastName.into(), source, None).unwrap();
        assert_eq!(svvn, 2.into(), "ScopedVaultVersion should advance for second txn");
        seqnos.push(txn.seqno());

        // For same user, different scoped user
        let txn = DataLifetime::new_sv_txn(conn, &sv2).unwrap();
        let (dl4, svvn) = DataLifetime::create(conn, &txn, IDK::PhoneNumber.into(), source, None).unwrap();
        assert_eq!(
            svvn,
            1.into(),
            "ScopedVaultVersion should be 1 for entire first txn"
        );
        seqnos.push(txn.seqno());

        // For different user
        let txn = DataLifetime::new_sv_txn(conn, &sv3).unwrap();
        let (dl5, svvn) = DataLifetime::create(
            conn,
            &txn,
            DocumentDiKind::Image(IdDocKind::Passport, DocumentSide::Front).into(),
            source,
            None,
        )
        .unwrap();
        assert_eq!(
            svvn,
            1.into(),
            "ScopedVaultVersion should be 1 for entire first txn"
        );
        let (dl6, svvn) = DataLifetime::create(conn, &txn, IDK::AddressLine1.into(), source, None).unwrap();
        assert_eq!(
            svvn,
            1.into(),
            "ScopedVaultVersion should be 1 for entire first txn"
        );
        seqnos.push(txn.seqno());

        // Portablize some of the DLs
        let txn = DataLifetime::new_sv_txn(conn, &sv1).unwrap();
        let dl2 = DataLifetime::portablize(conn, &txn, &dl2.id).unwrap();
        seqnos.push(txn.seqno());

        let txn = DataLifetime::new_sv_txn(conn, &sv1).unwrap();
        let dl3 = DataLifetime::portablize(conn, &txn, &dl3.id).unwrap();
        seqnos.push(txn.seqno());

        let txn = DataLifetime::new_sv_txn(conn, &sv2).unwrap();
        let dl4 = DataLifetime::portablize(conn, &txn, &dl4.id).unwrap();
        seqnos.push(txn.seqno());

        let txn = DataLifetime::new_sv_txn(conn, &sv3).unwrap();
        let dl6 = DataLifetime::portablize(conn, &txn, &dl6.id).unwrap();
        seqnos.push(txn.seqno());

        // Delete a DL
        let txn = DataLifetime::new_sv_txn(conn, &sv1).unwrap();
        let (_, svvn) = DataLifetime::bulk_deactivate(conn, &txn, vec![dl3.id.clone()]).unwrap();
        assert_eq!(svvn, 3.into(), "ScopedVaultVersion should advance upon deletion");

        let (_, svvn_2) = DataLifetime::bulk_deactivate(conn, &txn, vec![dl3.id.clone()]).unwrap();
        assert_eq!(
            svvn_2, svvn,
            "ScopedVaultVersion should not advance since already deactivated"
        );
        seqnos.push(txn.seqno());

        let is_sorted = seqnos.iter().tuple_windows().all(|(a, b)| a < b);
        assert!(is_sorted, "Seqnos should be monotonically increasing");

        Self {
            t1: t1_id,
            t2: t2_id,
            v1: v1_id,
            v2: v2_id,
            vx: vx_id,
            su: sv1.into_inner().id,
            su2: sv2.into_inner().id,
            su3: sv3.into_inner().id,
            seqnos,
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

    assert_eq!(c.seqnos.len(), 10);
    let tests = vec![
        //
        // v1
        (&c.v1, c.seqnos[0], vec![]),
        (&c.v1, c.seqnos[1], vec![]),
        (&c.v1, c.seqnos[2], vec![]),
        (&c.v1, c.seqnos[3], vec![]),
        (&c.v1, c.seqnos[4], vec![]),
        // DL2 portablized
        (&c.v1, c.seqnos[5], vec![&c.dl2]),
        // DL3 and DL4 portablized
        (&c.v1, c.seqnos[6], vec![&c.dl2, &c.dl3]),
        (&c.v1, c.seqnos[7], vec![&c.dl2, &c.dl3, &c.dl4]),
        (&c.v1, c.seqnos[8], vec![&c.dl2, &c.dl3, &c.dl4]),
        // DL3 deactivated, but the portable view doesn't respect deactivated_at
        (&c.v1, c.seqnos[9], vec![&c.dl2, &c.dl3, &c.dl4]),
        //
        // v2
        (&c.v2, c.seqnos[0], vec![]),
        (&c.v2, c.seqnos[1], vec![]),
        (&c.v2, c.seqnos[2], vec![]),
        (&c.v2, c.seqnos[3], vec![]),
        (&c.v2, c.seqnos[4], vec![]),
        (&c.v2, c.seqnos[5], vec![]),
        (&c.v2, c.seqnos[6], vec![]),
        (&c.v2, c.seqnos[7], vec![]),
        // DL6 portablized
        (&c.v2, c.seqnos[8], vec![&c.dl6]),
        (&c.v2, c.seqnos[9], vec![&c.dl6]),
        //
        // vx
        (&c.vx, c.seqnos[6], vec![]),
    ];

    for (test_num, (v_id, seqno, expected_dls)) in tests.into_iter().enumerate() {
        let results = DataLifetime::get_portable_at(conn, v_id, seqno).unwrap();
        assert_eq!(ids(results), ids(expected_dls), "Test #{}", test_num);
    }
}

#[db_test]
fn test_bulk_get_added_by_tenant(conn: &mut TestPgConn) {
    let c = TestData::build(conn);

    assert_eq!(c.seqnos.len(), 10);
    let tests = vec![
        //
        // su_id
        (&c.su, c.seqnos[0], vec![]),
        (&c.su, c.seqnos[1], vec![&c.dl1, &c.dl2]), // Added in same txn
        (&c.su, c.seqnos[2], vec![&c.dl1, &c.dl2, &c.dl3]),
        (&c.su, c.seqnos[3], vec![&c.dl1, &c.dl2, &c.dl3]),
        (&c.su, c.seqnos[4], vec![&c.dl1, &c.dl2, &c.dl3]),
        (&c.su, c.seqnos[5], vec![&c.dl1, &c.dl2, &c.dl3]),
        (&c.su, c.seqnos[6], vec![&c.dl1, &c.dl2, &c.dl3]),
        (&c.su, c.seqnos[7], vec![&c.dl1, &c.dl2, &c.dl3]),
        (&c.su, c.seqnos[8], vec![&c.dl1, &c.dl2, &c.dl3]),
        (&c.su, c.seqnos[9], vec![&c.dl1, &c.dl2]),
        //
        // su2_id
        (&c.su2, c.seqnos[0], vec![]),
        (&c.su2, c.seqnos[1], vec![]),
        (&c.su2, c.seqnos[2], vec![]),
        (&c.su2, c.seqnos[3], vec![&c.dl4]),
        (&c.su2, c.seqnos[4], vec![&c.dl4]),
        (&c.su2, c.seqnos[5], vec![&c.dl4]),
        (&c.su2, c.seqnos[6], vec![&c.dl4]),
        (&c.su2, c.seqnos[7], vec![&c.dl4]),
        (&c.su2, c.seqnos[8], vec![&c.dl4]),
        (&c.su2, c.seqnos[9], vec![&c.dl4]),
        //
        // su3_id
        (&c.su3, c.seqnos[0], vec![]),
        (&c.su3, c.seqnos[1], vec![]),
        (&c.su3, c.seqnos[2], vec![]),
        (&c.su3, c.seqnos[3], vec![]),
        (&c.su3, c.seqnos[4], vec![&c.dl5, &c.dl6]),
        (&c.su3, c.seqnos[5], vec![&c.dl5, &c.dl6]),
        (&c.su3, c.seqnos[6], vec![&c.dl5, &c.dl6]),
        (&c.su3, c.seqnos[7], vec![&c.dl5, &c.dl6]),
        (&c.su3, c.seqnos[8], vec![&c.dl5, &c.dl6]),
        (&c.su3, c.seqnos[9], vec![&c.dl5, &c.dl6]),
    ];

    for (test_num, (sv_id, seqno, expected_dls)) in tests.into_iter().enumerate() {
        // Test both when we have other users fetched alongside in bulk AND when fetching independently
        let results = DataLifetime::bulk_get_active_at(conn, vec![sv_id], seqno).unwrap();
        assert_eq!(ids(results), ids(expected_dls.clone()), "Test #{}", test_num);
        let results = DataLifetime::bulk_get_active_at(conn, vec![&c.su, &c.su2, &c.su3], seqno)
            .unwrap()
            .into_iter()
            .filter(|dl| &dl.scoped_vault_id == sv_id)
            .collect_vec();
        assert_eq!(ids(results), ids(expected_dls), "Test #{}", test_num);
    }
}
