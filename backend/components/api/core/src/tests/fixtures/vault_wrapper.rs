use newtypes::{DataLifetimeSource, IdentityDataKind, Locked, SealedVaultBytes, VaultDataFormat};

use db::{
    models::{
        data_lifetime::DataLifetime,
        ob_configuration::ObConfiguration,
        scoped_vault::ScopedVault,
        tenant::Tenant,
        vault::Vault,
        vault_data::{NewVaultData, VaultData},
    },
    tests::prelude::TestPgConn,
};

use crate::utils::vault_wrapper::{Person, VaultWrapper, VwArgs};

#[allow(unused)]
pub type VwSetup = (
    ScopedVault,
    ObConfiguration,
    VaultWrapper<Person>,
    Tenant,
    Locked<Vault>,
);

#[allow(unused)]
pub fn create(conn: &mut TestPgConn, uv_is_live: bool) -> VwSetup {
    let uv = db::tests::fixtures::vault::create_person(conn, uv_is_live);
    let tenant = db::tests::fixtures::tenant::create(conn);
    let ob_config = db::tests::fixtures::ob_configuration::create(conn, &tenant.id, uv_is_live);
    let su = db::tests::fixtures::scoped_vault::create(conn, &uv.id, &ob_config.id);

    // Add identity data
    let data = vec![
        NewVaultData {
            kind: IdentityDataKind::FirstName.into(),
            e_data: SealedVaultBytes(vec![1]),
            p_data: None,
            format: VaultDataFormat::String,
            origin_id: None,
        },
        NewVaultData {
            kind: IdentityDataKind::LastName.into(),
            e_data: SealedVaultBytes(vec![2]),
            p_data: None,
            format: VaultDataFormat::String,
            origin_id: None,
        },
        NewVaultData {
            kind: IdentityDataKind::Ssn4.into(),
            e_data: SealedVaultBytes(vec![3]),
            p_data: None,
            format: VaultDataFormat::String,
            origin_id: None,
        },
        NewVaultData {
            kind: IdentityDataKind::Email.into(),
            e_data: SealedVaultBytes(vec![4]),
            p_data: None,
            format: VaultDataFormat::String,
            origin_id: None,
        },
        NewVaultData {
            kind: IdentityDataKind::PhoneNumber.into(),
            e_data: SealedVaultBytes(vec![5]),
            p_data: None,
            format: VaultDataFormat::String,
            origin_id: None,
        },
    ];
    let seqno = DataLifetime::get_next_seqno(conn).unwrap();
    let source = DataLifetimeSource::Unknown;
    VaultData::bulk_create(conn, &uv.id, &su.id, data, seqno, source, None).unwrap();

    (
        su.clone(),
        ob_config,
        VaultWrapper::build(conn, VwArgs::Tenant(&su.id)).unwrap(),
        tenant,
        uv,
    )
}
