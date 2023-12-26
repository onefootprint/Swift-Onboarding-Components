use crate::*;

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
pub struct CreateLabelRequest {
    pub kind: LabelKind,
}
