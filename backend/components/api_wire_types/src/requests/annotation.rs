use crate::*;

#[derive(Debug, Clone, Eq, PartialEq, Deserialize, Apiv2Schema, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub struct AnnotationRequest {
    pub note: String,
    pub is_pinned: bool,
}

export_schema!(AnnotationRequest);
