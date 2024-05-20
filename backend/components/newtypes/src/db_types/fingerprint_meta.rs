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
    // EnumString,
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

#[allow(clippy::use_self)]
impl ::core::str::FromStr for FingerprintScope {
    type Err = ::strum::ParseError;

    fn from_str(s: &str) -> ::core::result::Result<FingerprintScope, <Self as ::core::str::FromStr>::Err> {
        ::core::result::Result::Ok(match s {
            "global" | "composite" => FingerprintScope::Global,
            "tenant" => FingerprintScope::Tenant,
            "plaintext" => FingerprintScope::Plaintext,
            _ => return ::core::result::Result::Err(::strum::ParseError::VariantNotFound),
        })
    }
}
#[allow(clippy::use_self)]
impl ::core::convert::TryFrom<&str> for FingerprintScope {
    type Error = ::strum::ParseError;

    fn try_from(
        s: &str,
    ) -> ::core::result::Result<FingerprintScope, <Self as ::core::convert::TryFrom<&str>>::Error> {
        ::core::str::FromStr::from_str(s)
    }
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
