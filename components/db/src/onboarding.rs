use crate::errors::DbError;
use crate::models::onboardings::{NewOnboarding, Onboarding};
use crate::schema;
use deadpool_diesel::postgres::Pool;
use diesel::prelude::*;

pub async fn init_or_get_existing(
    pool: &Pool,
    new_onboarding: NewOnboarding,
) -> Result<Onboarding, DbError> {
    let conn = pool.get().await?;

    let (tenant_id, uv_id) = (
        new_onboarding.clone().tenant_id,
        new_onboarding.clone().user_vault_id,
    );

    // check if onboarding for tenant/user-vault already exists, if not init new
    let ob = conn
        .interact(move |conn| -> Result<Onboarding, DbError> {
            let existing_ob = schema::onboardings::table
                .filter(schema::onboardings::tenant_id.eq(&tenant_id))
                .filter(schema::onboardings::user_vault_id.eq(&uv_id))
                .first(conn)
                .optional()?;
            match existing_ob {
                Some(ob) => Ok(ob),
                None => {
                    let new_ob = diesel::insert_into(schema::onboardings::table)
                        .values(new_onboarding)
                        .get_result::<Onboarding>(conn)?;
                    Ok(new_ob)
                }
            }
        })
        .await??;
    Ok(ob)
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
