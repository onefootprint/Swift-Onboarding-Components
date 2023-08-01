use diesel::{sql_types::Text, AsExpression, FromSqlRow};
use itertools::Itertools;
use paperclip::actix::Apiv2Schema;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use strum::{Display, EnumIter, IntoEnumIterator};
use strum_macros::{AsRefStr, EnumString};

use crate::DecisionStatus;

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
)]
#[strum(serialize_all = "snake_case")]
#[serde(rename_all = "snake_case")]
#[diesel(sql_type = Text)]
pub enum OnboardingStatus {
    /// Passed all checks
    Pass,
    /// Failed one or more check
    Fail,
    /// The user aborted the onboarding flow and we don't have enough information to make a decision.
    Incomplete,
    /// Waiting for user input or a decision
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
    Debug, Display, Clone, Copy, PartialEq, Eq, Deserialize, EnumString, AsRefStr, Apiv2Schema, JsonSchema,
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
            DecisionStatus::StepUp => OnboardingStatus::Pending,
        }
    }
}

impl schemars::JsonSchema for OnboardingStatus {
    fn schema_name() -> String {
        "OnboardingStatus".to_owned()
    }

    fn json_schema(_gen: &mut schemars::gen::SchemaGenerator) -> schemars::schema::Schema {
        let all = OnboardingStatus::iter()
            .map(|s| serde_json::Value::String(s.to_string()))
            .collect_vec();

        schemars::_private::apply_metadata(
            schemars::schema::Schema::Object(schemars::schema::SchemaObject {
                instance_type: Some(schemars::schema::InstanceType::String.into()),
                enum_values: Some(all),
                ..Default::default()
            }),
            schemars::schema::Metadata {
                description: Some("Represents status of an onboarding.".to_owned()),
                default: Some(serde_json::Value::String(Self::default().to_string())),
                examples: vec![serde_json::Value::String(Self::default().to_string())],
                ..Default::default()
            },
        )
    }
}
