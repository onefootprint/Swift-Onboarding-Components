use crate::DecisionStatus;
use diesel::sql_types::Text;
use diesel::{
    AsExpression,
    FromSqlRow,
};
use paperclip::actix::Apiv2Schema;
use serde::{
    Deserialize,
    Serialize,
};
use strum::{
    Display,
    EnumIter,
};
use strum_macros::{
    AsRefStr,
    EnumString,
};

/// The status of the onboarding
#[derive(
    Debug,
    Clone,
    Copy,
    PartialEq,
    Eq,
    Deserialize,
    Serialize,
    AsRefStr,
    Apiv2Schema,
    FromSqlRow,
    AsExpression,
    EnumIter,
    EnumString,
    Display,
    Hash,
)]
#[strum(serialize_all = "snake_case")]
#[serde(rename_all = "snake_case")]
#[diesel(sql_type = Text)]
pub enum OnboardingStatus {
    /// Passed all checks
    Pass,
    /// Failed one or more check
    Fail,
    /// The user has not yet finished entering all information
    Incomplete,
    /// All required data has been collected. We are waiting for a decision
    Pending,
}

impl OnboardingStatus {
    pub fn requires_user_input(&self) -> bool {
        match self {
            OnboardingStatus::Pass => false,
            OnboardingStatus::Fail => false,
            OnboardingStatus::Incomplete => true,
            OnboardingStatus::Pending => false,
        }
    }

    pub fn has_decision(&self) -> bool {
        match self {
            OnboardingStatus::Pass => true,
            OnboardingStatus::Fail => true,
            OnboardingStatus::Incomplete => false,
            OnboardingStatus::Pending => false,
        }
    }
}

crate::util::impl_enum_str_diesel!(OnboardingStatus);

#[derive(
    Debug, Display, Clone, Copy, PartialEq, Eq, Deserialize, EnumString, AsRefStr, Apiv2Schema, EnumIter,
)]
#[strum(serialize_all = "snake_case")]
#[serde(rename_all = "snake_case")]
pub enum OnboardingStatusFilter {
    Pass,
    Fail,
    Incomplete,
    Pending,
    None,
}

impl OnboardingStatus {
    pub fn try_from(value: &OnboardingStatusFilter) -> Option<Self> {
        match value {
            OnboardingStatusFilter::Pass => Some(Self::Pass),
            OnboardingStatusFilter::Fail => Some(Self::Fail),
            OnboardingStatusFilter::Incomplete => Some(Self::Incomplete),
            OnboardingStatusFilter::Pending => Some(Self::Pending),
            OnboardingStatusFilter::None => None,
        }
    }
}

impl Default for OnboardingStatus {
    fn default() -> Self {
        Self::Pass
    }
}

impl From<DecisionStatus> for OnboardingStatus {
    fn from(s: DecisionStatus) -> Self {
        match s {
            DecisionStatus::Fail => OnboardingStatus::Fail,
            DecisionStatus::Pass => OnboardingStatus::Pass,
            DecisionStatus::StepUp => OnboardingStatus::Incomplete,
        }
    }
}
