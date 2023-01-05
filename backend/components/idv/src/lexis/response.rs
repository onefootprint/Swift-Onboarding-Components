#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
pub struct FlexIDResponse {
    #[serde(rename = "FlexIDResponseEx")]
    pub flex_id_response_ex: serde_json::Value, // TODO
}
