pub use derive_more::Display;
use diesel::{sql_types::Text, AsExpression, FromSqlRow};
use paperclip::actix::Apiv2Schema;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use strum::IntoEnumIterator;
use strum_macros::{AsRefStr, EnumIter, EnumString};

use crate::util::impl_enum_str_diesel;

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
    pub fn is_doc_scan_call(&self) -> bool {
        match self {
            VendorAPI::IdologyExpectID => false,
            VendorAPI::IdologyScanVerifySubmission => true,
            VendorAPI::IdologyScanVerifyResults => true,
            VendorAPI::IdologyScanOnboarding => true,
            VendorAPI::TwilioLookupV2 => false,
            VendorAPI::SocureIDPlus => false,
            VendorAPI::IdologyPa => false,
            VendorAPI::ExperianPreciseID => false,
            VendorAPI::MiddeskCreateBusiness => false,
        }
    }
}
