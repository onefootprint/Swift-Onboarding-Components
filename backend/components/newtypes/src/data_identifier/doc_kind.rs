use diesel::{sql_types::Text, AsExpression, FromSqlRow};
use paperclip::actix::Apiv2Schema;

use serde_with::{DeserializeFromStr, SerializeDisplay};
use strum_macros::{Display, EnumIter, EnumString};

use crate::{DocumentRequestKind, DocumentSide, OcrDataKind as ODK};

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
    EnumIter, // TODO rm?
    AsExpression,
    FromSqlRow,
    macros::SerdeAttr,
)]
#[strum(serialize_all = "snake_case")]
#[serde(rename_all = "snake_case")]
#[diesel(sql_type = Text)]
/// The set of values we can use for identity_document.document_type
pub enum DocumentKind {
    // TODO should we nest IdDocKind here?
    IdCard,
    DriversLicense,
    Passport,
    PassportCard,
    Permit,
    Visa,
    ResidenceDocument,
    VoterIdentification,
    SsnCard,
    ProofOfAddress,
    Custom,
}

crate::util::impl_enum_string_diesel!(DocumentKind);

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
    macros::SerdeAttr,
)]
#[strum(serialize_all = "snake_case")]
#[serde(rename_all = "snake_case")]
/// This is the set of document kinds that are verifiable with incode. They are govt-issued docs,
/// and they all support having a selfie uploaded alongside them.
pub enum IdDocKind {
    IdCard,
    DriversLicense,
    Passport,
    PassportCard,
    Permit,
    Visa,
    ResidenceDocument,
    VoterIdentification,
}

impl TryFrom<DocumentKind> for IdDocKind {
    type Error = crate::Error;

    fn try_from(value: DocumentKind) -> Result<Self, Self::Error> {
        match value {
            DocumentKind::IdCard => Ok(IdDocKind::IdCard),
            DocumentKind::DriversLicense => Ok(IdDocKind::DriversLicense),
            DocumentKind::Passport => Ok(IdDocKind::Passport),
            DocumentKind::PassportCard => Ok(IdDocKind::PassportCard),
            DocumentKind::Permit => Ok(IdDocKind::Permit),
            DocumentKind::Visa => Ok(IdDocKind::Visa),
            DocumentKind::ResidenceDocument => Ok(IdDocKind::ResidenceDocument),
            DocumentKind::VoterIdentification => Ok(IdDocKind::VoterIdentification),
            DocumentKind::SsnCard | DocumentKind::ProofOfAddress | DocumentKind::Custom => {
                Err(crate::Error::AssertionError("Cannot map into IdDocKind".into()))
            }
        }
    }
}

impl From<IdDocKind> for DocumentKind {
    fn from(value: IdDocKind) -> Self {
        match value {
            IdDocKind::IdCard => DocumentKind::IdCard,
            IdDocKind::DriversLicense => DocumentKind::DriversLicense,
            IdDocKind::Passport => DocumentKind::Passport,
            IdDocKind::PassportCard => DocumentKind::PassportCard,
            IdDocKind::Permit => DocumentKind::Permit,
            IdDocKind::Visa => DocumentKind::Visa,
            IdDocKind::ResidenceDocument => DocumentKind::ResidenceDocument,
            IdDocKind::VoterIdentification => DocumentKind::VoterIdentification,
        }
    }
}

impl From<DocumentKind> for DocumentRequestKind {
    fn from(value: DocumentKind) -> Self {
        match value {
            DocumentKind::IdCard => Self::Identity,
            DocumentKind::DriversLicense => Self::Identity,
            DocumentKind::Passport => Self::Identity,
            DocumentKind::PassportCard => Self::Identity,
            DocumentKind::Permit => Self::Identity,
            DocumentKind::Visa => Self::Identity,
            DocumentKind::ResidenceDocument => Self::Identity,
            DocumentKind::VoterIdentification => Self::Identity,
            DocumentKind::SsnCard => Self::ProofOfSsn,
            DocumentKind::ProofOfAddress => Self::ProofOfAddress,
            DocumentKind::Custom => Self::Custom,
        }
    }
}

impl DocumentKind {
    pub fn sides(&self) -> Vec<DocumentSide> {
        match self {
            Self::DriversLicense => vec![DocumentSide::Front, DocumentSide::Back],
            Self::IdCard => vec![DocumentSide::Front, DocumentSide::Back],
            Self::Passport => vec![DocumentSide::Front],
            Self::PassportCard => vec![DocumentSide::Front, DocumentSide::Back],
            // Incode guidance for permit/visa/residence card
            // https://onefootprint.slack.com/archives/C0514LEFUCS/p1692216160166659?thread_ts=1692213991.014079&cid=C0514LEFUCS
            Self::Permit => vec![DocumentSide::Front, DocumentSide::Back],
            Self::Visa => vec![DocumentSide::Front],
            Self::ResidenceDocument => vec![DocumentSide::Front, DocumentSide::Back],
            Self::VoterIdentification => vec![DocumentSide::Front, DocumentSide::Back],
            Self::SsnCard => vec![DocumentSide::Front],
            Self::ProofOfAddress => vec![DocumentSide::Front],
            Self::Custom => vec![DocumentSide::Front],
        }
    }
}

impl IdDocKind {
    // Given the type of document, what are the expected/critical fields we expect to parse from that doc. If we don't parse (or have a very low confidence score)
    // for one of these for a given doc, then we should produce the DocumentOcrNotSuccessful risk signal as a way to indicate to users/rules this
    pub fn expected_critical_ocr_data_kinds(&self) -> Vec<ODK> {
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
            IdDocKind::PassportCard => vec![ODK::FullName, ODK::DocumentNumber], // lots of different kinds of passport cards out there and stuff like DOB is def not ubiquitous
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

impl TryFrom<DocumentKind> for AlpacaDocumentType {
    type Error = crate::Error;

    fn try_from(value: DocumentKind) -> Result<Self, Self::Error> {
        let msg = "not a supported alpaca document type";
        match value {
            DocumentKind::IdCard => Ok(AlpacaDocumentType::NationalId),
            DocumentKind::DriversLicense => Ok(AlpacaDocumentType::DriversLicense),
            DocumentKind::Passport => Ok(AlpacaDocumentType::Passport),
            DocumentKind::PassportCard => Ok(AlpacaDocumentType::NationalId),
            DocumentKind::Visa => Ok(AlpacaDocumentType::Visa),
            DocumentKind::Permit => Err(crate::Error::Custom(msg.into())),
            DocumentKind::ResidenceDocument => Err(crate::Error::Custom(msg.into())),
            DocumentKind::VoterIdentification => Err(crate::Error::Custom(msg.into())),
            DocumentKind::SsnCard => Err(crate::Error::Custom(msg.into())),
            DocumentKind::ProofOfAddress => Ok(AlpacaDocumentType::ProofOfAddress),
            DocumentKind::Custom => Err(crate::Error::Custom(msg.into())),
        }
    }
}
