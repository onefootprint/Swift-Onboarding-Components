use super::LockedTenantUvw;
use super::TenantUvw;
use super::UserVaultWrapper;
use crate::errors::ApiResult;
use crate::utils::user_vault_wrapper::UvwArgs;
use db::models::data_lifetime::DataLifetime;
use db::models::email::Email;
use db::models::identity_document::IdentityDocument;
use db::models::kv_data::KeyValueData;
use db::models::phone_number::PhoneNumber;
use db::models::scoped_user::ScopedUser;
use db::models::user_vault::UserVault;
use db::models::user_vault_data::UserVaultData;
use db::HasLifetime;
use db::PgConnection;
use db::TxnPgConnection;
use newtypes::{ScopedUserId, TenantId};

impl UserVaultWrapper {
    /// Builds a locked UVW that sees committed data AND speculative data for the tenant.
    /// This should be used during onboarding operations in order to allow the tenant to see
    /// uncommitted data that has been added by previous operations
    pub fn lock_for_onboarding(
        conn: &mut TxnPgConnection,
        scoped_user_id: &ScopedUserId,
    ) -> ApiResult<LockedTenantUvw> {
        // Lock the UserVault in this transaction, then build the UVW
        UserVault::lock_by_scoped_user(conn, scoped_user_id)?;
        let uvw = Self::build(conn, UvwArgs::Onboarding(scoped_user_id))?;
        let ob_uvw = TenantUvw {
            uvw,
            scoped_user_id: scoped_user_id.clone(),
        };
        Ok(LockedTenantUvw::new(ob_uvw))
    }
}

impl UserVaultWrapper {
    pub fn build_for_tenant(conn: &mut PgConnection, su_id: &ScopedUserId) -> ApiResult<TenantUvw> {
        let uvw = Self::build(conn, UvwArgs::Tenant(su_id))?;
        Ok(TenantUvw {
            uvw,
            scoped_user_id: su_id.clone(),
        })
    }

    // TODO: TENANT ACCESS
    // In order to minimize database queries, we would like to be able to bulk fetch
    // various data elements for a set of Users.
    // Note: it is possible that there are multiple scoped users for each user vault
    pub fn multi_get_for_tenant(
        conn: &mut PgConnection,
        users: Vec<(ScopedUser, UserVault)>,
        tenant_id: &TenantId,
    ) -> ApiResult<Vec<TenantUvw>> {
        let uv_ids: Vec<_> = users.iter().map(|(_, uv)| &uv.id).collect();
        let uv_id_to_active_lifetimes =
            DataLifetime::get_bulk_active_for_tenant(conn, uv_ids.clone(), tenant_id)?;
        let active_lifetime_list: Vec<_> = uv_id_to_active_lifetimes.values().flatten().collect();

        // For each data source, fetch data _for all users_ in the `user_vaults` list.
        // We then build a HashMap of UserVaultId -> Data object in order to build our final
        // UserVaultWrapper for each User
        let uvds = UserVaultData::bulk_get(conn, &active_lifetime_list)?;
        let phone_numbers = PhoneNumber::bulk_get(conn, &active_lifetime_list)?;
        let emails = Email::bulk_get(conn, &active_lifetime_list)?;
        let identity_document_map = IdentityDocument::bulk_get(conn, &active_lifetime_list)?;
        let kv_data_map = KeyValueData::bulk_get(conn, &active_lifetime_list)?;

        // Map over our UserVaults, assembling the UserVaultWrappers from the data we fetched above
        let results = users
            .into_iter()
            .map(move |(su, uv)| {
                let uv_id = uv.id.clone();
                let uvw = Self::build_internal(
                    uv,
                    None,
                    // Fetch data by UserVaultId. It is possible that multiple ScopedUsers have the
                    // same UserVaultId.
                    // TODO: all of these should really be keyed on ScopedUserId, otherwise
                    // speculative data for ScopedUser A will show for ScopedUser B within the same
                    // tenant
                    uvds.get(&uv_id).cloned().unwrap_or_default(),
                    phone_numbers.get(&uv_id).cloned().unwrap_or_default(),
                    emails.get(&uv_id).cloned().unwrap_or_default(),
                    // TODO  We never show custom data or id docs in the user list table, no need to fetch here really
                    identity_document_map.get(&uv_id).cloned().unwrap_or_default(),
                    kv_data_map.get(&uv_id).cloned().unwrap_or_default(),
                    uv_id_to_active_lifetimes.get(&uv_id).cloned().unwrap_or_default(),
                )?;
                let uvw = TenantUvw {
                    uvw,
                    scoped_user_id: su.id,
                };
                Ok(uvw)
            })
            .collect::<ApiResult<_>>()?;
        Ok(results)
    }
}
