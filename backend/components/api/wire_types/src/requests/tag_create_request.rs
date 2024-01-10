use crate::*;

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
pub struct CreateTagRequest {
    /// any string to tag a user with
    pub tag: String,
}
