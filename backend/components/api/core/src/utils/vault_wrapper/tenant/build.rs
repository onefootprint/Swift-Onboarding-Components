use super::TenantVw;
use super::VaultWrapper;
use crate::errors::ApiResult;
use crate::utils::vault_wrapper::VwArgs;
use db::models::data_lifetime::DataLifetime;
use db::models::document_data::DocumentData;
use db::models::onboarding::Onboarding;
use db::models::scoped_vault::ScopedVault;
use db::models::vault::Vault;
use db::models::vault_data::VaultData;
use db::HasLifetime;
use db::PgConn;
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
        let args = if let Some(version) = version {
            VwArgs::Historical(sv_id, version)
        } else {
            VwArgs::Tenant(sv_id)
        };
        let uvw = Self::build(conn, args)?;
        let onboarding = Onboarding::bulk_get_for_users(conn, vec![sv_id])?.remove(sv_id);
        let scoped_vault = ScopedVault::get(conn, sv_id)?;
        Ok(TenantVw {
            uvw,
            scoped_vault,
            onboarding,
        })
    }

    // In order to minimize database queries, we would like to be able to bulk fetch
    // various data elements for a set of Users.
    // Note: it is possible that there are multiple scoped users for each user vault
    // #[tracing::instrument(skip_all)]
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
        let scoped_vault_ids = users.iter().map(|(sv, _)| &sv.id).collect();
        let onboarding_map = Onboarding::bulk_get_for_users(conn, scoped_vault_ids)?;
        let document_datas = DocumentData::bulk_get_by_lifetime_ids(
            conn,
            active_lifetime_list.iter().map(|lt| &lt.id).collect(),
        )?;

        // Map over our UserVaults, assembling the VaultWrappers from the data we fetched above
        let results = users
            .into_iter()
            .map(move |(sv, uv)| {
                let uv_id = uv.id.clone();
                let uvw = Self::build_internal(
                    uv,
                    None,
                    // Fetch data by UserVaultId. It is possible that multiple ScopedUsers have the
                    // same UserVaultId.
                    // TODO: all of these should really be keyed on ScopedVaultId, otherwise
                    // speculative data for ScopedUser A will show for ScopedUser B within the same
                    // tenant
                    vds.get(&uv_id).cloned().unwrap_or_default(),
                    document_datas.get(&uv_id).cloned().unwrap_or_default(),
                    uv_id_to_active_lifetimes.get(&uv_id).cloned().unwrap_or_default(),
                )?;
                let sv_id = sv.id.clone();
                let uvw = TenantVw {
                    uvw,
                    onboarding: onboarding_map.get(&sv.id).cloned(),
                    scoped_vault: sv,
                };
                Ok((sv_id, uvw))
            })
            .collect::<ApiResult<_>>()?;
        Ok(results)
    }
}
