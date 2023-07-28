use newtypes::PiiString;

use super::error;

#[derive(Debug, Clone)]
pub struct StytchClient {
    client: reqwest::Client,
    project_id: String,
    secret: PiiString,
}

impl StytchClient {
    pub fn new(project_id: String, secret: PiiString) -> Result<Self, error::Error> {
        let client = reqwest::Client::builder().build()?;
        Ok(Self {
            client,
            project_id,
            secret,
        })
    }
}

impl StytchClient {
    #[tracing::instrument(skip_all)]
    pub async fn lookup(&self, telemetry_id: &str) -> Result<serde_json::Value, error::Error> {
        let url = format!(
            "https://telemetry.stytch.com/v1/fingerprint/lookup?telemetry_id={}",
            telemetry_id
        );

        let res = self
            .client
            .get(url)
            .basic_auth(self.project_id.clone(), Some(self.secret.leak()))
            .send()
            .await
            .map_err(|e| error::Error::RequestError(e.to_string()))?
            .json::<serde_json::Value>()
            .await?;
        Ok(res)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::stytch::response::LookupResponse;
    use dotenv;
    use newtypes::PiiString;

    #[ignore]
    #[tokio::test]
    async fn test_client() {
        let project = dotenv::var("STYTCH_PROJECT").unwrap();
        let secret = PiiString::from(dotenv::var("STYTCH_SECRET").unwrap());
        let stytch_client = StytchClient::new(project, secret).unwrap();

        let telemetry_id = "cc606a7a-6059-4499-918d-f2a734d901e9";

        let res = stytch_client.lookup(telemetry_id).await.unwrap();
        tracing::info!(res = format!("{:?}", res), "res");
        let parsed_res: LookupResponse = serde_json::value::from_value(res).unwrap();
        assert_eq!(telemetry_id, parsed_res.telemetry_id);
    }
}
