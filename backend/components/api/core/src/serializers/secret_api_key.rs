use crate::utils::db2api::DbToApi;
use db::models::tenant_api_key::TenantApiKey;
use db::models::tenant_role::TenantRole;
use newtypes::secret_api_key::SecretApiKey;

type DbTenantApiKey = (TenantApiKey, TenantRole, Option<SecretApiKey>);

impl DbToApi<DbTenantApiKey> for api_wire_types::SecretApiKey {
    fn from_db((api_key, role, key): DbTenantApiKey) -> Self {
        let TenantApiKey {
            id,
            name,
            status,
            created_at,
            is_live,
            last_used_at,
            ..
        } = api_key;
        let role = api_wire_types::OrganizationRole::from_db(role);
        Self {
            id,
            name,
            is_live,
            key,
            created_at,
            status,
            last_used_at,
            role,
        }
    }
}
