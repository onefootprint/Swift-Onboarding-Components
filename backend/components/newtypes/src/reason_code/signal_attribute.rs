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
    Device,
    Document,
    Selfie,

    BusinessAddress,
    BusinessName,
    BusinessPhoneNumber,
    BusinessWebsite,
    BusinessTin,
    BeneficialOwners,
    BusinessDba,
}

impl SignalScope {
    pub fn is_for_person(&self) -> bool {
        match self {
            SignalScope::Name => true,
            SignalScope::Dob => true,
            SignalScope::Ssn => true,
            SignalScope::Address => true,
            SignalScope::StreetAddress => true,
            SignalScope::City => true,
            SignalScope::State => true,
            SignalScope::Zip => true,
            SignalScope::Country => true,
            SignalScope::Email => true,
            SignalScope::PhoneNumber => true,
            SignalScope::IpAddress => true,
            SignalScope::Device => true,
            SignalScope::Document => true,
            SignalScope::Selfie => true,
            SignalScope::BusinessAddress => false,
            SignalScope::BusinessName => false,
            SignalScope::BusinessPhoneNumber => false,
            SignalScope::BusinessWebsite => false,
            SignalScope::BusinessTin => false,
            SignalScope::BeneficialOwners => false,
            SignalScope::BusinessDba => false,
        }
    }
}
