use diesel::{sql_types::Text, AsExpression, FromSqlRow};
use paperclip::actix::Apiv2Schema;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use strum_macros::{AsRefStr, Display, EnumIter, EnumString};

use crate::DataIdentifier;

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
pub enum DocumentKind {
    /// Letter signed by a compliance officer granting permission to carry an account, required by FINFRA rules in certain cases
    FinraComplianceLetter,
}
// TODO: one day merge IdDocKind into here

impl From<DocumentKind> for DataIdentifier {
    fn from(value: DocumentKind) -> Self {
        Self::Document(value)
    }
}

crate::util::impl_enum_str_diesel!(DocumentKind);
