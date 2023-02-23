use newtypes::{Locked, PersonVaultDataKind, SealedVaultBytes};

use db::{
    models::{
        data_lifetime::DataLifetime,
        ob_configuration::ObConfiguration,
        scoped_user::ScopedUser,
        tenant::Tenant,
        user_vault::UserVault,
        user_vault_data::{NewPersonVaultData, UserVaultData},
    },
    tests::prelude::TestPgConn,
};

use crate::utils::user_vault_wrapper::{UserVaultWrapper, UvwArgs};
pub type UvwSetup = (
    ScopedUser,
    ObConfiguration,
    UserVaultWrapper,
    Tenant,
    Locked<UserVault>,
);
pub fn create(conn: &mut TestPgConn, uv_is_live: bool) -> UvwSetup {
    let uv = db::tests::fixtures::user_vault::create(conn, uv_is_live);
    let tenant = db::tests::fixtures::tenant::create(conn);
    let ob_config = db::tests::fixtures::ob_configuration::create(conn, &tenant.id, uv_is_live);
    let su = db::tests::fixtures::scoped_user::create(conn, &uv.id, &ob_config.id);

    // Add identity data
    let data = vec![
        NewPersonVaultData {
            kind: PersonVaultDataKind::FirstName,
            e_data: SealedVaultBytes(vec![1]),
        },
        NewPersonVaultData {
            kind: PersonVaultDataKind::LastName,
            e_data: SealedVaultBytes(vec![2]),
        },
        NewPersonVaultData {
            kind: PersonVaultDataKind::Ssn4,
            e_data: SealedVaultBytes(vec![3]),
        },
    ];
    let seqno = DataLifetime::get_next_seqno(conn).unwrap();
    UserVaultData::bulk_create(conn, &uv.id, Some(&su.id), data, seqno).unwrap();

    // Create email
    db::tests::fixtures::email::create(conn, &uv.id, &su.id, seqno);

    // Create phone number
    db::tests::fixtures::phone_number::create(conn, &uv.id, Some(&su.id));

    (
        su.clone(),
        ob_config,
        UserVaultWrapper::build(conn, UvwArgs::Tenant(&su.id)).unwrap(),
        tenant,
        uv,
    )
}
