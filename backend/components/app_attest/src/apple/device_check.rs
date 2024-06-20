use super::AppleAppAttestationVerifier;
use super::Config;
use crate::error::AttestationError;
use chrono::DateTime;
use chrono::Utc;
use jwt_simple::prelude::*;
use openssl::bn::BigNumContext;
use openssl::cms::CMSOptions;
use openssl::ec::PointConversionForm;
use openssl::pkey::Id;
use openssl::x509::store::X509Store;
use openssl::x509::store::X509StoreBuilder;
use openssl::x509::X509;
use reqwest::Method;
use reqwest::RequestBuilder;
use reqwest::Response;
use std::collections::HashMap;
use std::num::ParseIntError;
use thiserror::Error;

const PROD_ATTESTATION_URL: &str = "https://data.appattest.apple.com/v1/attestationData";
const DEV_ATTESTATION_URL: &str = "https://data-development.appattest.apple.com/v1/attestationData";

const PROD_DEVICECHECK_URL: &str = "https://api.devicecheck.apple.com";
const DEV_DEVICECHECK_URL: &str = "https://api.development.devicecheck.apple.com";

#[derive(Debug, Error)]
pub enum DeviceCheckError {
    #[error("You made the request before the previous receipts `Not Before` date")]
    NotModified,
    #[error("You used a development receipt in production, or vice versa")]
    IncorrectEnvironment,
    #[error("Your request has a missing or badly formatted payload: {0}")]
    BadPayload(String),
    #[error(
        "You used an authentication token that the Apple server cant verify or that doesnt match the receipt"
    )]
    NotAuthorized,
    #[error("No data available for the supplied receipt")]
    NoDataFound,
    #[error("You sent too many requests to the server")]
    TooManyRequests,
    #[error("Apple server error")]
    ServerError,
    #[error("The service is unavailable")]
    Unavailable,
    #[error("unexpected error: {0}")]
    UnknownError(u16),

    #[error("receipt contains invalid value")]
    InvalidReceiptValue,

    #[error("receipt missing type: {0}")]
    ReceiptMissingValue(u64),

    #[error("bad utf8 string")]
    InvalidUtf8String(#[from] std::str::Utf8Error),

    #[error("Unknown receipt type")]
    UnknownReceiptType,

    #[error("Bad date time")]
    InvalidDate(#[from] chrono::ParseError),

    #[error("Risk metric has unexpected value")]
    InvalidRiskMetricValue(#[from] ParseIntError),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Receipt {
    pub app_id: String,
    pub attested_public_key: Vec<u8>,
    pub client_hash: Vec<u8>,
    pub token: String,
    pub receipt_type: ReceiptType,
    pub creation_time: DateTime<Utc>,
    /// only present when receipt type is RECEIPT
    pub risk_metric: Option<i32>,
    pub not_before: Option<DateTime<Utc>>,
    pub expiration_time: DateTime<Utc>,
    pub is_sandbox: bool,
}

#[derive(Debug, Serialize)]
struct QueryRequest {
    device_token: String,
    timestamp: i64,
    transaction_id: String,
}

impl QueryRequest {
    pub fn new(device_token: String) -> Self {
        QueryRequest {
            device_token,
            timestamp: Utc::now().timestamp_millis(),
            transaction_id: uuid::Uuid::new_v4().to_string(),
        }
    }
}

#[derive(Debug, Serialize)]
struct UpdateRequest {
    device_token: String,
    timestamp: i64,
    transaction_id: String,
    bit0: bool,
    bit1: bool,
}

impl UpdateRequest {
    pub fn new(device_token: String, bit0: bool, bit1: bool) -> Self {
        Self {
            device_token,
            timestamp: Utc::now().timestamp_millis(),
            transaction_id: uuid::Uuid::new_v4().to_string(),
            bit0,
            bit1,
        }
    }
}
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeviceCheckBits {
    pub bit0: bool,
    pub bit1: bool,
    pub last_update_time: String,
}

pub type RawReceiptBytes = Vec<u8>;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "UPPERCASE")]
pub enum ReceiptType {
    Attest,
    Receipt,
}

