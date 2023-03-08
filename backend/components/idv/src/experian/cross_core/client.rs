use chrono::Utc;
use newtypes::experian::ProductOptions;
use newtypes::{IdvData, PiiString, Uuid};

use crate::experian::auth::{self, response::JwtTokenResponse};
use crate::experian::error::Error;
use newtypes::{Base64Data, Base64EncodedString};

use super::request::{ControlOption, CrossCoreAPIRequest, PreciseIDRequestConfig};

const REQUIRED_X_USER_DOMAIN_HEADER_VAL: &str = "onefootprint.com";

/// CrossCore is Experian's single API access point to a multitude of their products.
/// We make requests to CC, then they translate ("map") the requests into the format required by the product (and then back again)
/// We specify in the CC request which of the products we'd like to use
///
/// CC requires a JWT auth token (TTL 30m), and these credentials are used in the request to get a token
#[allow(dead_code)]
#[derive(Debug, Clone)]
pub(self) struct CrossCoreAuthTokenCredentials {
    pub(super) username: PiiString,
    pub(super) password: PiiString,
    pub(super) client_id: PiiString,
    pub(super) client_secret: PiiString,
}

/// These are the credentials used to make requests (with the JWT authorization) to CrossCore
#[allow(dead_code)]
#[derive(Debug, Clone)]
pub(self) struct CrossCoreRequestCredentials {
    pid_username: PiiString,
    pid_password: Base64EncodedString,
}
impl CrossCoreRequestCredentials {
    #[allow(unused)]
    fn new(pid_username: PiiString, pid_password: PiiString) -> Result<Self, Error> {
        let b64_password =
            Base64Data::into_string_standard(pid_password.leak_to_string().as_str().as_bytes().to_vec());

        Ok(Self {
            pid_username,
            pid_password: b64_password,
        })
    }
}

#[allow(dead_code)]
#[derive(Debug, Clone)]
pub struct ExperianClient {
    client: reqwest::Client,
    jwt_token_auth_credentials: CrossCoreAuthTokenCredentials,
    cross_core_credentials: CrossCoreRequestCredentials,
}

impl ExperianClient {
    #[allow(unused)]
    fn new(
        auth_username: PiiString,
        auth_password: PiiString,
        auth_client_id: PiiString,
        auth_client_secret: PiiString,
        cross_core_username: PiiString,
        cross_core_password: PiiString,
    ) -> Result<Self, Error> {
        let cross_core_credentials =
            CrossCoreRequestCredentials::new(cross_core_username, cross_core_password)?;
        let jwt_token_auth_credentials = CrossCoreAuthTokenCredentials {
            username: auth_username,
            password: auth_password,
            client_id: auth_client_id,
            client_secret: auth_client_secret,
        };
        let client = reqwest::Client::builder().build()?;
        Ok(Self {
            client,
            jwt_token_auth_credentials,
            cross_core_credentials,
        })
    }
}

// Auth
impl ExperianClient {
    #[allow(dead_code)]
    fn create_cross_core_token_request(&self) -> auth::request::CrossCoreJwtTokenRequest {
        auth::request::CrossCoreJwtTokenRequest {
            username: self.jwt_token_auth_credentials.username.clone(),
            password: self.jwt_token_auth_credentials.password.clone(),
            client_id: self.jwt_token_auth_credentials.client_id.clone(),
            client_secret: self.jwt_token_auth_credentials.client_secret.clone(),
        }
    }

    #[allow(dead_code)]
    pub(self) async fn send_token_request(&self) -> Result<JwtTokenResponse, Error> {
        let url = "https://us-api.experian.com/oauth2/experianone/v1/token";
        let req = serde_json::to_string(&self.create_cross_core_token_request()).map_err(Error::from)?;
        // A global unique identifier. When submitting a token request, an X-Correlation-Id must be populated with a globally unique identifier
        let correlation_id = Uuid::new_v4().to_string();

        let raw_response = self
            .client
            .post(url)
            .body(req)
            .header("X-Correlation-Id", correlation_id.as_str())
            .header("Content-Type", "application/json")
            .header("X-User-Domain", REQUIRED_X_USER_DOMAIN_HEADER_VAL)
            .send()
            .await
            .map_err(|err| Error::SendError(err.to_string()))?
            .json::<serde_json::Value>()
            .await?;

        let response: JwtTokenResponse = serde_json::from_value(raw_response)?;

        Ok(response)
    }
}

impl ExperianClient {
    pub async fn send_precise_id_request(&self, idv_data: IdvData) -> Result<serde_json::Value, Error> {
        let url =
            "https://us-api.experian.com/decisionanalytics/crosscore/npfrawmfuwsu/services/v0/applications/3";

        let config = PreciseIDRequestConfig {
            control_options: self.control_options(),
            // TODO: prob should put this in credentials
            tenant_id: "105408b68cde455a92e95a3eaa989e".into(),
            // TODO: prob should put this in credentials
            request_type: "PreciseIdOnly".into(),
            // TODO: verification request id?
            client_reference_id: Uuid::new_v4().to_string(),
            message_time: Utc::now(),
        };
        let req = serde_json::to_string(&CrossCoreAPIRequest::try_from(idv_data, config)?)?;
        let auth_token = self.send_token_request().await?.access_token;

        let response = self
            .client
            .post(url)
            .body(req)
            .bearer_auth(auth_token)
            .header("Content-Type", "application/json")
            .send()
            .await
            .map_err(|err| Error::SendError(err.to_string()))?
            .json::<serde_json::Value>()
            .await?;

        Ok(response)
    }
    fn control_options(&self) -> Vec<ControlOption> {
        vec![
            // secrets
            ControlOption {
                option: "PID_USERNAME".to_string().into(),
                value: self.cross_core_credentials.pid_username.clone(),
            },
            ControlOption {
                option: "PID_PASSWORD".to_string().into(),
                value: self.cross_core_credentials.pid_password.0.clone().into(),
            },
            // other
            // TODO: should this be in secrets? they asked me for it on the phone...
            ControlOption {
                option: "SUBSCRIBER_SUB_CODE".to_string().into(),
                value: "2956241".to_string().into(),
            },
            ControlOption {
                option: "PIDXML_VERSION".to_string().into(),
                value: "06.00".to_string().into(),
            },
            ControlOption {
                option: "SUBSCRIBER_PREAMBLE".to_string().into(),
                value: "TBD3".to_string().into(),
            },
            ControlOption {
                option: "SUBSCRIBER_OPERATOR_INITIAL".to_string().into(),
                value: "OF".to_string().into(),
            },
            // defines us wanting precise id
            ControlOption {
                option: "PRODUCT_OPTION".to_string().into(),
                value: ProductOptions::IDScreeningScore.to_string().into(),
            },
            ControlOption {
                option: "DETAIL_REQUEST".to_string().into(),
                value: "D".to_string().into(),
            },
        ]
    }
}
