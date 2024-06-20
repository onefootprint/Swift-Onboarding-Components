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
use std::time::Duration;

#[db_test_case(false, false => false; "cant-find-speculative")]
#[db_test_case(true, false => true; "can-find-portablized-active")]
#[db_test_case(false, true => false; "cant-find-speculative-deactivated")]
#[db_test_case(true, true => false; "cant-find-portablized-deactivated")]
fn test_find_portable(conn: &mut TestPgConn, is_portablized: bool, is_deactivated: bool) -> bool {
    let tenant = fixtures::tenant::create(conn);
    let ob_config = fixtures::ob_configuration::create(conn, &tenant.id, true);
    let uv = fixtures::vault::create_person(conn, true).into_inner();
    Vault::mark_verified(conn, &uv.id).unwrap();
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
        &lifetime.id,
        fingerprint.clone(),
        IDK::PhoneNumber.into(),
        FingerprintScope::Global,
        &su,
    );
    if is_deactivated {
        DbFingerprint::bulk_deactivate(conn, vec![&lifetime.id], Utc::now()).unwrap();
    }

    // Should never be able to find with wrong sandbox id
    let inverse_sandbox_id = if uv.sandbox_id.is_some() {
        None
    } else {
        Some(SandboxId::from("FLERP".to_owned()))
    };
    assert!(
        Vault::find_portable(conn, &[fingerprint.clone()], inverse_sandbox_id, None)
            .unwrap()
            .is_none()
    );

    let u = Vault::find_portable(conn, &[fingerprint], uv.sandbox_id, None).unwrap();
    u.is_some()
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
