use diesel::{sql_types::Text, AsExpression, FromSqlRow};
use paperclip::actix::Apiv2Schema;

use serde_with::{DeserializeFromStr, SerializeDisplay};
use strum::IntoEnumIterator;
use strum_macros::{Display, EnumIter, EnumString};

use crate::DocumentSide;

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
    SsnCard,
}

#[derive(Debug, Display, Clone, Copy, Eq, PartialEq)]
pub enum DocKind {
    Identity,
    ProofOfSsn,
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
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, EnumIter)]
#[serde(rename_all = "snake_case")]
pub enum AlpacaDocumentType {
    DriversLicense,
    NationalId,
    Passport,
    Visa,
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
        }
    }
}
