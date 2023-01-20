use chrono::Utc;
use db::{
    models::{
        idology_expect_id_response::{IdologyExpectIdResponse, NewIdologyExpectIdResponse},
        verification_result::VerificationResult,
    },
    DbError, DbResult, PgConnection,
};
use idv::{
    idology::{
        expectid::response::ExpectIDAPIResponse,
        scan_onboarding::response::ScanOnboardingAPIResponse,
        scan_verify::response::{ScanVerifyAPIResponse, ScanVerifySubmissionAPIResponse},
    },
    socure::response::SocureIDPlusResponse,
    ParsedResponse, VendorResponse,
};
use newtypes::{VerificationRequestId, VerificationResultId};
use twilio::response::lookup::LookupV2Response;

use crate::{errors::ApiError, State};

/// Save a verification result
pub(super) async fn save_verification_result(
    state: &State,
    verification_request_id: VerificationRequestId,
    vendor_response: VendorResponse,
) -> Result<(VerificationResult, Option<StructuredVendorResponse>), ApiError> {
    let res = state
        .db_pool
        .db_transaction(
            move |conn| -> Result<(VerificationResult, Option<StructuredVendorResponse>), DbError> {
                let verification_result =
                    VerificationResult::create(conn, verification_request_id, vendor_response.raw_response)?;
                let structured_vendor_response = vendor_response
                    .response
                    .save_vendor_response(conn, verification_result.id.clone())?;

                Ok((verification_result, structured_vendor_response))
            },
        )
        .await?;

    Ok(res)
}

#[derive(Clone)]
pub enum StructuredVendorResponse {
    IDologyExpectID(IdologyExpectIdResponse),
    //TODO: add other vendors
}

trait SaveStructuredVendorResponse {
    fn save_vendor_response(
        &self,
        conn: &mut PgConnection,
        verification_result_id: VerificationResultId,
    ) -> DbResult<Option<StructuredVendorResponse>>; //TODO: remove Option here when all structured vendor responses have been implemented
}

impl SaveStructuredVendorResponse for ExpectIDAPIResponse {
    fn save_vendor_response(
        &self,
        conn: &mut PgConnection,
        verification_result_id: VerificationResultId,
    ) -> DbResult<Option<StructuredVendorResponse>> {
        let new_idology_expect_id_response = NewIdologyExpectIdResponse {
            verification_result_id,
            created_at: Utc::now(),
            id_number: self.response.id_number.and_then(|u| i64::try_from(u).ok()),
            id_scan: self.response.id_scan.clone(),
            error: self.response.error.clone(),
            results: self.response.results.as_ref().map(|r| r.key.clone()),
            summary_result: self.response.summary_result.as_ref().map(|r| r.key.clone()),
            qualifiers: self.response.raw_qualifiers(),
        };
        IdologyExpectIdResponse::create(conn, new_idology_expect_id_response)
            .map(|i| Some(StructuredVendorResponse::IDologyExpectID(i)))
    }
}

impl SaveStructuredVendorResponse for ScanVerifyAPIResponse {
    fn save_vendor_response(
        &self,
        _conn: &mut PgConnection,
        _verification_result_id: VerificationResultId,
    ) -> DbResult<Option<StructuredVendorResponse>> {
        Ok(None) // TODO:
    }
}

impl SaveStructuredVendorResponse for ScanVerifySubmissionAPIResponse {
    fn save_vendor_response(
        &self,
        _conn: &mut PgConnection,
        _verification_result_id: VerificationResultId,
    ) -> DbResult<Option<StructuredVendorResponse>> {
        Ok(None) // TODO:
    }
}

impl SaveStructuredVendorResponse for ScanOnboardingAPIResponse {
    fn save_vendor_response(
        &self,
        _conn: &mut PgConnection,
        _verification_result_id: VerificationResultId,
    ) -> DbResult<Option<StructuredVendorResponse>> {
        Ok(None) // TODO:
    }
}

impl SaveStructuredVendorResponse for LookupV2Response {
    fn save_vendor_response(
        &self,
        _conn: &mut PgConnection,
        _verification_result_id: VerificationResultId,
    ) -> DbResult<Option<StructuredVendorResponse>> {
        Ok(None) // TODO:
    }
}

impl SaveStructuredVendorResponse for SocureIDPlusResponse {
    fn save_vendor_response(
        &self,
        _conn: &mut PgConnection,
        _verification_result_id: VerificationResultId,
    ) -> DbResult<Option<StructuredVendorResponse>> {
        Ok(None) // TODO:
    }
}

impl SaveStructuredVendorResponse for ParsedResponse {
    fn save_vendor_response(
        &self,
        conn: &mut PgConnection,
        verification_result_id: VerificationResultId,
    ) -> DbResult<Option<StructuredVendorResponse>> {
        match self {
            ParsedResponse::IDologyExpectID(r) => r.save_vendor_response(conn, verification_result_id),
            ParsedResponse::IDologyScanVerifyResult(r) => {
                r.save_vendor_response(conn, verification_result_id)
            }
            ParsedResponse::IDologyScanVerifySubmission(r) => {
                r.save_vendor_response(conn, verification_result_id)
            }
            ParsedResponse::IDologyScanOnboarding(r) => r.save_vendor_response(conn, verification_result_id),
            ParsedResponse::TwilioLookupV2(r) => r.save_vendor_response(conn, verification_result_id),
            ParsedResponse::SocureIDPlus(r) => r.save_vendor_response(conn, verification_result_id),
        }
    }
}
