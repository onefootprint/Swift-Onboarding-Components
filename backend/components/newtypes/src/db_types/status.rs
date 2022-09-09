pub use derive_more::Display;
use diesel::{sql_types::Text, AsExpression, FromSqlRow};
use paperclip::actix::Apiv2Schema;
use serde::{Deserialize, Serialize};
use strum_macros::{AsRefStr, EnumString};

use crate::{util::impl_enum_str_diesel, VerificationInfoStatus};

/// Determines what integration the app has.
///
/// Custom indicates that there is no other integration.
#[derive(
    Debug,
    Display,
    Clone,
    Copy,
    Deserialize,
    Serialize,
    Apiv2Schema,
    PartialEq,
    Eq,
    Ord,
    PartialOrd,
    AsExpression,
    FromSqlRow,
    EnumString,
    AsRefStr,
)]
#[serde(rename_all = "snake_case")]
#[strum(serialize_all = "PascalCase")]
#[diesel(sql_type = Text)]
pub enum Status {
    Processing,
    ManualReview,
    Failed,
    Verified,
}

impl Default for Status {
    fn default() -> Self {
        Status::Processing
    }
}

impl Status {
    pub fn audit_status(&self) -> Option<VerificationInfoStatus> {
        // Based on the Status of the onboarding, infer the status to use for the final audit trail event
        match self {
            Self::Processing => None,
            Self::ManualReview => Some(VerificationInfoStatus::Failed),
            Self::Failed => Some(VerificationInfoStatus::Failed),
            Self::Verified => Some(VerificationInfoStatus::Verified),
        }
    }
}

impl_enum_str_diesel!(Status);

#[cfg(test)]
mod tests {
    use std::cmp::Ordering;
    use test_case::test_case;

    use super::Status;
    use super::Status::*;

    #[test_case(Processing, ManualReview => Ordering::Less)]
    #[test_case(Processing, Failed => Ordering::Less)]
    #[test_case(Failed, Verified => Ordering::Less)]
    #[test_case(ManualReview, Verified => Ordering::Less)]
    fn test_cmp(a: Status, b: Status) -> Ordering {
        // We rely on the ordering of Statuses, so test them here
        a.cmp(&b)
    }
}
