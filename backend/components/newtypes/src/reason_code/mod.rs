mod experian;
mod experian_address_codes;
mod experian_phone_codes;
mod experian_ssn_codes;
mod idology;
mod lexis;
mod reason_code_helpers;
mod signal_attribute;
mod socure;

pub use experian::*;
pub use experian_address_codes::*;
pub use experian_phone_codes::*;
pub use experian_ssn_codes::*;
pub use idology::*;
pub use lexis::*;
pub use reason_code_helpers::*;
pub use signal_attribute::*;
pub use socure::*;
use std::str::FromStr;

// TODO: do these macros and our vendor enums need to be in newtypes? or could we move into decision
// or idv crate

/// Used to define an enum representing some sort of set of reason codes from a vendor.
/// This macro is for mapping 1 reason code to 0 or 1 FRC (see vendor_reason_code_enums for 1:N
/// mapping)
#[macro_export]
macro_rules! vendor_reason_code_enum {
    (
        $(#[$macros:meta])*
        pub enum $name:ident {
            $(#[ser = $ser:literal, description = $description:literal] #[footprint_reason_code = $footprint_reason_code:expr] $item:ident),*
        }
    ) => {
        $(#[$macros])*
        pub enum $name {
            $(#[doc=$description] #[strum(to_string = $ser)] $item,)*
        }

        impl $name {
            pub fn description(&self) -> String {
                match self {
                    $(Self::$item => String::from($description)),*
                }
            }
        }

        impl From<&$name> for Option<FootprintReasonCode> {
            fn from(vendor_reason_code: &$name) -> Self {
                match vendor_reason_code {
                    $($name::$item => $footprint_reason_code),*
                }
            }
        }

    }
}
pub use vendor_reason_code_enum;

/// 1:N version of above that lets you map a vendor reason code into Vec<FRC>
macro_rules! vendor_reason_codes_enum {
    (
        $(#[$macros:meta])*
        pub enum $name:ident {
            $(#[ser = $ser:literal] #[footprint_reason_codes = $footprint_reason_codes:expr] $item:ident),*
        }
    ) => {
        $(#[$macros])*
        pub enum $name {
            $(#[strum(to_string = $ser)] $item,)*
        }


        impl From<&$name> for Vec<FootprintReasonCode> {
            fn from(vendor_reason_code: &$name) -> Self {
                match vendor_reason_code {
                    $($name::$item => $footprint_reason_codes),*
                }
            }
        }

    }
}
pub(crate) use vendor_reason_codes_enum;

macro_rules! lexis_name_address_ssn_enum {
    (
        $(#[$macros:meta])*
        pub enum $name:ident {
            $(#[ser = $ser:literal] #[nas = $nas:expr] $item:ident),*
        }
    ) => {
        $(#[$macros])*
        pub enum $name {
            $(#[strum(to_string = $ser)] $item,)*
        }

        impl $name {
            pub fn name_address_ssn_matches(&self) -> LexisNAS {
                match self {
                    $(Self::$item => $nas),*
                }
            }
        }
    }
}
pub(crate) use lexis_name_address_ssn_enum;

macro_rules! lexis_name_address_phone_enum {
    (
        $(#[$macros:meta])*
        pub enum $name:ident {
            $(#[ser = $ser:literal] #[nap = $nap:expr] $item:ident),*
        }
    ) => {
        $(#[$macros])*
        pub enum $name {
            $(#[strum(to_string = $ser)] $item,)*
        }

        impl $name {
            pub fn name_address_phone_matches(&self) -> LexisNAP {
                match self {
                    $(Self::$item => $nap),*
                }
            }
        }
    }
}
pub(crate) use lexis_name_address_phone_enum;

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize)]
#[serde(try_from = "&str")]
#[serde(untagged)]
pub enum ReasonCode {
    IDology(IDologyReasonCode),
    Other(String),
}

impl FromStr for ReasonCode {
    type Err = crate::Error;

    fn from_str(value: &str) -> Result<Self, Self::Err> {
        Self::try_from(value)
    }
}

impl TryFrom<&str> for ReasonCode {
    type Error = crate::Error;

    fn try_from(value: &str) -> Result<Self, Self::Error> {
        let value = if let Ok(value) = IDologyReasonCode::from_str(value) {
            ReasonCode::IDology(value)
        } else {
            ReasonCode::Other(value.to_owned())
        };
        Ok(value)
    }
}

impl ToString for ReasonCode {
    fn to_string(&self) -> String {
        match self {
            ReasonCode::IDology(idology) => idology.to_string(),
            ReasonCode::Other(s) => s.to_owned(),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use test_case::test_case;

    #[test_case("idphone.not.available" => ReasonCode::IDology(IDologyReasonCode::PhoneNumberIsUnlistedOrUnavailable))]
    #[test_case("resultcode.coppa.alert" => ReasonCode::IDology(IDologyReasonCode::CoppaAlert))]
    #[test_case("flerpderp" => ReasonCode::Other("flerpderp".to_owned()))]
    fn test_deserialize(input: &str) -> ReasonCode {
        ReasonCode::from_str(input).unwrap()
    }

    #[test_case(ReasonCode::IDology(IDologyReasonCode::PhoneNumberIsUnlistedOrUnavailable) => r#""idphone.not.available""#)]
    #[test_case(ReasonCode::IDology(IDologyReasonCode::CoppaAlert) => r#""resultcode.coppa.alert""#)]
    #[test_case(ReasonCode::Other("flerpderp".to_owned()) => r#""flerpderp""#)]
    fn test_serialize(input: ReasonCode) -> String {
        serde_json::ser::to_string(&input).unwrap()
    }
}
