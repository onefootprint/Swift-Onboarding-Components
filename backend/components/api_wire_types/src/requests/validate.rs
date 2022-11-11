use crate::*;

/// Request containing a short-lived validation token that is used to verify auth and the end of
/// an onboarding session.
#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, Apiv2Schema, JsonSchema)]
pub struct ValidateRequest {
    pub validation_token: SessionAuthToken,
}

export_schema!(ValidateRequest);

#[derive(Debug, Clone, serde::Serialize, Apiv2Schema, JsonSchema)]
pub struct ValidateResponse {
    pub onboarding_configuration_id: ObConfigurationId,
    pub footprint_user_id: FootprintUserId,
    pub status: TerminalOnboardingStatus,
    pub timestamp: DateTime<Utc>,
}

export_schema!(ValidateResponse);

/// This is the external-facing version of OnboardingStatus. Since we'll never serialize the
/// non-terminal states of OnboardingStatus in the POST /validate endpoint, we don't need to show
/// in the API specs that those options are valid.
#[derive(Debug, Clone, Eq, PartialEq, Deserialize, Serialize, Apiv2Schema, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub enum TerminalOnboardingStatus {
    ManualReview,
    Verified,
    Failed,
}
export_schema!(TerminalOnboardingStatus);

impl TryFrom<(OnboardingStatus, bool)> for TerminalOnboardingStatus {
    type Error = crate::Error;

    fn try_from((status, is_manual_review): (OnboardingStatus, bool)) -> Result<Self, Self::Error> {
        // TODO this is messy, but will clean up after the end of OnboardingStatus v2 migration
        // https://linear.app/footprint/issue/FP-1856/update-externally-visible-onboarding-status
        match (status, is_manual_review) {
            (_, true) => Ok(Self::ManualReview),
            (OnboardingStatus::Failed, false) => Ok(Self::Failed),
            (OnboardingStatus::Verified, false) => Ok(Self::Verified),
            (OnboardingStatus::Processing, _) | (OnboardingStatus::StepUpRequired, _) => {
                Err(crate::Error::ConversionError)
            }
        }
    }
}
