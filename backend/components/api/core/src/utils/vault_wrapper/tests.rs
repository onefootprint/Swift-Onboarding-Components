use super::Any;
use super::Business;
use super::VaultWrapper;
use super::WriteableVw;
use crate::utils::vault_wrapper::Person;
use crate::utils::vault_wrapper::VwArgs;
use db::models::data_lifetime::DataLifetime;
use db::models::scoped_vault::ScopedVault;
use db::models::user_timeline::UserTimeline;
use db::models::vault_data::NewVaultData;
use db::models::vault_data::VaultData;
use db::tests::fixtures;
use db::tests::prelude::*;
use itertools::Itertools;
use macros::db_test;
use newtypes::BusinessDataKind as BDK;
use newtypes::DataIdentifier;
use newtypes::DataLifetimeSource;
use newtypes::DocumentDiKind;
use newtypes::DocumentSide;
use newtypes::IdDocKind;
use newtypes::IdentityDataKind as IDK;
use newtypes::InvestorProfileKind as IPK;
use newtypes::KvDataKey;
use newtypes::PiiString;
use newtypes::S3Url;
use newtypes::ScopedVaultVersionNumber;
use newtypes::SealedVaultBytes;
use newtypes::VaultDataFormat;
use std::collections::HashSet;
use std::str::FromStr;

#[db_test]
fn test_build_user_vault_wrapper(conn: &mut TestPgConn) {
    // Just create this for the keypair
    let tenant = db::tests::fixtures::tenant::create(conn);
    let ob_config = db::tests::fixtures::ob_configuration::create(conn, &tenant.id, true);

    let uv = db::tests::fixtures::vault::create_person(conn, true);
    let sv = db::tests::fixtures::scoped_vault::create(conn, &uv.id, &ob_config.id);
    let sv = ScopedVault::lock(conn, &sv.id).unwrap();

    // Add identity data
    let data = vec![
        NewVaultData {
            kind: IDK::FirstName.into(),
            e_data: SealedVaultBytes(vec![1]),
            p_data: None,
            format: VaultDataFormat::String,
            origin_id: None,
            source: DataLifetimeSource::LikelyHosted,
        },
        NewVaultData {
            kind: IDK::LastName.into(),
            e_data: SealedVaultBytes(vec![2]),
            p_data: None,
            format: VaultDataFormat::String,
            origin_id: None,
            source: DataLifetimeSource::LikelyHosted,
        },
        NewVaultData {
            kind: IDK::Ssn4.into(),
            e_data: SealedVaultBytes(vec![3]),
            p_data: None,
            format: VaultDataFormat::String,
            origin_id: None,
            source: DataLifetimeSource::LikelyHosted,
        },
        NewVaultData {
            kind: IDK::Email.into(),
            e_data: SealedVaultBytes(vec![4]),
            p_data: None,
            format: VaultDataFormat::String,
            origin_id: None,
            source: DataLifetimeSource::LikelyHosted,
        },
        NewVaultData {
            kind: IDK::PhoneNumber.into(),
            e_data: SealedVaultBytes(vec![5]),
            p_data: None,
            format: VaultDataFormat::String,
            origin_id: None,
            source: DataLifetimeSource::LikelyHosted,
        },
    ];
    let sv_txn = DataLifetime::new_sv_txn(conn, &sv).unwrap();
    let (vds, svv) = VaultData::bulk_create(conn, &sv_txn, data, None).unwrap();

    assert_eq!(svv, ScopedVaultVersionNumber::from(1));

    // Portablize the phone as happens in prod
    let phone_data = vds
        .into_iter()
        .find(|vd| vd.kind == IDK::PhoneNumber.into())
        .unwrap();
    DataLifetime::portablize(conn, &sv_txn, &phone_data.lifetime_id).unwrap();

    let uvw = VaultWrapper::<Person>::build(conn, VwArgs::Tenant(&sv.id)).unwrap();
    let tests = vec![
        (IDK::FirstName, Some(SealedVaultBytes(vec![1]))),
        (IDK::LastName, Some(SealedVaultBytes(vec![2]))),
        (IDK::Ssn4, Some(SealedVaultBytes(vec![3]))),
        (IDK::Email, Some(SealedVaultBytes(vec![4]))),
        (IDK::PhoneNumber, Some(SealedVaultBytes(vec![5]))),
        (IDK::Dob, None),
        (IDK::AddressLine1, None),
        (IDK::AddressLine2, None),
        (IDK::City, None),
        (IDK::State, None),
        (IDK::Zip, None),
        (IDK::Country, None),
        (IDK::Ssn9, None),
    ];
    for test in tests {
        let (attribute, expected_value) = test;
        assert_eq!(uvw.get_e_data(&attribute.into()), expected_value.as_ref());
    }

    // build_for_user should only show the phone number
    let uvw = VaultWrapper::<Person>::build_portable(conn, &uv.id).unwrap();
    let tests = vec![
        (IDK::FirstName, None),
        (IDK::LastName, None),
        (IDK::Ssn4, None),
        (IDK::Email, None),
        (IDK::PhoneNumber, Some(SealedVaultBytes(vec![5]))),
        (IDK::Dob, None),
        (IDK::AddressLine1, None),
        (IDK::AddressLine2, None),
        (IDK::City, None),
        (IDK::State, None),
        (IDK::Zip, None),
        (IDK::Country, None),
        (IDK::Ssn9, None),
    ];
    for test in tests {
        let (attribute, expected_value) = test;
        assert_eq!(uvw.get_e_data(&attribute.into()), expected_value.as_ref());
    }
}

