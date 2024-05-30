use newtypes::WorkflowFixtureResult;
use paperclip::actix::Apiv2Schema;

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
pub struct PostOnboardingRequest {
    pub fixture_result: Option<WorkflowFixtureResult>,
}
