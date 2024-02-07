use crate::*;
use newtypes::LabelKind;

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
pub struct CreateLabelRequest {
    pub kind: LabelKind,
}
