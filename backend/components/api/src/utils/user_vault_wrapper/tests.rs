use std::collections::HashMap;

// TODO put this somewhere else
use macros::db_test;
use newtypes::DataAttribute;
use newtypes::DataLifetimeId;
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
    let (uv, phone_number) = fixtures::user_vault::create(conn);
    let tenant = fixtures::tenant::create(conn);
    let su = fixtures::scoped_user::create(conn, &uv.id, &tenant.id);

    let mut data_kind_to_lifetime_id = HashMap::<DataAttribute, DataLifetimeId>::new();

    // Phone number created with user vault as the auth method
    data_kind_to_lifetime_id.insert(DataAttribute::PhoneNumber, phone_number.lifetime_id);

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
    data_kind_to_lifetime_id.insert(DataAttribute::Email, email.lifetime_id);

    // TODO fiddle with lifetimes to commit/deactivate data

    let uvw = UserVaultWrapper::get_for_tenant(conn, &su.id).unwrap();
    let tests = vec![
        (DataAttribute::FirstName, Some(SealedVaultBytes(vec![1]))),
        (DataAttribute::LastName, Some(SealedVaultBytes(vec![2]))),
        (DataAttribute::Ssn4, Some(SealedVaultBytes(vec![3]))),
        (DataAttribute::Email, Some(email.e_data)),
        (DataAttribute::PhoneNumber, Some(phone_number.e_e164.clone())),
        (DataAttribute::Dob, None),
        (DataAttribute::AddressLine1, None),
        (DataAttribute::AddressLine2, None),
        (DataAttribute::City, None),
        (DataAttribute::State, None),
        (DataAttribute::Zip, None),
        (DataAttribute::Country, None),
        (DataAttribute::Ssn9, None),
    ];
    for test in tests {
        let (attribute, expected_value) = test;
        assert_eq!(uvw.get_e_field(attribute), expected_value.as_ref());
    }

    // get_committed should only show the phone number
    let uvw = UserVaultWrapper::get_committed(conn, uv).unwrap();
    let tests = vec![
        (DataAttribute::FirstName, None),
        (DataAttribute::LastName, None),
        (DataAttribute::Ssn4, None),
        (DataAttribute::Email, None),
        (DataAttribute::PhoneNumber, Some(phone_number.e_e164)),
        (DataAttribute::Dob, None),
        (DataAttribute::AddressLine1, None),
        (DataAttribute::AddressLine2, None),
        (DataAttribute::City, None),
        (DataAttribute::State, None),
        (DataAttribute::Zip, None),
        (DataAttribute::Country, None),
        (DataAttribute::Ssn9, None),
    ];
    for test in tests {
        let (attribute, expected_value) = test;
        assert_eq!(uvw.get_e_field(attribute), expected_value.as_ref());
    }
}
