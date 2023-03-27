use idv::idology::scan_onboarding::response::ScanOnboardingAPIResponse;
use newtypes::{idology::IdologyScanOnboardingCaptureResult, DecisionStatus, VerificationResultId};

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct IDologyScanOnboardingFeatures {
    pub status: DecisionStatus,
    pub verification_result: VerificationResultId,
}

impl IDologyScanOnboardingFeatures {
    pub fn from(response: &ScanOnboardingAPIResponse, verification_result_id: VerificationResultId) -> Self {
        let status = response
            .response
            .capture_result()
            .map(|r| {
                if r == IdologyScanOnboardingCaptureResult::Completed {
                    DecisionStatus::Pass
                } else {
                    DecisionStatus::Fail
                }
            })
            .unwrap_or(DecisionStatus::Fail);

        Self {
            status,
            verification_result: verification_result_id,
        }
    }
}
