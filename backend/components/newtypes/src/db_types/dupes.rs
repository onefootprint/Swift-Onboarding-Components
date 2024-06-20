use crate::CompositeFingerprintKind;
use crate::DataIdentifier;
use crate::FingerprintKind;
use paperclip::actix::Apiv2Schema;
use serde_with::DeserializeFromStr;
use serde_with::SerializeDisplay;
use strum_macros::Display;
use strum_macros::EnumString;

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
    DeserializeFromStr,
    SerializeDisplay,
    EnumString,
    Apiv2Schema,
    macros::SerdeAttr,
)]
#[strum(serialize_all = "snake_case")]
#[serde(rename_all = "snake_case")]
pub enum DupeKind {
    Ssn9,
    Email,
    PhoneNumber,
    NameDob,
    DeviceId,
    CookieId,
    Selfie,
}

impl TryFrom<FingerprintKind> for DupeKind {
    type Error = crate::Error;

    fn try_from(value: FingerprintKind) -> Result<Self, Self::Error> {
        match value {
            FingerprintKind::DI(DataIdentifier::Id(idk)) => match idk {
                crate::IdentityDataKind::Ssn9 => Ok(Self::Ssn9),
                crate::IdentityDataKind::Email => Ok(Self::Email),
                crate::IdentityDataKind::PhoneNumber => Ok(Self::PhoneNumber),
                _ => Err(crate::Error::Custom(
                    format!("Can't convert {} into DupeKind", value).to_owned(),
                )),
            },
            FingerprintKind::Composite(CompositeFingerprintKind::NameDob) => Ok(Self::NameDob),
            _ => Err(crate::Error::Custom(
                format!("Can't convert {} into DupeKind", value).to_owned(),
            )),
        }
    }
}
