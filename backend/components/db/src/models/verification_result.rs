use crate::{schema::verification_result, DbError};
use chrono::{DateTime, Utc};
use diesel::prelude::*;
use diesel::{Insertable, PgConnection};
use newtypes::{VerificationRequestId, VerificationResultId};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable, Identifiable)]
#[diesel(table_name = verification_result)]
pub struct VerificationResult {
    pub id: VerificationResultId,
    pub request_id: VerificationRequestId,
    pub response: serde_json::Value,
    pub timestamp: DateTime<Utc>,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[diesel(table_name = verification_result)]
struct NewVerificationResult {
    pub request_id: VerificationRequestId,
    pub response: serde_json::Value,
    pub timestamp: DateTime<Utc>,
}

impl VerificationResult {
    pub fn create(
        conn: &mut PgConnection,
        request_id: VerificationRequestId,
        response: serde_json::Value,
    ) -> Result<(), DbError> {
        let new_result = NewVerificationResult {
            request_id,
            response,
            timestamp: Utc::now(),
        };
        diesel::insert_into(verification_result::table)
            .values(new_result)
            .execute(conn)?;
        Ok(())
    }
}
