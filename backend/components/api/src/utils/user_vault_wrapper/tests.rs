use std::collections::HashMap;

// TODO put this somewhere else
use macros::db_test;
use newtypes::DataLifetimeId;
use newtypes::DataLifetimeKind;
use newtypes::SealedVaultBytes;

use db::models::data_lifetime::DataLifetime;
use db::models::user_vault_data::NewUserVaultData;
use db::models::user_vault_data::UserVaultData;
use db::tests::fixtures;
use db::tests::prelude::*;
use db::HasDataAttributeFields;
use newtypes::UvdKind;

use super::UserVaultWrapper;

#[db_test]
fn test_user_vault_wrapper(conn: &mut TestPgConnection) {
    let uv = fixtures::user_vault::create(conn);
    let tenant = fixtures::tenant::create(conn);
    let su = fixtures::scoped_user::create(conn, &uv.id, &tenant.id);

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

    let uvw = UserVaultWrapper::get_for_tenant(conn, &su.id).unwrap();
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

    // get_committed should only show the phone number
    let uvw = UserVaultWrapper::get_committed(conn, uv).unwrap();
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
