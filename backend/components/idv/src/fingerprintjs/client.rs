use super::error;
use newtypes::{
    FingerprintRequestId,
    PiiString,
};

#[derive(Debug, Clone)]
pub struct FingerprintJSClient {
    client: reqwest::Client,
    api_key: PiiString,
}

impl FingerprintJSClient {
    pub fn new(api_key: PiiString) -> Result<Self, error::Error> {
        let client = reqwest::Client::builder()
            .timeout(std::time::Duration::from_secs(45))
            .build()?;
        Ok(Self { client, api_key })
    }
}

impl FingerprintJSClient {
    #[tracing::instrument(skip_all)]
    pub async fn get_event(
        &self,
        request_id: FingerprintRequestId,
    ) -> Result<serde_json::Value, error::Error> {
        // This endpoint allows you to get events with all the information from each activated product -
        // BotD and Fingerprinting.
        let url = format!("https://api.fpjs.io/events/{}", request_id);
        let response = self
            .client
            .get(url)
            .header("Auth-API-Key", self.api_key.leak())
            .send()
            .await
            .map_err(|err| error::Error::RequestError(err.to_string()))?;

        let fp_response = response.json::<serde_json::Value>().await?;
        Ok(fp_response)
    }
}
