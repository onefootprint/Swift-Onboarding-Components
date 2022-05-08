use paperclip::actix::Apiv2Schema;

pub mod error;
pub mod success;

/// empty data
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, Apiv2Schema)]
pub struct Empty;
