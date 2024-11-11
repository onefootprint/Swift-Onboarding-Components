use diesel::sql_types::Text;
use diesel::AsExpression;
use diesel::FromSqlRow;
use paperclip::actix::Apiv2Schema;
use serde::Deserialize;
use serde::Serialize;
use serde_with::SerializeDisplay;
use strum_macros::AsRefStr;
use strum_macros::EnumString;

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
pub enum DocumentStatus {
    /// We should generate a requirement to collect this document. Either have documents to upload
    /// or haven't yet received a vendor response
    Pending,
    /// We reached the maximum retry limit and couldn't upload a document that satisfied vendors
    Failed,
    /// Processed response from vendor and they told us they could extract info from the image
    Complete,
    /// A user started uploading a document but did not complete the upload either because the
    /// workflow was abandoned or the user started uploading a different document type mid-workflow
    Abandoned,
}
crate::util::impl_enum_str_diesel!(DocumentStatus);

impl DocumentStatus {
    pub fn is_terminal(&self) -> bool {
        match self {
            Self::Pending => false,
            Self::Failed | Self::Complete | Self::Abandoned => true,
        }
    }

    pub fn description(&self) -> String {
        let s = match self {
            Self::Pending => "Awaiting in process of uploading a document",
            Self::Failed => "User failed to upload a document successfully",
            Self::Complete => "User completed uploading the document",
            Self::Abandoned => "User started uploading but did not complete",
        };

        s.to_string()
    }
}

#[derive(
    Debug,
    strum_macros::Display,
    Clone,
    Copy,
    AsExpression,
    FromSqlRow,
    EnumString,
    Eq,
    PartialEq,
    SerializeDisplay,
    Apiv2Schema,
    macros::SerdeAttr,
)]
#[strum(serialize_all = "snake_case")]
#[serde(rename_all = "snake_case")]
#[diesel(sql_type = Text)]
pub enum DocumentReviewStatus {
    /// The document has been created and a human or machine review has not occured.
    Unreviewed,
    /// The document does not need review by human or machine
    NotNeeded,
    /// The document is uploaded and we've started the process of verifying the document via a
    /// machine
    PendingMachineReview,
    /// The document has been automatically processed with a vendor
    ReviewedByMachine,
    /// The document is uploaded and ready to be reviewed by a human
    PendingHumanReview,
    /// The document has been manually reviewed by a human
    ReviewedByHuman,
}

crate::util::impl_enum_string_diesel!(DocumentReviewStatus);
