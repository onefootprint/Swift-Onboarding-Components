mod experian;
mod experian_address_codes;
mod experian_phone_codes;
mod experian_ssn_codes;
mod idology;
mod lexis;
mod reason_code_helpers;
mod sentilink;
mod signal_attribute;
mod socure;

pub use experian::*;
pub use experian_address_codes::*;
pub use experian_phone_codes::*;
pub use experian_ssn_codes::*;
pub use idology::*;
pub use lexis::*;
pub use reason_code_helpers::*;
pub use sentilink::*;
pub use signal_attribute::*;
pub use socure::*;

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
            $(#[strum(to_string = $ser)] $item,)*
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