#[db_test]
fn test_build_vw_multi_tenant_chronologically(conn: &mut TestPgConn) {
    // Tests that we properly apply DLs spread across multiple tenants in the correct order.
    // This test is much less interesting now that tenants have snapshot isolated data
    let tenant = db::tests::fixtures::tenant::create(conn);
    let ob_config = db::tests::fixtures::ob_configuration::create(conn, &tenant.id, true);
    let tenant2 = db::tests::fixtures::tenant::create(conn);
    let ob_config2 = db::tests::fixtures::ob_configuration::create(conn, &tenant2.id, true);

    let uv = db::tests::fixtures::vault::create_person(conn, true);

    let sv = db::tests::fixtures::scoped_vault::create(conn, &uv.id, &ob_config.id);
    let sv2 = db::tests::fixtures::scoped_vault::create(conn, &uv.id, &ob_config2.id);

    // Chronologically create data across two different tenants
    let data = vec![
        // Add portable Dob data at tenant 1
        (
            &sv.id,
            true,
            vec![NewVaultData {
                kind: IDK::Dob.into(),
                e_data: SealedVaultBytes(vec![0]),
                p_data: None,
                format: VaultDataFormat::String,
                origin_id: None,
                source: DataLifetimeSource::LikelyHosted,
            }],
        ),
        // Add speculative Dob and Email data at tenant 2
        (
            &sv2.id,
            false,
            vec![
                NewVaultData {
                    kind: IDK::Dob.into(),
                    e_data: SealedVaultBytes(vec![1]),
                    p_data: None,
                    format: VaultDataFormat::String,
                    origin_id: None,
                    source: DataLifetimeSource::LikelyHosted,
                },
                NewVaultData {
                    kind: IDK::Email.into(),
                    e_data: SealedVaultBytes(vec![2]),
                    p_data: None,
                    format: VaultDataFormat::String,
                    origin_id: None,
                    source: DataLifetimeSource::LikelyHosted,
                },
            ],
        ),
        // // Add speculative Dob at tenant 1
        (
            &sv.id,
            false,
            vec![NewVaultData {
                kind: IDK::Dob.into(),
                e_data: SealedVaultBytes(vec![3]),
                p_data: None,
                format: VaultDataFormat::String,
                origin_id: None,
                source: DataLifetimeSource::LikelyHosted,
            }],
        ),
        // Add portable Email at tenant 1
        (
            &sv.id,
            true,
            vec![NewVaultData {
                kind: IDK::Email.into(),
                e_data: SealedVaultBytes(vec![4]),
                p_data: None,
                format: VaultDataFormat::String,
                origin_id: None,
                source: DataLifetimeSource::LikelyHosted,
            }],
        ),
    ];
    for (sv_id, portablize, data) in data {
        let sv = ScopedVault::lock(conn, sv_id).unwrap();

        let sv_txn = DataLifetime::new_sv_txn(conn, &sv).unwrap();
        let kinds = data.iter().map(|d| d.kind.clone()).collect_vec();
        DataLifetime::bulk_deactivate_kinds(conn, &sv_txn, kinds).unwrap();
        let (vds, _) = VaultData::bulk_create(conn, &sv_txn, data, None).unwrap();

        if portablize {
            let ids = vds.into_iter().map(|vd| vd.lifetime_id).collect();
            DataLifetime::bulk_portablize_for_tenant(conn, &sv_txn, ids).unwrap();
        }
    }

    // Vault wrapper for tenant 1
    let uvw = VaultWrapper::<Person>::build(conn, VwArgs::Tenant(&sv.id)).unwrap();
    let tests = vec![
        (IDK::Dob, Some(SealedVaultBytes(vec![3]))),
        (IDK::Email, Some(SealedVaultBytes(vec![4]))),
    ];
    for test in tests {
        let (attribute, expected_value) = test;
        assert_eq!(uvw.get_e_data(&attribute.into()), expected_value.as_ref());
    }

    // Vault wrapper for tenant 2
    let uvw = VaultWrapper::<Person>::build(conn, VwArgs::Tenant(&sv2.id)).unwrap();
    let tests = vec![
        (IDK::Dob, Some(SealedVaultBytes(vec![1]))),
        (IDK::Email, Some(SealedVaultBytes(vec![2]))),
    ];
    for test in tests {
        let (attribute, expected_value) = test;
        assert_eq!(uvw.get_e_data(&attribute.into()), expected_value.as_ref());
    }

    // build_for_user should only show the portable data
    let uvw = VaultWrapper::<Person>::build_portable(conn, &uv.id).unwrap();
    let tests = vec![
        (IDK::Dob, Some(SealedVaultBytes(vec![0]))),
        (IDK::Email, Some(SealedVaultBytes(vec![4]))),
    ];
    for test in tests {
        let (attribute, expected_value) = test;
        assert_eq!(uvw.get_e_data(&attribute.into()), expected_value.as_ref());
    }
}

#[db_test]
fn test_build_business_user_vault_wrapper(conn: &mut TestPgConn) {
    let bv = db::tests::fixtures::vault::create_business(conn);
    let tenant = db::tests::fixtures::tenant::create(conn);
    let ob_config = db::tests::fixtures::ob_configuration::create(conn, &tenant.id, true);
    let sv = db::tests::fixtures::scoped_vault::create(conn, &bv.id, &ob_config.id);
    let sv = ScopedVault::lock(conn, &sv.id).unwrap();

    let data = vec![
        NewVaultData {
            kind: BDK::Name.into(),
            e_data: SealedVaultBytes(vec![1]),
            p_data: Some(PiiString::from("Acme Inc")),
            format: VaultDataFormat::String,
            origin_id: None,
            source: DataLifetimeSource::LikelyHosted,
        },
        NewVaultData {
            kind: BDK::Website.into(),
            e_data: SealedVaultBytes(vec![2]),
            p_data: None,
            format: VaultDataFormat::String,
            origin_id: None,
            source: DataLifetimeSource::LikelyHosted,
        },
        NewVaultData {
            kind: BDK::PhoneNumber.into(),
            e_data: SealedVaultBytes(vec![3]),
            p_data: None,
            format: VaultDataFormat::String,
            origin_id: None,
            source: DataLifetimeSource::LikelyHosted,
        },
    ];
    let sv_txn = DataLifetime::new_sv_txn(conn, &sv).unwrap();
    VaultData::bulk_create(conn, &sv_txn, data, None).unwrap();

    let bvw = VaultWrapper::<Business>::build(conn, VwArgs::Tenant(&sv.id)).unwrap();
    let tests = vec![
        (BDK::Name, None), // The business name is stored in plaintext, so it won't show in e_data
        (BDK::Website, Some(SealedVaultBytes(vec![2]))),
        (BDK::PhoneNumber, Some(SealedVaultBytes(vec![3]))),
        (BDK::Tin, None),
        (BDK::AddressLine1, None),
        (BDK::AddressLine2, None),
        (BDK::City, None),
        (BDK::State, None),
        (BDK::Zip, None),
        (BDK::Country, None),
    ];
    for test in tests {
        let (attribute, expected_value) = test;
        assert_eq!(bvw.get_e_data(&attribute.into()), expected_value.as_ref());
    }
    assert_eq!(
        bvw.get_p_data(&BDK::Name.into()),
        Some(&PiiString::from("Acme Inc"))
    );
}

