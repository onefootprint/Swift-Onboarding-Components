use paperclip::actix::Apiv2Schema;
use strum_macros::{
    Display,
    EnumString,
};

#[derive(
    Debug,
    Clone,
    Copy,
    Eq,
    PartialEq,
    Hash,
    serde_with::SerializeDisplay,
    serde_with::DeserializeFromStr,
    Apiv2Schema,
    EnumString,
    Display,
    macros::SerdeAttr,
)]
#[strum(serialize_all = "snake_case")]
#[serde(rename_all = "snake_case")]
/// Represents the granularity of data attributes that could be alerted on by a data vendor
/// NOTE: this is not the same as "data attributes we can collect from a user". Please see
/// `DataAttribute` for that
pub enum SignalScope {
    // TODO: split into FN/LN
    Name,
    Dob,
    Ssn,
    Itin,
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
    NativeDevice,
    Document,
    Selfie,
    Behavior,

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
            SignalScope::Itin => true,
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
            SignalScope::NativeDevice => true,
            SignalScope::Document => true,
            SignalScope::Selfie => true,
            SignalScope::BusinessAddress => false,
            SignalScope::BusinessName => false,
            SignalScope::BusinessPhoneNumber => false,
            SignalScope::BusinessWebsite => false,
            SignalScope::BusinessTin => false,
            SignalScope::BeneficialOwners => false,
            SignalScope::BusinessDba => false,
            SignalScope::Behavior => true,
        }
    }

    pub fn is_for_kyc(&self) -> bool {
        match self {
            SignalScope::Name
            | SignalScope::Dob
            | SignalScope::Ssn
            | SignalScope::Itin
            | SignalScope::Address
            | SignalScope::StreetAddress
            | SignalScope::City
            | SignalScope::State
            | SignalScope::Zip
            | SignalScope::Country
            | SignalScope::Email
            | SignalScope::PhoneNumber => true,
            SignalScope::IpAddress
            | SignalScope::Device
            | SignalScope::NativeDevice
            | SignalScope::Document
            | SignalScope::Selfie
            | SignalScope::BusinessAddress
            | SignalScope::BusinessName
            | SignalScope::BusinessPhoneNumber
            | SignalScope::BusinessWebsite
            | SignalScope::BusinessTin
            | SignalScope::BeneficialOwners
            | SignalScope::Behavior
            | SignalScope::BusinessDba => false,
        }
    }

    pub fn is_for_kyb(&self) -> bool {
        match self {
            SignalScope::Name
            | SignalScope::Dob
            | SignalScope::Ssn
            | SignalScope::Itin
            | SignalScope::Address
            | SignalScope::StreetAddress
            | SignalScope::City
            | SignalScope::State
            | SignalScope::Zip
            | SignalScope::Country
            | SignalScope::Email
            | SignalScope::IpAddress
            | SignalScope::Device
            | SignalScope::NativeDevice
            | SignalScope::Document
            | SignalScope::Selfie
            | SignalScope::Behavior // TODO: cross this bridge when/if we use behavioral for kyb
            | SignalScope::PhoneNumber => false,
            SignalScope::BusinessAddress
            | SignalScope::BusinessName
            | SignalScope::BusinessPhoneNumber
            | SignalScope::BusinessWebsite
            | SignalScope::BusinessTin
            | SignalScope::BeneficialOwners
            | SignalScope::BusinessDba => true,
        }
    }
}
