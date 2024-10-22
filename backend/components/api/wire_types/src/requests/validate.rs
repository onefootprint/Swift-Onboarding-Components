use crate::*;
use newtypes::FpId;
use newtypes::ModernAuthEventKind;
use newtypes::ObConfigurationId;
use newtypes::ObConfigurationKey;
use newtypes::OnboardingStatus;
use newtypes::SessionAuthToken;

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, Apiv2Schema)]
pub struct ValidateRequest {
    /// The validation token given from either the `onComplete` or `onAuth` callback of the
    /// Footprint SDK.
    #[openapi(example = "vtok_UxM6Vbvk2Rcy1gzcSuXgk3sj3L9I0pAnNH")]
    pub validation_token: SessionAuthToken,
}

#[derive(Debug, Clone, serde::Serialize, Apiv2Response, macros::JsonResponder)]

pub struct ValidateResponse {
    /// Information on the authenticated user and the auth method they used.
    pub user_auth: UserAuthResponse,
    #[serde(skip_serializing_if = "Option::is_none")]
    /// Information on the user and their onboarding session. Provided after onboarding onto a KYC
    /// or KYB playbook.
    pub user: Option<EntityValidateResponse>,
    #[serde(skip_serializing_if = "Option::is_none")]
    /// Information on the business and its onboarding session. Provided after onboarding onto a KYB
    /// playbook.
    #[openapi(example = "null")]
    pub business: Option<EntityValidateResponse>,

    #[serde(skip_serializing_if = "Option::is_none")]
    #[openapi(skip)]
    /// Legacy field - deprecated.
    pub onboarding_configuration_id: Option<ObConfigurationId>,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, Apiv2Response, macros::JsonResponder)]
pub struct EntityValidateResponse {
    pub fp_id: FpId,
    pub requires_manual_review: bool,
    /// The decision issued by the rules configured on your playbook. For more information on interpreting statuses, see [here](https://docs.onefootprint.com/articles/kyc/getting-started#verify-the-footprint-token-server-side-check-the-onboarding-status).
    pub status: OnboardingStatus,
    pub playbook_key: ObConfigurationKey,
}

#[derive(Debug, Clone, serde::Serialize, Apiv2Response, macros::JsonResponder)]
pub struct UserAuthResponse {
    pub fp_id: FpId,
    pub auth_events: Vec<ValidateAuthEvent>,
}

#[derive(Debug, Clone, serde::Serialize, Apiv2Schema)]
pub struct ValidateAuthEvent {
    pub kind: ModernAuthEventKind,
    pub timestamp: DateTime<Utc>,
}
