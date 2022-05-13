use crate::errors::DbError;
use crate::models::onboardings::Onboarding;
use crate::models::types::Status;
use crate::schema;
use deadpool_diesel::postgres::Pool;
use diesel::prelude::*;

pub async fn list_for_tenant(
    pool: &Pool,
    tenant_id: String,
    status: Option<Status>,
) -> Result<Vec<Onboarding>, DbError> {
    let conn = pool.get().await?;

    let onboardings = conn
        .interact(move |conn| -> Result<Vec<Onboarding>, DbError> {
            let mut onboardings = schema::onboardings::table
                .filter(schema::onboardings::tenant_id.eq(tenant_id))
                .order_by(schema::onboardings::created_at.desc())
                .into_boxed();

            if let Some(status) = status {
                onboardings = onboardings.filter(schema::onboardings::status.eq(status))
            }

            let onboardings = onboardings.load(conn)?;
            Ok(onboardings)
        })
        .await??;

    Ok(onboardings)
}

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
