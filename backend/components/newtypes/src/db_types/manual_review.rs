use diesel::sql_types::Text;
use diesel::AsExpression;
use diesel::FromSqlRow;
use paperclip::actix::Apiv2Schema;
use serde::Deserialize;
use serde::Serialize;
use serde_with::SerializeDisplay;
use strum::EnumIter;
use strum_macros::AsRefStr;
use strum_macros::EnumString;

#[derive(
    Debug,
    // Watch out, this is the evil derive_more::Display
    derive_more::Display,
    Clone,
    Copy,
    Eq,
    PartialEq,
    Ord,
    PartialOrd,
    Deserialize,
    Serialize,
    AsExpression,
    FromSqlRow,
    EnumString,
    AsRefStr,
    Apiv2Schema,
)]
#[strum(serialize_all = "snake_case")]
#[serde(rename_all = "snake_case")]
#[diesel(sql_type = Text)]
pub enum ReviewReason {
    Document,
    AdverseMediaHit,
    WatchlistHit,
    ProofOfSsnDocument,
    ProofOfAddressDocument,
    CustomDocument,
}

impl ReviewReason {
    // currently Follow/Alpaca oriented
    pub fn canned_response(&self) -> &str {
        match self {
            ReviewReason::Document => "Document identity verification was manually conducted and approved",
            ReviewReason::AdverseMediaHit => "Adverse media hit deemed non-detrimental",
            ReviewReason::WatchlistHit => "Watchlist hit deemed low risk or false-positive",
            ReviewReason::ProofOfSsnDocument => "Proof of SSN was submitted and verified",
            ReviewReason::ProofOfAddressDocument => "Proof of Address was submitted and verified",
            ReviewReason::CustomDocument => "Custom document was submitted and verified",
        }
    }
}

crate::util::impl_enum_str_diesel!(ReviewReason);

#[derive(
    Debug,
    strum_macros::Display,
    Clone,
    Copy,
    AsExpression,
    FromSqlRow,
    EnumString,
    Eq,
    PartialEq,
    EnumIter,
    SerializeDisplay,
    Apiv2Schema,
    macros::SerdeAttr,
)]
#[strum(serialize_all = "snake_case")]
#[serde(rename_all = "snake_case")]
#[diesel(sql_type = Text)]
pub enum ManualReviewKind {
    RuleTriggered,
    DocumentNeedsReview,
}

crate::util::impl_enum_string_diesel!(ManualReviewKind);
