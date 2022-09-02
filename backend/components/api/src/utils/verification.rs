use db::models::verification_result::VerificationResult;
use newtypes::{ReasonCode, Vendor};

use crate::errors::ApiError;

// TODO should we put this in the DB crate as an impl VerificationResult?
pub fn get_reason_codes(vendor: Vendor, result: VerificationResult) -> Result<Vec<ReasonCode>, ApiError> {
    let reason_codes = match vendor {
        Vendor::Idology => idv::idology::verification::parse(result.response)?,
        _ => return Err(ApiError::NotImplemented),
    };
    Ok(reason_codes)
}
