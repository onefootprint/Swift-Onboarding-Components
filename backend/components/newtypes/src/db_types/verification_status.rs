use diesel::{sql_types::Text, AsExpression, FromSqlRow};
use paperclip::actix::Apiv2Schema;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use strum_macros::{AsRefStr, Display, EnumIter, EnumString};

use crate::OnboardingStatus;

/// The type of requirement
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
    Deserialize,
    Serialize,
    Apiv2Schema,
    EnumIter,
    EnumString,
    AsExpression,
    FromSqlRow,
    AsRefStr,
    JsonSchema,
)]
#[strum(serialize_all = "snake_case")]
#[serde(rename_all = "snake_case")]
#[diesel(sql_type = Text)]
pub enum VerificationStatus {
    InformationRequired,
    Failed,
    Verified,
    NeedsIdDocument,
}
crate::util::impl_enum_str_diesel!(VerificationStatus);

impl From<OnboardingStatus> for VerificationStatus {
    fn from(ob_status: OnboardingStatus) -> Self {
        match ob_status {
            OnboardingStatus::Processing => Self::InformationRequired,
            // Temp, this will need to change.
            OnboardingStatus::StepUpRequired => Self::NeedsIdDocument,
            OnboardingStatus::Verified => Self::Verified,
            OnboardingStatus::Failed => Self::Failed,
        }
    }
}
