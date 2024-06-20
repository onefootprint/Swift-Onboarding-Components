use paperclip::actix::Apiv2Schema;
use serde::Deserialize;
use serde::Serialize;
use strum_macros::Display;

#[derive(Debug, Display, Eq, PartialEq, Clone, Copy, Deserialize, Serialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub enum D2pSessionStatus {
    Waiting,
    InProgress,
    Canceled,
    Failed,
    Completed,
}

impl D2pSessionStatus {
    pub fn priority(&self) -> usize {
        match self {
            D2pSessionStatus::Waiting => 0,
            D2pSessionStatus::InProgress => 1,
            D2pSessionStatus::Canceled => 2,
            D2pSessionStatus::Failed => 2,
            D2pSessionStatus::Completed => 2,
        }
    }
}

impl Default for D2pSessionStatus {
    fn default() -> Self {
        Self::Waiting
    }
}
