use std::sync::Arc;

use launchdarkly_server_sdk::{Client, ConfigBuilder, ContextBuilder};
use newtypes::{TenantId, Uuid};
use thiserror::Error;

#[derive(Debug, Error)]
pub enum FeatureFlagError {
    #[error("Launch Darkly error: {0}")]
    LaunchDarklyError(String),
    #[error("Launch Darkly client failed to initialize")]
    LaunchDarklyClientFailedToInitialize,
}

#[derive(Clone)]
pub struct FeatureFlagClient {
    pub launch_darkly_client: Option<Arc<launchdarkly_server_sdk::Client>>,
}

impl FeatureFlagClient {
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

    pub fn bool_flag(&self, flag_key: &str) -> Result<bool, FeatureFlagError> {
        let key = Uuid::new_v4().to_string();
        let context = ContextBuilder::new(key)
            .build()
            .map_err(FeatureFlagError::LaunchDarklyError)?;
        let flag_value = self
            .launch_darkly_client
            .as_ref()
            .ok_or(FeatureFlagError::LaunchDarklyClientFailedToInitialize)
            .map(|c| c.bool_variation(&context, flag_key, false));
        flag_value
    }

    pub fn bool_flag_by_tenant_id(
        &self,
        flag_key: &str,
        tenant_id: &TenantId,
    ) -> Result<bool, FeatureFlagError> {
        let context = ContextBuilder::new(tenant_id.clone())
            .build()
            .map_err(FeatureFlagError::LaunchDarklyError)?;
        let flag_value = self
            .launch_darkly_client
            .as_ref()
            .ok_or(FeatureFlagError::LaunchDarklyClientFailedToInitialize)
            .map(|c| c.bool_variation(&context, flag_key, false));
        flag_value
    }
}
