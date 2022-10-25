use db::models::verification_result::VerificationResult;
use idv::VendorResponse;
use newtypes::VerificationRequestId;

use crate::{errors::ApiError, State};

/// Save a verification result and emit an AuditTrail log
pub(super) async fn save_verification_result(
    state: &State,
    verification_request_id: VerificationRequestId,
    vendor_response: VendorResponse,
) -> Result<(), ApiError> {
    // Atomically create the VerificationResult row, update the status of the onboarding, and
    // create new audit trails
    state
        .db_pool
        .db_transaction(move |conn| -> Result<_, ApiError> {
            VerificationResult::create(conn, verification_request_id, vendor_response.raw_response)?;

            Ok(())
        })
        .await?;

    Ok(())
}
