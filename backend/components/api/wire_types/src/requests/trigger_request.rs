use crate::*;

#[derive(Debug, Clone, Eq, PartialEq, Deserialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub struct TriggerRequest {
    pub trigger: TriggerInfo,
    /// Optional note with more context on what we're asking the user to do
    pub note: Option<String>,
}

#[derive(Debug, Clone, Eq, PartialEq, Deserialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub struct TriggerKycRequest {
    pub onboarding_config_key: ObConfigurationKey,
}

#[derive(Debug, Clone, serde::Serialize, Deserialize, Apiv2Schema, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum KybFixture {
    Fail,
    Pass,
    ManualReview,
}

impl From<KybFixture> for WorkflowFixtureResult {
    fn from(value: KybFixture) -> Self {
        match value {
            KybFixture::Fail => WorkflowFixtureResult::Fail,
            KybFixture::Pass => WorkflowFixtureResult::Pass,
            KybFixture::ManualReview => WorkflowFixtureResult::ManualReview,
        }
    }
}

#[derive(Debug, Clone, Eq, PartialEq, Deserialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub struct TriggerKybRequest {
    pub onboarding_config_key: ObConfigurationKey,
    pub fixture_result: Option<KybFixture>,
}
