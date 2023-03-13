use super::{Business, VaultWrapper};
use crate::utils::vault_wrapper::Person;
use crate::utils::vault_wrapper::VwArgs;
use db::models::data_lifetime::DataLifetime;
use db::models::user_timeline::UserTimeline;
use db::models::vault_data::NewVaultData;
use db::models::vault_data::VaultData;
use db::tests::fixtures;
use db::tests::prelude::*;
use itertools::Itertools;
use macros::db_test;
use newtypes::DataIdentifier;
use newtypes::IdentityDataKind as IDK;
use newtypes::KvDataKey;
use newtypes::PiiString;
use newtypes::{BusinessDataKind as BDK, SealedVaultBytes};
use std::collections::HashMap;
use std::str::FromStr;

#[db_test]
fn test_build_user_vault_wrapper(conn: &mut TestPgConn) {
    let uv = db::tests::fixtures::vault::create_person(conn, true);
    let tenant = db::tests::fixtures::tenant::create(conn);
    let ob_config = db::tests::fixtures::ob_configuration::create(conn, &tenant.id, true);
    let su = db::tests::fixtures::scoped_vault::create(conn, &uv.id, &ob_config.id);

    // Add identity data
    let data = vec![
        NewVaultData {
            kind: IDK::FirstName,
            e_data: SealedVaultBytes(vec![1]),
        },
        NewVaultData {
            kind: IDK::LastName,
            e_data: SealedVaultBytes(vec![2]),
        },
        NewVaultData {
            kind: IDK::Ssn4,
            e_data: SealedVaultBytes(vec![3]),
        },
    ];
    let seqno = DataLifetime::get_next_seqno(conn).unwrap();
    VaultData::bulk_create(conn, &uv.id, Some(&su.id), data, seqno).unwrap();

    // Create email
    let email = fixtures::email::create(conn, &uv.id, &su.id, seqno);

    // Create phone number
    let phone_number = fixtures::phone_number::create(conn, &uv.id, Some(&su.id));

    let uvw = VaultWrapper::build(conn, VwArgs::Tenant(&su.id)).unwrap();
    let tests = vec![
        (IDK::FirstName, Some(SealedVaultBytes(vec![1]))),
        (IDK::LastName, Some(SealedVaultBytes(vec![2]))),
        (IDK::Ssn4, Some(SealedVaultBytes(vec![3]))),
        (IDK::Email, Some(email.e_data)),
        (IDK::PhoneNumber, Some(phone_number.e_e164.clone())),
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
        assert_eq!(uvw.get_identity_e_field(attribute), expected_value.as_ref());
    }

    // build_for_user should only show the phone number
    let uvw = VaultWrapper::build(conn, VwArgs::User(&uv.id)).unwrap();
    let tests = vec![
        (IDK::FirstName, None),
        (IDK::LastName, None),
        (IDK::Ssn4, None),
        (IDK::Email, None),
        (IDK::PhoneNumber, Some(phone_number.e_e164)),
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
        assert_eq!(uvw.get_identity_e_field(attribute), expected_value.as_ref());
    }
}

