use diesel::{sql_types::Text, AsExpression, FromSqlRow};
use paperclip::actix::Apiv2Schema;
use serde_with::{DeserializeFromStr, SerializeDisplay};
use strum::EnumIter;
use strum_macros::Display;

use strum_macros::EnumString;

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
    Apiv2Schema,
    EnumIter,
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

    pub fn should_initiate_incode_requests(&self) -> bool {
        self.is_identity()
    }
}

crate::util::impl_enum_string_diesel!(DocumentRequestKind);
