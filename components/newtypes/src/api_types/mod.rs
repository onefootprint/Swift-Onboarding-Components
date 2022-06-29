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
