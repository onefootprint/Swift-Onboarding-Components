use strum_macros::Display;

use crate::{AuthEventKind, DataIdentifier, IdentityDataKind};

#[derive(
    Debug,
    Clone,
    Eq,
    PartialEq,
    Hash,
    paperclip::actix::Apiv2Schema,
    serde_with::SerializeDisplay,
    serde_with::DeserializeFromStr,
    strum_macros::Display,
    strum_macros::EnumString,
    macros::SerdeAttr,
)]
#[strum(serialize_all = "snake_case")]
#[serde(rename_all = "snake_case")]
pub enum AuthMethodKind {
    Phone,
    Passkey,
    Email,
}

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
