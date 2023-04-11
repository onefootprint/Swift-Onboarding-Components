pub use derive_more::Display;
use diesel::{sql_types::Text, AsExpression, FromSqlRow};
use paperclip::actix::Apiv2Schema;
use serde::{Deserialize, Serialize};
use strum_macros::{AsRefStr, EnumString};

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
    Deserialize,
    Serialize,
    Apiv2Schema,
    AsExpression,
    FromSqlRow,
    EnumString,
    AsRefStr,
)]
#[strum(serialize_all = "snake_case")]
#[serde(rename_all = "snake_case")]
#[diesel(sql_type = Text)]
pub enum FingerprintScopeKind {
    Global,
    Tenant,
}

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
    Deserialize,
    Serialize,
    Apiv2Schema,
    AsExpression,
    FromSqlRow,
    EnumString,
    AsRefStr,
)]
#[strum(serialize_all = "lowercase")]
#[serde(rename_all = "lowercase")]
#[diesel(sql_type = Text)]
pub enum FingerprintVersion {
    V0,
    V1,
}

impl FingerprintVersion {
    /// the current version we're creating fingerprints for
    pub fn current() -> Self {
        FingerprintVersion::V1
    }
}

crate::util::impl_enum_str_diesel!(FingerprintScopeKind);
crate::util::impl_enum_str_diesel!(FingerprintVersion);
