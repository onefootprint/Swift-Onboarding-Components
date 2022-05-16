use crate::errors::DbError;
use crate::models::sessions::Session;
use crate::schema;
use chrono::{Duration, Utc};
use crypto::{hex::ToHex, sha256};
use deadpool_diesel::postgres::Pool;
use diesel::prelude::*;

pub async fn get_by_session_id(
    pool: &Pool,
    session_id: String,
) -> Result<Option<Session>, DbError> {
    let conn = pool.get().await?;

    conn.interact(move |conn| -> Result<Option<Session>, DbError> {
        get_session_by_id_sync(conn, session_id)
    })
    .await?
}

pub(crate) fn get_session_by_id_sync(
    conn: &mut PgConnection,
    session_id: String,
) -> Result<Option<Session>, DbError> {
    let h_session_id: String = sha256(session_id.as_bytes()).encode_hex();

    let session: Option<Session> = schema::sessions::table
        .filter(schema::sessions::h_session_id.eq(h_session_id))
        .first(conn)
        .optional()?;

    // check cookie expiration every time we get session
    // TODO set an expires_at timestamp rather than relying on created_at or updated_at
    // If we ever have sessions that are updated, we'll want to refresh their expiry
    if let Some(session) = &session {
        let now = Utc::now().naive_utc();
        if session.updated_at.signed_duration_since(now) > Duration::minutes(15) {
            return Ok(None);
        }
    }

    Ok(session)
}