#[db_test]
fn test_user_vault_wrapper_add_fields(conn: &mut TestPgConn) {
    let uv = fixtures::vault::create_person(conn, true);
    let tenant = fixtures::tenant::create(conn);
    let ob_config = fixtures::ob_configuration::create(conn, &tenant.id, true);
    let su = fixtures::scoped_vault::create(conn, &uv.id, &ob_config.id);

    // Add an email
    let uvw = VaultWrapper::<Person>::lock_for_onboarding(conn, &su.id).unwrap();
    let email = PiiString::from_str("test@onefootprint.com").unwrap();
    uvw.patch_data_test_str(conn, vec![(IDK::Email.into(), email)], true)
        .unwrap();

    // Allow replacing the email
    let uvw = VaultWrapper::<Person>::lock_for_onboarding(conn, &su.id).unwrap();
    let email = PiiString::from_str("test2@onefootprint.com").unwrap();
    uvw.patch_data_test_str(conn, vec![(IDK::Email.into(), email)], true)
        .unwrap();

    // Add a phone number
    let uvw = VaultWrapper::<Person>::lock_for_onboarding(conn, &su.id).unwrap();
    let update = vec![
        (IDK::FirstName.into(), PiiString::new("Flerp".to_owned())),
        (IDK::LastName.into(), PiiString::new("Derp".to_owned())),
    ];
    uvw.patch_data_test_str(conn, update, true).unwrap();

    // Make the user can't see the name and email until it's portable
    let uvw = VaultWrapper::<Person>::build_portable(conn, &uv.id).unwrap();
    assert!(!uvw.has_field(&IDK::FirstName.into()));
    assert!(!uvw.has_field(&IDK::LastName.into()));
    assert!(!uvw.has_field(&IDK::Email.into()));

    let timeline_events = UserTimeline::list(conn, &su.id, vec![]).unwrap();
    assert!(!timeline_events.is_empty());

    // Commit
    let uvw = VaultWrapper::<Person>::lock_for_onboarding(conn, &su.id).unwrap();
    assert!(uvw.has_field(&IDK::FirstName.into()));
    assert!(uvw.has_field(&IDK::LastName.into()));
    assert!(uvw.has_field(&IDK::Email.into()));
    uvw.portablize_identity_data(conn).unwrap();

    // Now we should see the portable name and email
    let uvw = VaultWrapper::<Person>::build_portable(conn, &uv.id).unwrap();
    assert!(uvw.has_field(&IDK::FirstName.into()));
    assert!(uvw.has_field(&IDK::LastName.into()));
    assert!(uvw.has_field(&IDK::Email.into()));

    // Should have added user timeline events
    let timeline_events = UserTimeline::list(conn, &su.id, vec![]).unwrap();
    assert!(!timeline_events.is_empty());
}

#[db_test]
fn test_business_vault_wrapper_add_fields(conn: &mut TestPgConn) {
    let bv = fixtures::vault::create_business(conn);
    let tenant = fixtures::tenant::create(conn);
    let ob_config = fixtures::ob_configuration::create(conn, &tenant.id, true);
    let sb = fixtures::scoped_vault::create(conn, &bv.id, &ob_config.id);

    // Add a business name
    let uvw = VaultWrapper::<Business>::lock_for_onboarding(conn, &sb.id).unwrap();
    let data = vec![(BDK::Name.into(), PiiString::new("Flerp Inc.".to_owned()))];
    uvw.patch_data_test_str(conn, data, true).unwrap();

    // Allow replacing the business email
    let uvw = VaultWrapper::<Business>::lock_for_onboarding(conn, &sb.id).unwrap();
    let data = vec![(BDK::Name.into(), PiiString::new("Derp Inc.".to_owned()))];
    uvw.patch_data_test_str(conn, data, true).unwrap();

    // Add a phone_number
    let uvw = VaultWrapper::<Business>::lock_for_onboarding(conn, &sb.id).unwrap();
    let data = vec![(BDK::PhoneNumber.into(), PiiString::new("+14155551234".to_owned()))];
    uvw.patch_data_test_str(conn, data, true).unwrap();

    // Make sure the vault view can't see the data until its portable
    let uvw = VaultWrapper::<Business>::build_portable(conn, &bv.id).unwrap();
    assert!(!uvw.has_field(&BDK::Name.into()));
    assert!(!uvw.has_field(&BDK::PhoneNumber.into()));

    let timeline_events = UserTimeline::list(conn, &sb.id, vec![]).unwrap();
    assert!(!timeline_events.is_empty());

    // We never portablize business data, yet
}

