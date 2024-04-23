use paperclip::actix::Apiv2Schema;
use serde::Serialize;
use strum::Display;
use strum_macros::EnumString;


#[derive(Clone, Serialize, EnumString, Display, Debug, Apiv2Schema)]
#[strum(serialize_all = "snake_case")]
pub enum UserInsightScope {
    Behavior,
    Device,
    Workflow,
}
