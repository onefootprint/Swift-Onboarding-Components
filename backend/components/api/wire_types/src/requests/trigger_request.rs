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
    /// (only valid for sandbox users) choose the desired KYC outcome
    pub fixture_result: Option<SimpleFixtureResult>,
}

#[derive(Debug, Eq, PartialEq, Serialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub struct TriggerLinkResponse {
    pub link: PiiString,
}

#[derive(Debug, Clone, serde::Serialize, Deserialize, Apiv2Schema, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum SimpleFixtureResult {
    Fail,
    Pass,
    ManualReview,
}

impl From<SimpleFixtureResult> for WorkflowFixtureResult {
    fn from(value: SimpleFixtureResult) -> Self {
        match value {
            SimpleFixtureResult::Fail => WorkflowFixtureResult::Fail,
            SimpleFixtureResult::Pass => WorkflowFixtureResult::Pass,
            SimpleFixtureResult::ManualReview => WorkflowFixtureResult::ManualReview,
        }
    }
}

#[derive(Debug, Clone, Eq, PartialEq, Deserialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub struct TriggerKybRequest {
    pub onboarding_config_key: ObConfigurationKey,
    /// (only valid for sandbox businesses) choose the desired KYB outcome
    pub fixture_result: Option<SimpleFixtureResult>,
}