#[db_test]
fn test_bvw_update_business_data_validation(conn: &mut TestPgConn) {
    let bv = fixtures::vault::create_business(conn);
    let tenant = fixtures::tenant::create(conn);
    let ob_config = fixtures::ob_configuration::create(conn, &tenant.id, true);
    let sb = fixtures::scoped_vault::create(conn, &bv.id, &ob_config.id);

    struct Test {
        update: Vec<(DataIdentifier, PiiString)>,
        is_allowed: bool,
    }

    // Apply a series of updates in order. Some of the updates are allowed, others are not
    let tests = vec![
        Test {
            update: vec![
                (BDK::Name.into(), PiiString::new("Acme Inc".to_owned())),
                (BDK::Dba.into(), PiiString::new("Acme".to_owned())),
            ],
            is_allowed: true,
        },
        // Allowed to replace name
        Test {
            update: vec![
                (BDK::Name.into(), PiiString::new("Flerp Inc".to_owned())),
                (BDK::Dba.into(), PiiString::new("Flerp".to_owned())),
            ],
            is_allowed: true,
        },
        // Allowed to add tin
        Test {
            update: vec![(BDK::Tin.into(), PiiString::new("121231234".to_owned()))],
            is_allowed: true,
        },
        // Allowed to add beneficial owners
        Test {
            update: vec![(
                BDK::BeneficialOwners.into(),
                PiiString::new(
                    serde_json::ser::to_string(&serde_json::json!([
                        {"first_name": "Piip", "last_name": "Penguin", "ownership_stake": 50},
                    ]))
                    .unwrap(),
                ),
            )],
            is_allowed: true,
        },
        // Allowed to update beneficial owners
        Test {
            update: vec![(
                BDK::BeneficialOwners.into(),
                PiiString::new(
                    serde_json::ser::to_string(&serde_json::json!([
                        {"first_name": "Piip", "last_name": "Penguin", "ownership_stake": 50},
                        {"first_name": "Franklin", "last_name": "Frog", "ownership_stake": 30},
                    ]))
                    .unwrap(),
                ),
            )],
            is_allowed: true,
        },
        // Allowed to replace with KYCed BOs
        Test {
            update: vec![(
                BDK::KycedBeneficialOwners.into(),
                PiiString::new(
                    serde_json::ser::to_string(&serde_json::json!([
                        {"first_name": "Piip", "last_name": "Penguin", "email": "piip@onefootprint.com", "phone_number": "+14155555555", "ownership_stake": 50},
                        {"first_name": "Franklin", "last_name": "Frog", "email": "franklin@onefootprint.com", "phone_number": "+14154444444", "ownership_stake": 30},
                    ]))
                    .unwrap(),
                ),
            )],
            is_allowed: true,
        },
        // After this, can't update either KYCed BOs or replace with regular BOs
        Test {
            update: vec![(
                BDK::KycedBeneficialOwners.into(),
                PiiString::new(
                    serde_json::ser::to_string(&serde_json::json!([
                        {"first_name": "Piip", "last_name": "Penguin", "email": "piip@onefootprint.com", "phone_number": "+14155555555", "ownership_stake": 50},
                    ]))
                    .unwrap(),
                ),
            )],
            is_allowed: false,
        },
        Test {
            update: vec![(
                BDK::BeneficialOwners.into(),
                PiiString::new(
                    serde_json::ser::to_string(&serde_json::json!([
                        {"first_name": "Piip", "last_name": "Penguin", "ownership_stake": 50},
                    ]))
                    .unwrap(),
                ),
            )],
            is_allowed: false,
        },
        // Allowed to update all remaining info
        Test {
            update: vec![
                (BDK::Name.into(), PiiString::new("Flerp Inc".to_owned())),
                (BDK::Dba.into(), PiiString::new("Flerp".to_owned())),
                (BDK::Website.into(), PiiString::new("onefootprint.com".to_owned())),
                (BDK::PhoneNumber.into(), PiiString::new("+14155555555".to_owned())),
                (BDK::Tin.into(), PiiString::new("12-1231234".to_owned())),
                (BDK::CorporationType.into(), PiiString::new("llc".to_owned())),
                (BDK::AddressLine1.into(), PiiString::new("1 Fp Way".to_owned())),
                (BDK::AddressLine2.into(), PiiString::new("Unit 1".to_owned())),
                (BDK::City.into(), PiiString::new("San Francisco".to_owned())),
                (BDK::State.into(), PiiString::new("CA".to_owned())),
                (BDK::Zip.into(), PiiString::new("94117".to_owned())),
                (BDK::Country.into(), PiiString::new("US".to_owned())),
                // And custom data!
                (
                    KvDataKey::test_data("flerp".to_owned()).into(),
                    PiiString::new("blerp".to_owned()),
                ),
            ],
            is_allowed: true,
        },
        // Can't add personal data
        Test {
            update: vec![
                (IDK::FirstName.into(), PiiString::new("Flerp".to_owned())),
                (IDK::LastName.into(), PiiString::new("Derp".to_owned())),
            ],
            is_allowed: false,
        },
    ];

    // Test subsequent updates to see if they are allowed.
    // Failed updates shouldn't make any changes to the DB so should act as no-ops
    for (i, test) in tests.into_iter().enumerate() {
        let Test { update, is_allowed } = test;
        let bvw = VaultWrapper::<Business>::lock_for_onboarding(conn, &sb.id).unwrap();
        let result = bvw.patch_data_test_str(conn, update.clone(), true);
        assert_eq!(result.is_ok(), is_allowed, "Incorrect status {}: {:?}", i, result);
    }
}

