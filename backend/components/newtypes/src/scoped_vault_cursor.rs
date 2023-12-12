use chrono::serde::ts_nanoseconds;
use chrono::DateTime;
use chrono::Utc;
use macros::SerdeAttr;
use paperclip::actix::Apiv2Schema;
use strum_macros::{EnumDiscriminants, EnumString};

#[derive(EnumDiscriminants)]
#[strum_discriminants(name(ScopedVaultCursorKind))]
#[strum_discriminants(derive(EnumString, serde_with::DeserializeFromStr, Default, SerdeAttr, Apiv2Schema))]
#[strum_discriminants(strum(serialize_all = "snake_case"))]
#[strum_discriminants(serde(rename_all = "snake_case"))]
#[strum_discriminants(vis(pub))]
pub enum ScopedVaultCursor {
    #[strum_discriminants(default)]
    OrderingId(i64),
    /// Note: we're cutting a little corner here - when using cursor pagination, the cursors must
    /// be unique or you could see duplicate results in the pages.
    /// Sadly, these timestamps are not unique. But it's difficult to have a last_activity_at
    /// otherwise.
    /// If we want to fix this bug, we can make the cursor a combined (timestamp, fp_id) order by
    LastActivityAt(DateTime<Utc>),
}

#[derive(Debug, serde::Serialize, serde::Deserialize)]
/// Nanosecond-serialized timestamp to be used as a pagination cursor
pub struct TimestampCursor(#[serde(with = "ts_nanoseconds")] pub DateTime<Utc>);

impl<'a> From<&'a TimestampCursor> for ScopedVaultCursor {
    fn from(value: &'a TimestampCursor) -> Self {
        Self::LastActivityAt(value.0)
    }
}

impl paperclip::v2::schema::TypedData for TimestampCursor {
    fn data_type() -> paperclip::v2::models::DataType {
        paperclip::v2::models::DataType::Integer
    }

    fn format() -> Option<paperclip::v2::models::DataTypeFormat> {
        None
    }
}
