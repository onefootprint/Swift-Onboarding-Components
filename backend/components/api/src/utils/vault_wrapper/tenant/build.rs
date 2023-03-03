use super::TenantUvw;
use super::{Person, VaultWrapper};
use crate::errors::ApiResult;
use crate::utils::vault_wrapper::VwArgs;
use db::models::data_lifetime::DataLifetime;
use db::models::email::Email;
use db::models::identity_document::IdentityDocumentAndRequest;
use db::models::kv_data::KeyValueData;
use db::models::onboarding::Onboarding;
use db::models::phone_number::PhoneNumber;
use db::models::scoped_user::ScopedUser;
use db::models::user_vault::UserVault;
use db::models::user_vault_data::UserVaultData;
use db::HasLifetime;
use db::PgConn;
use newtypes::{ScopedUserId, TenantId};
use std::collections::HashMap;

impl VaultWrapper<Person> {
    pub fn build_for_tenant(conn: &mut PgConn, su_id: &ScopedUserId) -> ApiResult<TenantUvw> {
        let uvw = Self::build(conn, VwArgs::Tenant(su_id))?;
        let onboarding = Onboarding::bulk_get_for_users(conn, vec![su_id])?.remove(su_id);
        Ok(TenantUvw {
            uvw,
            scoped_user_id: su_id.clone(),
            onboarding,
        })
    }

    // In order to minimize database queries, we would like to be able to bulk fetch
    // various data elements for a set of Users.
    // Note: it is possible that there are multiple scoped users for each user vault
    #[tracing::instrument(skip_all)]
    pub fn multi_get_for_tenant(
        conn: &mut PgConn,
        users: Vec<(ScopedUser, UserVault)>,
        tenant_id: &TenantId,
    ) -> ApiResult<HashMap<ScopedUserId, TenantUvw>> {
        let uv_ids: Vec<_> = users.iter().map(|(_, uv)| &uv.id).collect();
        let uv_id_to_active_lifetimes =
            DataLifetime::get_bulk_active_for_tenant(conn, uv_ids.clone(), tenant_id)?;
        let active_lifetime_list: Vec<_> = uv_id_to_active_lifetimes.values().flatten().collect();

        // For each data source, fetch data _for all users_ in the `user_vaults` list.
        // We then build a HashMap of UserVaultId -> Data object in order to build our final
        // VaultWrapper for each User
        let uvds = UserVaultData::bulk_get(conn, &active_lifetime_list)?;
        let phone_numbers = PhoneNumber::bulk_get(conn, &active_lifetime_list)?;
        let emails = Email::bulk_get(conn, &active_lifetime_list)?;
        let identity_document_map = IdentityDocumentAndRequest::bulk_get(conn, &active_lifetime_list)?;
        let kv_data_map = KeyValueData::bulk_get(conn, &active_lifetime_list)?;
        let scoped_user_ids = users.iter().map(|(su, _)| &su.id).collect();
        let onboarding_map = Onboarding::bulk_get_for_users(conn, scoped_user_ids)?;

        // Map over our UserVaults, assembling the VaultWrappers from the data we fetched above
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
                    identity_document_map.get(&uv_id).cloned().unwrap_or_default(),
                    kv_data_map.get(&uv_id).cloned().unwrap_or_default(),
                    uv_id_to_active_lifetimes.get(&uv_id).cloned().unwrap_or_default(),
                )?;
                let uvw = TenantUvw {
                    uvw,
                    scoped_user_id: su.id.clone(),
                    onboarding: onboarding_map.get(&su.id).cloned(),
                };
                Ok((su.id, uvw))
            })
            .collect::<ApiResult<_>>()?;
        Ok(results)
    }
}
