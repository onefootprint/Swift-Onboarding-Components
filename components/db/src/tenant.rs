use crate::schema;
use diesel::prelude::*;
use deadpool_diesel::postgres::Pool;
use crate::models::tenant_api_keys::*;
use crate::models::tenants::*;
use crate::errors::DbError;
use chrono::Utc;
use crypto::sha256;

pub async fn init(pool: &Pool, new_tenant: NewTenant) -> Result<Tenant, DbError> {
    let conn = pool.get().await?;

    let tenant = conn.interact(move |conn| {
        diesel::insert_into(schema::tenants::table)
            .values(&new_tenant)
            .get_result::<Tenant>(conn)
    })
    .await??;

    Ok(tenant)
}

pub async fn api_init(pool: &Pool, tenant_api: PartialTenantApiKey, secret_api_key: String) -> Result<TenantApiKey, DbError> {
    let conn = pool.get().await?;

    // TODO, use hmac instead of sha256
    let sh_api_key = sha256(&secret_api_key.as_bytes());

    let now = Utc::now().naive_utc();

    let new_tenant_api_key = NewTenantApiKey {
        tenant_id: tenant_api.tenant_id,
        name: tenant_api.name,
        sh_api_key: sh_api_key.to_vec(),
        is_enabled: true,
        created_at: now,
        updated_at: now, 
    };
    let tenant_api_key = conn.interact(move |conn| {
        diesel::insert_into(schema::tenant_api_keys::table)
            .values(&new_tenant_api_key)
            .get_result::<TenantApiKey>(conn)
    })
    .await??;

    Ok(tenant_api_key)
}

pub async fn pub_auth_check(pool: &Pool, tenant_pub_key: String) -> Result<TenantApiKey, DbError> {
    let conn = pool.get().await?;

    let tenant_api_key : TenantApiKey = conn.interact(move |conn| {
        schema::tenant_api_keys::table.filter(
            schema::tenant_api_keys::api_key_id.eq(tenant_pub_key)).first(conn)
    })
    .await??;

    Ok(tenant_api_key)
}