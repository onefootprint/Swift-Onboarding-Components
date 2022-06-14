use crate::errors::DbError;
use crate::models::onboardings::Onboarding;
use crate::schema;
use deadpool_diesel::postgres::Pool;
use diesel::prelude::*;
use newtypes::{FootprintUserId, ObConfigurationId, Status, TenantId, UserVaultId};

// lists all onboardings across all configurations
pub fn list_for_tenant(
    conn: &PgConnection,
    tenant_id: TenantId,
    status: Option<Status>,
    fingerprint: Option<Vec<u8>>,
) -> Result<Vec<Onboarding>, DbError> {
    let mut onboardings = schema::onboardings::table
        .left_join(
            schema::user_data::table
                .on(schema::user_data::user_vault_id.eq(schema::onboardings::user_vault_id)),
        )
        .filter(schema::onboardings::tenant_id.eq(tenant_id))
        .order_by(schema::onboardings::created_at.desc())
        .into_boxed();

    if let Some(status) = status {
        onboardings = onboardings.filter(schema::onboardings::status.eq(status))
    }

    if let Some(fingerprint) = fingerprint {
        onboardings = onboardings.filter(schema::user_data::sh_data.eq(fingerprint))
    }

    let onboardings = onboardings
        .select(schema::onboardings::all_columns)
        .distinct()
        .load(conn)?;
    Ok(onboardings)
}

pub(crate) fn get_for_fp_id(
    conn: &PgConnection,
    tenant_id: TenantId,
    footprint_user_id: FootprintUserId,
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
    id: ObConfigurationId,
    user_vault_id: UserVaultId,
) -> Result<Option<Onboarding>, DbError> {
    let conn = pool.get().await?;

    let ob = conn
        .interact(|conn| -> Result<Option<Onboarding>, DbError> {
            let ob = schema::onboardings::table
                .filter(schema::onboardings::ob_config_id.eq(id))
                .filter(schema::onboardings::user_vault_id.eq(user_vault_id))
                .first(conn)
                .optional()?;
            Ok(ob)
        })
        .await??;
    Ok(ob)
}
