use crate::*;
use newtypes::LabelKind;

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
pub struct UpdateLabelRequest {
    pub kind: Option<LabelKind>,
}
