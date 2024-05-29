use diesel::sql_types::Text;
use diesel::{
    AsExpression,
    FromSqlRow,
};
use serde_with::{
    DeserializeFromStr,
    SerializeDisplay,
};
use strum_macros::{
    Display,
    EnumIter,
    EnumString,
};

#[derive(
    Debug,
    Eq,
    PartialEq,
    Ord,
    PartialOrd,
    Display,
    Hash,
    Clone,
    Copy,
    DeserializeFromStr,
    SerializeDisplay,
    AsExpression,
    FromSqlRow,
    EnumString,
    EnumIter,
)]
#[strum(serialize_all = "snake_case")]
#[diesel(sql_type = Text)]
pub enum AccessEventPurpose {
    /// Access for the vault proxy
    VaultProxy,
    /// Decryption for the reflect endpoint
    Reflect,
    /// Operation occurred via generic API
    Api,
    /// Just for events that aren't backfilled
    Unknown,
}
crate::util::impl_enum_string_diesel!(AccessEventPurpose);
