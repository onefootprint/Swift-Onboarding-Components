use strum_macros::Display;

use crate::IdentityDataKind;

#[derive(Debug, Display, Clone)]
pub enum ContactInfoKind {
    Phone,
    Email,
}

impl From<ContactInfoKind> for IdentityDataKind {
    fn from(value: ContactInfoKind) -> Self {
        match value {
            ContactInfoKind::Phone => IdentityDataKind::PhoneNumber,
            ContactInfoKind::Email => IdentityDataKind::Email,
        }
    }
}
