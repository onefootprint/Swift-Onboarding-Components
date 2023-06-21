use derive_more::Display;
use enum_variant_type::EnumVariantType;
use newtypes::VendorAPI;
use strum_macros::{EnumIter, EnumString};

/// VendorAPI is a core concept in our codebase. Because (as of now) it's defined in `newtypes` with all the other
/// db types, we have another "Wrapped" enum here so we can implement extra functionality that is
/// helpful for working with VendorAPIs in application code
#[derive(Debug, Display, Clone, Copy, Hash, PartialEq, Eq, EnumIter, EnumString, EnumVariantType)]
#[evt(module = "vendor_api_struct")]
#[evt(derive(Clone, Hash, PartialEq, Eq))]
pub enum WrappedVendorAPI {
    IdologyExpectID,
    IdologyScanVerifySubmission,
    IdologyScanVerifyResults,
    IdologyScanOnboarding,
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
    IncodeGetOnboardingStatus,
    IncodeProcessFace,
}
impl From<VendorAPI> for WrappedVendorAPI {
    fn from(value: VendorAPI) -> Self {
        match value {
            VendorAPI::IdologyExpectID => Self::IdologyExpectID,
            VendorAPI::IdologyScanVerifySubmission => Self::IdologyScanVerifySubmission,
            VendorAPI::IdologyScanVerifyResults => Self::IdologyScanVerifyResults,
            VendorAPI::IdologyScanOnboarding => Self::IdologyScanOnboarding,
            VendorAPI::IdologyPa => Self::IdologyPa,
            VendorAPI::TwilioLookupV2 => Self::TwilioLookupV2,
            VendorAPI::SocureIDPlus => Self::SocureIDPlus,
            VendorAPI::ExperianPreciseID => Self::ExperianPreciseID,
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
            VendorAPI::IncodeAddMLConsent => Self::IncodeAddMLConsent,
            VendorAPI::IncodeFetchOCR => Self::IncodeFetchOCR,
            VendorAPI::IncodeAddSelfie => Self::IncodeAddSelfie,
            VendorAPI::IncodeWatchlistCheck => Self::IncodeWatchlistCheck,
            VendorAPI::IncodeGetOnboardingStatus => Self::IncodeGetOnboardingStatus,
            VendorAPI::IncodeProcessFace => Self::IncodeProcessFace,
        }
    }
}

impl From<WrappedVendorAPI> for VendorAPI {
    fn from(value: WrappedVendorAPI) -> Self {
        match value {
            WrappedVendorAPI::IdologyExpectID => VendorAPI::IdologyExpectID,
            WrappedVendorAPI::IdologyScanVerifySubmission => VendorAPI::IdologyScanVerifySubmission,
            WrappedVendorAPI::IdologyScanVerifyResults => VendorAPI::IdologyScanVerifyResults,
            WrappedVendorAPI::IdologyScanOnboarding => VendorAPI::IdologyScanOnboarding,
            WrappedVendorAPI::IdologyPa => VendorAPI::IdologyPa,
            WrappedVendorAPI::TwilioLookupV2 => VendorAPI::TwilioLookupV2,
            WrappedVendorAPI::SocureIDPlus => VendorAPI::SocureIDPlus,
            WrappedVendorAPI::ExperianPreciseID => VendorAPI::ExperianPreciseID,
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
            WrappedVendorAPI::IncodeAddMLConsent => VendorAPI::IncodeAddMLConsent,
            WrappedVendorAPI::IncodeFetchOCR => VendorAPI::IncodeFetchOCR,
            WrappedVendorAPI::IncodeAddSelfie => VendorAPI::IncodeAddSelfie,
            WrappedVendorAPI::IncodeWatchlistCheck => VendorAPI::IncodeWatchlistCheck,
            WrappedVendorAPI::IncodeGetOnboardingStatus => VendorAPI::IncodeGetOnboardingStatus,
            WrappedVendorAPI::IncodeProcessFace => VendorAPI::IncodeProcessFace,
        }
    }
}

pub fn vendor_api_enum_from_struct(s: impl Into<WrappedVendorAPI>) -> VendorAPI {
    let w: WrappedVendorAPI = s.into();
    w.into()
}

pub use vendor_api_struct::*;
