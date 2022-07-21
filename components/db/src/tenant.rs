use crate::errors::DbError;
use crate::models::tenant_api_keys::*;
use crate::models::tenants::*;
use crate::schema;
use crate::DbPool;
use diesel::prelude::*;
use newtypes::Fingerprint;
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

pub async fn secret_auth(
    pool: &DbPool,
    sh_api_key: Fingerprint,
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
