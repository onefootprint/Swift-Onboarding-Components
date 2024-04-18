use chrono::Utc;
use newtypes::{
    experian::ProductOptions, vendor_credentials::ExperianCredentials, IdvData, PiiString, Uuid,
    VerificationRequestId,
};
use tokio_retry::strategy::FixedInterval;

use crate::{
    experian::{
        auth::{self, response::JwtTokenResponse},
        error::{EnvironmentMismatchError, Error, ValidationError},
    },
    footprint_http_client::FootprintVendorHttpClient,
};
use newtypes::{Base64Data, Base64EncodedString};

use super::{
    request::{ControlOption, CrossCoreAPIRequest, PreciseIDRequestConfig},
    response::{CCErrorResponse, CrossCoreAPIResponse},
    validation,
};

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
pub struct ExperianClientAdapter {
    jwt_token_auth_credentials: CrossCoreAuthTokenCredentials,
    cross_core_credentials: CrossCoreRequestCredentials,
    environment: ClientEnvironment,
    subscriber_code: PiiString,
    cross_core_url: String,
}

impl ExperianClientAdapter {
    pub fn new(credentials: ExperianCredentials) -> Result<Self, Error> {
        let client_mode = Self::get_environment(&credentials.auth_username)?;
        let cross_core_url = Self::get_cross_core_url(&client_mode);

        let cross_core_credentials = CrossCoreRequestCredentials::new(
            credentials.cross_core_username,
            credentials.cross_core_password,
        )?;
        let jwt_token_auth_credentials = CrossCoreAuthTokenCredentials {
            username: credentials.auth_username,
            password: credentials.auth_password,
            client_id: credentials.auth_client_id,
            client_secret: credentials.auth_client_secret,
        };
        Ok(Self {
            jwt_token_auth_credentials,
            cross_core_credentials,
            environment: client_mode,
            subscriber_code: credentials.subscriber_code,
            cross_core_url,
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

    fn is_production(auth_username: &PiiString) -> bool {
        auth_username.leak() == "crosscore2.prod@onefootprint.com"
    }

    fn is_sandbox(auth_username: &PiiString) -> bool {
        auth_username.leak() == "crosscore2.uat@onefootprint.com"
    }

    fn get_cross_core_url(client_mode: &ClientEnvironment) -> String {
        if client_mode == &ClientEnvironment::Sandbox {
            "https://us-api.experian.com/decisionanalytics/crosscore/npfrawmfuwsu/services/v0/applications/3"
                .into()
        } else {
            "https://us-api.experian.com/decisionanalytics/crosscore/npqa4sgh49xh/services/v0/applications/3"
                .into()
        }
    }
}

impl ExperianClientAdapter {
    #[allow(dead_code)]
    fn create_cross_core_token_request(&self) -> auth::request::CrossCoreJwtTokenRequest {
        auth::request::CrossCoreJwtTokenRequest {
            username: self.jwt_token_auth_credentials.username.clone(),
            password: self.jwt_token_auth_credentials.password.clone(),
            client_id: self.jwt_token_auth_credentials.client_id.clone(),
            client_secret: self.jwt_token_auth_credentials.client_secret.clone(),
        }
    }

    pub(self) async fn send_token_request(
        &self,
        client: &FootprintVendorHttpClient,
    ) -> Result<JwtTokenResponse, Error> {
        let url = "https://us-api.experian.com/oauth2/experianone/v1/token";
        let req = serde_json::to_string(&self.create_cross_core_token_request()).map_err(Error::from)?;
        // A global unique identifier. When submitting a token request, an X-Correlation-Id must be populated with a globally unique identifier
        let correlation_id = Uuid::new_v4().to_string();

        let response = client
            .post(url)
            .body(req)
            .header("X-Correlation-Id", correlation_id.as_str())
            .header("Content-Type", "application/json")
            .header("X-User-Domain", REQUIRED_X_USER_DOMAIN_HEADER_VAL)
            .send()
            .await
            .map_err(|err| Error::SendError(err.to_string()))?;

        let (cl, http_status) = (response.content_length(), response.status());
        if http_status.is_success() {
            let json = response.json::<serde_json::Value>().await?;
            let response: JwtTokenResponse = serde_json::from_value(json)?;
            Ok(response)
        } else {
            tracing::info!(http_status=%http_status, content_length=?cl, service=?"token", "experian error response");
            Err(Error::HttpError(http_status.as_u16(), "TokenRequest".into()))
        }
    }
}
use tokio_retry::RetryIf;

impl ExperianClientAdapter {
    async fn send_precise_id_request(
        &self,
        client: &FootprintVendorHttpClient,
        validated_idv_data: ValidatedIdvData,
    ) -> Result<serde_json::Value, Error> {
        let idv_data = validated_idv_data.into_idv_data();
        let vreq_id = idv_data.verification_request_id.clone();
        let req_struct = &CrossCoreAPIRequest::try_from(
            idv_data,
            self.config(vreq_id),
            self.environment == ClientEnvironment::Production,
        )?;
        let req = serde_json::to_string(req_struct)?;
        let auth_token = self.send_token_request(client).await?.access_token;

        let response = client
            .post(self.cross_core_url.as_str())
            .body(req)
            .bearer_auth(auth_token)
            .header("Content-Type", "application/json")
            .send()
            .await
            .map_err(|err| Error::SendError(err.to_string()))?;

        let (cl, http_status) = (response.content_length(), response.status());
        if !http_status.is_success() {
            tracing::info!(http_status=%http_status, content_length=?cl, service=?"precise_id", "experian error response");
            Err(Error::HttpError(http_status.as_u16(), "PreciseId".into()))
        } else {
            let json = response.json::<serde_json::Value>().await?;

            // catch any weird error relating to tokens
            match serde_json::from_value::<CCErrorResponse>(json.clone()) {
                Ok(e) => {
                    let err = match e.code.as_str() {
                        "401-000" => {
                            let err = Error::JwtTokenNeedsRefresh;
                            tracing::info!(error=%err, error_code=%&e.code, "send_precise_id_request error");
                            err
                        }
                        _ => {
                            let err = Error::UnknownError;
                            tracing::info!(?err, error_code=%&e.code, "send_precise_id_request error");
                            err
                        }
                    };

                    Err(err)
                }
                Err(_) => Ok(()),
            }?;

            // Catch errors from cc itself
            match serde_json::from_value::<CrossCoreAPIResponse>(json.clone()) {
                Ok(c) => {
                    let codes = c.error_codes();

                    if !codes.is_empty() {
                        let err = if codes.contains(&"709".to_string()) {
                            Error::UserNamePasswordError
                        } else if codes.contains(&"720".to_string()) {
                            Error::OtherPreciseIdServerError
                        } else {
                            Error::UnknownError
                        };

                        tracing::info!(?err, ?codes, "send_precise_id_request error");
                        Err(err)
                    } else {
                        Ok(())
                    }
                }
                // we handle this elsewhere
                Err(_) => Ok(()),
            }?;

            Ok(json)
        }
    }

    #[tracing::instrument]
    fn should_retry(error: &Error) -> bool {
        error.is_retryable_error()
    }

    pub(crate) async fn send_precise_id_request_with_retries(
        &self,
        client: &FootprintVendorHttpClient,
        validated_idv_data: ValidatedIdvData,
    ) -> Result<serde_json::Value, Error> {
        let retry_strategy = FixedInterval::from_millis(200).take(3);

        // TODO the HTTP client already retries, so this could cause many retries
        // Would be cool if we could pass in an Extension that had a lambda retry policy
        let response = RetryIf::spawn(
            retry_strategy,
            || self.send_precise_id_request(client, validated_idv_data.to_owned()),
            Self::should_retry,
        )
        .await
        .map_err(Error::from)?;

        Ok(response)
    }

    fn config(&self, verification_request_id: Option<VerificationRequestId>) -> PreciseIDRequestConfig {
        PreciseIDRequestConfig {
            control_options: self.control_options(),
            tenant_id: "105408b68cde455a92e95a3eaa989e".into(),
            request_type: "PreciseIdOnly".into(),
            client_reference_id: verification_request_id
                .map(|v| v.to_string())
                .unwrap_or(Uuid::new_v4().to_string()),
            message_time: Utc::now(),
        }
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
                value: self.subscriber_code.clone(),
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
    pub(crate) fn validate_data(&self, idv_data: IdvData) -> Result<ValidatedIdvData, Error> {
        // what environment is this client in
        let is_production = self.environment == ClientEnvironment::Production;
        // is the data provided a test case
        let is_test_case = validation::is_sandbox_data(&idv_data, is_production);
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
#[derive(Clone)]
pub(crate) struct ValidatedIdvData {
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
struct CrossCoreAuthTokenCredentials {
    pub(super) username: PiiString,
    pub(super) password: PiiString,
    pub(super) client_id: PiiString,
    pub(super) client_secret: PiiString,
}

/// These are the credentials used to make requests (with the JWT authorization) to CrossCore
#[allow(dead_code)]
#[derive(Debug, Clone)]

struct CrossCoreRequestCredentials {
    pid_username: PiiString,
    pid_password: Base64EncodedString,
}
impl CrossCoreRequestCredentials {
    #[allow(unused)]
    fn new(pid_username: PiiString, pid_password: PiiString) -> Result<Self, Error> {
        let b64_password =
            Base64Data::into_string_standard(pid_password.leak_to_string().as_bytes().to_vec());

        Ok(Self {
            pid_username,
            pid_password: b64_password,
        })
    }
}

#[cfg(test)]
mod tests {
    use super::{ClientEnvironment, ExperianClientAdapter};
    use crate::{
        experian::{
            cross_core::{
                request::CrossCoreAPIRequest,
                response::CrossCoreAPIResponse,
                send_precise_id_request,
                validation::{self, load_sandbox_data},
            },
            error::{Error, ValidationError},
            ExperianCrossCoreRequest,
        },
        footprint_http_client::{FootprintVendorHttpClient, FpVendorClientArgs},
    };
    use newtypes::{vendor_credentials::ExperianCredentials, IdvData, PiiString};
    use test_case::test_case;

    fn load_sandbox_credentials() -> ExperianCredentials {
        let auth_username = PiiString::from(dotenv::var("EXPERIAN_AUTH_USERNAME").unwrap());
        let auth_password = PiiString::from(dotenv::var("EXPERIAN_AUTH_PASSWORD").unwrap());
        let auth_client_id = PiiString::from(dotenv::var("EXPERIAN_AUTH_CLIENT_ID").unwrap());
        let auth_client_secret = PiiString::from(dotenv::var("EXPERIAN_AUTH_CLIENT_SECRET").unwrap());
        let cross_core_username = PiiString::from(dotenv::var("EXPERIAN_CROSS_CORE_USERNAME").unwrap());
        let cross_core_password = PiiString::from(dotenv::var("EXPERIAN_CROSS_CORE_PASSWORD").unwrap());
        let subscriber_code = PiiString::from(dotenv::var("EXPERIAN_PRECISEID_SUBSCRIBER_CODE").unwrap());

        ExperianCredentials {
            auth_username,
            auth_password,
            auth_client_id,
            auth_client_secret,
            cross_core_username,
            cross_core_password,
            subscriber_code,
        }
    }
    fn sandbox_client() -> Result<ExperianClientAdapter, Error> {
        ExperianClientAdapter::new(load_sandbox_credentials())
    }

    #[test]
    fn test_new_client() {
        // sandbox client
        let client = sandbox_client().expect("failed to load sandbox client");
        assert!(client.environment == ClientEnvironment::Sandbox);

        let ExperianCredentials {
            auth_username: _,
            auth_password,
            auth_client_id,
            auth_client_secret,
            cross_core_username,
            cross_core_password,
            subscriber_code,
        } = load_sandbox_credentials();

        // client with wrong auth username
        let res = ExperianClientAdapter::new(ExperianCredentials {
            auth_username: PiiString::from("production-scary-secret"),
            auth_password,
            auth_client_id,
            auth_client_secret,
            cross_core_username,
            cross_core_password,
            subscriber_code,
        });

        let assertion = match res {
            Err(Error::ValidationError(e)) => e == ValidationError::CredentialsNotRegistered,
            _ => false,
        };

        assert!(assertion)
    }

    #[test_case(IdvData {
        first_name: validation::lift_pii("JON"),
        last_name: validation::lift_pii("MILLEN"),
        address_line1: validation::lift_pii("53 ROTARY WAY"),
        zip: validation::lift_pii("94591"),
        city: validation::lift_pii("VALLEJO"),
        state: validation::lift_pii("CA"),
        country: validation::lift_pii("US"),
        ..Default::default()
    } => None)]
    // Not a test case
    #[test_case(IdvData {
        first_name: validation::lift_pii("bob"),
        last_name: validation::lift_pii("boberto"),
        address_line1: validation::lift_pii("53 rotary way"),
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
        let fp_client = FootprintVendorHttpClient::new(FpVendorClientArgs::default()).unwrap();
        let credentials = load_sandbox_credentials();
        let idv_data = load_sandbox_data()[0].clone();

        let request = ExperianCrossCoreRequest {
            idv_data,
            credentials,
        };

        let res = send_precise_id_request(&fp_client, request).await.unwrap();
        let resp: CrossCoreAPIResponse = serde_json::from_value(res).unwrap();

        resp.precise_id_response().unwrap().score().unwrap();
    }

    #[test]
    fn test_crosscore_api_request_try_from() {
        let client = sandbox_client().unwrap();
        let idv_data = IdvData {
            first_name: validation::lift_pii("BOB"),
            last_name: validation::lift_pii("BOBERTO"),
            address_line1: validation::lift_pii("53 ROTARY WAY"),
            zip: validation::lift_pii("94591"),
            city: validation::lift_pii("VALLEJO"),
            state: validation::lift_pii("CA"),
            country: validation::lift_pii("US"),
            phone_number: validation::lift_pii("122345"),
            email: validation::lift_pii("bob@bobbyberto.com"),
            ..Default::default()
        };
        assert!(idv_data.phone_number.is_some());
        assert!(idv_data.email.is_some());
        // sandbox we don't send email/phone
        let req = CrossCoreAPIRequest::try_from(idv_data.clone(), client.config(None), false).unwrap();
        let contact = req.payload.contacts[0].clone();
        assert!(contact.emails.is_empty());
        assert!(contact.telephones.is_empty());

        // prod we do send email/phone
        let req = CrossCoreAPIRequest::try_from(idv_data, client.config(None), true).unwrap();
        let contact = req.payload.contacts[0].clone();
        assert!(!contact.emails.is_empty());
        assert!(!contact.telephones.is_empty());
    }
}
