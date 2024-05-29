use derive_more::Display;
use diesel::sql_types::Text;
use diesel::{
    AsExpression,
    FromSqlRow,
};
use strum_macros::{
    AsRefStr,
    EnumString,
};

#[derive(
    Debug,
    Display,
    Clone,
    Copy,
    Eq,
    PartialEq,
    Ord,
    PartialOrd,
    AsExpression,
    FromSqlRow,
    EnumString,
    AsRefStr,
    macros::SerdeAttr,
)]
#[strum(serialize_all = "snake_case")]
#[serde(rename_all = "snake_case")]
#[diesel(sql_type = Text)]
pub enum DecisionIntentKind {
    OnboardingKyc,
    ManualRunKyc,
    WatchlistCheck,
    OnboardingKyb,
    DeviceFingerprint,
    DocScan,
    DeviceAttestation,
}

crate::util::impl_enum_str_diesel!(DecisionIntentKind);
