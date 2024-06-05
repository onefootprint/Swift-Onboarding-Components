use chrono::{
    DateTime,
    Utc,
};
use newtypes::{
    ObConfigurationKey,
    OnboardingStatus,
};
use paperclip::actix::Apiv2Schema;
use serde::Serialize;

#[derive(Debug, Clone, Serialize, Apiv2Schema)]

pub struct PublicOnboarding {
    #[openapi(example = "ob_live_fZvYlX3JpanlQ3MAwE45g0")]
    pub playbook_key: ObConfigurationKey,
    pub status: OnboardingStatus,
    pub timestamp: DateTime<Utc>,
}
