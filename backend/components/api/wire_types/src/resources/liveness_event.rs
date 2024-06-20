use crate::*;
use newtypes::LivenessAttributes;
use newtypes::LivenessSource;

/// Describes a liveness event that took place
#[derive(Debug, Clone, Serialize, Apiv2Response, macros::JsonResponder)]

pub struct LivenessEvent {
    pub source: LivenessSource,
    pub attributes: Option<LivenessAttributes>,
    pub insight_event: Option<InsightEvent>,
}
