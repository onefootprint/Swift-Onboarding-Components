use super::error::Error as SambaSafetyError;
use super::request::license_validation::CreateLVOrderRequest;
use super::request::SambaCreateLVOrderRequest;
use super::response::auth::AuthenticationResponse;
use crate::footprint_http_client::FootprintVendorHttpClient;
use newtypes::vendor_credentials::SambaSafetyCredentials;
use newtypes::PiiString;
use newtypes::SambaOrderId;
use newtypes::SambaReportId;
use reqwest::header;

type SambaResult<T> = Result<T, SambaSafetyError>;

#[derive(Clone)]
struct SambaHeaders(header::HeaderMap);

impl SambaHeaders {
    pub fn headers_for_report(&self) -> SambaResult<header::HeaderMap> {
        let mut headers = self.0.clone();
        headers.insert(
            "Accept",
            header::HeaderValue::from_str("application/vnd.sambasafety.json;version=2.0.4")?,
        );

        Ok(headers)
    }
}
#[derive(Clone)]
#[allow(unused)]
pub(crate) struct SambaAuthToken(PiiString);

#[derive(Clone)]
pub struct SambaSafetyClientAdapter {
    base_url: String,
    headers: SambaHeaders,
    auth_username: PiiString,
    auth_password: PiiString,
}

impl SambaSafetyClientAdapter {
    pub fn new(credentials: SambaSafetyCredentials) -> SambaResult<Self> {
        let mut headers = header::HeaderMap::new();
        let base_url = credentials.base_url.leak_to_string();
        headers.insert(
            "x-api-key",
            header::HeaderValue::from_str(credentials.api_key.leak())?,
        );

        Ok(Self {
            base_url,
            headers: SambaHeaders(headers),
            auth_username: credentials.auth_username,
            auth_password: credentials.auth_password,
        })
    }

    #[tracing::instrument(skip_all)]
    pub async fn get_authenticated_client(
        self,
        footprint_http_client: &FootprintVendorHttpClient,
    ) -> SambaResult<AuthenticatedSambaSafetyClientAdapter> {
        let mut params = std::collections::HashMap::new();
        params.insert("grant_type", "client_credentials");
        params.insert("scope", "API");
        let url = self.api_url("oauth2/v1/token")?;

        let response = footprint_http_client
            .post(url)
            .basic_auth(
                self.auth_username.clone().leak(),
                Some(self.auth_password.clone().leak()),
            )
            .headers(self.headers.0.clone())
            .form(&params)
            .send()
            .await
            .map_err(|err| SambaSafetyError::SendError(err.to_string()))?;

        let (cl, http_status) = (response.content_length(), response.status());
        let parsed_response = if http_status.is_success() {
            let json = response.json::<serde_json::Value>().await?;
            let response: AuthenticationResponse = serde_json::from_value(json)?;
            Ok(response)
        } else {
            tracing::info!(http_status=%http_status, content_length=?cl, service=?"token", "samba error response");
            Err(SambaSafetyError::HttpError(
                http_status.as_u16(),
                "AuthTokenRequest".into(),
            ))
        }?;

        let authenticated_client =
            AuthenticatedSambaSafetyClientAdapter::new(self, parsed_response.access_token);

        Ok(authenticated_client)
    }
}

impl SambaSafetyClientAdapter {
    // TODO: auto-fix this
    fn api_url(&self, path: &str) -> SambaResult<String> {
        if path.starts_with('/') {
            return Err(SambaSafetyError::SendError(
                "path suffix should not start with leading /".into(),
            ));
        }
        Ok(format!("{}/{}", self.base_url, path))
    }
}

#[derive(derive_more::Deref, Clone)]
/// A struct that represents a client that has an Authorization token to be reused across API calls
pub struct AuthenticatedSambaSafetyClientAdapter {
    #[deref]
    client_adapter: SambaSafetyClientAdapter,
    auth_token: PiiString,
}

impl AuthenticatedSambaSafetyClientAdapter {
    pub(crate) fn new(client_adapter: SambaSafetyClientAdapter, auth_token: PiiString) -> Self {
        Self {
            client_adapter,
            auth_token,
        }
    }
}

impl AuthenticatedSambaSafetyClientAdapter {
    /// Create a LicenseValidation Order
    #[tracing::instrument(skip_all)]
    pub async fn create_license_validation_order(
        &self,
        footprint_http_client: &FootprintVendorHttpClient,
        request: SambaCreateLVOrderRequest,
    ) -> SambaResult<reqwest::Response> {
        let request = CreateLVOrderRequest::from(request);
        let url = self.api_url("orders/v1/licensereports/verifylicense")?;

        let response = footprint_http_client
            .post(url)
            .bearer_auth(self.auth_token.leak())
            .headers(self.headers.clone().0)
            .json(&request)
            .send()
            .await
            .map_err(|err| SambaSafetyError::SendError(err.to_string()))?;

        Ok(response)
    }

