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
    pub requires_manual_review: bool,
    pub status: VisibleOnboardingStatus,
    pub timestamp: DateTime<Utc>,
}

export_schema!(ValidateResponse);
