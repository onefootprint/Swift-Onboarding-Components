use diesel::{sql_types::Text, AsExpression, FromSqlRow};
use serde_with::{DeserializeFromStr, SerializeDisplay};
use strum_macros::{Display, EnumIter, EnumString};

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
pub enum DataLifetimeSource {
    /// Vaulted via a hosted flow and entered by the user
    Hosted,
    /// Vaulted via hosted flow with client-tenant auth
    ClientTenant,
    /// Vaulted via tenant-facing API
    Tenant,
    /// Vaulted via derived OCR data
    Ocr,
    /// Just for events that aren't backfilled
    Unknown,
}
crate::util::impl_enum_string_diesel!(DataLifetimeSource);
