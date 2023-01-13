use crate::*;

#[derive(Debug, Clone, serde::Deserialize, Apiv2Schema, JsonSchema)]
pub struct ConsentRequest {
    pub consent_language_text: String,
}

export_schema!(ConsentRequest);
