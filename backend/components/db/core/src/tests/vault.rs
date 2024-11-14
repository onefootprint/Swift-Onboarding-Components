use super::fixtures;
use crate::models::data_lifetime::DataLifetime;
use crate::models::fingerprint::Fingerprint as DbFingerprint;
use crate::models::vault::Priority;
use crate::models::vault::Vault;
use crate::tests::prelude::*;
use chrono::DateTime;
use chrono::Utc;
use macros::db_test_case;
use newtypes::Fingerprint;
use newtypes::FingerprintScope;
use newtypes::IdentityDataKind as IDK;
use newtypes::SandboxId;
use std::str::FromStr;
use std::time::Duration;

#[db_test_case(false, false => false; "cant-find-speculative")]
#[db_test_case(true, false => true; "can-find-portablized-active")]
#[db_test_case(false, true => false; "cant-find-speculative-deactivated")]
#[db_test_case(true, true => false; "cant-find-portablized-deactivated")]
fn test_find_portable(conn: &mut TestPgConn, is_portablized: bool, is_deactivated: bool) -> bool {
    let tenant = fixtures::tenant::create(conn);
    let (_, ob_config) = fixtures::ob_configuration::create(conn, &tenant.id, true);
    let uv = fixtures::vault::create_person(conn, true).into_inner();
    Vault::mark_verified(conn, &uv.id).unwrap();
    let sv = fixtures::scoped_vault::create(conn, &uv.id, &ob_config.id);

    let sv_txn = DataLifetime::new_sv_txn(conn, &sv).unwrap();
    let (dl, _) = DataLifetime::create(
        conn,
        &sv_txn,
        IDK::PhoneNumber.into(),
        newtypes::DataLifetimeSource::LikelyHosted,
        None,
    )
    .unwrap();

    if is_portablized {
        DataLifetime::portablize(conn, &sv_txn, &dl.id).unwrap();
    }

    if is_deactivated {
        DataLifetime::bulk_deactivate(conn, &sv_txn, vec![dl.id.clone()]).unwrap();
    }

    let fingerprint = Fingerprint(vec![10]);
    fixtures::fingerprint::create(
        conn,
        &dl.id,
        fingerprint.clone(),
        IDK::PhoneNumber.into(),
        FingerprintScope::Global,
        &sv,
    );
    if is_deactivated {
        DbFingerprint::bulk_deactivate(conn, vec![&dl.id], Utc::now()).unwrap();
    }

    // Should never be able to find with wrong sandbox id
    let inverse_sandbox_id = if uv.sandbox_id.is_some() {
        None
    } else {
        Some(SandboxId::from_str("FLERP").unwrap())
    };
    assert!(
        Vault::find_portable(conn, &[fingerprint.clone()], inverse_sandbox_id, None)
            .unwrap()
            .is_empty()
    );

    let u = Vault::find_portable(conn, &[fingerprint], uv.sandbox_id, None).unwrap();
    !u.is_empty()
}

#[test]
fn test_priority_cmp() {
    let p = |has_sv_at_tenant: Option<bool>,
             num_svs: usize,
             num_portable_dis: usize,
             is_created_via_bifrost: bool,
             matching_fp_priority: usize,
             created_at: DateTime<Utc>|
     -> Priority {
        Priority {
            has_sv_at_tenant,
            num_svs,
            num_portable_dis,
            is_created_via_bifrost,
            matching_fp_priority,
            created_at,
        }
    };
    let t0 = Utc::now();
    let t1 = t0 + Duration::from_secs(10);
    assert!([
        p(Some(true), 10, 10, true, 0, t0),
        p(Some(true), 10, 0, true, 0, t0),
        p(Some(true), 0, 10, true, 0, t0),
        p(Some(true), 0, 0, true, 0, t0),
        p(Some(true), 0, 0, false, 0, t0),
        p(Some(false), 0, 0, false, 0, t1),
        p(Some(false), 0, 0, false, 0, t0),
    ]
    .windows(2)
    .all(|w| w[0] > w[1]));
}
