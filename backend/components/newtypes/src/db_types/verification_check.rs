use diesel::{AsExpression, FromSqlRow};
use diesel_as_jsonb::AsJsonb;
use paperclip::actix::Apiv2Schema;

use strum::{AsRefStr, EnumDiscriminants};

use crate::AdverseMediaListKind;

#[derive(
    Debug,
    Clone,
    Eq,
    PartialEq,
    AsRefStr,
    EnumDiscriminants,
    Apiv2Schema,
    serde::Serialize,
    serde::Deserialize,
    AsJsonb,
)]
#[strum_discriminants(
    name(VerificationCheckKind),
    vis(pub),
    derive(strum_macros::EnumString, strum_macros::Display),
    strum(serialize_all = "snake_case")
)]
#[serde(rename_all = "snake_case")]
#[serde(tag = "kind", content = "data")]
pub enum VerificationCheck {
    // Perform KYB
    Kyb {
        ein_only: bool,
    },
    // Run KYC
    Kyc {},
    EnhancedAml {
        ofac: bool,
        pep: bool,
        adverse_media: bool,
        continuous_monitoring: bool,
        adverse_media_lists: Option<Vec<AdverseMediaListKind>>,
    },
    CurpValidation {},
    // Run Document through incode. here to support doc collection only
    // Note: selfie is stashed on `documents_to_collect`
    IdentityDocument {},
    StytchDevice {},
}