#[db_test]
fn test_bvw_replacements(conn: &mut TestPgConn) {
    let bv = fixtures::vault::create_business(conn);
    let tenant = fixtures::tenant::create(conn);
    let ob_config = fixtures::ob_configuration::create(conn, &tenant.id, true);
    let sb = fixtures::scoped_vault::create(conn, &bv.id, &ob_config.id);

    let updates = vec![
        // Name with DBA
        vec![
            (BDK::Name.into(), PiiString::new("Flerp Inc".to_owned())),
            (BDK::Dba.into(), PiiString::new("Flerp".to_owned())),
        ],
        // Name without DBA should wipe name
        vec![(BDK::Name.into(), PiiString::new("Derp Inc".to_owned()))],
        // BOs
        vec![(
            BDK::BeneficialOwners.into(),
            PiiString::new(
                serde_json::ser::to_string(&serde_json::json!([
                    {"first_name": "Piip", "last_name": "Penguin", "ownership_stake": 50},
                ]))
                .unwrap(),
            ),
        )],
        // Replace with fully-KYCed BOs
        vec![(
            BDK::KycedBeneficialOwners.into(),
            PiiString::new(
                serde_json::ser::to_string(&serde_json::json!([
                    {"first_name": "Piip", "last_name": "Penguin", "email": "piip@onefootprint.com", "phone_number": "+14155555555", "ownership_stake": 50},
                ]))
                .unwrap(),
            ),
        )],
    ];

    for update in updates {
        let bvw = VaultWrapper::<Business>::lock_for_onboarding(conn, &sb.id).unwrap();
        bvw.patch_data_test_str(conn, update.clone(), true).unwrap();
        // Make sure fields are set
        let bvw = VaultWrapper::<Business>::build(conn, VwArgs::Tenant(&sb.id)).unwrap();
        for (di, _) in update {
            assert!(bvw.has_field(&di));
        }
    }
    let bvw = VaultWrapper::<Business>::build(conn, VwArgs::Tenant(&sb.id)).unwrap();
    // We should have cleared out dba in the last update
    assert!(!bvw.has_field(&BDK::Dba.into()));
    assert!(!bvw.has_field(&BDK::BeneficialOwners.into()));
}

#[db_test]
fn test_uvw_update_identity_data_validation(conn: &mut TestPgConn) {
    let uv = fixtures::vault::create_person(conn, true);
    let tenant = fixtures::tenant::create(conn);
    let tenant2 = fixtures::tenant::create(conn);
    let ob_config = fixtures::ob_configuration::create(conn, &tenant.id, true);
    let ob_config2 = fixtures::ob_configuration::create(conn, &tenant2.id, true);
    let su = fixtures::scoped_vault::create(conn, &uv.id, &ob_config.id);
    let su2 = fixtures::scoped_vault::create(conn, &uv.id, &ob_config2.id);

    struct Test<'a> {
        update: Vec<(DataIdentifier, PiiString)>,
        su_id: &'a newtypes::ScopedVaultId,
        is_allowed: bool,
    }

    // Apply a series of updates in order. Some of the updates are allowed, others are not
    let tests = vec![
        Test {
            update: vec![
                (IDK::FirstName.into(), PiiString::new("Flerp".to_owned())),
                (IDK::LastName.into(), PiiString::new("Derp".to_owned())),
            ],
            su_id: &su.id,
            is_allowed: true,
        },
        // Allowed to replace name
        Test {
            update: vec![
                (IDK::FirstName.into(), PiiString::new("Merp".to_owned())),
                (IDK::LastName.into(), PiiString::new("Derp".to_owned())),
            ],
            su_id: &su.id,
            is_allowed: true,
        },
        // Allowed to add email
        Test {
            update: vec![(IDK::Email.into(), PiiString::new("flerp@1fp.com".to_owned()))],
            su_id: &su.id,
            is_allowed: true,
        },
        // Allowed to add phone
        Test {
            update: vec![(IDK::PhoneNumber.into(), PiiString::new("+14154444444".to_owned()))],
            su_id: &su.id,
            is_allowed: true,
        },
        // Allowed to add ssn4
        Test {
            update: vec![(IDK::Ssn4.into(), PiiString::new("1234".to_owned()))],
            su_id: &su.id,
            is_allowed: true,
        },
        // Allowed to add ssn9 after ssn4
        Test {
            update: vec![(IDK::Ssn9.into(), PiiString::new("123121234".to_owned()))],
            su_id: &su.id,
            is_allowed: true,
        },
        // NOT allowed to add ssn4 after ssn9
        Test {
            update: vec![(IDK::Ssn4.into(), PiiString::new("1234".to_owned()))],
            su_id: &su.id,
            is_allowed: false,
        },
        // BUT, can add ssn4 on different scoped user
        Test {
            update: vec![(IDK::Ssn4.into(), PiiString::new("1234".to_owned()))],
            su_id: &su2.id, // This is the only test that uses su2
            is_allowed: true,
        },
        // Allowed to add full address
        Test {
            update: vec![
                (IDK::AddressLine1.into(), PiiString::new("Flerp".to_owned())),
                (IDK::City.into(), PiiString::new("San Francisco".to_owned())),
                (IDK::State.into(), PiiString::new("CA".to_owned())),
                (IDK::Zip.into(), PiiString::new("94117".to_owned())),
                (IDK::Country.into(), PiiString::new("US".to_owned())),
            ],
            su_id: &su.id,
            is_allowed: true,
        },
        // Allowed to update all remaining info
        Test {
            update: vec![
                (IDK::FirstName.into(), PiiString::new("Lerp".to_owned())),
                (IDK::LastName.into(), PiiString::new("Merp".to_owned())),
                (IDK::Dob.into(), PiiString::new("1990-12-25".to_owned())),
                (IDK::Ssn9.into(), PiiString::new("123121234".to_owned())),
                (IDK::AddressLine1.into(), PiiString::new("Flerp".to_owned())),
                (IDK::City.into(), PiiString::new("San Francisco".to_owned())),
                (IDK::State.into(), PiiString::new("CA".to_owned())),
                (IDK::Zip.into(), PiiString::new("94117".to_owned())),
                (IDK::Country.into(), PiiString::new("US".to_owned())),
                // And custom data!
                (
                    KvDataKey::test_data("flerp".into()).into(),
                    PiiString::new("blerp".to_owned()),
                ),
            ],
            su_id: &su.id,
            is_allowed: true,
        },
        // Can add investor profile
        Test {
            update: vec![
                (IPK::Occupation.into(), PiiString::new("Penguin".to_owned())),
                (IPK::AnnualIncome.into(), PiiString::new("s50k_to100k".to_owned())),
                (IPK::NetWorth.into(), PiiString::new("s100k_to250k".to_owned())),
                (
                    IPK::InvestmentGoals.into(),
                    PiiString::new("[\"buy_a_home\"]".to_owned()),
                ),
                (IPK::RiskTolerance.into(), PiiString::new("aggressive".to_owned())),
                (IPK::Declarations.into(), PiiString::new("[]".to_owned())),
            ],
            su_id: &su.id,
            is_allowed: true,
        },
        // Can't add business data
        Test {
            update: vec![(BDK::Name.into(), PiiString::new("Acme Inc".to_owned()))],
            su_id: &su.id,
            is_allowed: false,
        },
    ];

    // Test subsequent updates to see if they are allowed.
    // Failed updates shouldn't make any changes to the DB so should act as no-ops
    for (i, test) in tests.into_iter().enumerate() {
        let Test {
            update,
            su_id,
            is_allowed,
        } = test;
        let uvw = VaultWrapper::<Person>::lock_for_onboarding(conn, su_id).unwrap();
        let result = uvw.patch_data_test_str(conn, update, true);
        assert_eq!(result.is_ok(), is_allowed, "Incorrect status {}: {:?}", i, result);
    }
}

