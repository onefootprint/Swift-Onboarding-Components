pub use derive_more::Display;
use diesel::{sql_types::Text, AsExpression, FromSqlRow};
use paperclip::actix::Apiv2Schema;
use serde::{Deserialize, Serialize};
use strum_macros::{AsRefStr, EnumString};

#[derive(
    Debug,
    Display,
    Clone,
    Copy,
    Deserialize,
    Serialize,
    Apiv2Schema,
    AsExpression,
    FromSqlRow,
    EnumString,
    AsRefStr,
    PartialEq,
    Eq,
)]
#[strum(serialize_all = "snake_case")]
#[serde(rename_all = "snake_case")]
#[diesel(sql_type = Text)]
pub enum DocumentRequestStatus {
    // We should generate a requirement to collect this document
    Pending,
    // Document has been uploaded and verification request has been created. We haven't yet received or processed the response from the vendor yet
    // We will NOT generate a requirement
    Uploaded,
    // Processed response from vendor and they told us we couldn't extract information from the image (maybe it was a photo of a dog instead of a passport)
    Failed,
    // Processed response from vendor and they told us they could extract info from the image
    Complete,
}
crate::util::impl_enum_str_diesel!(DocumentRequestStatus);
