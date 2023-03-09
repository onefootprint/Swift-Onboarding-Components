use newtypes::{IdentityDataKind, Locked, SealedVaultBytes};

use db::{
    models::{
        data_lifetime::DataLifetime,
        ob_configuration::ObConfiguration,
        scoped_user::ScopedUser,
        tenant::Tenant,
        vault::Vault,
        vault_data::{NewVaultData, VaultData},
    },
    tests::prelude::TestPgConn,
};

use crate::utils::vault_wrapper::{Person, VaultWrapper, VwArgs};

pub type VwSetup = (
    ScopedUser,
    ObConfiguration,
    VaultWrapper<Person>,
    Tenant,
    Locked<Vault>,
);

pub fn create(conn: &mut TestPgConn, uv_is_live: bool) -> VwSetup {
    let uv = db::tests::fixtures::vault::create_person(conn, uv_is_live);
    let tenant = db::tests::fixtures::tenant::create(conn);
    let ob_config = db::tests::fixtures::ob_configuration::create(conn, &tenant.id, uv_is_live);
    let su = db::tests::fixtures::scoped_user::create(conn, &uv.id, &ob_config.id);

    // Add identity data
    let data = vec![
        NewVaultData {
            kind: IdentityDataKind::FirstName,
            e_data: SealedVaultBytes(vec![1]),
        },
        NewVaultData {
            kind: IdentityDataKind::LastName,
            e_data: SealedVaultBytes(vec![2]),
        },
        NewVaultData {
            kind: IdentityDataKind::Ssn4,
            e_data: SealedVaultBytes(vec![3]),
        },
    ];
    let seqno = DataLifetime::get_next_seqno(conn).unwrap();
    VaultData::bulk_create(conn, &uv.id, Some(&su.id), data, seqno).unwrap();

    // Create email
    db::tests::fixtures::email::create(conn, &uv.id, &su.id, seqno);

    // Create phone number
    db::tests::fixtures::phone_number::create(conn, &uv.id, Some(&su.id));

    (
        su.clone(),
        ob_config,
        VaultWrapper::build(conn, VwArgs::Tenant(&su.id)).unwrap(),
        tenant,
        uv,
    )
}
