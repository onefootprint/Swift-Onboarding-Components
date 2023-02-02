use crate::PgConn;
use crate::{schema::verification_result, DbError};
use chrono::{DateTime, Utc};
use diesel::prelude::*;
use diesel::Insertable;
use newtypes::{SealedVaultBytes, VerificationRequestId, VerificationResultId};
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
    pub e_response: Option<SealedVaultBytes>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[diesel(table_name = verification_result)]
struct NewVerificationResult {
    pub request_id: VerificationRequestId,
    pub response: serde_json::Value,
    pub timestamp: DateTime<Utc>,
    pub e_response: Option<SealedVaultBytes>,
}

impl VerificationResult {
    pub fn create(
        conn: &mut PgConn,
        request_id: VerificationRequestId,
        // To be removed once we are finished testing
        response: serde_json::Value,
        e_response: SealedVaultBytes,
    ) -> Result<VerificationResult, DbError> {
        let new_result = NewVerificationResult {
            request_id,
            response,
            timestamp: Utc::now(),
            e_response: Some(e_response),
        };
        let result = diesel::insert_into(verification_result::table)
            .values(new_result)
            .get_result(conn)?;
        Ok(result)
    }
}
