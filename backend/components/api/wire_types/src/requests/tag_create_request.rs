use crate::*;

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
pub struct CreateTagRequest {
    /// Any string to tag the user
    #[openapi(example = "transaction_chargeback")]
    pub tag: String,
}
