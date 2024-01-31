use super::{TenantVw, VaultWrapper};
use crate::{errors::ApiResult, utils::vault_wrapper::VwArgs};
use db::{
    models::{
        data_lifetime::DataLifetime, document_data::DocumentData, scoped_vault::ScopedVault, vault::Vault,
        vault_data::VaultData, workflow::Workflow,
    },
    HasLifetime, PgConn,
};
use itertools::Itertools;
use newtypes::{DataLifetimeSeqno, ScopedVaultId};
use std::collections::HashMap;

impl<Type> VaultWrapper<Type> {
    // TODO support building with any ScopedVaultIdentifier, like fp_id, is_live, and tenant_id
    pub fn build_for_tenant(conn: &mut PgConn, sv_id: &ScopedVaultId) -> ApiResult<TenantVw<Type>> {
        Self::build_for_tenant_version(conn, sv_id, None)
    }

    pub fn build_for_tenant_version(
        conn: &mut PgConn,
        sv_id: &ScopedVaultId,
        version: Option<DataLifetimeSeqno>,
    ) -> ApiResult<TenantVw<Type>> {
        Self::build_inner(conn, sv_id, version)
    }

    /// New view of a tenant's VW that only includes data owned by this tenant.
    /// This will one day replace build_for_tenant
    pub fn build_owned(conn: &mut PgConn, sv_id: &ScopedVaultId) -> ApiResult<TenantVw<Type>> {
        Self::build_inner(conn, sv_id, None)
    }

    pub fn build_inner(
        conn: &mut PgConn,
        sv_id: &ScopedVaultId,
        version: Option<DataLifetimeSeqno>,
    ) -> ApiResult<TenantVw<Type>> {
        let args = match version {
            Some(version) => VwArgs::Historical(sv_id, version),
            None => VwArgs::Tenant(sv_id),
        };
        let uvw = Self::build(conn, args)?;
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
    ) -> ApiResult<HashMap<ScopedVaultId, TenantVw<Type>>> {
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
                    Some(&sv.id),
                )?;
                let sv_id = sv.id.clone();
                let uvw = TenantVw {
                    uvw,
                    workflows: workflows_map.get(&sv.id).cloned().unwrap_or_default(),
                    scoped_vault: sv,
                };
                Ok((sv_id, uvw))
            })
            .collect::<ApiResult<_>>()?;
        Ok(results)
    }
}
