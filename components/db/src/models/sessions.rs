use crate::models::session_data::SessionState;
use crate::schema::sessions;
use chrono::NaiveDateTime;
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

#[derive(Debug, Clone, Serialize, Deserialize, Insertable, AsChangeset)]
#[table_name = "sessions"]
pub struct UpdateSession {
    pub h_session_id: String,
    pub session_data: SessionState,
}
