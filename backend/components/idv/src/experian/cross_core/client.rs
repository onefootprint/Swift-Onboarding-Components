use chrono::Utc;
use newtypes::experian::ProductOptions;
use newtypes::{IdvData, PiiString, Uuid};

use crate::experian::auth::{self, response::JwtTokenResponse};
use crate::experian::error::{EnvironmentMismatchError, Error, ValidationError};
use newtypes::{Base64Data, Base64EncodedString};

use super::request::{ControlOption, CrossCoreAPIRequest, PreciseIDRequestConfig};
use super::validation;

const REQUIRED_X_USER_DOMAIN_HEADER_VAL: &str = "onefootprint.com";

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum ClientEnvironment {
    Production,
    Sandbox,
}
/// CrossCore is Experian's single API access point to a multitude of their products.
/// We make requests to CC, then they translate ("map") the requests into the format required by the product (and then back again)
/// We specify in the CC request which of the products we'd like to use
#[allow(dead_code)]
#[derive(Debug, Clone)]
pub struct ExperianClient {
    client: reqwest::Client,
    jwt_token_auth_credentials: CrossCoreAuthTokenCredentials,
    cross_core_credentials: CrossCoreRequestCredentials,
    environment: ClientEnvironment,
}

impl ExperianClient {
    #[allow(unused)]
    pub fn new(
        auth_username: PiiString,
        auth_password: PiiString,
        auth_client_id: PiiString,
        auth_client_secret: PiiString,
        cross_core_username: PiiString,
        cross_core_password: PiiString,
    ) -> Result<Self, Error> {
        let client_mode = Self::get_environment(&auth_username)?;

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
            environment: client_mode,
        })
    }

    fn get_environment(auth_username: &PiiString) -> Result<ClientEnvironment, Error> {
        let is_production = Self::is_production(auth_username);
        let is_sandbox = Self::is_sandbox(auth_username);

        // we need to be very careful with what data we are sending where, and so
        // we require making sure we explicitly check in the non-sensitive credentials
        // and explicitly check if we are in sandbox or production (and not both for some weird mistake)
        if !(is_production || is_sandbox) || (is_production && is_sandbox) {
            return Err(ValidationError::CredentialsNotRegistered.into());
        }

        if is_sandbox {
            Ok(ClientEnvironment::Sandbox)
        } else {
            Ok(ClientEnvironment::Production)
        }
    }

    fn is_production(_auth_username: &PiiString) -> bool {
        false
    }
    fn is_sandbox(auth_username: &PiiString) -> bool {
        auth_username.leak() == "crosscore2.uat@onefootprint.com"
    }
}

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
        let validated_data = self.validate_data(idv_data)?;

        self.internal_send(validated_data).await
    }
}

impl ExperianClient {
    async fn internal_send(&self, validated_idv_data: ValidatedIdvData) -> Result<serde_json::Value, Error> {
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
        let req = serde_json::to_string(&CrossCoreAPIRequest::try_from(
            validated_idv_data.into_idv_data(),
            config,
        )?)?;
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

    /// We cannot send test data to production, or production data to test environment
    fn validate_data(&self, idv_data: IdvData) -> Result<ValidatedIdvData, Error> {
        // what environment is this client in
        let is_production = self.environment == ClientEnvironment::Production;
        // is the data provided a test case
        let is_test_case = validation::is_sandbox_data(&idv_data);
        // TODO: add protections for our own data

        match (is_test_case, is_production) {
            (false, true) => Ok(ValidatedIdvData { idv_data }),
            (true, false) => Ok(ValidatedIdvData { idv_data }),
            _ => Err(ValidationError::EnvironmentMismatch(EnvironmentMismatchError {
                is_production,
                is_test_case,
            })
            .into()),
        }
    }
}

/// Wrapper struct the ensure we've validated the input data before sending to experian
struct ValidatedIdvData {
    idv_data: IdvData,
}

impl ValidatedIdvData {
    pub fn into_idv_data(self) -> IdvData {
        self.idv_data
    }
}

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

#[cfg(test)]
mod tests {
    use super::{ClientEnvironment, ExperianClient};
    use crate::experian::{
        cross_core::{response::CrossCoreAPIResponse, validation},
        error::{Error, ValidationError},
    };
    use newtypes::{IdvData, PiiString};
    use test_case::test_case;

