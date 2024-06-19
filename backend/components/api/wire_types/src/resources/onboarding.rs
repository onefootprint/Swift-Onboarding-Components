use chrono::{
    DateTime,
    Utc,
};
use newtypes::{
    ObConfigurationKey,
    OnboardingStatus,
};
use paperclip::actix::Apiv2Response;
use serde::Serialize;

#[derive(Debug, Clone, Serialize, Apiv2Response, macros::JsonResponder)]

pub struct PublicOnboarding {
    #[openapi(example = "ob_live_fZvYlX3JpanlQ3MAwE45g0")]
    pub playbook_key: ObConfigurationKey,
    pub status: OnboardingStatus,
    pub timestamp: DateTime<Utc>,
}
