use diesel::{sql_types::Text, AsExpression, FromSqlRow};
use paperclip::actix::Apiv2Schema;
use serde_with::{DeserializeFromStr, SerializeDisplay};
use strum_macros::Display;

use strum_macros::EnumString;

use crate::DocKind;

#[derive(
    Debug,
    Display,
    Clone,
    Copy,
    Eq,
    PartialEq,
    Ord,
    PartialOrd,
    AsExpression,
    FromSqlRow,
    EnumString,
    SerializeDisplay,
    DeserializeFromStr,
    macros::SerdeAttr,
    Apiv2Schema
)]
#[strum(serialize_all = "snake_case")]
#[serde(rename_all = "snake_case")]
#[diesel(sql_type = Text)]
pub enum DocumentRequestKind {
    Identity,
    ProofOfSsn,
    ProofOfAddress,
}
impl DocumentRequestKind {
    pub fn is_identity(&self) -> bool {
        matches!(self, DocumentRequestKind::Identity)
    }
}

impl From<DocKind> for DocumentRequestKind {
    fn from(value: DocKind) -> Self {
        match value {
            DocKind::Identity => Self::Identity,
            DocKind::ProofOfSsn => Self::ProofOfSsn,
            DocKind::ProofOfAddress => Self::ProofOfAddress,
        }
    }
}

crate::util::impl_enum_string_diesel!(DocumentRequestKind);
