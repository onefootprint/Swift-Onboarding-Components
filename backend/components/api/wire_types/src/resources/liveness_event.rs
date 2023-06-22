use crate::*;

/// Describes a liveness event that took place
#[derive(Debug, Clone, Serialize, Apiv2Schema, JsonSchema)]
#[schemars(rename_all = "camelCase")]
pub struct LivenessEvent {
    pub source: LivenessSource,
    pub attributes: Option<LivenessAttributes>,
    pub insight_event: InsightEvent,
}

export_schema!(LivenessEvent);
