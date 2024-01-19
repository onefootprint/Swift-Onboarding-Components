use derive_more::Display;
use diesel::{sql_types::Text, AsExpression, FromSqlRow};
use paperclip::actix::Apiv2Schema;

use serde::{Deserialize, Serialize};
use strum_macros::{AsRefStr, EnumString};

#[derive(
    Debug,
    Display,
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
        }
    }
}

crate::util::impl_enum_str_diesel!(ReviewReason);
