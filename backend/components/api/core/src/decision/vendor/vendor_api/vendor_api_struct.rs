use derive_more::Display;
use enum_variant_type::EnumVariantType;
use newtypes::VendorAPI;
use strum_macros::{EnumIter, EnumString};

/// VendorAPI is a core concept in our codebase. Because (as of now) it's defined in `newtypes` with all the other
/// db types, we have another "Wrapped" enum here so we can implement extra functionality that is
/// helpful for working with VendorAPIs in application code
#[derive(Debug, Display, Clone, Copy, Hash, PartialEq, Eq, EnumIter, EnumString, EnumVariantType)]
#[evt(module = "vendor_api_struct")]
#[evt(derive(Clone, Hash, PartialEq, Eq, Debug))]
pub enum WrappedVendorAPI {
    IdologyExpectID,
    IdologyPa,
    TwilioLookupV2,
    SocureIDPlus,
    ExperianPreciseID,
    MiddeskCreateBusiness,
    MiddeskGetBusiness,
    MiddeskBusinessUpdateWebhook,
    MiddeskTinRetriedWebhook,
    IncodeStartOnboarding,
    IncodeAddFront,
    IncodeAddBack,
    IncodeProcessId,
    IncodeFetchScores,
    IncodeAddPrivacyConsent,
    IncodeAddMLConsent,
    IncodeFetchOCR,
    IncodeAddSelfie,
    IncodeWatchlistCheck,
    IncodeUpdatedWatchlistResult,
    IncodeGetOnboardingStatus,
    IncodeProcessFace,
    IncodeCurpValidation,
    IncodeIneData,
    IncodeApproveSession,
    StytchLookup,
    FootprintDeviceAttestation,
    AwsRekognition,
    AwsTextract,
    LexisFlexId,
    NeuroIdAnalytics,
}
impl From<VendorAPI> for WrappedVendorAPI {
    fn from(value: VendorAPI) -> Self {
        match value {
            VendorAPI::IdologyExpectId => Self::IdologyExpectID,
            VendorAPI::IdologyPa => Self::IdologyPa,
            VendorAPI::TwilioLookupV2 => Self::TwilioLookupV2,
            VendorAPI::SocureIdPlus => Self::SocureIDPlus,
            VendorAPI::ExperianPreciseId => Self::ExperianPreciseID,
            VendorAPI::MiddeskCreateBusiness => Self::MiddeskCreateBusiness,
            VendorAPI::MiddeskGetBusiness => Self::MiddeskGetBusiness,
            VendorAPI::MiddeskBusinessUpdateWebhook => Self::MiddeskBusinessUpdateWebhook,
            VendorAPI::MiddeskTinRetriedWebhook => Self::MiddeskTinRetriedWebhook,
            VendorAPI::IncodeStartOnboarding => Self::IncodeStartOnboarding,
            VendorAPI::IncodeAddFront => Self::IncodeAddFront,
            VendorAPI::IncodeAddBack => Self::IncodeAddBack,
            VendorAPI::IncodeProcessId => Self::IncodeProcessId,
            VendorAPI::IncodeFetchScores => Self::IncodeFetchScores,
            VendorAPI::IncodeAddPrivacyConsent => Self::IncodeAddPrivacyConsent,
            VendorAPI::IncodeAddMlConsent => Self::IncodeAddMLConsent,
            VendorAPI::IncodeFetchOcr => Self::IncodeFetchOCR,
            VendorAPI::IncodeAddSelfie => Self::IncodeAddSelfie,
            VendorAPI::IncodeWatchlistCheck => Self::IncodeWatchlistCheck,
            VendorAPI::IncodeUpdatedWatchlistResult => Self::IncodeUpdatedWatchlistResult,
            VendorAPI::IncodeGetOnboardingStatus => Self::IncodeGetOnboardingStatus,
            VendorAPI::IncodeProcessFace => Self::IncodeProcessFace,
            VendorAPI::StytchLookup => Self::StytchLookup,
            VendorAPI::FootprintDeviceAttestation => Self::FootprintDeviceAttestation,
            VendorAPI::AwsRekognition => Self::AwsRekognition,
            VendorAPI::AwsTextract => Self::AwsTextract,
            VendorAPI::LexisFlexId => Self::LexisFlexId,
            VendorAPI::IncodeCurpValidation => Self::IncodeCurpValidation,
            VendorAPI::IncodeGovernmentValidation => Self::IncodeIneData,
            VendorAPI::NeuroIdAnalytics => Self::NeuroIdAnalytics,
            VendorAPI::IncodeApproveSession => Self::IncodeApproveSession,
        }
    }
}