    /// Get the status of a LicenseValidation Order, returns a report_id which we can use to fetch
    /// the results
    #[tracing::instrument(skip_all)]
    pub async fn get_license_validation_status(
        &self,
        footprint_http_client: &FootprintVendorHttpClient,
        order_id: SambaOrderId,
    ) -> SambaResult<reqwest::Response> {
        let path = format!("orders/v1/licensereports/verifylicense/{0}", order_id.as_str());
        let url = self.api_url(&path)?;

        let response = footprint_http_client
            .get(url)
            .bearer_auth(self.auth_token.leak())
            .headers(self.headers.clone().0)
            .send()
            .await
            .map_err(|err| SambaSafetyError::SendError(err.to_string()))?;
        Ok(response)
    }

    /// Get the LicenseValidation Report
    #[tracing::instrument(skip_all)]
    pub async fn get_license_validation_report(
        &self,
        footprint_http_client: &FootprintVendorHttpClient,
        report_id: SambaReportId,
    ) -> SambaResult<reqwest::Response> {
        let path = format!("reports/v1/licensereports/verifylicense/{0}", report_id.as_str());
        let url = self.api_url(&path)?;

        let response = footprint_http_client
            .get(url)
            .bearer_auth(self.auth_token.leak())
            .headers(self.headers.headers_for_report()?) // need to specify "Accept" here, or we get 400
            .send()
            .await
            .map_err(|err| SambaSafetyError::SendError(err.to_string()))?;
        Ok(response)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::footprint_http_client::FpVendorClientArgs;
    use crate::samba::request::license_validation::CreateLVOrderAddress;
    use crate::samba::response::license_validation::CheckLVOrderStatus;
    use crate::samba::response::license_validation::CreateLVOrderResponse;
    use crate::samba::response::license_validation::GetLVOrderResponse;
    use std::thread;
    use std::time;

    async fn get_authed_client(creds: SambaSafetyCredentials) -> AuthenticatedSambaSafetyClientAdapter {
        let fp_client = FootprintVendorHttpClient::new(FpVendorClientArgs::default()).unwrap();

        let client_adapter = SambaSafetyClientAdapter::new(creds).unwrap();
        client_adapter.get_authenticated_client(&fp_client).await.unwrap()
    }

    fn get_credentials() -> SambaSafetyCredentials {
        let api_key = PiiString::from(dotenv::var("SAMBA_API_KEY").unwrap());
        let auth_username = PiiString::from(dotenv::var("SAMBA_AUTH_USERNAME").unwrap());
        let auth_password = PiiString::from(dotenv::var("SAMBA_AUTH_PASSWORD").unwrap());
        SambaSafetyCredentials {
            api_key,
            base_url: "https://api-demo.sambasafety.io".into(),
            auth_username,
            auth_password,
        }
    }

    #[ignore]
    #[tokio::test]
    async fn test_get_authed_client() {
        get_authed_client(get_credentials()).await;
    }

    #[ignore]
    #[tokio::test]
    async fn test_create_order() {
        // samba provided test case
        let request = SambaCreateLVOrderRequest {
            credentials: get_credentials(),
            first_name: "John".into(),
            last_name: "Doe".into(),
            license_number: "057986548".into(),
            license_state: "GA".into(),
            // result doesn't change if we add these or don't include them
            // their test cases aren't amazing though
            dob: Some("1980-08-16".into()),
            address: Some(CreateLVOrderAddress {
                street: "495 Grove Street".into(),
                city: "Boulder".into(),
                state: "CO".into(),
                zip_code: "80301".into(),
            }),
            ..Default::default()
        };

        let authed_client = get_authed_client(request.credentials.clone()).await;
        let fp_client = FootprintVendorHttpClient::new(FpVendorClientArgs::default()).unwrap();

        // create order
        let raw_response = authed_client
            .create_license_validation_order(&fp_client, request)
            .await
            .unwrap()
            .json()
            .await
            .unwrap();

        let response: CreateLVOrderResponse = serde_json::from_value(raw_response).unwrap();
        let order_id = response.order_id;
        assert!(!order_id.leak().is_empty());

        // wait for a few secs so it moves to FULFILLED
        thread::sleep(time::Duration::from_secs(10));

        // get order status
        let order_resp = authed_client
            .get_license_validation_status(&fp_client, SambaOrderId::from(order_id.leak_to_string()))
            .await
            .unwrap()
            .json()
            .await
            .unwrap();

        let response: CheckLVOrderStatus = serde_json::from_value(order_resp).unwrap();
        let report_id = response.report_id().unwrap();
        let report_resp = authed_client
            .get_license_validation_report(&fp_client, report_id)
            .await
            .unwrap()
            .json()
            .await
            .unwrap();

        let response: GetLVOrderResponse = serde_json::from_value(report_resp).unwrap();

        assert!(!response.valid());
        assert_eq!(
            response.record.dl_record.result.error_code.unwrap(),
            "A2".to_string()
        );
    }
}
