use crate::util::impl_enum_str_diesel;
use derive_more::Display;
use diesel::sql_types::Text;
use diesel::{
    AsExpression,
    FromSqlRow,
};
use paperclip::actix::Apiv2Schema;
use serde::{
    Deserialize,
    Serialize,
};
use strum::IntoEnumIterator;
use strum_macros::{
    AsRefStr,
    EnumIter,
    EnumString,
};

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
    Lexis,
    Experian,
    Twilio,
    Middesk,
    Incode,
    Stytch,
    NeuroId,
    SambaSafety,
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
    IncodeCurpValidation,
    IncodeGovernmentValidation,
    IncodeApproveSession,
    StytchLookup,
    FootprintDeviceAttestation,
    AwsRekognition,
    AwsTextract,
    LexisFlexId,
    NeuroIdAnalytics,
    SambaLicenseValidationCreate,
    SambaLicenseValidationGetStatus,
    SambaLicenseValidationGetReport,
}
impl_enum_str_diesel!(VendorAPI);

impl From<VendorAPI> for Vendor {
    fn from(api: VendorAPI) -> Self {
        match api {
            VendorAPI::IdologyExpectId => Self::Idology,
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
            VendorAPI::IncodeCurpValidation => Self::Incode,
            VendorAPI::IncodeGovernmentValidation => Self::Incode,
            VendorAPI::IncodeApproveSession => Self::Incode,
            VendorAPI::StytchLookup => Self::Stytch,
            VendorAPI::FootprintDeviceAttestation => Self::Footprint,
            VendorAPI::AwsRekognition => Self::Footprint,
            VendorAPI::AwsTextract => Self::Footprint,
            VendorAPI::LexisFlexId => Self::Lexis,
            VendorAPI::NeuroIdAnalytics => Self::NeuroId,
            VendorAPI::SambaLicenseValidationCreate => Self::SambaSafety,
            VendorAPI::SambaLicenseValidationGetStatus => Self::SambaSafety,
            VendorAPI::SambaLicenseValidationGetReport => Self::SambaSafety,
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
    pub fn is_incode_doc_flow_api(&self) -> bool {
        matches!(
            self,
            VendorAPI::IncodeAddFront
                | VendorAPI::IncodeAddBack
                | VendorAPI::IncodeProcessId
                | VendorAPI::IncodeFetchScores
                | VendorAPI::IncodeAddPrivacyConsent
                | VendorAPI::IncodeAddMlConsent
                | VendorAPI::IncodeFetchOcr
                | VendorAPI::IncodeAddSelfie
                | VendorAPI::IncodeGetOnboardingStatus
                | VendorAPI::IncodeProcessFace
        )
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::str::FromStr;

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