impl From<WrappedVendorAPI> for VendorAPI {
    fn from(value: WrappedVendorAPI) -> Self {
        match value {
            WrappedVendorAPI::IdologyExpectID => VendorAPI::IdologyExpectId,
            WrappedVendorAPI::IdologyPa => VendorAPI::IdologyPa,
            WrappedVendorAPI::TwilioLookupV2 => VendorAPI::TwilioLookupV2,
            WrappedVendorAPI::SocureIDPlus => VendorAPI::SocureIdPlus,
            WrappedVendorAPI::ExperianPreciseID => VendorAPI::ExperianPreciseId,
            WrappedVendorAPI::MiddeskCreateBusiness => VendorAPI::MiddeskCreateBusiness,
            WrappedVendorAPI::MiddeskGetBusiness => VendorAPI::MiddeskGetBusiness,
            WrappedVendorAPI::MiddeskBusinessUpdateWebhook => VendorAPI::MiddeskBusinessUpdateWebhook,
            WrappedVendorAPI::MiddeskTinRetriedWebhook => VendorAPI::MiddeskTinRetriedWebhook,
            WrappedVendorAPI::IncodeStartOnboarding => VendorAPI::IncodeStartOnboarding,
            WrappedVendorAPI::IncodeAddFront => VendorAPI::IncodeAddFront,
            WrappedVendorAPI::IncodeAddBack => VendorAPI::IncodeAddBack,
            WrappedVendorAPI::IncodeProcessId => VendorAPI::IncodeProcessId,
            WrappedVendorAPI::IncodeFetchScores => VendorAPI::IncodeFetchScores,
            WrappedVendorAPI::IncodeAddPrivacyConsent => VendorAPI::IncodeAddPrivacyConsent,
            WrappedVendorAPI::IncodeAddMLConsent => VendorAPI::IncodeAddMlConsent,
            WrappedVendorAPI::IncodeFetchOCR => VendorAPI::IncodeFetchOcr,
            WrappedVendorAPI::IncodeAddSelfie => VendorAPI::IncodeAddSelfie,
            WrappedVendorAPI::IncodeWatchlistCheck => VendorAPI::IncodeWatchlistCheck,
            WrappedVendorAPI::IncodeUpdatedWatchlistResult => VendorAPI::IncodeUpdatedWatchlistResult,
            WrappedVendorAPI::IncodeGetOnboardingStatus => VendorAPI::IncodeGetOnboardingStatus,
            WrappedVendorAPI::IncodeProcessFace => VendorAPI::IncodeProcessFace,
            WrappedVendorAPI::StytchLookup => VendorAPI::StytchLookup,
            WrappedVendorAPI::FootprintDeviceAttestation => VendorAPI::FootprintDeviceAttestation,
            WrappedVendorAPI::AwsRekognition => VendorAPI::AwsRekognition,
            WrappedVendorAPI::AwsTextract => VendorAPI::AwsTextract,
            WrappedVendorAPI::LexisFlexId => VendorAPI::LexisFlexId,
            WrappedVendorAPI::IncodeCurpValidation => VendorAPI::IncodeCurpValidation,
            WrappedVendorAPI::IncodeIneData => VendorAPI::IncodeGovernmentValidation,
            WrappedVendorAPI::NeuroIdAnalytics => VendorAPI::NeuroIdAnalytics,
            WrappedVendorAPI::IncodeApproveSession => VendorAPI::IncodeApproveSession,
        }
    }
}

pub fn vendor_api_enum_from_struct(s: impl Into<WrappedVendorAPI>) -> VendorAPI {
    let w: WrappedVendorAPI = s.into();
    w.into()
}

pub use vendor_api_struct::*;
