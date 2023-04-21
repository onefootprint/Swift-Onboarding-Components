use newtypes::decision::RuleSetName;
use newtypes::{ObConfigurationKey, OrgMemberEmail, PiiString, TenantId};
use serde_json::json;

#[derive(Debug, Eq, PartialEq, strum::Display)]
pub enum BoolFlag<'a> {
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
    #[strum(to_string = "EnableMiddeskInNonProdEnvironment")]
    EnableMiddeskInNonProd(&'a ObConfigurationKey),
    #[strum(to_string = "EnableExperianIdvCallsInNonProdEnvironment")]
    EnableExperianInNonProd(&'a ObConfigurationKey),
    #[strum(to_string = "DisableAllScanOnboardingCalls")]
    DisableAllScanOnboarding,
    #[strum(to_string = "DisableAllSocureIdvCalls")]
    DisableAllSocure,
    #[strum(to_string = "CanCleanUpPhoneNumber")]
    CanCleanUpPhoneNumber(&'a PiiString),
    #[strum(to_string = "CanCleanUpTenant")]
    CanCleanUpTenant(&'a TenantId),
}

impl<'a> BoolFlag<'a> {
    pub(crate) fn flag_name(&self) -> String {
        self.to_string()
    }

    pub(crate) fn key(&self) -> Option<String> {
        match self {
            Self::IsRiskOps(k) => Some(k.to_string()),
            Self::IsDemoTenant(k) => Some(k.to_string()),
            Self::ShouldBill(k) => Some(k.to_string()),
            Self::CanViewSocureRiskSignals(k) => Some(k.to_string()),
            Self::EnableRuleSetForDecision(k) => Some(k.to_string()),
            Self::EnableScanOnboardingInNonProd(k) => Some(k.to_string()),
            Self::EnableIdologyInNonProd(k) => Some(k.to_string()),
            Self::EnableMiddeskInNonProd(k) => Some(k.to_string()),
            Self::EnableExperianInNonProd(k) => Some(k.to_string()),
            Self::EnableSocureInNonProd(k) => Some(k.to_string()),
            Self::DisableAllScanOnboarding => None,
            Self::DisableAllSocure => None,
            Self::CanCleanUpPhoneNumber(k) => Some(k.leak_to_string()),
            Self::CanCleanUpTenant(k) => Some(k.to_string()),
        }
    }

    pub(crate) fn default(&self) -> bool {
        match self {
            Self::IsRiskOps(_) => false,
            Self::IsDemoTenant(_) => false,
            Self::ShouldBill(_) => false,
            Self::CanViewSocureRiskSignals(_) => false,
            Self::EnableRuleSetForDecision(_) => false,
            Self::EnableScanOnboardingInNonProd(_) => false,
            Self::EnableIdologyInNonProd(_) => false,
            Self::EnableMiddeskInNonProd(_) => false,
            Self::EnableSocureInNonProd(_) => false,
            Self::EnableExperianInNonProd(_) => false,
            Self::DisableAllScanOnboarding => false,
            Self::DisableAllSocure => false,
            Self::CanCleanUpPhoneNumber(_) => false,
            Self::CanCleanUpTenant(_) => false,
        }
    }
}

#[derive(Debug, Eq, PartialEq, strum::Display)]
pub enum JsonFlag<'a> {
    #[strum(to_string = "BillingProfile")]
    BillingProfile(&'a TenantId),
}

impl<'a> JsonFlag<'a> {
    pub(crate) fn flag_name(&self) -> String {
        self.to_string()
    }

    pub(crate) fn key(&self) -> Option<String> {
        match self {
            Self::BillingProfile(k) => Some(k.to_string()),
        }
    }

    pub(crate) fn default(&self) -> serde_json::Value {
        match self {
            Self::BillingProfile(_) => json!({}),
        }
    }
}
