use crate::utils::db2api::DbToApi;
use db::models::tenant_api_key::TenantApiKey;
use db::models::tenant_role::TenantRole;
use newtypes::secret_api_key::SecretApiKey;
use newtypes::PiiString;

type DbTenantApiKey = (TenantApiKey, TenantRole, PiiString, Option<SecretApiKey>);

impl DbToApi<DbTenantApiKey> for api_wire_types::SecretApiKey {
    fn from_db((api_key, role, scrubbed_key, key): DbTenantApiKey) -> Self {
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
            scrubbed_key,
            created_at,
            status,
            last_used_at,
            role,
        }
    }
}