#[db_test]
fn test_build_business_user_vault_wrapper(conn: &mut TestPgConn) {
    let uv = db::tests::fixtures::vault::create_person(conn, true);
    let tenant = db::tests::fixtures::tenant::create(conn);
    let ob_config = db::tests::fixtures::ob_configuration::create(conn, &tenant.id, true);
    let su = db::tests::fixtures::scoped_vault::create(conn, &uv.id, &ob_config.id);

    let data = vec![
        NewVaultData {
            kind: BDK::Name,
            e_data: SealedVaultBytes(vec![1]),
        },
        NewVaultData {
            kind: BDK::Website,
            e_data: SealedVaultBytes(vec![2]),
        },
        NewVaultData {
            kind: BDK::PhoneNumber,
            e_data: SealedVaultBytes(vec![3]),
        },
    ];
    let seqno = DataLifetime::get_next_seqno(conn).unwrap();
    VaultData::bulk_create(conn, &uv.id, Some(&su.id), data, seqno).unwrap();

    let bvw = VaultWrapper::<Business>::build(conn, VwArgs::Tenant(&su.id)).unwrap();
    let tests = vec![
        (BDK::Name, Some(SealedVaultBytes(vec![1]))),
        (BDK::Website, Some(SealedVaultBytes(vec![2]))),
        (BDK::PhoneNumber, Some(SealedVaultBytes(vec![3]))),
        (BDK::Ein, None),
        (BDK::AddressLine1, None),
        (BDK::AddressLine2, None),
        (BDK::City, None),
        (BDK::State, None),
        (BDK::Zip, None),
        (BDK::Country, None),
    ];
    for test in tests {
        let (attribute, expected_value) = test;
        assert_eq!(bvw.get_business_e_field(attribute), expected_value.as_ref());
    }
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
    uvw.add_data_test(conn, vec![(IDK::Email.into(), email)]).unwrap();

    // Allow replacing the email
    let uvw = VaultWrapper::<Person>::lock_for_onboarding(conn, &su.id).unwrap();
    let email = PiiString::from_str("test2@onefootprint.com").unwrap();
    uvw.add_data_test(conn, vec![(IDK::Email.into(), email)]).unwrap();

    // Add a name
    let uvw = VaultWrapper::<Person>::lock_for_onboarding(conn, &su.id).unwrap();
    let update = vec![
        (IDK::FirstName.into(), PiiString::new("Flerp".to_owned())),
        (IDK::LastName.into(), PiiString::new("Derp".to_owned())),
    ];
    uvw.add_data_test(conn, update).unwrap();

    // Make the user can't see the name and email until it's portable
    let uvw = VaultWrapper::build(conn, VwArgs::User(&uv.id)).unwrap();
    assert!(!uvw.has_identity_field(IDK::FirstName));
    assert!(!uvw.has_identity_field(IDK::LastName));
    assert!(!uvw.has_identity_field(IDK::Email));

    // The UserTimeline events shouldn't be portable right now
    let timeline_events = UserTimeline::list(conn, &su.id, true).unwrap();
    assert!(!timeline_events.is_empty());
    assert!(!timeline_events.iter().any(|x| x.0.is_portable));

    // Commit
    let uvw = VaultWrapper::<Person>::lock_for_onboarding(conn, &su.id).unwrap();
    assert!(uvw.has_identity_field(IDK::FirstName));
    assert!(uvw.has_identity_field(IDK::LastName));
    assert!(uvw.has_identity_field(IDK::Email));
    uvw.commit_identity_data(conn).unwrap();

    // Now we should see the portable name and email
    let uvw = VaultWrapper::build(conn, VwArgs::User(&uv.id)).unwrap();
    assert!(uvw.has_identity_field(IDK::FirstName));
    assert!(uvw.has_identity_field(IDK::LastName));
    assert!(uvw.has_identity_field(IDK::Email));

    // And the user timeline events should be made portable
    let timeline_events = UserTimeline::list(conn, &su.id, true).unwrap();
    assert!(!timeline_events.is_empty());
    assert!(timeline_events.iter().all(|x| x.0.is_portable));
}

