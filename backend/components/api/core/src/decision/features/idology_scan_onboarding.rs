use idv::idology::scan_onboarding::response::ScanOnboardingAPIResponse;
use newtypes::{idology::IdologyScanOnboardingCaptureResult, DecisionStatus};

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct IDologyScanOnboardingFeatures {
    pub status: DecisionStatus,
}

impl IDologyScanOnboardingFeatures {
    pub fn from(response: &ScanOnboardingAPIResponse) -> Self {
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

        Self { status }
    }
}
