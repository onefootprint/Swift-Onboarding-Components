use derive_more::Display;
use diesel::{sql_types::Text, AsExpression, FromSqlRow};
use strum_macros::{AsRefStr, EnumString};

#[derive(
    Debug,
    Eq,
    PartialEq,
    Ord,
    PartialOrd,
    Display,
    serde_with::SerializeDisplay,
    Hash,
    Clone,
    Copy,
    AsExpression,
    FromSqlRow,
    EnumString,
    AsRefStr,
)]
#[strum(serialize_all = "snake_case")]
#[diesel(sql_type = Text)]
pub enum FingerprintScopeKind {
    Global,
    Tenant,
    Plaintext,
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
    AsExpression,
    FromSqlRow,
    EnumString,
    AsRefStr,
)]
#[strum(serialize_all = "lowercase")]
#[diesel(sql_type = Text)]
pub enum FingerprintVersion {
    V0,
    /// Maybe: we introduced tenant-scoped fingerprints?
    V1,
    /// Here, we stopped including the sandbox suffix in fingerprints
    V2,
}

impl FingerprintVersion {
    /// the current version we're creating fingerprints for
    pub fn current() -> Self {
        FingerprintVersion::V2
    }
}

crate::util::impl_enum_str_diesel!(FingerprintScopeKind);
crate::util::impl_enum_str_diesel!(FingerprintVersion);
