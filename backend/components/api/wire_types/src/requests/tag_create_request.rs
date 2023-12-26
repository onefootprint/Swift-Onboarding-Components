use crate::*;

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
pub struct CreateTagRequest {
    pub kind: String,
}