    fn load_sandbox_credentials() -> (PiiString, PiiString, PiiString, PiiString, PiiString, PiiString) {
        let auth_username = PiiString::from(dotenv::var("EXPERIAN_AUTH_USERNAME").unwrap());
        let auth_password = PiiString::from(dotenv::var("EXPERIAN_AUTH_PASSWORD").unwrap());
        let auth_client_id = PiiString::from(dotenv::var("EXPERIAN_AUTH_CLIENT_ID").unwrap());
        let auth_client_secret = PiiString::from(dotenv::var("EXPERIAN_AUTH_CLIENT_SECRET").unwrap());
        let cross_core_username = PiiString::from(dotenv::var("EXPERIAN_CROSS_CORE_USERNAME").unwrap());
        let cross_core_password = PiiString::from(dotenv::var("EXPERIAN_CROSS_CORE_PASSWORD").unwrap());

        (
            auth_username,
            auth_password,
            auth_client_id,
            auth_client_secret,
            cross_core_username,
            cross_core_password,
        )
    }
    fn sandbox_client() -> Result<ExperianClient, Error> {
        let (
            auth_username,
            auth_password,
            auth_client_id,
            auth_client_secret,
            cross_core_username,
            cross_core_password,
        ) = load_sandbox_credentials();

        ExperianClient::new(
            auth_username,
            auth_password,
            auth_client_id,
            auth_client_secret,
            cross_core_username,
            cross_core_password,
        )
    }

    #[test]
    fn test_new_client() {
        // sandbox client
        let client = sandbox_client().expect("failed to load sandbox client");
        assert!(client.environment == ClientEnvironment::Sandbox);

        let (_, auth_password, auth_client_id, auth_client_secret, cross_core_username, cross_core_password) =
            load_sandbox_credentials();

        // client with wrong auth username
        let res = ExperianClient::new(
            PiiString::from("production-scary-secret"),
            auth_password,
            auth_client_id,
            auth_client_secret,
            cross_core_username,
            cross_core_password,
        );

        let assertion = match res {
            Err(Error::ValidationError(e)) => e == ValidationError::CredentialsNotRegistered,
            _ => false,
        };

        assert!(assertion)
    }

    #[test_case(IdvData {
        first_name: validation::lift_pii("JOHN".into()),
        last_name: validation::lift_pii("MILLEN".into()),
        address_line1: validation::lift_pii("53 ROTARY WAY".into()),
        zip: validation::lift_pii("94591".into()),
        city: validation::lift_pii("VALLEJO".into()),
        state: validation::lift_pii("CA".into()),
        ..Default::default()
    } => None)]
    // Not a test case
    #[test_case(IdvData {
        first_name: validation::lift_pii("bob".into()),
        last_name: validation::lift_pii("boberto".into()),
        address_line1: validation::lift_pii("53 rotary way".into()),
        ..Default::default()
    } => Some(ValidationError::EnvironmentMismatch(crate::experian::error::EnvironmentMismatchError {is_production: false, is_test_case: false})))]
    fn test_validate(idv_data: IdvData) -> Option<ValidationError> {
        let client = sandbox_client().unwrap();

        client.validate_data(idv_data).err().and_then(|e| match e {
            Error::ValidationError(e_inner) => Some(e_inner),
            _ => None,
        })
    }

    #[ignore]
    #[tokio::test]
    async fn test_send_precise_id_request() {
        let client = sandbox_client().unwrap();

        let idv_data = IdvData {
            first_name: validation::lift_pii("JOHN".into()),
            last_name: validation::lift_pii("BREEN".into()),
            address_line1: validation::lift_pii("PO BOX 445".into()),
            zip: validation::lift_pii("09061".into()),
            city: validation::lift_pii("APO".into()),
            state: validation::lift_pii("AE".into()),
            ssn9: validation::lift_pii("666436878".into()),
            ..Default::default()
        };

        let res = client.send_precise_id_request(idv_data).await.unwrap();
        let resp: CrossCoreAPIResponse = serde_json::from_value(res).unwrap();

        resp.precise_id_response().unwrap().score().unwrap();
    }
}
