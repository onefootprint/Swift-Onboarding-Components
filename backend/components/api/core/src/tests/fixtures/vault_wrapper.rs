use crate::utils::vault_wrapper::Person;
use crate::utils::vault_wrapper::VaultWrapper;
use crate::utils::vault_wrapper::VwArgs;
use db::models::data_lifetime::DataLifetime;
use db::models::ob_configuration::ObConfiguration;
use db::models::scoped_vault::ScopedVault;
use db::models::tenant::Tenant;
use db::models::vault::Vault;
use db::models::vault_data::NewVaultData;
use db::models::vault_data::VaultData;
use db::tests::prelude::TestPgConn;
use newtypes::DataLifetimeSource;
use newtypes::IdentityDataKind;
use newtypes::Locked;
use newtypes::SealedVaultBytes;
use newtypes::VaultDataFormat;

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
    let sv = db::tests::fixtures::scoped_vault::create(conn, &uv.id, &ob_config.id);
    let sv = ScopedVault::lock(conn, &sv.id).unwrap();

    // Add identity data
    let data = vec![
        NewVaultData {
            kind: IdentityDataKind::FirstName.into(),
            e_data: SealedVaultBytes(vec![1]),
            p_data: None,
            format: VaultDataFormat::String,
            origin_id: None,
            source: DataLifetimeSource::LikelyHosted,
        },
        NewVaultData {
            kind: IdentityDataKind::LastName.into(),
            e_data: SealedVaultBytes(vec![2]),
            p_data: None,
            format: VaultDataFormat::String,
            origin_id: None,
            source: DataLifetimeSource::LikelyHosted,
        },
        NewVaultData {
            kind: IdentityDataKind::Ssn4.into(),
            e_data: SealedVaultBytes(vec![3]),
            p_data: None,
            format: VaultDataFormat::String,
            origin_id: None,
            source: DataLifetimeSource::LikelyHosted,
        },
        NewVaultData {
            kind: IdentityDataKind::Email.into(),
            e_data: SealedVaultBytes(vec![4]),
            p_data: None,
            format: VaultDataFormat::String,
            origin_id: None,
            source: DataLifetimeSource::LikelyHosted,
        },
        NewVaultData {
            kind: IdentityDataKind::PhoneNumber.into(),
            e_data: SealedVaultBytes(vec![5]),
            p_data: None,
            format: VaultDataFormat::String,
            origin_id: None,
            source: DataLifetimeSource::LikelyHosted,
        },
    ];
    let sv_txn = DataLifetime::new_sv_txn(conn, &sv).unwrap();
    VaultData::bulk_create(conn, &sv_txn, data, None).unwrap();

    (
        sv.clone(),
        ob_config,
        VaultWrapper::build(conn, VwArgs::Tenant(&sv.id)).unwrap(),
        tenant,
        uv,
    )
}
