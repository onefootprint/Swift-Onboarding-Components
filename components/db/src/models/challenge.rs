use crate::schema::challenge;
use crate::models::types::{ChallengeKind, ChallengeState};
use chrono::NaiveDateTime;
use diesel::{Insertable, Queryable};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

// TODO add updated_at and created_at

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable)]
#[table_name = "challenge"]
pub struct Challenge {
    pub id: Uuid,
    pub user_id: Uuid,
    pub sh_data: Vec<u8>,
    pub code: i32,
    pub kind: ChallengeKind,
    pub state: ChallengeState,
    pub validated_at: Option<NaiveDateTime>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[table_name = "challenge"]
pub struct NewChallenge {
    pub user_id: Uuid,
    pub sh_data: Vec<u8>,
    pub code: i32,
    pub kind: ChallengeKind,
    pub state: ChallengeState,
}
