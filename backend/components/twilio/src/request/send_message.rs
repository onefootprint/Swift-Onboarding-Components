use serde::Serialize;

#[derive(Serialize)]
#[serde(rename_all = "PascalCase")]
pub struct SendMessage {
    pub to: String,
    pub from: String,
    pub validity_period: u64,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub body: Option<String>,
    // Need to figure out how to even send a message via curl...
    #[serde(skip_serializing_if = "Option::is_none")]
    pub content_sid: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub content_variables: Option<String>,

    pub status_callback: Option<String>,
}
