use super::TenantVw;
use super::VaultWrapper;
use crate::utils::vault_wrapper::VwArgs;
use crate::FpResult;
use db::models::data_lifetime::DataLifetime;
use db::models::document_data::DocumentData;
use db::models::scoped_vault::ScopedVault;
use db::models::vault::Vault;
use db::models::vault_data::VaultData;
use db::models::workflow::Workflow;
use db::HasLifetime;
use db::PgConn;
use itertools::Itertools;
use newtypes::DataLifetimeSeqno;
use newtypes::ScopedVaultId;
use std::collections::HashMap;

impl<Type> VaultWrapper<Type> {
    // TODO support building with any ScopedVaultIdentifier, like fp_id, is_live, and tenant_id
    pub fn build_for_tenant(conn: &mut PgConn, sv_id: &ScopedVaultId) -> FpResult<TenantVw<Type>> {
        let seqno = DataLifetime::get_current_seqno(conn)?;
        Self::build_for_tenant_version(conn, sv_id, seqno)
    }

    pub fn build_for_tenant_version(
        conn: &mut PgConn,
        sv_id: &ScopedVaultId,
        seqno: DataLifetimeSeqno,
    ) -> FpResult<TenantVw<Type>> {
        Self::build_inner(conn, sv_id, seqno)
    }

    pub fn build_for_tenant_maybe_version(
        conn: &mut PgConn,
        sv_id: &ScopedVaultId,
        seqno: Option<DataLifetimeSeqno>,
    ) -> FpResult<TenantVw<Type>> {
        if let Some(seqno) = seqno {
            Self::build_for_tenant_version(conn, sv_id, seqno)
        } else {
            Self::build_for_tenant(conn, sv_id)
        }
    }

    pub fn build_inner(
        conn: &mut PgConn,
        sv_id: &ScopedVaultId,
        seqno: DataLifetimeSeqno,
    ) -> FpResult<TenantVw<Type>> {
        let uvw = Self::build(conn, VwArgs::Historical(sv_id, seqno))?;
        let workflows = Workflow::bulk_get_for_users(conn, vec![sv_id])?
            .remove(sv_id)
            .unwrap_or_default();
        let scoped_vault = ScopedVault::get(conn, sv_id)?;
        Ok(TenantVw {
            uvw,
            scoped_vault,
            workflows,
        })
    }

    // In order to minimize database queries, we would like to be able to bulk fetch
    // various data elements for a set of Users.
    // Note: it is possible that there are multiple scoped users for each user vault
    #[tracing::instrument(skip_all)]
    pub fn multi_get_for_tenant(
        conn: &mut PgConn,
        users: Vec<(ScopedVault, Vault)>,
        seqno: Option<DataLifetimeSeqno>,
    ) -> FpResult<HashMap<ScopedVaultId, TenantVw<Type>>> {
        if users.is_empty() {
            return Ok(HashMap::new());
        }
        let sv_ids: Vec<_> = users.iter().map(|(sv, _)| &sv.id).collect();
        let current_seqno = DataLifetime::get_current_seqno(conn)?;
        let reconstruction_seqno = seqno.unwrap_or(current_seqno);
        let all_lifetimes = DataLifetime::bulk_get_active_at(conn, sv_ids.clone(), reconstruction_seqno)?;

        // For each data source, fetch data _for all users_ in the `user_vaults` list.
        // We then build a HashMap of UserVaultId -> Data object in order to build our final
        // VaultWrapper for each User
        let lifetime_ids: Vec<_> = all_lifetimes.iter().collect();
        let vds = VaultData::bulk_get(conn, &lifetime_ids)?;
        let document_datas = DocumentData::bulk_get(conn, &lifetime_ids)?;
        let workflows_map = Workflow::bulk_get_for_users(conn, sv_ids)?;

        let all_lifetimes = all_lifetimes
            .into_iter()
            .into_group_map_by(|l| l.vault_id.clone());

        // Map over our UserVaults, assembling the VaultWrappers from the data we fetched above
        let results = users
            .into_iter()
            .map(move |(sv, uv)| {
                let uv_id = uv.id.clone();
                let uvw = Self::build_internal(
                    uv,
                    reconstruction_seqno,
                    // Fetch data by UserVaultId.
                    vds.get(&uv_id).cloned().unwrap_or_default(),
                    document_datas.get(&uv_id).cloned().unwrap_or_default(),
                    all_lifetimes.get(&uv_id).cloned().unwrap_or_default(),
                    Some(sv.id.clone()),
                )?;
                let sv_id = sv.id.clone();
                let uvw = TenantVw {
                    uvw,
                    workflows: workflows_map.get(&sv.id).cloned().unwrap_or_default(),
                    scoped_vault: sv,
                };
                Ok((sv_id, uvw))
            })
            .collect::<FpResult<_>>()?;
        Ok(results)
    }
}
