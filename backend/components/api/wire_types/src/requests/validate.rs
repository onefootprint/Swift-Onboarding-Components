use crate::*;
use newtypes::{FpId, ModernAuthEventKind, ObConfigurationId, OnboardingStatus, SessionAuthToken};

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, Apiv2Schema)]
pub struct ValidateRequest {
    pub validation_token: SessionAuthToken,
}

#[derive(Debug, Clone, serde::Serialize, Apiv2Schema)]
pub struct ValidateResponse {
    /// Information on the authenticated user and the auth method they used
    pub user_auth: UserAuthResponse,
    #[serde(skip_serializing_if = "Option::is_none")]
    /// Information on the user and their onboarding session. Provided for KYC and KYB playbook sessions
    pub user: Option<EntityValidateResponse>,
    #[serde(skip_serializing_if = "Option::is_none")]
    /// Information on the business and its onboarding session. Provided for KYB playbook sessions
    pub business: Option<EntityValidateResponse>,

    // Legacy fields that are deprecated
    #[serde(skip_serializing_if = "Option::is_none")]
    #[openapi(skip)]
    /// Deprecated
    pub footprint_user_id: Option<FpId>,
    #[serde(skip_serializing_if = "Option::is_none")]
    #[openapi(skip)]
    /// Deprecated
    pub status: Option<OnboardingStatus>,
    #[serde(skip_serializing_if = "Option::is_none")]
    #[openapi(skip)]
    /// Deprecated
    pub requires_manual_review: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    #[openapi(skip)]
    /// Deprecated
    pub onboarding_configuration_id: Option<ObConfigurationId>,
    #[serde(skip_serializing_if = "Option::is_none")]
    #[openapi(skip)]
    /// Deprecated
    pub timestamp: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, serde::Serialize, Apiv2Schema)]
pub struct EntityValidateResponse {
    pub fp_id: FpId,
    pub requires_manual_review: bool,
    pub status: OnboardingStatus,
}

#[derive(Debug, Clone, serde::Serialize, Apiv2Schema)]
pub struct UserAuthResponse {
    pub fp_id: FpId,
    pub auth_events: Vec<ValidateAuthEvent>,
}

#[derive(Debug, Clone, serde::Serialize, Apiv2Schema)]
pub struct ValidateAuthEvent {
    pub kind: ModernAuthEventKind,
    pub timestamp: DateTime<Utc>,
}
