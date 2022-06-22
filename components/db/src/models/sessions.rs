use crate::schema::sessions;
use crate::DbPool;
use chrono::NaiveDateTime;
use crypto::{hex::ToHex, random::gen_random_alphanumeric_code};
use diesel::prelude::*;
use diesel::{Insertable, Queryable};
use newtypes::ServerSession;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable)]
#[table_name = "sessions"]
pub struct Session {
    pub h_session_id: String,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
    pub expires_at: NaiveDateTime,
    pub session_data: ServerSession,
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[table_name = "sessions"]
pub struct NewSession {
    pub h_session_id: String,
    pub session_data: ServerSession,
    pub expires_at: NaiveDateTime,
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable, AsChangeset)]
#[table_name = "sessions"]
pub struct UpdateSession {
    pub h_session_id: String,
    pub session_data: Option<ServerSession>,
    pub expires_at: Option<NaiveDateTime>,
}

impl Session {
    pub async fn create(
        pool: &DbPool,
        session_data: ServerSession,
        expires_at: NaiveDateTime,
    ) -> Result<(Session, String), crate::DbError> {
        // create a token to identify session for future lookup
        let token = format!("vtok_{}", gen_random_alphanumeric_code(34));
        let h_session_id: String = crypto::sha256(token.as_bytes()).encode_hex();

        let session = NewSession {
            h_session_id,
            session_data,
            expires_at,
        }
        .update_or_create(pool)
        .await?;
        Ok((session, token))
    }

    pub async fn update(
        pool: &DbPool,
        session_data: Option<ServerSession>,
        token: String,
        expires_at: Option<NaiveDateTime>,
    ) -> Result<(Session, String), crate::DbError> {
        let h_session_id: String = crypto::sha256(token.as_bytes()).encode_hex();

        let session = UpdateSession {
            h_session_id,
            session_data,
            expires_at,
        }
        .update(pool)
        .await?;
        Ok((session, token))
    }

    pub async fn update_for_h_session_id(
        pool: &DbPool,
        session_data: Option<ServerSession>,
        h_session_id: String,
        expires_at: Option<NaiveDateTime>,
    ) -> Result<Session, crate::DbError> {
        let session = UpdateSession {
            h_session_id,
            session_data,
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
                        sessions::session_data.eq(self.session_data),
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
