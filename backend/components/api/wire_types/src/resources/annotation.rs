use crate::Actor;
use crate::Apiv2Response;
use crate::DateTime;
use crate::Serialize;
use crate::Utc;
use newtypes::AnnotationId;

#[derive(Debug, Clone, Serialize, Apiv2Response, macros::JsonResponder)]
pub struct Annotation {
    pub id: AnnotationId,
    pub timestamp: DateTime<Utc>,
    pub note: String,
    pub is_pinned: bool,
    pub source: Actor,
}