impl AppleAppAttestationVerifier {
    /// Get an authorized client request builder
    #[tracing::instrument(skip(self))]
    fn request(&self, method: Method, url: &str) -> Result<RequestBuilder, AttestationError> {
        // 1. create JWT
        let keypair = ES256KeyPair::from_pem(&self.config.private_key_pem)?.with_key_id(&self.config.key_id);
        let claims = Claims::create(Duration::from_hours(1)).with_issuer(&self.config.team_id);
        let token = keypair.sign(claims)?;

        // 2. send the request
        let client = reqwest::Client::new();
        Ok(client
            .request(method, url)
            .bearer_auth(token)
            .timeout(std::time::Duration::from_secs(5)))
    }

    async fn handle_response_status(response: Response) -> Result<Response, AttestationError> {
        let status_code = response.status().as_u16();

        if !response.status().is_success() {
            let response = response.text().await?;

            let err = match status_code {
                304 => DeviceCheckError::NotModified,
                400 => DeviceCheckError::BadPayload(response.clone()),
                401 => DeviceCheckError::NotAuthorized,
                404 => DeviceCheckError::NoDataFound,
                429 => DeviceCheckError::TooManyRequests,
                500 => DeviceCheckError::ServerError,
                503 => DeviceCheckError::Unavailable,
                status => DeviceCheckError::UnknownError(status),
            };

            #[cfg(test)]
            println!("dc api error: {}", response);

            tracing::warn!(
                dc_status = status_code,
                response,
                "error fetching device check receipt"
            );

            return Err(err)?;
        }
        Ok(response)
    }

    /// Use the receipt to check the device
    #[tracing::instrument(skip(self, receipt))]
    pub async fn fetch_device_check_receipt(
        &self,
        is_development: bool,
        receipt: Vec<u8>,
    ) -> Result<(Receipt, RawReceiptBytes), AttestationError> {
        let response = self
            .request(
                Method::POST,
                if is_development {
                    DEV_ATTESTATION_URL
                } else {
                    PROD_ATTESTATION_URL
                },
            )?
            .body(base64::encode(receipt))
            .send()
            .await?;

        let response = Self::handle_response_status(response).await?;
        let response = response.bytes().await?.to_vec();
        let response = base64::decode(response)?;
        let receipt = self.verify_and_parse_receipt(response.clone())?;

        Ok((receipt, response))
    }

    /// parse and verify data from the ASN.1 receipt object
    pub fn verify_and_parse_receipt(&self, receipt: Vec<u8>) -> Result<Receipt, AttestationError> {
        inner_verify_and_parse_receipt(&self.config, receipt, false)
    }

    #[tracing::instrument(skip(self))]
    pub async fn validate_device_token(
        &self,
        device_token: String,
        is_development: bool,
    ) -> Result<(), AttestationError> {
        let base = if is_development {
            DEV_DEVICECHECK_URL
        } else {
            PROD_DEVICECHECK_URL
        };
        let request = QueryRequest::new(device_token);

        let response = self
            .request(Method::POST, &format!("{}/v1/validate_device_token", base))?
            .json(&request)
            .send()
            .await?;

        let _ = Self::handle_response_status(response).await?;

        Ok(())
    }

    #[tracing::instrument(skip(self))]
    pub async fn query_device_bits(
        &self,
        device_token: String,
        is_development: bool,
    ) -> Result<Option<DeviceCheckBits>, AttestationError> {
        let base = if is_development {
            DEV_DEVICECHECK_URL
        } else {
            PROD_DEVICECHECK_URL
        };

        let request = QueryRequest::new(device_token);

        let response = self
            .request(Method::POST, &format!("{}/v1/query_two_bits", base))?
            .json(&request)
            .send()
            .await?;

        let response = Self::handle_response_status(response).await?.text().await?;

        let json_response: Result<serde_json::Value, _> = serde_json::from_str(&response);

        // yes, wow.
        match json_response {
            Err(_) => {
                tracing::warn!(response, "got 200 string, assuming unset");
                Ok(None)
            }
            Ok(val) => Ok(serde_json::from_value(val)?),
        }
    }

    #[tracing::instrument(skip(self))]
    pub async fn update_device_bits(
        &self,
        device_token: String,
        is_development: bool,
        bit0: bool,
        bit1: bool,
    ) -> Result<(), AttestationError> {
        let base = if is_development {
            DEV_DEVICECHECK_URL
        } else {
            PROD_DEVICECHECK_URL
        };

        let request = UpdateRequest::new(device_token, bit0, bit1);

        let response = self
            .request(Method::POST, &format!("{}/v1/update_two_bits", base))?
            .json(&request)
            .send()
            .await?;

        let _ = Self::handle_response_status(response).await?;
        Ok(())
    }
}

