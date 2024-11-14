use super::WriteableVw;
use crate::FpResult;
use db::models::data_lifetime::DataLifetime;
use db::models::scoped_vault::ScopedVault;
use db::models::scoped_vault_version::ScopedVaultVersion;
use db::TxnPgConn;
use newtypes::output::Csv;
use newtypes::DataIdentifier;
use newtypes::ScopedVaultVersionNumber;

pub struct DeleteDataResult {
    pub deleted_dis: Vec<DataIdentifier>,
    pub new_version: ScopedVaultVersionNumber,
}

impl<Type> WriteableVw<Type> {
    /// soft "delete" an entire scoped vault, but not the corresponding data lifetimes.
    #[tracing::instrument("WriteableVw::soft_delete_vault", skip_all)]
    pub fn soft_delete_vault(self, conn: &mut TxnPgConn) -> FpResult<()> {
        tracing::info!(
            scoped_vault_id = ?self.sv.id,
            "Deactivating entire scoped vault"
        );
        let _ = ScopedVault::deactivate(conn, &self.sv.id)?;

        Ok(())
    }

    /// soft "delete" vault data by deactivating the data-lifetimes to prevent access
    #[tracing::instrument("WriteableVw::soft_delete_vault_data", skip_all)]
    pub fn soft_delete_vault_data(
        // NOTE: VW becomes stale after this operation
        &self,
        conn: &mut TxnPgConn,
        dis: Vec<DataIdentifier>,
    ) -> FpResult<DeleteDataResult> {
        if dis.is_empty() {
            let latest_version = ScopedVaultVersion::latest_version_number(conn, &self.sv.id)?;

            return Ok(DeleteDataResult {
                deleted_dis: dis,
                new_version: latest_version,
            });
        }
        tracing::info!(dis=%Csv::from(dis.clone()), "Deactivating DIs");
        let (dis, dls) = dis
            .into_iter()
            .flat_map(|di| self.data(&di).map(|d| (di, d)))
            // To be extra safe, make sure this tenant added the data
            .filter(|(_, d)| d.lifetime.scoped_vault_id == self.sv.id)
            .map(|(di, d)| (di, d.lifetime.id.clone()))
            .unzip();

        let sv_txn = DataLifetime::new_sv_txn(conn, &self.sv)?;
        let (_, svv) = DataLifetime::bulk_deactivate(conn, &sv_txn, dls)?;

        Ok(DeleteDataResult {
            deleted_dis: dis,
            new_version: svv,
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::utils::vault_wrapper::Person;
    use crate::utils::vault_wrapper::VaultWrapper;
    use db::models::vault_data::NewVaultData;
    use db::models::vault_data::VaultData;
    use db::tests::prelude::*;
    use macros::db_test;
    use newtypes::DataLifetimeSource;
    use newtypes::IdentityDataKind as IDK;
    use newtypes::SealedVaultBytes;
    use newtypes::VaultDataFormat;

    #[db_test]
    fn test_soft_deletion(conn: &mut TestPgConn) {
        let tenant = fixtures::tenant::create(conn);
        let (_, ob_config) = fixtures::ob_configuration::create(conn, &tenant.id, true);

        let scoped_vaults: Vec<_> = (0..=1)
            .map(|_| {
                let uv = fixtures::vault::create_person(conn, true).into_inner();
                let sv = fixtures::scoped_vault::create(conn, &uv.id, &ob_config.id);
                let sv = ScopedVault::lock(conn, &sv.id).unwrap();

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
                        kind: IDK::Ssn4.into(),
                        e_data: SealedVaultBytes(vec![3]),
                        p_data: None,
                        format: VaultDataFormat::String,
                        origin_id: None,
                        source: DataLifetimeSource::LikelyHosted,
                    },
                ];
                let sv_txn = DataLifetime::new_sv_txn(conn, &sv).unwrap();
                VaultData::bulk_create(conn, &sv_txn, data, None).unwrap();
                sv
            })
            .collect();

        let vw1: WriteableVw<Person> = VaultWrapper::lock_for_onboarding(conn, &scoped_vaults[1].id).unwrap();

        // Delete a single field.
        assert!(vw1.get(&IDK::Ssn4.into()).is_some());
        vw1.soft_delete_vault_data(conn, vec![IDK::Ssn4.into()]).unwrap();
        // Refetch since the VW is stale.
        let vw1: WriteableVw<Person> = VaultWrapper::lock_for_onboarding(conn, &scoped_vaults[1].id).unwrap();
        assert!(vw1.get(&IDK::FirstName.into()).is_some());
        assert!(vw1.get(&IDK::Ssn4.into()).is_none());
        // The other scoped vault still works properly.
        let vw0: WriteableVw<Person> = VaultWrapper::lock_for_onboarding(conn, &scoped_vaults[0].id).unwrap();
        assert!(vw0.get(&IDK::FirstName.into()).is_some());
        assert!(vw0.get(&IDK::Ssn4.into()).is_some());
    }
}
