use chrono::DateTime;
use chrono::Utc;
use newtypes::FpId;
use newtypes::ObConfigurationKey;
use newtypes::OnboardingStatus;
use paperclip::actix::Apiv2Response;
use serde::Serialize;

#[derive(Debug, Clone, Serialize, Apiv2Response, macros::JsonResponder)]

pub struct PublicOnboarding {
    #[openapi(example = "pb_live_fZvYlX3JpanlQ3MAwE45g0")]
    pub playbook_key: ObConfigurationKey,
    pub status: OnboardingStatus,
    pub timestamp: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Apiv2Response, macros::JsonResponder)]
pub struct InProgressOnboarding {
    pub tenant: InProgressOnboardingTenant,
    pub status: OnboardingStatus,
    pub timestamp: DateTime<Utc>,
    pub fp_id: FpId,
}

#[derive(Debug, Clone, Serialize, Apiv2Response)]
pub struct InProgressOnboardingTenant {
    pub name: String,
    pub website_url: Option<String>,
}
