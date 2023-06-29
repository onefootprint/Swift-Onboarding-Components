use crate::DbError;
use crate::{DbResult, PgConn};
use chrono::{DateTime, Utc};
use db_schema::schema::{decision_intent, verification_request, verification_result};
use diesel::prelude::*;
use diesel::Insertable;
use newtypes::{ScrubbedJsonValue, SealedVaultBytes, VendorAPI, VerificationRequestId, VerificationResultId};
use serde::{Deserialize, Serialize};

use super::decision_intent::DecisionIntent;
use super::verification_request::VerificationRequest;

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
    pub is_error: bool,
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
    pub is_error: bool,
}

impl VerificationResult {
    #[tracing::instrument("VerificationResult::create", skip_all)]
    pub fn create(
        conn: &mut PgConn,
        request_id: VerificationRequestId,
        // To be removed once we are finished testing
        response: ScrubbedJsonValue,
        e_response: SealedVaultBytes,
        is_error: bool,
    ) -> Result<VerificationResult, DbError> {
        let new_result = NewVerificationResult {
            request_id,
            response,
            timestamp: Utc::now(),
            e_response: Some(e_response),
            is_error,
        };
        let result = diesel::insert_into(verification_result::table)
            .values(new_result)
            .get_result(conn)?;
        Ok(result)
    }

    #[tracing::instrument("VerificationResult::bulk_create", skip_all)]
    pub fn bulk_create(
        conn: &mut PgConn,
        new_verification_results: Vec<NewVerificationResult>,
    ) -> Result<Vec<VerificationResult>, DbError> {
        let result = diesel::insert_into(verification_result::table)
            .values(new_verification_results)
            .get_results(conn)?;
        Ok(result)
    }

    #[tracing::instrument("VerificationResult::get_successful_by_response_id", skip_all)]
    pub fn get_successful_by_response_id(
        conn: &mut PgConn,
        vendor_api: VendorAPI,
        id: &str,
    ) -> DbResult<Option<(VerificationRequest, VerificationResult, DecisionIntent)>> {
        let res = verification_request::table
            .filter(verification_request::vendor_api.eq(vendor_api))
            .inner_join(verification_result::table)
            .filter(verification_result::is_error.eq(false))
            .filter(
                verification_result::response
                    .retrieve_by_path_as_text(vec!["id"])
                    .eq(id),
            )
            .inner_join(decision_intent::table)
            .get_result(conn)
            .optional()?;

        Ok(res)
    }
}
