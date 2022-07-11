use crate::schema::sessions;
use crate::DbPool;
use chrono::{DateTime, Utc};
use diesel::prelude::*;
use diesel::{Insertable, Queryable};
use newtypes::{SealedSessionBytes, SessionAuthToken};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable)]
#[diesel(table_name = sessions)]
pub struct Session {
    pub h_session_id: String,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub expires_at: DateTime<Utc>,
    pub sealed_session_data: SealedSessionBytes,
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[diesel(table_name = sessions)]
pub struct NewSession {
    pub h_session_id: String,
    pub sealed_session_data: SealedSessionBytes,
    pub expires_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable, AsChangeset)]
#[diesel(table_name = sessions)]
pub struct UpdateSession {
    pub h_session_id: String,
    pub sealed_session_data: Option<SealedSessionBytes>,
    pub expires_at: Option<DateTime<Utc>>,
}

impl Session {
    pub fn create(
        conn: &mut PgConnection,
        sealed_session_data: SealedSessionBytes,
        expires_at: DateTime<Utc>,
    ) -> Result<(Session, SessionAuthToken), crate::DbError> {
        // create a token to identify session for future lookup
        let token = SessionAuthToken::generate();

        let session = NewSession {
            h_session_id: token.id(),
            sealed_session_data,
            expires_at,
        }
        .update_or_create(conn)?;
        Ok((session, token))
    }

    pub async fn update(
        pool: &DbPool,
        sealed_session_data: Option<SealedSessionBytes>,
        token: &SessionAuthToken,
        expires_at: Option<DateTime<Utc>>,
    ) -> Result<Session, crate::DbError> {
        let session = UpdateSession {
            h_session_id: token.id(),
            sealed_session_data,
            expires_at,
        }
        .update(pool)
        .await?;
        Ok(session)
    }
}

impl NewSession {
    pub fn update_or_create(self, conn: &mut PgConnection) -> Result<Session, crate::DbError> {
        let session = diesel::insert_into(sessions::table)
            .values(self.clone())
            .on_conflict(sessions::h_session_id)
            .do_update()
            .set((
                sessions::sealed_session_data.eq(self.sealed_session_data),
                sessions::expires_at.eq(self.expires_at),
            ))
            .get_result::<Session>(conn)?;
        Ok(session)
    }
}

impl UpdateSession {
    pub async fn update(self, pool: &DbPool) -> Result<Session, crate::DbError> {
        let session = pool
            .db_query(move |conn| {
                diesel::update(sessions::table)
                    .filter(sessions::h_session_id.eq(self.h_session_id.clone()))
                    .set(self)
                    .get_result::<Session>(conn)
            })
            .await??;
        Ok(session)
    }
}
