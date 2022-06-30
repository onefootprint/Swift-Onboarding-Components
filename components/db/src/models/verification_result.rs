use crate::schema::verification_results;
use chrono::NaiveDateTime;
use diesel::Insertable;
use newtypes::{VerificationRequestId, VerificationResultId};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable, Identifiable)]
#[table_name = "verification_results"]
pub struct VerificationResult {
    pub id: VerificationResultId,
    pub request_id: VerificationRequestId,
    pub response: serde_json::Value,
    pub timestamp: NaiveDateTime,
    pub _created_at: NaiveDateTime,
    pub _updated_at: NaiveDateTime,
}
