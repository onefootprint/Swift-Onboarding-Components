use diesel::{sql_types::Text, AsExpression, FromSqlRow};
use paperclip::actix::Apiv2Schema;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use strum_macros::{AsRefStr, Display, EnumIter, EnumString};

use crate::DocumentSide;

#[derive(
    Debug,
    Display,
    Clone,
    Copy,
    Deserialize,
    Serialize,
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
#[serde(rename_all = "snake_case")]
#[diesel(sql_type = Text)]
/// The kind of an IdentityDocument
pub enum IdDocKind {
    IdCard,
    DriverLicense,
    Passport,
}

impl IdDocKind {
    pub fn sides(&self) -> Vec<DocumentSide> {
        match self {
            IdDocKind::DriverLicense => vec![DocumentSide::Front, DocumentSide::Back],
            IdDocKind::IdCard => vec![DocumentSide::Front, DocumentSide::Back],
            IdDocKind::Passport => vec![DocumentSide::Front],
        }
    }
}

crate::util::impl_enum_str_diesel!(IdDocKind);
