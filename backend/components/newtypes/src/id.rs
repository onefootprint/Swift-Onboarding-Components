pub use derive_more::{Add, Display, From, FromStr, Into};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// This macro generates an Id type that wraps a string
macro_rules! define_newtype_id {
    ($name: ident, $type: ty, $doc: literal) => {
        #[doc = $doc]
        #[derive(
            Debug,
            Clone,
            Hash,
            PartialEq,
            Eq,
            Ord,
            PartialOrd,
            Display,
            From,
            Into,
            FromStr,
            Serialize,
            Deserialize,
            Default,
            DieselNewType,
        )]
        #[serde(transparent)]
        pub struct $name($type);

        impl paperclip::v2::schema::TypedData for $name {
            fn data_type() -> paperclip::v2::models::DataType {
                paperclip::v2::models::DataType::String
            }

            fn format() -> Option<paperclip::v2::models::DataTypeFormat> {
                None
            }
        }

        impl $name {
            #[allow(unused)]
            #[cfg(test)]
            pub(crate) fn escape_hatch(v: $type) -> Self {
                Self(v)
            }
        }
    };
}

// define our raw ids here
define_newtype_id!(TenantId, String, "Identifier for a Tenant");
define_newtype_id!(TenantRoleId, String, "Identifier for a TenantRole");
define_newtype_id!(TenantApiKeyId, String, "Primary Key for an api key");
define_newtype_id!(UserVaultId, String, "Identifier for a User Vault");

define_newtype_id!(FingerprintId, Uuid, "Identifier for a fingerprint");
define_newtype_id!(AddressId, String, "Identifier for an address");
define_newtype_id!(EmailId, String, "Identifier for an email");
define_newtype_id!(PhoneNumberId, String, "Identifier for a phone number");
define_newtype_id!(UserProfileId, String, "Identifier for user basic info");
define_newtype_id!(IdentityDataId, String, "Identifier for user identity data row");
define_newtype_id!(ScopedUserId, String, "Identifier for an ScopedUser");
define_newtype_id!(OnboardingId, Uuid, "Identifier for an OnboardingLink");
define_newtype_id!(FootprintUserId, String, "Identifier for a ScopedUser");
define_newtype_id!(
    ObConfigurationId,
    String,
    "Internal identifier for a an onboarding configuration"
);
define_newtype_id!(
    ObConfigurationKey,
    String,
    "Public identifier for a an onboarding configuration"
);
define_newtype_id!(WebauthnCredentialId, Uuid, "Identifier for a webauthn credential");
define_newtype_id!(AccessEventId, Uuid, "Identifier for an access event");
define_newtype_id!(InsightEventId, Uuid, "Identifier for an insight event");
define_newtype_id!(
    VerificationRequestId,
    Uuid,
    "Identifier for a verification request"
);
define_newtype_id!(VerificationResultId, Uuid, "Identifier for a verification result");
define_newtype_id!(AuditTrailId, Uuid, "Identifier for an audit trail");
define_newtype_id!(
    KeyValueDataId,
    String,
    "Identifier for an unstructured key-value data row"
);

define_newtype_id!(KvDataKey, String, "Represents the tag/key of key-value data");

impl ObConfigurationKey {
    /// prefixed on LIVE keys
    pub const LIVE_PREFIX: &'static str = "ob_live";

    /// prefix on sandbox keys
    pub const SANDBOX_PREFIX: &'static str = "ob_test";

    const LENGTH: usize = 22;

    /// generate a random new secret api key
    pub fn generate(is_live: bool) -> Self {
        let prefix = if is_live {
            Self::LIVE_PREFIX
        } else {
            Self::SANDBOX_PREFIX
        };

        let key = format!(
            "{}_{}",
            prefix,
            crypto::random::gen_random_alphanumeric_code(Self::LENGTH)
        );

        Self(key)
    }
}

#[cfg(test)]
mod tests {
    use std::str::FromStr;

    use super::*;

    #[test]
    fn test_id_string() {
        define_newtype_id!(TestId, String, "");

        let x = TestId::from_str("some_test_id").unwrap();
        assert_eq!(x.to_string(), "some_test_id".to_string());
    }

    #[test]
    fn test_id_uuid() {
        define_newtype_id!(TestUuid, Uuid, "");

        let x = TestUuid::from_str("a5971b52-1b44-4c3a-a83f-a96796f8774d").unwrap();
        assert_eq!(x.to_string(), "a5971b52-1b44-4c3a-a83f-a96796f8774d".to_string());
    }
}
