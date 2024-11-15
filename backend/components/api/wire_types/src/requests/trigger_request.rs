use crate::*;
use newtypes::PreviewApi;
use newtypes::PublishablePlaybookKey;
use newtypes::WorkflowFixtureResult;

#[derive(Debug, Clone, Deserialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub struct TriggerKycRequest {
    #[openapi(skip)]
    pub onboarding_config_key: Option<PublishablePlaybookKey>,
    #[openapi(required)]
    /// The publishable key of the playbook onto which you would like this user to onboard. The
    /// playbook will specify required information and the rules by which to make a KYC decision.
    pub key: Option<PublishablePlaybookKey>,
    /// (only valid for sandbox users) choose the desired KYC outcome.
    #[openapi(example = "null")]
    pub fixture_result: Option<SimpleFixtureResult>,
    /// Run the user through KYC on the provided playbook even if they have already onboarded onto
    /// this playbook. Defaults to true.
    #[serde(alias = "force_reonboard")]
    pub allow_reonboard: Option<bool>,
    /// When true, if the user ends up triggering a stepup rule, sends them a link to finish the
    /// flow
    #[serde(default)]
    #[openapi(optional)]
    #[openapi(gated = "PreviewApi::PostKycStepupLinks")]
    pub generate_link_on_stepup: bool,
}

#[derive(Debug, Clone, serde::Serialize, Apiv2Response, macros::JsonResponder)]
pub struct PostUsersKycResponse {
    #[serde(flatten)]
    pub validate: EntityValidateResponse,
    #[serde(skip_serializing_if = "Option::is_none")]
    #[openapi(gated = "PreviewApi::PostKycStepupLinks")]
    /// If the user triggers a step up rule, a link that can be used to prompt the user to finish
    /// uploading any remaining information.
    pub in_progress_link: Option<CreateTokenResponse>,
}

#[derive(Debug, Clone, serde::Serialize, Deserialize, Apiv2Schema, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum SimpleFixtureResult {
    Fail,
    Pass,
    ManualReview,
    #[openapi(skip)]
    StepUp,
}

impl From<SimpleFixtureResult> for WorkflowFixtureResult {
    fn from(value: SimpleFixtureResult) -> Self {
        match value {
            SimpleFixtureResult::Fail => WorkflowFixtureResult::Fail,
            SimpleFixtureResult::Pass => WorkflowFixtureResult::Pass,
            SimpleFixtureResult::ManualReview => WorkflowFixtureResult::ManualReview,
            SimpleFixtureResult::StepUp => WorkflowFixtureResult::StepUp,
        }
    }
}

#[derive(Debug, Clone, Deserialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub struct TriggerKybRequest {
    #[openapi(skip)]
    pub onboarding_config_key: Option<PublishablePlaybookKey>,
    #[openapi(required)]
    /// The publishable key of the playbook onto which you would like this business to onboard.
    /// The playbook will specify required information and the rules by which to make a KYB
    /// decision.
    pub key: Option<PublishablePlaybookKey>,
    /// (only valid for sandbox businesses) choose the desired KYB outcome
    #[openapi(example = "null")]
    pub fixture_result: Option<SimpleFixtureResult>,
    /// Run the businesss through KYB on the provided playbook even if they have already onboarded
    /// onto this playbook. Defaults to true.
    #[serde(alias = "force_reonboard")]
    pub allow_reonboard: Option<bool>,
}
