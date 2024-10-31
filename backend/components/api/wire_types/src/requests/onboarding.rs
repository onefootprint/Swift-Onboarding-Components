use newtypes::BoId;
use newtypes::WorkflowFixtureResult;
use paperclip::actix::Apiv2Schema;

#[derive(Debug, Default, Apiv2Schema, serde::Deserialize)]
pub struct PostOnboardingRequest {
    pub fixture_result: Option<WorkflowFixtureResult>,
}

#[derive(Debug, Default, Apiv2Schema, serde::Deserialize)]
pub struct PostBusinessOnboardingRequest {
    pub kyb_fixture_result: Option<WorkflowFixtureResult>,
    /// Can only be provided if there isn't already a business associated with this session.
    /// The identifier of an existing scoped business, if we want to inherit an existing business.
    /// If null and there isn't already a business associated with this session, creates a new
    /// business.
    pub inherit_business_id: Option<BoId>,
}
