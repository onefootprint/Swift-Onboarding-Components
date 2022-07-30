use crate::{schema::tenant_api_keys, DbError, DbPool};
use chrono::{DateTime, Utc};
use diesel::prelude::*;
use diesel::{Insertable, Queryable};
use newtypes::{ApiKeyStatus, Fingerprint, SealedVaultBytes, TenantApiKeyId, TenantId};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable)]
#[diesel(table_name = tenant_api_keys)]
pub struct TenantApiKey {
    pub id: TenantApiKeyId,
    pub sh_secret_api_key: Fingerprint,
    pub e_secret_api_key: SealedVaultBytes,
    pub tenant_id: TenantId,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub is_live: bool,
    pub status: ApiKeyStatus,
    pub name: String,
    pub created_at: DateTime<Utc>,
}

impl TenantApiKey {
    pub fn list(
        conn: &mut PgConnection,
        tenant_id: &TenantId,
        is_live: bool,
    ) -> Result<Vec<TenantApiKey>, DbError> {
        let results = tenant_api_keys::table
            .filter(tenant_api_keys::tenant_id.eq(tenant_id))
            .filter(tenant_api_keys::is_live.eq(is_live))
            .get_results(conn)?;
        Ok(results)
    }

    pub fn get(
        conn: &mut PgConnection,
        tenant_id: &TenantId,
        id: &TenantApiKeyId,
        is_live: bool,
    ) -> Result<TenantApiKey, DbError> {
        let result = tenant_api_keys::table
            .filter(tenant_api_keys::tenant_id.eq(tenant_id))
            .filter(tenant_api_keys::id.eq(id))
            .filter(tenant_api_keys::is_live.eq(is_live))
            .first(conn)?;
        Ok(result)
    }

    pub async fn create(
        pool: &DbPool,
        name: String,
        sh_secret_api_key: Fingerprint,
        e_secret_api_key: SealedVaultBytes,
        tenant_id: TenantId,
        is_live: bool,
    ) -> Result<TenantApiKey, DbError> {
        let new_key = NewTenantApiKey {
            name,
            sh_secret_api_key,
            e_secret_api_key,
            tenant_id,
            is_live,
            status: ApiKeyStatus::Enabled,
            created_at: Utc::now(),
        };
        let tenant_api_key = pool
            .db_query(move |conn| {
                diesel::insert_into(tenant_api_keys::table)
                    .values(new_key)
                    .get_result::<TenantApiKey>(conn)
            })
            .await??;

        Ok(tenant_api_key)
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable)]
#[diesel(table_name = tenant_api_keys)]
struct NewTenantApiKey {
    name: String,
    sh_secret_api_key: Fingerprint,
    e_secret_api_key: SealedVaultBytes,
    tenant_id: TenantId,
    is_live: bool,
    status: ApiKeyStatus,
    created_at: DateTime<Utc>,
}
