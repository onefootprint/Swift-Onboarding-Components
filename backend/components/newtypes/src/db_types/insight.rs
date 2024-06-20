use paperclip::actix::Apiv2Schema;
use serde_json;
use serde_with::DeserializeFromStr;
use serde_with::SerializeDisplay;
use strum::AsRefStr;
use strum_macros::Display;
use strum_macros::EnumString;

#[derive(
    Display,
    SerializeDisplay,
    DeserializeFromStr,
    Debug,
    Clone,
    Copy,
    Eq,
    PartialEq,
    Apiv2Schema,
    EnumString,
    AsRefStr,
    macros::SerdeAttr,
)]
#[strum(serialize_all = "snake_case")]
#[serde(rename_all = "snake_case")]
pub enum DeviceInsightField {
    IpAddress,
}
