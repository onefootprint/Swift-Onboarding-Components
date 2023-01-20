use paperclip::actix::Apiv2Schema;
use schemars::JsonSchema;

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, Apiv2Schema, JsonSchema)]
/// Embeds extra information in the d2p token to pass from the desktop to handoff session.
/// NOTE: changes to this struct should be backwards-compatible since we may use this struct
/// to deserialize old versions
pub struct HandoffMetadata {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub opener: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub session_id: Option<String>,
}
