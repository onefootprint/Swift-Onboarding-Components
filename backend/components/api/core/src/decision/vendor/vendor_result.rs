use db::models::verification_request::VerificationRequest;
use db::models::verification_result::VerificationResult;
use idv::VendorResponse;
use newtypes::VendorAPI;
use newtypes::VerificationRequestId;
use newtypes::VerificationResultId;

// TODO: traitify this, we only have 1 callsite that needs a heterogenous list of potential
// responses (waterfall), everywhere else we can return concrete types
#[derive(Clone)]
pub struct VendorResult {
    pub response: VendorResponse,
    pub verification_result_id: VerificationResultId,
    pub verification_request_id: VerificationRequestId,
}

#[derive(Clone)]
pub struct HydratedVerificationResult {
    pub vres: VerificationResult,
    // None if vres.is_error
    pub response: Option<VendorResponse>,
}

#[derive(Clone)]
pub struct RequestAndMaybeHydratedResult {
    pub vreq: VerificationRequest,
    pub vres: Option<HydratedVerificationResult>,
}

impl RequestAndMaybeHydratedResult {
    pub fn into_vendor_result(self) -> Option<VendorResult> {
        self.vres.and_then(|hvr| {
            (!hvr.vres.is_error)
                .then_some(hvr.response.map(|vr| VendorResult {
                    response: vr,
                    verification_result_id: hvr.vres.id,
                    verification_request_id: self.vreq.id,
                }))
                .flatten()
        })
    }
}

impl VendorResult {
    pub fn vendor_api(&self) -> VendorAPI {
        let parsed = &self.response.response;

        parsed.into()
    }
}
