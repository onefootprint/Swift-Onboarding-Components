use paperclip::actix::Apiv2Schema;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, Eq, PartialEq, Deserialize, Serialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub enum RequirementStatus {
    /// This requirement is still in progress and the client should not move on
    Pending,
    /// This requirement is complete and the client should move on to the next
    Complete,
}
