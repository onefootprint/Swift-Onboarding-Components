use chrono::DateTime;
use db::models::tenant_api_key::TenantApiKey;
use newtypes::secret_api_key::SecretApiKey;

use crate::utils::db2api::DbToApi;

type DbTenantApiKey = (TenantApiKey, Option<SecretApiKey>, Option<DateTime<chrono::Utc>>);

impl DbToApi<DbTenantApiKey> for api_wire_types::SecretApiKey {
    fn from_db(s: DbTenantApiKey) -> Self {
        let TenantApiKey {
            id,
            name,
            status,
            created_at,
            is_live,
            ..
        } = s.0;
        Self {
            id,
            name,
            is_live,
            key: s.1,
            created_at,
            status,
            last_used_at: s.2,
        }
    }
}
