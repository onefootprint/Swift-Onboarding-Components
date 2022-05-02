use crate::models::types::{ChallengeKind, ChallengeState};
use crate::schema::challenges;
use chrono::NaiveDateTime;
use diesel::{Insertable, Queryable};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

// TODO add updated_at and created_at
// TODO add expires_at

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable, Identifiable)]
#[table_name = "challenges"]
pub struct Challenge {
    pub id: Uuid,
    pub user_vault_id: String,
    pub sh_data: Vec<u8>,
    pub h_code: Vec<u8>,
    pub kind: ChallengeKind,
    pub state: ChallengeState,
    pub expires_at: NaiveDateTime,
    pub validated_at: Option<NaiveDateTime>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[table_name = "challenges"]
pub struct NewChallenge {
    pub user_vault_id: String,
    pub sh_data: Vec<u8>,
    pub h_code: Vec<u8>,
    pub kind: ChallengeKind,
    pub state: ChallengeState,
    pub expires_at: NaiveDateTime,
}
