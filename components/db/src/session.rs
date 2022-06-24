use crate::errors::DbError;
use crate::models::sessions::Session;
use crate::schema;
use chrono::Utc;
use deadpool_diesel::postgres::Pool;
use diesel::prelude::*;
use newtypes::SessionAuthToken;

pub async fn get_session_by_primary_key(
    pool: &Pool,
    h_session_id: String,
) -> Result<Option<Session>, DbError> {
    let conn = pool.get().await?;

    conn.interact(move |conn| -> Result<Option<Session>, DbError> {
        let session: Option<Session> = schema::sessions::table
            .filter(schema::sessions::h_session_id.eq(h_session_id))
            .first(conn)
            .optional()?;

        Ok(session)
    })
    .await?
}

pub async fn get_session_by_auth_token(
    pool: &Pool,
    auth_token: SessionAuthToken,
) -> Result<Option<Session>, DbError> {
    let conn = pool.get().await?;

    conn.interact(move |conn| -> Result<Option<Session>, DbError> {
        get_session_by_auth_token_sync(conn, auth_token)
    })
    .await?
}

pub(crate) fn get_session_by_auth_token_sync(
    conn: &PgConnection,
    auth_token: SessionAuthToken,
) -> Result<Option<Session>, DbError> {
    let session: Option<Session> = schema::sessions::table
        .filter(schema::sessions::h_session_id.eq(auth_token.id()))
        .first(conn)
        .optional()?;

    //check cookie expiration every time we get session
    if let Some(session) = &session {
        let now = Utc::now().naive_utc();
        if session.expires_at <= now {
            return Ok(None);
        }
    }

    Ok(session)
}
