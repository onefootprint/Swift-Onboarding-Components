use diesel::{sql_types::Text, AsExpression, FromSqlRow};
use paperclip::actix::Apiv2Schema;
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
    Apiv2Schema,
    macros::SerdeAttr,
)]
#[strum(serialize_all = "snake_case")]
#[serde(rename_all = "snake_case")]
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
    /// Vaulted via portable data from another tenant
    Prefill,
    /// Just for events that aren't backfilled
    Unknown,
}

crate::util::impl_enum_string_diesel!(DataLifetimeSource);

impl DataLifetimeSource {
    /// True if this DataLifetimeSource implies that the end user themselves added the piece of data
    pub fn is_added_by_user(&self) -> bool {
        match self {
            Self::Hosted | Self::Prefill => true,
            // ClientTenant
            Self::ClientTenant | Self::Tenant | Self::Ocr | Self::Unknown => false,
        }
    }
}
