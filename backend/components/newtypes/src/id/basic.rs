use super::define_newtype_id;
use super::impl_verified_prefix_for_nt_id;
use super::PrefixId;

define_newtype_id!(
    AuthTokenHash,
    String,
    "Hash of a session auth token, used as the PK in the DB"
);

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
define_newtype_id!(
    BoLinkId,
    String,
    "Identifier to link a BO in the DB to a BO in the vault"
);

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
define_newtype_id!(
    IncodeConfigurationId,
    String,
    "ConfigurationId for incode requests"
);
define_newtype_id!(
    IncodeSessionId,
    String,
    "Session id representing a verification session on incode"
);
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
define_newtype_id!(AppearanceId, String, "Identifier for an appearance");

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
define_newtype_id!(
    TenantVendorControlId,
    String,
    "Identifier for a a tenant vendor control"
);
