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
    #[strum(to_string = "EnableLexisInNonProd")]
    EnableLexisInNonProd(&'a ObConfigurationKey),
    #[strum(to_string = "DisableAllSocureIdvCalls")]
    DisableAllSocure,
    #[strum(to_string = "DisableSelfieChecking")]
    DisableSelfieChecking(&'a TenantId),
    #[strum(to_string = "CanCleanUpPhoneNumber")]
    CanCleanUpPhoneNumber(&'a PiiString),
    #[strum(to_string = "CanCleanUpTenant")]
    CanCleanUpTenant(&'a TenantId),
    #[strum(to_string = "CreateOnboardingWorkflows")]
    CreateOnboardingWorkflows(&'a ObConfigurationKey),
    #[strum(to_string = "IsAlpacaTenant")]
    IsAlpacaTenant(&'a TenantId),
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
    #[strum(to_string = "DisableConservativeGlareForDocument")]
    DisableConservativeGlareForDocument(&'a TenantId),
    #[strum(to_string = "DisableConservativeSharpnessForDocument")]
    DisableConservativeSharpnessForDocument(&'a TenantId),
    #[strum(to_string = "DisallowDriverLicensePermits")]
    DisallowDriverLicensePermits(&'a TenantId),
    #[strum(to_string = "EnableIncodeWatchlistCheckInNonProd")]
    EnableIncodeWatchlistCheckInNonProd(&'a ObConfigurationKey),
    #[strum(to_string = "UseIncodeDemoCredentialsInLivemode")]
    UseIncodeDemoCredentialsInLivemode(&'a TenantId),
    #[strum(to_string = "IsKycWaterfallOnRuleFailureEnabled")]
    IsKycWaterfallOnRuleFailureEnabled(&'a TenantId),
    #[strum(to_string = "CanProvideThirdPartyAuth")]
    CanProvideThirdPartyAuth(&'a TenantId),
    #[strum(to_string = "RunAwsRekognition")]
    RunAwsRekognition(&'a TenantId),
    #[strum(to_string = "CreateKycWorkflowForAlpacaOnboardings")]
    CreateKycWorkflowForAlpacaOnboardings(&'a ObConfigurationKey),
    #[strum(to_string = "StepUpOnAmlHit")]
    StepUpOnAmlHit(&'a ObConfigurationKey),
    #[strum(to_string = "MakeLexisCall")]
    MakeLexisCall(&'a TenantId),
    #[strum(to_string = "IsVaultProxyPreConfiguredEndpointEnabled")]
    IsVaultProxyPreConfiguredEndpointEnabled(&'a TenantId),
    #[strum(to_string = "IsVaultProxyJitEndpointEnabled")]
    IsVaultProxyJitEndpointEnabled(&'a TenantId),
    #[strum(to_string = "IsNeuroEnabledForObc")]
    IsNeuroEnabledForObc(&'a ObConfigurationKey),
    #[strum(to_string = "RequireCaptureOnStepUp")]
    RequireCaptureOnStepUp(&'a ObConfigurationKey),
    #[strum(to_string = "TenantCanViewNeuro")]
    TenantCanViewNeuro(&'a TenantId),

    // Migrate to modern Rollout format
    #[strum(to_string = "UseBackupTwilioCredentialsRollout")]
    UseBackupTwilioCredentials(&'a str),
    #[strum(to_string = "PreferWhatsappRollout")]
    PreferWhatsapp(&'a str),
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
            Self::EnableLexisInNonProd(k) => Some(k.to_string()),
            Self::EnableSocureInNonProd(k) => Some(k.to_string()),
            Self::DisableAllSocure => None,
            Self::CanCleanUpPhoneNumber(k) => Some(k.leak_to_string()),
            Self::CanCleanUpTenant(k) => Some(k.to_string()),
            Self::CreateOnboardingWorkflows(k) => Some(k.to_string()),
            Self::IsAlpacaTenant(k) => Some(k.to_string()),
            Self::IsAppClipEnabled(k) => Some(k.to_string()),
            Self::IsInstantAppEnabled(k) => Some(k.to_string()),
            Self::CanMakeDemoIncodeRequestsInSandbox(k) => Some(k.to_string()),
            Self::CanSkipSelfie(k) => Some(k.to_string()),
            Self::OmitEmailVerification(k) => Some(k.to_string()),
            Self::TenantCanMakeNoPhoneObc(k) => Some(k.to_string()),
            Self::TenantCanMakeDocFirstObc(k) => Some(k.to_string()),
            Self::IsSkipKycTenant(k) => Some(k.to_string()),
            Self::DisableConservativeGlareForDocument(k) => Some(k.to_string()),
            Self::DisableConservativeSharpnessForDocument(k) => Some(k.to_string()),
            Self::DisallowDriverLicensePermits(k) => Some(k.to_string()),
            Self::EnableIncodeWatchlistCheckInNonProd(k) => Some(k.to_string()),
            Self::DisableSelfieChecking(k) => Some(k.to_string()),
            Self::UseIncodeDemoCredentialsInLivemode(k) => Some(k.to_string()),
            Self::IsKycWaterfallOnRuleFailureEnabled(k) => Some(k.to_string()),
            Self::CanProvideThirdPartyAuth(k) => Some(k.to_string()),
            Self::RunAwsRekognition(k) => Some(k.to_string()),
            Self::CreateKycWorkflowForAlpacaOnboardings(k) => Some(k.to_string()),
            Self::StepUpOnAmlHit(k) => Some(k.to_string()),
            Self::UseBackupTwilioCredentials(k) => Some(k.to_string()),
            Self::PreferWhatsapp(k) => Some(k.to_string()),
            Self::MakeLexisCall(k) => Some(k.to_string()),
            Self::IsVaultProxyPreConfiguredEndpointEnabled(k) => Some(k.to_string()),
            Self::IsVaultProxyJitEndpointEnabled(k) => Some(k.to_string()),
            Self::IsNeuroEnabledForObc(k) => Some(k.to_string()),
            Self::RequireCaptureOnStepUp(k) => Some(k.to_string()),
            Self::TenantCanViewNeuro(k) => Some(k.to_string()),
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
            Self::EnableLexisInNonProd(_) => false,
            Self::DisableAllSocure => false,
            Self::CanCleanUpPhoneNumber(_) => false,
            Self::CanCleanUpTenant(_) => false,
            Self::CreateOnboardingWorkflows(_) => false,
            Self::IsAlpacaTenant(_) => false,
            Self::IsAppClipEnabled(_) => false,
            Self::IsInstantAppEnabled(_) => false,
            Self::CanMakeDemoIncodeRequestsInSandbox(_) => false,
            Self::CanSkipSelfie(_) => false,
            Self::OmitEmailVerification(_) => false,
            Self::TenantCanMakeNoPhoneObc(_) => false,
            Self::TenantCanMakeDocFirstObc(_) => false,
            Self::IsSkipKycTenant(_) => false,
            Self::DisableConservativeGlareForDocument(_) => false,
            Self::DisableConservativeSharpnessForDocument(_) => false,
            Self::DisallowDriverLicensePermits(_) => false,
            Self::EnableIncodeWatchlistCheckInNonProd(_) => false,
            Self::DisableSelfieChecking(_) => false,
            Self::UseIncodeDemoCredentialsInLivemode(_) => false,
            Self::IsKycWaterfallOnRuleFailureEnabled(_) => false,
            Self::CanProvideThirdPartyAuth(_) => false,
            Self::RunAwsRekognition(_) => false,
            Self::CreateKycWorkflowForAlpacaOnboardings(_) => false,
            Self::StepUpOnAmlHit(_) => false,
            Self::UseBackupTwilioCredentials(_) => false,
            Self::PreferWhatsapp(_) => false,
            Self::MakeLexisCall(_) => false,
            Self::IsVaultProxyPreConfiguredEndpointEnabled(_) => false,
            Self::IsVaultProxyJitEndpointEnabled(_) => false,
            Self::IsNeuroEnabledForObc(_) => false,
            Self::RequireCaptureOnStepUp(_) => false,
            Self::TenantCanViewNeuro(_) => false,
        }
    }

    /// LaunchDarkly is hugely overkill for boolean flags. We generally just check if a tenant ID,
    /// obc key, or user identifier is in a list of values.
    /// In order to reduce LaunchDarkly cost, some flags have been migrated to perform this
    /// "is in list" operation here instead of on the LaunchDarkly side
    pub fn is_migrated_to_new_format(&self) -> bool {
        #[allow(clippy::match_like_matches_macro)]
        match self {
            Self::PreferWhatsapp(_) => true,
            Self::UseBackupTwilioCredentials(_) => true,
            _ => false,
        }
    }
}

#[derive(Debug, Eq, PartialEq, strum::Display)]
pub enum JsonFlag<'a> {
    #[strum(to_string = "BillingProfile")]
    BillingProfile(&'a TenantId),

    #[strum(to_string = "AvailableOtpVendorPriorities")]
    AvailableOtpVendorPriorities(&'a str),
}

impl<'a> JsonFlag<'a> {
    pub(crate) fn flag_name(&self) -> String {
        self.to_string()
    }

    pub(crate) fn key(&self) -> Option<String> {
        match self {
            Self::BillingProfile(k) => Some(k.to_string()),
            Self::AvailableOtpVendorPriorities(k) => Some(k.to_string()),
        }
    }

    pub(crate) fn default(&self) -> serde_json::Value {
        match self {
            Self::BillingProfile(_) => json!({}),
            Self::AvailableOtpVendorPriorities(_) => json!(null),
        }
    }
}