#[db_test]
fn test_uvw_update_identity_data_validation(conn: &mut TestPgConn) {
    let uv = fixtures::vault::create_person(conn, true);
    let tenant = fixtures::tenant::create(conn);
    let ob_config = fixtures::ob_configuration::create(conn, &tenant.id, true);
    let ob_config2 = fixtures::ob_configuration::create(conn, &tenant.id, true);
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
        // Allowed to add partial address
        Test {
            update: vec![
                (IDK::Zip.into(), PiiString::new("94117".to_owned())),
                (IDK::Country.into(), PiiString::new("US".to_owned())),
            ],
            su_id: &su.id,
            is_allowed: true,
        },
        // Allowed to add full address on top of partial address
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
        // Not allowed to add partial address on top of full address
        Test {
            update: vec![
                (IDK::Zip.into(), PiiString::new("94117".to_owned())),
                (IDK::Country.into(), PiiString::new("US".to_owned())),
            ],
            su_id: &su.id,
            is_allowed: false,
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
            ],
            su_id: &su.id,
            is_allowed: true,
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
        let result = uvw.add_data_test(conn, update);
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
    let ob_config = fixtures::ob_configuration::create(conn, &tenant.id, true);
    let ob_config2 = fixtures::ob_configuration::create(conn, &tenant.id, true);
    let su = fixtures::scoped_vault::create(conn, &uv.id, &ob_config.id);
    let su2 = fixtures::scoped_vault::create(conn, &uv.id, &ob_config2.id);

    // Add speculative ssn4 (and some other data) by tenant 1
    let update = vec![
        (IDK::FirstName.into(), PiiString::new("Lerp".to_owned())),
        (IDK::LastName.into(), PiiString::new("Merp".to_owned())),
        (IDK::Ssn4.into(), PiiString::new("1234".to_owned())),
    ];
    let uvw = VaultWrapper::<Person>::lock_for_onboarding(conn, &su.id).unwrap();
    uvw.add_data_test(conn, update).unwrap();
    // Get the ssn4 as was written by tenant 1
    let uvw = VaultWrapper::build(conn, VwArgs::Tenant(&su.id)).unwrap();
    let ssn4_tenant1 = uvw.get_identity_e_field(IDK::Ssn4);
    assert!(!uvw.has_identity_field(IDK::Ssn9));

    // Add speculative ssn9 by tenant 2
    let update = vec![(IDK::Ssn9.into(), PiiString::new("123121234".to_owned()))];
    let uvw = VaultWrapper::<Person>::lock_for_onboarding(conn, &su2.id).unwrap();
    uvw.add_data_test(conn, update).unwrap();
    // Get the ssn4 and ssn9 as written by tenant 2
    let uvw = VaultWrapper::build(conn, VwArgs::Tenant(&su2.id)).unwrap();
    let ssn4_tenant2 = uvw.get_identity_e_field(IDK::Ssn4);
    let ssn9_tenant2 = uvw.get_identity_e_field(IDK::Ssn9);
    assert_ne!(ssn4_tenant1, ssn4_tenant2);

    // Commit data for tenant2
    let uvw = VaultWrapper::<Person>::lock_for_onboarding(conn, &su2.id).unwrap();
    uvw.commit_identity_data(conn).unwrap();

    // Commit data for tenant1 - the new ssn4 should _not_ be portable
    let uvw = VaultWrapper::<Person>::lock_for_onboarding(conn, &su.id).unwrap();
    uvw.commit_identity_data(conn).unwrap();

    // Now, when getting portable data, we should still see the ssn9 added for tenant 2
    let uvw = VaultWrapper::build(conn, VwArgs::User(&uv.id)).unwrap();
    assert_eq!(uvw.get_identity_e_field(IDK::Ssn4), ssn4_tenant2);
    assert_eq!(uvw.get_identity_e_field(IDK::Ssn9), ssn9_tenant2);
    // But, we should still have the name that was portable by tenant 1
    assert!(uvw.has_identity_field(IDK::FirstName));
    assert!(uvw.has_identity_field(IDK::LastName));
}

