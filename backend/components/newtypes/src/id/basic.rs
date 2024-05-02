use super::define_newtype_id;

define_newtype_id!(
    AuthTokenHash,
    String,
    "Hash of a session auth token, used as the PK in the DB"
);

define_newtype_id!(TenantId, String, "Identifier for a Org");
define_newtype_id!(BillingProfileId, String, "Identifier for a billing profile");
define_newtype_id!(BillingEventId, String, "Identifier for a billing event");
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
define_newtype_id!(SandboxId, String, "User-defined sandbox ID for a vault");
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
define_newtype_id!(ScopedVaultId, String, "Identifier for a ScopedUser");
define_newtype_id!(IdempotencyId, String, "User-provided ID. When the same operation occurs with the same idempotency id, the same result is returned");
define_newtype_id!(FpId, String, "Identifier for a Footprint entity");
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
define_newtype_id!(
    IncodeAuthorizationToken,
    String,
    "Authorization token for an incode session"
);

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
define_newtype_id!(
    IncodeCustomerSessionId,
    String,
    "Identifier for an IncodeCustomerSession"
);
define_newtype_id!(IncodeCustomerId, String, "Identifier for an incode customer");
define_newtype_id!(DocumentUploadId, String, "Identifier for a DocumentUpload");
define_newtype_id!(RequirementId, String, "Identifier for a Requirement");
define_newtype_id!(OnboardingDecisionId, String, "Identifier for a decision");
define_newtype_id!(RiskSignalId, String, "Identifier for a risk signal");
define_newtype_id!(LivenessEventId, String, "Identifier for a liveness event");
define_newtype_id!(AnnotationId, String, "Identifier for an annotation");
define_newtype_id!(ManualReviewId, String, "Identifier for a manual review");
define_newtype_id!(DataLifetimeId, String, "Identifier for a data lifetime");
define_newtype_id!(VdId, String, "Identifier for a UserVaultData");
define_newtype_id!(WorkflowRequestId, String, "Identifier for a WorkflowRequest");
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
define_newtype_id!(MiddeskRequestId, String, "Identifier for a middesk_request");
define_newtype_id!(
    IncodeVerificationSessionId,
    String,
    "Identifier for a incode_verification_session"
);
define_newtype_id!(
    IncodeVerificationSessionEventId,
    String,
    "Identifier for a incode_verification_session_event"
);
define_newtype_id!(WorkflowId, String, "Identifier for a workflow");
define_newtype_id!(WorkflowEventId, String, "Identifier for a workflow_event");
define_newtype_id!(S3Url, String, "URL to S3 for document data");
define_newtype_id!(RiskSignalGroupId, String, "Identifier for a risk_signal_group");
define_newtype_id!(
    StytchFingerprintEventId,
    String,
    "Identifier for a stytch_fingerprint_event"
);
define_newtype_id!(
    StytchBrowserFingerprint,
    String,
    "Stytch generated browser_fingerprint"
);
define_newtype_id!(StytchBrowserId, String, "Stytch generated browser_id");
define_newtype_id!(
    StytchHardwareFingerprint,
    String,
    "Stytch generated hardware_fingerprint"
);
define_newtype_id!(
    StytchNetworkFingerprint,
    String,
    "Stytch generated network_fingerprint"
);
define_newtype_id!(
    StytchVisitorFingerprint,
    String,
    "Stytch generated visitor_fingerprint"
);
define_newtype_id!(StytchVisitorId, String, "Stytch generated visitor_id");
define_newtype_id!(TaskExecutionId, String, "Identifier for a task_execution");
define_newtype_id!(
    TenantClientConfigId,
    String,
    "Identifier for a tenant's client configuration"
);
define_newtype_id!(ZipCode, String, "ZipCode in the db");
define_newtype_id!(
    AppleDeviceAttestationId,
    String,
    "Identifier for an apple device attestation"
);
define_newtype_id!(
    AppClipExperienceId,
    String,
    "Identifier for an app clip experience"
);
define_newtype_id!(AuthEventId, String, "Identifier for a device event");
define_newtype_id!(
    GoogleDeviceAttestationId,
    String,
    "Identifier for a google device attestation"
);
define_newtype_id!(
    SessionId,
    String,
    "Client-generated identifier sent for all HTTP requests in the same session"
);
define_newtype_id!(
    IncodeWatchlistResultRef,
    String,
    "`ref` from an Incode watchlist-result reponse"
);
define_newtype_id!(RuleInstanceId, String, "Identifier for a RuleInstance");
define_newtype_id!(
    RuleId,
    String,
    "Identifier for a user facing rule (represented as a changelog of multiple immutable `rule` rows all with the same rule_id)"
);
define_newtype_id!(RuleSetResultId, String, "Identifier for a RuleSetResult");
define_newtype_id!(RuleResultId, String, "Identifier for a RuleResult");
define_newtype_id!(
    ExternalId,
    String,
    "Identifier for a external vault ID referencing footprint ID"
);

