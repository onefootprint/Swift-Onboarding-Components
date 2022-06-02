use paperclip::actix::Apiv2Schema;
use serde::{Deserialize, Serialize};

#[derive(Debug, PartialEq, Clone, Copy, Deserialize, Serialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub enum D2pSessionStatus {
    Waiting,
    InProgress,
    Failed,
    Completed,
}

impl Default for D2pSessionStatus {
    fn default() -> Self {
        Self::Waiting
    }
}
