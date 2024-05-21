use super::WriteableVw;
use crate::errors::ApiResult;
use db::{
    models::{data_lifetime::DataLifetime, scoped_vault::ScopedVault},
    TxnPgConn,
};
use newtypes::{output::Csv, DataIdentifier};

impl<Type> WriteableVw<Type> {
    /// soft "delete" an entire scoped vault, but not the corresponding data lifetimes.
    #[tracing::instrument("WriteableVw::soft_delete_vault", skip_all)]
    pub fn soft_delete_vault(self, conn: &mut TxnPgConn) -> ApiResult<()> {
        tracing::info!(
            scoped_vault_id = ?self.scoped_vault_id,
            "Deactivating entire scoped vault"
        );
        let _ = ScopedVault::deactivate(conn, &self.scoped_vault_id)?;

        Ok(())
    }

    /// soft "delete" vault data by deactivating the data-lifetimes to prevent access
    #[tracing::instrument("WriteableVw::soft_delete_vault_data", skip_all)]
    pub fn soft_delete_vault_data(
        // NOTE: VW becomes stale after this operation
        &self,
        conn: &mut TxnPgConn,
        dis: Vec<DataIdentifier>,
    ) -> ApiResult<Vec<DataIdentifier>> {
        if dis.is_empty() {
            return Ok(dis);
        }
        tracing::info!(dis=%Csv::from(dis.clone()), "Deactivating DIs");
        let (dis, dls) = dis
            .into_iter()
            .flat_map(|di| self.data(&di).map(|d| (di, d)))
            // To be extra safe, make sure this tenant added the data
            .filter(|(_, d)| d.lifetime.scoped_vault_id == self.scoped_vault_id)
            .map(|(di, d)| (di, d.lifetime.id.clone()))
            .unzip();

        let seqno = DataLifetime::get_next_seqno(conn)?;
        let _ = DataLifetime::bulk_deactivate(conn, dls, seqno)?;

        Ok(dis)
    }
}

#[cfg(test)]
mod tests {
    use crate::utils::vault_wrapper::{Person, VaultWrapper};

    use super::*;
    use db::{
        models::vault_data::{NewVaultData, VaultData},
        tests::prelude::*,
    };
    use macros::db_test;
    use newtypes::{DataLifetimeSource, IdentityDataKind as IDK, SealedVaultBytes, VaultDataFormat};

    #[db_test]
    fn test_soft_deletion(conn: &mut TestPgConn) {
        let tenant = fixtures::tenant::create(conn);
        let ob_config = fixtures::ob_configuration::create(conn, &tenant.id, true);

        let scoped_vaults: Vec<_> = (0..=1)
            .map(|_| {
                let uv = fixtures::vault::create_person(conn, true).into_inner();
                let sv = fixtures::scoped_vault::create(conn, &uv.id, &ob_config.id);

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
                let seqno = DataLifetime::get_next_seqno(conn).unwrap();
                VaultData::bulk_create(conn, &uv.id, &sv.id, data, seqno, None).unwrap();
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
