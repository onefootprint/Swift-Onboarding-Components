use crate::{export_schema, Apiv2Schema, Deserialize, JsonSchema, Serialize};
use newtypes::DataIdentifier;

#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema, Apiv2Schema)]
pub struct DocumentUploadedTimelineEvent {
    pub identifier: DataIdentifier,
}

export_schema!(DocumentUploadedTimelineEvent);
