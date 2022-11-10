use db::{models::verification_result::VerificationResult, DbError};
use idv::VendorResponse;
use newtypes::VerificationRequestId;

use crate::{errors::ApiError, State};

/// Save a verification result
pub(super) async fn save_verification_result(
    state: &State,
    verification_request_id: VerificationRequestId,
    vendor_response: VendorResponse,
) -> Result<VerificationResult, ApiError> {
    let res = state
        .db_pool
        .db_transaction(move |conn| -> Result<VerificationResult, DbError> {
            VerificationResult::create(conn, verification_request_id, vendor_response.raw_response)
        })
        .await?;

    Ok(res)
}
