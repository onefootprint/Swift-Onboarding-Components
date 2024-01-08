use strum_macros::Display;

use crate::{AuthEventKind, DataIdentifier, IdentityDataKind};

#[derive(Debug, Display, Clone, Copy, Eq, PartialEq)]
pub enum ContactInfoKind {
    Phone,
    Email,
}

impl From<ContactInfoKind> for DataIdentifier {
    fn from(value: ContactInfoKind) -> Self {
        match value {
            ContactInfoKind::Phone => DataIdentifier::Id(IdentityDataKind::PhoneNumber),
            ContactInfoKind::Email => DataIdentifier::Id(IdentityDataKind::Email),
        }
    }
}

impl From<ContactInfoKind> for AuthEventKind {
    fn from(value: ContactInfoKind) -> Self {
        match value {
            ContactInfoKind::Phone => AuthEventKind::Sms,
            ContactInfoKind::Email => AuthEventKind::Email,
        }
    }
}
