use super::wire_types::VaultDrStatus;
use anyhow::{
    Context,
    Ok,
    Result,
};
use keyring::Entry;
use reqwest::blocking::{
    Client,
    RequestBuilder,
};
use reqwest::header::{
    HeaderMap,
    HeaderValue,
};
use reqwest::{
    Method,
    Url,
};
use std::fmt::{
    self,
    Display,
    Formatter,
};
use std::ops::Not;

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

        let client = reqwest::blocking::Client::builder()
            .default_headers(headers)
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

    pub(crate) fn try_from_keyring(api_root: &Url, is_live: IsLive) -> Result<Self> {
        let entry = Self::keyring_entry(api_root, is_live)?;
        let secret_key = entry
            .get_password()
            .with_context(|| "Failed to retrieve API key from keyring")?;

        Self::new(api_root.clone(), is_live, ApiKey::new(secret_key))
    }

    pub(crate) fn save_to_keyring(&self) -> Result<()> {
        let entry = Self::keyring_entry(&self.api_root, self.is_live)?;
        entry
            .set_password(self.api_key.leak_ref())
            .with_context(|| "Failed to save API key to keyring")
    }

    fn request(&self, method: Method, path: &str) -> Result<RequestBuilder> {
        Ok(self.client.request(method, self.api_root.join(path)?))
    }

    pub(crate) fn get_status(&self) -> Result<VaultDrStatus> {
        Ok(self
            .request(Method::GET, "org/vault_dr/status")?
            .send()?
            .error_for_status()?
            .json()?)
    }
}
