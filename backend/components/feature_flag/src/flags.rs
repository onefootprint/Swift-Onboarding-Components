use newtypes::ObConfigurationKey;
use newtypes::OrgMemberEmail;
use newtypes::PiiString;
use newtypes::TenantId;
use newtypes::VaultDrConfigId;
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
    #[strum(to_string = "MakeLexisCall")]
    MakeLexisCall(&'a TenantId),
    #[strum(to_string = "RequireCaptureOnStepUp")]
    RequireCaptureOnStepUp(&'a ObConfigurationKey),
    #[strum(to_string = "UseKycWaterfallV2Rollout")]
    UseKycWaterfallV2Rollout(&'a TenantId),

    // Migrate to modern Rollout format
    #[strum(to_string = "UseBackupTwilioCredentialsRollout")]
    UseBackupTwilioCredentials(&'a str),
    #[strum(to_string = "PreferWhatsappRollout")]
    PreferWhatsapp(&'a str),

    #[strum(to_string = "ApiKycSkipEmailAndPhoneRequirements")]
    ApiKycSkipEmailAndPhoneRequirements(&'a TenantId),
    #[strum(to_string = "CanSendSmsToHighFraudCountries")]
    CanSendSmsToHighFraudCountries(&'a TenantId),
    #[strum(to_string = "RunSentilinkForPlaybookTemporary")]
    RunSentilinkForPlaybookTemporary(&'a ObConfigurationKey),

    #[strum(to_string = "DisableVaultDisasterRecoveryWorker")]
    DisableVaultDisasterRecoveryWorker(&'a VaultDrConfigId),
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
            Self::UseBackupTwilioCredentials(k) => Some(k.to_string()),
            Self::PreferWhatsapp(k) => Some(k.to_string()),
            Self::MakeLexisCall(k) => Some(k.to_string()),
            Self::RequireCaptureOnStepUp(k) => Some(k.to_string()),
            Self::UseKycWaterfallV2Rollout(k) => Some(k.to_string()),
            Self::ApiKycSkipEmailAndPhoneRequirements(k) => Some(k.to_string()),
            Self::CanSendSmsToHighFraudCountries(k) => Some(k.to_string()),
            Self::RunSentilinkForPlaybookTemporary(k) => Some(k.to_string()),
            Self::DisableVaultDisasterRecoveryWorker(k) => Some(k.to_string()),
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
            Self::UseBackupTwilioCredentials(_) => false,
            Self::PreferWhatsapp(_) => false,
            Self::MakeLexisCall(_) => false,
            Self::RequireCaptureOnStepUp(_) => false,
            Self::UseKycWaterfallV2Rollout(_) => false,
            Self::ApiKycSkipEmailAndPhoneRequirements(_) => false,
            Self::CanSendSmsToHighFraudCountries(_) => false,
            Self::RunSentilinkForPlaybookTemporary(_) => false,
            Self::DisableVaultDisasterRecoveryWorker(_) => false,
        }
    }

    /// LaunchDarkly is hugely overkill for boolean flags. We generally just check if a tenant ID,
    /// obc key, or user identifier is in a list of values.
    /// In order to reduce LaunchDarkly cost, some flags have been migrated to perform this
    /// "is in list" operation here instead of on the LaunchDarkly side
    pub fn is_migrated_to_new_format(&self) -> bool {
        // Note, most new flags should be migrated to the newer format that does evaluations on
        // here instead of in launch darkly
        match self {
            Self::IsRiskOps(_)
            | Self::IsDemoTenant(_)
            | Self::CanViewSocureRiskSignals(_)
            | Self::EnableScanOnboardingInNonProd(_)
            | Self::EnableIdologyInNonProd(_)
            | Self::EnableMiddeskInNonProd(_)
            | Self::EnableSocureInNonProd(_)
            | Self::EnableExperianInNonProd(_)
            | Self::EnableLexisInNonProd(_)
            | Self::DisableAllSocure
            | Self::CanCleanUpPhoneNumber(_)
            | Self::CanCleanUpTenant(_)
            | Self::CreateOnboardingWorkflows(_)
            | Self::IsAlpacaTenant(_)
            | Self::IsAppClipEnabled(_)
            | Self::IsInstantAppEnabled(_)
            | Self::CanMakeDemoIncodeRequestsInSandbox(_)
            | Self::CanSkipSelfie(_)
            | Self::OmitEmailVerification(_)
            | Self::TenantCanMakeNoPhoneObc(_)
            | Self::TenantCanMakeDocFirstObc(_)
            | Self::IsSkipKycTenant(_)
            | Self::DisableConservativeGlareForDocument(_)
            | Self::DisableConservativeSharpnessForDocument(_)
            | Self::DisallowDriverLicensePermits(_)
            | Self::EnableIncodeWatchlistCheckInNonProd(_)
            | Self::DisableSelfieChecking(_)
            | Self::UseIncodeDemoCredentialsInLivemode(_)
            | Self::IsKycWaterfallOnRuleFailureEnabled(_)
            | Self::CanProvideThirdPartyAuth(_)
            | Self::RunAwsRekognition(_)
            | Self::CreateKycWorkflowForAlpacaOnboardings(_)
            | Self::MakeLexisCall(_)
            | Self::RequireCaptureOnStepUp(_)
            | Self::UseKycWaterfallV2Rollout(_)
            | Self::CanSendSmsToHighFraudCountries(_)
            | Self::RunSentilinkForPlaybookTemporary(_)
            | Self::ApiKycSkipEmailAndPhoneRequirements(_)
            | Self::DisableVaultDisasterRecoveryWorker(_) => false,
            // These are migrated to the newer format
            Self::PreferWhatsapp(_) => true,
            Self::UseBackupTwilioCredentials(_) => true,
        }
    }
}

#[derive(Debug, Eq, PartialEq, strum::Display)]
pub enum JsonFlag<'a> {
    #[strum(to_string = "AvailableOtpVendorPrioritiesRollout")]
    AvailableOtpVendorPriorities(&'a str),
}

impl<'a> JsonFlag<'a> {
    pub(crate) fn flag_name(&self) -> String {
        self.to_string()
    }

    pub(crate) fn key(&self) -> Option<String> {
        match self {
            Self::AvailableOtpVendorPriorities(k) => Some(k.to_string()),
        }
    }

    pub(crate) fn default(&self) -> serde_json::Value {
        match self {
            Self::AvailableOtpVendorPriorities(_) => json!(null),
        }
    }
}
