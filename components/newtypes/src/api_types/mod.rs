use crate::ValidatedPhoneNumber;

use self::{address::Address, dob::ValidatedDob, email::Email, name::Name, ssn::Ssn};

pub mod address;
pub mod dob;
pub mod email;
pub mod name;
pub mod phone_number;
pub mod ssn;

/// Trait that "leaks" sanitized output to a string
/// useful for writing + encrypting to vault, and integration with
/// external vendors
pub trait LeakToString {
    fn leak_to_string(self) -> String;
}

pub struct IdentifyRequest {
    pub first_name: Name,
    pub last_name: Name,
    pub address: Address,
    pub phone: ValidatedPhoneNumber,
    pub dob: ValidatedDob,
    pub email: Email,
    pub ssn: Ssn,
}
