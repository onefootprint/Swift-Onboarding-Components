use crate::errors::DbError;
use crate::models::tenant_api_keys::*;
use crate::models::tenants::*;
use crate::schema;
use crate::DbPool;
use diesel::prelude::*;
use newtypes::TenantId;

pub async fn get_opt_by_workos_profile_id(
    pool: &DbPool,
    workos_profile_id: String,
) -> Result<Option<Tenant>, DbError> {
    let tenant = pool
        .db_query(move |conn| -> Result<_, DbError> {
            let tenant: Option<Tenant> = schema::tenants::table
                .filter(schema::tenants::workos_admin_profile_id.eq(workos_profile_id))
                .first(conn)
                .optional()?;
            Ok(tenant)
        })
        .await??;

    Ok(tenant)
}

pub async fn get_opt_by_workos_org_id(
    pool: &DbPool,
    workos_org_id: String,
) -> Result<Option<Tenant>, DbError> {
    let tenant = pool
        .db_query(move |conn| -> Result<_, DbError> {
            let tenant: Option<Tenant> = schema::tenants::table
                .filter(schema::tenants::workos_id.eq(workos_org_id))
                .first(conn)
                .optional()?;
            Ok(tenant)
        })
        .await??;

    Ok(tenant)
}

pub async fn get_tenant(pool: &DbPool, tenant_id: TenantId) -> Result<Tenant, DbError> {
    let tenant: Tenant = pool
        .db_query(move |conn| {
            schema::tenants::table
                .filter(schema::tenants::id.eq(tenant_id))
                .first(conn)
        })
        .await??;

    Ok(tenant)
}

pub async fn api_init(
    pool: &DbPool,
    tenant_api: PartialTenantApiKey,
    sh_api_key: Vec<u8>,
    e_api_key: Vec<u8>,
) -> Result<TenantApiKey, DbError> {
    let new_tenant_api_key = NewTenantApiKey {
        tenant_id: tenant_api.tenant_id,
        key_name: tenant_api.key_name,
        sh_secret_api_key: sh_api_key,
        is_enabled: true,
        e_secret_api_key: e_api_key,
        is_live: tenant_api.is_live,
    };
    let tenant_api_key = pool
        .db_query(move |conn| {
            diesel::insert_into(schema::tenant_api_keys::table)
                .values(&new_tenant_api_key)
                .get_result::<TenantApiKey>(conn)
        })
        .await??;

    Ok(tenant_api_key)
}

pub async fn secret_auth(
    pool: &DbPool,
    sh_api_key: Vec<u8>,
) -> Result<Option<(Tenant, TenantApiKey)>, DbError> {
    let result = pool
        .db_query(move |conn| -> Result<Option<(Tenant, TenantApiKey)>, DbError> {
            let result: Option<(Tenant, TenantApiKey)> = schema::tenants::table
                .inner_join(schema::tenant_api_keys::table)
                .filter(schema::tenant_api_keys::sh_secret_api_key.eq(sh_api_key))
                .first(conn)
                .optional()?;
            Ok(result)
        })
        .await??;

    Ok(result)
}
