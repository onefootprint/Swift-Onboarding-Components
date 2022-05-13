use crate::errors::DbError;
use crate::models::onboardings::Onboarding;
use crate::schema;
use deadpool_diesel::postgres::Pool;
use diesel::prelude::*;

pub(crate) fn get_for_tenant(
    conn: &mut PgConnection,
    tenant_id: String,
    footprint_user_id: String,
) -> Result<Option<Onboarding>, DbError> {
    let ob = schema::onboardings::table
        .filter(schema::onboardings::tenant_id.eq(tenant_id))
        .filter(schema::onboardings::user_ob_id.eq(footprint_user_id))
        .first(conn)
        .optional()?;
    Ok(ob)
}

pub async fn get(
    pool: &Pool,
    tenant_id: String,
    user_vault_id: String,
) -> Result<Option<Onboarding>, DbError> {
    let conn = pool.get().await?;

    let ob = conn
        .interact(|conn| -> Result<Option<Onboarding>, DbError> {
            let ob = schema::onboardings::table
                .filter(schema::onboardings::tenant_id.eq(tenant_id))
                .filter(schema::onboardings::user_vault_id.eq(user_vault_id))
                .first(conn)
                .optional()?;
            Ok(ob)
        })
        .await??;
    Ok(ob)
}
