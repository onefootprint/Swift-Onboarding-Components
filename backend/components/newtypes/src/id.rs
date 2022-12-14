pub use derive_more::{Add, Display, From, FromStr, Into};
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

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
            JsonSchema,
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
            pub fn test_data(v: $type) -> Self {
                Self(v)
            }

            #[allow(unused)]
            #[cfg(test)]
            pub(crate) fn escape_hatch(v: $type) -> Self {
                Self(v)
            }
        }
    };
}

define_newtype_id!(
    AuthTokenHash,
    String,
    "Hash of a session auth token, used as the PK in the DB"
);

// define our raw ids here
define_newtype_id!(TenantId, String, "Identifier for a Org");
define_newtype_id!(TenantRoleId, String, "Identifier for a Org role");
define_newtype_id!(TenantUserId, String, "Identifier for a Org user");
define_newtype_id!(TenantApiKeyId, String, "Identifier for an org api key");
define_newtype_id!(
    TenantApiKeyAccessLogId,
    String,
    "Identifier for an org api key access log"
);
define_newtype_id!(UserVaultId, String, "Identifier for a User Vault");

define_newtype_id!(FingerprintId, String, "Identifier for a fingerprint");
define_newtype_id!(AddressId, String, "Identifier for an address");
define_newtype_id!(EmailId, String, "Identifier for an email");
define_newtype_id!(PhoneNumberId, String, "Identifier for a phone number");
define_newtype_id!(UserProfileId, String, "Identifier for user basic info");
define_newtype_id!(IdentityDataId, String, "Identifier for user identity data row");
define_newtype_id!(ScopedUserId, String, "Identifier for an ScopedUser");
define_newtype_id!(OnboardingId, String, "Identifier for an OnboardingLink");
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
define_newtype_id!(
    WebauthnCredentialId,
    String,
    "Identifier for a webauthn credential"
);
define_newtype_id!(AccessEventId, String, "Identifier for an access event");
define_newtype_id!(InsightEventId, String, "Identifier for an insight event");
define_newtype_id!(
    VerificationRequestId,
    String,
    "Identifier for a verification request"
);
define_newtype_id!(
    VerificationResultId,
    String,
    "Identifier for a verification result"
);
define_newtype_id!(UserTimelineId, String, "Identifier for a user timeline entry");
define_newtype_id!(
    KeyValueDataId,
    String,
    "Identifier for an unstructured key-value data row"
);

define_newtype_id!(KvDataKey, String, "Represents the tag/key of key-value data");
define_newtype_id!(DocumentRequestId, String, "Identifier for a DocumentRequest");
define_newtype_id!(IdentityDocumentId, String, "Identifier for an IdentityDocument");
define_newtype_id!(RequirementId, String, "Identifier for a Requirement");
define_newtype_id!(OnboardingDecisionId, String, "Identifier for a decision");
define_newtype_id!(RiskSignalId, String, "Identifier for a risk signal");
define_newtype_id!(LivenessEventId, String, "Identifier for a liveness event");
define_newtype_id!(AnnotationId, String, "Identifier for an annotation");
define_newtype_id!(ManualReviewId, String, "Identifier for a manual review");
define_newtype_id!(DataLifetimeId, String, "Identifier for a data lifetime");
define_newtype_id!(UvdId, String, "Identifier for a UserVaultData");
define_newtype_id!(
    SocureDeviceSessionId,
    String,
    "Identifier for a socure_device_session"
);

#[doc = "Sequence number used to order DataLifetimes"]
#[derive(
    Debug,
    Clone,
    Copy,
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
    JsonSchema,
)]
#[serde(transparent)]
pub struct DataLifetimeSeqno(i64);

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

impl TenantId {
    pub fn is_integration_test_tenant(&self) -> bool {
        self.0.starts_with("_private_it_org_")
    }
}

#[cfg(test)]
mod tests {
    use std::str::FromStr;

    use super::*;
    use uuid::Uuid;

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
