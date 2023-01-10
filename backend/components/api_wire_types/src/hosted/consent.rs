use crate::*;

#[derive(Debug, Clone, serde::Deserialize, Apiv2Schema, JsonSchema)]
pub struct ConsentRequest {
    pub consent_language_text: String,
    pub document_request_id: DocumentRequestId,
}

export_schema!(ConsentRequest);