#[db_test]
fn test_uvw_replace_address_line2(conn: &mut TestPgConn) {
    let uv = fixtures::vault::create_person(conn, true);
    let tenant = fixtures::tenant::create(conn);
    let ob_config = fixtures::ob_configuration::create(conn, &tenant.id, true);
    let su = fixtures::scoped_vault::create(conn, &uv.id, &ob_config.id);

    let updates = vec![
        // Partial address
        vec![
            (IDK::Zip.into(), PiiString::new("94117".to_owned())),
            (IDK::Country.into(), PiiString::new("US".to_owned())),
        ],
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
        uvw.add_data_test(conn, update).unwrap();
    }
    let uvw = VaultWrapper::build(conn, VwArgs::Tenant(&su.id)).unwrap();
    assert!(uvw.has_identity_field(IDK::AddressLine1));
    // We should have cleared out line2 in the last update
    assert!(!uvw.has_identity_field(IDK::AddressLine2));
    assert!(uvw.has_identity_field(IDK::City));
    assert!(uvw.has_identity_field(IDK::State));
    assert!(uvw.has_identity_field(IDK::Zip));
    assert!(uvw.has_identity_field(IDK::Country));
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
    let custom_data = HashMap::from_iter([
        (k1.clone(), PiiString::from("BLERP")),
        (k2.clone(), PiiString::from("FLERP")),
    ]);
    uvw.update_custom_data(conn, custom_data).unwrap();

    // Update k1 and make sure only it changed
    let uvw = VaultWrapper::<Person>::lock_for_onboarding(conn, &su.id).unwrap();
    let v1 = uvw.kv_data().get(&k1).unwrap().e_data.clone();
    let v2 = uvw.kv_data().get(&k2).unwrap().e_data.clone();
    let custom_data = HashMap::from_iter([(k1.clone(), PiiString::from("MERP"))]);
    uvw.update_custom_data(conn, custom_data).unwrap();

    let uvw = VaultWrapper::<Person>::lock_for_onboarding(conn, &su.id).unwrap();
    let new_v1 = uvw.kv_data().get(&k1).unwrap().e_data.clone();
    let new_v2 = uvw.kv_data().get(&k2).unwrap().e_data.clone();
    assert_ne!(new_v1, v1);
    assert_eq!(new_v2, v2);

    // Update k1 and k2 again and make sure they both changed
    let custom_data = HashMap::from_iter([
        (k1.clone(), PiiString::from("hi")),
        (k2.clone(), PiiString::from("bye")),
    ]);
    uvw.update_custom_data(conn, custom_data).unwrap();
    let uvw = VaultWrapper::<Person>::lock_for_onboarding(conn, &su.id).unwrap();
    let newest_v1 = uvw.kv_data().get(&k1).unwrap().e_data.clone();
    let newest_v2 = uvw.kv_data().get(&k2).unwrap().e_data.clone();
    assert_ne!(newest_v1, new_v1);
    assert_ne!(newest_v2, new_v2);
}

#[db_test]
fn test_dont_commit_custom_data_or_id_docs(conn: &mut TestPgConn) {
    // We haven't figured out the portability story for custom data or identity documents yet, so
    // for now, let's make sure we never commit them through the UVW
    let uv = fixtures::vault::create_person(conn, true);
    let tenant = fixtures::tenant::create(conn);
    let ob_config = fixtures::ob_configuration::create(conn, &tenant.id, true);
    let su = fixtures::scoped_vault::create(conn, &uv.id, &ob_config.id);

    // Add some identity data
    let update = vec![(IDK::Ssn4.into(), PiiString::new("1234".to_owned()))];
    let uvw = VaultWrapper::<Person>::lock_for_onboarding(conn, &su.id).unwrap();
    uvw.add_data_test(conn, update).unwrap();

    // Also add an identity document
    let id_doc = fixtures::identity_document::create(conn, &uv.id, Some(&su.id));

    // Also add some custom data
    let custom_key1 = KvDataKey::from_str("blerp").unwrap();
    let custom_key2 = KvDataKey::from_str("flerp").unwrap();
    let custom_data = HashMap::from_iter([
        (custom_key1.clone(), PiiString::from("BLERP")),
        (custom_key2.clone(), PiiString::from("FLERP")),
    ]);
    let uvw = VaultWrapper::<Person>::lock_for_onboarding(conn, &su.id).unwrap();
    uvw.update_custom_data(conn, custom_data).unwrap();

    // Commit the identity data
    let uvw = VaultWrapper::<Person>::lock_for_onboarding(conn, &su.id).unwrap();
    uvw.commit_identity_data(conn).unwrap();

    let (portable, speculative): (Vec<_>, Vec<_>) = DataLifetime::get_active(conn, &uv.id, Some(&su.id))
        .unwrap()
        .into_iter()
        .partition_map(|dl| {
            if dl.portablized_at.is_some() {
                either::Either::Left(dl.kind)
            } else {
                either::Either::Right(dl.kind)
            }
        });

    let expected_speculative_kinds = [
        // Assert all custom DLs are not portable
        custom_key1.into(),
        custom_key2.into(),
        // Assert identity doc DL is not portable
        id_doc.document_type.into(),
    ];
    assert!(expected_speculative_kinds.iter().all(|k| speculative.contains(k)));

    // But identity data should be portable
    let expected_portable_kinds = [IDK::Ssn4.into()];
    assert!(expected_portable_kinds.iter().all(|k| portable.contains(k)));
}
