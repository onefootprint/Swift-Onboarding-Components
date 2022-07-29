use paperclip::actix::Apiv2Schema;
use serde::{Deserialize, Serialize};
use serde_json;

#[derive(Eq, PartialEq, Serialize, Deserialize, Debug, Clone, Apiv2Schema)]
pub enum ObConfigStatus {
    Disabled,
    Enabled,
}
