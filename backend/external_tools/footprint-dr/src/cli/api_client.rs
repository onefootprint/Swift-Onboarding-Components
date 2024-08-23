use super::wire_types::VaultDrAwsPreEnrollResponse;
use super::wire_types::VaultDrEnrollRequest;
use super::wire_types::VaultDrEnrollResponse;
use super::wire_types::VaultDrRevealWrappedRecordKeysRequest;
use super::wire_types::VaultDrRevealWrappedRecordKeysResponse;
use super::wire_types::VaultDrStatus;
use crate::cli::wire_types::ApiError;
use anyhow::anyhow;
use anyhow::bail;
use anyhow::Context;
use anyhow::Ok;
use anyhow::Result;
use keyring::Entry;
use reqwest::header::HeaderMap;
use reqwest::header::HeaderValue;
use reqwest::Client;
use reqwest::Method;
use reqwest::RequestBuilder;
use reqwest::Response;
use reqwest::StatusCode;
use reqwest::Url;
use serde::de::DeserializeOwned;
use std::env;
use std::fmt;
use std::fmt::Display;
use std::fmt::Formatter;
use std::ops::Not;
use std::result::Result as StdResult;

pub(crate) const API_KEY_ENV_VAR: &str = "FOOTPRINT_API_KEY";

#[derive(Debug, PartialEq, Eq, Clone, Copy)]
pub(crate) enum IsLive {
    Sandbox,
    Live,
}

impl From<bool> for IsLive {
    fn from(is_live: bool) -> Self {
        if is_live {
            IsLive::Live
        } else {
            IsLive::Sandbox
        }
    }
}

impl Not for IsLive {
    type Output = Self;

    fn not(self) -> Self::Output {
        match self {
            IsLive::Sandbox => IsLive::Live,
            IsLive::Live => IsLive::Sandbox,
        }
    }
}

impl Display for IsLive {
    fn fmt(&self, f: &mut Formatter) -> fmt::Result {
        match self {
            IsLive::Sandbox => write!(f, "Sandbox"),
            IsLive::Live => write!(f, "Live"),
        }
    }
}

impl IsLive {
    pub(crate) fn fmt_flag(&self) -> String {
        format!("--{}", self.to_string().to_lowercase())
    }
}

pub(crate) struct ApiKey {
    secret_key: String,
}

impl ApiKey {
    pub(crate) fn new(secret_key: String) -> Self {
        Self { secret_key }
    }

    fn leak_ref(&self) -> &str {
        &self.secret_key
    }
}

impl Display for ApiKey {
    fn fmt(&self, f: &mut Formatter) -> fmt::Result {
        write!(f, "<redacted Footprint API key>")
    }
}

pub(crate) struct VaultDrApiClient {
    pub(crate) api_root: Url,
    pub(crate) is_live: IsLive,
    api_key: ApiKey,
    client: Client,
}

impl VaultDrApiClient {
    pub(crate) fn new(api_root: Url, is_live: IsLive, api_key: ApiKey) -> Result<Self> {
        let mut headers = HeaderMap::new();
        headers.insert(
            "X-Footprint-Secret-Key",
            HeaderValue::from_str(api_key.leak_ref())?,
        );

        let client = reqwest::Client::builder()
            .default_headers(headers)
            .user_agent(concat!(env!("CARGO_PKG_NAME"), " ", env!("CARGO_PKG_VERSION")))
            .build()?;

        Ok(Self {
            api_root,
            is_live,
            api_key,
            client,
        })
    }

    fn keyring_entry(api_root: &Url, is_live: IsLive) -> Result<Entry> {
        let service_name = match is_live {
            IsLive::Sandbox => format!("footprint-dr sandbox: {}", api_root),
            IsLive::Live => format!("footprint-dr live: {}", api_root),
        };
        Entry::new(&service_name, "api_key").with_context(|| "Failed to create keyring entry")
    }

    pub(crate) async fn try_from_keyring(api_root: &Url, is_live: IsLive) -> Result<Self> {
        let entry = Self::keyring_entry(api_root, is_live)?;
        let secret_key = tokio::task::spawn_blocking(move || -> Result<String> {
            let secret_key = entry
                .get_password()
                .with_context(|| "Failed to retrieve API key from keyring")?;
            Ok(secret_key)
        })
        .await??;

        let client = Self::new(api_root.clone(), is_live, ApiKey::new(secret_key))?;

        // Check that the credentials in the keyring are valid.
        let status = client.get_status().await?;
        if IsLive::from(status.is_live) != is_live {
            bail!(
                "Keyring has been corrupted. Run `footprint login {}` to log in again.",
                is_live.fmt_flag()
            );
        }

        Ok(client)
    }

