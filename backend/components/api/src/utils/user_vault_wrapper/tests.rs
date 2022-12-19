use std::collections::HashMap;

use super::UserVaultWrapper;
use crate::types::identity_data_request::IdentityDataUpdate;
use db::models::data_lifetime::DataLifetime;
use db::models::user_vault_data::NewUserVaultData;
use db::models::user_vault_data::UserVaultData;
use db::tests::fixtures;
use db::tests::prelude::*;
use db::HasDataAttributeFields;
use macros::db_test;
use newtypes::address::{Address, AddressLine, City, Country, FullAddressOrZip, State, Zip, ZipAndCountry};
use newtypes::dob::DateOfBirth;
use newtypes::email::Email;
use newtypes::DataLifetimeId;
use newtypes::DataLifetimeKind;
use newtypes::Fingerprint;
use newtypes::SealedVaultBytes;
use newtypes::{
    name::{FullName, Name},
    ssn::{Ssn, Ssn4, Ssn9},
    PiiString, UvdKind,
};
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
    let uvds = UserVaultData::bulk_create(conn, uv.id.clone(), Some(su.id.clone()), data, seqno).unwrap();
    for uvd in uvds {
        data_kind_to_lifetime_id.insert(uvd.kind.into(), uvd.lifetime_id);
    }

    // Create email
    let email = fixtures::email::create(conn, &uv.id, &su.id);
    data_kind_to_lifetime_id.insert(DataLifetimeKind::Email, email.lifetime_id);

    // Create phone number
    let phone_number = fixtures::phone_number::create(conn, &uv.id, Some(&su.id));
    data_kind_to_lifetime_id.insert(DataLifetimeKind::PhoneNumber, phone_number.lifetime_id);

    // TODO fiddle with lifetimes to commit/deactivate data

    let uvw = UserVaultWrapper::build_for_onboarding(conn, &su.id).unwrap();
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
    let uvw = UserVaultWrapper::build_for_user(conn, &uv.id).unwrap();
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
    let uvw = UserVaultWrapper::lock_for_tenant(conn, &su.id).unwrap();
    let email = Email::from_str("test@onefootprint.com").unwrap();
    uvw.add_email(conn, email, Fingerprint(vec![])).unwrap();

    // Add a name
    let uvw = UserVaultWrapper::lock_for_tenant(conn, &su.id).unwrap();
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
    let uvw = UserVaultWrapper::build_for_user(conn, &uv.id).unwrap();
    assert!(!uvw.has_field(DataLifetimeKind::FirstName));
    assert!(!uvw.has_field(DataLifetimeKind::LastName));
    assert!(!uvw.has_field(DataLifetimeKind::Email));

    // Commit
    let uvw = UserVaultWrapper::lock_for_tenant(conn, &su.id).unwrap();
    assert!(uvw.has_field(DataLifetimeKind::FirstName));
    assert!(uvw.has_field(DataLifetimeKind::LastName));
    assert!(uvw.has_field(DataLifetimeKind::Email));
    uvw.commit_data_for_tenant(conn).unwrap();

    // Now we should see the committed name and email
    let uvw = UserVaultWrapper::build_for_user(conn, &uv.id).unwrap();
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
        let uvw = UserVaultWrapper::lock_for_tenant(conn, su_id).unwrap();
        let result = uvw.update_identity_data(conn, update.clone(), vec![]);
        assert_eq!(result.is_ok(), is_allowed, "Incorrect status {}: {:?}", i, result);
    }
}

// might have to interleave onboardings tests for this
// fn test_uvw_commit_data_validation(conn: &mut TestPgConnection) {}
