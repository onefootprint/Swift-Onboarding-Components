use crate::{schema::tenant_api_keys, DbError, DbPool};
use chrono::{DateTime, Utc};
use diesel::prelude::*;
use diesel::{Insertable, Queryable};
use newtypes::{Fingerprint, SealedVaultBytes, TenantApiKeyId, TenantId};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable)]
#[diesel(table_name = tenant_api_keys)]
pub struct TenantApiKey {
    pub id: TenantApiKeyId,
    pub sh_secret_api_key: Fingerprint,
    pub e_secret_api_key: SealedVaultBytes,
    pub tenant_id: TenantId,
    pub is_enabled: bool,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub is_live: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable)]
#[diesel(table_name = tenant_api_keys)]
pub struct NewTenantApiKey {
    pub sh_secret_api_key: Fingerprint,
    pub e_secret_api_key: SealedVaultBytes,
    pub tenant_id: TenantId,
    pub is_enabled: bool,
    pub is_live: bool,
}

impl NewTenantApiKey {
    pub async fn create(self, pool: &DbPool) -> Result<TenantApiKey, DbError> {
        let tenant_api_key = pool
            .db_query(move |conn| {
                diesel::insert_into(tenant_api_keys::table)
                    .values(&self)
                    .get_result::<TenantApiKey>(conn)
            })
            .await??;

        Ok(tenant_api_key)
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[diesel(table_name = tenant_api_keys)]
pub struct PartialTenantApiKey {
    pub tenant_id: TenantId,
    pub is_live: bool,
}
