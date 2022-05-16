use crate::models::session_data::SessionState;
use crate::schema::sessions;
use crate::DbPool;
use chrono::NaiveDateTime;
use crypto::{hex::ToHex, random::gen_random_alphanumeric_code};
use diesel::prelude::*;
use diesel::{Insertable, Queryable};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable)]
#[table_name = "sessions"]
pub struct Session {
    pub h_session_id: String,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
    pub session_data: SessionState,
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[table_name = "sessions"]
pub struct NewSession {
    pub h_session_id: String,
    pub session_data: SessionState,
}

impl SessionState {
    pub async fn create(self, pool: &DbPool) -> Result<(Session, String), crate::DbError> {
        // create a token to identify session for future lookup
        let token = format!("vtok_{}", gen_random_alphanumeric_code(34));
        let h_session_id: String = crypto::sha256(token.as_bytes()).encode_hex();

        let session = NewSession {
            h_session_id,
            session_data: self,
        }
        .update_or_create(pool)
        .await?;
        Ok((session, token))
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
                    .set(sessions::session_data.eq(self.session_data))
                    .get_result::<Session>(conn)
            })
            .await??;
        Ok(session)
    }
}