define_newtype_id!(LabelId, String, "Identifier for a footprint id label");
define_newtype_id!(TagId, String, "Identifier for a footprint id tag");
define_newtype_id!(
    TenantFrequentNoteId,
    String,
    "Identifier for a tenant frequent note"
);
define_newtype_id!(
    TenantAndroidAppMetaId,
    String,
    "Identifier for a tenant android app metadata for generating attestations"
);
define_newtype_id!(
    TenantIosAppMetaId,
    String,
    "Identifier for a tenant ios app metadata for generating attestations"
);
define_newtype_id!(
    TenantBusinessInfoId,
    String,
    "Identifier for a a tenant_business_info"
);
define_newtype_id!(AuditEventId, String, "Identifier for an audit event");

define_newtype_id!(PartnerTenantId, String, "Identifier for an partner tenant");
define_newtype_id!(
    TenantCompliancePartnershipId,
    String,
    "Identifier for an tenant compliance partnership"
);
define_newtype_id!(ComplianceDocId, String, "Identifier for a compliance document");
define_newtype_id!(
    ComplianceDocAssignmentId,
    String,
    "Identifier for a compliance document assignment"
);
define_newtype_id!(
    ComplianceDocTemplateId,
    String,
    "Identifier for a compliance document template"
);
define_newtype_id!(
    ComplianceDocTemplateVersionId,
    String,
    "Identifier for a compliance document template version"
);
define_newtype_id!(
    ComplianceDocRequestId,
    String,
    "Identifier for a compliance document request"
);
define_newtype_id!(
    ComplianceDocSubmissionId,
    String,
    "Identifier for a compliance document submission"
);
define_newtype_id!(
    ComplianceDocReviewId,
    String,
    "Identifier for a compliance document review"
);
define_newtype_id!(ListId, String, "Identifier for a List");
define_newtype_id!(
    ListAlias,
    String,
    "User facing alias that is used to refer to List's from rules"
);
define_newtype_id!(ListEntryId, String, "Identifier for a ListEntry");
define_newtype_id!(RuleSetVersionId, String, "Identifier for a RuleSetVersion");
define_newtype_id!(NeuroIdentityId, String, "Identifier for a NeuroID User");
define_newtype_id!(
    NeuroIdAnalyticsEventId,
    String,
    "Identifier for a NeuroID analytics event"
);
define_newtype_id!(ListEntryCreationId, String, "Identifier for a ListEntryCreation");

impl From<WorkflowId> for NeuroIdentityId {
    fn from(value: WorkflowId) -> Self {
        let id = crypto::base64::encode_config(
            crypto::sha256(format!("{}{}", "neuro", value).as_bytes()),
            crypto::base64::URL_SAFE_NO_PAD,
        );

        NeuroIdentityId::from(id)
    }
}

define_newtype_id!(
    RuleInstanceReferencesListId,
    String,
    "Identifier for a RuleInstanceReferencesList"
);
