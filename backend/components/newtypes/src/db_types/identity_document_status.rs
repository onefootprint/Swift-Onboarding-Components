use diesel::{sql_types::Text, AsExpression, FromSqlRow};
use paperclip::actix::Apiv2Schema;

use serde::{Deserialize, Serialize};
use strum_macros::{AsRefStr, EnumString};

#[derive(
    Debug,
    // be careful, this is the evil derive_more::Display
    derive_more::Display,
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
pub enum IdentityDocumentStatus {
    /// We should generate a requirement to collect this document. Either have documents to upload
    /// or haven't yet received a vendor response
    Pending,
    /// We reached the maximum retry limit and couldn't upload a document that satisfied vendors
    Failed,
    /// Processed response from vendor and they told us they could extract info from the image
    Complete,
}
crate::util::impl_enum_str_diesel!(IdentityDocumentStatus);

impl IdentityDocumentStatus {
    pub fn is_terminal(&self) -> bool {
        match self {
            Self::Pending => false,
            Self::Failed | Self::Complete => true,
        }
    }
}

#[derive(Debug, strum_macros::Display, Clone, Copy, AsExpression, FromSqlRow, EnumString)]
#[strum(serialize_all = "snake_case")]
#[diesel(sql_type = Text)]
pub enum DocumentReviewStatus {
    Unreviewed,
    ReviewedByMachine,
    ReviewedByHuman,
}

crate::util::impl_enum_string_diesel!(DocumentReviewStatus);
