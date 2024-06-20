use derive_more::Display;
use diesel::sql_types::Text;
use diesel::AsExpression;
use diesel::FromSqlRow;
use strum_macros::AsRefStr;
use strum_macros::EnumString;

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
pub enum FingerprintScope {
    /// Fingerprint of a single field created with a global scope across all tenants.
    /// Created using a global salt.
    Global,
    /// Fingerprint of a single field created with a scope within the same tenant.
    /// Created using a tenant-scoped salt.
    Tenant,
    /// Fingerprint is stored in plaintext.
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

crate::util::impl_enum_str_diesel!(FingerprintScope);
crate::util::impl_enum_str_diesel!(FingerprintVersion);
