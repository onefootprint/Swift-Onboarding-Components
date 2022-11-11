pub use derive_more::Display;
use diesel::{sql_types::Text, AsExpression, FromSqlRow};
use paperclip::actix::Apiv2Schema;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use strum_macros::{AsRefStr, EnumString};

use crate::RequirementStatus;

/// The status of the onboarding. This includes in-progress statuses
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
pub enum OnboardingStatus {
    // TODO remove Processing too
    Processing,
    StepUpRequired,
    Verified,
    Failed,
}

impl OnboardingStatus {
    /// Api-visible status that hides KYC failures from the client side.
    pub fn public_status(&self) -> RequirementStatus {
        match self {
            Self::Processing => RequirementStatus::Pending,
            Self::StepUpRequired => RequirementStatus::Complete,
            Self::Verified => RequirementStatus::Complete,
            Self::Failed => RequirementStatus::Complete,
        }
    }
}

crate::util::impl_enum_str_diesel!(OnboardingStatus);

#[cfg(test)]
mod tests {
    use std::cmp::Ordering;
    use test_case::test_case;

    use super::OnboardingStatus;
    use super::OnboardingStatus::*;

    #[test_case(Processing, StepUpRequired => Ordering::Less)]
    #[test_case(Processing, Failed => Ordering::Less)]
    #[test_case(StepUpRequired, Failed=> Ordering::Less)]
    #[test_case(StepUpRequired, Verified=> Ordering::Less)]
    fn test_cmp(a: OnboardingStatus, b: OnboardingStatus) -> Ordering {
        // We rely on the ordering of KycStatuses, so test them here
        a.cmp(&b)
    }
}
