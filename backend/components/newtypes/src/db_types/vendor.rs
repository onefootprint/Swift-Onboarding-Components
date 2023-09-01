use crate::util::impl_enum_str_diesel;
pub use derive_more::Display;
use diesel::{sql_types::Text, AsExpression, FromSqlRow};
use paperclip::actix::Apiv2Schema;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use strum::IntoEnumIterator;
use strum_macros::{AsRefStr, EnumIter, EnumString};

#[derive(
    Debug,
    Display,
    Clone,
    Copy,
    Deserialize,
    Serialize,
    Apiv2Schema,
    PartialEq,
    Eq,
    AsExpression,
    FromSqlRow,
    EnumString,
    AsRefStr,
    JsonSchema,
    Hash,
    Ord,
    PartialOrd,
)]
#[serde(rename_all = "snake_case")]
#[strum(serialize_all = "snake_case")]
#[diesel(sql_type = Text)]
pub enum Vendor {
    Footprint,
    Idology,
    Socure,
    LexisNexis,
    Experian,
    Twilio,
    Middesk,
    Incode,
    Stytch,
}

impl_enum_str_diesel!(Vendor);

#[derive(
    Debug,
    Display,
    Clone,
    Copy,
    Deserialize,
    Hash,
    Serialize,
    Apiv2Schema,
    PartialEq,
    Eq,
    AsExpression,
    FromSqlRow,
    EnumIter,
    EnumString,
    AsRefStr,
    JsonSchema,
)]
#[serde(rename_all = "snake_case")]
#[strum(serialize_all = "snake_case")]
#[diesel(sql_type = Text)]
/// Represents the API for the request we'll make
pub enum VendorAPI {
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
    StytchLookup,
    FootprintDeviceAttestation,
}
impl_enum_str_diesel!(VendorAPI);

impl From<VendorAPI> for Vendor {
    fn from(api: VendorAPI) -> Self {
        match api {
            VendorAPI::IdologyExpectID => Self::Idology,
            VendorAPI::IdologyScanVerifySubmission => Self::Idology,
            VendorAPI::IdologyScanVerifyResults => Self::Idology,
            VendorAPI::IdologyScanOnboarding => Self::Idology,
            VendorAPI::TwilioLookupV2 => Self::Twilio,
            VendorAPI::SocureIDPlus => Self::Socure,
            VendorAPI::IdologyPa => Self::Idology,
            VendorAPI::ExperianPreciseID => Self::Experian,
            VendorAPI::MiddeskCreateBusiness => Self::Middesk,
            VendorAPI::MiddeskBusinessUpdateWebhook => Self::Middesk,
            VendorAPI::MiddeskTinRetriedWebhook => Self::Middesk,
            VendorAPI::MiddeskGetBusiness => Self::Middesk,
            VendorAPI::IncodeStartOnboarding => Self::Incode,
            VendorAPI::IncodeAddFront => Self::Incode,
            VendorAPI::IncodeAddBack => Self::Incode,
            VendorAPI::IncodeProcessId => Self::Incode,
            VendorAPI::IncodeFetchScores => Self::Incode,
            VendorAPI::IncodeAddPrivacyConsent => Self::Incode,
            VendorAPI::IncodeAddMLConsent => Self::Incode,
            VendorAPI::IncodeFetchOCR => Self::Incode,
            VendorAPI::IncodeAddSelfie => Self::Incode,
            VendorAPI::IncodeWatchlistCheck => Self::Incode,
            VendorAPI::IncodeGetOnboardingStatus => Self::Incode,
            VendorAPI::IncodeProcessFace => Self::Incode,
            VendorAPI::StytchLookup => Self::Stytch,
            VendorAPI::FootprintDeviceAttestation => Self::Footprint,
        }
    }
}

// convenience method for getting all vendor apis for a vendor
pub fn vendor_apis_from_vendor(vendor: Vendor) -> Vec<VendorAPI> {
    VendorAPI::iter()
        .filter(|api| Vendor::from(*api) == vendor)
        .collect()
}

impl VendorAPI {
    // temporary hack to allow us to filter to just vendor calls that are made in a batch of KYC vendor calls
    pub fn is_kyc_call(&self) -> bool {
        match self {
            VendorAPI::IdologyExpectID | VendorAPI::TwilioLookupV2 | VendorAPI::ExperianPreciseID => true,
            VendorAPI::IdologyScanVerifySubmission
            | VendorAPI::IdologyScanVerifyResults
            | VendorAPI::IdologyScanOnboarding
            | VendorAPI::IdologyPa
            | VendorAPI::MiddeskCreateBusiness
            | VendorAPI::MiddeskGetBusiness
            | VendorAPI::MiddeskBusinessUpdateWebhook
            | VendorAPI::MiddeskTinRetriedWebhook
            | VendorAPI::IncodeStartOnboarding
            | VendorAPI::IncodeAddFront
            | VendorAPI::IncodeAddBack
            | VendorAPI::IncodeProcessId
            | VendorAPI::IncodeFetchScores
            | VendorAPI::IncodeAddPrivacyConsent
            | VendorAPI::IncodeAddMLConsent
            | VendorAPI::IncodeFetchOCR
            | VendorAPI::IncodeAddSelfie
            | VendorAPI::IncodeWatchlistCheck
            | VendorAPI::IncodeGetOnboardingStatus
            | VendorAPI::IncodeProcessFace
            | VendorAPI::SocureIDPlus
            | VendorAPI::StytchLookup
            | VendorAPI::FootprintDeviceAttestation => false,
        }
    }

    pub fn is_incode_doc_flow_api(&self) -> bool {
        match self {
            VendorAPI::IncodeAddFront
            | VendorAPI::IncodeAddBack
            | VendorAPI::IncodeProcessId
            | VendorAPI::IncodeFetchScores
            | VendorAPI::IncodeAddPrivacyConsent
            | VendorAPI::IncodeAddMLConsent
            | VendorAPI::IncodeFetchOCR
            | VendorAPI::IncodeAddSelfie
            | VendorAPI::IncodeGetOnboardingStatus
            | VendorAPI::IncodeProcessFace => true,
            VendorAPI::IncodeWatchlistCheck
            | VendorAPI::IncodeStartOnboarding
            | VendorAPI::IdologyScanVerifySubmission
            | VendorAPI::IdologyScanVerifyResults
            | VendorAPI::IdologyScanOnboarding
            | VendorAPI::IdologyPa
            | VendorAPI::MiddeskCreateBusiness
            | VendorAPI::MiddeskGetBusiness
            | VendorAPI::MiddeskBusinessUpdateWebhook
            | VendorAPI::MiddeskTinRetriedWebhook
            | VendorAPI::IdologyExpectID
            | VendorAPI::TwilioLookupV2
            | VendorAPI::SocureIDPlus
            | VendorAPI::ExperianPreciseID
            | VendorAPI::StytchLookup
            | VendorAPI::FootprintDeviceAttestation => false,
        }
    }
}
