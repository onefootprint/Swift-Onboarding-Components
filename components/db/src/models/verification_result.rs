use crate::schema::verification_results;
use chrono::NaiveDateTime;
use diesel::Insertable;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable, Identifiable)]
#[table_name = "verification_results"]
pub struct VerificationResult {
    pub id: Uuid,
    pub request_id: Uuid,
    pub response: serde_json::Value,
    pub timestamp: NaiveDateTime,
    pub _created_at: NaiveDateTime,
    pub _updated_at: NaiveDateTime,
}
