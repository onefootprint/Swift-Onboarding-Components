use paperclip::actix::Apiv2Schema;

pub mod access_event;
pub mod error;
pub mod insight_event;
pub mod onboarding;
pub mod success;

/// empty data
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, Apiv2Schema)]
pub struct Empty;