#[db_test]
fn test_uvw_commit_data_race_condition(conn: &mut TestPgConn) {
    // This is a very particular test and exposes a very niche condition. It tests:
    // - Add speculative ssn4 to tenant 1
    // - Add speculative ssn9 to tenant 2 and commit it
    // - Commit data for tenant 1
    // Since there'a already an ssn9 when we commit the ssn4 for tenant1, we shouldn't
    // overwrite the more "complete" ssn9 on the user vault
    // This specific race condition was solved in https://linear.app/footprint/issue/FP-2129/handle-onboarding-race-condition
    let uv = fixtures::vault::create_person(conn, true);
    let tenant = fixtures::tenant::create(conn);
    let tenant2 = fixtures::tenant::create(conn);
    let ob_config = fixtures::ob_configuration::create(conn, &tenant.id, true);
    let ob_config2 = fixtures::ob_configuration::create(conn, &tenant2.id, true);
    let su = fixtures::scoped_vault::create(conn, &uv.id, &ob_config.id);
    let su2 = fixtures::scoped_vault::create(conn, &uv.id, &ob_config2.id);

    // Add speculative ssn4 (and some other data) by tenant 1
    let update = vec![
        (IDK::FirstName.into(), PiiString::new("Lerp".to_owned())),
        (IDK::LastName.into(), PiiString::new("Merp".to_owned())),
        (IDK::Ssn4.into(), PiiString::new("1234".to_owned())),
    ];
    let uvw = VaultWrapper::<Person>::lock_for_onboarding(conn, &su.id).unwrap();
    uvw.patch_data_test_str(conn, update, true).unwrap();
    // Get the ssn4 as was written by tenant 1
    let uvw = VaultWrapper::<Person>::build(conn, VwArgs::Tenant(&su.id)).unwrap();
    let ssn4_tenant1 = uvw.get_e_data(&IDK::Ssn4.into());
    assert!(!uvw.has_field(&IDK::Ssn9.into()));

    // Add speculative ssn9 by tenant 2
    let update = vec![(IDK::Ssn9.into(), PiiString::new("123121234".to_owned()))];
    let uvw = VaultWrapper::<Person>::lock_for_onboarding(conn, &su2.id).unwrap();
    uvw.patch_data_test_str(conn, update, true).unwrap();
    // Get the ssn4 and ssn9 as written by tenant 2
    let uvw = VaultWrapper::<Person>::build(conn, VwArgs::Tenant(&su2.id)).unwrap();
    let ssn4_tenant2 = uvw.get_e_data(&IDK::Ssn4.into());
    let ssn9_tenant2 = uvw.get_e_data(&IDK::Ssn9.into());
    assert_ne!(ssn4_tenant1, ssn4_tenant2);

    // Commit data for tenant2
    let uvw = VaultWrapper::<Person>::lock_for_onboarding(conn, &su2.id).unwrap();
    uvw.portablize_identity_data(conn).unwrap();

    // Commit data for tenant1 - the new ssn4 should _not_ be portable
    let uvw = VaultWrapper::<Person>::lock_for_onboarding(conn, &su.id).unwrap();
    uvw.portablize_identity_data(conn).unwrap();

    // Now, when getting portable data, we should still see the ssn9 added for tenant 2
    let uvw = VaultWrapper::<Person>::build_portable(conn, &uv.id).unwrap();
    assert_eq!(uvw.get_e_data(&IDK::Ssn4.into()), ssn4_tenant2);
    assert_eq!(uvw.get_e_data(&IDK::Ssn9.into()), ssn9_tenant2);
    // But, we should still have the name that was portable by tenant 1
    assert!(uvw.has_field(&IDK::FirstName.into()));
    assert!(uvw.has_field(&IDK::LastName.into()));
}

#[db_test]
fn test_uvw_replace_address_line2(conn: &mut TestPgConn) {
    let uv = fixtures::vault::create_person(conn, true);
    let tenant = fixtures::tenant::create(conn);
    let ob_config = fixtures::ob_configuration::create(conn, &tenant.id, true);
    let su = fixtures::scoped_vault::create(conn, &uv.id, &ob_config.id);

    let updates = vec![
        // Full address with line2
        vec![
            (IDK::AddressLine1.into(), PiiString::new("Flerp".to_owned())),
            (IDK::AddressLine2.into(), PiiString::new("Flerp".to_owned())),
            (IDK::City.into(), PiiString::new("San Francisco".to_owned())),
            (IDK::State.into(), PiiString::new("CA".to_owned())),
            (IDK::Zip.into(), PiiString::new("94117".to_owned())),
            (IDK::Country.into(), PiiString::new("US".to_owned())),
        ],
        // Full address without line2
        vec![
            (IDK::AddressLine1.into(), PiiString::new("Flerp".to_owned())),
            (IDK::City.into(), PiiString::new("San Francisco".to_owned())),
            (IDK::State.into(), PiiString::new("CA".to_owned())),
            (IDK::Zip.into(), PiiString::new("94117".to_owned())),
            (IDK::Country.into(), PiiString::new("US".to_owned())),
        ],
    ];

    for update in updates {
        let uvw = VaultWrapper::<Person>::lock_for_onboarding(conn, &su.id).unwrap();
        uvw.patch_data_test_str(conn, update.clone(), true).unwrap();
        // Make sure fields are set
        let uvw = VaultWrapper::<Person>::build(conn, VwArgs::Tenant(&su.id)).unwrap();
        for (di, _) in update {
            assert!(uvw.has_field(&di));
        }
    }
    // We should have cleared out line2 in the last update
    let uvw = VaultWrapper::<Person>::build(conn, VwArgs::Tenant(&su.id)).unwrap();
    assert!(!uvw.has_field(&IDK::AddressLine2.into()));
}

