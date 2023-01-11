use std::collections::HashMap;

use super::UserVaultWrapper;
use crate::types::identity_data_request::IdentityDataUpdate;
use crate::utils::user_vault_wrapper::{UvwAddData, UvwArgs, UvwCommitData};
use db::models::data_lifetime::DataLifetime;
use db::models::user_vault_data::NewUserVaultData;
use db::models::user_vault_data::UserVaultData;
use db::tests::fixtures;
use db::tests::prelude::*;
use db::HasDataAttributeFields;
use itertools::Itertools;
use macros::db_test;
use newtypes::address::{Address, AddressLine, City, Country, FullAddressOrZip, State, Zip, ZipAndCountry};
use newtypes::dob::DateOfBirth;
use newtypes::email::Email;
use newtypes::DataLifetimeKind;
use newtypes::Fingerprint;
use newtypes::SealedVaultBytes;
use newtypes::{
    name::{FullName, Name},
    ssn::{Ssn, Ssn4, Ssn9},
    PiiString, UvdKind,
};
use newtypes::{DataLifetimeId, KvDataKey};
use std::str::FromStr;

#[db_test]
fn test_build_user_vault_wrapper(conn: &mut TestPgConnection) {
    let uv = fixtures::user_vault::create(conn);
    let tenant = fixtures::tenant::create(conn);
    let ob_config = fixtures::ob_configuration::create(conn, &tenant.id);
    let su = fixtures::scoped_user::create(conn, &uv.id, &ob_config.id);

    let mut data_kind_to_lifetime_id = HashMap::<DataLifetimeKind, DataLifetimeId>::new();

    // Add identity data
    let data = vec![
        NewUserVaultData {
            kind: UvdKind::FirstName,
            e_data: SealedVaultBytes(vec![1]),
        },
        NewUserVaultData {
            kind: UvdKind::LastName,
            e_data: SealedVaultBytes(vec![2]),
        },
        NewUserVaultData {
            kind: UvdKind::Ssn4,
            e_data: SealedVaultBytes(vec![3]),
        },
    ];
    let seqno = DataLifetime::get_next_seqno(conn).unwrap();
    let uvds = UserVaultData::bulk_create(conn, &uv.id, Some(&su.id), data, seqno).unwrap();
    for uvd in uvds {
        data_kind_to_lifetime_id.insert(uvd.kind.into(), uvd.lifetime_id);
    }

    // Create email
    let email = fixtures::email::create(conn, &uv.id, &su.id, seqno);
    data_kind_to_lifetime_id.insert(DataLifetimeKind::Email, email.lifetime_id);

    // Create phone number
    let phone_number = fixtures::phone_number::create(conn, &uv.id, Some(&su.id));
    data_kind_to_lifetime_id.insert(DataLifetimeKind::PhoneNumber, phone_number.lifetime_id);

    let uvw = UserVaultWrapper::build(conn, UvwArgs::Onboarding(&su.id)).unwrap();
    let tests = vec![
        (DataLifetimeKind::FirstName, Some(SealedVaultBytes(vec![1]))),
        (DataLifetimeKind::LastName, Some(SealedVaultBytes(vec![2]))),
        (DataLifetimeKind::Ssn4, Some(SealedVaultBytes(vec![3]))),
        (DataLifetimeKind::Email, Some(email.e_data)),
        (DataLifetimeKind::PhoneNumber, Some(phone_number.e_e164.clone())),
        (DataLifetimeKind::Dob, None),
        (DataLifetimeKind::AddressLine1, None),
        (DataLifetimeKind::AddressLine2, None),
        (DataLifetimeKind::City, None),
        (DataLifetimeKind::State, None),
        (DataLifetimeKind::Zip, None),
        (DataLifetimeKind::Country, None),
        (DataLifetimeKind::Ssn9, None),
    ];
    for test in tests {
        let (attribute, expected_value) = test;
        assert_eq!(uvw.get_e_field(attribute), expected_value.as_ref());
    }

    // build_for_user should only show the phone number
    let uvw = UserVaultWrapper::build(conn, UvwArgs::User(&uv.id)).unwrap();
    let tests = vec![
        (DataLifetimeKind::FirstName, None),
        (DataLifetimeKind::LastName, None),
        (DataLifetimeKind::Ssn4, None),
        (DataLifetimeKind::Email, None),
        (DataLifetimeKind::PhoneNumber, Some(phone_number.e_e164)),
        (DataLifetimeKind::Dob, None),
        (DataLifetimeKind::AddressLine1, None),
        (DataLifetimeKind::AddressLine2, None),
        (DataLifetimeKind::City, None),
        (DataLifetimeKind::State, None),
        (DataLifetimeKind::Zip, None),
        (DataLifetimeKind::Country, None),
        (DataLifetimeKind::Ssn9, None),
    ];
    for test in tests {
        let (attribute, expected_value) = test;
        assert_eq!(uvw.get_e_field(attribute), expected_value.as_ref());
    }
}

