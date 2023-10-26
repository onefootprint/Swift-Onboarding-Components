use paperclip::actix::Apiv2Schema;
use strum_macros::{Display, EnumString};

#[derive(
    Debug,
    Display,
    Clone,
    Copy,
    Eq,
    PartialEq,
    Ord,
    PartialOrd,
    EnumString,
    serde_with::DeserializeFromStr,
    macros::SerdeAttr,
    Apiv2Schema,
)]
#[strum(serialize_all = "snake_case")]
#[serde(rename_all = "snake_case")]
pub enum IdentifyScope {
    My1fp,
    Onboarding,
    Auth,
}
