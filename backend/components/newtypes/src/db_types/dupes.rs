use crate::DataIdentifier;
use derive_more::Display;
use paperclip::actix::Apiv2Schema;
use serde::{Deserialize, Serialize};
use strum_macros::{AsRefStr, EnumString};

#[derive(
    Debug,
    Eq,
    PartialEq,
    Ord,
    PartialOrd,
    Display,
    Hash,
    Clone,
    Copy,
    AsRefStr,
    Deserialize,
    Serialize,
    EnumString,
    Apiv2Schema,
)]
#[strum(serialize_all = "snake_case")]
#[serde(rename_all = "snake_case")]
pub enum DupeKind {
    Ssn9,
    Email,
    PhoneNumber,
}

impl TryFrom<DataIdentifier> for DupeKind {
    type Error = crate::Error;

    fn try_from(value: DataIdentifier) -> Result<Self, Self::Error> {
        match value {
            DataIdentifier::Id(idk) => match idk {
                crate::IdentityDataKind::Ssn9 => Ok(Self::Ssn9),
                crate::IdentityDataKind::Email => Ok(Self::Email),
                crate::IdentityDataKind::PhoneNumber => Ok(Self::PhoneNumber),
                _ => Err(crate::Error::Custom(
                    format!("Can't convert {} into DupeKind", value).to_owned(),
                )),
            },
            _ => Err(crate::Error::Custom(
                format!("Can't convert {} into DupeKind", value).to_owned(),
            )),
        }
    }
}
