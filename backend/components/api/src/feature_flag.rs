use std::sync::Arc;

use launchdarkly_server_sdk::{Client, ConfigBuilder, ContextBuilder, Detail};
#[cfg(test)]
use mockall::{automock, predicate::*};
use newtypes::{ObConfigurationKey, OrgMemberEmail, TenantId, Uuid};
use thiserror::Error;

use crate::decision::rule::RuleSetName;

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

#[derive(Clone)]
pub struct LaunchDarklyFeatureFlagClient {
    pub launch_darkly_client: Option<Arc<launchdarkly_server_sdk::Client>>,
}

impl LaunchDarklyFeatureFlagClient {
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

    #[tracing::instrument(skip(self))]
    fn bool_flag(&self, flag_name: &str) -> Result<bool, FeatureFlagError> {
        let key = Uuid::new_v4().to_string();
        let context_builder = ContextBuilder::new(key);
        self.get_and_log_ld_bool_flag(flag_name, context_builder)
    }

    #[tracing::instrument(skip(self))]
    fn bool_flag_with_key(&self, flag_name: &str, key: String) -> Result<bool, FeatureFlagError> {
        let context_builder = ContextBuilder::new(key);
        self.get_and_log_ld_bool_flag(flag_name, context_builder)
    }

    //bool_variation_detail
    fn get_ld_bool_flag_detail(
        &self,
        flag_name: &str,
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
                let detail = c.bool_variation_detail(&context, flag_name, false);
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
        flag_name: &str,
        context_builder: ContextBuilder,
    ) -> Result<bool, FeatureFlagError> {
        let res = self.get_ld_bool_flag_detail(flag_name, context_builder);
        match res {
            Ok(detail) => {
                tracing::info!(flag_name=%flag_name, detail=format!("{:?}", detail), "LaunchDarkly flag result");
                Ok(detail.value.unwrap_or(false))
            }
            Err(err) => {
                tracing::warn!(flag_name=%flag_name, err=%err, "LaunchDarklyError");
                Err(err)
            }
        }
    }
}

#[derive(Debug, Eq, PartialEq, strum::Display)]
pub enum FeatureFlag<'a> {
    #[strum(to_string = "IsFirmEmployeeRiskOps")]
    IsRiskOps(&'a OrgMemberEmail),
    #[strum(to_string = "IsDemoTenant")]
    IsDemoTenant(&'a TenantId),
    #[strum(to_string = "EnableBilling")]
    ShouldBill(&'a TenantId),
    #[strum(to_string = "TenantCanViewSocureRiskSignal")]
    CanViewSocureRiskSignals(&'a TenantId),
    #[strum(to_string = "EnableRuleSetForDecision")]
    EnableRuleSetForDecision(&'a RuleSetName),
    #[strum(to_string = "EnableIdologyIdvCallsInNonProdEnvironment")]
    EnableIdologyInNonProd(&'a ObConfigurationKey),
    #[strum(to_string = "EnableSocureIdvCallsInNonProdEnvironment")]
    EnableSocureInNonProd(&'a ObConfigurationKey),
    #[strum(to_string = "EnableScanOnboardingCallsInNonProdEnvironment")]
    EnableScanOnboardingInNonProd(&'a ObConfigurationKey),
    #[strum(to_string = "DisableAllScanOnboardingCalls")]
    DisableAllScanOnboarding,
    #[strum(to_string = "DisableAllSocureIdvCalls")]
    DisableAllSocure,
}

impl<'a> FeatureFlag<'a> {
    fn flag_name(&self) -> String {
        self.to_string()
    }

    fn key(&self) -> Option<String> {
        match self {
            Self::IsRiskOps(k) => Some(k.to_string()),
            Self::IsDemoTenant(k) => Some(k.to_string()),
            Self::ShouldBill(k) => Some(k.to_string()),
            Self::CanViewSocureRiskSignals(k) => Some(k.to_string()),
            Self::EnableRuleSetForDecision(k) => Some(k.to_string()),
            Self::EnableScanOnboardingInNonProd(k) => Some(k.to_string()),
            Self::EnableIdologyInNonProd(k) => Some(k.to_string()),
            Self::EnableSocureInNonProd(k) => Some(k.to_string()),
            Self::DisableAllScanOnboarding => None,
            Self::DisableAllSocure => None,
        }
    }

    fn default(&self) -> bool {
        match self {
            Self::IsRiskOps(_) => false,
            Self::IsDemoTenant(_) => false,
            Self::ShouldBill(_) => false,
            Self::CanViewSocureRiskSignals(_) => false,
            Self::EnableRuleSetForDecision(_) => false,
            Self::EnableScanOnboardingInNonProd(_) => false,
            Self::EnableIdologyInNonProd(_) => false,
            Self::EnableSocureInNonProd(_) => false,
            Self::DisableAllScanOnboarding => false,
            Self::DisableAllSocure => false,
        }
    }
}

#[cfg_attr(test, automock)]
pub trait FeatureFlagClient: Sync + Send {
    #[allow(clippy::needless_lifetimes)]
    fn flag<'a>(&self, flag: FeatureFlag<'a>) -> bool;
}

impl FeatureFlagClient for LaunchDarklyFeatureFlagClient {
    #[tracing::instrument(skip(self))]
    fn flag<'a>(&self, flag: FeatureFlag<'a>) -> bool {
        let result = if let Some(key) = flag.key() {
            self.bool_flag_with_key(&flag.flag_name(), key)
        } else {
            self.bool_flag(&flag.flag_name())
        };
        result.unwrap_or_else(|_| flag.default())
    }
}

#[cfg(test)]
mod test {
    use super::FeatureFlag as FF;
    use newtypes::{OrgMemberEmail, TenantId};
    use test_case::test_case;

    #[test_case(FF::IsRiskOps(&OrgMemberEmail("e@e.com".to_string())) => "IsFirmEmployeeRiskOps")]
    #[test_case(FF::IsDemoTenant(&TenantId::test_data("org_id".to_string())) => "IsDemoTenant")]
    fn test_flag_name(ff: FF) -> String {
        ff.flag_name()
    }
}
