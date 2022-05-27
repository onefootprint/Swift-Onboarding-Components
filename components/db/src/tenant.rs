use crate::errors::DbError;
use crate::models::tenant_api_keys::*;
use crate::models::tenants::*;
use crate::schema;
use chrono::Utc;
use deadpool_diesel::postgres::Pool;
use diesel::prelude::*;
use newtypes::TenantId;

pub async fn init_or_get(pool: &Pool, new_tenant: NewTenant) -> Result<Tenant, DbError> {
    
    let conn = pool.get().await?;
    let workos_id = new_tenant.workos_id.clone();
    let tenant = conn.interact(move |conn| {
        get_opt_by_workos_id_sync(conn, workos_id)
    })
    .await??;

    match tenant {
        Some(tenant) => Ok(tenant),
        _ => {
            let tenant = conn
                .interact(move |conn| {
                    diesel::insert_into(schema::tenants::table)
                        .values(&new_tenant)
                        .get_result::<Tenant>(conn)
                })
            .await??;
            Ok(tenant)
        }
    }
}

pub async fn get_opt_by_workos_id(pool: &Pool, workos_id: String) -> Result<Option<Tenant>, DbError> {
    let conn = pool.get().await?;

    let tenant = conn.interact(move |conn| {
        get_opt_by_workos_id_sync(conn, workos_id)
    })
    .await??;

    Ok(tenant)
}

pub(crate) fn get_opt_by_workos_id_sync(conn: &PgConnection, workos_id: String) -> Result<Option<Tenant>, DbError> {

    let tenant : Option<Tenant> = schema::tenants::table
        .filter(schema::tenants::workos_id.eq(workos_id))
        .first(conn)
        .optional()?;

    Ok(tenant)
}

pub async fn get_tenant(pool: &Pool, tenant_id: TenantId) -> Result<Tenant, DbError> {
    let conn = pool.get().await?;

    let tenant: Tenant = conn
        .interact(move |conn| {
            schema::tenants::table
                .filter(schema::tenants::id.eq(tenant_id))
                .first(conn)
        })
        .await??;

    Ok(tenant)
}

pub async fn api_init(
    pool: &Pool,
    tenant_api: PartialTenantApiKey,
    sh_api_key: Vec<u8>,
    e_api_key: Vec<u8>,
) -> Result<TenantApiKey, DbError> {
    let conn = pool.get().await?;

    let now = Utc::now().naive_utc();

    let new_tenant_api_key = NewTenantApiKey {
        tenant_id: tenant_api.tenant_id,
        key_name: tenant_api.key_name,
        sh_secret_api_key: sh_api_key,
        is_enabled: true,
        created_at: now,
        updated_at: now,
        e_secret_api_key: e_api_key,
    };
    let tenant_api_key = conn
        .interact(move |conn| {
            diesel::insert_into(schema::tenant_api_keys::table)
                .values(&new_tenant_api_key)
                .get_result::<TenantApiKey>(conn)
        })
        .await??;

    Ok(tenant_api_key)
}

pub async fn pub_auth_check(pool: &Pool, tenant_pub_key: String) -> Result<TenantApiKey, DbError> {
    let conn = pool.get().await?;

    let tenant_api_key: TenantApiKey = conn
        .interact(move |conn| {
            schema::tenant_api_keys::table
                .filter(schema::tenant_api_keys::tenant_public_key.eq(tenant_pub_key))
                .first(conn)
        })
        .await??;

    Ok(tenant_api_key)
}

pub async fn pub_auth(pool: &Pool, tenant_pub_key: String) -> Result<Option<Tenant>, DbError> {
    let conn = pool.get().await?;

    let tenant = conn
        .interact(move |conn| -> Result<Option<Tenant>, DbError> {
            let tenant_api_key: Option<TenantApiKey> = schema::tenant_api_keys::table
                .filter(schema::tenant_api_keys::tenant_public_key.eq(tenant_pub_key))
                .first(conn)
                .optional()?;

            if let Some(tenant_api_key) = tenant_api_key {
                let tenant: Tenant = schema::tenants::table
                    .find(tenant_api_key.tenant_id)
                    .first(conn)?;

                Ok(Some(tenant))
            } else {
                Ok(None)
            }
        })
        .await??;

    Ok(tenant)
}

pub async fn secret_auth(pool: &Pool, sh_api_key: Vec<u8>) -> Result<Option<Tenant>, DbError> {
    let conn = pool.get().await?;

    let tenant = conn
        .interact(move |conn| -> Result<Option<Tenant>, DbError> {
            let tenant_api_key: Option<TenantApiKey> = schema::tenant_api_keys::table
                .filter(schema::tenant_api_keys::sh_secret_api_key.eq(sh_api_key))
                .first(conn)
                .optional()?;

            if let Some(tenant_api_key) = tenant_api_key {
                let tenant: Tenant = schema::tenants::table
                    .find(tenant_api_key.tenant_id)
                    .first(conn)?;

                Ok(Some(tenant))
            } else {
                Ok(None)
            }
        })
        .await??;

    Ok(tenant)
}
