use crate::*;
use newtypes::LabelKind;

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
pub struct UpdateLabelRequest {
    /// Label value to set. Unset by sending `null`
    pub kind: Option<LabelKind>,
}
