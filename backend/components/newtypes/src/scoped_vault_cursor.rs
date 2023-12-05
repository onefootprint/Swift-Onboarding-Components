use chrono::serde::ts_nanoseconds;
use chrono::DateTime;
use chrono::Utc;
use macros::SerdeAttr;
use paperclip::actix::Apiv2Schema;
use strum_macros::{EnumDiscriminants, EnumString};

use crate::NtResult;

#[derive(Clone, Copy, serde::Serialize, EnumDiscriminants)]
#[strum_discriminants(name(ScopedVaultCursorKind))]
#[strum_discriminants(derive(EnumString, serde_with::DeserializeFromStr, Default, SerdeAttr, Apiv2Schema))]
#[strum_discriminants(strum(serialize_all = "snake_case"))]
#[strum_discriminants(serde(rename_all = "snake_case"))]
#[strum_discriminants(vis(pub))]
#[serde(untagged)]
pub enum ScopedVaultCursor {
    #[strum_discriminants(default)]
    OrderingId(i64),
    /// Note: we're cutting a little corner here - when using cursor pagination, the cursors must
    /// be unique or you could see duplicate results in the pages.
    /// Sadly, these timestamps are not unique. But it's difficult to have a last_activity_at
    /// otherwise.
    /// If we want to fix this bug, we can make the cursor a combined (timestamp, fp_id) order by
    /// Serialized as nanoseconds for a better display in user-facing URL querystrings
    #[serde(with = "ts_nanoseconds")]
    LastActivityAt(DateTime<Utc>),
}

#[derive(serde::Serialize, serde::Deserialize)]
struct TimestampCursor(#[serde(with = "ts_nanoseconds")] DateTime<Utc>);

impl paperclip::v2::schema::TypedData for ScopedVaultCursor {
    fn data_type() -> paperclip::v2::models::DataType {
        // Not technically true, but we can deprecate this
        paperclip::v2::models::DataType::String
    }

    fn format() -> Option<paperclip::v2::models::DataTypeFormat> {
        None
    }
}

impl ScopedVaultCursorKind {
    /// Parses the cursor as the correct kind using the provided `order_by`
    pub fn parse(&self, v: &str) -> NtResult<ScopedVaultCursor> {
        let result = match self {
            Self::OrderingId => ScopedVaultCursor::OrderingId(v.parse()?),
            Self::LastActivityAt => {
                let v: TimestampCursor = serde_json::from_str(v)?;
                ScopedVaultCursor::LastActivityAt(v.0)
            }
        };
        Ok(result)
    }
}
