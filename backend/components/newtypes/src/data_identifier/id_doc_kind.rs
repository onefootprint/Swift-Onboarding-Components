use diesel::{sql_types::Text, AsExpression, FromSqlRow};
use paperclip::actix::Apiv2Schema;
use schemars::JsonSchema;
use serde_with::{DeserializeFromStr, SerializeDisplay};
use strum_macros::{Display, EnumIter, EnumString};

use crate::DocumentSide;

/// This is horrible. In some internal facing APIs and the DB, we serialize driver_license instead
/// of drivers_license.
/// The legacy enum is exposed via API and serialized in the DB, so it's a larger project to
/// migrate away from. But, we want to use the more modern representation in customer-facing APIs
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
    JsonSchema,
    Apiv2Schema,
    EnumIter,
    AsExpression,
    FromSqlRow,
)]
#[strum(serialize_all = "snake_case")]
#[diesel(sql_type = Text)]
pub enum IdDocKind {
    IdCard,
    DriversLicense,
    Passport,
    Permit,
    Visa,
    ResidenceDocument,
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
        }
    }

    pub fn front_only(&self) -> bool {
        self.sides() == vec![DocumentSide::Front]
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
        match value {
            IdDocKind::IdCard => Ok(AlpacaDocumentType::NationalId),
            IdDocKind::DriversLicense => Ok(AlpacaDocumentType::DriversLicense),
            IdDocKind::Passport => Ok(AlpacaDocumentType::Passport),
            IdDocKind::Visa => Ok(AlpacaDocumentType::Visa),
            IdDocKind::Permit => Err(crate::Error::Custom(
                "not a supported alpaca document type".into(),
            )),
            IdDocKind::ResidenceDocument => Err(crate::Error::Custom(
                "not a supported alpaca document type".into(),
            )),
        }
    }
}