    pub(crate) fn save_to_keyring(&self) -> Result<()> {
        let entry = Self::keyring_entry(&self.api_root, self.is_live)?;
        entry
            .set_password(self.api_key.leak_ref())
            .with_context(|| "Failed to save API key to keyring")
    }

    pub(crate) async fn try_from_env(api_root: &Url, is_live: IsLive) -> Result<Option<Self>> {
        let StdResult::Ok(secret_key) = env::var(API_KEY_ENV_VAR) else {
            return Ok(None);
        };

        let client = Self::new(api_root.clone(), is_live, ApiKey::new(secret_key))?;

        // Check that the credentials are valid.
        let status = client.get_status().await?;
        if IsLive::from(status.is_live) != is_live {
            bail!(
                "The given {} environment variable is for the {} environment, not the {} environment",
                API_KEY_ENV_VAR,
                IsLive::from(status.is_live),
                is_live,
            );
        }

        Ok(Some(client))
    }

    fn request(&self, method: Method, path: &str) -> Result<RequestBuilder> {
        log::debug!("{} {}", method, path);
        Ok(self.client.request(method, self.api_root.join(path)?))
    }

    async fn handle_response<T>(resp: Response) -> Result<T>
    where
        T: DeserializeOwned,
    {
        if let Err(err) = resp.error_for_status_ref() {
            let body = resp.text().await?;
            let message: String = serde_json::from_str(&body)
                .map(|e: ApiError| e.message)
                .unwrap_or(body.clone());
            log::debug!("{}: {}", err, body);
            bail!(message);
        };

        Ok(resp.json().await?)
    }

    pub(crate) async fn get_status(&self) -> Result<VaultDrStatus> {
        let resp = self.request(Method::GET, "org/vault_dr/status")?.send().await?;

        Self::handle_response(resp).await
    }

    pub(crate) async fn get_aws_pre_enrollment(&self) -> Result<Option<VaultDrAwsPreEnrollResponse>> {
        let resp = self
            .request(Method::GET, "org/vault_dr/aws_pre_enrollment")?
            .send()
            .await?;

        if resp.status() == StatusCode::NOT_FOUND {
            return Ok(None);
        }

        Ok(Some(Self::handle_response(resp).await?))
    }

    pub(crate) async fn aws_pre_enroll(&self) -> Result<VaultDrAwsPreEnrollResponse> {
        let resp = self
            .request(Method::POST, "org/vault_dr/aws_pre_enrollment")?
            .send()
            .await?;

        Self::handle_response(resp).await
    }

    pub(crate) async fn enroll(&self, req: VaultDrEnrollRequest) -> Result<VaultDrEnrollResponse> {
        let resp = self
            .request(Method::POST, "org/vault_dr/enroll")?
            .json(&req)
            .send()
            .await?;

        Self::handle_response(resp).await
    }

    pub(crate) async fn reveal_wrapped_record_keys(
        &self,
        req: VaultDrRevealWrappedRecordKeysRequest,
    ) -> Result<VaultDrRevealWrappedRecordKeysResponse> {
        let resp = self
            .request(Method::POST, "org/vault_dr/reveal_wrapped_record_keys")?
            .json(&req)
            .send()
            .await?;

        Self::handle_response(resp).await
    }
}

pub(crate) async fn get_cli_client(api_root: &Url, is_live: IsLive) -> Result<VaultDrApiClient> {
    let client = VaultDrApiClient::try_from_env(api_root, is_live).await?;

    if let Some(client) = client {
        log::debug!("Using API key from environment variable");
        return Ok(client);
    }

    let client = VaultDrApiClient::try_from_keyring(api_root, is_live)
        .await
        .map_err(|err| {
            log::debug!("{:?}, ", err);

            anyhow!(
                "Not logged in. Run `footprint login {}` to log in.",
                is_live.fmt_flag()
            )
        })?;

    log::debug!("Using API key from keyring");
    Ok(client)
}
