use crate::*;
use newtypes::{
    LivenessAttributes,
    LivenessSource,
};

/// Describes a liveness event that took place
#[derive(Debug, Clone, Serialize, Apiv2Schema)]

pub struct LivenessEvent {
    pub source: LivenessSource,
    pub attributes: Option<LivenessAttributes>,
    pub insight_event: Option<InsightEvent>,
}
