use paperclip::actix::Apiv2Schema;

#[doc = "Sequence number used to order DataLifetimes"]
#[derive(
    Debug,
    Clone,
    Hash,
    PartialEq,
    Eq,
    Ord,
    PartialOrd,
    derive_more::Display,
    derive_more::From,
    derive_more::Into,
    derive_more::FromStr,
    serde::Serialize,
    serde::Deserialize,
    Default,
    DieselNewType,
    Apiv2Schema,
    // This is implemented separately because we need to derive Copy...
    Copy,
)]
#[serde(transparent)]
pub struct DataLifetimeSeqno(i64);
