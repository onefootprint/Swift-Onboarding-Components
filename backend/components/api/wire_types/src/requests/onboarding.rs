use newtypes::WorkflowFixtureResult;
use paperclip::actix::Apiv2Schema;

#[derive(Debug, Default, Apiv2Schema, serde::Deserialize)]
pub struct PostOnboardingRequest {
    pub fixture_result: Option<WorkflowFixtureResult>,
    pub kyb_fixture_result: Option<WorkflowFixtureResult>,
}