#[db_test]
fn test_commit_custom_data(conn: &mut TestPgConn) {
    // We haven't figured out the portability story for custom data or identity documents yet, so
    // for now, let's make sure we never commit them through the UVW
    let uv = fixtures::vault::create_person(conn, true);
    let tenant = fixtures::tenant::create(conn);
    let ob_config = fixtures::ob_configuration::create(conn, &tenant.id, true);
    let su = fixtures::scoped_vault::create(conn, &uv.id, &ob_config.id);

    let k1 = KvDataKey::from_str("blerp").unwrap();
    let k2 = KvDataKey::from_str("flerp").unwrap();

    // Add some custom data
    let uvw = VaultWrapper::<Person>::lock_for_onboarding(conn, &su.id).unwrap();
    let custom_data = vec![
        (k1.clone().into(), PiiString::from("BLERP")),
        (k2.clone().into(), PiiString::from("FLERP")),
    ];
    uvw.patch_data_test_str(conn, custom_data, true).unwrap();

    // Update k1 and make sure only it changed
    let uvw = VaultWrapper::<Person>::lock_for_onboarding(conn, &su.id).unwrap();
    let v1 = uvw.get_e_data(&k1.clone().into()).unwrap().clone();
    let v2 = uvw.get_e_data(&k2.clone().into()).unwrap().clone();
    let custom_data = vec![(k1.clone().into(), PiiString::from("MERP"))];
    uvw.patch_data_test_str(conn, custom_data, true).unwrap();

    let uvw = VaultWrapper::<Person>::lock_for_onboarding(conn, &su.id).unwrap();
    let new_v1 = uvw.get_e_data(&k1.clone().into()).unwrap().clone();
    let new_v2 = uvw.get_e_data(&k2.clone().into()).unwrap().clone();
    assert_ne!(new_v1, v1);
    assert_eq!(new_v2, v2);

    // Update k1 and k2 again and make sure they both changed
    let custom_data = vec![
        (k1.clone().into(), PiiString::from("hi")),
        (k2.clone().into(), PiiString::from("bye")),
    ];
    uvw.patch_data_test_str(conn, custom_data, true).unwrap();
    let uvw = VaultWrapper::<Person>::lock_for_onboarding(conn, &su.id).unwrap();
    let newest_v1 = uvw.get_e_data(&k1.into()).unwrap().clone();
    let newest_v2 = uvw.get_e_data(&k2.into()).unwrap().clone();
    assert_ne!(newest_v1, new_v1);
    assert_ne!(newest_v2, new_v2);
}

#[db_test]
fn test_dont_commit_non_id_data(conn: &mut TestPgConn) {
    // We haven't figured out the portability story for custom data or identity documents yet, so
    // for now, let's make sure we never commit them through the UVW
    let uv = fixtures::vault::create_person(conn, true);
    let tenant = fixtures::tenant::create(conn);
    let ob_config = fixtures::ob_configuration::create(conn, &tenant.id, true);
    let su = fixtures::scoped_vault::create(conn, &uv.id, &ob_config.id);

    // Add some data,
    let custom_key1 = KvDataKey::from_str("blerp").unwrap();
    let custom_key2 = KvDataKey::from_str("flerp").unwrap();
    let update = vec![
        (IDK::Ssn4.into(), PiiString::new("1234".to_owned())),
        (IPK::AnnualIncome.into(), PiiString::from("lt50k")),
        (IPK::NetWorth.into(), PiiString::from("lt50k")),
        (
            IPK::InvestmentGoals.into(),
            PiiString::from("[\"grow_long_term_wealth\"]"),
        ),
        (IPK::RiskTolerance.into(), PiiString::from("moderate")),
        (IPK::Declarations.into(), PiiString::from("[]")),
        (custom_key1.clone().into(), PiiString::from("BLERP")),
        (custom_key2.clone().into(), PiiString::from("FLERP")),
    ];
    let uvw = VaultWrapper::<Person>::lock_for_onboarding(conn, &su.id).unwrap();

    let sv_txn = DataLifetime::new_sv_txn(conn, &uvw.sv).unwrap();

    // add an identity document
    let _ = uvw
        .put_document_unsafe(
            conn,
            &sv_txn,
            DocumentDiKind::Image(IdDocKind::DriversLicense, DocumentSide::Front).into(),
            "image/png".into(),
            "filename.png".into(),
            newtypes::SealedVaultDataKey(vec![0x01]),
            S3Url::from("test".to_string()),
            DataLifetimeSource::LikelyHosted,
            None,
            false,
        )
        .unwrap();

    uvw.patch_data_test_str(conn, update, true).unwrap();

    // Commit the identity data
    let uvw = VaultWrapper::<Person>::lock_for_onboarding(conn, &su.id).unwrap();
    uvw.portablize_identity_data(conn).unwrap();

    let seqno = DataLifetime::get_current_seqno(conn).unwrap();
    let (portable, speculative): (HashSet<_>, HashSet<_>) =
        DataLifetime::bulk_get_active_at(conn, vec![&su.id], seqno)
            .unwrap()
            .into_iter()
            .partition_map(|dl| {
                if dl.portablized_at.is_some() {
                    either::Either::Left(dl.kind)
                } else {
                    either::Either::Right(dl.kind)
                }
            });

    let expected_speculative_kinds = HashSet::from_iter([
        // Assert all custom DLs are not portable
        custom_key1.into(),
        custom_key2.into(),
        // Assert identity doc DL is not portable
        DocumentDiKind::Image(IdDocKind::DriversLicense, DocumentSide::Front).into(),
        IPK::AnnualIncome.into(),
        IPK::NetWorth.into(),
        IPK::InvestmentGoals.into(),
        IPK::RiskTolerance.into(),
        IPK::Declarations.into(),
    ]);
    assert_eq!(expected_speculative_kinds, speculative);

    // But identity data should be portable
    let expected_portable_kinds = HashSet::from_iter([IDK::Ssn4.into()]);
    assert_eq!(expected_portable_kinds, portable);
}

