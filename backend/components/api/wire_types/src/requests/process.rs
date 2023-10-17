use crate::*;

#[derive(Debug, Clone, Deserialize, Apiv2Schema, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub struct ProcessRequest {
    pub fixture_result: Option<WorkflowFixtureResult>,
}

export_schema!(ProcessRequest);