#[db_test]
fn test_user_vault_wrapper_add_fields(conn: &mut TestPgConnection) {
    let uv = fixtures::user_vault::create(conn);
    let tenant = fixtures::tenant::create(conn);
    let ob_config = fixtures::ob_configuration::create(conn, &tenant.id);
    let su = fixtures::scoped_user::create(conn, &uv.id, &ob_config.id);

    // Add an email
    let uvw = UserVaultWrapper::lock_for_onboarding(conn, &su.id).unwrap();
    let email = Email::from_str("test@onefootprint.com").unwrap();
    uvw.add_email(conn, email, Fingerprint(vec![])).unwrap();

    // Allow replacing the email
    let uvw = UserVaultWrapper::lock_for_onboarding(conn, &su.id).unwrap();
    let email = Email::from_str("test2@onefootprint.com").unwrap();
    uvw.add_email(conn, email, Fingerprint(vec![])).unwrap();

    // Add a name
    let uvw = UserVaultWrapper::lock_for_onboarding(conn, &su.id).unwrap();
    let update = IdentityDataUpdate {
        name: Some(FullName {
            first_name: Name::from_str("Flerp").unwrap(),
            last_name: Name::from_str("Derp").unwrap(),
        }),
        dob: None,
        address: None,
        ssn: None,
    };
    uvw.update_identity_data(conn, update, vec![]).unwrap();

    // Make the user can't see the name and email until it's committed
    let uvw = UserVaultWrapper::build(conn, UvwArgs::User(&uv.id)).unwrap();
    assert!(!uvw.has_field(DataLifetimeKind::FirstName));
    assert!(!uvw.has_field(DataLifetimeKind::LastName));
    assert!(!uvw.has_field(DataLifetimeKind::Email));

    // Commit
    let uvw = UserVaultWrapper::lock_for_onboarding(conn, &su.id).unwrap();
    assert!(uvw.has_field(DataLifetimeKind::FirstName));
    assert!(uvw.has_field(DataLifetimeKind::LastName));
    assert!(uvw.has_field(DataLifetimeKind::Email));
    uvw.commit_identity_data(conn).unwrap();

    // Now we should see the committed name and email
    let uvw = UserVaultWrapper::build(conn, UvwArgs::User(&uv.id)).unwrap();
    assert!(uvw.has_field(DataLifetimeKind::FirstName));
    assert!(uvw.has_field(DataLifetimeKind::LastName));
    assert!(uvw.has_field(DataLifetimeKind::Email));
}

// Some impls to make test code cleaner
impl From<FullName> for IdentityDataUpdate {
    fn from(value: FullName) -> Self {
        Self {
            name: Some(value),
            ..Self::default()
        }
    }
}

impl From<DateOfBirth> for IdentityDataUpdate {
    fn from(value: DateOfBirth) -> Self {
        Self {
            dob: Some(value),
            ..Self::default()
        }
    }
}

impl From<FullAddressOrZip> for IdentityDataUpdate {
    fn from(value: FullAddressOrZip) -> Self {
        Self {
            address: Some(value),
            ..Self::default()
        }
    }
}

