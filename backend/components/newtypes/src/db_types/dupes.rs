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
    NameSsn4,
    DobSsn4,
    BankRoutingAccount,
    CardNumberCvc,
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
            FingerprintKind::Composite(cfk) => match cfk {
                CompositeFingerprintKind::NameDob => Ok(Self::NameDob),
                CompositeFingerprintKind::DobSsn4 => Ok(Self::DobSsn4),
                CompositeFingerprintKind::NameSsn4 => Ok(Self::NameSsn4),
                CompositeFingerprintKind::BankRoutingAccount => Ok(Self::BankRoutingAccount),
                CompositeFingerprintKind::CardNumberCvc => Ok(Self::CardNumberCvc),
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
