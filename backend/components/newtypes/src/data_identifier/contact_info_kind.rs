use paperclip::actix::Apiv2Schema;
use strum_macros::Display;

use crate::{AuthEventKind, DataIdentifier, IdentityDataKind};

#[derive(
    Debug,
    Clone,
    Eq,
    PartialEq,
    Hash,
    Apiv2Schema,
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

#[derive(Debug, Clone, Copy, Apiv2Schema, serde::Serialize, serde::Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum ActionKind {
    /// Replace the existing auth method.
    Replace,
    /// Add the provided auth method, where an auth method of this kind doesn't already exist.
    /// Adding a secondary credential will be a different operation kind.
    AddPrimary,
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
