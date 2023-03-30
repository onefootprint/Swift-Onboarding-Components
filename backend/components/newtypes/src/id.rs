pub use derive_more::{Add, Display, From, FromStr, Into};
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

use crate::VaultKind;

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
            derive_more::Deref,
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

/// A trait that enables an id to verify its prefix
pub trait PrefixId: From<String> {
    const PREFIX: &'static str;

    fn parse_with_prefix<S: Into<String>>(s: S) -> Result<Self, crate::Error> {
        let s: String = s.into();
        if !s.starts_with(Self::PREFIX) {
            return Err(crate::Error::IdPrefixError(Self::PREFIX));
        }
        let unique_part = s.replace(Self::PREFIX, "");
        if !unique_part.chars().all(char::is_alphanumeric) || unique_part.is_empty() {
            return Err(crate::Error::IdPrefixError(Self::PREFIX));
        }
        Ok(Self::from(s))
    }
}
/// This macro implements a way to verify the prefix of an id
macro_rules! impl_verified_prefix_for_nt_id {
    ($name: ident, $prefix: literal) => {
        impl PrefixId for $name {
            const PREFIX: &'static str = $prefix;
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
define_newtype_id!(StripeCustomerId, String, "Identifier for stripe customer");
define_newtype_id!(TenantRoleId, String, "Identifier for a Org role");
define_newtype_id!(TenantRolebindingId, String, "Identifier for a Org rolebinding");
define_newtype_id!(TenantUserId, String, "Identifier for a Org user");
define_newtype_id!(TenantApiKeyId, String, "Identifier for an org api key");
define_newtype_id!(
    TenantApiKeyAccessLogId,
    String,
    "Identifier for an org api key access log"
);
define_newtype_id!(VaultId, String, "Identifier for a User Vault");
define_newtype_id!(BoId, String, "Identifier for a business owner");

define_newtype_id!(FingerprintId, String, "Identifier for a fingerprint");
define_newtype_id!(AddressId, String, "Identifier for an address");
define_newtype_id!(EmailId, String, "Identifier for an email");
define_newtype_id!(PhoneNumberId, String, "Identifier for a phone number");
define_newtype_id!(ContactInfoId, String, "Identifier for contact info");
define_newtype_id!(UserProfileId, String, "Identifier for user basic info");
define_newtype_id!(IdentityDataId, String, "Identifier for user identity data row");
define_newtype_id!(ScopedVaultId, String, "Identifier for an ScopedUser");
define_newtype_id!(OnboardingId, String, "Identifier for an OnboardingLink");
define_newtype_id!(FpId, String, "Identifier for a ScopedUser");
impl_verified_prefix_for_nt_id!(FpId, "fp_id_");

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
define_newtype_id!(VdId, String, "Identifier for a UserVaultData");
define_newtype_id!(
    FingerprintVisitorId,
    String,
    "Identifier for a Fingerprint VisitorId"
);
define_newtype_id!(
    FingerprintRequestId,
    String,
    "Identifier for a Fingerprint Visitor Visit"
);
define_newtype_id!(
    FingerprintVisitEventId,
    String,
    "Identifier for a Fingerprint visit event"
);
define_newtype_id!(
    SocureDeviceSessionId,
    String,
    "Identifier for a socure_device_session"
);
define_newtype_id!(UserConsentId, String, "Identifier for a UserConsent");
define_newtype_id!(ProxyConfigId, String, "Identifier for a Proxy Configuration");
define_newtype_id!(
    ProxyConfigItemId,
    String,
    "Identifier for a Proxy Configuration detail"
);
define_newtype_id!(
    ProxyConfigSecretHeaderId,
    String,
    "Identifier for a Proxy Configuration secret header"
);

define_newtype_id!(
    ProxyConfigIngressRuleId,
    String,
    "Identifier for a Proxy Configuration Ingress Rule"
);
define_newtype_id!(
    IdologyExpectIdResponseId,
    String,
    "Identifier for a IdologyExpectIdResponse"
);
define_newtype_id!(ProxyRequestLogId, String, "Identifier for a log of proxy request");
define_newtype_id!(WebhookServiceId, String, "Identifier for a webhook service");
define_newtype_id!(TaskId, String, "Identifier for a task");
define_newtype_id!(DocumentDataId, String, "Identifier for a DocumentData");
define_newtype_id!(DecisionIntentId, String, "Identifier for a decision_intent");
define_newtype_id!(WatchlistCheckId, String, "Identifier for a watchlist_check");

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

fn generate_random_id(prefix: &str, length: usize) -> String {
    format!(
        "{}_{}",
        prefix,
        crypto::random::gen_random_alphanumeric_code(length)
    )
}

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

        Self(generate_random_id(prefix, Self::LENGTH))
    }
}

impl TenantId {
    pub fn is_integration_test_tenant(&self) -> bool {
        self.0.starts_with("_private_it_org_")
    }
}

impl ScopedVaultId {
    const LENGTH: usize = 22;

    pub fn generate(kind: VaultKind) -> Self {
        let prefix = match kind {
            VaultKind::Person => "su",
            VaultKind::Business => "sb",
        };
        Self(generate_random_id(prefix, Self::LENGTH))
    }
}

impl VaultId {
    const LENGTH: usize = 22;

    pub fn generate(kind: VaultKind) -> Self {
        let prefix = match kind {
            VaultKind::Person => "uv",
            VaultKind::Business => "bv",
        };
        Self(generate_random_id(prefix, Self::LENGTH))
    }
}

impl FpId {
    const LENGTH: usize = 22;

    pub fn generate(kind: VaultKind) -> Self {
        let prefix = match kind {
            VaultKind::Person => "fp_id",
            VaultKind::Business => "fp_bid",
        };
        Self(generate_random_id(prefix, Self::LENGTH))
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

    #[test]
    fn test_prefix() {
        define_newtype_id!(TestId, String, "");
        impl_verified_prefix_for_nt_id!(TestId, "abcd_ab_");

        let _ = TestId::parse_with_prefix("abcd_ab_asdajsdhj1h313j1jsdsdf").expect("failed to parse id");
        let _ = TestId::parse_with_prefix("abcd_ab_12abADdas3ssF").expect("failed to parse id");
        let _ = TestId::parse_with_prefix("abcd_ab_as12123abcd_ab").expect_err("failed to fail id");
        let _ = TestId::parse_with_prefix("abcd_ab_a2112@@$$dfdf").expect_err("failed to fail id");
        let _ = TestId::parse_with_prefix("abcd_ab_a2112@@$$dfdf").expect_err("failed to fail id");
        let _ = TestId::parse_with_prefix("abcd_ab_").expect_err("failed to fail id");
    }
}
