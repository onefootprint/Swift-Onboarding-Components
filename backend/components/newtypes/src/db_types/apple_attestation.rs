use diesel::sql_types::Text;
use diesel::{
    AsExpression,
    FromSqlRow,
};
use strum_macros::{
    AsRefStr,
    Display,
    EnumIter,
    EnumString,
};

/// The type of requirement
#[derive(
    Debug,
    Eq,
    PartialEq,
    Ord,
    PartialOrd,
    Display,
    serde_with::SerializeDisplay,
    Hash,
    Clone,
    Copy,
    EnumIter,
    EnumString,
    AsExpression,
    FromSqlRow,
    AsRefStr,
    Default,
    macros::SerdeAttr,
)]
#[strum(serialize_all = "snake_case")]
#[serde(rename_all = "snake_case")]
#[diesel(sql_type = Text)]
pub enum AppleAttestationReceiptType {
    /// directly from the device
    #[default]
    Attest,
    /// from apple's server
    Receipt,
}
crate::util::impl_enum_str_diesel!(AppleAttestationReceiptType);
