use crate::errors::DbError;
use crate::models::tenant::*;
use crate::schema;
use crate::DbPool;
use diesel::prelude::*;

pub async fn get_opt_by_workos_profile_id(
    pool: &DbPool,
    workos_profile_id: String,
) -> Result<Option<Tenant>, DbError> {
    let tenant = pool
        .db_query(move |conn| -> Result<_, DbError> {
            let tenant: Option<Tenant> = schema::tenant::table
                .filter(schema::tenant::workos_admin_profile_id.eq(workos_profile_id))
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
            let tenant: Option<Tenant> = schema::tenant::table
                .filter(schema::tenant::workos_id.eq(workos_org_id))
                .first(conn)
                .optional()?;
            Ok(tenant)
        })
        .await??;

    Ok(tenant)
}
