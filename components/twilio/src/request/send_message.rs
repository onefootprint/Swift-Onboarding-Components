use serde::Serialize;

#[derive(Serialize)]
#[serde(rename_all = "PascalCase")]
pub struct SendMessage {
    pub body: String,
    pub to: String,
    pub from: String,
    pub validity_period: u64,
}