#[db_test]
fn test_portable_view(conn: &mut TestPgConn) {
    // Create a vault that has a portablized address from tenant1, then portablized address from tenant
    // 2. Make sure we choose the correct address line2
    let tenant1 = db::tests::fixtures::tenant::create(conn);
    let tenant2 = db::tests::fixtures::tenant::create(conn);
    let pb1 = db::tests::fixtures::ob_configuration::create(conn, &tenant1.id, true);
    let pb2 = db::tests::fixtures::ob_configuration::create(conn, &tenant2.id, true);

    let uv = db::tests::fixtures::vault::create_person(conn, true);
    let su1 = db::tests::fixtures::scoped_vault::create(conn, &uv.id, &pb1.id);
    let su2 = db::tests::fixtures::scoped_vault::create(conn, &uv.id, &pb2.id);

    // Add address with line2 to tenant 1
    let vw1: WriteableVw<Person> = VaultWrapper::lock_for_onboarding(conn, &su1.id).unwrap();
    let data = vec![
        (IDK::AddressLine1.into(), PiiString::new("730 Hayes St".into())),
        (IDK::AddressLine2.into(), PiiString::new("#A".into())),
        (IDK::City.into(), PiiString::new("San Francisco".into())),
        (IDK::State.into(), PiiString::new("CA".into())),
        (IDK::Country.into(), PiiString::new("US".into())),
        (IDK::Zip.into(), PiiString::new("94117".into())),
    ];
    vw1.patch_data_test_str(conn, data, true).unwrap();
    let vw1: WriteableVw<Person> = VaultWrapper::lock_for_onboarding(conn, &su1.id).unwrap();
    vw1.portablize_identity_data(conn).unwrap();

    // We should see address line2 in the portable data
    let vw = VaultWrapper::<Any>::build_portable(conn, &uv.id).unwrap();
    assert!(vw.get(&IDK::AddressLine1.into()).is_some());
    assert!(vw.get(&IDK::AddressLine2.into()).is_some());

    // Add address WITHOUT line2 to tenant 2
    let vw: WriteableVw<Person> = VaultWrapper::lock_for_onboarding(conn, &su2.id).unwrap();
    let data = vec![
        (IDK::AddressLine1.into(), PiiString::new("72 Central Ave".into())),
        (IDK::City.into(), PiiString::new("San Francisco".into())),
        (IDK::State.into(), PiiString::new("CA".into())),
        (IDK::Country.into(), PiiString::new("US".into())),
        (IDK::Zip.into(), PiiString::new("94117".into())),
    ];
    vw.patch_data_test_str(conn, data, true).unwrap();
    let vw: WriteableVw<Person> = VaultWrapper::lock_for_onboarding(conn, &su2.id).unwrap();
    vw.portablize_identity_data(conn).unwrap();

    // Compose the portable view of the VW and make sure we don't have an address line2
    let vw = VaultWrapper::<Any>::build_portable(conn, &uv.id).unwrap();
    assert!(vw.get(&IDK::AddressLine1.into()).is_some());
    assert!(vw.get(&IDK::AddressLine2.into()).is_none());
    assert!(vw.get(&IDK::City.into()).is_some());
    assert!(vw.get(&IDK::State.into()).is_some());
    assert!(vw.get(&IDK::Zip.into()).is_some());
    assert!(vw.get(&IDK::Country.into()).is_some());

    // Then add address line2 to tenant 2
    let vw: WriteableVw<Person> = VaultWrapper::lock_for_onboarding(conn, &su2.id).unwrap();
    let data = vec![
        (IDK::AddressLine1.into(), PiiString::new("72 Central Ave".into())),
        (IDK::AddressLine2.into(), PiiString::new("#A".into())),
        (IDK::City.into(), PiiString::new("San Francisco".into())),
        (IDK::State.into(), PiiString::new("CA".into())),
        (IDK::Country.into(), PiiString::new("US".into())),
        (IDK::Zip.into(), PiiString::new("94117".into())),
    ];
    vw.patch_data_test_str(conn, data, true).unwrap();
    let vw: WriteableVw<Person> = VaultWrapper::lock_for_onboarding(conn, &su2.id).unwrap();
    vw.portablize_identity_data(conn).unwrap();

    // We should see address line2 in the portable data now
    let vw = VaultWrapper::<Any>::build_portable(conn, &uv.id).unwrap();
    assert!(vw.get(&IDK::AddressLine1.into()).is_some());
    assert!(vw.get(&IDK::AddressLine2.into()).is_some());

    // And a new address without line 2 at tenant 2, which should deactivate tenant2's line2
    let vw: WriteableVw<Person> = VaultWrapper::lock_for_onboarding(conn, &su2.id).unwrap();
    let data = vec![
        (IDK::AddressLine1.into(), PiiString::new("72 Central Ave".into())),
        (IDK::City.into(), PiiString::new("San Francisco".into())),
        (IDK::State.into(), PiiString::new("CA".into())),
        (IDK::Country.into(), PiiString::new("US".into())),
        (IDK::Zip.into(), PiiString::new("94117".into())),
    ];
    vw.patch_data_test_str(conn, data, true).unwrap();
    let vw: WriteableVw<Person> = VaultWrapper::lock_for_onboarding(conn, &su2.id).unwrap();
    vw.portablize_identity_data(conn).unwrap();

    // We should see address line2 in the portable data now
    let vw = VaultWrapper::<Any>::build_portable(conn, &uv.id).unwrap();
    assert!(vw.get(&IDK::AddressLine1.into()).is_some());
    assert!(vw.get(&IDK::AddressLine2.into()).is_none());
}
