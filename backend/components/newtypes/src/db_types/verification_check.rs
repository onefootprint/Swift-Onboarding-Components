use crate::AdverseMediaListKind;
use crate::PhoneLookupAttributes;
use diesel::AsExpression;
use diesel::FromSqlRow;
use diesel_as_jsonb::AsJsonb;
use paperclip::actix::Apiv2Schema;
use strum::AsRefStr;
use strum::EnumDiscriminants;

#[derive(
    Debug,
    Clone,
    Eq,
    PartialEq,
    Hash,
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
    derive(strum_macros::EnumString, strum_macros::Display, Hash, serde::Deserialize),
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
    Aml {
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
    NeuroId {},
    Phone {
        attributes: Vec<PhoneLookupAttributes>,
    },
}