impl From<Ssn> for IdentityDataUpdate {
    fn from(value: Ssn) -> Self {
        Self {
            ssn: Some(value),
            ..Self::default()
        }
    }
}

#[db_test]
fn test_uvw_update_identity_data_validation(conn: &mut TestPgConnection) {
    let uv = fixtures::user_vault::create(conn);
    let tenant = fixtures::tenant::create(conn);
    let ob_config = fixtures::ob_configuration::create(conn, &tenant.id);
    let ob_config2 = fixtures::ob_configuration::create(conn, &tenant.id);
    let su = fixtures::scoped_user::create(conn, &uv.id, &ob_config.id);
    let su2 = fixtures::scoped_user::create(conn, &uv.id, &ob_config2.id);

    struct Test<'a> {
        update: IdentityDataUpdate,
        su_id: &'a newtypes::ScopedUserId,
        is_allowed: bool,
    }

    // Apply a series of updates in order. Some of the updates are allowed, others are not
    let tests = vec![
        Test {
            update: FullName {
                first_name: Name::from_str("Flerp").unwrap(),
                last_name: Name::from_str("Derp").unwrap(),
            }
            .into(),
            su_id: &su.id,
            is_allowed: true,
        },
        // Allowed to replace name
        Test {
            update: FullName {
                first_name: Name::from_str("Merp").unwrap(),
                last_name: Name::from_str("Derp").unwrap(),
            }
            .into(),
            su_id: &su.id,
            is_allowed: true,
        },
        // Allowed to add ssn4
        Test {
            update: Ssn::Ssn4(Ssn4::from_str("1234").unwrap()).into(),
            su_id: &su.id,
            is_allowed: true,
        },
        // Allowed to add ssn9 after ssn4
        Test {
            update: Ssn::Ssn9(Ssn9::from_str("123121234").unwrap()).into(),
            su_id: &su.id,
            is_allowed: true,
        },
        // NOT allowed to add ssn4 after ssn9
        Test {
            update: Ssn::Ssn4(Ssn4::from_str("1234").unwrap()).into(),
            su_id: &su.id,
            is_allowed: false,
        },
        // BUT, can add ssn4 on different scoped user
        Test {
            update: Ssn::Ssn4(Ssn4::from_str("1234").unwrap()).into(),
            su_id: &su2.id, // This is the only test that uses su2
            is_allowed: true,
        },
        // Allowed to add partial address
        Test {
            update: FullAddressOrZip::ZipAndCountry(ZipAndCountry {
                zip: Zip::try_from("94117".to_owned()).unwrap(),
                country: Country::try_from("US".to_owned()).unwrap(),
            })
            .into(),
            su_id: &su.id,
            is_allowed: true,
        },
        // Allowed to add full address on top of partial address
        Test {
            update: FullAddressOrZip::Address(Address {
                line1: AddressLine::try_from("Flerp".to_owned()).unwrap(),
                line2: None,
                city: City::try_from("San Francisco".to_owned()).unwrap(),
                state: State::try_from("CA".to_owned()).unwrap(),
                zip: Zip::try_from("94117".to_owned()).unwrap(),
                country: Country::try_from("US".to_owned()).unwrap(),
            })
            .into(),
            su_id: &su.id,
            is_allowed: true,
        },
        // Not allowed to add partial address on top of full address
        Test {
            update: FullAddressOrZip::ZipAndCountry(ZipAndCountry {
                zip: Zip::try_from("94117".to_owned()).unwrap(),
                country: Country::try_from("US".to_owned()).unwrap(),
            })
            .into(),
            su_id: &su.id,
            is_allowed: false,
        },
        // Allowed to update all remaining info
        Test {
            update: IdentityDataUpdate {
                name: Some(FullName {
                    first_name: Name::from_str("Merp").unwrap(),
                    last_name: Name::from_str("Derp").unwrap(),
                }),
                dob: Some(DateOfBirth::try_from(PiiString::new("1995-12-25".to_owned())).unwrap()),
                address: Some(FullAddressOrZip::Address(Address {
                    line1: AddressLine::try_from("Flerp".to_owned()).unwrap(),
                    line2: None,
                    city: City::try_from("San Francisco".to_owned()).unwrap(),
                    state: State::try_from("CA".to_owned()).unwrap(),
                    zip: Zip::try_from("94117".to_owned()).unwrap(),
                    country: Country::try_from("US".to_owned()).unwrap(),
                })),
                ssn: Some(Ssn::Ssn9(Ssn9::from_str("123121234").unwrap())),
            },
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
        let uvw = UserVaultWrapper::lock_for_onboarding(conn, su_id).unwrap();
        let result = uvw.update_identity_data(conn, update.clone(), vec![]);
        assert_eq!(result.is_ok(), is_allowed, "Incorrect status {}: {:?}", i, result);
    }
}

