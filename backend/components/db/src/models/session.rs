use crate::schema::session;
use chrono::{DateTime, Utc};
use diesel::prelude::*;
use diesel::{Insertable, Queryable};
use newtypes::AuthTokenHash;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable)]
#[diesel(table_name = session)]
pub struct Session {
    pub key: AuthTokenHash,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub expires_at: DateTime<Utc>,
    pub data: Vec<u8>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[diesel(table_name = session)]
pub struct UpdateSession {
    pub key: AuthTokenHash,
    pub data: Vec<u8>,
    pub expires_at: DateTime<Utc>,
}

impl Session {
    pub fn get(conn: &mut PgConnection, key: AuthTokenHash) -> Result<Option<Session>, crate::DbError> {
        let session = session::table
            .filter(session::key.eq(key))
            .first::<Session>(conn)
            .optional()?;
        // check session expiration every time we get session
        if let Some(session) = &session {
            let now = Utc::now();
            if session.expires_at <= now {
                return Ok(None);
            }
        }
        Ok(session)
    }

    pub fn update_or_create(
        conn: &mut PgConnection,
        key: AuthTokenHash,
        data: Vec<u8>,
        expires_at: DateTime<Utc>,
    ) -> Result<Session, crate::DbError> {
        let session = UpdateSession {
            key,
            data,
            expires_at,
        };
        let session = diesel::insert_into(session::table)
            .values(&session)
            .on_conflict(session::key)
            .do_update()
            .set((
                session::data.eq(&session.data),
                session::expires_at.eq(&session.expires_at),
            ))
            .get_result::<Session>(conn)?;
        Ok(session)
    }
}
