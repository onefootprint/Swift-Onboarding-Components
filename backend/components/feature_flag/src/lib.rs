use launchdarkly_server_sdk::Client;
use launchdarkly_server_sdk::ConfigBuilder;
use launchdarkly_server_sdk::ContextBuilder;
use mockall::automock;
use mockall::predicate::*;
use rollout::JsonLdRollout;
use rollout::LdRollout;
use serde_json::json;
use std::sync::Arc;
use thiserror::Error;

mod flags;
pub use flags::*;

mod rollout;

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

impl api_errors::FpErrorTrait for Error {
    fn status_code(&self) -> api_errors::StatusCode {
        api_errors::StatusCode::INTERNAL_SERVER_ERROR
    }

    fn message(&self) -> String {
        self.to_string()
    }
}

struct ManagedClient {
    inner: launchdarkly_server_sdk::Client,
}

impl Drop for ManagedClient {
    fn drop(&mut self) {
        self.inner.close();
    }
}

#[derive(Clone)]
pub struct LaunchDarklyFeatureFlagClient {
    launch_darkly_client: Option<Arc<ManagedClient>>,
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
                launch_darkly_client: Some(Arc::new(ManagedClient { inner: client })),
            })
        }
    }

    fn unwrap_client(&self) -> Result<&Arc<ManagedClient>, Error> {
        let client = self
            .launch_darkly_client
            .as_ref()
            .ok_or(Error::ClientFailedToInit)?;
        Ok(client)
    }

    fn get_bool_flag<'a>(&self, flag: &'a BoolFlag<'a>) -> Result<bool, Error> {
        if flag.is_migrated_to_new_format() {
            // We're going to do this "is in list" operation on the client side
            return self.get_rollout_bool_flag(flag);
        }
        // Legacy flag that still relies on LaunchDarkly evaluation logic
        let key = flag.key().unwrap_or("global".into());
        let context = ContextBuilder::new(key)
            .build()
            .map_err(Error::ContextBuilderError)?;

        let client = &self.unwrap_client()?.inner;
        let detail = client.bool_variation_detail(&context, &flag.flag_name(), flag.default());
        if let launchdarkly_server_sdk::Reason::Error { error } = detail.reason {
            return Err(Error::LdError(error));
        }
        let val = detail.value.unwrap_or_else(|| flag.default());
        Ok(val)
    }

    /// More modern implementation of get_bool_flag.
    fn get_rollout_bool_flag<'a>(&self, flag: &'a BoolFlag<'a>) -> Result<bool, Error> {
        let client = &self.unwrap_client()?.inner;
        let rollout = get_rollout_flag_value::<LdRollout>(client, &flag.flag_name())?;
        // Evaluate whether the key is included in the rollout locally
        let value = rollout.map(|r| r.evaluate(flag.key())).unwrap_or(flag.default());
        Ok(value)
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

/// Grabs the static rollout value from LaunchDarkly and parses into the provided T, which is
/// one of LdRollout or JsonLdRollout.
/// Returns Ok(None) as the default evaluation.
fn get_rollout_flag_value<T>(client: &Client, flag_name: &str) -> Result<Option<T>, Error>
where
    T: serde::de::DeserializeOwned + serde::ser::Serialize,
{
    // Use a single, fixed key for all contexts. We're not using LaunchDarkly to evaluate
    // a flag based on the context - we'll do that evluation on our side.
    let context = ContextBuilder::new("global")
        .build()
        .map_err(Error::ContextBuilderError)?;

    // Fetch the rollout JSON value from launch darkly
    let detail = client.json_variation_detail(&context, flag_name, json!(null));
    if let launchdarkly_server_sdk::Reason::Error { error } = detail.reason {
        return Err(Error::LdError(error));
    }
    let val = detail.value.unwrap_or(json!(null));
    let val = serde_json::value::from_value(val)?;
    Ok(val)
}

#[automock]
pub trait FeatureFlagClient: Sync + Send + 'static {
    #[allow(clippy::needless_lifetimes)]
    fn flag<'a>(&self, flag: BoolFlag<'a>) -> bool;

    #[allow(clippy::needless_lifetimes)]
    fn json_flag<'a>(&self, flag: JsonFlag<'a>) -> Result<serde_json::Value, serde_json::Error>;
}

impl FeatureFlagClient for LaunchDarklyFeatureFlagClient {
    /// Fetches the value for the provided BoolFlag
    fn flag(&self, flag: BoolFlag) -> bool {
        let result = self.get_bool_flag(&flag);
        Self::log_flag(&result, flag.flag_name());
        // Catch errors reading the value from LD by returning the default value - we will
        // log an error if we can't evaluate the flag, but shouldn't stop program execution
        result.unwrap_or_else(|_| flag.default())
    }

    /// Fetches the value for the provided JsonFlag and deserializes into T
    fn json_flag(&self, flag: JsonFlag) -> Result<serde_json::Value, serde_json::Error> {
        let evaluate_flag = || -> Result<serde_json::Value, Error> {
            let client = &self.unwrap_client()?.inner;
            let rollout = get_rollout_flag_value::<JsonLdRollout>(client, &flag.flag_name())?;
            let value = rollout
                .and_then(|r| r.evaluate(flag.key()))
                .unwrap_or(flag.default());
            Ok(value)
        };
        let result = evaluate_flag();
        Self::log_flag(&result, flag.flag_name());
        // Catch errors reading the value from LD by returning the default value - we will
        // log an error if we can't evaluate the flag, but shouldn't stop program execution
        let value = result.unwrap_or_else(|_| flag.default());
        Ok(value)
    }
}

#[cfg(test)]
mod test {
    use super::BoolFlag as FF;
    use newtypes::OrgMemberEmail;
    use newtypes::TenantId;
    use test_case::test_case;

    #[test_case(FF::IsRiskOps(&OrgMemberEmail("e@e.com".to_string())) => "IsFirmEmployeeRiskOps")]
    #[test_case(FF::IsDemoTenant(&TenantId::test_data("org_id".to_string())) => "IsDemoTenant")]
    fn test_flag_name(ff: FF) -> String {
        ff.flag_name()
    }
}
