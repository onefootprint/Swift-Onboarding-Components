use paperclip::actix::Apiv2Schema;
use schemars::JsonSchema;
use strum::Display;

#[derive(
    Debug,
    Clone,
    Copy,
    Eq,
    PartialEq,
    Hash,
    serde::Serialize,
    serde::Deserialize,
    Apiv2Schema,
    JsonSchema,
    Display,
)]
#[serde(rename_all = "snake_case")]
/// Represents the granularity of data attributes that could be alerted on by a data vendor
/// NOTE: this is not the same as "data attributes we can collect from a user". Please see `DataAttribute` for that
pub enum SignalScope {
    // TODO: split into FN/LN
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

    IpAddress,
    Document,
    Selfie,

    BusinessAddress,
    BusinessName,
    BusinessPhoneNumber,
    BusinessWebsite,
    BusinessTin,
    BeneficialOwners,
}
