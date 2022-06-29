use crate::schema::sessions;
use crate::DbPool;
use chrono::NaiveDateTime;
use diesel::prelude::*;
use diesel::{Insertable, Queryable};
use newtypes::{SealedSessionBytes, SessionAuthToken};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable)]
#[table_name = "sessions"]
pub struct Session {
    pub h_session_id: String,
    pub _created_at: NaiveDateTime,
    pub _updated_at: NaiveDateTime,
    pub expires_at: NaiveDateTime,
    pub sealed_session_data: SealedSessionBytes,
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[table_name = "sessions"]
pub struct NewSession {
    pub h_session_id: String,
    pub sealed_session_data: SealedSessionBytes,
    pub expires_at: NaiveDateTime,
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable, AsChangeset)]
#[table_name = "sessions"]
pub struct UpdateSession {
    pub h_session_id: String,
    pub sealed_session_data: Option<SealedSessionBytes>,
    pub expires_at: Option<NaiveDateTime>,
}

impl Session {
    pub async fn create(
        pool: &DbPool,
        sealed_session_data: SealedSessionBytes,
        expires_at: NaiveDateTime,
    ) -> Result<(Session, SessionAuthToken), crate::DbError> {
        // create a token to identify session for future lookup
        let token = SessionAuthToken::generate();

        let session = NewSession {
            h_session_id: token.id(),
            sealed_session_data,
            expires_at,
        }
        .update_or_create(pool)
        .await?;
        Ok((session, token))
    }

    pub async fn update(
        pool: &DbPool,
        sealed_session_data: Option<SealedSessionBytes>,
        token: &SessionAuthToken,
        expires_at: Option<NaiveDateTime>,
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
    pub async fn update_or_create(self, pool: &DbPool) -> Result<Session, crate::DbError> {
        let session = pool
            .get()
            .await?
            .interact(move |conn| {
                diesel::insert_into(sessions::table)
                    .values(self.clone())
                    .on_conflict(sessions::h_session_id)
                    .do_update()
                    .set((
                        sessions::sealed_session_data.eq(self.sealed_session_data),
                        sessions::expires_at.eq(self.expires_at),
                    ))
                    .get_result::<Session>(conn)
            })
            .await??;
        Ok(session)
    }
}

impl UpdateSession {
    pub async fn update(self, pool: &DbPool) -> Result<Session, crate::DbError> {
        let session = pool
            .get()
            .await?
            .interact(move |conn| {
                diesel::update(sessions::table)
                    .filter(sessions::h_session_id.eq(self.h_session_id.clone()))
                    .set(self)
                    .get_result::<Session>(conn)
            })
            .await??;
        Ok(session)
    }
}
