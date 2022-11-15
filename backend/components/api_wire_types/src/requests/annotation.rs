use crate::*;

#[derive(Debug, Clone, Eq, PartialEq, Deserialize, Apiv2Schema, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub struct AnnotationFilters {
    pub is_pinned: Option<bool>,
}

export_schema!(AnnotationFilters);

#[derive(Debug, Clone, Eq, PartialEq, Deserialize, Apiv2Schema, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub struct CreateAnnotationRequest {
    pub note: String,
    pub is_pinned: bool,
}

export_schema!(CreateAnnotationRequest);
