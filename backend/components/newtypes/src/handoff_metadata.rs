use paperclip::actix::Apiv2Schema;

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, Apiv2Schema)]
/// Embeds extra information in the d2p token to pass from the desktop to handoff session.
/// NOTE: changes to this struct should be backwards-compatible since we may use this struct
/// to deserialize old versions
pub struct HandoffMetadata {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub opener: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub session_id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub style_params: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub sandbox_id_doc_outcome: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub redirect_url: Option<String>,
}
