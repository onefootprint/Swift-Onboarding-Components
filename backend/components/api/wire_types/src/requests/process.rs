use crate::*;
use newtypes::WorkflowFixtureResult;

#[derive(Debug, Clone, Deserialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub struct ProcessRequest {
    pub fixture_result: Option<WorkflowFixtureResult>,
}
