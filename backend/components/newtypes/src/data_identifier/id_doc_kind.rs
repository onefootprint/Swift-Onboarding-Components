use diesel::{sql_types::Text, AsExpression, FromSqlRow};
use paperclip::actix::Apiv2Schema;
use schemars::JsonSchema;
use serde_with::{DeserializeFromStr, SerializeDisplay};
use strum_macros::{AsRefStr, Display, EnumIter, EnumString};

use crate::DocumentSide;

#[derive(
    Debug,
    Display,
    Clone,
    Copy,
    DeserializeFromStr,
    SerializeDisplay,
    Apiv2Schema,
    PartialEq,
    Eq,
    Ord,
    PartialOrd,
    Hash,
    AsExpression,
    FromSqlRow,
    EnumString,
    EnumIter,
    AsRefStr,
    JsonSchema,
)]
#[strum(serialize_all = "snake_case")]
#[diesel(sql_type = Text)]
/// The kind of an IdentityDocument
pub enum IdDocKind {
    IdCard,
    DriverLicense,
    Passport,
}

// TODO replace IdDocKind with ModernIdDocKind
/// This is horrible. In some internal facing APIs and the DB, we serialize driver_license instead
/// of drivers_license.
/// The legacy enum is exposed via API and serialized in the DB, so it's a larger project to
/// migrate away from. But, we want to use the more modern representation in customer-facing APIs
#[derive(
    Debug, Display, Clone, DeserializeFromStr, SerializeDisplay, EnumString, JsonSchema, Apiv2Schema, EnumIter,
)]
#[strum(serialize_all = "snake_case")]
pub enum ModernIdDocKind {
    IdCard,
    DriversLicense,
    Passport,
}

impl From<ModernIdDocKind> for IdDocKind {
    fn from(value: ModernIdDocKind) -> Self {
        match value {
            ModernIdDocKind::IdCard => Self::IdCard,
            ModernIdDocKind::DriversLicense => Self::DriverLicense,
            ModernIdDocKind::Passport => Self::Passport,
        }
    }
}

impl From<IdDocKind> for ModernIdDocKind {
    fn from(value: IdDocKind) -> Self {
        match value {
            IdDocKind::IdCard => Self::IdCard,
            IdDocKind::DriverLicense => Self::DriversLicense,
            IdDocKind::Passport => Self::Passport,
        }
    }
}

impl IdDocKind {
    pub fn sides(&self) -> Vec<DocumentSide> {
        match self {
            IdDocKind::DriverLicense => vec![DocumentSide::Front, DocumentSide::Back],
            IdDocKind::IdCard => vec![DocumentSide::Front, DocumentSide::Back],
            IdDocKind::Passport => vec![DocumentSide::Front],
        }
    }

    pub fn correct_fmt(&self) -> String {
        ModernIdDocKind::from(*self).to_string()
    }

    pub fn correct_from_str(v: &str) -> Result<Self, strum::ParseError> {
        <ModernIdDocKind as std::str::FromStr>::from_str(v).map(|x| x.into())
    }
}

crate::util::impl_enum_str_diesel!(IdDocKind);

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum AlpacaDocumentType {
    DriversLicense,
    NationalId,
    Passport,
    Visa,
}

impl From<IdDocKind> for AlpacaDocumentType {
    fn from(value: IdDocKind) -> Self {
        match value {
            IdDocKind::IdCard => AlpacaDocumentType::NationalId,
            IdDocKind::DriverLicense => AlpacaDocumentType::DriversLicense,
            IdDocKind::Passport => AlpacaDocumentType::Passport,
        }
    }
}
