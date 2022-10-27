use idv::VendorResponse;
use newtypes::{VerificationRequestId, VerificationResultId};

#[derive(Clone)]
pub struct VendorResult {
    pub response: VendorResponse,
    pub verification_result_id: VerificationResultId,
    pub verification_request_id: VerificationRequestId,
}
