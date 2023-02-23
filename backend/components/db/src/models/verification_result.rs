use crate::PgConn;
use crate::{schema::verification_result, DbError};
use chrono::{DateTime, Utc};
use diesel::prelude::*;
use diesel::Insertable;
use newtypes::{ScrubbedJsonValue, SealedVaultBytes, VerificationRequestId, VerificationResultId};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Identifiable)]
#[diesel(table_name = verification_result)]
pub struct VerificationResult {
    pub id: VerificationResultId,
    pub request_id: VerificationRequestId,
    #[diesel(deserialize_as = serde_json::Value)]
    pub response: ScrubbedJsonValue,
    pub timestamp: DateTime<Utc>,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub e_response: Option<SealedVaultBytes>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[diesel(table_name = verification_result)]
pub struct NewVerificationResult {
    pub request_id: VerificationRequestId,
    // ScrubbedJson is so that we know that, although this is a serde_json::Value, some important fields have been scrubbed and you need to use the e_response
    #[diesel(serialize_as = serde_json::Value)]
    pub response: ScrubbedJsonValue,
    pub timestamp: DateTime<Utc>,
    pub e_response: Option<SealedVaultBytes>,
}

impl VerificationResult {
    #[tracing::instrument(skip_all)]
    pub fn create(
        conn: &mut PgConn,
        request_id: VerificationRequestId,
        // To be removed once we are finished testing
        response: ScrubbedJsonValue,
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

    pub fn bulk_create(
        conn: &mut PgConn,
        new_verification_results: Vec<NewVerificationResult>,
    ) -> Result<Vec<VerificationResult>, DbError> {
        let result = diesel::insert_into(verification_result::table)
            .values(new_verification_results)
            .get_results(conn)?;
        Ok(result)
    }
}
