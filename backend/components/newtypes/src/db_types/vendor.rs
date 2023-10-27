use crate::util::impl_enum_str_diesel;
use derive_more::Display;
use diesel::{sql_types::Text, AsExpression, FromSqlRow};
use paperclip::actix::Apiv2Schema;

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
    PartialEq,
    Eq,
    AsExpression,
    FromSqlRow,
    EnumIter,
    EnumString,
    AsRefStr,
)]
#[serde(rename_all = "snake_case")]
#[strum(serialize_all = "snake_case")]
#[diesel(sql_type = Text)]
/// Represents the API for the request we'll make
pub enum VendorAPI {
    IdologyExpectId,
    IdologyScanVerifySubmission,
    IdologyScanVerifyResults,
    IdologyScanOnboarding,
    IdologyPa,
    TwilioLookupV2,
    SocureIdPlus,
    ExperianPreciseId,
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
    IncodeAddMlConsent,
    IncodeFetchOcr,
    IncodeAddSelfie,
    IncodeWatchlistCheck,
    IncodeUpdatedWatchlistResult,
    IncodeGetOnboardingStatus,
    IncodeProcessFace,
    StytchLookup,
    FootprintDeviceAttestation,
    AwsRekognition,
    AwsTextract,
}
impl_enum_str_diesel!(VendorAPI);

impl From<VendorAPI> for Vendor {
    fn from(api: VendorAPI) -> Self {
        match api {
            VendorAPI::IdologyExpectId => Self::Idology,
            VendorAPI::IdologyScanVerifySubmission => Self::Idology,
            VendorAPI::IdologyScanVerifyResults => Self::Idology,
            VendorAPI::IdologyScanOnboarding => Self::Idology,
            VendorAPI::TwilioLookupV2 => Self::Twilio,
            VendorAPI::SocureIdPlus => Self::Socure,
            VendorAPI::IdologyPa => Self::Idology,
            VendorAPI::ExperianPreciseId => Self::Experian,
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
            VendorAPI::IncodeAddMlConsent => Self::Incode,
            VendorAPI::IncodeFetchOcr => Self::Incode,
            VendorAPI::IncodeAddSelfie => Self::Incode,
            VendorAPI::IncodeWatchlistCheck => Self::Incode,
            VendorAPI::IncodeUpdatedWatchlistResult => Self::Incode,
            VendorAPI::IncodeGetOnboardingStatus => Self::Incode,
            VendorAPI::IncodeProcessFace => Self::Incode,
            VendorAPI::StytchLookup => Self::Stytch,
            VendorAPI::FootprintDeviceAttestation => Self::Footprint,
            VendorAPI::AwsRekognition => Self::Footprint,
            VendorAPI::AwsTextract => Self::Footprint,
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
            VendorAPI::IdologyExpectId | VendorAPI::TwilioLookupV2 | VendorAPI::ExperianPreciseId => true,
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
            | VendorAPI::IncodeAddMlConsent
            | VendorAPI::IncodeFetchOcr
            | VendorAPI::IncodeAddSelfie
            | VendorAPI::IncodeWatchlistCheck
            | VendorAPI::IncodeUpdatedWatchlistResult
            | VendorAPI::IncodeGetOnboardingStatus
            | VendorAPI::IncodeProcessFace
            | VendorAPI::SocureIdPlus
            | VendorAPI::StytchLookup
            | VendorAPI::AwsRekognition
            | VendorAPI::AwsTextract
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
            | VendorAPI::IncodeAddMlConsent
            | VendorAPI::IncodeFetchOcr
            | VendorAPI::IncodeAddSelfie
            | VendorAPI::IncodeGetOnboardingStatus
            | VendorAPI::IncodeProcessFace => true,
            VendorAPI::IncodeWatchlistCheck
            | VendorAPI::IncodeUpdatedWatchlistResult
            | VendorAPI::IncodeStartOnboarding
            | VendorAPI::IdologyScanVerifySubmission
            | VendorAPI::IdologyScanVerifyResults
            | VendorAPI::IdologyScanOnboarding
            | VendorAPI::IdologyPa
            | VendorAPI::MiddeskCreateBusiness
            | VendorAPI::MiddeskGetBusiness
            | VendorAPI::MiddeskBusinessUpdateWebhook
            | VendorAPI::MiddeskTinRetriedWebhook
            | VendorAPI::IdologyExpectId
            | VendorAPI::TwilioLookupV2
            | VendorAPI::SocureIdPlus
            | VendorAPI::ExperianPreciseId
            | VendorAPI::StytchLookup
            | VendorAPI::FootprintDeviceAttestation
            | VendorAPI::AwsRekognition
            | VendorAPI::AwsTextract => false,
        }
    }
}

#[cfg(test)]
mod tests {
    use std::str::FromStr;

    use super::*;

    #[derive(serde::Serialize, serde::Deserialize)]
    pub struct SomeStruct {
        pub vendor_api: VendorAPI,
    }

    #[test]
    fn test_vendor_api_deser() {
        assert_eq!(
            VendorAPI::IdologyExpectId,
            VendorAPI::from_str("idology_expect_id").unwrap()
        );

        let json = serde_json::json!({
            "vendor_api": "idology_expect_id"
        });
        assert_eq!(
            VendorAPI::IdologyExpectId,
            serde_json::from_value::<SomeStruct>(json).unwrap().vendor_api
        );

        assert_eq!(
            serde_json::json!({"vendor_api": "idology_expect_id"}),
            serde_json::to_value(SomeStruct {
                vendor_api: VendorAPI::IdologyExpectId,
            })
            .unwrap()
        );
    }
}
