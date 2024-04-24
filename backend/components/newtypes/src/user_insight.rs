use paperclip::actix::Apiv2Schema;
use serde_with::SerializeDisplay;
use strum::Display;
use strum_macros::EnumString;


#[derive(Clone, SerializeDisplay, EnumString, Display, Debug, Apiv2Schema)]
#[strum(serialize_all = "snake_case")]
pub enum UserInsightScope {
    Behavior,
    Device,
    Workflow,
}
