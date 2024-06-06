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
    /// Rules have not executed for this user
    None,
}

impl OnboardingStatus {
    pub fn has_decision(&self) -> bool {
        match self {
            OnboardingStatus::Pass => true,
            OnboardingStatus::Fail => true,
            OnboardingStatus::Incomplete => false,
            OnboardingStatus::Pending => false,
            OnboardingStatus::None => false,
        }
    }

    /// Returns true if we can transition into self from the previous `old_status`.
    /// These transition rules protect against wiping a scoped vault's decision status with a
    /// non-decision
    pub fn can_transition_from(&self, old_status: &Self) -> bool {
        let priority = |s: &Self| match s {
            Self::None => 0,
            Self::Incomplete => 1,
            Self::Pending => 1,
            Self::Fail => 2,
            Self::Pass => 2,
        };
        priority(self) >= priority(old_status)
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
            OnboardingStatusFilter::None => Some(Self::None),
        }
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

#[cfg(test)]
mod test {
    use super::OnboardingStatus::*;
    use crate::OnboardingStatus;
    use test_case::test_case;

    #[test_case(None, Incomplete => true)]
    #[test_case(Incomplete, Pending => true)]
    #[test_case(Pending, Incomplete => true)]
    #[test_case(None, Pass => true)]
    #[test_case(Pass, Fail => true)]
    #[test_case(Pass, Incomplete => false)]
    #[test_case(Fail, Pending => false)]
    #[test_case(Pass, None => false)]
    #[test_case(Incomplete, None => false)]
    fn test_transition(from: OnboardingStatus, to: OnboardingStatus) -> bool {
        to.can_transition_from(&from)
    }
}
