use std::sync::Arc;

use launchdarkly_server_sdk::{Client, ConfigBuilder, ContextBuilder, Detail};
#[cfg(test)]
use mockall::{automock, predicate::*};
use newtypes::Uuid;
use thiserror::Error;

#[derive(Debug, Error)]
#[allow(clippy::enum_variant_names)]
pub enum FeatureFlagError {
    #[error("Launch Darkly error when building Context: {0}")]
    LaunchDarklyContextBuilderError(String),
    #[error("Launch Darkly error: {0:?}")]
    LaunchDarklyError(launchdarkly_server_sdk::EvalError),
    #[error("Launch Darkly client failed to initialize")]
    LaunchDarklyClientFailedToInitialize,
}

#[cfg_attr(test, automock)]
pub trait FeatureFlagClient: Sync + Send {
    fn bool_flag(&self, flag_key: &str) -> Result<bool, FeatureFlagError>;

    fn bool_flag_with_key<T: ToString + std::fmt::Debug + 'static>(
        &self,
        flag_key: &str,
        key: &T,
    ) -> Result<bool, FeatureFlagError>;
}

#[derive(Clone)]
pub struct LaunchDarklyFeatureFlagClient {
    pub launch_darkly_client: Option<Arc<launchdarkly_server_sdk::Client>>,
}

impl LaunchDarklyFeatureFlagClient {
    pub const IS_RISK_OPS: &str = "IsFirmEmployeeRiskOps";

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
}

impl LaunchDarklyFeatureFlagClient {
    //bool_variation_detail
    fn get_ld_bool_flag_detail(
        &self,
        flag_key: &str,
        context_builder: ContextBuilder,
    ) -> Result<Detail<bool>, FeatureFlagError> {
        let context = context_builder
            .build()
            .map_err(FeatureFlagError::LaunchDarklyContextBuilderError)?;

        let flag_value = self
            .launch_darkly_client
            .as_ref()
            .ok_or(FeatureFlagError::LaunchDarklyClientFailedToInitialize)
            .and_then(|c| {
                let detail = c.bool_variation_detail(&context, flag_key, false);
                match detail.reason {
                    launchdarkly_server_sdk::Reason::Error { error } => {
                        Err(FeatureFlagError::LaunchDarklyError(error))
                    }
                    _ => Ok(detail),
                }
            });
        flag_value
    }

    fn get_and_log_ld_bool_flag(
        &self,
        flag_key: &str,
        context_builder: ContextBuilder,
    ) -> Result<bool, FeatureFlagError> {
        let res = self.get_ld_bool_flag_detail(flag_key, context_builder);
        match res {
            Ok(detail) => {
                tracing::info!(flag_key=%flag_key, detail=format!("{:?}", detail), "LaunchDarkly flag result");
                Ok(detail.value.unwrap_or(false))
            }
            Err(err) => {
                tracing::warn!(flag_key=%flag_key, err=%err, "LaunchDarklyError");
                Err(err)
            }
        }
    }
}

impl FeatureFlagClient for LaunchDarklyFeatureFlagClient {
    #[tracing::instrument(skip(self))]
    fn bool_flag(&self, flag_key: &str) -> Result<bool, FeatureFlagError> {
        let key = Uuid::new_v4().to_string();
        let context_builder = ContextBuilder::new(key);
        self.get_and_log_ld_bool_flag(flag_key, context_builder)
    }

    #[tracing::instrument(skip(self))]
    fn bool_flag_with_key<T: ToString + std::fmt::Debug>(
        &self,
        flag_key: &str,
        key: &T,
    ) -> Result<bool, FeatureFlagError> {
        let context_builder = ContextBuilder::new(key.to_string());
        self.get_and_log_ld_bool_flag(flag_key, context_builder)
    }
}
