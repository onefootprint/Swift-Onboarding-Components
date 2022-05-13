use crate::models::sessions::Session;
use crate::schema;
use crate::{errors::DbError, models::sessions::UpdateSession};
use chrono::{Duration, Utc};
use crypto::{hex::ToHex, sha256};
use deadpool_diesel::postgres::Pool;
use diesel::prelude::*;

pub async fn get_by_session_id(pool: &Pool, session_id: String) -> Result<Session, DbError> {
    let conn = pool.get().await?;

    conn.interact(move |conn| -> Result<Session, DbError> {
        get_session_by_id_sync(conn, session_id)
    })
    .await?
}

pub async fn update(pool: &Pool, session: UpdateSession) -> Result<usize, DbError> {
    let conn = pool.get().await?;

    let size = conn
        .interact(move |conn| {
            diesel::update(
                schema::sessions::table
                    .filter(schema::sessions::h_session_id.eq(session.h_session_id.clone())),
            )
            .set(session)
            .execute(conn)
        })
        .await??;

    Ok(size)
}

pub(crate) fn get_session_by_id_sync(
    conn: &mut PgConnection,
    session_id: String,
) -> Result<Session, DbError> {
    let h_session_id: String = sha256(session_id.as_bytes()).encode_hex();

    let session: Session = schema::sessions::table
        .filter(schema::sessions::h_session_id.eq(h_session_id))
        .first(conn)?;

    // check cookie expiration every time we get session
    let now = Utc::now().naive_utc();
    if session.created_at.signed_duration_since(now) > Duration::minutes(15) {
        return Err(DbError::SessionExpired);
    }

    Ok(session)
}
