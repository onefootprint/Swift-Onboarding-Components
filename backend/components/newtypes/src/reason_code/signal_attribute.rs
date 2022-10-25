use paperclip::actix::Apiv2Schema;
use schemars::JsonSchema;

#[derive(
    Debug, Clone, Copy, Eq, PartialEq, Hash, serde::Serialize, serde::Deserialize, Apiv2Schema, JsonSchema,
)]
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
