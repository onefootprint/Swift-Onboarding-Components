use launchdarkly_server_sdk::{Client, ConfigBuilder, ContextBuilder};
use mockall::{automock, predicate::*};
use newtypes::Uuid;
use std::sync::Arc;
use thiserror::Error;

mod flags;
pub use flags::*;

#[derive(Debug, Error)]
#[allow(clippy::enum_variant_names)]
pub enum Error {
    #[error("Launch Darkly error when building Context: {0}")]
    ContextBuilderError(String),
    #[error("Launch Darkly error: {0:?}")]
    LdError(launchdarkly_server_sdk::EvalError),
    #[error("Launch Darkly client failed to initialize")]
    ClientFailedToInit,
    #[error("{0}")]
    SerdeJson(#[from] serde_json::Error),
}

#[derive(Clone)]
pub struct LaunchDarklyFeatureFlagClient {
    pub launch_darkly_client: Option<Arc<launchdarkly_server_sdk::Client>>,
}

impl LaunchDarklyFeatureFlagClient {
    #[allow(clippy::new_without_default)]
    pub fn new() -> Self {
        Self {
            launch_darkly_client: None,
        }
    }

    pub async fn init(&self, sdk_key: &str) -> Result<Self, Box<dyn std::error::Error>> {
        let config = ConfigBuilder::new(sdk_key).build();
        let client = Client::build(config)?;
        client.start_with_default_executor();
        if !client.initialized_async().await {
            Err("Client failed to successfully initialize".into())
        } else {
            Ok(Self {
                launch_darkly_client: Some(Arc::new(client)),
            })
        }
    }

    fn unwrap_client(&self) -> Result<&Arc<Client>, Error> {
        let client = self
            .launch_darkly_client
            .as_ref()
            .ok_or(Error::ClientFailedToInit)?;
        Ok(client)
    }

    fn get_bool_flag<'a>(&self, flag: &'a BoolFlag<'a>) -> Result<bool, Error> {
        let key = flag.key().unwrap_or_else(|| Uuid::new_v4().to_string());
        let context = ContextBuilder::new(key)
            .build()
            .map_err(Error::ContextBuilderError)?;

        let client = self.unwrap_client()?;
        let detail = client.bool_variation_detail(&context, &flag.flag_name(), flag.default());
        if let launchdarkly_server_sdk::Reason::Error { error } = detail.reason {
            return Err(Error::LdError(error));
        }
        let val = detail.value.unwrap_or_else(|| flag.default());
        Ok(val)
    }

    fn log_flag<T: std::fmt::Debug>(result: &Result<T, Error>, flag_name: String) {
        match result {
            Ok(ref result) => {
                tracing::info!(flag_name=%flag_name, detail=format!("{:?}", result), "LaunchDarkly flag result")
            }
            Err(ref err) => tracing::warn!(flag_name=%flag_name, error=%err, "LaunchDarklyError"),
        }
    }
}

#[automock]
pub trait FeatureFlagClient: Sync + Send + 'static {
    #[allow(clippy::needless_lifetimes)]
    fn flag<'a>(&self, flag: BoolFlag<'a>) -> bool;
}

impl FeatureFlagClient for LaunchDarklyFeatureFlagClient {
    #[tracing::instrument(skip(self))]
    /// Fetches the value for the provided BoolFlag
    fn flag<'a>(&self, flag: BoolFlag<'a>) -> bool {
        let result = self.get_bool_flag(&flag);
        Self::log_flag(&result, flag.flag_name());
        result.unwrap_or_else(|_| flag.default())
    }
}

impl LaunchDarklyFeatureFlagClient {
    /// Fetches the value for the provided JsonFlag and deserializes into T
    #[tracing::instrument(skip(self))]
    pub fn json_flag<'a, T>(&self, flag: JsonFlag<'a>) -> Result<T, Error>
    where
        T: serde::de::DeserializeOwned,
    {
        // Could put this on the FeatureFlagClient trait if we want to mock it
        let key = flag.key().unwrap_or_else(|| Uuid::new_v4().to_string());
        let context = ContextBuilder::new(key)
            .build()
            .map_err(Error::ContextBuilderError)?;
        let client = self.unwrap_client()?;
        let detail = client.json_variation_detail(&context, &flag.flag_name(), flag.default());
        if let launchdarkly_server_sdk::Reason::Error { error } = detail.reason {
            return Err(Error::LdError(error));
        }
        let val = detail.value.unwrap_or_else(|| flag.default());
        let val = serde_json::value::from_value(val)?;
        Ok(val)
    }
}

#[cfg(test)]
mod test {
    use super::BoolFlag as FF;
    use newtypes::{OrgMemberEmail, TenantId};
    use test_case::test_case;

    #[test_case(FF::IsRiskOps(&OrgMemberEmail("e@e.com".to_string())) => "IsFirmEmployeeRiskOps")]
    #[test_case(FF::IsDemoTenant(&TenantId::test_data("org_id".to_string())) => "IsDemoTenant")]
    fn test_flag_name(ff: FF) -> String {
        ff.flag_name()
    }
}
