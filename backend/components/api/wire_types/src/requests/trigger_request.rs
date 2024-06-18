use crate::*;
use newtypes::{
    ObConfigurationKey,
    WorkflowFixtureResult,
};

#[derive(Debug, Clone, Deserialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub struct TriggerKycRequest {
    #[openapi(skip)]
    pub onboarding_config_key: Option<ObConfigurationKey>,
    #[openapi(required)]
    /// The publishable key of the playbook onto which you would like this user to onboard. The
    /// playbook will specify required information and the rules by which to make a KYC decision.
    pub key: Option<ObConfigurationKey>,
    /// (only valid for sandbox users) choose the desired KYC outcome.
    pub fixture_result: Option<SimpleFixtureResult>,
    /// Run the user through KYC on the provided playbook even if they have already onboarded onto
    /// this playbook. Defaults to true.
    pub force_reonboard: Option<bool>,
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

#[derive(Debug, Clone, Deserialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub struct TriggerKybRequest {
    #[openapi(skip)]
    pub onboarding_config_key: Option<ObConfigurationKey>,
    #[openapi(required)]
    /// The publishable key of the playbook onto which you would like this business to onboard.
    /// The playbook will specify required information and the rules by which to make a KYB
    /// decision.
    pub key: Option<ObConfigurationKey>,
    /// (only valid for sandbox businesses) choose the desired KYB outcome
    pub fixture_result: Option<SimpleFixtureResult>,
}