#[db_test]
fn test_uvw_commit_data_race_condition(conn: &mut TestPgConnection) {
    // This is a very particular test and exposes a very niche condition. It tests:
    // - Add speculative ssn4 to tenant 1
    // - Add speculative ssn9 to tenant 2 and commit it
    // - Commit data for tenant 1
    // Since there'a already an ssn9 when we commit the ssn4 for tenant1, we shouldn't
    // overwrite the more "complete" ssn9 on the user vault
    // This specific race condition was solved in https://linear.app/footprint/issue/FP-2129/handle-onboarding-race-condition
    let uv = fixtures::user_vault::create(conn);
    let tenant = fixtures::tenant::create(conn);
    let ob_config = fixtures::ob_configuration::create(conn, &tenant.id);
    let ob_config2 = fixtures::ob_configuration::create(conn, &tenant.id);
    let su = fixtures::scoped_user::create(conn, &uv.id, &ob_config.id);
    let su2 = fixtures::scoped_user::create(conn, &uv.id, &ob_config2.id);

    // Add speculative ssn4 (and some other data) by tenant 1
    let update = IdentityDataUpdate {
        ssn: Some(Ssn::Ssn4(Ssn4::from_str("0987").unwrap())),
        name: Some(FullName {
            first_name: Name::from_str("Flerp").unwrap(),
            last_name: Name::from_str("Derp").unwrap(),
        }),
        ..IdentityDataUpdate::default()
    };
    let uvw = UserVaultWrapper::lock_for_onboarding(conn, &su.id).unwrap();
    uvw.update_identity_data(conn, update, vec![]).unwrap();
    // Get the ssn4 as was written by tenant 1
    let uvw = UserVaultWrapper::build(conn, UvwArgs::Onboarding(&su.id)).unwrap();
    let ssn4_tenant1 = uvw.get_e_field(DataLifetimeKind::Ssn4);
    assert!(!uvw.has_field(DataLifetimeKind::Ssn9));

    // Add speculative ssn9 by tenant 2
    let update = Ssn::Ssn9(Ssn9::from_str("123121234").unwrap()).into();
    let uvw = UserVaultWrapper::lock_for_onboarding(conn, &su2.id).unwrap();
    uvw.update_identity_data(conn, update, vec![]).unwrap();
    // Get the ssn4 and ssn9 as written by tenant 2
    let uvw = UserVaultWrapper::build(conn, UvwArgs::Onboarding(&su2.id)).unwrap();
    let ssn4_tenant2 = uvw.get_e_field(DataLifetimeKind::Ssn4);
    let ssn9_tenant2 = uvw.get_e_field(DataLifetimeKind::Ssn9);
    assert_ne!(ssn4_tenant1, ssn4_tenant2);

    // Commit data for tenant2
    let uvw = UserVaultWrapper::lock_for_onboarding(conn, &su2.id).unwrap();
    uvw.commit_identity_data(conn).unwrap();

    // Commit data for tenant1 - the new ssn4 should _not_ be committed
    let uvw = UserVaultWrapper::lock_for_onboarding(conn, &su.id).unwrap();
    uvw.commit_identity_data(conn).unwrap();

    // Now, when getting committed data, we should still see the ssn9 added for tenant 2
    let uvw = UserVaultWrapper::build(conn, UvwArgs::User(&uv.id)).unwrap();
    assert_eq!(uvw.get_e_field(DataLifetimeKind::Ssn4), ssn4_tenant2);
    assert_eq!(uvw.get_e_field(DataLifetimeKind::Ssn9), ssn9_tenant2);
    // But, we should still have the name that was committed by tenant 1
    assert!(uvw.has_field(DataLifetimeKind::FirstName));
    assert!(uvw.has_field(DataLifetimeKind::LastName));
}

