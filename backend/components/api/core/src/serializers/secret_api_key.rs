use chrono::DateTime;
use db::models::{tenant_api_key::TenantApiKey, tenant_role::TenantRole};
use newtypes::secret_api_key::SecretApiKey;

use crate::utils::db2api::DbToApi;

type DbTenantApiKey = (
    TenantApiKey,
    TenantRole,
    Option<SecretApiKey>,
    Option<DateTime<chrono::Utc>>,
);

impl DbToApi<DbTenantApiKey> for api_wire_types::SecretApiKey {
    fn from_db((api_key, role, key, last_used_at): DbTenantApiKey) -> Self {
        let TenantApiKey {
            id,
            name,
            status,
            created_at,
            is_live,
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
