use crate::{
    Actor,
    Apiv2Schema,
    DateTime,
    Serialize,
    Utc,
};
use newtypes::AnnotationId;

#[derive(Debug, Clone, Serialize, Apiv2Schema)]
pub struct Annotation {
    pub id: AnnotationId,
    pub timestamp: DateTime<Utc>,
    pub note: String,
    pub is_pinned: bool,
    pub source: Actor,
}