#[db_test]
fn test_uvw_replace_address_line2(conn: &mut TestPgConnection) {
    let uv = fixtures::user_vault::create(conn);
    let tenant = fixtures::tenant::create(conn);
    let ob_config = fixtures::ob_configuration::create(conn, &tenant.id);
    let su = fixtures::scoped_user::create(conn, &uv.id, &ob_config.id);

    let updates = vec![
        // Partial address
        FullAddressOrZip::ZipAndCountry(ZipAndCountry {
            zip: Zip::try_from("94117".to_owned()).unwrap(),
            country: Country::try_from("US".to_owned()).unwrap(),
        }),
        // Full address with line2
        FullAddressOrZip::Address(Address {
            line1: AddressLine::try_from("Flerp".to_owned()).unwrap(),
            line2: Some(AddressLine::try_from("Flerp".to_owned()).unwrap()),
            city: City::try_from("San Francisco".to_owned()).unwrap(),
            state: State::try_from("CA".to_owned()).unwrap(),
            zip: Zip::try_from("94117".to_owned()).unwrap(),
            country: Country::try_from("US".to_owned()).unwrap(),
        }),
        // Full address without line2
        FullAddressOrZip::Address(Address {
            line1: AddressLine::try_from("Flerp".to_owned()).unwrap(),
            line2: None,
            city: City::try_from("San Francisco".to_owned()).unwrap(),
            state: State::try_from("CA".to_owned()).unwrap(),
            zip: Zip::try_from("94117".to_owned()).unwrap(),
            country: Country::try_from("US".to_owned()).unwrap(),
        }),
    ];

    for update in updates {
        let uvw = UserVaultWrapper::lock_for_onboarding(conn, &su.id).unwrap();
        uvw.update_identity_data(conn, update.into(), vec![]).unwrap();
    }
    let uvw = UserVaultWrapper::build(conn, UvwArgs::Onboarding(&su.id)).unwrap();
    assert!(uvw.has_field(DataLifetimeKind::AddressLine1));
    // We should have cleared out line2 in the last update
    assert!(!uvw.has_field(DataLifetimeKind::AddressLine2));
    assert!(uvw.has_field(DataLifetimeKind::City));
    assert!(uvw.has_field(DataLifetimeKind::State));
    assert!(uvw.has_field(DataLifetimeKind::Zip));
    assert!(uvw.has_field(DataLifetimeKind::Country));
}

#[db_test]
fn test_commit_custom_data(conn: &mut TestPgConnection) {
    // We haven't figured out the portability story for custom data or identity documents yet, so
    // for now, let's make sure we never commit them through the UVW
    let uv = fixtures::user_vault::create(conn);
    let tenant = fixtures::tenant::create(conn);
    let ob_config = fixtures::ob_configuration::create(conn, &tenant.id);
    let su = fixtures::scoped_user::create(conn, &uv.id, &ob_config.id);

    let k1 = KvDataKey::from_str("blerp").unwrap();
    let k2 = KvDataKey::from_str("flerp").unwrap();

    // Add some custom data
    let uvw = UserVaultWrapper::lock_for_onboarding(conn, &su.id).unwrap();
    let custom_data = HashMap::from_iter([
        (k1.clone(), PiiString::from("BLERP")),
        (k2.clone(), PiiString::from("FLERP")),
    ]);
    uvw.update_custom_data(conn, custom_data).unwrap();

    // Update k1 and make sure only it changed
    let uvw = UserVaultWrapper::lock_for_onboarding(conn, &su.id).unwrap();
    let v1 = uvw.kv_data().get(&k1).unwrap().e_data.clone();
    let v2 = uvw.kv_data().get(&k2).unwrap().e_data.clone();
    let custom_data = HashMap::from_iter([(k1.clone(), PiiString::from("MERP"))]);
    uvw.update_custom_data(conn, custom_data).unwrap();

    let uvw = UserVaultWrapper::lock_for_onboarding(conn, &su.id).unwrap();
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
    let uvw = UserVaultWrapper::lock_for_onboarding(conn, &su.id).unwrap();
    let newest_v1 = uvw.kv_data().get(&k1).unwrap().e_data.clone();
    let newest_v2 = uvw.kv_data().get(&k2).unwrap().e_data.clone();
    assert_ne!(newest_v1, new_v1);
    assert_ne!(newest_v2, new_v2);
}

