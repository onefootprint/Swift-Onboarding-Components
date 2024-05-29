use diesel::sql_types::Text;
use diesel::{
    AsExpression,
    FromSqlRow,
};
use paperclip::actix::Apiv2Schema;
use serde_with::{
    DeserializeFromStr,
    SerializeDisplay,
};
use strum_macros::{
    Display,
    EnumIter,
    EnumString,
};

// NOTE: we backfilled all DataLifetimeSources in prod that were created before
// 2023-08-25 19:53:43.944937+00 using a heuristic.
// https://onefootprint.slack.com/archives/C04RHCM8FU0/p1712076032662629

#[derive(
    Debug,
    Eq,
    PartialEq,
    Ord,
    PartialOrd,
    Display,
    Hash,
    Clone,
    Copy,
    DeserializeFromStr,
    SerializeDisplay,
    AsExpression,
    FromSqlRow,
    EnumString,
    EnumIter,
    Apiv2Schema,
    macros::SerdeAttr,
)]
#[strum(serialize_all = "snake_case")]
#[serde(rename_all = "snake_case")]
#[diesel(sql_type = Text)]
pub enum DataLifetimeSource {
    /// Vaulted via a hosted flow and entered by the user.
    /// NOTE: this could be spoofed by a malicious actor with a hosted auth token.
    #[strum(serialize = "hosted")]
    #[serde(rename = "hosted")]
    LikelyHosted,
    /// Vaulted via an auth token issued for the components SDK.
    /// NOTE: this could be spoofed by a malicious actor with a hosted auth token.
    #[strum(serialize = "components_sdk")]
    #[serde(rename = "components_sdk")]
    LikelyComponentsSdk,
    /// Passed into an SDK as bootstrap data.
    /// NOTE: this could be spoofed by a malicious actor with a hosted auth token.
    /// NOTE: we only started tracking Bootstrap in prod on 2024-04-04. Previously bootstrapped
    /// data will appear as Hosted.
    #[strum(serialize = "bootstrap")]
    #[serde(rename = "bootstrap")]
    LikelyBootstrap,
    /// Vaulted via hosted flow with client-tenant auth
    ClientTenant,
    /// Vaulted via tenant-facing API
    Tenant,
    /// Vaulted via derived OCR data
    Ocr,
    /// Vaulted via portable data from another tenant
    Prefill,
    /// Vaulted via data coming back from Vendor
    Vendor,
}

crate::util::impl_enum_string_diesel!(DataLifetimeSource);
