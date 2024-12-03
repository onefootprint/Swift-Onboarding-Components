use crate::CompositeFingerprintKind;
use crate::DataIdentifier;
use crate::DocumentDiKind;
use crate::FingerprintKind;
use crate::IdentityDataKind as IDK;
use crate::OcrDataKind as ODK;
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
    IdentityDocumentNumber,
}

impl TryFrom<FingerprintKind> for DupeKind {
    type Error = crate::Error;

    fn try_from(value: FingerprintKind) -> Result<Self, Self::Error> {
        match value {
            FingerprintKind::DI(DataIdentifier::Id(IDK::Ssn9)) => Ok(Self::Ssn9),
            FingerprintKind::DI(DataIdentifier::Id(IDK::Email)) => Ok(Self::Email),
            FingerprintKind::DI(DataIdentifier::Id(IDK::PhoneNumber)) => Ok(Self::PhoneNumber),
            FingerprintKind::DI(DataIdentifier::Document(DocumentDiKind::OcrData(
                _,
                ODK::DocumentNumber,
            ))) => Ok(Self::IdentityDocumentNumber),
            FingerprintKind::Composite(CompositeFingerprintKind::NameDob) => Ok(Self::NameDob),
            FingerprintKind::Composite(CompositeFingerprintKind::DobSsn4) => Ok(Self::DobSsn4),
            FingerprintKind::Composite(CompositeFingerprintKind::NameSsn4) => Ok(Self::NameSsn4),
            FingerprintKind::Composite(CompositeFingerprintKind::BankRoutingAccount) => {
                Ok(Self::BankRoutingAccount)
            }
            FingerprintKind::Composite(CompositeFingerprintKind::CardNumberCvc) => Ok(Self::CardNumberCvc),
            _ => Err(crate::Error::Custom(
                format!("Can't convert {} into DupeKind", value).to_owned(),
            )),
        }
    }
}
