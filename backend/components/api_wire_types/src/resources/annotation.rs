use crate::{export_schema, Apiv2Schema, DateTime, Deserialize, JsonSchema, Serialize, Utc};
use newtypes::AnnotationId;

#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema, Apiv2Schema)]
pub struct Annotation {
    pub id: AnnotationId,
    pub timestamp: DateTime<Utc>,
    pub note: String,
    pub is_pinned: bool,
    // TODO source? tenant_user
}

export_schema!(Annotation);
