use paperclip::actix::Apiv2Schema;
use serde::Serialize;

#[derive(Clone, Serialize, Debug, Apiv2Schema)]
pub enum UserInsightScope {
    Behavior,
    Device,
}