#[db_test]
fn test_dont_commit_custom_data_or_id_docs(conn: &mut TestPgConnection) {
    // We haven't figured out the portability story for custom data or identity documents yet, so
    // for now, let's make sure we never commit them through the UVW
    let uv = fixtures::user_vault::create(conn);
    let tenant = fixtures::tenant::create(conn);
    let ob_config = fixtures::ob_configuration::create(conn, &tenant.id);
    let su = fixtures::scoped_user::create(conn, &uv.id, &ob_config.id);

    // Add some identity data
    let update = IdentityDataUpdate {
        ssn: Some(Ssn::Ssn4(Ssn4::from_str("0987").unwrap())),
        ..IdentityDataUpdate::default()
    };
    let uvw = UserVaultWrapper::lock_for_onboarding(conn, &su.id).unwrap();
    uvw.update_identity_data(conn, update, vec![]).unwrap();

    // Also add an identity document
    fixtures::identity_document::create(conn, &uv.id, Some(&su.id));

    // Also add some custom data
    let custom_data = HashMap::from_iter([
        (KvDataKey::from_str("blerp").unwrap(), PiiString::from("BLERP")),
        (KvDataKey::from_str("flerp").unwrap(), PiiString::from("FLERP")),
    ]);
    let uvw = UserVaultWrapper::lock_for_onboarding(conn, &su.id).unwrap();
    uvw.update_custom_data(conn, custom_data).unwrap();

    // Commit the identity data
    let uvw = UserVaultWrapper::lock_for_onboarding(conn, &su.id).unwrap();
    uvw.commit_identity_data(conn).unwrap();

    // Build a map map of DataLifetimeKind -> CommittedCounts
    struct CommittedCounts {
        committed: usize,
        not_committed: usize,
    }
    let kind_to_counts = DataLifetime::get_active(conn, &uv.id, Some(&su.id), None)
        .unwrap()
        .into_iter()
        .into_group_map_by(|dl| dl.kind)
        .into_iter()
        .map(|(kind, v)| {
            let (committed, not_committed): (Vec<_>, _) = v
                .into_iter()
                .map(|dl| dl.committed_at.is_some())
                .partition(|x| *x);
            let counts = CommittedCounts {
                committed: committed.len(),
                not_committed: not_committed.len(),
            };
            (kind, counts)
        })
        .collect::<HashMap<_, _>>();

    // Assert all custom DLs are not committed
    let custom = kind_to_counts.get(&DataLifetimeKind::Custom).unwrap();
    assert_eq!(custom.committed, 0);
    assert_eq!(custom.not_committed, 2);

    // Assert identity doc DL is not committed
    let id_doc = kind_to_counts.get(&DataLifetimeKind::IdentityDocument).unwrap();
    assert_eq!(id_doc.committed, 0);
    assert_eq!(id_doc.not_committed, 1);

    // But identity data should be committed
    let ssn4 = kind_to_counts.get(&DataLifetimeKind::Ssn4).unwrap();
    assert_eq!(ssn4.committed, 1);
    assert_eq!(ssn4.not_committed, 0);
}
