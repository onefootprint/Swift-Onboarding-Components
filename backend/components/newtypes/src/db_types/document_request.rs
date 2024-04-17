use crate::CustomDocumentConfig;
use diesel::{sql_types::Text, AsExpression, FromSqlRow};
use diesel_as_jsonb::AsJsonb;
use paperclip::actix::Apiv2Schema;
use serde_with::{DeserializeFromStr, SerializeDisplay};
use strum::{EnumDiscriminants, EnumIter};
use strum_macros::Display;

use strum_macros::EnumString;

#[derive(Debug, Clone, Eq, PartialEq, serde::Serialize, serde::Deserialize, AsJsonb, EnumDiscriminants)]
#[serde(rename_all = "snake_case")]
#[serde(tag = "kind", content = "data")]
#[strum_discriminants(
    name(DocumentRequestKind),
    derive(
        Display,
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
    ),
    vis(pub),
    strum(serialize_all = "snake_case"),
    diesel(sql_type = Text)
)]
pub enum DocumentRequestConfig {
    Identity { collect_selfie: bool },
    ProofOfSsn {},
    ProofOfAddress {},
    Custom(CustomDocumentConfig),
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
