use paperclip::actix::Apiv2Schema;
use schemars::JsonSchema;
use strum_macros::{Display, EnumString};

#[derive(
    Debug,
    Display,
    Clone,
    Copy,
    Eq,
    PartialEq,
    Hash,
    EnumString,
    serde::Serialize,
    serde::Deserialize,
    Apiv2Schema,
    JsonSchema,
)]
#[serde(try_from = "&str")]
#[strum(serialize_all = "snake_case")]
#[serde(rename_all = "snake_case")]
/// Represents the granularity of data attributes that could be alerted on by a data vendor
pub enum SignalScope {
    Name,
    Dob,
    Ssn,
    Address,
    StreetAddress,
    City,
    State,
    Zip,
    Country,
    Email,
    PhoneNumber,

    Identity,
    IpAddress,
    Document,
}
