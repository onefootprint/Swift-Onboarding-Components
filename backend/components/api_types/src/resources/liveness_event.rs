use crate::*;

/// Describes a liveness event that took place
#[derive(Debug, Clone, Deserialize, Serialize, Apiv2Schema, JsonSchema)]
#[schemars(rename_all = "camelCase")]
pub struct LivenessEvent {
    pub insight_event: InsightEvent,
}

export_schema!(LivenessEvent);
