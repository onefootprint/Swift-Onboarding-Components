use newtypes::{ObConfigurationKey, OrgMemberEmail, PiiString, TenantId};
use serde_json::json;

#[derive(Debug, Eq, PartialEq, strum::Display)]
pub enum BoolFlag<'a> {
    #[strum(to_string = "IsFirmEmployeeRiskOps")]
    IsRiskOps(&'a OrgMemberEmail),
    #[strum(to_string = "IsDemoTenant")]
    IsDemoTenant(&'a TenantId),
    #[strum(to_string = "TenantCanViewSocureRiskSignal")]
    CanViewSocureRiskSignals(&'a TenantId),
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
    #[strum(to_string = "CreateOnboardingWorkflows")]
    CreateOnboardingWorkflows(&'a ObConfigurationKey),
    #[strum(to_string = "IsAlpacaTenant")]
    IsAlpacaTenant(&'a TenantId),
    #[strum(to_string = "RestrictToUsDriversLicense")]
    RestrictToUsDriversLicense(&'a TenantId),
    #[strum(to_string = "IsAppClipEnabled")]
    IsAppClipEnabled(&'a TenantId),
    #[strum(to_string = "IsInstantAppEnabled")]
    IsInstantAppEnabled(&'a TenantId),
    #[strum(to_string = "CanMakeDemoIncodeRequestsInSandbox")]
    CanMakeDemoIncodeRequestsInSandbox(&'a TenantId),
    #[strum(to_string = "CanSkipSelfie")]
    CanSkipSelfie(&'a TenantId),
    #[strum(to_string = "OmitEmailVerification")]
    OmitEmailVerification(&'a TenantId),
    #[strum(to_string = "TenantCanMakeNoPhoneObc")]
    TenantCanMakeNoPhoneObc(&'a TenantId),
    #[strum(to_string = "TenantCanMakeDocFirstObc")]
    TenantCanMakeDocFirstObc(&'a TenantId),
    #[strum(to_string = "IsSkipKycTenant")]
    IsSkipKycTenant(&'a TenantId),
}

impl<'a> BoolFlag<'a> {
    pub(crate) fn flag_name(&self) -> String {
        self.to_string()
    }

    pub(crate) fn key(&self) -> Option<String> {
        match self {
            Self::IsRiskOps(k) => Some(k.to_string()),
            Self::IsDemoTenant(k) => Some(k.to_string()),
            Self::CanViewSocureRiskSignals(k) => Some(k.to_string()),
            Self::EnableScanOnboardingInNonProd(k) => Some(k.to_string()),
            Self::EnableIdologyInNonProd(k) => Some(k.to_string()),
            Self::EnableMiddeskInNonProd(k) => Some(k.to_string()),
            Self::EnableExperianInNonProd(k) => Some(k.to_string()),
            Self::EnableSocureInNonProd(k) => Some(k.to_string()),
            Self::DisableAllScanOnboarding => None,
            Self::DisableAllSocure => None,
            Self::CanCleanUpPhoneNumber(k) => Some(k.leak_to_string()),
            Self::CanCleanUpTenant(k) => Some(k.to_string()),
            Self::CreateOnboardingWorkflows(k) => Some(k.to_string()),
            Self::IsAlpacaTenant(k) => Some(k.to_string()),
            Self::RestrictToUsDriversLicense(k) => Some(k.to_string()),
            Self::IsAppClipEnabled(k) => Some(k.to_string()),
            Self::IsInstantAppEnabled(k) => Some(k.to_string()),
            Self::CanMakeDemoIncodeRequestsInSandbox(k) => Some(k.to_string()),
            Self::CanSkipSelfie(k) => Some(k.to_string()),
            Self::OmitEmailVerification(k) => Some(k.to_string()),
            Self::TenantCanMakeNoPhoneObc(k) => Some(k.to_string()),
            Self::TenantCanMakeDocFirstObc(k) => Some(k.to_string()),
            Self::IsSkipKycTenant(k) => Some(k.to_string()),
        }
    }

    pub fn default(&self) -> bool {
        match self {
            Self::IsRiskOps(_) => false,
            Self::IsDemoTenant(_) => false,
            Self::CanViewSocureRiskSignals(_) => false,
            Self::EnableScanOnboardingInNonProd(_) => false,
            Self::EnableIdologyInNonProd(_) => false,
            Self::EnableMiddeskInNonProd(_) => false,
            Self::EnableSocureInNonProd(_) => false,
            Self::EnableExperianInNonProd(_) => false,
            Self::DisableAllScanOnboarding => false,
            Self::DisableAllSocure => false,
            Self::CanCleanUpPhoneNumber(_) => false,
            Self::CanCleanUpTenant(_) => false,
            Self::CreateOnboardingWorkflows(_) => false,
            Self::IsAlpacaTenant(_) => false,
            Self::RestrictToUsDriversLicense(_) => false,
            Self::IsAppClipEnabled(_) => false,
            Self::IsInstantAppEnabled(_) => false,
            Self::CanMakeDemoIncodeRequestsInSandbox(_) => false,
            Self::CanSkipSelfie(_) => false,
            Self::OmitEmailVerification(_) => false,
            Self::TenantCanMakeNoPhoneObc(_) => false,
            Self::TenantCanMakeDocFirstObc(_) => false,
            Self::IsSkipKycTenant(_) => false,
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
