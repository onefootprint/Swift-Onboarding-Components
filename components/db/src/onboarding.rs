use crate::errors::DbError;
use crate::models::onboardings::{NewOnboarding, Onboarding};
use crate::models::session_data::{OnboardingSessionData, SessionState};
use crate::schema;
use crate::session::get_session_by_id_sync;
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

pub async fn get_by_session_id(pool: &Pool, session_id: String) -> Result<Onboarding, DbError> {
    let conn = pool.get().await?;

    conn.interact(move |conn| -> Result<Onboarding, DbError> {
        get_onboarding_by_session_id_sync(conn, session_id)
    })
    .await?
}

pub(crate) fn get_onboarding_by_session_id_sync(
    conn: &mut PgConnection,
    session_id: String,
) -> Result<Onboarding, DbError> {
    let onboarding_session_data = get_onboarding_session_data_sync(conn, session_id)?;

    let id = match onboarding_session_data.user_ob_id {
        None => Err(DbError::InvalidSessionForOperation),
        Some(i) => Ok(i),
    }?;

    let onboarding: Onboarding = schema::onboardings::table
        .filter(schema::onboardings::user_ob_id.eq(id))
        .first(conn)?;

    Ok(onboarding)
}

pub(crate) fn get_onboarding_session_data_sync(
    conn: &mut PgConnection,
    session_id: String,
) -> Result<OnboardingSessionData, DbError> {
    let session = get_session_by_id_sync(conn, session_id)?;

    match session.session_data {
        SessionState::OnboardingSession(s) => Ok(s),
        _ => Err(DbError::InvalidSessionForOperation),
    }
}
