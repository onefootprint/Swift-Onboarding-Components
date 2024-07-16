use super::decision_intent::DecisionIntent;
use super::verification_request::RequestAndResult;
use super::verification_request::VerificationRequest;
use crate::DbError;
use crate::DbResult;
use crate::PgConn;
use chrono::DateTime;
use chrono::Utc;
use db_schema::schema::decision_intent;
use db_schema::schema::verification_request;
use db_schema::schema::verification_result;
use diesel::dsl::not;
use diesel::prelude::*;
use diesel::Insertable;
use newtypes::ScopedVaultId;
use newtypes::ScrubbedPiiVendorResponse;
use newtypes::SealedVaultBytes;
use newtypes::VendorAPI;
use newtypes::VerificationRequestId;
use newtypes::VerificationResultId;

#[derive(Debug, Clone, Queryable, Identifiable)]
#[diesel(table_name = verification_result)]
pub struct VerificationResult {
    pub id: VerificationResultId,
    pub request_id: VerificationRequestId,
    #[diesel(deserialize_as = serde_json::Value)]
    response: ScrubbedPiiVendorResponse,
    pub timestamp: DateTime<Utc>,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub e_response: Option<SealedVaultBytes>, // TODO: why is this optional
    pub is_error: bool,
}

impl VerificationResult {
    pub fn response_for_test(&self) -> ScrubbedPiiVendorResponse {
        self.response.clone()
    }
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = verification_result)]
pub struct NewVerificationResult {
    pub request_id: VerificationRequestId,
    // ScrubbedJson is so that we know that, although this is a serde_json::Value, some important fields have
    // been scrubbed and you need to use the e_response
    #[diesel(serialize_as = serde_json::Value)]
    pub response: ScrubbedPiiVendorResponse,
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
        response: ScrubbedPiiVendorResponse,
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

    #[tracing::instrument("VerificationResult::get", skip_all)]
    pub fn get(conn: &mut PgConn, id: &VerificationResultId) -> DbResult<RequestAndResult> {
        let res = verification_request::table
            .inner_join(verification_result::table)
            .filter(verification_result::id.eq(id))
            .first(conn)?;
        Ok(res)
    }

    #[tracing::instrument("VerificationResult::get_latest_successful_by_vendor_api", skip_all)]
    pub fn get_latest_successful_by_vendor_api(
        conn: &mut PgConn,
        sv_id: &ScopedVaultId,
        vendor_api: &VendorAPI,
    ) -> DbResult<Option<RequestAndResult>> {
        let res = verification_request::table
            .inner_join(verification_result::table)
            .filter(verification_request::scoped_vault_id.eq(sv_id))
            .filter(verification_request::vendor_api.eq(vendor_api))
            .filter(not(verification_result::is_error))
            .order_by(verification_result::timestamp.desc())
            .first(conn)
            .optional()?;
        Ok(res)
    }
}
