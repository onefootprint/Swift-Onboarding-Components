use paperclip::actix::Apiv2Schema;

pub mod access_event;
pub mod audit_trail;
pub mod error;
pub mod insight_event;
pub mod liveness;
pub mod onboarding;
pub mod scoped_user;
pub mod success;

/// empty data
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, Apiv2Schema)]
pub struct Empty;
