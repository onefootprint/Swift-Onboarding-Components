pub use derive_more::Display;
use diesel::{sql_types::Text, AsExpression, FromSqlRow};
use paperclip::actix::Apiv2Schema;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use strum_macros::{AsRefStr, EnumString};

use crate::{RequirementStatus, VerificationInfoStatus};

/// The type of data attribute
#[derive(
    Debug,
    Display,
    Clone,
    Copy,
    Eq,
    PartialEq,
    Ord,
    PartialOrd,
    Deserialize,
    Serialize,
    AsExpression,
    FromSqlRow,
    EnumString,
    AsRefStr,
    Apiv2Schema,
    JsonSchema,
)]
#[strum(serialize_all = "snake_case")]
#[serde(rename_all = "snake_case")]
#[diesel(sql_type = Text)]
pub enum KycStatus {
    New,
    Processing,
    ManualReview,
    StepUpRequired,
    Verified,
    Failed,
}

impl KycStatus {
    pub fn audit_status(&self) -> Option<VerificationInfoStatus> {
        // Based on the Status of the onboarding, infer the status to use for the final audit trail event
        match self {
            Self::New => None,
            Self::Processing => None,
            Self::ManualReview => Some(VerificationInfoStatus::Failed),
            Self::StepUpRequired => Some(VerificationInfoStatus::Failed),
            Self::Verified => Some(VerificationInfoStatus::Verified),
            Self::Failed => Some(VerificationInfoStatus::Failed),
        }
    }

    /// Api-visible status that hides KYC failures from the client side.
    pub fn public_status(&self) -> RequirementStatus {
        match self {
            Self::New => RequirementStatus::Pending,
            Self::Processing => RequirementStatus::Pending,
            Self::ManualReview => RequirementStatus::Complete,
            Self::StepUpRequired => RequirementStatus::Complete,
            Self::Verified => RequirementStatus::Complete,
            Self::Failed => RequirementStatus::Complete,
        }
    }
}

crate::util::impl_enum_str_diesel!(KycStatus);

#[cfg(test)]
mod tests {
    use std::cmp::Ordering;
    use test_case::test_case;

    use super::KycStatus;
    use super::KycStatus::*;

    #[test_case(New, Processing => Ordering::Less)]
    #[test_case(Processing, ManualReview => Ordering::Less)]
    #[test_case(Processing, StepUpRequired => Ordering::Less)]
    #[test_case(Processing, Failed => Ordering::Less)]
    #[test_case(ManualReview, Failed => Ordering::Less)]
    #[test_case(ManualReview, Verified => Ordering::Less)]
    #[test_case(StepUpRequired, Failed=> Ordering::Less)]
    #[test_case(StepUpRequired, Verified=> Ordering::Less)]
    fn test_cmp(a: KycStatus, b: KycStatus) -> Ordering {
        // We rely on the ordering of KycStatuses, so test them here
        a.cmp(&b)
    }
}
