use super::error;
use newtypes::PiiString;

#[derive(Debug, Clone)]
pub struct StytchClient {
    client: reqwest::Client,
    project_id: String,
    secret: PiiString,
}

impl StytchClient {
    pub fn new(project_id: String, secret: PiiString) -> Result<Self, crate::Error> {
        let client = reqwest::Client::builder()
            .timeout(std::time::Duration::from_secs(45))
            .build()
            .map_err(error::Error::from)?;
        Ok(Self {
            client,
            project_id,
            secret,
        })
    }
}

impl StytchClient {
    #[tracing::instrument(skip_all)]
    pub async fn lookup(&self, telemetry_id: &str) -> Result<reqwest::Response, error::Error> {
        let url = format!(
            "https://telemetry.stytch.com/v1/fingerprint/lookup?telemetry_id={}",
            telemetry_id
        );
        tracing::info!(?telemetry_id, ?url, project_id=?self.project_id, "StytchClient::lookup");
        let res = self
            .client
            .get(url)
            .basic_auth(self.project_id.clone(), Some(self.secret.leak()))
            .send()
            .await
            .map_err(|e| error::Error::RequestError(e.to_string()))?;
        Ok(res)
    }
}

#[cfg(test)]
mod tests {
    use super::super::StytchLookupResponse;
    use super::*;
    use dotenv;
    use newtypes::PiiString;

    #[ignore]
    #[tokio::test]
    async fn test_client() {
        let project = dotenv::var("STYTCH_PROJECT").unwrap();
        let secret = PiiString::from(dotenv::var("STYTCH_SECRET").unwrap());
        let stytch_client = StytchClient::new(project, secret).unwrap();

        let telemetry_id = "afdcd45a-cbb0-4835-9899-957c17207e6f";

        let res = stytch_client.lookup(telemetry_id).await.unwrap();
        let parsed = StytchLookupResponse::from_response(res).await;
        assert_eq!(telemetry_id, parsed.parsed.unwrap().telemetry_id);
    }
}
