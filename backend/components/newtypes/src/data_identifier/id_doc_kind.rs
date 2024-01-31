use diesel::{sql_types::Text, AsExpression, FromSqlRow};
use paperclip::actix::Apiv2Schema;

use serde_with::{DeserializeFromStr, SerializeDisplay};
use strum::IntoEnumIterator;
use strum_macros::{Display, EnumIter, EnumString};

use crate::{DocumentSide, OcrDataKind as ODK};

#[derive(
    Debug,
    Display,
    Clone,
    Copy,
    Eq,
    PartialEq,
    Hash,
    DeserializeFromStr,
    SerializeDisplay,
    EnumString,
    Apiv2Schema,
    EnumIter,
    AsExpression,
    FromSqlRow,
    macros::SerdeAttr,
)]
#[strum(serialize_all = "snake_case")]
#[serde(rename_all = "snake_case")]
#[diesel(sql_type = Text)]
pub enum IdDocKind {
    IdCard,
    DriversLicense,
    Passport,
    Permit,
    Visa,
    ResidenceDocument,
    VoterIdentification,
    // Proof of ssn
    SsnCard,
    // Proof of address
    // For now, we'll only have a single PoA document per vault to make the FE UI more flexible to build
    ProofOfAddress,
}

#[derive(Debug, Display, Clone, Copy, Eq, PartialEq, Hash, PartialOrd, Ord, EnumString)]
#[strum(serialize_all = "snake_case")]
pub enum DocKind {
    Identity,
    ProofOfSsn,
    ProofOfAddress,
}
impl DocKind {
    pub fn should_initiate_incode_requests(&self) -> bool {
        self.is_identity()
    }

    pub fn is_identity(&self) -> bool {
        matches!(self, Self::Identity)
    }
}

impl From<IdDocKind> for DocKind {
    fn from(value: IdDocKind) -> Self {
        match value {
            IdDocKind::IdCard => Self::Identity,
            IdDocKind::DriversLicense => Self::Identity,
            IdDocKind::Passport => Self::Identity,
            IdDocKind::Permit => Self::Identity,
            IdDocKind::Visa => Self::Identity,
            IdDocKind::ResidenceDocument => Self::Identity,
            IdDocKind::VoterIdentification => Self::Identity,
            IdDocKind::SsnCard => Self::ProofOfSsn,
            IdDocKind::ProofOfAddress => Self::ProofOfAddress,
        }
    }
}

crate::util::impl_enum_string_diesel!(IdDocKind);

impl IdDocKind {
    pub fn sides(&self) -> Vec<DocumentSide> {
        match self {
            Self::DriversLicense => vec![DocumentSide::Front, DocumentSide::Back],
            Self::IdCard => vec![DocumentSide::Front, DocumentSide::Back],
            Self::Passport => vec![DocumentSide::Front],
            // Incode guidance for permit/visa/residence card
            // https://onefootprint.slack.com/archives/C0514LEFUCS/p1692216160166659?thread_ts=1692213991.014079&cid=C0514LEFUCS
            Self::Permit => vec![DocumentSide::Front, DocumentSide::Back],
            Self::Visa => vec![DocumentSide::Front],
            Self::ResidenceDocument => vec![DocumentSide::Front, DocumentSide::Back],
            Self::VoterIdentification => vec![DocumentSide::Front, DocumentSide::Back],
            Self::SsnCard => vec![DocumentSide::Front],
            Self::ProofOfAddress => vec![DocumentSide::Front],
        }
    }

    pub fn front_only(&self) -> bool {
        self.sides() == vec![DocumentSide::Front]
    }

    pub fn identity_docs() -> Vec<IdDocKind> {
        IdDocKind::iter()
            .filter(|id| DocKind::from(*id) == DocKind::Identity)
            .collect()
    }

    pub fn proof_of_address_docs() -> Vec<IdDocKind> {
        IdDocKind::iter()
            .filter(|id| DocKind::from(*id) == DocKind::ProofOfAddress)
            .collect()
    }

    // Given the type of document, what are the expected/critical fields we expect to parse from that doc. If we don't parse (or have a very low confidence score)
    // for one of these for a given doc, then we should produce the DocumentOcrNotSuccessful risk signal as a way to indicate to users/rules this
    pub fn expected_ciritical_ocr_data_kinds(&self) -> Vec<ODK> {
        match self {
            IdDocKind::IdCard => vec![ODK::FullName],
            IdDocKind::DriversLicense => vec![
                ODK::FullName,
                ODK::Dob,
                ODK::FullAddress,
                ODK::DocumentNumber,
                ODK::ExpiresAt,
            ], // TODO: should Gender, IssuedAt be here too? These seem less "critical" but are still present
            IdDocKind::Passport => vec![ODK::FullName, ODK::DocumentNumber], // lots of different kinds of passports out there and stuff like DOB is def not ubiquitous
            IdDocKind::Permit => vec![
                ODK::FullName,
                ODK::Dob,
                ODK::FullAddress,
                ODK::DocumentNumber,
                ODK::ExpiresAt,
            ],
            IdDocKind::Visa => vec![ODK::FullName],
            IdDocKind::ResidenceDocument => vec![ODK::FullName],
            IdDocKind::VoterIdentification => vec![ODK::FullName],
            // In actuality, We don't parse anything from these.
            IdDocKind::SsnCard => vec![],
            IdDocKind::ProofOfAddress => vec![],
        }
    }
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, EnumIter)]
#[serde(rename_all = "snake_case")]
pub enum AlpacaDocumentType {
    DriversLicense,
    NationalId,
    Passport,
    Visa,
    ProofOfAddress,
}

impl TryFrom<IdDocKind> for AlpacaDocumentType {
    type Error = crate::Error;

    fn try_from(value: IdDocKind) -> Result<Self, Self::Error> {
        let msg = "not a supported alpaca document type";
        match value {
            IdDocKind::IdCard => Ok(AlpacaDocumentType::NationalId),
            IdDocKind::DriversLicense => Ok(AlpacaDocumentType::DriversLicense),
            IdDocKind::Passport => Ok(AlpacaDocumentType::Passport),
            IdDocKind::Visa => Ok(AlpacaDocumentType::Visa),
            IdDocKind::Permit => Err(crate::Error::Custom(msg.into())),
            IdDocKind::ResidenceDocument => Err(crate::Error::Custom(msg.into())),
            IdDocKind::VoterIdentification => Err(crate::Error::Custom(msg.into())),
            IdDocKind::SsnCard => Err(crate::Error::Custom(msg.into())),
            IdDocKind::ProofOfAddress => Ok(AlpacaDocumentType::ProofOfAddress),
        }
    }
}