/// inner parse and verify data from the ASN.1 receipt object
pub(super) fn inner_verify_and_parse_receipt(
    config: &Config,
    receipt: Vec<u8>,
    _ignore_time_check: bool,
) -> Result<Receipt, AttestationError> {
    let mut content = openssl::cms::CmsContentInfo::from_der(&receipt)?;

    let mut builder = X509StoreBuilder::new()?;
    for cert in &config.root_ca_list {
        builder.add_cert(cert.clone())?
    }

    // only used for testing
    #[cfg(test)]
    if _ignore_time_check {
        builder.set_flags(openssl::x509::verify::X509VerifyFlags::NO_CHECK_TIME)?;
    }

    let store: X509Store = builder.build();
    let mut out_data: Vec<u8> = Vec::new();
    content.verify(None, Some(&store), None, Some(&mut out_data), CMSOptions::empty())?;

    /* Parse the following ASN.1 structure
       ReceiptModule DEFINITIONS ::=
       BEGIN
       ReceiptAttribute ::= SEQUENCE {
           type    INTEGER,
           version INTEGER,
           value   OCTET STRING
       }
       Payload ::= SET OF ReceiptAttribute
       END
    */

    let values = der_parser::parse_der(&out_data)?
        .1
        .as_set()?
        .iter()
        .map(|seq| -> Result<_, AttestationError> {
            let seq = seq.as_sequence()?;
            if seq.len() != 3 {
                Err(DeviceCheckError::InvalidReceiptValue)?;
            }

            let typ = seq[0].as_u64()?;
            let val = seq[2].as_slice()?.to_vec();
            Ok((typ, val))
        })
        .collect::<Result<HashMap<_, _>, _>>()?;

    let parse_bytes = |typ: u64| -> Result<&[u8], DeviceCheckError> {
        let val = values
            .get(&typ)
            .ok_or(DeviceCheckError::ReceiptMissingValue(typ))?;
        Ok(val.as_ref())
    };

    let parse_string = |typ: u64| -> Result<String, DeviceCheckError> {
        Ok(std::str::from_utf8(parse_bytes(typ)?)?.to_string())
    };

    let parse_date = |typ: u64| -> Result<DateTime<Utc>, DeviceCheckError> {
        let date = parse_string(typ)?;
        let dt = DateTime::parse_from_rfc3339(&date)?;
        Ok(dt.into())
    };

    let receipt_type = match parse_string(6)?.as_str() {
        "ATTEST" => ReceiptType::Attest,
        "RECEIPT" => ReceiptType::Receipt,
        _ => return Err(DeviceCheckError::UnknownReceiptType)?,
    };

    let attested_public_key = X509::from_der(parse_bytes(3)?)?.public_key()?;

    let attested_public_key = match attested_public_key.id() {
        Id::RSA => attested_public_key.rsa()?.public_key_to_der_pkcs1()?,
        Id::ED448 | Id::ED25519 | Id::EC => {
            let ec_key = attested_public_key.ec_key()?;
            let mut ctxt = BigNumContext::new()?;
            ec_key
                .public_key()
                .to_bytes(ec_key.group(), PointConversionForm::UNCOMPRESSED, &mut ctxt)?
        }
        _ => return Err(AttestationError::UnsupportedPublicKeyType),
    };

    // Parse the receipt
    // From: https://developer.apple.com/documentation/devicecheck/assessing_fraud_risk#3579378
    let receipt = Receipt {
        app_id: parse_string(2)?,
        attested_public_key,
        client_hash: parse_bytes(4)?.to_vec(),
        token: parse_string(5)?,
        risk_metric: match receipt_type {
            ReceiptType::Attest => None,
            ReceiptType::Receipt => Some(parse_string(17)?.parse().map_err(DeviceCheckError::from)?),
        },
        creation_time: parse_date(12)?,
        not_before: match receipt_type {
            ReceiptType::Attest => None,
            ReceiptType::Receipt => Some(parse_date(19)?),
        },
        expiration_time: parse_date(21)?,
        receipt_type,
        is_sandbox: parse_string(7).ok() == Some("sandbox".into()),
    };
    Ok(receipt)
}
