use super::TenantVw;
use super::VaultWrapper;
use crate::errors::ApiResult;
use crate::utils::vault_wrapper::VwArgs;
use db::models::data_lifetime::DataLifetime;
use db::models::document_data::DocumentData;
use db::models::scoped_vault::ScopedVault;
use db::models::vault::Vault;
use db::models::vault_data::VaultData;
use db::models::workflow::Workflow;
use db::HasLifetime;
use db::PgConn;
use itertools::Itertools;
use newtypes::{DataLifetimeSeqno, ScopedVaultId, TenantId};
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
        let vw = Self::build_inner(conn, sv_id, version, false)?;
        // For now, build the modern version of the VW that only shows DLs owned by the tenant
        // alongside the legacy version. Log when data doesn't match
        let modern_vw = Self::build_inner(conn, sv_id, version, true)?;
        compare_vws(&vw, &modern_vw);
        Ok(vw)
    }

    /// New view of a tenant's VW that only includes data owned by this tenant.
    /// This will one day replace build_for_tenant
    pub fn build_owned(conn: &mut PgConn, sv_id: &ScopedVaultId) -> ApiResult<TenantVw<Type>> {
        Self::build_inner(conn, sv_id, None, true)
    }

    pub fn build_inner(
        conn: &mut PgConn,
        sv_id: &ScopedVaultId,
        version: Option<DataLifetimeSeqno>,
        only_owned: bool,
    ) -> ApiResult<TenantVw<Type>> {
        let args = match (only_owned, version) {
            (true, Some(version)) => VwArgs::OwnedHistorical(sv_id, version),
            (true, None) => VwArgs::OwnedTenant(sv_id),
            (false, Some(version)) => VwArgs::Historical(sv_id, version),
            (false, None) => VwArgs::Tenant(sv_id),
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
        tenant_id: &TenantId,
        seqno: Option<DataLifetimeSeqno>,
    ) -> ApiResult<HashMap<ScopedVaultId, TenantVw<Type>>> {
        let uv_ids: Vec<_> = users.iter().map(|(_, uv)| &uv.id).collect();
        let uv_id_to_active_lifetimes =
            DataLifetime::get_bulk_active_for_tenant(conn, uv_ids.clone(), tenant_id, seqno)?;
        let active_lifetime_list: Vec<_> = uv_id_to_active_lifetimes.values().flatten().collect();

        // For each data source, fetch data _for all users_ in the `user_vaults` list.
        // We then build a HashMap of UserVaultId -> Data object in order to build our final
        // VaultWrapper for each User
        let vds = VaultData::bulk_get(conn, &active_lifetime_list)?;
        let document_datas = DocumentData::bulk_get(conn, &active_lifetime_list)?;
        let scoped_vault_ids = users.iter().map(|(sv, _)| &sv.id).collect();
        let workflows_map = Workflow::bulk_get_for_users(conn, scoped_vault_ids)?;

        // Map over our UserVaults, assembling the VaultWrappers from the data we fetched above
        let results = users
            .into_iter()
            .map(move |(sv, uv)| {
                let uv_id = uv.id.clone();
                let uvw = Self::build_internal(
                    uv,
                    None,
                    // Fetch data by UserVaultId.
                    vds.get(&uv_id).cloned().unwrap_or_default(),
                    document_datas.get(&uv_id).cloned().unwrap_or_default(),
                    uv_id_to_active_lifetimes.get(&uv_id).cloned().unwrap_or_default(),
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

#[tracing::instrument(skip_all)]
/// Short-term logic to compare two VWs
fn compare_vws<Type>(old: &TenantVw<Type>, new: &TenantVw<Type>) {
    if old.scoped_vault.id != new.scoped_vault.id {
        tracing::error!(sv_id=%old.scoped_vault.id, new_sv_id=%new.scoped_vault.id, "SV id doesn't match");
        return;
    }
    let old_dis = old
        .populated_dis()
        .into_iter()
        .filter(|di| old.can_see(di.clone()));
    let new_dis = new
        .populated_dis()
        .into_iter()
        .filter(|di| new.can_see(di.clone()));
    let dis = old_dis.chain(new_dis).unique().collect_vec();
    for di in dis {
        let Some(old_data) = old.get(di.clone()) else {
            tracing::error!(sv_id=%old.scoped_vault.id, %di, "Old VW missing DI");
            continue;
        };
        let Some(new_data) = new.get(di.clone()) else {
            tracing::error!(sv_id=%old.scoped_vault.id, %di, "New VW missing DI");
            continue;
        };
        if old_data.data() != new_data.data() {
            tracing::error!(sv_id=%old.scoped_vault.id, %di, old_data=?old_data.data(), new_data=?new_data.data(), "Data doesn't match");
        }
        if old_data.lifetime_id() != new_data.lifetime_id() {
            tracing::info!(di=%di, "VWs have different lifetime for the same DI");
        }
    }
}
