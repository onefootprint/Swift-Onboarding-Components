import type {
  ApiOnboardingRequirement,
  AuthMethod,
  AuthRequirementsResponse,
  AuthV1Options,
  AuthV1SdkArgs,
  AuthorizeFields,
  AuthorizedOrg,
  BatchHostedBusinessOwnerRequest,
  BatchHostedBusinessOwnerRequestCreate,
  BatchHostedBusinessOwnerRequestDelete,
  BatchHostedBusinessOwnerRequestUpdate,
  BusinessOnboardingResponse,
  ChallengeKind,
  CheckSessionResponse,
  CollectDocumentConfig,
  CollectDocumentConfigCustom,
  CollectDocumentConfigIdentity,
  CollectDocumentConfigProofOfAddress,
  CollectDocumentConfigProofOfSsn,
  ConsentRequest,
  CreateDeviceAttestationRequest,
  CreateDocumentRequest,
  CreateDocumentResponse,
  CreateOnboardingTimelineRequest,
  CreateSdkArgsTokenResponse,
  CreateUserTokenRequest,
  CreateUserTokenResponse,
  D2pGenerateRequest,
  D2pGenerateResponse,
  D2pSessionStatus,
  D2pSmsRequest,
  D2pSmsResponse,
  D2pStatusResponse,
  D2pUpdateStatusRequest,
  DeleteHostedBusinessOwnerRequest,
  DeviceAttestationChallengeResponse,
  DeviceAttestationType,
  DocumentFixtureResult,
  DocumentResponse,
  EmailVerifyRequest,
  FingerprintVisitRequest,
  FormV1Options,
  FormV1SdkArgs,
  GetDeviceAttestationChallengeRequest,
  GetSdkArgsTokenResponse,
  GetUserTokenResponse,
  GetVerifyContactInfoResponse,
  HandoffMetadata,
  HostedBusiness,
  HostedBusinessDetail,
  HostedBusinessOwner,
  HostedUserDecryptRequest,
  HostedValidateResponse,
  HostedWorkflowRequest,
  IdentifiedUser,
  IdentifyAuthMethod,
  IdentifyChallengeResponse,
  IdentifyId,
  IdentifyRequest,
  IdentifyResponse,
  IdentifyVerifyRequest,
  IdentifyVerifyResponse,
  Inviter,
  KbaResponse,
  L10n,
  L10nV1,
  LiteIdentifyRequest,
  LiteIdentifyResponse,
  LogBody,
  LoginChallengeRequest,
  ModernBusinessDecryptResponse,
  ModernRawBusinessDataRequest,
  ModernRawUserDataRequest,
  ModernUserDecryptResponse,
  NeuroIdentityIdResponse,
  OnboardingRequirement,
  OnboardingRequirementAuthorize,
  OnboardingRequirementCollectBusinessData,
  OnboardingRequirementCollectData,
  OnboardingRequirementCollectDocument,
  OnboardingRequirementCollectInvestorProfile,
  OnboardingRequirementCreateBusinessOnboarding,
  OnboardingRequirementProcess,
  OnboardingRequirementRegisterAuthMethod,
  OnboardingRequirementRegisterPasskey,
  OnboardingResponse,
  OnboardingSessionResponse,
  OnboardingStatusResponse,
  PostBusinessOnboardingRequest,
  PostOnboardingRequest,
  ProcessRequest,
  PublicOnboardingConfiguration,
  RegisterPasskeyAttemptContext,
  RenderV1SdkArgs,
  RequestedTokenScope,
  SdkArgs,
  SdkArgsAuthV1,
  SdkArgsFormV1,
  SdkArgsRenderV1,
  SdkArgsUpdateAuthMethodsV1,
  SdkArgsVerifyResultV1,
  SdkArgsVerifyV1,
  SignupChallengeRequest,
  SkipLivenessClientType,
  SkipLivenessContext,
  SkipPasskeyRegisterRequest,
  SocureDeviceSessionIdRequest,
  StytchTelemetryRequest,
  UpdateAuthMethodsV1SdkArgs,
  UpdateOrCreateHostedBusinessOwnerRequest,
  UserAuthScope,
  UserChallengeData,
  UserChallengeRequest,
  UserChallengeResponse,
  UserChallengeVerifyRequest,
  UserChallengeVerifyResponse,
  VerifyResultV1SdkArgs,
  VerifyV1Options,
  VerifyV1SdkArgs,
  WorkflowFixtureResult,
} from '@onefootprint/request-types';
import type {
  ActionKind,
  Actor,
  ActorApiKey,
  ActorFirmEmployee,
  ActorFootprint,
  ActorOrganization,
  ActorUser,
  AdverseMediaListKind,
  AmlDetail,
  AmlHit,
  AmlHitMedia,
  AmlMatchKind,
  Annotation,
  ApiKeyStatus,
  AssumePartnerRoleRequest,
  AssumePartnerRoleResponse,
  AssumeRoleRequest,
  AssumeRoleResponse,
  AttestedDeviceData,
  AuditEvent,
  AuditEventApiKey,
  AuditEventDetail,
  AuditEventDetailCollectUserDocument,
  AuditEventDetailCompleteUserCheckLiveness,
  AuditEventDetailCompleteUserCheckWatchlist,
  AuditEventDetailCompleteUserVerification,
  AuditEventDetailCreateListEntry,
  AuditEventDetailCreateOrg,
  AuditEventDetailCreateOrgApiKey,
  AuditEventDetailCreateOrgRole,
  AuditEventDetailCreatePlaybook,
  AuditEventDetailCreateUser,
  AuditEventDetailCreateUserAnnotation,
  AuditEventDetailDeactivateOrgRole,
  AuditEventDetailDecryptOrgApiKey,
  AuditEventDetailDecryptUserData,
  AuditEventDetailDeleteListEntry,
  AuditEventDetailDeleteUser,
  AuditEventDetailDeleteUserData,
  AuditEventDetailDisablePlaybook,
  AuditEventDetailEditPlaybook,
  AuditEventDetailInviteOrgMember,
  AuditEventDetailLoginOrgMember,
  AuditEventDetailManuallyReviewEntity,
  AuditEventDetailOrgMemberJoined,
  AuditEventDetailRemoveOrgMember,
  AuditEventDetailRequestUserData,
  AuditEventDetailStartUserVerification,
  AuditEventDetailUpdateOrgApiKeyRole,
  AuditEventDetailUpdateOrgApiKeyStatus,
  AuditEventDetailUpdateOrgMember,
  AuditEventDetailUpdateOrgRole,
  AuditEventDetailUpdateOrgSettings,
  AuditEventDetailUpdateUserData,
  AuditEventName,
  AuditEventOrgMember,
  AuthEvent,
  AuthEventKind,
  AuthMethodKind,
  AuthMethodUpdated,
  AuthOrgMember,
  BooleanOperator,
  BusinessDetail,
  BusinessInsights,
  BusinessOwnerKind,
  BusinessOwnerSource,
  CipKind,
  ClientDecryptRequest,
  ClientIdentity,
  CollectedDataOption,
  CompanySize,
  ComplianceCompanySummary,
  ComplianceDocData,
  ComplianceDocDataExternalUrl,
  ComplianceDocDataFileUpload,
  ComplianceDocDataKind,
  ComplianceDocEvent,
  ComplianceDocEventAssigned,
  ComplianceDocEventRequested,
  ComplianceDocEventReviewed,
  ComplianceDocEventSubmitted,
  ComplianceDocEventType,
  ComplianceDocEventTypeAssigned,
  ComplianceDocEventTypeRequestRetracted,
  ComplianceDocEventTypeRequested,
  ComplianceDocEventTypeReviewed,
  ComplianceDocEventTypeSubmitted,
  ComplianceDocReviewDecision,
  ComplianceDocStatus,
  ComplianceDocSubmission,
  ComplianceDocSummary,
  ComplianceDocTemplate,
  ComplianceDocTemplateVersion,
  ContactInfoKind,
  CopyPlaybookRequest,
  CountrySpecificDocumentMapping,
  CreateAnnotationRequest,
  CreateApiKeyRequest,
  CreateComplianceDocRequest,
  CreateComplianceDocTemplateRequest,
  CreateEntityTokenRequest,
  CreateEntityTokenResponse,
  CreateKycLinksRequest,
  CreateListEntryRequest,
  CreateListRequest,
  CreateOnboardingConfigurationRequest,
  CreateOrgFrequentNoteRequest,
  CreateOrgTenantTagRequest,
  CreatePlaybookVersionRequest,
  CreateProxyConfigRequest,
  CreateReviewRequest,
  CreateRule,
  CreateTagRequest,
  CreateTenantAndroidAppMetaRequest,
  CreateTenantIosAppMetaRequest,
  CreateTenantRoleRequest,
  CreateTenantUserRequest,
  CreateTokenResponse,
  CursorPaginatedAuditEvent,
  CursorPaginatedEntity,
  CursorPaginatedListEvent,
  CustomDocumentConfig,
  DashboardSecretApiKey,
  DataAttributeKind,
  DataCollectedInfo,
  DataIdentifier,
  DataLifetimeSource,
  DbActor,
  DbActorFirmEmployee,
  DbActorFootprint,
  DbActorTenantApiKey,
  DbActorTenantUser,
  DbActorUser,
  DecisionStatus,
  DecryptionContext,
  DeleteRequest,
  DeviceFraudRiskLevel,
  DeviceInsightField,
  DeviceInsightOperation,
  DeviceType,
  DocsTokenResponse,
  Document,
  DocumentAndCountryConfiguration,
  DocumentImageError,
  DocumentKind,
  DocumentRequest,
  DocumentRequestConfig,
  DocumentRequestConfigCustom,
  DocumentRequestConfigIdentity,
  DocumentRequestConfigProofOfAddress,
  DocumentRequestConfigProofOfSsn,
  DocumentRequestKind,
  DocumentReviewStatus,
  DocumentSide,
  DocumentStatus,
  DocumentUpload,
  DocumentUploadSettings,
  DocumentUploadedTimelineEvent,
  DupeKind,
  Dupes,
  EditRule,
  Empty,
  EnclaveHealthResponse,
  EnhancedAml,
  Entity,
  EntityAction,
  EntityActionClearReview,
  EntityActionManualDecision,
  EntityActionResponse,
  EntityActionResponseTrigger,
  EntityActionTrigger,
  EntityActionsRequest,
  EntityAttribute,
  EntityOnboarding,
  EntityOnboardingRuleSetResult,
  EntityStatus,
  EntityWorkflow,
  Equals,
  EvaluateRuleRequest,
  ExternalIntegrationCalled,
  ExternalIntegrationKind,
  FieldValidation,
  FieldValidationDetail,
  FilterFunction,
  FootprintReasonCode,
  GetClientTokenResponse,
  GetClientTokenResponseTenant,
  GetFieldValidationResponse,
  GetUserVaultResponse,
  IdDocKind,
  IdentifyScope,
  InProgressOnboarding,
  InProgressOnboardingTenant,
  IngressSettings,
  InsightAddress,
  InsightBusinessName,
  InsightEvent,
  InsightPerson,
  InsightPhone,
  InsightRegistration,
  InsightTin,
  InsightWatchlist,
  InsightWebsite,
  IntegrityRequest,
  IntegrityResponse,
  InvestorProfileDeclaration,
  InvestorProfileFundingSource,
  InvestorProfileInvestmentGoal,
  InvoicePreview,
  InvokeVaultProxyPermission,
  InvokeVaultProxyPermissionAny,
  InvokeVaultProxyPermissionId,
  InvokeVaultProxyPermissionJustInTime,
  IsIn,
  Iso3166TwoDigitCountryCode,
  LabelAdded,
  LabelKind,
  LineItem,
  LinkAuthRequest,
  List,
  ListDetails,
  ListEntitiesSearchRequest,
  ListEntry,
  ListEvent,
  ListEventDetail,
  ListEventDetailCreateListEntry,
  ListEventDetailDeleteListEntry,
  ListKind,
  ListPlaybookUsage,
  LiteOrgMember,
  LiteUserAndOrg,
  LivenessAttributes,
  LivenessEvent,
  LivenessIssuer,
  LivenessSource,
  ManualDecisionRequest,
  ManualReview,
  ManualReviewKind,
  MatchLevel,
  ModernEntityDecryptResponse,
  MultiUpdateRuleRequest,
  NumberOperator,
  ObConfigurationKind,
  Officer,
  OffsetPaginatedDashboardSecretApiKey,
  OffsetPaginatedEntityOnboarding,
  OffsetPaginatedList,
  OffsetPaginatedOnboardingConfiguration,
  OffsetPaginatedOrganizationMember,
  OffsetPaginatedOrganizationRole,
  OmittedSecretCustomHeader,
  OnboardingConfiguration,
  OnboardingStatus,
  OnboardingTimelineInfo,
  OrgClientSecurityConfig,
  OrgFrequentNote,
  OrgLoginResponse,
  OrgMetrics,
  OrgMetricsResponse,
  OrgTenantTag,
  Organization,
  OrganizationMember,
  OrganizationRole,
  OrganizationRolebinding,
  OtherTenantDupes,
  ParentOrganization,
  PartnerLoginRequest,
  PartnerOrganization,
  PatchProxyConfigRequest,
  PhoneLookupAttributes,
  PlainCustomHeader,
  PreviewApi,
  PrivateBusinessOwner,
  PrivateBusinessOwnerKycLink,
  PrivateOwnedBusiness,
  ProxyConfigBasic,
  ProxyConfigDetailed,
  ProxyIngressContentType,
  ProxyIngressRule,
  RawUserDataRequest,
  RestoreOnboardingConfigurationRequest,
  ReuploadComplianceDocRequest,
  RiskScore,
  RiskSignal,
  RiskSignalDetail,
  RiskSignalGroupKind,
  Rule,
  RuleAction,
  RuleActionConfig,
  RuleActionConfigFail,
  RuleActionConfigManualReview,
  RuleActionConfigPassWithManualReview,
  RuleActionConfigStepUp,
  RuleActionMigration,
  RuleEvalResult,
  RuleEvalResults,
  RuleEvalStats,
  RuleExpression,
  RuleExpressionCondition,
  RuleInstanceKind,
  RuleResult,
  RuleSet,
  RuleSetResult,
  SameTenantDupe,
  ScoreBand,
  SearchEntitiesRequest,
  SecretApiKey,
  SecretCustomHeader,
  SentilinkDetail,
  SentilinkReasonCode,
  SentilinkScoreDetail,
  SignalScope,
  SignalSeverity,
  SubmitExternalUrlRequest,
  TenantAndroidAppMeta,
  TenantFrequentNoteKind,
  TenantIosAppMeta,
  TenantKind,
  TenantLoginRequest,
  TenantRoleKindDiscriminant,
  TenantScope,
  TenantScopeAdmin,
  TenantScopeApiKeys,
  TenantScopeAuthToken,
  TenantScopeCipIntegration,
  TenantScopeCompliancePartnerAdmin,
  TenantScopeCompliancePartnerManageReviews,
  TenantScopeCompliancePartnerManageTemplates,
  TenantScopeCompliancePartnerRead,
  TenantScopeDecrypt,
  TenantScopeDecryptAll,
  TenantScopeDecryptAllExceptPciData,
  TenantScopeDecryptCustom,
  TenantScopeDecryptDocument,
  TenantScopeDecryptDocumentAndSelfie,
  TenantScopeInvokeVaultProxy,
  TenantScopeLabelAndTag,
  TenantScopeManageComplianceDocSubmission,
  TenantScopeManageVaultProxy,
  TenantScopeManageWebhooks,
  TenantScopeManualReview,
  TenantScopeOnboarding,
  TenantScopeOnboardingConfiguration,
  TenantScopeOrgSettings,
  TenantScopeRead,
  TenantScopeTriggerKyb,
  TenantScopeTriggerKyc,
  TenantScopeWriteEntities,
  TenantScopeWriteLists,
  TerminalDecisionStatus,
  TimelineOnboardingDecision,
  TimelinePlaybook,
  TokenOperationKind,
  TriggerRequest,
  UnvalidatedRuleExpression,
  UpdateAnnotationRequest,
  UpdateApiKeyRequest,
  UpdateClientSecurityConfig,
  UpdateComplianceDocAssignmentRequest,
  UpdateComplianceDocTemplateRequest,
  UpdateLabelRequest,
  UpdateListRequest,
  UpdateObConfigRequest,
  UpdatePartnerTenantRequest,
  UpdateTenantAndroidAppMetaRequest,
  UpdateTenantIosAppMetaRequest,
  UpdateTenantRequest,
  UpdateTenantRoleRequest,
  UpdateTenantRolebindingRequest,
  UpdateTenantUserRequest,
  UploadSource,
  UserAiSummary,
  UserDataIdentifier,
  UserDecryptRequest,
  UserDecryptResponse,
  UserDeleteResponse,
  UserInsight,
  UserInsightScope,
  UserInsightUnit,
  UserLabel,
  UserTag,
  UserTimeline,
  UserTimelineEvent,
  UserTimelineEventAnnotation,
  UserTimelineEventAuthMethodUpdated,
  UserTimelineEventBusinessOwnerCompletedKyc,
  UserTimelineEventDataCollected,
  UserTimelineEventDocumentUploaded,
  UserTimelineEventExternalIntegrationCalled,
  UserTimelineEventLabelAdded,
  UserTimelineEventLiveness,
  UserTimelineEventOnboardingDecision,
  UserTimelineEventOnboardingTimeline,
  UserTimelineEventStepUp,
  UserTimelineEventVaultCreated,
  UserTimelineEventWatchlistCheck,
  UserTimelineEventWorkflowStarted,
  UserTimelineEventWorkflowTriggered,
  VaultCreated,
  VaultDrAwsPreEnrollResponse,
  VaultDrEnrollRequest,
  VaultDrEnrollResponse,
  VaultDrEnrolledStatus,
  VaultDrRevealWrappedRecordKeysRequest,
  VaultDrRevealWrappedRecordKeysResponse,
  VaultDrStatus,
  VaultKind,
  VaultOperation,
  VerificationCheck,
  VerificationCheckAml,
  VerificationCheckBusinessAml,
  VerificationCheckCurpValidation,
  VerificationCheckIdentityDocument,
  VerificationCheckKyb,
  VerificationCheckKyc,
  VerificationCheckNeuroId,
  VerificationCheckPhone,
  VerificationCheckSentilink,
  VerificationCheckStytchDevice,
  WatchlistCheck,
  WatchlistCheckStatusKind,
  WatchlistEntry,
  WatchlistHit,
  WebhookPortalResponse,
  WorkflowKind,
  WorkflowRequestConfig,
  WorkflowRequestConfigDocument,
  WorkflowRequestConfigOnboard,
  WorkflowSource,
  WorkflowStarted,
  WorkflowStartedEventKind,
  WorkflowTriggered,
} from '@onefootprint/request-types/dashboard';

export const hosted_ActionKind: ActionKind = 'replace';
export const hosted_ApiKeyStatus: ApiKeyStatus = 'disabled';
export const hosted_ApiOnboardingRequirement: ApiOnboardingRequirement = {
  authMethodKind: 'phone',
  isMet: false,
  kind: 'register_auth_method',
};
export const hosted_AuthMethod: AuthMethod = {
  canUpdate: true,
  isVerified: false,
  kind: 'phone',
};
export const hosted_AuthMethodKind: AuthMethodKind = 'email';
export const hosted_AuthRequirementsResponse: AuthRequirementsResponse = {
  allRequirements: [
    {
      isMet: true,
      kind: 'process',
    },
    {
      isMet: true,
      kind: 'process',
    },
    {
      isMet: true,
      kind: 'process',
    },
  ],
};
export const hosted_AuthV1Options: AuthV1Options = {
  showLogo: true,
};
export const hosted_AuthV1SdkArgs: AuthV1SdkArgs = {
  l10N: {
    language: 'en',
    locale: 'en-US',
  },
  options: {
    showLogo: false,
  },
  publicKey: '7c1e3afb-b864-49ee-b5fa-18d31c9bf77b',
  userData: {},
};
export const hosted_AuthorizeFields: AuthorizeFields = {
  collectedData: ['phone_number', 'bank', 'name'],
  documentTypes: ['ssn_card', 'permit', 'custom'],
};
export const hosted_AuthorizedOrg: AuthorizedOrg = {
  canAccessData: ['card', 'investor_profile', 'ssn9'],
  logoUrl: 'https://whimsical-hoof.net/',
  orgName: 'Fredrick Dare',
};
export const hosted_BatchHostedBusinessOwnerRequest: BatchHostedBusinessOwnerRequest = {
  data: {
    'bank.*.account_type': 'Excepteur esse',
    'bank.*.ach_account_id': '3b59ef3c-20fe-4d2b-8970-2881748f4774',
    'bank.*.ach_account_number': 'non dolor proident consequat fugiat',
    'bank.*.ach_routing_number': 'laborum dolore',
    'bank.*.fingerprint': 'id occaecat mollit nulla ipsum',
    'bank.*.name': 'Ruben Donnelly',
    'card.*.billing_address.country': '9971 Lake Avenue Suite 603',
    'card.*.billing_address.zip': '474 Yasmine Passage Suite 133',
    'card.*.cvc': 'esse ipsum quis nulla',
    'card.*.expiration': 'ut magna consequat',
    'card.*.expiration_month': 'velit nostrud',
    'card.*.expiration_year': 'commodo',
    'card.*.fingerprint': 'qui esse ex et',
    'card.*.issuer': 'ullamco anim veniam',
    'card.*.name': 'Carol Von',
    'card.*.number': 'mollit sint cillum sit enim',
    'card.*.number_last4': 'ut',
    'custom.*': 'ipsum cupidatat tempor quis qui',
    'document.custom.*': 'Excepteur aliquip laboris non sunt',
    'document.drivers_license.address_line1': '36203 College Avenue Apt. 844',
    'document.drivers_license.back.image': 'commodo sed fugiat',
    'document.drivers_license.back.mime_type': 'cupidatat ullamco',
    'document.drivers_license.city': 'Fort Joany',
    'document.drivers_license.classified_document_type': 'id sit Lorem',
    'document.drivers_license.clave_de_elector': 'aute',
    'document.drivers_license.curp': 'enim',
    'document.drivers_license.curp_validation_response': '4b99b0ef-e288-43b4-b1b3-b8b977b12d98',
    'document.drivers_license.dob': 'nulla',
    'document.drivers_license.document_number': 'id deserunt',
    'document.drivers_license.expires_at': 'fugiat aliqua proident',
    'document.drivers_license.first_name': 'Camryn',
    'document.drivers_license.front.image': 'amet culpa ipsum',
    'document.drivers_license.front.mime_type': 'sit',
    'document.drivers_license.full_address': '152 McKenzie Mission Suite 267',
    'document.drivers_license.full_name': 'Todd Simonis',
    'document.drivers_license.gender': 'do nulla labore id',
    'document.drivers_license.issued_at': 'ut commodo veniam culpa dolor',
    'document.drivers_license.issuing_country': 'Panama',
    'document.drivers_license.issuing_state': 'New Jersey',
    'document.drivers_license.last_name': 'Nader',
    'document.drivers_license.nationality': 'sed consequat anim dolor cupidatat',
    'document.drivers_license.postal_code': 'magna id esse',
    'document.drivers_license.ref_number': 'fugiat voluptate amet commodo irure',
    'document.drivers_license.samba_activity_history_response': 'proident nulla dolore',
    'document.drivers_license.selfie.image': 'consequat',
    'document.drivers_license.selfie.mime_type': 'adipisicing laboris incididunt reprehenderit exercitation',
    'document.drivers_license.state': 'Wyoming',
    'document.drivers_license.us_issuing_state': 'New Mexico',
    'document.finra_compliance_letter': 'aliquip elit',
    'document.id_card.address_line1': '651 Huel Shoals Suite 446',
    'document.id_card.back.image': '47c4a5ec-3238-4143-aac9-cf4ee32bd324',
    'document.id_card.back.mime_type': 'b8f51bc4-f448-43ad-a3bb-f445257f46c7',
    'document.id_card.city': 'Port Aleenhaven',
    'document.id_card.classified_document_type': '25861f70-7670-4923-b05f-084644e15486',
    'document.id_card.clave_de_elector': '473a91d9-eccd-4ff2-8824-421fd9c90042',
    'document.id_card.curp': 'ffaf39dd-cf26-4a0c-874a-dcca3e3895f6',
    'document.id_card.curp_validation_response': '8d6ee8eb-fd1f-4881-ae71-3f77d83f7bc7',
    'document.id_card.dob': 'ba512945-e2c4-45ca-a3f8-b5499550f695',
    'document.id_card.document_number': 'b897adfd-b487-4ffb-b626-0d470a39af32',
    'document.id_card.expires_at': '6b65bf6e-db8d-4216-821a-f7db1104aec2',
    'document.id_card.first_name': 'Jerald',
    'document.id_card.front.image': 'b962d438-3db7-4825-84ce-d65ee9ded2c9',
    'document.id_card.front.mime_type': '270ecd38-d92a-4fa9-9ee4-badd3892d804',
    'document.id_card.full_address': '33499 Wuckert Extension Apt. 377',
    'document.id_card.full_name': 'Albert Hodkiewicz',
    'document.id_card.gender': '673ea478-02f7-4606-b879-af9b400664c6',
    'document.id_card.issued_at': 'b38b2d57-f69a-4667-b3b8-e38574c54462',
    'document.id_card.issuing_country': 'Reunion',
    'document.id_card.issuing_state': 'Ohio',
    'document.id_card.last_name': 'Sporer',
    'document.id_card.nationality': '16ac307a-308c-425d-9dfd-3e4da2a9d17a',
    'document.id_card.postal_code': '3f1e3fc3-2694-4b3f-8fcb-fb3fa7d052ef',
    'document.id_card.ref_number': '8d409f60-62db-4cec-98e2-b68e30b659aa',
    'document.id_card.samba_activity_history_response': 'e777a889-6862-439a-9cd6-5556b22bd4c3',
    'document.id_card.selfie.image': '22342d47-67b9-4317-b1be-f8d008c4e8a7',
    'document.id_card.selfie.mime_type': '29dd0e9f-dc39-4793-9c86-c4bc22ea7e9c',
    'document.id_card.state': 'Montana',
    'document.id_card.us_issuing_state': 'Wyoming',
    'document.passport.address_line1': '9601 Kilback Run Suite 248',
    'document.passport.back.image': 'velit esse in',
    'document.passport.back.mime_type': 'ullamco non in quis sunt',
    'document.passport.city': 'Grimesmouth',
    'document.passport.classified_document_type': 'Duis eu enim Ut proident',
    'document.passport.clave_de_elector': 'laboris',
    'document.passport.curp': 'irure occaecat ut non',
    'document.passport.curp_validation_response': '42cae1fc-ea13-429f-bb68-21413276121c',
    'document.passport.dob': 'adipisicing ipsum enim',
    'document.passport.document_number': 'eu',
    'document.passport.expires_at': 'irure Duis',
    'document.passport.first_name': 'Clinton',
    'document.passport.front.image': 'pariatur aliqua ex eu sunt',
    'document.passport.front.mime_type': 'cillum dolore',
    'document.passport.full_address': '4200 Mariam Gardens Suite 850',
    'document.passport.full_name': 'Laverne Wuckert',
    'document.passport.gender': 'aliqua deserunt dolore aliquip velit',
    'document.passport.issued_at': 'ullamco Lorem et',
    'document.passport.issuing_country': 'Jersey',
    'document.passport.issuing_state': 'Michigan',
    'document.passport.last_name': 'Marks',
    'document.passport.nationality': 'Duis ut sint',
    'document.passport.postal_code': 'consectetur exercitation',
    'document.passport.ref_number': 'pariatur aliqua',
    'document.passport.samba_activity_history_response': 'dolore officia culpa nostrud et',
    'document.passport.selfie.image': 'veniam ad elit sit',
    'document.passport.selfie.mime_type': 'in Duis',
    'document.passport.state': 'South Dakota',
    'document.passport.us_issuing_state': 'Alabama',
    'document.passport_card.address_line1': '5452 Kianna Shoal Suite 752',
    'document.passport_card.back.image': 'reprehenderit commodo ullamco in eiusmod',
    'document.passport_card.back.mime_type': 'sit Lorem est in id',
    'document.passport_card.city': 'Lake Rubye',
    'document.passport_card.classified_document_type': 'cillum esse',
    'document.passport_card.clave_de_elector': 'sint dolore pariatur sit',
    'document.passport_card.curp': 'ea culpa ut reprehenderit',
    'document.passport_card.curp_validation_response': '10bc0e9f-fdaf-4464-b76e-7b203edf1ce2',
    'document.passport_card.dob': 'sint',
    'document.passport_card.document_number': 'sunt culpa aliquip nulla do',
    'document.passport_card.expires_at': 'proident laboris',
    'document.passport_card.first_name': 'Hudson',
    'document.passport_card.front.image': 'eiusmod incididunt ad anim enim',
    'document.passport_card.front.mime_type': 'exercitation',
    'document.passport_card.full_address': '72414 Purdy Isle Apt. 974',
    'document.passport_card.full_name': 'Jacqueline Dicki',
    'document.passport_card.gender': 'dolor adipisicing dolore',
    'document.passport_card.issued_at': 'nostrud voluptate incididunt minim amet',
    'document.passport_card.issuing_country': 'Gambia',
    'document.passport_card.issuing_state': 'Wisconsin',
    'document.passport_card.last_name': 'Gusikowski',
    'document.passport_card.nationality': 'Lorem ullamco commodo enim',
    'document.passport_card.postal_code': 'ex eiusmod officia adipisicing',
    'document.passport_card.ref_number': 'magna',
    'document.passport_card.samba_activity_history_response': 'quis',
    'document.passport_card.selfie.image': 'veniam id magna',
    'document.passport_card.selfie.mime_type': 'sint nisi laborum sed cupidatat',
    'document.passport_card.state': 'Indiana',
    'document.passport_card.us_issuing_state': 'Massachusetts',
    'document.permit.address_line1': '6767 Jackson Walks Apt. 815',
    'document.permit.back.image': 'ea Ut Excepteur',
    'document.permit.back.mime_type': 'sunt sed',
    'document.permit.city': 'Hermannworth',
    'document.permit.classified_document_type': 'adipisicing',
    'document.permit.clave_de_elector': 'anim non irure Lorem proident',
    'document.permit.curp': 'ullamco nisi fugiat aliqua pariatur',
    'document.permit.curp_validation_response': 'd81fd437-9764-41b1-8eb4-fdcfe4f77c31',
    'document.permit.dob': 'reprehenderit culpa qui',
    'document.permit.document_number': 'dolor tempor ea nulla consequat',
    'document.permit.expires_at': 'ea nulla quis',
    'document.permit.first_name': 'Dan',
    'document.permit.front.image': 'culpa dolore enim magna',
    'document.permit.front.mime_type': 'ea nostrud aliqua Excepteur qui',
    'document.permit.full_address': '9693 Shad Ways Suite 475',
    'document.permit.full_name': 'Miss Anna Gislason',
    'document.permit.gender': 'culpa laborum consectetur',
    'document.permit.issued_at': 'elit',
    'document.permit.issuing_country': 'Venezuela',
    'document.permit.issuing_state': 'Arizona',
    'document.permit.last_name': 'Pfeffer',
    'document.permit.nationality': 'quis mollit cupidatat aute',
    'document.permit.postal_code': 'sit occaecat minim esse',
    'document.permit.ref_number': 'Excepteur cupidatat velit',
    'document.permit.samba_activity_history_response': 'sint dolore aute eu',
    'document.permit.selfie.image': 'in officia laboris magna',
    'document.permit.selfie.mime_type': 'anim',
    'document.permit.state': 'Vermont',
    'document.permit.us_issuing_state': 'Michigan',
    'document.proof_of_address.image': '4677 Cumberland Street Suite 131',
    'document.residence_document.address_line1': '4627 Barrows Avenue Suite 391',
    'document.residence_document.back.image': '5907b815-8814-49f1-9c84-e7788fa728f7',
    'document.residence_document.back.mime_type': 'b8248212-be6a-417d-bfa2-6dfa59343262',
    'document.residence_document.city': 'Volkmanberg',
    'document.residence_document.classified_document_type': '26e64748-302e-4c3f-9913-aed0c4880109',
    'document.residence_document.clave_de_elector': '956b4d8c-1d52-4d1c-aa95-60c62481ce9c',
    'document.residence_document.curp': 'f526ac6c-ca06-4eba-ab76-9d79b3aea5e3',
    'document.residence_document.curp_validation_response': 'bc9c9136-9ec1-44fd-a235-ef380091bca5',
    'document.residence_document.dob': '228c053d-193f-4f88-a4b8-d2457118a250',
    'document.residence_document.document_number': 'a0154a61-a32f-45a2-97fc-a85337aa6c78',
    'document.residence_document.expires_at': 'e1ef266a-b840-41f1-b4da-e96a6d3b6807',
    'document.residence_document.first_name': 'Marisol',
    'document.residence_document.front.image': '9f8f8915-5bf5-4793-9c48-361906e6d33c',
    'document.residence_document.front.mime_type': 'feb22ef2-3c76-45b5-b27f-a61e5b67be2d',
    'document.residence_document.full_address': '72465 McKenzie Crest Apt. 680',
    'document.residence_document.full_name': 'Miss Diane Kohler PhD',
    'document.residence_document.gender': '876c012c-450e-4176-ab2b-c5eeffb7d0ac',
    'document.residence_document.issued_at': 'f2f1d2db-929e-4dbb-a16f-4be76d5f9ab3',
    'document.residence_document.issuing_country': 'Germany',
    'document.residence_document.issuing_state': 'Connecticut',
    'document.residence_document.last_name': 'Larson',
    'document.residence_document.nationality': 'a2e7647f-9b57-4494-a5b0-84f6aba65a82',
    'document.residence_document.postal_code': 'b6ce8fc2-4c4b-4b88-bfef-71570bb98270',
    'document.residence_document.ref_number': 'dc8c9e97-5830-48c7-86a9-2a4759fa2cec',
    'document.residence_document.samba_activity_history_response': '41e2259e-fbef-4f96-903a-cb0fb0a051a2',
    'document.residence_document.selfie.image': '4eb27b1d-da01-4801-a5ec-2c34eb0553d5',
    'document.residence_document.selfie.mime_type': 'fb61b9ef-b887-4cac-8694-176108c5a4a5',
    'document.residence_document.state': 'Pennsylvania',
    'document.residence_document.us_issuing_state': 'Louisiana',
    'document.ssn_card.image': 'incididunt commodo dolor quis ad',
    'document.visa.address_line1': '2548 4th Avenue Suite 860',
    'document.visa.back.image': 'Lorem',
    'document.visa.back.mime_type': 'occaecat sed sit pariatur',
    'document.visa.city': 'Fort Theodoreborough',
    'document.visa.classified_document_type': 'in ex aute elit',
    'document.visa.clave_de_elector': 'sunt laboris aliquip labore proident',
    'document.visa.curp': 'sunt dolor sit ad dolore',
    'document.visa.curp_validation_response': '6bc25865-417a-411b-8bc9-4fc921114bcd',
    'document.visa.dob': 'labore aliquip laboris sit',
    'document.visa.document_number': 'et sint nisi',
    'document.visa.expires_at': 'officia elit Duis',
    'document.visa.first_name': 'Felicia',
    'document.visa.front.image': 'Lorem sunt et nostrud Duis',
    'document.visa.front.mime_type': 'ex',
    'document.visa.full_address': '22828 E Grand Avenue Apt. 573',
    'document.visa.full_name': 'Eloise Quigley',
    'document.visa.gender': 'consequat dolore ipsum',
    'document.visa.issued_at': 'dolor Excepteur',
    'document.visa.issuing_country': 'Egypt',
    'document.visa.issuing_state': 'Mississippi',
    'document.visa.last_name': 'McClure',
    'document.visa.nationality': 'sit magna',
    'document.visa.postal_code': 'exercitation sed consequat ea amet',
    'document.visa.ref_number': 'amet',
    'document.visa.samba_activity_history_response': 'sed',
    'document.visa.selfie.image': 'reprehenderit proident',
    'document.visa.selfie.mime_type': 'adipisicing',
    'document.visa.state': 'Kansas',
    'document.visa.us_issuing_state': 'Maryland',
    'document.voter_identification.address_line1': '132 Prospect Avenue Suite 794',
    'document.voter_identification.back.image': 'fc3f09e9-0693-4c30-9dfb-3b8c00d55236',
    'document.voter_identification.back.mime_type': 'c7450d05-c26b-4d7c-977a-97481bab3d07',
    'document.voter_identification.city': 'Aramouth',
    'document.voter_identification.classified_document_type': 'd959bab9-ebc6-42d8-bd1d-f96600889be7',
    'document.voter_identification.clave_de_elector': '8b5f8c2a-0700-4bcc-842b-012e06b09160',
    'document.voter_identification.curp': 'f6a9c084-26f5-4569-a86f-41c354a4c3eb',
    'document.voter_identification.curp_validation_response': 'be4c7835-2f25-42c1-b9cc-545541c7757b',
    'document.voter_identification.dob': '3b11de5d-c990-4bf0-965c-f46983f26f7c',
    'document.voter_identification.document_number': '3947b5ad-89f7-4041-a4d3-d15785d18b37',
    'document.voter_identification.expires_at': '8c6571af-4da6-46f4-89a1-30aa32738c20',
    'document.voter_identification.first_name': 'Malinda',
    'document.voter_identification.front.image': 'ffc2308f-ab69-4545-bc59-e89197903443',
    'document.voter_identification.front.mime_type': 'a14d8dbb-3cf4-4885-a889-1c17a7f3ab94',
    'document.voter_identification.full_address': '554 Hyatt Knoll Apt. 553',
    'document.voter_identification.full_name': 'Alfred Morissette',
    'document.voter_identification.gender': 'e2e9a432-0519-4081-abac-8b25b46cbf7b',
    'document.voter_identification.issued_at': '15803661-4ca7-4390-b887-2ebbfc84d5d5',
    'document.voter_identification.issuing_country': 'Brazil',
    'document.voter_identification.issuing_state': 'New Jersey',
    'document.voter_identification.last_name': 'Donnelly',
    'document.voter_identification.nationality': '74274cef-872d-40df-b275-d2f7b34b4cbe',
    'document.voter_identification.postal_code': '9b1417f0-71f5-4ce7-a917-a744b0860440',
    'document.voter_identification.ref_number': 'd6b84bce-2c8f-47dd-aa93-dd246936af11',
    'document.voter_identification.samba_activity_history_response': '2dc7a7f5-dd78-492d-83a9-4db1c2b4efd1',
    'document.voter_identification.selfie.image': '66b34d79-d780-4af1-a678-129a2096dde1',
    'document.voter_identification.selfie.mime_type': '69d3701d-cdb4-40c9-a91f-ccf447329e44',
    'document.voter_identification.state': 'Alaska',
    'document.voter_identification.us_issuing_state': 'North Carolina',
    'id.address_line1': '62748 Hammes Trafficway Suite 286',
    'id.address_line2': '51023 Lubowitz Glens Apt. 364',
    'id.citizenships': ['CA'],
    'id.city': 'Fort Jordyn',
    'id.country': 'Dominica',
    'id.dob': 'bbfc5c85-9d68-4e8d-aab4-97a1e31f924e',
    'id.drivers_license_number': '440442df-aefc-42dc-8af8-55c84dc2dce8',
    'id.drivers_license_state': 'Louisiana',
    'id.email': 'maurice61@gmail.com',
    'id.first_name': 'Macie',
    'id.itin': '94432aee-a432-45fc-a294-18b72de39343',
    'id.last_name': 'Bednar',
    'id.middle_name': 'Mrs. Ana McLaughlin',
    'id.nationality': 'ad6cd182-baab-4299-b813-ac3a4eb5b43f',
    'id.phone_number': '+19105451725',
    'id.ssn4': 'b2585782-03bd-449b-aa20-2aabafc88cc2',
    'id.ssn9': '54f437e2-c61d-4724-9f13-1428f45ee34d',
    'id.state': 'Alabama',
    'id.us_legal_status': '3777cccd-bd47-4d74-8964-8fec88e05c45',
    'id.us_tax_id': 'c580ff1a-79c6-44ca-b692-e3839345f200',
    'id.visa_expiration_date': '2e71c89f-547e-4946-8cc9-c90e8f748717',
    'id.visa_kind': 'd72976a8-0cc8-4350-823c-4d04fee6052b',
    'id.zip': '52756',
    'investor_profile.annual_income': 'aliqua',
    'investor_profile.brokerage_firm_employer': 'mollit',
    'investor_profile.declarations': ['senior_political_figure'],
    'investor_profile.employer': 'ullamco elit cupidatat sed',
    'investor_profile.employment_status': 'eiusmod mollit nisi',
    'investor_profile.family_member_names': ['Doyle Abshire'],
    'investor_profile.funding_sources': ['business_income', 'investments'],
    'investor_profile.investment_goals': ['growth', 'income', 'preserve_capital'],
    'investor_profile.net_worth': 'mollit non',
    'investor_profile.occupation': 'proident reprehenderit est',
    'investor_profile.political_organization': 'ullamco dolor reprehenderit tempor dolor',
    'investor_profile.risk_tolerance': 'pariatur ut aliquip',
    'investor_profile.senior_executive_symbols': ['minim Lorem fugiat'],
  },
  op: 'create',
  ownershipStake: -98833602,
  uuid: 'd393392a-1bb1-4389-a70e-1b4a749e0a30',
};
export const hosted_BatchHostedBusinessOwnerRequestCreate: BatchHostedBusinessOwnerRequestCreate = {
  data: {
    'bank.*.account_type': 'non sed',
    'bank.*.ach_account_id': '5896c6e5-0c53-4977-a674-00c26e81b84a',
    'bank.*.ach_account_number': 'aliquip sint ullamco ea Lorem',
    'bank.*.ach_routing_number': 'sit sunt ad aliqua',
    'bank.*.fingerprint': 'irure Ut anim esse',
    'bank.*.name': 'Miss Marcia Hagenes',
    'card.*.billing_address.country': '18845 Main Street N Suite 809',
    'card.*.billing_address.zip': '578 Ash Street Suite 730',
    'card.*.cvc': 'cupidatat Duis id anim',
    'card.*.expiration': 'voluptate',
    'card.*.expiration_month': 'in dolore id',
    'card.*.expiration_year': 'commodo aliquip ea dolore Duis',
    'card.*.fingerprint': 'dolore sunt elit aliqua',
    'card.*.issuer': 'anim enim incididunt Lorem',
    'card.*.name': 'Dr. Lucas Towne',
    'card.*.number': 'mollit sint sunt aute nulla',
    'card.*.number_last4': 'sit voluptate in proident commodo',
    'custom.*': 'ea enim laborum ex dolore',
    'document.custom.*': 'eu Duis sed',
    'document.drivers_license.address_line1': '55114 Doyle Roads Suite 719',
    'document.drivers_license.back.image': 'cupidatat adipisicing in ipsum do',
    'document.drivers_license.back.mime_type': 'quis',
    'document.drivers_license.city': 'Zulauffurt',
    'document.drivers_license.classified_document_type': 'fugiat eiusmod',
    'document.drivers_license.clave_de_elector': 'ullamco quis fugiat nulla',
    'document.drivers_license.curp': 'fugiat non nulla',
    'document.drivers_license.curp_validation_response': 'fc3e4509-e374-4073-b5ad-b4cb54000590',
    'document.drivers_license.dob': 'quis et',
    'document.drivers_license.document_number': 'irure sunt',
    'document.drivers_license.expires_at': 'magna',
    'document.drivers_license.first_name': 'Isidro',
    'document.drivers_license.front.image': 'cupidatat nulla',
    'document.drivers_license.front.mime_type': 'aliqua commodo mollit sed sunt',
    'document.drivers_license.full_address': '118 Lake Street Suite 231',
    'document.drivers_license.full_name': "Amber O'Conner Sr.",
    'document.drivers_license.gender': 'id',
    'document.drivers_license.issued_at': 'dolore occaecat ad in in',
    'document.drivers_license.issuing_country': 'Puerto Rico',
    'document.drivers_license.issuing_state': 'Wisconsin',
    'document.drivers_license.last_name': 'Reilly',
    'document.drivers_license.nationality': 'dolore',
    'document.drivers_license.postal_code': 'sit sed Duis',
    'document.drivers_license.ref_number': 'culpa commodo eiusmod consectetur non',
    'document.drivers_license.samba_activity_history_response': 'eiusmod cillum et dolore adipisicing',
    'document.drivers_license.selfie.image': 'sint fugiat irure dolor',
    'document.drivers_license.selfie.mime_type': 'pariatur voluptate fugiat',
    'document.drivers_license.state': 'Rhode Island',
    'document.drivers_license.us_issuing_state': 'Vermont',
    'document.finra_compliance_letter': 'ut dolor amet enim',
    'document.id_card.address_line1': '37960 Helene Valleys Suite 103',
    'document.id_card.back.image': '36df30e9-6d97-402c-b07e-716f45cd4360',
    'document.id_card.back.mime_type': '42fb32f0-4688-4112-a4f3-ca8a986828e2',
    'document.id_card.city': 'Bayerview',
    'document.id_card.classified_document_type': '4a7f1854-0f57-4db0-b1be-09231c1cd907',
    'document.id_card.clave_de_elector': '6e444baf-43e5-49b0-9b17-c4a12246748f',
    'document.id_card.curp': 'e457a80e-76af-4f2f-9c4d-d9c712989194',
    'document.id_card.curp_validation_response': '69f1a80e-555b-4a38-83dc-b31a2fd4d6c9',
    'document.id_card.dob': '8ff036fc-1dc3-41e6-9a45-19f6eff61d54',
    'document.id_card.document_number': 'ec22cd28-c63e-4e70-95f0-5c1291334941',
    'document.id_card.expires_at': '4529a8ca-8115-4e85-a9bd-02cdc51c2abf',
    'document.id_card.first_name': 'Stephen',
    'document.id_card.front.image': 'fa15506f-4111-4e22-8592-49d9301bc564',
    'document.id_card.front.mime_type': '3cbced56-d105-42dc-a622-07749960b4e4',
    'document.id_card.full_address': '437 W Central Avenue Apt. 757',
    'document.id_card.full_name': 'Jeffery Jenkins',
    'document.id_card.gender': 'fa134078-f4f4-46dd-8440-f6e6219f9c37',
    'document.id_card.issued_at': '3a3fab50-8028-44b2-bc92-de10f91094ae',
    'document.id_card.issuing_country': 'Northern Mariana Islands',
    'document.id_card.issuing_state': 'Pennsylvania',
    'document.id_card.last_name': 'Mertz',
    'document.id_card.nationality': '89703ff5-ebd0-4b1c-a744-d803b51aba5e',
    'document.id_card.postal_code': 'd8fca35d-e1c1-442a-b8b0-bac7451cdd92',
    'document.id_card.ref_number': 'dabf0490-3b7e-4f9d-a06c-6de074ae39eb',
    'document.id_card.samba_activity_history_response': '2b2db70b-efb3-4b90-8b24-4d47a2057516',
    'document.id_card.selfie.image': '8bda2fcf-61a2-4096-99be-d426050a80e4',
    'document.id_card.selfie.mime_type': '9bfb4738-45fe-4f7e-a552-50738b4f43d3',
    'document.id_card.state': 'Massachusetts',
    'document.id_card.us_issuing_state': 'Ohio',
    'document.passport.address_line1': '68596 S College Street Apt. 314',
    'document.passport.back.image': 'dolore et non',
    'document.passport.back.mime_type': 'dolor',
    'document.passport.city': 'Fort Shanelburgh',
    'document.passport.classified_document_type': 'consectetur officia aliquip mollit consequat',
    'document.passport.clave_de_elector': 'aute adipisicing laboris',
    'document.passport.curp': 'sunt in cillum sint culpa',
    'document.passport.curp_validation_response': '3636c89b-cc4d-40a8-bd7e-a4cdaa6a4582',
    'document.passport.dob': 'qui',
    'document.passport.document_number': 'Lorem aliquip',
    'document.passport.expires_at': 'deserunt non ad',
    'document.passport.first_name': 'Savion',
    'document.passport.front.image': 'id',
    'document.passport.front.mime_type': 'culpa',
    'document.passport.full_address': '824 Harber Burg Apt. 139',
    'document.passport.full_name': 'Sandy Becker DVM',
    'document.passport.gender': 'voluptate',
    'document.passport.issued_at': 'nisi est adipisicing do',
    'document.passport.issuing_country': 'Cyprus',
    'document.passport.issuing_state': 'Delaware',
    'document.passport.last_name': 'Stoltenberg',
    'document.passport.nationality': 'consequat dolore',
    'document.passport.postal_code': 'aliqua sunt Ut in',
    'document.passport.ref_number': 'ut aliquip irure pariatur enim',
    'document.passport.samba_activity_history_response': 'nisi Ut',
    'document.passport.selfie.image': 'aliqua ea ullamco sint id',
    'document.passport.selfie.mime_type': 'laboris consequat Duis',
    'document.passport.state': 'North Dakota',
    'document.passport.us_issuing_state': 'West Virginia',
    'document.passport_card.address_line1': '1255 Kertzmann Station Apt. 958',
    'document.passport_card.back.image': 'fugiat adipisicing irure in sint',
    'document.passport_card.back.mime_type': 'occaecat irure mollit anim do',
    'document.passport_card.city': 'Terencefield',
    'document.passport_card.classified_document_type': 'sunt',
    'document.passport_card.clave_de_elector': 'aute anim culpa consequat id',
    'document.passport_card.curp': 'Ut cillum laborum',
    'document.passport_card.curp_validation_response': 'af89519b-63d4-4547-b38c-b46e9c4ad532',
    'document.passport_card.dob': 'ut sit',
    'document.passport_card.document_number': 'amet ipsum deserunt Lorem',
    'document.passport_card.expires_at': 'id pariatur qui cupidatat',
    'document.passport_card.first_name': 'Chase',
    'document.passport_card.front.image': 'eiusmod',
    'document.passport_card.front.mime_type': 'ut eu ipsum eiusmod aute',
    'document.passport_card.full_address': '592 Williamson Ridge Suite 446',
    'document.passport_card.full_name': 'Yvonne Abshire',
    'document.passport_card.gender': 'id consectetur tempor',
    'document.passport_card.issued_at': 'laborum voluptate',
    'document.passport_card.issuing_country': 'Benin',
    'document.passport_card.issuing_state': 'Utah',
    'document.passport_card.last_name': 'Cummings',
    'document.passport_card.nationality': 'Ut',
    'document.passport_card.postal_code': 'veniam aute qui eiusmod',
    'document.passport_card.ref_number': 'ut dolore id',
    'document.passport_card.samba_activity_history_response': 'nisi nulla Excepteur cupidatat',
    'document.passport_card.selfie.image': 'exercitation ut',
    'document.passport_card.selfie.mime_type': 'consequat fugiat laboris aliqua',
    'document.passport_card.state': 'Hawaii',
    'document.passport_card.us_issuing_state': 'South Dakota',
    'document.permit.address_line1': '9888 Jeremy Groves Suite 210',
    'document.permit.back.image': 'Duis elit Ut cupidatat voluptate',
    'document.permit.back.mime_type': 'cillum velit',
    'document.permit.city': 'Deloresshire',
    'document.permit.classified_document_type': 'dolore elit',
    'document.permit.clave_de_elector': 'laboris',
    'document.permit.curp': 'consequat',
    'document.permit.curp_validation_response': '5b348279-65b8-49f1-8d56-4f92a76b637c',
    'document.permit.dob': 'eiusmod Excepteur',
    'document.permit.document_number': 'exercitation',
    'document.permit.expires_at': 'sit qui id sint adipisicing',
    'document.permit.first_name': 'Pascale',
    'document.permit.front.image': 'consectetur',
    'document.permit.front.mime_type': 'velit officia qui',
    'document.permit.full_address': '355 W Church Street Suite 420',
    'document.permit.full_name': 'Amos Collins',
    'document.permit.gender': 'id aliquip ex eu',
    'document.permit.issued_at': 'consequat in magna occaecat',
    'document.permit.issuing_country': 'Seychelles',
    'document.permit.issuing_state': 'Montana',
    'document.permit.last_name': 'Weimann',
    'document.permit.nationality': 'sunt enim in',
    'document.permit.postal_code': 'dolor in aliqua laborum',
    'document.permit.ref_number': 'qui',
    'document.permit.samba_activity_history_response': 'ad incididunt',
    'document.permit.selfie.image': 'reprehenderit',
    'document.permit.selfie.mime_type': 'id tempor est quis',
    'document.permit.state': 'New York',
    'document.permit.us_issuing_state': 'South Dakota',
    'document.proof_of_address.image': '537 Lincoln Avenue Apt. 421',
    'document.residence_document.address_line1': '61014 Connelly Way Suite 944',
    'document.residence_document.back.image': 'cff72b71-9016-4913-b8fb-e9a58be1dfef',
    'document.residence_document.back.mime_type': '761fd059-98b9-493b-9921-23393c4de15b',
    'document.residence_document.city': 'East Mayboro',
    'document.residence_document.classified_document_type': 'c6dcb3f8-e019-4b06-aa8f-47a90dc50ec0',
    'document.residence_document.clave_de_elector': '19a075fe-ce0c-49db-8946-cb4c273a92e8',
    'document.residence_document.curp': '5dbe06ce-3d26-46e7-9b14-97e399cbd54b',
    'document.residence_document.curp_validation_response': '16142b7e-0964-4517-8823-c06a6fd6a61e',
    'document.residence_document.dob': '145d50c4-d773-478c-ac7f-195d670e4fc0',
    'document.residence_document.document_number': '9f267963-2c90-405f-a3dd-88b404821bb6',
    'document.residence_document.expires_at': '27ba3f5a-e4a6-4567-aa1e-49d5fa6c0ad5',
    'document.residence_document.first_name': 'Lawson',
    'document.residence_document.front.image': '23c1501d-9aa4-492e-9a3d-82af61caf444',
    'document.residence_document.front.mime_type': '82d0676e-d5c6-4290-85c4-4b8dc5e8a939',
    'document.residence_document.full_address': '25300 S Lincoln Street Apt. 847',
    'document.residence_document.full_name': 'Alan Kutch',
    'document.residence_document.gender': 'e508d03a-1fd7-48f4-8a39-7b3ae23efe1a',
    'document.residence_document.issued_at': '89963f60-9e6e-45db-9e6b-e3fc0b461cbe',
    'document.residence_document.issuing_country': 'Bouvet Island',
    'document.residence_document.issuing_state': 'Maine',
    'document.residence_document.last_name': 'Turcotte',
    'document.residence_document.nationality': 'b8a3a40a-2444-49e6-ac22-ea96fe5a53ef',
    'document.residence_document.postal_code': 'f115955f-f6a9-4da8-ae9e-652d8737ab70',
    'document.residence_document.ref_number': '60bb1012-5149-4508-9307-61b430efd607',
    'document.residence_document.samba_activity_history_response': 'a522f733-2e1c-4b2a-b62e-dc3c8e773a57',
    'document.residence_document.selfie.image': '459878b8-0fb6-4f92-9662-db42723842fa',
    'document.residence_document.selfie.mime_type': 'b5c37cd9-23f6-4ced-8a51-9e0f284c57ea',
    'document.residence_document.state': 'California',
    'document.residence_document.us_issuing_state': 'Wisconsin',
    'document.ssn_card.image': 'cupidatat dolore',
    'document.visa.address_line1': '755 N Lincoln Street Apt. 283',
    'document.visa.back.image': 'magna consectetur est',
    'document.visa.back.mime_type': 'irure in qui commodo',
    'document.visa.city': 'Mitchellview',
    'document.visa.classified_document_type': 'non',
    'document.visa.clave_de_elector': 'pariatur aute cupidatat',
    'document.visa.curp': 'Duis',
    'document.visa.curp_validation_response': 'bb0d6563-ebab-4783-9b76-15fb5b8830e8',
    'document.visa.dob': 'exercitation',
    'document.visa.document_number': 'labore amet qui',
    'document.visa.expires_at': 'proident velit ut laborum',
    'document.visa.first_name': 'Liam',
    'document.visa.front.image': 'laboris',
    'document.visa.front.mime_type': 'exercitation non nulla laborum pariatur',
    'document.visa.full_address': '6418 Delores Rest Apt. 608',
    'document.visa.full_name': 'Sean Cormier',
    'document.visa.gender': 'laborum veniam eu qui',
    'document.visa.issued_at': 'proident consectetur commodo',
    'document.visa.issuing_country': 'Guam',
    'document.visa.issuing_state': 'Vermont',
    'document.visa.last_name': 'Hyatt',
    'document.visa.nationality': 'tempor incididunt adipisicing in',
    'document.visa.postal_code': 'laborum aute mollit',
    'document.visa.ref_number': 'sint id consequat',
    'document.visa.samba_activity_history_response': 'magna ut Excepteur ipsum',
    'document.visa.selfie.image': 'dolor minim qui',
    'document.visa.selfie.mime_type': 'in labore velit dolor',
    'document.visa.state': 'Idaho',
    'document.visa.us_issuing_state': 'California',
    'document.voter_identification.address_line1': '5946 Rollin Park Suite 800',
    'document.voter_identification.back.image': 'b39b9d47-6bf3-4a46-a642-dce652db58c0',
    'document.voter_identification.back.mime_type': '5f4f446c-c0c1-436d-8abb-71aaf25eceb1',
    'document.voter_identification.city': 'Fort Lynn',
    'document.voter_identification.classified_document_type': 'aa13be99-9c61-4977-b5f6-836c209d0f7a',
    'document.voter_identification.clave_de_elector': '42df7d57-c5a3-4218-a86d-67b9bfe81133',
    'document.voter_identification.curp': '80372f37-fb2d-4194-9048-cebbda5be8cc',
    'document.voter_identification.curp_validation_response': '1e8313e9-8f40-49c1-afa6-28354045d6cc',
    'document.voter_identification.dob': 'bda60548-b33d-420e-bd96-5bfca10ffd1f',
    'document.voter_identification.document_number': 'bc68f9a1-2997-4587-9653-c92660e80666',
    'document.voter_identification.expires_at': '2d8e3758-52b4-472c-a609-65b6a98cb945',
    'document.voter_identification.first_name': 'Gerda',
    'document.voter_identification.front.image': '13946eeb-93ca-4e07-a60c-876a358d5154',
    'document.voter_identification.front.mime_type': '51b4114f-d368-45cc-9b02-29ca3f642d18',
    'document.voter_identification.full_address': '78896 Bednar Ridges Suite 228',
    'document.voter_identification.full_name': 'Earl McKenzie',
    'document.voter_identification.gender': '6739c6a5-91fe-496b-93eb-eb6d15afb280',
    'document.voter_identification.issued_at': 'c4d03615-bf54-4cb8-9440-7fb601dc29c5',
    'document.voter_identification.issuing_country': 'Marshall Islands',
    'document.voter_identification.issuing_state': 'Nebraska',
    'document.voter_identification.last_name': 'Smith',
    'document.voter_identification.nationality': '6101eafc-ee8c-4b70-b4df-9585615f75ef',
    'document.voter_identification.postal_code': '75e317a0-002a-4aea-97d4-3d4f10ee220c',
    'document.voter_identification.ref_number': '354f110d-9fc1-4e41-908a-30c43b594d8f',
    'document.voter_identification.samba_activity_history_response': '36d656c9-9e32-4ea5-b27c-693909d886bc',
    'document.voter_identification.selfie.image': '1642a526-d879-4b70-ac0d-6f83e172d29b',
    'document.voter_identification.selfie.mime_type': '19039036-6dc4-4b34-8b95-c9bd65b9f205',
    'document.voter_identification.state': 'Alaska',
    'document.voter_identification.us_issuing_state': 'Nebraska',
    'id.address_line1': '806 E Oak Street Apt. 247',
    'id.address_line2': '41965 Third Street Apt. 999',
    'id.citizenships': ['GG', 'IL', 'WS'],
    'id.city': 'Manteborough',
    'id.country': 'Nicaragua',
    'id.dob': 'c9237c82-c15d-46ce-a786-241b1e08a6ba',
    'id.drivers_license_number': '7d8f0c57-26be-440b-9a49-790d68b5d083',
    'id.drivers_license_state': 'Indiana',
    'id.email': 'christian_feil72@gmail.com',
    'id.first_name': 'Shyann',
    'id.itin': 'a2a2fea5-69d2-4b8d-8fba-faf4120f797d',
    'id.last_name': 'Kreiger',
    'id.middle_name': 'Dr. Blake Farrell',
    'id.nationality': '548cdeff-5245-45df-afb0-40f6ec0532e4',
    'id.phone_number': '+17438597548',
    'id.ssn4': 'bbd643b7-8439-40a1-8d22-d87cfbd010f4',
    'id.ssn9': '6bbb3f9f-7657-46c7-a19a-8748713a7786',
    'id.state': 'Georgia',
    'id.us_legal_status': 'a58d9006-8623-449f-ae40-dc8cc0a6c7d7',
    'id.us_tax_id': '92d268d7-4ac4-43a9-98a0-a24e2da9da06',
    'id.visa_expiration_date': '88511507-ce2d-4e49-9b3d-8d7be0376e6a',
    'id.visa_kind': 'db109c79-cc0b-415b-ad7b-0b074c4c6fe4',
    'id.zip': '54583',
    'investor_profile.annual_income': 'in incididunt',
    'investor_profile.brokerage_firm_employer': 'id',
    'investor_profile.declarations': ['senior_political_figure', 'senior_executive', 'senior_executive'],
    'investor_profile.employer': 'cupidatat',
    'investor_profile.employment_status': 'ea officia',
    'investor_profile.family_member_names': ['sunt cupidatat dolor', 'in dolore culpa', 'magna do'],
    'investor_profile.funding_sources': ['investments', 'investments', 'employment_income'],
    'investor_profile.investment_goals': ['preserve_capital', 'speculation', 'other'],
    'investor_profile.net_worth': 'pariatur consectetur in',
    'investor_profile.occupation': 'ea anim ad irure pariatur',
    'investor_profile.political_organization': 'proident consectetur deserunt',
    'investor_profile.risk_tolerance': 'dolor commodo consequat in',
    'investor_profile.senior_executive_symbols': ['cillum', 'sit eu nulla Duis', 'tempor pariatur ut'],
  },
  op: 'create',
  ownershipStake: -39183789,
  uuid: '41c9d9a2-56a6-4c54-a411-d7c9869d9e2b',
};
export const hosted_BatchHostedBusinessOwnerRequestDelete: BatchHostedBusinessOwnerRequestDelete = {
  op: 'delete',
  uuid: '239d47ea-9137-4702-9c4b-e0c0c8883741',
};
export const hosted_BatchHostedBusinessOwnerRequestUpdate: BatchHostedBusinessOwnerRequestUpdate = {
  data: {
    'bank.*.account_type': 'dolore occaecat',
    'bank.*.ach_account_id': '3cf7b5b2-eb06-47ef-9dba-406e4722b823',
    'bank.*.ach_account_number': 'sit esse culpa deserunt',
    'bank.*.ach_routing_number': 'eiusmod',
    'bank.*.fingerprint': 'occaecat dolore',
    'bank.*.name': 'Isaac Rohan-Yost',
    'card.*.billing_address.country': '476 10th Street Suite 279',
    'card.*.billing_address.zip': '6191 Koepp Forks Suite 308',
    'card.*.cvc': 'minim id',
    'card.*.expiration': 'ut',
    'card.*.expiration_month': 'sunt id aliqua',
    'card.*.expiration_year': 'dolor in exercitation culpa',
    'card.*.fingerprint': 'et proident',
    'card.*.issuer': 'laboris dolor sed eiusmod irure',
    'card.*.name': 'Lula Mayer V',
    'card.*.number': 'quis sint',
    'card.*.number_last4': 'ut',
    'custom.*': 'exercitation',
    'document.custom.*': 'commodo',
    'document.drivers_license.address_line1': '8688 Block Parks Apt. 213',
    'document.drivers_license.back.image': 'in occaecat sunt elit irure',
    'document.drivers_license.back.mime_type': 'commodo do dolore enim',
    'document.drivers_license.city': 'South Dion',
    'document.drivers_license.classified_document_type': 'aute in dolore',
    'document.drivers_license.clave_de_elector': 'in',
    'document.drivers_license.curp': 'cupidatat',
    'document.drivers_license.curp_validation_response': 'a5e770d2-ab0c-48ac-8ea6-d0bf8f643372',
    'document.drivers_license.dob': 'Excepteur nulla est amet magna',
    'document.drivers_license.document_number': 'in',
    'document.drivers_license.expires_at': 'aliquip elit proident',
    'document.drivers_license.first_name': 'Savanna',
    'document.drivers_license.front.image': 'consectetur veniam minim Lorem dolor',
    'document.drivers_license.front.mime_type': 'do culpa ipsum',
    'document.drivers_license.full_address': '319 Hirthe Ford Suite 532',
    'document.drivers_license.full_name': 'Iris Shanahan',
    'document.drivers_license.gender': 'non ea irure',
    'document.drivers_license.issued_at': 'nostrud',
    'document.drivers_license.issuing_country': 'Angola',
    'document.drivers_license.issuing_state': 'Minnesota',
    'document.drivers_license.last_name': 'Borer',
    'document.drivers_license.nationality': 'ex veniam dolore',
    'document.drivers_license.postal_code': 'labore dolor nulla ut eiusmod',
    'document.drivers_license.ref_number': 'aliqua',
    'document.drivers_license.samba_activity_history_response': 'enim qui voluptate occaecat',
    'document.drivers_license.selfie.image': 'velit enim Excepteur',
    'document.drivers_license.selfie.mime_type': 'laborum est',
    'document.drivers_license.state': 'Massachusetts',
    'document.drivers_license.us_issuing_state': 'New York',
    'document.finra_compliance_letter': 'cupidatat nulla magna',
    'document.id_card.address_line1': '444 Durgan Springs Apt. 428',
    'document.id_card.back.image': '1fad2696-9d51-425a-826b-423e225509c6',
    'document.id_card.back.mime_type': '47de0690-ee60-468c-95cf-9b8ec48a1ff6',
    'document.id_card.city': 'North Fridatown',
    'document.id_card.classified_document_type': 'b290d87a-486e-457c-907c-580a9246c5cc',
    'document.id_card.clave_de_elector': '05e1e4dd-9b04-48ea-b559-185f521a6ef2',
    'document.id_card.curp': 'b6907af3-231a-4f72-86d7-ebb9cafcab44',
    'document.id_card.curp_validation_response': '25444256-00d6-4c9c-85fd-8934e5ea8b65',
    'document.id_card.dob': '86285868-e068-4cb7-b1d5-6dde2a59f323',
    'document.id_card.document_number': '269dcdd7-315a-4ec5-acd4-f0fb8d23252c',
    'document.id_card.expires_at': '2374d4d0-01d2-469b-a48a-083a35d87116',
    'document.id_card.first_name': 'Gordon',
    'document.id_card.front.image': '033c1156-6eda-4232-a3e3-ec722dfa1d1d',
    'document.id_card.front.mime_type': '58b29fde-1bcf-4ed1-9040-4c4d6ec61ff0',
    'document.id_card.full_address': '49425 State Road Apt. 123',
    'document.id_card.full_name': 'Jill Nicolas',
    'document.id_card.gender': 'dd95d81c-8e0f-419f-9955-5c979d515926',
    'document.id_card.issued_at': '10e3a707-4f21-4c04-b248-47356d027ae7',
    'document.id_card.issuing_country': 'Guinea-Bissau',
    'document.id_card.issuing_state': 'Washington',
    'document.id_card.last_name': 'Barrows-Tremblay',
    'document.id_card.nationality': '09b8300e-3e34-4b15-9b4f-d01bff72cbdb',
    'document.id_card.postal_code': '7d81dd7f-7c53-46af-9849-b75d8fffcf20',
    'document.id_card.ref_number': '003777c0-118f-447f-99b9-0c39f977c7a9',
    'document.id_card.samba_activity_history_response': 'a3651a88-b822-4e97-a395-def98ed9f6c4',
    'document.id_card.selfie.image': '2d2f46f2-e06d-43ba-8b18-eb7cbe92f4b3',
    'document.id_card.selfie.mime_type': 'bad9efc4-334b-4088-b7c4-0fc00dbffbce',
    'document.id_card.state': 'Iowa',
    'document.id_card.us_issuing_state': 'Maryland',
    'document.passport.address_line1': '618 Thalia Creek Apt. 330',
    'document.passport.back.image': 'cillum esse',
    'document.passport.back.mime_type': 'occaecat aliquip in Excepteur velit',
    'document.passport.city': 'Hyattstead',
    'document.passport.classified_document_type': 'consequat ipsum qui',
    'document.passport.clave_de_elector': 'in adipisicing dolor nulla',
    'document.passport.curp': 'Duis consequat dolore id',
    'document.passport.curp_validation_response': 'a34a4ebb-247b-42db-b8be-8795efcec544',
    'document.passport.dob': 'ut ea tempor non',
    'document.passport.document_number': 'ullamco',
    'document.passport.expires_at': 'laborum pariatur labore adipisicing',
    'document.passport.first_name': 'Briana',
    'document.passport.front.image': 'mollit',
    'document.passport.front.mime_type': 'aliqua aute magna',
    'document.passport.full_address': '4034 Cathrine Greens Apt. 328',
    'document.passport.full_name': 'Yolanda Gleason',
    'document.passport.gender': 'consequat',
    'document.passport.issued_at': 'nisi do commodo non ipsum',
    'document.passport.issuing_country': 'Philippines',
    'document.passport.issuing_state': 'California',
    'document.passport.last_name': 'Waters',
    'document.passport.nationality': 'dolore cillum ad',
    'document.passport.postal_code': 'officia elit dolore',
    'document.passport.ref_number': 'ullamco sed laboris nisi',
    'document.passport.samba_activity_history_response': 'eu',
    'document.passport.selfie.image': 'veniam',
    'document.passport.selfie.mime_type': 'reprehenderit occaecat in',
    'document.passport.state': 'Oregon',
    'document.passport.us_issuing_state': 'Colorado',
    'document.passport_card.address_line1': '25555 Franey Lake Suite 882',
    'document.passport_card.back.image': 'ex eu in in id',
    'document.passport_card.back.mime_type': 'in',
    'document.passport_card.city': 'Port Karson',
    'document.passport_card.classified_document_type': 'eu velit reprehenderit',
    'document.passport_card.clave_de_elector': 'in',
    'document.passport_card.curp': 'dolore laboris',
    'document.passport_card.curp_validation_response': '7f3b2387-4931-4402-b09d-4da3295ebdf6',
    'document.passport_card.dob': 'irure dolor et qui dolore',
    'document.passport_card.document_number': 'incididunt amet eu',
    'document.passport_card.expires_at': 'irure anim veniam',
    'document.passport_card.first_name': 'Colby',
    'document.passport_card.front.image': 'ipsum exercitation proident ex quis',
    'document.passport_card.front.mime_type': 'enim elit pariatur adipisicing',
    'document.passport_card.full_address': '121 Kemmer Greens Suite 353',
    'document.passport_card.full_name': 'Julia Nader MD',
    'document.passport_card.gender': 'et occaecat tempor',
    'document.passport_card.issued_at': 'commodo dolore Ut veniam nisi',
    'document.passport_card.issuing_country': 'Montenegro',
    'document.passport_card.issuing_state': 'Minnesota',
    'document.passport_card.last_name': 'Skiles',
    'document.passport_card.nationality': 'ullamco sit sed ea',
    'document.passport_card.postal_code': 'tempor',
    'document.passport_card.ref_number': 'nulla deserunt pariatur velit sunt',
    'document.passport_card.samba_activity_history_response': 'nulla dolor Lorem fugiat ad',
    'document.passport_card.selfie.image': 'labore nulla Excepteur deserunt adipisicing',
    'document.passport_card.selfie.mime_type': 'ex dolore consequat',
    'document.passport_card.state': 'Alaska',
    'document.passport_card.us_issuing_state': 'Ohio',
    'document.permit.address_line1': '379 Tamara Orchard Suite 216',
    'document.permit.back.image': 'aute eu veniam sed',
    'document.permit.back.mime_type': 'magna',
    'document.permit.city': 'New Jake',
    'document.permit.classified_document_type': 'in voluptate deserunt occaecat veniam',
    'document.permit.clave_de_elector': 'exercitation magna Lorem',
    'document.permit.curp': 'eu elit in',
    'document.permit.curp_validation_response': '6d97b5a5-044f-4a55-96ba-b5ff7bd14af7',
    'document.permit.dob': 'in ut',
    'document.permit.document_number': 'et Duis',
    'document.permit.expires_at': 'fugiat occaecat ipsum',
    'document.permit.first_name': 'Cortez',
    'document.permit.front.image': 'sint',
    'document.permit.front.mime_type': 'in dolor',
    'document.permit.full_address': '46973 Altenwerth Springs Apt. 782',
    'document.permit.full_name': 'Ms. Louise Rath',
    'document.permit.gender': 'deserunt ad sit',
    'document.permit.issued_at': 'qui',
    'document.permit.issuing_country': 'Brazil',
    'document.permit.issuing_state': 'Kansas',
    'document.permit.last_name': 'Waters',
    'document.permit.nationality': 'laboris',
    'document.permit.postal_code': 'Lorem in proident enim',
    'document.permit.ref_number': 'culpa velit',
    'document.permit.samba_activity_history_response': 'Duis',
    'document.permit.selfie.image': 'sint in',
    'document.permit.selfie.mime_type': 'in sit mollit Ut labore',
    'document.permit.state': 'Delaware',
    'document.permit.us_issuing_state': 'New Mexico',
    'document.proof_of_address.image': '4792 Collins Motorway Suite 609',
    'document.residence_document.address_line1': '89078 Alberta Ferry Suite 904',
    'document.residence_document.back.image': '33d30126-2725-40b3-80f0-c044f223794b',
    'document.residence_document.back.mime_type': 'cdad3399-ca81-4672-b42b-9cbd9b095efb',
    'document.residence_document.city': 'West Chadrick',
    'document.residence_document.classified_document_type': 'ed5d98ae-c3ac-48f8-992d-2a65c0c906e8',
    'document.residence_document.clave_de_elector': 'beea07c1-bf04-4e25-b85c-53f7fb7fdf3a',
    'document.residence_document.curp': '756cf9c1-6b62-4788-b7a0-2e0b340b6a6b',
    'document.residence_document.curp_validation_response': '9756065d-4eb3-4bc7-aae8-7a18926aa0ab',
    'document.residence_document.dob': '8e880eb6-1047-4096-95b1-773793a1b084',
    'document.residence_document.document_number': 'e699e0aa-5026-4953-8a50-6d881765679e',
    'document.residence_document.expires_at': '013bd1d0-ac49-418c-9352-c7174244c23e',
    'document.residence_document.first_name': 'Edgar',
    'document.residence_document.front.image': '65fe458d-bf26-4bd6-af89-b95b6c2c9319',
    'document.residence_document.front.mime_type': 'b3d12b38-abb6-4b1a-ad96-98cf7b5c6c3e',
    'document.residence_document.full_address': '336 S Grand Avenue Suite 929',
    'document.residence_document.full_name': 'Terri Borer DDS',
    'document.residence_document.gender': 'e327ef40-d274-4fca-8e42-3cdb6987a647',
    'document.residence_document.issued_at': '76117e50-e5c7-4cc5-8863-bc084bc777cd',
    'document.residence_document.issuing_country': 'French Southern Territories',
    'document.residence_document.issuing_state': 'New Jersey',
    'document.residence_document.last_name': 'Ledner',
    'document.residence_document.nationality': 'dbbb4771-2075-4919-9d91-0d20b1c1d03d',
    'document.residence_document.postal_code': 'a5e6c15e-893b-45a5-9b72-7693d947d034',
    'document.residence_document.ref_number': '207a8849-e8db-49be-83a7-45193fbdbf0f',
    'document.residence_document.samba_activity_history_response': 'd96c36ed-b7ef-4064-b44f-16496543c0a4',
    'document.residence_document.selfie.image': 'bfba6248-2b24-4ef1-9d3a-cf8736e6cc1e',
    'document.residence_document.selfie.mime_type': 'ae97e4aa-4e0f-4b7a-8055-7053b0cd1d05',
    'document.residence_document.state': 'New Jersey',
    'document.residence_document.us_issuing_state': 'Ohio',
    'document.ssn_card.image': 'amet fugiat enim laborum in',
    'document.visa.address_line1': '269 Rogahn Via Suite 895',
    'document.visa.back.image': 'dolore adipisicing occaecat et incididunt',
    'document.visa.back.mime_type': 'eu ullamco proident',
    'document.visa.city': 'Dibbertbury',
    'document.visa.classified_document_type': 'enim',
    'document.visa.clave_de_elector': 'ipsum in ex elit',
    'document.visa.curp': 'nostrud sed Lorem',
    'document.visa.curp_validation_response': 'da17c198-11a2-49a3-bd7e-709d85746dad',
    'document.visa.dob': 'non in incididunt',
    'document.visa.document_number': 'laborum quis',
    'document.visa.expires_at': 'magna est dolore nulla',
    'document.visa.first_name': 'Arlene',
    'document.visa.front.image': 'non qui occaecat aliqua Lorem',
    'document.visa.front.mime_type': 'laborum id elit',
    'document.visa.full_address': '2162 Jameson Drives Suite 941',
    'document.visa.full_name': 'Kerry Bahringer',
    'document.visa.gender': 'Ut officia in minim sint',
    'document.visa.issued_at': 'proident Excepteur amet incididunt fugiat',
    'document.visa.issuing_country': 'Tonga',
    'document.visa.issuing_state': 'Nevada',
    'document.visa.last_name': 'Toy',
    'document.visa.nationality': 'cupidatat anim',
    'document.visa.postal_code': 'ex aute labore anim',
    'document.visa.ref_number': 'quis commodo et ex dolor',
    'document.visa.samba_activity_history_response': 'et Ut esse tempor eu',
    'document.visa.selfie.image': 'in reprehenderit dolore ex eiusmod',
    'document.visa.selfie.mime_type': 'incididunt ullamco',
    'document.visa.state': 'West Virginia',
    'document.visa.us_issuing_state': 'Nebraska',
    'document.voter_identification.address_line1': '79856 Metz Valley Suite 675',
    'document.voter_identification.back.image': 'e9986255-5499-4879-b73e-92365169457c',
    'document.voter_identification.back.mime_type': '293af38e-d700-4787-ad99-a9a534cc6e86',
    'document.voter_identification.city': 'Fort Alexandria',
    'document.voter_identification.classified_document_type': '8160fd68-1a0e-43a2-82d2-1c5721394b95',
    'document.voter_identification.clave_de_elector': 'ba97c78e-9b1d-47b2-8128-deed56732dcd',
    'document.voter_identification.curp': '68f004f9-5aa4-4286-8610-f13ce3d73a4f',
    'document.voter_identification.curp_validation_response': 'd08c7934-afe2-4933-8aac-8b1d7a8dde52',
    'document.voter_identification.dob': '7582419b-6c6f-4e7b-b2c3-ad2007005c51',
    'document.voter_identification.document_number': '7b850c6d-a730-4d41-8e4b-87558cee57cf',
    'document.voter_identification.expires_at': 'f4fc8bd3-b4e4-49e4-97b5-872a456e20b5',
    'document.voter_identification.first_name': 'Krista',
    'document.voter_identification.front.image': '5d2c8245-053f-46eb-ad54-c9ec1c7f4c05',
    'document.voter_identification.front.mime_type': '35f2d419-e2d9-4ad7-bf5f-8b47bac3b774',
    'document.voter_identification.full_address': '18302 Harris Rest Suite 207',
    'document.voter_identification.full_name': 'Nicholas Witting',
    'document.voter_identification.gender': 'e0dc678a-d335-422d-a31e-96a9906dd4d7',
    'document.voter_identification.issued_at': '673ac2b8-78f3-48b1-ab19-33483a549caf',
    'document.voter_identification.issuing_country': 'Timor-Leste',
    'document.voter_identification.issuing_state': 'Florida',
    'document.voter_identification.last_name': 'Jakubowski',
    'document.voter_identification.nationality': 'c15af8b7-14ca-43de-9805-f379beb39f3b',
    'document.voter_identification.postal_code': '77df0457-d4d1-4c0e-99b6-708700aa774f',
    'document.voter_identification.ref_number': 'cab961fa-4642-4fcd-a947-de5b135b2d8c',
    'document.voter_identification.samba_activity_history_response': '9bd793ba-8c32-4d6a-805f-e7bf8790bf82',
    'document.voter_identification.selfie.image': '6d286af4-9673-40f6-b0ad-464ac26ce390',
    'document.voter_identification.selfie.mime_type': '6ae1b18a-c585-4635-88ad-f540759fecb8',
    'document.voter_identification.state': 'Utah',
    'document.voter_identification.us_issuing_state': 'Colorado',
    'id.address_line1': '35956 E Broadway Street Apt. 778',
    'id.address_line2': '559 Schmeler-Herman Extensions Suite 798',
    'id.citizenships': ['BR', 'VI', 'MM'],
    'id.city': 'West Chris',
    'id.country': 'Kiribati',
    'id.dob': 'c23f9314-925d-43e0-baf6-3c7b6bb07d47',
    'id.drivers_license_number': 'd1cd87c5-e37c-44e0-ad99-43d3de1b157a',
    'id.drivers_license_state': 'North Carolina',
    'id.email': 'kristian24@gmail.com',
    'id.first_name': 'Destini',
    'id.itin': 'fc125f4b-ae35-4a5d-814e-1ef994bb85f2',
    'id.last_name': 'Cole',
    'id.middle_name': 'Kelley Osinski',
    'id.nationality': 'b5d92e3b-0908-4dce-9544-65206b5fe0bd',
    'id.phone_number': '+19418993192',
    'id.ssn4': '0cf1b199-71e8-4104-8f78-a8e0b723d003',
    'id.ssn9': '9431d849-1586-48c8-8a59-6f719159ab3f',
    'id.state': 'Idaho',
    'id.us_legal_status': '5104a0f0-0742-48c1-a1ea-fb205ab62f67',
    'id.us_tax_id': 'b66e9ca3-c64f-4153-90de-e0c1067d653f',
    'id.visa_expiration_date': '6c97cdd6-8516-4f43-a538-fba2d72129f3',
    'id.visa_kind': '5c316674-1b64-4066-b372-621c01b4ecb4',
    'id.zip': '99012',
    'investor_profile.annual_income': 'irure tempor Ut',
    'investor_profile.brokerage_firm_employer': 'nulla ex in',
    'investor_profile.declarations': [
      'affiliated_with_us_broker',
      'senior_political_figure',
      'senior_political_figure',
    ],
    'investor_profile.employer': 'Lorem',
    'investor_profile.employment_status': 'dolore',
    'investor_profile.family_member_names': ['irure Ut id sit', 'dolor', 'ea'],
    'investor_profile.funding_sources': ['business_income', 'investments', 'investments'],
    'investor_profile.investment_goals': ['diversification', 'other', 'growth'],
    'investor_profile.net_worth': 'cupidatat proident et',
    'investor_profile.occupation': 'id ad cupidatat',
    'investor_profile.political_organization': 'tempor dolore proident irure laborum',
    'investor_profile.risk_tolerance': 'enim ut Ut adipisicing consectetur',
    'investor_profile.senior_executive_symbols': ['irure ut esse', 'tempor', 'eu'],
  },
  op: 'update',
  ownershipStake: 93636283,
  uuid: 'cd880eee-5d6f-4f43-bfeb-1ab0e5c4e456',
};
export const hosted_BusinessOnboardingResponse: BusinessOnboardingResponse = {
  authToken: '41785484-4c34-4619-ab8c-7f7e496b5779',
  isNewBusiness: false,
};
export const hosted_ChallengeKind: ChallengeKind = 'email';
export const hosted_CheckSessionResponse: CheckSessionResponse = 'active';
export const hosted_CollectDocumentConfig: CollectDocumentConfig = {
  kind: 'identity',
  shouldCollectConsent: false,
  shouldCollectSelfie: false,
  supportedCountryAndDocTypes: {},
};
export const hosted_CollectDocumentConfigCustom: CollectDocumentConfigCustom = {
  description: 'velit sint adipisicing tempor',
  identifier: 'document.permit.front.mime_type',
  kind: 'custom',
  name: 'Reginald Gleichner',
  requiresHumanReview: true,
  uploadSettings: 'prefer_capture',
};
export const hosted_CollectDocumentConfigIdentity: CollectDocumentConfigIdentity = {
  kind: 'identity',
  shouldCollectConsent: false,
  shouldCollectSelfie: false,
  supportedCountryAndDocTypes: {},
};
export const hosted_CollectDocumentConfigProofOfAddress: CollectDocumentConfigProofOfAddress = {
  kind: 'proof_of_address',
};
export const hosted_CollectDocumentConfigProofOfSsn: CollectDocumentConfigProofOfSsn = {
  kind: 'proof_of_ssn',
};
export const hosted_CollectedDataOption: CollectedDataOption = 'business_kyced_beneficial_owners';
export const hosted_ConsentRequest: ConsentRequest = {
  consentLanguageText: 'en',
  mlConsent: false,
};
export const hosted_CountrySpecificDocumentMapping: CountrySpecificDocumentMapping = {};
export const hosted_CreateDeviceAttestationRequest: CreateDeviceAttestationRequest = {
  attestation: 'nostrud occaecat culpa',
  state: 'Kentucky',
};
export const hosted_CreateDocumentRequest: CreateDocumentRequest = {
  countryCode: 'GP',
  deviceType: 'android',
  documentType: 'drivers_license',
  fixtureResult: 'fail',
  requestId: 'ab9d1a23-39a7-4d37-bcd6-59d972912880',
  skipSelfie: true,
};
export const hosted_CreateDocumentResponse: CreateDocumentResponse = {
  id: '2d0074de-10c4-44df-8ea8-95a4d9725b47',
};
export const hosted_CreateOnboardingTimelineRequest: CreateOnboardingTimelineRequest = {
  event: 'ut pariatur elit',
};
export const hosted_CreateSdkArgsTokenResponse: CreateSdkArgsTokenResponse = {
  expiresAt: '1918-04-23T06:50:23.0Z',
  token: '5f08de9a-9b2a-4c48-9b09-7a80d2fe3cb7',
};
export const hosted_CreateUserTokenRequest: CreateUserTokenRequest = {
  requestedScope: 'onboarding',
};
export const hosted_CreateUserTokenResponse: CreateUserTokenResponse = {
  expiresAt: '1946-03-19T23:52:55.0Z',
  token: 'b5dee4ae-53af-42ea-9fd1-0642caad37f2',
};
export const hosted_CustomDocumentConfig: CustomDocumentConfig = {
  description: 'dolore fugiat',
  identifier: 'document.passport.nationality',
  name: 'Lynda Klein',
  requiresHumanReview: false,
  uploadSettings: 'capture_only_on_mobile',
};
export const hosted_D2pGenerateRequest: D2pGenerateRequest = {
  meta: {
    l10N: {
      language: 'en',
      locale: 'en-US',
    },
    opener: 'consectetur laborum non in dolor',
    redirectUrl: 'https://faint-giggle.us/',
    sandboxIdDocOutcome: '6e2fad94-e22d-457a-bbf1-4ee0106f125c',
    sessionId: '0b397ee6-73c8-46f6-b0d3-eee65c7e74fb',
    styleParams: 'ipsum adipisicing ullamco id',
  },
};
export const hosted_D2pGenerateResponse: D2pGenerateResponse = {
  authToken: '9abeea8e-46db-4336-9c7e-40cd78bf1205',
};
export const hosted_D2pSessionStatus: D2pSessionStatus = 'waiting';
export const hosted_D2pSmsRequest: D2pSmsRequest = {
  url: 'https://empty-outlaw.name',
};
export const hosted_D2pSmsResponse: D2pSmsResponse = {
  timeBeforeRetryS: 58425194,
};
export const hosted_D2pStatusResponse: D2pStatusResponse = {
  meta: {
    l10N: {
      language: 'en',
      locale: 'en-US',
    },
    opener: 'do',
    redirectUrl: 'https://kosher-eggplant.biz',
    sandboxIdDocOutcome: 'ad4817cf-2313-49df-8475-54211f9b667d',
    sessionId: 'd34532a0-478e-4b28-81f2-af1c2efd43a0',
    styleParams: 'voluptate in ad',
  },
  status: 'waiting',
};
export const hosted_D2pUpdateStatusRequest: D2pUpdateStatusRequest = {
  status: 'waiting',
};
export const hosted_DataIdentifier: DataIdentifier = 'document.passport.curp_validation_response';
export const hosted_DeleteHostedBusinessOwnerRequest: DeleteHostedBusinessOwnerRequest = {
  uuid: 'c7b1c5de-3b85-44a5-ad9d-2d92641f30d3',
};
export const hosted_DeviceAttestationChallengeResponse: DeviceAttestationChallengeResponse = {
  attestationChallenge: 'proident laboris',
  state: 'Maryland',
};
export const hosted_DeviceAttestationType: DeviceAttestationType = 'android';
export const hosted_DeviceType: DeviceType = 'ios';
export const hosted_DocumentAndCountryConfiguration: DocumentAndCountryConfiguration = {
  countrySpecific: {},
  global: ['id_card', 'id_card', 'id_card'],
};
export const hosted_DocumentFixtureResult: DocumentFixtureResult = 'pass';
export const hosted_DocumentImageError: DocumentImageError = 'image_too_small';
export const hosted_DocumentKind: DocumentKind = 'visa';
export const hosted_DocumentRequestConfig: DocumentRequestConfig = {
  data: {
    collectSelfie: true,
    documentTypesAndCountries: {
      countrySpecific: {},
      global: ['permit', 'visa', 'voter_identification'],
    },
  },
  kind: 'identity',
};
export const hosted_DocumentRequestConfigCustom: DocumentRequestConfigCustom = {
  data: {
    description: 'qui commodo Duis ut',
    identifier: 'investor_profile.employer',
    name: 'Juanita Krajcik',
    requiresHumanReview: false,
    uploadSettings: 'prefer_capture',
  },
  kind: 'custom',
};
export const hosted_DocumentRequestConfigIdentity: DocumentRequestConfigIdentity = {
  data: {
    collectSelfie: false,
    documentTypesAndCountries: {
      countrySpecific: {},
      global: ['passport', 'residence_document', 'passport_card'],
    },
  },
  kind: 'identity',
};
export const hosted_DocumentRequestConfigProofOfAddress: DocumentRequestConfigProofOfAddress = {
  data: {
    requiresHumanReview: false,
  },
  kind: 'proof_of_address',
};
export const hosted_DocumentRequestConfigProofOfSsn: DocumentRequestConfigProofOfSsn = {
  data: {
    requiresHumanReview: true,
  },
  kind: 'proof_of_ssn',
};
export const hosted_DocumentResponse: DocumentResponse = {
  errors: ['selfie_face_not_found', 'face_not_found', 'selfie_image_orientation_incorrect'],
  isRetryLimitExceeded: true,
  nextSideToCollect: 'front',
};
export const hosted_DocumentSide: DocumentSide = 'front';
export const hosted_DocumentUploadSettings: DocumentUploadSettings = 'capture_only_on_mobile';
export const hosted_EmailVerifyRequest: EmailVerifyRequest = {
  data: 'dolor sed',
};
export const hosted_Empty: Empty = {};
export const hosted_FilterFunction: FilterFunction = "hmac_sha256('<key>')";
export const hosted_FingerprintVisitRequest: FingerprintVisitRequest = {
  path: 'incididunt laboris eu',
  requestId: 'e2013841-bcda-4905-a9bf-20d30f169824',
  visitorId: 'ad01bc50-8fd4-46b4-9509-2a9127b92eb2',
};
export const hosted_FormV1Options: FormV1Options = {
  hideButtons: true,
  hideCancelButton: true,
  hideFootprintLogo: false,
};
export const hosted_FormV1SdkArgs: FormV1SdkArgs = {
  authToken: '22c2e643-7633-4e79-8d93-2ce94e8263be',
  l10N: {
    language: 'en',
    locale: 'en-US',
  },
  options: {
    hideButtons: true,
    hideCancelButton: true,
    hideFootprintLogo: true,
  },
  title: 'cillum aliqua dolor irure',
};
export const hosted_GetDeviceAttestationChallengeRequest: GetDeviceAttestationChallengeRequest = {
  androidPackageName: 'Brandon Mraz PhD',
  deviceType: 'ios',
  iosBundleId: '57de139d-f281-4e4a-b3ab-7a2eea39ab4f',
};
export const hosted_GetSdkArgsTokenResponse: GetSdkArgsTokenResponse = {
  args: {
    data: {
      authToken: 'a47b9d98-dba7-4a23-ab11-f874a787550e',
      documentFixtureResult: 'fail',
      fixtureResult: 'step_up',
      isComponentsSdk: false,
      l10N: {
        language: 'en',
        locale: 'en-US',
      },
      options: {
        showCompletionPage: false,
        showLogo: true,
      },
      publicKey: '268c0656-28b2-487e-a955-3d2a1cd9c681',
      sandboxId: '0d9bb13b-17de-4b7a-80ea-d6d9d3ff8857',
      shouldRelayToComponents: false,
      userData: {},
    },
    kind: 'verify_v1',
  },
};
export const hosted_GetUserTokenResponse: GetUserTokenResponse = {
  expiresAt: '1938-03-18T10:30:50.0Z',
  scopes: ['handoff', 'explicit_auth', 'explicit_auth'],
};
export const hosted_GetVerifyContactInfoResponse: GetVerifyContactInfoResponse = {
  isVerified: false,
  originInsightEvent: {
    city: 'South Delphine',
    country: 'Bouvet Island',
    ipAddress: '73738 Beier Meadows Apt. 412',
    latitude: 56219789.96812764,
    longitude: -62598655.46846557,
    metroCode: 'cillum Ut eu officia',
    postalCode: 'cupidatat',
    region: 'cupidatat',
    regionName: 'Amy Labadie',
    sessionId: 'ad686df3-f502-473b-97da-dc6f70636f2d',
    timeZone: 'laboris Excepteur cupidatat',
    timestamp: '1911-02-04T22:25:26.0Z',
    userAgent: 'nulla Excepteur pariatur cupidatat',
  },
  tenantName: 'Sherri Labadie',
};
export const hosted_HandoffMetadata: HandoffMetadata = {
  l10N: {
    language: 'en',
    locale: 'en-US',
  },
  opener: 'sint consectetur cupidatat pariatur',
  redirectUrl: 'https://crafty-testimonial.net',
  sandboxIdDocOutcome: '80c9ac6c-a57a-4ad3-9562-6364d6b12dc5',
  sessionId: 'd9a74f03-0fe7-4ade-ba82-2e02abcf5cff',
  styleParams: 'dolore amet et eu',
};
export const hosted_HostedBusiness: HostedBusiness = {
  createdAt: '1923-01-19T01:20:20.0Z',
  id: 'f803f6f3-08f4-4115-8e9c-ccd6621cf58a',
  isIncomplete: false,
  lastActivityAt: '1943-06-28T17:22:04.0Z',
  name: 'Marilyn Bogisich',
};
export const hosted_HostedBusinessDetail: HostedBusinessDetail = {
  invitedData: {
    'bank.*.account_type': 'dolore sed in ullamco',
    'bank.*.ach_account_id': '006d20d9-405d-4530-827d-0904faba0e1b',
    'bank.*.ach_account_number': 'sunt aute enim cupidatat',
    'bank.*.ach_routing_number': 'cupidatat Lorem enim do ex',
    'bank.*.fingerprint': 'tempor sint aliquip sunt elit',
    'bank.*.name': 'Faye Ferry',
    'card.*.billing_address.country': '95438 Kihn Via Suite 950',
    'card.*.billing_address.zip': '6464 E 6th Street Suite 618',
    'card.*.cvc': 'ullamco exercitation id commodo',
    'card.*.expiration': 'in adipisicing consectetur culpa amet',
    'card.*.expiration_month': 'laboris voluptate',
    'card.*.expiration_year': 'Excepteur incididunt',
    'card.*.fingerprint': 'incididunt qui mollit',
    'card.*.issuer': 'do culpa dolore',
    'card.*.name': 'Belinda Stark',
    'card.*.number': 'elit deserunt occaecat ad',
    'card.*.number_last4': 'esse in nulla',
    'custom.*': 'in dolore culpa',
    'document.custom.*': 'ad Excepteur',
    'document.drivers_license.address_line1': '694 Adrien Brooks Apt. 747',
    'document.drivers_license.back.image': 'do',
    'document.drivers_license.back.mime_type': 'est in',
    'document.drivers_license.city': 'Broderickview',
    'document.drivers_license.classified_document_type': 'eiusmod',
    'document.drivers_license.clave_de_elector': 'elit nisi enim',
    'document.drivers_license.curp': 'magna cillum commodo ipsum',
    'document.drivers_license.curp_validation_response': '66a1b2c1-efc3-4d84-9770-9a894b9d3e6b',
    'document.drivers_license.dob': 'ut ad cillum nisi velit',
    'document.drivers_license.document_number': 'exercitation minim',
    'document.drivers_license.expires_at': 'aliquip eiusmod laboris dolor Ut',
    'document.drivers_license.first_name': 'Ewell',
    'document.drivers_license.front.image': 'Excepteur adipisicing elit ullamco in',
    'document.drivers_license.front.mime_type': 'qui deserunt',
    'document.drivers_license.full_address': '577 Parisian Parks Apt. 602',
    'document.drivers_license.full_name': 'Miss Meredith Orn',
    'document.drivers_license.gender': 'in consequat exercitation sunt et',
    'document.drivers_license.issued_at': 'aliquip reprehenderit ut labore',
    'document.drivers_license.issuing_country': 'Jersey',
    'document.drivers_license.issuing_state': 'New Hampshire',
    'document.drivers_license.last_name': 'Grimes',
    'document.drivers_license.nationality': 'fugiat consequat cillum',
    'document.drivers_license.postal_code': 'commodo dolore eu ipsum elit',
    'document.drivers_license.ref_number': 'ullamco nostrud sed',
    'document.drivers_license.samba_activity_history_response': 'eu qui officia consequat sit',
    'document.drivers_license.selfie.image': 'aliqua veniam non aute',
    'document.drivers_license.selfie.mime_type': 'in ut',
    'document.drivers_license.state': 'California',
    'document.finra_compliance_letter': 'amet nulla',
    'document.id_card.address_line1': '4505 Mill Street Apt. 419',
    'document.id_card.back.image': 'cb7cb0c7-c52d-48ba-ba09-cf8ffe77a858',
    'document.id_card.back.mime_type': '86613c87-5cbc-4f8f-bfbd-7148f9311791',
    'document.id_card.city': 'Myaborough',
    'document.id_card.classified_document_type': 'fef34f83-6078-4cf8-8c2a-40c4c582edf0',
    'document.id_card.clave_de_elector': '0d5b5d26-731f-4e72-9a71-5fe226769051',
    'document.id_card.curp': 'd0e57f6b-954c-4368-aefb-571fda22ac84',
    'document.id_card.curp_validation_response': '6b0bd9c9-e687-431f-90e2-c8a22c50fca9',
    'document.id_card.dob': '862f13f6-b7de-4660-85e7-a03ef8dc5104',
    'document.id_card.document_number': '61f8be28-646b-47b3-aff4-2b49cb0e8cca',
    'document.id_card.expires_at': 'f1bb591a-f93b-451e-8caf-d789a24c2fe5',
    'document.id_card.first_name': 'Jarvis',
    'document.id_card.front.image': 'f9e4038a-cab8-40c6-bf37-715807477459',
    'document.id_card.front.mime_type': '5d706e40-86c6-4af9-9068-3bb6f5963957',
    'document.id_card.full_address': '63467 Mill Road Apt. 746',
    'document.id_card.full_name': 'Erma Bartell-Wiza',
    'document.id_card.gender': '8c07017f-52ba-4515-a5c3-3a33d369cbf8',
    'document.id_card.issued_at': 'd73ed423-f902-4aed-a7d7-8b05d0289e6a',
    'document.id_card.issuing_country': 'Austria',
    'document.id_card.issuing_state': 'Rhode Island',
    'document.id_card.last_name': 'Hauck',
    'document.id_card.nationality': 'd6df89ad-aab3-4843-9e1e-2c0a251a74a3',
    'document.id_card.postal_code': '62ca31f9-b47b-4d14-931b-6b3fb2cf8305',
    'document.id_card.ref_number': '31e4c2c5-2634-4ed1-a4a7-aa6f0446eb27',
    'document.id_card.samba_activity_history_response': '8b34068e-d06d-45ad-91e3-5ea76d72f67b',
    'document.id_card.selfie.image': '8bd28a44-0b13-4667-b4af-7bad1005a052',
    'document.id_card.selfie.mime_type': '261e185c-21aa-4174-85d8-503580621fb4',
    'document.id_card.state': 'South Dakota',
    'document.passport.address_line1': '217 Grady Fort Suite 686',
    'document.passport.back.image': 'in cillum',
    'document.passport.back.mime_type': 'consequat occaecat minim',
    'document.passport.city': 'Fort Royville',
    'document.passport.classified_document_type': 'nulla',
    'document.passport.clave_de_elector': 'dolor pariatur',
    'document.passport.curp': 'qui magna et ex',
    'document.passport.curp_validation_response': '100831a1-7189-4a4d-b12e-771a0ddfe352',
    'document.passport.dob': 'consectetur',
    'document.passport.document_number': 'eu qui',
    'document.passport.expires_at': 'dolore incididunt',
    'document.passport.first_name': 'Mylene',
    'document.passport.front.image': 'aute in velit',
    'document.passport.front.mime_type': 'exercitation laboris esse aute',
    'document.passport.full_address': '989 E Front Street Suite 378',
    'document.passport.full_name': 'Celia Donnelly',
    'document.passport.gender': 'ea',
    'document.passport.issued_at': 'fugiat tempor et',
    'document.passport.issuing_country': 'Niger',
    'document.passport.issuing_state': 'New Hampshire',
    'document.passport.last_name': 'Adams',
    'document.passport.nationality': 'dolore',
    'document.passport.postal_code': 'deserunt',
    'document.passport.ref_number': 'aute',
    'document.passport.samba_activity_history_response': 'esse labore elit voluptate eu',
    'document.passport.selfie.image': 'esse Excepteur qui Ut',
    'document.passport.selfie.mime_type': 'dolor sunt',
    'document.passport.state': 'West Virginia',
    'document.passport_card.address_line1': '9834 N Maple Street Suite 244',
    'document.passport_card.back.image': 'officia ut ea consectetur aliquip',
    'document.passport_card.back.mime_type': 'cupidatat',
    'document.passport_card.city': 'Jaskolskistad',
    'document.passport_card.classified_document_type': 'amet incididunt id nulla',
    'document.passport_card.clave_de_elector': 'sint veniam nulla',
    'document.passport_card.curp': 'cupidatat dolore Ut et ipsum',
    'document.passport_card.curp_validation_response': '83768f95-ea84-4dfb-adc2-7e3836f7c5df',
    'document.passport_card.dob': 'id exercitation',
    'document.passport_card.document_number': 'esse veniam',
    'document.passport_card.expires_at': 'voluptate non adipisicing',
    'document.passport_card.first_name': 'Casimer',
    'document.passport_card.front.image': 'in fugiat dolore',
    'document.passport_card.front.mime_type': 'laboris et occaecat',
    'document.passport_card.full_address': '426 S Main Avenue Suite 858',
    'document.passport_card.full_name': 'Melody Rutherford',
    'document.passport_card.gender': 'qui voluptate ut reprehenderit',
    'document.passport_card.issued_at': 'ea in nulla pariatur',
    'document.passport_card.issuing_country': 'Morocco',
    'document.passport_card.issuing_state': 'Michigan',
    'document.passport_card.last_name': 'Price',
    'document.passport_card.nationality': 'quis culpa nulla',
    'document.passport_card.postal_code': 'pariatur',
    'document.passport_card.ref_number': 'dolor in proident',
    'document.passport_card.samba_activity_history_response': 'id dolore magna tempor sed',
    'document.passport_card.selfie.image': 'nulla dolor tempor voluptate',
    'document.passport_card.selfie.mime_type': 'tempor reprehenderit',
    'document.passport_card.state': 'Alabama',
    'document.permit.address_line1': '20464 Maggio Mountain Suite 973',
    'document.permit.back.image': 'nisi ut minim',
    'document.permit.back.mime_type': 'deserunt',
    'document.permit.city': 'Morarton',
    'document.permit.classified_document_type': 'tempor eu sed',
    'document.permit.clave_de_elector': 'amet in ullamco nostrud',
    'document.permit.curp': 'sint aute cupidatat quis',
    'document.permit.curp_validation_response': '7b2e42de-983e-41d2-8da7-6790a96a94e8',
    'document.permit.dob': 'adipisicing non Duis',
    'document.permit.document_number': 'sit reprehenderit sint qui nostrud',
    'document.permit.expires_at': 'cupidatat ut nisi velit',
    'document.permit.first_name': 'Howard',
    'document.permit.front.image': 'eiusmod Lorem tempor cillum',
    'document.permit.front.mime_type': 'deserunt',
    'document.permit.full_address': '5820 Hahn Fork Suite 179',
    'document.permit.full_name': 'Emmett Tremblay',
    'document.permit.gender': 'aliqua dolor',
    'document.permit.issued_at': 'labore',
    'document.permit.issuing_country': 'Mauritius',
    'document.permit.issuing_state': 'Mississippi',
    'document.permit.last_name': 'Rowe',
    'document.permit.nationality': 'reprehenderit nostrud mollit',
    'document.permit.postal_code': 'nostrud elit',
    'document.permit.ref_number': 'nostrud commodo dolor quis',
    'document.permit.samba_activity_history_response': 'aliquip',
    'document.permit.selfie.image': 'ad',
    'document.permit.selfie.mime_type': 'ut consectetur officia occaecat',
    'document.permit.state': 'Indiana',
    'document.proof_of_address.image': '2918 Railroad Street Suite 473',
    'document.residence_document.address_line1': '51939 S College Street Suite 278',
    'document.residence_document.back.image': 'b315cc43-dc58-4f79-b81e-7b565b26a692',
    'document.residence_document.back.mime_type': '311993f2-dbd1-4487-9bf9-1d1d7694fc22',
    'document.residence_document.city': 'West Giovanna',
    'document.residence_document.classified_document_type': '4302751f-06d0-4ba9-8c2c-a5123f38d986',
    'document.residence_document.clave_de_elector': '090d6add-d273-4538-8833-e330262172a9',
    'document.residence_document.curp': 'b34f2e50-4929-4a58-b6e9-2bd3c2e05eb5',
    'document.residence_document.curp_validation_response': '73f072d1-6210-43da-a213-b4a9e26b6f2a',
    'document.residence_document.dob': 'c2fcf4e5-7c9e-49ce-bac6-3cf0e8c29687',
    'document.residence_document.document_number': '85cdb66d-7c21-422d-b553-8a6b7da0a88b',
    'document.residence_document.expires_at': 'f625fd2a-1ba9-41c7-9830-801f0037d8fc',
    'document.residence_document.first_name': 'Gilbert',
    'document.residence_document.front.image': '3629bba5-94e8-4a76-8ab5-a7cdd1822d19',
    'document.residence_document.front.mime_type': '677ecb41-2924-4689-930b-f9bde0c0623b',
    'document.residence_document.full_address': '42913 Destinee Mount Suite 319',
    'document.residence_document.full_name': 'Jeannie Beer',
    'document.residence_document.gender': '9a8288c0-b705-472c-889a-fdfdd3eb73c4',
    'document.residence_document.issued_at': '4323d903-8c9b-4bbd-aa07-ecc6368da8c6',
    'document.residence_document.issuing_country': 'Mauritius',
    'document.residence_document.issuing_state': 'Minnesota',
    'document.residence_document.last_name': 'Crist',
    'document.residence_document.nationality': 'ee83f670-ff9d-4dc6-836a-7f788b839318',
    'document.residence_document.postal_code': '853fee15-d81e-4580-a98a-3ec2cf1bbfce',
    'document.residence_document.ref_number': 'b8d461b0-e3a3-4857-868c-9c6057e8f316',
    'document.residence_document.samba_activity_history_response': '9d02b0f2-21f8-4dcd-8a8d-c810542c6a27',
    'document.residence_document.selfie.image': 'e1bd7e96-9cba-468e-a772-9bbd34b38101',
    'document.residence_document.selfie.mime_type': 'f459f94d-fec9-4ecd-8812-aa97163593de',
    'document.residence_document.state': 'Maryland',
    'document.ssn_card.image': 'quis proident culpa',
    'document.visa.address_line1': '971 Nader Heights Suite 176',
    'document.visa.back.image': 'amet proident cupidatat in',
    'document.visa.back.mime_type': 'cillum dolor',
    'document.visa.city': 'East Simone',
    'document.visa.classified_document_type': 'ad culpa',
    'document.visa.clave_de_elector': 'voluptate magna ullamco',
    'document.visa.curp': 'mollit nisi ut',
    'document.visa.curp_validation_response': '83e20124-0a9a-444b-a60d-41f284da12c8',
    'document.visa.dob': 'in dolore',
    'document.visa.document_number': 'esse labore aliqua pariatur',
    'document.visa.expires_at': 'ut adipisicing Ut',
    'document.visa.first_name': 'Randall',
    'document.visa.front.image': 'exercitation voluptate consectetur adipisicing nulla',
    'document.visa.front.mime_type': 'sunt dolor elit esse',
    'document.visa.full_address': '9115 Third Street Apt. 358',
    'document.visa.full_name': 'Robert Franey',
    'document.visa.gender': 'ut nulla eu velit aute',
    'document.visa.issued_at': 'elit nulla commodo ea',
    'document.visa.issuing_country': 'Peru',
    'document.visa.issuing_state': 'Vermont',
    'document.visa.last_name': 'Green',
    'document.visa.nationality': 'dolor deserunt',
    'document.visa.postal_code': 'commodo occaecat aliqua',
    'document.visa.ref_number': 'reprehenderit sunt',
    'document.visa.samba_activity_history_response': 'anim',
    'document.visa.selfie.image': 'esse ut Ut irure officia',
    'document.visa.selfie.mime_type': 'esse officia deserunt do consequat',
    'document.visa.state': 'Tennessee',
    'document.voter_identification.address_line1': '8700 N Main Street Suite 225',
    'document.voter_identification.back.image': '2b5d8d9c-4b48-4f9a-a312-7596f805dcaf',
    'document.voter_identification.back.mime_type': '8dd50334-9d91-4ca9-a102-732f9c64b887',
    'document.voter_identification.city': 'Camilafort',
    'document.voter_identification.classified_document_type': 'c6fddd77-15dd-442e-903f-c07fbe6ff086',
    'document.voter_identification.clave_de_elector': '0aef8189-d436-4640-8c93-761b81fb0b42',
    'document.voter_identification.curp': 'c8425d1f-9bf3-461a-9bb6-050105487c7a',
    'document.voter_identification.curp_validation_response': '0a003fc6-371f-4e7e-99cd-7368173e648f',
    'document.voter_identification.dob': '86d7b5cf-04fe-44b9-a528-216cfd393eef',
    'document.voter_identification.document_number': 'e6312052-754c-4626-9e7d-50eb22853ceb',
    'document.voter_identification.expires_at': '3a2ce6eb-634e-4074-9da6-1807b4c641d9',
    'document.voter_identification.first_name': 'Otto',
    'document.voter_identification.front.image': 'bc505604-8839-4fd7-a577-e2b3e4ce9dfc',
    'document.voter_identification.front.mime_type': 'c7e3cd81-a1a3-499e-b806-bbc8ada739c3',
    'document.voter_identification.full_address': '35706 Angel Mountain Apt. 347',
    'document.voter_identification.full_name': 'Irvin Hermiston',
    'document.voter_identification.gender': '36233eed-3ec8-46d6-bb93-cb7458623575',
    'document.voter_identification.issued_at': 'a9e2cf55-3cf9-4cba-95c0-0e282e62052a',
    'document.voter_identification.issuing_country': 'Qatar',
    'document.voter_identification.issuing_state': 'New York',
    'document.voter_identification.last_name': 'Torphy',
    'document.voter_identification.nationality': 'e5bc77d4-a442-418f-b780-62241614ac09',
    'document.voter_identification.postal_code': '9c1820c3-4349-4570-af42-ffed68bdf42e',
    'document.voter_identification.ref_number': '80e2b188-35e2-44e1-bc03-8c7a637ecc59',
    'document.voter_identification.samba_activity_history_response': '9c319d01-3c0c-40d4-a17f-f6f222f06ef7',
    'document.voter_identification.selfie.image': '8dc672cf-f00d-4059-a4f6-8bcdaad0ec2f',
    'document.voter_identification.selfie.mime_type': 'edb28e6b-3edb-47bd-bf03-06a7cb6c1c31',
    'document.voter_identification.state': 'South Dakota',
    'id.address_line1': '271 E Walnut Street Apt. 105',
    'id.address_line2': '86185 N Poplar Street Suite 547',
    'id.citizenships': ['CA'],
    'id.city': 'North Jaquelineworth',
    'id.country': 'Gambia',
    'id.dob': 'ff38da03-fae6-4598-a952-4bb04347a101',
    'id.drivers_license_number': 'de1e0027-a8b0-4f6b-9d24-ea1a8648f62c',
    'id.drivers_license_state': 'Alabama',
    'id.email': 'tremayne79@gmail.com',
    'id.first_name': 'Rosamond',
    'id.itin': '8ec41796-982a-4f64-89db-e9aeb0a655c6',
    'id.last_name': 'Langworth',
    'id.middle_name': 'Lynn Kuvalis',
    'id.nationality': 'cab45bc9-374a-4c4d-a93f-4cdebda3bb69',
    'id.phone_number': '+18649279979',
    'id.ssn4': '584e6f77-a4d5-4372-80d1-cc722b362dac',
    'id.ssn9': '207c985c-bf7f-40e2-b8ad-ca0434708228',
    'id.state': 'Michigan',
    'id.us_legal_status': 'f6857fcf-d11b-45ae-a7ad-3b968e5f5743',
    'id.us_tax_id': '53727935-f789-45e9-a3b7-0c1eaed1a61b',
    'id.visa_expiration_date': '39ba7716-155e-42e9-a2b2-8a72205f3a56',
    'id.visa_kind': '2605dd77-2d3f-4719-9532-8da148d50a02',
    'id.zip': '97600',
    'investor_profile.annual_income': 'ullamco laborum esse Ut reprehenderit',
    'investor_profile.brokerage_firm_employer': 'ut ad',
    'investor_profile.declarations': ['affiliated_with_us_broker'],
    'investor_profile.employer': 'consectetur',
    'investor_profile.employment_status': 'deserunt Excepteur dolore consequat',
    'investor_profile.family_member_names': ['Gerard Padberg'],
    'investor_profile.funding_sources': ['inheritance'],
    'investor_profile.investment_goals': ['growth', 'income', 'preserve_capital'],
    'investor_profile.net_worth': 'eu cupidatat',
    'investor_profile.occupation': 'consequat ut ad commodo enim',
    'investor_profile.political_organization': 'consequat laborum',
    'investor_profile.risk_tolerance': 'cupidatat sint et id',
    'investor_profile.senior_executive_symbols': ['minim Lorem fugiat'],
  },
  inviter: {
    firstName: 'Eddie',
    lastName: 'Murray',
  },
  name: 'Susan Braun',
};
export const hosted_HostedBusinessOwner: HostedBusinessOwner = {
  createdAt: '1925-04-22T07:53:01.0Z',
  decryptedData: {
    'bank.*.account_type': 'consectetur Excepteur',
    'bank.*.ach_account_id': '5795d2b3-5e4e-443d-ba62-7b719a798f4c',
    'bank.*.ach_account_number': 'cillum do et voluptate nisi',
    'bank.*.ach_routing_number': 'pariatur irure dolore cillum',
    'bank.*.fingerprint': 'laboris fugiat officia enim',
    'bank.*.name': 'Kathy Gerlach V',
    'card.*.billing_address.country': '528 Caroline Knoll Apt. 980',
    'card.*.billing_address.zip': '9637 Schmitt Forge Apt. 140',
    'card.*.cvc': 'ad in do id adipisicing',
    'card.*.expiration': 'sed deserunt eu officia proident',
    'card.*.expiration_month': 'enim anim deserunt dolore',
    'card.*.expiration_year': 'pariatur ut in veniam Lorem',
    'card.*.fingerprint': 'exercitation',
    'card.*.issuer': 'consectetur amet',
    'card.*.name': 'Clara Douglas',
    'card.*.number': 'aute',
    'card.*.number_last4': 'ut laborum',
    'custom.*': 'sit labore non ut',
    'document.custom.*': 'enim exercitation do incididunt',
    'document.drivers_license.address_line1': '701 Doug Forges Apt. 999',
    'document.drivers_license.back.image': 'consequat culpa ullamco sed',
    'document.drivers_license.back.mime_type': 'ullamco in',
    'document.drivers_license.city': 'South Sybleland',
    'document.drivers_license.classified_document_type': 'reprehenderit aliqua',
    'document.drivers_license.clave_de_elector': 'in est Excepteur esse deserunt',
    'document.drivers_license.curp': 'magna in irure',
    'document.drivers_license.curp_validation_response': 'bd4cb464-4305-4029-a63a-98fc4ef8618c',
    'document.drivers_license.dob': 'eu enim dolor voluptate consequat',
    'document.drivers_license.document_number': 'ut culpa',
    'document.drivers_license.expires_at': 'aute aliqua deserunt irure',
    'document.drivers_license.first_name': 'Alison',
    'document.drivers_license.front.image': 'aute',
    'document.drivers_license.front.mime_type': 'minim veniam sit Excepteur',
    'document.drivers_license.full_address': '376 Gutkowski Streets Suite 401',
    'document.drivers_license.full_name': 'Cesar Corwin',
    'document.drivers_license.gender': 'laboris enim irure qui ullamco',
    'document.drivers_license.issued_at': 'eu laboris',
    'document.drivers_license.issuing_country': "Cote d'Ivoire",
    'document.drivers_license.issuing_state': 'Texas',
    'document.drivers_license.last_name': 'Becker',
    'document.drivers_license.nationality': 'cupidatat deserunt ex consequat',
    'document.drivers_license.postal_code': 'qui',
    'document.drivers_license.ref_number': 'irure commodo',
    'document.drivers_license.samba_activity_history_response': 'in sunt velit',
    'document.drivers_license.selfie.image': 'officia',
    'document.drivers_license.selfie.mime_type': 'commodo',
    'document.drivers_license.state': 'Michigan',
    'document.finra_compliance_letter': 'commodo esse',
    'document.id_card.address_line1': '2213 Lake Road Suite 783',
    'document.id_card.back.image': 'a91fce94-1c6a-4459-8d74-2e07c50d7d4e',
    'document.id_card.back.mime_type': '8a679f5e-5956-47aa-a598-8d862c5b5f3c',
    'document.id_card.city': 'Fort Bryon',
    'document.id_card.classified_document_type': '91528650-122d-4a98-9ea9-a7363c4c6d7e',
    'document.id_card.clave_de_elector': 'c8098f45-8227-4fce-8f64-54dc50d70be9',
    'document.id_card.curp': 'bd03bb56-567a-4ee4-a09d-e95463c49043',
    'document.id_card.curp_validation_response': 'ee8b4deb-8f40-4739-bcd7-caa41316f491',
    'document.id_card.dob': '89f56f39-702f-4475-934b-0578c3c4ff0c',
    'document.id_card.document_number': 'a8dc099b-3764-47dd-81a0-133850fdaef5',
    'document.id_card.expires_at': '72dc0c6d-844d-4bc5-86c5-43f0ccbff370',
    'document.id_card.first_name': 'Giovani',
    'document.id_card.front.image': '7dab8e1f-10f5-4d0b-92eb-3d7661512527',
    'document.id_card.front.mime_type': '6a05669a-adfe-47ba-a529-44cf8ea0a516',
    'document.id_card.full_address': '173 North Street Apt. 264',
    'document.id_card.full_name': 'Miss Lindsey Reynolds',
    'document.id_card.gender': '823fe095-7845-4981-9a87-5a41b77573b6',
    'document.id_card.issued_at': '5fe156bc-82f2-4d45-9de9-b5da689f9f33',
    'document.id_card.issuing_country': 'Turks and Caicos Islands',
    'document.id_card.issuing_state': 'Oklahoma',
    'document.id_card.last_name': 'Lebsack',
    'document.id_card.nationality': 'd5654d7e-c353-4d21-af2b-d698dd28315e',
    'document.id_card.postal_code': 'a3009a23-5f81-4c37-b28a-f891a779ff76',
    'document.id_card.ref_number': 'c83c0ec5-9f58-4c3b-9632-ae1e6f244f17',
    'document.id_card.samba_activity_history_response': 'fe7cb05e-0634-471d-8f91-76fea732e2a8',
    'document.id_card.selfie.image': '221db23e-4cdc-4564-8dec-5ef68ac3cd2a',
    'document.id_card.selfie.mime_type': '1d96a333-f309-4c6f-bd76-59cc96edc9e5',
    'document.id_card.state': 'Oregon',
    'document.passport.address_line1': '155 Ankunding Ridges Suite 973',
    'document.passport.back.image': 'elit reprehenderit et',
    'document.passport.back.mime_type': 'est laboris',
    'document.passport.city': 'New Kira',
    'document.passport.classified_document_type': 'eiusmod irure nulla ullamco',
    'document.passport.clave_de_elector': 'magna dolor nulla amet',
    'document.passport.curp': 'laboris velit sed Ut',
    'document.passport.curp_validation_response': '01e6ea38-c0d8-43f6-b9e5-d807fcbba793',
    'document.passport.dob': 'in occaecat aute nulla',
    'document.passport.document_number': 'quis',
    'document.passport.expires_at': 'Ut',
    'document.passport.first_name': 'Blanche',
    'document.passport.front.image': 'incididunt',
    'document.passport.front.mime_type': 'Duis fugiat proident ex',
    'document.passport.full_address': '7206 Terry Viaduct Suite 411',
    'document.passport.full_name': 'Patrick Spencer',
    'document.passport.gender': 'officia consequat Lorem minim',
    'document.passport.issued_at': 'do',
    'document.passport.issuing_country': 'Senegal',
    'document.passport.issuing_state': 'Illinois',
    'document.passport.last_name': 'Terry',
    'document.passport.nationality': 'dolor velit eiusmod',
    'document.passport.postal_code': 'sunt consequat enim cillum ad',
    'document.passport.ref_number': 'elit tempor',
    'document.passport.samba_activity_history_response': 'ex',
    'document.passport.selfie.image': 'proident cillum enim adipisicing eiusmod',
    'document.passport.selfie.mime_type': 'officia non qui laboris',
    'document.passport.state': 'Kentucky',
    'document.passport_card.address_line1': '5326 Washington Road Apt. 347',
    'document.passport_card.back.image': 'irure exercitation ullamco eiusmod quis',
    'document.passport_card.back.mime_type': 'proident occaecat',
    'document.passport_card.city': 'South Selina',
    'document.passport_card.classified_document_type': 'nostrud anim reprehenderit',
    'document.passport_card.clave_de_elector': 'ea dolor officia dolore',
    'document.passport_card.curp': 'reprehenderit ullamco',
    'document.passport_card.curp_validation_response': 'd7226120-c06d-4548-b300-ff29fdb7c236',
    'document.passport_card.dob': 'anim ut consequat',
    'document.passport_card.document_number': 'esse',
    'document.passport_card.expires_at': 'cillum adipisicing',
    'document.passport_card.first_name': 'Brandon',
    'document.passport_card.front.image': 'enim in',
    'document.passport_card.front.mime_type': 'id',
    'document.passport_card.full_address': '6175 Zieme Flats Suite 654',
    'document.passport_card.full_name': 'Anthony Weber',
    'document.passport_card.gender': 'adipisicing dolor et in',
    'document.passport_card.issued_at': 'cillum deserunt velit aute ea',
    'document.passport_card.issuing_country': 'Namibia',
    'document.passport_card.issuing_state': 'Idaho',
    'document.passport_card.last_name': 'Jaskolski',
    'document.passport_card.nationality': 'cupidatat ea eiusmod',
    'document.passport_card.postal_code': 'ipsum deserunt veniam',
    'document.passport_card.ref_number': 'in in',
    'document.passport_card.samba_activity_history_response': 'tempor cillum',
    'document.passport_card.selfie.image': 'dolore veniam elit',
    'document.passport_card.selfie.mime_type': 'nulla non aliqua sint',
    'document.passport_card.state': 'Maine',
    'document.permit.address_line1': '18328 Chestnut Street Suite 491',
    'document.permit.back.image': 'dolore nostrud',
    'document.permit.back.mime_type': 'consectetur voluptate quis eu labore',
    'document.permit.city': 'Wardhaven',
    'document.permit.classified_document_type': 'est amet sed',
    'document.permit.clave_de_elector': 'nisi',
    'document.permit.curp': 'sunt esse eiusmod tempor',
    'document.permit.curp_validation_response': '82df299f-4829-4cb4-88ab-2df2ef26e854',
    'document.permit.dob': 'officia pariatur',
    'document.permit.document_number': 'irure ut enim eu',
    'document.permit.expires_at': 'consectetur fugiat',
    'document.permit.first_name': 'Vada',
    'document.permit.front.image': 'amet sunt anim qui',
    'document.permit.front.mime_type': 'exercitation non Ut',
    'document.permit.full_address': '3834 5th Street Apt. 507',
    'document.permit.full_name': 'Monica Altenwerth-Thompson',
    'document.permit.gender': 'in aliquip eu ad cillum',
    'document.permit.issued_at': 'non aliqua',
    'document.permit.issuing_country': 'Malta',
    'document.permit.issuing_state': 'Indiana',
    'document.permit.last_name': 'Howell',
    'document.permit.nationality': 'quis nostrud in reprehenderit ut',
    'document.permit.postal_code': 'dolore',
    'document.permit.ref_number': 'aliquip cillum',
    'document.permit.samba_activity_history_response': 'exercitation enim aliqua laborum proident',
    'document.permit.selfie.image': 'magna commodo',
    'document.permit.selfie.mime_type': 'laboris sit nulla cupidatat do',
    'document.permit.state': 'Maryland',
    'document.proof_of_address.image': '633 Williamson Loaf Suite 250',
    'document.residence_document.address_line1': '8777 Wisozk Manor Apt. 141',
    'document.residence_document.back.image': 'a0481358-8657-41b0-9d92-68bf1dc872e6',
    'document.residence_document.back.mime_type': '9a5c0a63-df45-46bf-842a-da60c89cce8c',
    'document.residence_document.city': 'South Jazlynchester',
    'document.residence_document.classified_document_type': '2a951087-205e-49e0-97b1-f99063a3a0ad',
    'document.residence_document.clave_de_elector': '463f1dc3-7023-410c-947e-eac24e6ceee1',
    'document.residence_document.curp': '9c33574e-425d-4915-b26d-ead825f23700',
    'document.residence_document.curp_validation_response': 'c7c91b83-577a-4865-95c6-38579a289be1',
    'document.residence_document.dob': 'c447380f-502d-46c4-8c10-39ca300814ad',
    'document.residence_document.document_number': '09f8ed65-20c6-4361-84c8-be4570dcb901',
    'document.residence_document.expires_at': 'a9f79272-51af-4e28-ac52-240c5ca5303b',
    'document.residence_document.first_name': 'Manley',
    'document.residence_document.front.image': '49f4edfe-f3d0-435a-ace0-9788e694db33',
    'document.residence_document.front.mime_type': '72ca7346-9319-489a-9317-a1ab096e30ba',
    'document.residence_document.full_address': '506 N 1st Street Apt. 289',
    'document.residence_document.full_name': 'Mr. Archie Hane',
    'document.residence_document.gender': '5d69ab4c-2bc5-4497-974d-85a545fc425b',
    'document.residence_document.issued_at': '325d5b4d-e793-4485-813b-699bd964a0d6',
    'document.residence_document.issuing_country': 'Liechtenstein',
    'document.residence_document.issuing_state': 'Idaho',
    'document.residence_document.last_name': 'Dach',
    'document.residence_document.nationality': '86dbab74-0fcc-4a0c-8e6f-21ce1388dd53',
    'document.residence_document.postal_code': '094f8923-97a2-4d32-b875-9384f6cff3f3',
    'document.residence_document.ref_number': 'b1e4dc38-9d33-4054-bbb0-32eda61ab522',
    'document.residence_document.samba_activity_history_response': '8dd35381-ff66-4b89-81c3-f5100eab3f68',
    'document.residence_document.selfie.image': '5236f579-f00c-415d-9851-1b6a8f3fb9b4',
    'document.residence_document.selfie.mime_type': '6ee262b4-2e0d-4c96-8d69-5eda704d0ba6',
    'document.residence_document.state': 'Illinois',
    'document.ssn_card.image': 'in consequat eu veniam sed',
    'document.visa.address_line1': '35625 Ferry Fall Suite 592',
    'document.visa.back.image': 'nulla est',
    'document.visa.back.mime_type': 'dolor consectetur dolore do',
    'document.visa.city': 'Fort Brady',
    'document.visa.classified_document_type': 'Excepteur sit pariatur',
    'document.visa.clave_de_elector': 'in laboris',
    'document.visa.curp': 'culpa tempor Duis anim veniam',
    'document.visa.curp_validation_response': 'ab773bf4-eed3-4a1e-a7ac-514432c098c5',
    'document.visa.dob': 'mollit cillum Ut',
    'document.visa.document_number': 'in esse minim culpa',
    'document.visa.expires_at': 'in',
    'document.visa.first_name': 'Roderick',
    'document.visa.front.image': 'aliquip quis dolor nostrud ut',
    'document.visa.front.mime_type': 'quis proident officia',
    'document.visa.full_address': '81328 W Center Street Apt. 407',
    'document.visa.full_name': 'Bethany Mitchell',
    'document.visa.gender': 'reprehenderit',
    'document.visa.issued_at': 'laboris dolor',
    'document.visa.issuing_country': 'Moldova',
    'document.visa.issuing_state': 'Indiana',
    'document.visa.last_name': 'Schaefer',
    'document.visa.nationality': 'do nulla veniam velit',
    'document.visa.postal_code': 'ut',
    'document.visa.ref_number': 'eiusmod',
    'document.visa.samba_activity_history_response': 'culpa reprehenderit nostrud',
    'document.visa.selfie.image': 'incididunt aute sed reprehenderit',
    'document.visa.selfie.mime_type': 'non magna Duis Excepteur voluptate',
    'document.visa.state': 'Wyoming',
    'document.voter_identification.address_line1': '261 Mill Street Apt. 138',
    'document.voter_identification.back.image': '54dd51eb-bd7d-4be4-8fd9-05168f8d438e',
    'document.voter_identification.back.mime_type': '6d33e022-c917-4488-9d3d-1a5f3ea6b53a',
    'document.voter_identification.city': 'North Craig',
    'document.voter_identification.classified_document_type': '0b03539a-c389-43fd-80bd-e2daa2dd4207',
    'document.voter_identification.clave_de_elector': 'fbecf225-6bda-4893-8554-9a15fae8e1dc',
    'document.voter_identification.curp': 'a0205f23-8b47-4a89-b0f8-a2b80cb710a0',
    'document.voter_identification.curp_validation_response': '848e612e-5b71-4447-b1dc-c3e12a2def41',
    'document.voter_identification.dob': '79269e18-f1c3-4983-8418-d8b5a3b25a54',
    'document.voter_identification.document_number': 'b83319fb-016f-4dbd-97af-590e4edc5a66',
    'document.voter_identification.expires_at': 'f9deb34e-d2ec-46d4-bd2b-cdcb1d95feb6',
    'document.voter_identification.first_name': 'Judy',
    'document.voter_identification.front.image': '5a0fa5a3-815b-4cbd-825e-1529d89212f8',
    'document.voter_identification.front.mime_type': '074ca6be-9795-41aa-b511-17b7608a4d30',
    'document.voter_identification.full_address': '4245 Macy Loop Suite 869',
    'document.voter_identification.full_name': 'Ms. Christine Trantow Sr.',
    'document.voter_identification.gender': 'faa0226d-e1ff-40d6-bf44-8311a072af9c',
    'document.voter_identification.issued_at': '8c974397-eea9-4126-8743-bed696453deb',
    'document.voter_identification.issuing_country': 'Guadeloupe',
    'document.voter_identification.issuing_state': 'Connecticut',
    'document.voter_identification.last_name': 'Shanahan',
    'document.voter_identification.nationality': '51c2b675-1da1-424d-847f-9f821a2b7892',
    'document.voter_identification.postal_code': '65e65090-47fc-48bf-a97f-58ffe95282f4',
    'document.voter_identification.ref_number': '508d01f0-9142-4e4d-ae69-c77b45e3d389',
    'document.voter_identification.samba_activity_history_response': '368cb6e5-eeb0-4c2a-9740-4fbdc97ca8f4',
    'document.voter_identification.selfie.image': '4e70a922-561c-41f7-87c0-522bade4a54a',
    'document.voter_identification.selfie.mime_type': '908e66f5-783d-4d68-94ed-754e3cc42465',
    'document.voter_identification.state': 'Georgia',
    'id.address_line1': '6615 Beer Villages Suite 133',
    'id.address_line2': '5506 Kovacek Point Apt. 910',
    'id.citizenships': ['CA'],
    'id.city': 'Sporerfort',
    'id.country': 'Mexico',
    'id.dob': 'b24a4293-f39e-496f-a19d-e3e153bdcca3',
    'id.drivers_license_number': '44fee36c-07cd-4de3-b627-e823dd797f8d',
    'id.drivers_license_state': 'Pennsylvania',
    'id.email': 'nikko_torphy-lowe6@gmail.com',
    'id.first_name': 'Frida',
    'id.itin': '00fa851c-2036-45bd-8951-04922a2f58c2',
    'id.last_name': 'Roob',
    'id.middle_name': 'Carole Schmidt',
    'id.nationality': '69cfb9e5-710e-4938-8fa6-bb79c7d31786',
    'id.phone_number': '+12246421008',
    'id.ssn4': 'd4180328-9a8d-4239-a341-48af3ffa8227',
    'id.ssn9': 'b379bbff-48d7-4acf-ab0c-4d0b977ef9ff',
    'id.state': 'Vermont',
    'id.us_legal_status': '4615cf6c-3327-4eb0-a5f5-b3ba51081cc2',
    'id.us_tax_id': '5473e1b8-2c1b-4076-a7d4-d22b0e0af0a4',
    'id.visa_expiration_date': 'ce1ade3c-eb27-48d6-9e4a-9f8574168e65',
    'id.visa_kind': '28ffe77d-9b26-4de3-bbac-f8a155db1357',
    'id.zip': '79389',
    'investor_profile.annual_income': 'qui in ad',
    'investor_profile.brokerage_firm_employer': 'Duis enim exercitation',
    'investor_profile.declarations': ['affiliated_with_us_broker'],
    'investor_profile.employer': 'tempor occaecat nulla culpa',
    'investor_profile.employment_status': 'deserunt Duis ipsum Excepteur',
    'investor_profile.family_member_names': ['Gretchen Hoppe'],
    'investor_profile.funding_sources': ['employment_income', 'savings'],
    'investor_profile.investment_goals': ['growth', 'income', 'preserve_capital'],
    'investor_profile.net_worth': 'esse dolore ad qui',
    'investor_profile.occupation': 'in nisi minim',
    'investor_profile.political_organization': 'dolor dolor eu ullamco proident',
    'investor_profile.risk_tolerance': 'ullamco in ea amet',
    'investor_profile.senior_executive_symbols': ['in ut anim dolor'],
  },
  hasLinkedUser: false,
  isAuthedUser: true,
  isMutable: true,
  linkId: '00489aa4-75a7-4a34-a94a-87f95d8f6185',
  ownershipStake: 11065808,
  populatedData: [
    'document.passport_card.selfie.image',
    'document.permit.back.image',
    'document.residence_document.classified_document_type',
  ],
  uuid: '8f53fd99-ad4d-4085-9f6e-15e5db0abc81',
};
export const hosted_HostedUserDecryptRequest: HostedUserDecryptRequest = {
  fields: [
    'document.residence_document.front.mime_type',
    'document.id_card.issued_at',
    'document.voter_identification.samba_activity_history_response',
  ],
};
export const hosted_HostedValidateResponse: HostedValidateResponse = {
  validationToken: 'd13d31d5-5e9d-47c0-bf2d-56f7f0cdb569',
};
export const hosted_HostedWorkflowRequest: HostedWorkflowRequest = {
  config: {
    data: {
      playbookId: '9b547635-0bf1-4f83-9b08-85eca1161dad',
      recollectAttributes: ['dob', 'business_address', 'email'],
      reuseExistingBoKyc: false,
    },
    kind: 'onboard',
  },
  note: 'occaecat ullamco aliqua magna ipsum',
};
export const hosted_IdDocKind: IdDocKind = 'visa';
export const hosted_IdentifiedUser: IdentifiedUser = {
  authMethods: [
    {
      isVerified: true,
      kind: 'passkey',
    },
    {
      isVerified: true,
      kind: 'passkey',
    },
    {
      isVerified: true,
      kind: 'email',
    },
  ],
  availableChallengeKinds: ['email', 'email', 'sms'],
  canInitiateSignupChallenge: false,
  hasSyncablePasskey: true,
  isUnverified: true,
  matchingFps: ['document.residence_document.issuing_country', 'document.visa.front.image', 'document.visa.issued_at'],
  scrubbedEmail: 'kyler.kub54@gmail.com',
  scrubbedPhone: '+14805566942',
  token: '7152c554-bf1c-4004-b943-d6af35c7978e',
  tokenScopes: ['sensitive_profile', 'vault_data', 'handoff'],
};
export const hosted_IdentifyAuthMethod: IdentifyAuthMethod = {
  isVerified: false,
  kind: 'email',
};
export const hosted_IdentifyChallengeResponse: IdentifyChallengeResponse = {
  challengeData: {
    biometricChallengeJson: 'elit nulla',
    challengeKind: 'sms',
    challengeToken: '3b6445b8-f53d-45bc-a625-6df2900086ed',
    timeBeforeRetryS: 69478703,
    token: 'ec45b926-2295-4734-a86c-3ce1058d30e6',
  },
  error: 'consectetur exercitation ad',
};
export const hosted_IdentifyId: IdentifyId = {
  email: 'karlie69@gmail.com',
};
export const hosted_IdentifyRequest: IdentifyRequest = {
  email: 'blanche_williamson15@gmail.com',
  identifier: {
    email: 'zella88@gmail.com',
  },
  phoneNumber: '+17578683740',
  scope: 'onboarding',
};
export const hosted_IdentifyResponse: IdentifyResponse = {
  user: {
    authMethods: [
      {
        isVerified: true,
        kind: 'email',
      },
      {
        isVerified: false,
        kind: 'passkey',
      },
      {
        isVerified: false,
        kind: 'email',
      },
    ],
    availableChallengeKinds: ['email', 'email', 'sms'],
    canInitiateSignupChallenge: false,
    hasSyncablePasskey: true,
    isUnverified: false,
    matchingFps: ['document.permit.full_name', 'business.country', 'document.permit.last_name'],
    scrubbedEmail: 'antonetta_stark61@gmail.com',
    scrubbedPhone: '+13234436218',
    token: '2b2d5d52-c160-4a7c-a328-c870f690db2f',
    tokenScopes: ['handoff', 'handoff', 'explicit_auth'],
  },
};
export const hosted_IdentifyScope: IdentifyScope = 'onboarding';
export const hosted_IdentifyVerifyRequest: IdentifyVerifyRequest = {
  challengeResponse: 'pariatur Lorem occaecat',
  challengeToken: '44adf55d-c5d3-4789-8ec5-63f5e3a2385e',
  scope: 'auth',
};
export const hosted_IdentifyVerifyResponse: IdentifyVerifyResponse = {
  authToken: 'b84bc949-4e0e-4b97-b44d-4159c6b8b20f',
};
export const hosted_InsightEvent: InsightEvent = {
  city: 'Kellicester',
  country: 'Lithuania',
  ipAddress: '4231 Hickory Street Suite 856',
  latitude: 54923173.08038744,
  longitude: 64705952.02044535,
  metroCode: 'ut deserunt qui',
  postalCode: 'ex eu cupidatat',
  region: 'exercitation eu non aliqua',
  regionName: 'Alma Franey',
  sessionId: '7a73e357-a11b-46c4-9dd8-ecbc36ed31f5',
  timeZone: 'amet ipsum mollit ea laborum',
  timestamp: '1933-04-01T08:30:46.0Z',
  userAgent: 'id reprehenderit fugiat consequat officia',
};
export const hosted_InvestorProfileDeclaration: InvestorProfileDeclaration = 'senior_executive';
export const hosted_InvestorProfileFundingSource: InvestorProfileFundingSource = 'business_income';
export const hosted_InvestorProfileInvestmentGoal: InvestorProfileInvestmentGoal = 'diversification';
export const hosted_Inviter: Inviter = {
  firstName: 'Trudie',
  lastName: 'Rodriguez',
};
export const hosted_Iso3166TwoDigitCountryCode: Iso3166TwoDigitCountryCode = 'IS';
export const hosted_KbaResponse: KbaResponse = {
  token: 'ee243a48-29c4-4f59-915b-25166ac6b608',
};
export const hosted_L10n: L10n = {
  language: 'en',
  locale: 'en-US',
};
export const hosted_L10nV1: L10nV1 = {
  language: 'en',
  locale: 'en-US',
};
export const hosted_LiteIdentifyRequest: LiteIdentifyRequest = {
  email: 'alize49@gmail.com',
  phoneNumber: '+13176501326',
};
export const hosted_LiteIdentifyResponse: LiteIdentifyResponse = {
  userFound: true,
};
export const hosted_LogBody: LogBody = {
  logLevel: 'incididunt sunt do magna',
  logMessage: 'est tempor labore magna ut',
  sdkKind: 'ad dolore',
  sdkName: 'Mrs. Beth Rice I',
  sdkVersion: 'quis',
  sessionId: 'f01f580e-0fcc-465b-881c-b73136beba05',
  tenantDomain: 'Excepteur irure veniam culpa',
};
export const hosted_LoginChallengeRequest: LoginChallengeRequest = {
  challengeKind: 'email',
};
export const hosted_ModernBusinessDecryptResponse: ModernBusinessDecryptResponse = {
  'business.address_line1': '1194 N Court Street Suite 320',
  'business.address_line2': '3225 Delbert Crossing Suite 140',
  'business.city': 'Yesseniabury',
  'business.corporation_type': 'ipsum nisi pariatur proident',
  'business.country': 'Senegal',
  'business.dba': 'ipsum fugiat',
  'business.formation_date': 'occaecat amet',
  'business.formation_state': 'Arizona',
  'business.name': 'Todd Hartmann',
  'business.phone_number': '+18017239754',
  'business.state': 'New York',
  'business.tin': 'dolor magna enim',
  'business.website': 'https://unrealistic-cosset.org',
  'business.zip': '50055-8803',
  'custom.*': 'aute nisi',
};
export const hosted_ModernRawBusinessDataRequest: ModernRawBusinessDataRequest = {
  'business.address_line1': '47138 Maxime Union Suite 245',
  'business.address_line2': '2890 Schuyler Gateway Suite 197',
  'business.city': 'Terencefield',
  'business.corporation_type': 'adipisicing pariatur quis minim ullamco',
  'business.country': 'Switzerland',
  'business.dba': 'consequat in Excepteur',
  'business.formation_date': 'pariatur deserunt Duis dolore nulla',
  'business.formation_state': 'Delaware',
  'business.name': 'David Mitchell',
  'business.phone_number': '+19613372736',
  'business.state': 'New Jersey',
  'business.tin': 'occaecat laborum',
  'business.website': 'https://smoggy-executor.com',
  'business.zip': '04036-3379',
  'custom.*': 'incididunt in',
};
export const hosted_ModernRawUserDataRequest: ModernRawUserDataRequest = {
  'bank.*.account_type': 'velit ipsum',
  'bank.*.ach_account_id': '693103ae-9305-4b9d-a69f-5559e62ab9bf',
  'bank.*.ach_account_number': 'sed',
  'bank.*.ach_routing_number': 'adipisicing ut elit sunt',
  'bank.*.fingerprint': 'officia',
  'bank.*.name': 'Ralph Hills',
  'card.*.billing_address.country': '8495 Carolanne Lock Apt. 677',
  'card.*.billing_address.zip': '65493 N High Street Suite 373',
  'card.*.cvc': 'Ut ut Lorem eiusmod id',
  'card.*.expiration': 'est deserunt',
  'card.*.expiration_month': 'dolor',
  'card.*.expiration_year': 'mollit incididunt ex',
  'card.*.fingerprint': 'magna cupidatat',
  'card.*.issuer': 'ipsum Duis adipisicing anim',
  'card.*.name': 'Chad Huels',
  'card.*.number': 'culpa reprehenderit',
  'card.*.number_last4': 'velit reprehenderit voluptate',
  'custom.*': 'sint',
  'document.custom.*': 'culpa',
  'document.drivers_license.address_line1': '15783 River Road Suite 957',
  'document.drivers_license.back.image': 'cupidatat',
  'document.drivers_license.back.mime_type': 'nulla',
  'document.drivers_license.city': 'Gerholdboro',
  'document.drivers_license.classified_document_type': 'exercitation',
  'document.drivers_license.clave_de_elector': 'eiusmod veniam dolore dolore',
  'document.drivers_license.curp': 'eiusmod dolore anim minim',
  'document.drivers_license.curp_validation_response': '56650e33-52ab-459b-b085-14335fe60803',
  'document.drivers_license.dob': 'qui in',
  'document.drivers_license.document_number': 'ut tempor cillum dolore ut',
  'document.drivers_license.expires_at': 'fugiat eu',
  'document.drivers_license.first_name': 'Judson',
  'document.drivers_license.front.image': 'adipisicing veniam incididunt mollit ad',
  'document.drivers_license.front.mime_type': 'nostrud consectetur incididunt sunt Lorem',
  'document.drivers_license.full_address': '37904 Gusikowski Hills Apt. 289',
  'document.drivers_license.full_name': 'Mrs. Elena Terry',
  'document.drivers_license.gender': 'eiusmod commodo adipisicing occaecat',
  'document.drivers_license.issued_at': 'dolor do nisi',
  'document.drivers_license.issuing_country': 'Indonesia',
  'document.drivers_license.issuing_state': 'Arkansas',
  'document.drivers_license.last_name': 'Gutmann',
  'document.drivers_license.nationality': 'ex non Excepteur',
  'document.drivers_license.postal_code': 'et deserunt tempor qui',
  'document.drivers_license.ref_number': 'sunt nisi in laborum',
  'document.drivers_license.samba_activity_history_response': 'anim enim fugiat exercitation proident',
  'document.drivers_license.selfie.image': 'reprehenderit Duis laborum amet',
  'document.drivers_license.selfie.mime_type': 'minim anim nostrud',
  'document.drivers_license.state': 'Florida',
  'document.drivers_license.us_issuing_state': 'Illinois',
  'document.finra_compliance_letter': 'cupidatat commodo',
  'document.id_card.address_line1': '11975 Bernhard Rest Suite 790',
  'document.id_card.back.image': '0c2ffc48-d7b1-4d8a-820e-e06aedbd7111',
  'document.id_card.back.mime_type': '29b26fba-116b-45a2-bc3d-e3729c60fccd',
  'document.id_card.city': 'Fort Cynthiastead',
  'document.id_card.classified_document_type': '0659b167-a09c-4a53-a7ed-5ad7ecc066ef',
  'document.id_card.clave_de_elector': '42683985-2a27-47ea-acf9-5f75505c2403',
  'document.id_card.curp': '95533978-051d-45a6-af0a-236317462a61',
  'document.id_card.curp_validation_response': '17d99aee-1ee7-4ab0-af05-e40e8f65a2d3',
  'document.id_card.dob': '735380f8-1783-412d-99b6-5fa300ee9c00',
  'document.id_card.document_number': '37ac0cd9-8c12-42a9-bb3f-7bdf1f7ddf0e',
  'document.id_card.expires_at': 'd63d93ec-abac-4ba1-b75a-20cdb8a9ac0b',
  'document.id_card.first_name': 'Jessica',
  'document.id_card.front.image': '0b605447-3e95-4baf-9327-aa3055ec78d2',
  'document.id_card.front.mime_type': '9771d445-9ab8-43c4-9ba0-e77b49b3d638',
  'document.id_card.full_address': '228 Cumberland Street Apt. 833',
  'document.id_card.full_name': 'Mildred Spencer Jr.',
  'document.id_card.gender': 'd97eddd5-ea6b-4d4f-8dc1-12f622811f90',
  'document.id_card.issued_at': 'e8e4d344-991b-4f9b-8c35-4d77ed331f8d',
  'document.id_card.issuing_country': 'Maldives',
  'document.id_card.issuing_state': 'Maryland',
  'document.id_card.last_name': "O'Keefe",
  'document.id_card.nationality': 'f573851f-2c1f-4380-b53b-42d3eb044042',
  'document.id_card.postal_code': '551a815a-f300-4e30-a351-df3fdc14f819',
  'document.id_card.ref_number': '7a620b41-a9cc-4566-8cd0-039776ee1a9f',
  'document.id_card.samba_activity_history_response': 'a3aeedb9-3510-4bd1-8f9f-d6422246806c',
  'document.id_card.selfie.image': 'f146c7ba-0b18-4776-9763-b5be09b51c77',
  'document.id_card.selfie.mime_type': 'd3f26446-e509-49be-acc4-17ed70ab35c6',
  'document.id_card.state': 'Tennessee',
  'document.id_card.us_issuing_state': 'Georgia',
  'document.passport.address_line1': '99140 W Central Avenue Suite 105',
  'document.passport.back.image': 'dolore',
  'document.passport.back.mime_type': 'ad non sint',
  'document.passport.city': 'Port Laurel',
  'document.passport.classified_document_type': 'reprehenderit aute incididunt anim',
  'document.passport.clave_de_elector': 'proident ut consectetur ullamco',
  'document.passport.curp': 'nulla ad',
  'document.passport.curp_validation_response': '3ff68079-8328-4db7-aae8-ec4c17c20a92',
  'document.passport.dob': 'velit ipsum cillum sint nisi',
  'document.passport.document_number': 'Excepteur cupidatat',
  'document.passport.expires_at': 'enim in eiusmod deserunt eu',
  'document.passport.first_name': 'Carrie',
  'document.passport.front.image': 'ad occaecat ea',
  'document.passport.front.mime_type': 'ipsum consequat consectetur Duis',
  'document.passport.full_address': '3779 E Union Street Apt. 945',
  'document.passport.full_name': 'Todd Kris',
  'document.passport.gender': 'culpa',
  'document.passport.issued_at': 'sit deserunt',
  'document.passport.issuing_country': 'Grenada',
  'document.passport.issuing_state': 'Maryland',
  'document.passport.last_name': 'Hamill',
  'document.passport.nationality': 'dolor ut in',
  'document.passport.postal_code': 'sit eu Ut dolore ad',
  'document.passport.ref_number': 'aliqua laborum',
  'document.passport.samba_activity_history_response': 'anim in',
  'document.passport.selfie.image': 'dolor eiusmod incididunt in',
  'document.passport.selfie.mime_type': 'in voluptate',
  'document.passport.state': 'Virginia',
  'document.passport.us_issuing_state': 'Oklahoma',
  'document.passport_card.address_line1': '472 Haley Summit Apt. 418',
  'document.passport_card.back.image': 'adipisicing do dolor',
  'document.passport_card.back.mime_type': 'sit',
  'document.passport_card.city': 'New Hershel',
  'document.passport_card.classified_document_type': 'ad',
  'document.passport_card.clave_de_elector': 'ea ut anim',
  'document.passport_card.curp': 'ut sit anim',
  'document.passport_card.curp_validation_response': 'c4535508-f0d9-462a-9a8f-cdf3586868fd',
  'document.passport_card.dob': 'incididunt in nulla',
  'document.passport_card.document_number': 'est proident reprehenderit eiusmod ad',
  'document.passport_card.expires_at': 'in aliquip',
  'document.passport_card.first_name': 'Elnora',
  'document.passport_card.front.image': 'ad amet',
  'document.passport_card.front.mime_type': 'laboris',
  'document.passport_card.full_address': '88428 Clemens Canyon Apt. 993',
  'document.passport_card.full_name': 'Fred Becker',
  'document.passport_card.gender': 'nisi Lorem enim',
  'document.passport_card.issued_at': 'ad',
  'document.passport_card.issuing_country': 'Czechia',
  'document.passport_card.issuing_state': 'North Dakota',
  'document.passport_card.last_name': 'MacGyver',
  'document.passport_card.nationality': 'reprehenderit',
  'document.passport_card.postal_code': 'tempor',
  'document.passport_card.ref_number': 'nostrud reprehenderit',
  'document.passport_card.samba_activity_history_response': 'fugiat id',
  'document.passport_card.selfie.image': 'consectetur',
  'document.passport_card.selfie.mime_type': 'ea eu ipsum',
  'document.passport_card.state': 'North Dakota',
  'document.passport_card.us_issuing_state': 'Illinois',
  'document.permit.address_line1': "77794 O'Kon-Rowe River Suite 248",
  'document.permit.back.image': 'mollit id',
  'document.permit.back.mime_type': 'eiusmod adipisicing reprehenderit',
  'document.permit.city': 'Cassinport',
  'document.permit.classified_document_type': 'deserunt sint in',
  'document.permit.clave_de_elector': 'culpa et Excepteur',
  'document.permit.curp': 'culpa adipisicing ullamco',
  'document.permit.curp_validation_response': 'ea776cde-798c-4264-a16a-7fac5225198a',
  'document.permit.dob': 'ex sint dolore sed in',
  'document.permit.document_number': 'ad ea in',
  'document.permit.expires_at': 'ipsum',
  'document.permit.first_name': 'Hellen',
  'document.permit.front.image': 'fugiat',
  'document.permit.front.mime_type': 'eiusmod dolore',
  'document.permit.full_address': '971 11th Street Apt. 601',
  'document.permit.full_name': 'Carol Christiansen',
  'document.permit.gender': 'cillum fugiat enim nulla',
  'document.permit.issued_at': 'esse',
  'document.permit.issuing_country': 'Mauritius',
  'document.permit.issuing_state': 'Washington',
  'document.permit.last_name': 'Upton',
  'document.permit.nationality': 'magna incididunt reprehenderit dolore ut',
  'document.permit.postal_code': 'cupidatat in aute est laborum',
  'document.permit.ref_number': 'eu esse',
  'document.permit.samba_activity_history_response': 'eu exercitation id Ut',
  'document.permit.selfie.image': 'sint dolor ad',
  'document.permit.selfie.mime_type': 'deserunt enim cillum',
  'document.permit.state': 'Kentucky',
  'document.permit.us_issuing_state': 'Nevada',
  'document.proof_of_address.image': '74345 Nels Mount Apt. 988',
  'document.residence_document.address_line1': '67695 Huels Club Apt. 572',
  'document.residence_document.back.image': '2e2a536d-c16f-489d-bba3-14fcb2767244',
  'document.residence_document.back.mime_type': 'c92ccd26-0212-4cfd-a491-d9b5180d4001',
  'document.residence_document.city': 'Fort Jarret',
  'document.residence_document.classified_document_type': '90e3716c-5fed-416e-894c-02ef73092806',
  'document.residence_document.clave_de_elector': 'e41c0a86-347d-4ab9-b660-96c202f2f7af',
  'document.residence_document.curp': '44afcd5c-fa3e-44f1-8ed0-01e3bb3477a5',
  'document.residence_document.curp_validation_response': '1bd98e7b-72c3-4cf8-a317-edb0ace1feaf',
  'document.residence_document.dob': '9ac84cef-17ea-4d38-b2fd-f59ccffc4a85',
  'document.residence_document.document_number': 'a66bcb55-679e-4bc8-9986-0400f50a31a3',
  'document.residence_document.expires_at': '8a58f881-ec49-46bd-b3ff-182d6e920859',
  'document.residence_document.first_name': 'Adriana',
  'document.residence_document.front.image': '5ae61616-d10d-4693-bb92-1596be60492b',
  'document.residence_document.front.mime_type': '864273f7-2cfe-4f98-adba-94fac9a48fa4',
  'document.residence_document.full_address': '323 Frami Meadow Apt. 519',
  'document.residence_document.full_name': 'Dr. Betsy Kunze',
  'document.residence_document.gender': 'a97c19d4-d886-4d18-b676-fdbe1e9965c4',
  'document.residence_document.issued_at': '222f43c4-9a5d-48a7-b03f-73a696855379',
  'document.residence_document.issuing_country': 'Dominica',
  'document.residence_document.issuing_state': 'Ohio',
  'document.residence_document.last_name': 'Haag',
  'document.residence_document.nationality': '4b19379e-fff6-4551-a657-58799407b2d1',
  'document.residence_document.postal_code': 'a0173272-9563-47db-a70e-5d95af0f26a7',
  'document.residence_document.ref_number': '8ca35af2-ffef-4e94-88fc-b4f0b6da61f8',
  'document.residence_document.samba_activity_history_response': 'a20bccf2-b92c-4a31-8e44-cfd9fcd87c19',
  'document.residence_document.selfie.image': 'd2a64d63-b52d-43fe-862d-258fbd1e0103',
  'document.residence_document.selfie.mime_type': '817e7abd-d952-4268-bc07-f39c9ae15282',
  'document.residence_document.state': 'New Mexico',
  'document.residence_document.us_issuing_state': 'Tennessee',
  'document.ssn_card.image': 'sed',
  'document.visa.address_line1': '7179 W High Street Suite 520',
  'document.visa.back.image': 'velit',
  'document.visa.back.mime_type': 'nostrud pariatur amet culpa dolor',
  'document.visa.city': 'East Nolan',
  'document.visa.classified_document_type': 'Ut sed mollit aliqua',
  'document.visa.clave_de_elector': 'quis anim',
  'document.visa.curp': 'sed mollit esse ea',
  'document.visa.curp_validation_response': 'f72e275b-3eb1-4b51-8633-ac813702717f',
  'document.visa.dob': 'ullamco ad incididunt',
  'document.visa.document_number': 'reprehenderit Lorem enim cillum ut',
  'document.visa.expires_at': 'mollit',
  'document.visa.first_name': 'Kody',
  'document.visa.front.image': 'anim ea dolore ullamco',
  'document.visa.front.mime_type': 'exercitation',
  'document.visa.full_address': '785 Larry Motorway Suite 636',
  'document.visa.full_name': 'Nettie Collier',
  'document.visa.gender': 'aliqua officia',
  'document.visa.issued_at': 'Ut ipsum non',
  'document.visa.issuing_country': 'Heard Island and McDonald Islands',
  'document.visa.issuing_state': 'Washington',
  'document.visa.last_name': 'Wintheiser',
  'document.visa.nationality': 'in et',
  'document.visa.postal_code': 'culpa',
  'document.visa.ref_number': 'anim',
  'document.visa.samba_activity_history_response': 'cillum pariatur aliqua occaecat',
  'document.visa.selfie.image': 'dolor ex aliqua aliquip incididunt',
  'document.visa.selfie.mime_type': 'Ut aliquip proident nulla',
  'document.visa.state': 'Washington',
  'document.visa.us_issuing_state': 'Maine',
  'document.voter_identification.address_line1': '49066 E High Street Apt. 867',
  'document.voter_identification.back.image': '22ceaab5-ace3-43c1-8746-aba9b9952d99',
  'document.voter_identification.back.mime_type': 'b00188cd-1b56-449e-9601-a638e86d4f97',
  'document.voter_identification.city': 'Port Ramiroburgh',
  'document.voter_identification.classified_document_type': '2c496e3d-8829-49e8-af03-ca89e04b115f',
  'document.voter_identification.clave_de_elector': '3bb10e91-3fdc-4d14-855c-be89fd9cb9ff',
  'document.voter_identification.curp': 'faa4e850-b8da-44dd-b500-5b3fd244f6f5',
  'document.voter_identification.curp_validation_response': 'bc9ea706-e064-4e4c-8acb-ac193a4a81bf',
  'document.voter_identification.dob': 'a1553a86-2c79-46ae-aa2d-428822ee0719',
  'document.voter_identification.document_number': '45d7fbf3-67c6-4074-9ae0-18d2ba76c289',
  'document.voter_identification.expires_at': 'd1e6b7d0-3db4-418e-9cf4-bafc7f3feb3c',
  'document.voter_identification.first_name': 'Erica',
  'document.voter_identification.front.image': '192c1765-ff74-45c9-bb65-ca75f2249e8a',
  'document.voter_identification.front.mime_type': '8873cb39-ad90-482a-aa4c-005b4d8ac9c0',
  'document.voter_identification.full_address': '391 Buckridge Junction Suite 471',
  'document.voter_identification.full_name': 'Sherri Denesik',
  'document.voter_identification.gender': '4bfafe73-6638-48eb-b0e9-cf70e84cb247',
  'document.voter_identification.issued_at': '542342f8-74e1-4d31-b5bf-8494588a3b49',
  'document.voter_identification.issuing_country': 'Marshall Islands',
  'document.voter_identification.issuing_state': 'New Jersey',
  'document.voter_identification.last_name': 'Boehm',
  'document.voter_identification.nationality': '5bebbb37-0da0-42ee-8773-b06fc2e7759f',
  'document.voter_identification.postal_code': '80f6bb9c-0e22-417e-be37-c71171eca89a',
  'document.voter_identification.ref_number': '559a6ef2-a5aa-4f16-90dc-914ff377b110',
  'document.voter_identification.samba_activity_history_response': 'e40029c7-a21d-4bcb-a4c3-e9ad84c700cb',
  'document.voter_identification.selfie.image': 'bf45c290-cec4-496c-86b2-f24ad9f10584',
  'document.voter_identification.selfie.mime_type': '042f8669-54bc-42b9-9601-40f14ba94ed9',
  'document.voter_identification.state': 'New Jersey',
  'document.voter_identification.us_issuing_state': 'Illinois',
  'id.address_line1': '201 Graham Brook Suite 129',
  'id.address_line2': '49330 Braun Loop Suite 678',
  'id.citizenships': ['CA'],
  'id.city': 'Fort Carolynemouth',
  'id.country': 'Slovenia',
  'id.dob': '14e64c90-f96e-4487-ac77-64144a4432d1',
  'id.drivers_license_number': '0d879983-3ef6-437f-901b-23af13854bce',
  'id.drivers_license_state': 'Oklahoma',
  'id.email': 'reid_ullrich18@gmail.com',
  'id.first_name': 'Ford',
  'id.itin': '4ea220b0-7aac-4cf2-ac7f-c4d927c85e00',
  'id.last_name': 'White',
  'id.middle_name': 'Allen Stokes MD',
  'id.nationality': '8db093ed-368f-4313-9a89-222f9067f466',
  'id.phone_number': '+18994161734',
  'id.ssn4': 'a8544680-f5aa-432e-bbdd-8358bf0f9c74',
  'id.ssn9': 'c5f30a44-36c9-4daa-b128-9d386433e493',
  'id.state': 'Oklahoma',
  'id.us_legal_status': '48abe3a0-da82-4201-9aab-706ab3c61089',
  'id.us_tax_id': 'd926a2f4-df96-4b94-bcbc-ffdc5d3cb04d',
  'id.visa_expiration_date': '3b3ca862-bb3d-434c-87ea-31f22d55f436',
  'id.visa_kind': '3d5ba725-78c7-432b-ad24-31d1a383c729',
  'id.zip': '72605-3708',
  'investor_profile.annual_income': 'eu sed incididunt',
  'investor_profile.brokerage_firm_employer': 'Lorem',
  'investor_profile.declarations': ['senior_executive'],
  'investor_profile.employer': 'ut incididunt minim mollit',
  'investor_profile.employment_status': 'enim',
  'investor_profile.family_member_names': ['Genevieve Weissnat'],
  'investor_profile.funding_sources': ['savings'],
  'investor_profile.investment_goals': ['growth', 'income', 'preserve_capital'],
  'investor_profile.net_worth': 'eiusmod nulla esse',
  'investor_profile.occupation': 'velit',
  'investor_profile.political_organization': 'adipisicing',
  'investor_profile.risk_tolerance': 'magna anim cupidatat non',
  'investor_profile.senior_executive_symbols': ['occaecat do laborum'],
};
export const hosted_ModernUserDecryptResponse: ModernUserDecryptResponse = {
  'bank.*.account_type': 'magna',
  'bank.*.ach_account_id': '4a1e12ea-21df-4306-ad1f-ae6f4ea79a51',
  'bank.*.ach_account_number': 'esse do reprehenderit',
  'bank.*.ach_routing_number': 'laboris ullamco',
  'bank.*.fingerprint': 'ut ullamco elit',
  'bank.*.name': 'Francis Robel',
  'card.*.billing_address.country': '8284 Broadway Avenue Apt. 253',
  'card.*.billing_address.zip': '8811 Bruce Knolls Apt. 891',
  'card.*.cvc': 'mollit',
  'card.*.expiration': 'pariatur velit',
  'card.*.expiration_month': 'proident nostrud',
  'card.*.expiration_year': 'Lorem',
  'card.*.fingerprint': 'aute',
  'card.*.issuer': 'sed amet ea laborum enim',
  'card.*.name': 'Bill Vandervort',
  'card.*.number': 'elit commodo',
  'card.*.number_last4': 'magna et',
  'custom.*': 'sed',
  'document.custom.*': 'eu id irure ullamco esse',
  'document.drivers_license.address_line1': '3756 W Washington Street Suite 710',
  'document.drivers_license.back.image': 'culpa ut aute',
  'document.drivers_license.back.mime_type': 'incididunt',
  'document.drivers_license.city': 'East Amari',
  'document.drivers_license.classified_document_type': 'cillum fugiat non',
  'document.drivers_license.clave_de_elector': 'do',
  'document.drivers_license.curp': 'in eiusmod aliqua consectetur elit',
  'document.drivers_license.curp_validation_response': '75e130df-9890-491b-a425-d7415989e9a1',
  'document.drivers_license.dob': 'eiusmod voluptate magna',
  'document.drivers_license.document_number': 'ad et Ut',
  'document.drivers_license.expires_at': 'eu labore sunt',
  'document.drivers_license.first_name': 'Cristobal',
  'document.drivers_license.front.image': 'occaecat mollit incididunt est',
  'document.drivers_license.front.mime_type': 'fugiat sed dolor Duis in',
  'document.drivers_license.full_address': '8181 Leila Fords Apt. 480',
  'document.drivers_license.full_name': 'Meredith Streich',
  'document.drivers_license.gender': 'quis laborum',
  'document.drivers_license.issued_at': 'quis nisi dolore Lorem Duis',
  'document.drivers_license.issuing_country': 'Tanzania',
  'document.drivers_license.issuing_state': 'Vermont',
  'document.drivers_license.last_name': 'Nader',
  'document.drivers_license.nationality': 'eu do commodo ex est',
  'document.drivers_license.postal_code': 'minim',
  'document.drivers_license.ref_number': 'qui Excepteur ut',
  'document.drivers_license.samba_activity_history_response': 'exercitation aliqua Duis reprehenderit',
  'document.drivers_license.selfie.image': 'sint',
  'document.drivers_license.selfie.mime_type': 'tempor',
  'document.drivers_license.state': 'Nevada',
  'document.drivers_license.us_issuing_state': 'North Carolina',
  'document.finra_compliance_letter': 'eu non velit consequat in',
  'document.id_card.address_line1': '45894 North Avenue Suite 651',
  'document.id_card.back.image': 'a6b922da-bdba-43fc-aa26-ba3b803bdc50',
  'document.id_card.back.mime_type': '90b5e27f-517e-4350-a2f4-12b378d5a124',
  'document.id_card.city': 'New Charley',
  'document.id_card.classified_document_type': 'aeff8535-4d9d-40fd-8676-0ce5d8066097',
  'document.id_card.clave_de_elector': '232b94cb-59d0-46c1-9105-c6a40ead2b7b',
  'document.id_card.curp': '62e90b04-d5d8-42e2-aa88-e7ccebb1b852',
  'document.id_card.curp_validation_response': '33cf68a9-bfce-43d8-be44-cb1107d569ef',
  'document.id_card.dob': '139a65ec-99fb-4ddc-b03b-841a87a242b7',
  'document.id_card.document_number': '3fe1ed5d-13de-4848-899e-2f6cc03e0c21',
  'document.id_card.expires_at': '0ba1d978-b9a6-4f49-8dc6-8a8a22bdf748',
  'document.id_card.first_name': 'Beatrice',
  'document.id_card.front.image': '3f912fec-001b-4f7f-b546-1827b11315e4',
  'document.id_card.front.mime_type': 'ee39326b-d180-4a33-8723-6f9ffa29d9c3',
  'document.id_card.full_address': '7445 Sipes Mills Apt. 357',
  'document.id_card.full_name': 'Jeffery Kshlerin I',
  'document.id_card.gender': 'b9a47a45-ba17-43bf-861c-550eadaec991',
  'document.id_card.issued_at': '5c1e71df-f77a-4683-a214-2e755f557d0d',
  'document.id_card.issuing_country': 'Russian Federation',
  'document.id_card.issuing_state': 'Nebraska',
  'document.id_card.last_name': 'Quigley',
  'document.id_card.nationality': '6724d9d3-e35b-41df-ac24-356bb8e74b38',
  'document.id_card.postal_code': '8b5c329a-5fcc-4988-a706-ab748f503f63',
  'document.id_card.ref_number': '2b527bb2-d3b4-49a4-a5e5-6507e7181d2d',
  'document.id_card.samba_activity_history_response': 'b3b52731-90fd-4de9-b63e-ad42ae272cab',
  'document.id_card.selfie.image': '7d9fd663-13dc-4c66-af84-03802ac82182',
  'document.id_card.selfie.mime_type': '9b891196-cf30-4691-a224-4b59ebf7d651',
  'document.id_card.state': 'Virginia',
  'document.id_card.us_issuing_state': 'New York',
  'document.passport.address_line1': '10278 State Road Apt. 450',
  'document.passport.back.image': 'ullamco irure sint non est',
  'document.passport.back.mime_type': 'minim laborum dolor cillum',
  'document.passport.city': 'Jaydecester',
  'document.passport.classified_document_type': 'incididunt',
  'document.passport.clave_de_elector': 'nulla',
  'document.passport.curp': 'veniam nisi velit sed sunt',
  'document.passport.curp_validation_response': '6b6795d8-df83-4fca-89ad-7dc80f6796e8',
  'document.passport.dob': 'dolore proident anim occaecat enim',
  'document.passport.document_number': 'consequat',
  'document.passport.expires_at': 'velit laboris ullamco consectetur minim',
  'document.passport.first_name': 'Pietro',
  'document.passport.front.image': 'consectetur ea cillum deserunt sint',
  'document.passport.front.mime_type': 'laborum voluptate',
  'document.passport.full_address': '38404 Robbie Pine Suite 430',
  'document.passport.full_name': 'Noel Reilly IV',
  'document.passport.gender': 'in cillum consequat ullamco proident',
  'document.passport.issued_at': 'fugiat deserunt',
  'document.passport.issuing_country': 'Djibouti',
  'document.passport.issuing_state': 'Delaware',
  'document.passport.last_name': 'Heller',
  'document.passport.nationality': 'do ipsum nostrud',
  'document.passport.postal_code': 'reprehenderit in laboris aute',
  'document.passport.ref_number': 'veniam eu irure dolore ut',
  'document.passport.samba_activity_history_response': 'laborum in ipsum',
  'document.passport.selfie.image': 'reprehenderit id dolor mollit aliqua',
  'document.passport.selfie.mime_type': 'non sit Excepteur reprehenderit qui',
  'document.passport.state': 'Nebraska',
  'document.passport.us_issuing_state': 'Minnesota',
  'document.passport_card.address_line1': '2415 Constantin Lock Suite 190',
  'document.passport_card.back.image': 'consectetur',
  'document.passport_card.back.mime_type': 'ex',
  'document.passport_card.city': 'Fort Araceli',
  'document.passport_card.classified_document_type': 'est ut',
  'document.passport_card.clave_de_elector': 'exercitation culpa deserunt',
  'document.passport_card.curp': 'commodo incididunt veniam',
  'document.passport_card.curp_validation_response': '30852859-b7e4-4dfb-b204-1deb45fb962a',
  'document.passport_card.dob': 'pariatur',
  'document.passport_card.document_number': 'Lorem reprehenderit ad esse dolore',
  'document.passport_card.expires_at': 'ut minim eu nulla in',
  'document.passport_card.first_name': 'Alexandrea',
  'document.passport_card.front.image': 'Excepteur reprehenderit deserunt',
  'document.passport_card.front.mime_type': 'velit sunt dolore adipisicing',
  'document.passport_card.full_address': '322 Marian Point Suite 964',
  'document.passport_card.full_name': "Miss Olivia O'Hara",
  'document.passport_card.gender': 'dolor mollit',
  'document.passport_card.issued_at': 'deserunt laboris laborum do',
  'document.passport_card.issuing_country': 'Saint Pierre and Miquelon',
  'document.passport_card.issuing_state': 'Connecticut',
  'document.passport_card.last_name': 'Hoeger-Waters',
  'document.passport_card.nationality': 'minim in do',
  'document.passport_card.postal_code': 'in',
  'document.passport_card.ref_number': 'cupidatat labore',
  'document.passport_card.samba_activity_history_response': 'do consequat ipsum',
  'document.passport_card.selfie.image': 'do cupidatat',
  'document.passport_card.selfie.mime_type': 'irure',
  'document.passport_card.state': 'New York',
  'document.passport_card.us_issuing_state': 'Texas',
  'document.permit.address_line1': '97446 Riverside Avenue Apt. 903',
  'document.permit.back.image': 'veniam laborum',
  'document.permit.back.mime_type': 'deserunt',
  'document.permit.city': 'East Trentside',
  'document.permit.classified_document_type': 'culpa minim adipisicing',
  'document.permit.clave_de_elector': 'dolore sint',
  'document.permit.curp': 'eu nulla',
  'document.permit.curp_validation_response': '030d829f-3273-40ff-b821-6190d7e6a46b',
  'document.permit.dob': 'consectetur',
  'document.permit.document_number': 'sit et',
  'document.permit.expires_at': 'ad',
  'document.permit.first_name': 'Virgie',
  'document.permit.front.image': 'enim fugiat',
  'document.permit.front.mime_type': 'esse incididunt ea dolore mollit',
  'document.permit.full_address': '76371 Goodwin Rest Suite 438',
  'document.permit.full_name': 'Ora Kohler',
  'document.permit.gender': 'ut',
  'document.permit.issued_at': 'anim in mollit',
  'document.permit.issuing_country': 'Martinique',
  'document.permit.issuing_state': 'Massachusetts',
  'document.permit.last_name': 'Green',
  'document.permit.nationality': 'labore aute amet adipisicing',
  'document.permit.postal_code': 'deserunt cupidatat',
  'document.permit.ref_number': 'do nostrud',
  'document.permit.samba_activity_history_response': 'nulla irure sunt commodo ut',
  'document.permit.selfie.image': 'non proident laborum nostrud',
  'document.permit.selfie.mime_type': 'eiusmod enim',
  'document.permit.state': 'Illinois',
  'document.permit.us_issuing_state': 'Kansas',
  'document.proof_of_address.image': '47772 Jalen Gardens Apt. 127',
  'document.residence_document.address_line1': '15660 Mill Road Apt. 993',
  'document.residence_document.back.image': '0c0990cd-3c4c-4959-82a8-4f79b2928f78',
  'document.residence_document.back.mime_type': '1a220248-0224-4b0a-9277-8931a8546002',
  'document.residence_document.city': 'South Haileefield',
  'document.residence_document.classified_document_type': '17fb4c6f-6ee2-4443-9705-a55fac0703e0',
  'document.residence_document.clave_de_elector': '1f92f65c-61ee-4995-b321-29fc7ec9729b',
  'document.residence_document.curp': '8cad8092-4628-4908-9e0f-d3ef748d2ef8',
  'document.residence_document.curp_validation_response': '3b98cb62-ef3c-44c1-b13c-6812496065a4',
  'document.residence_document.dob': '4e2dcdd5-68a7-4c7b-a4b5-9397c351da78',
  'document.residence_document.document_number': 'f2674700-6f1d-4b4c-98d0-cd697ed25192',
  'document.residence_document.expires_at': 'c0cd96e6-4d6b-4825-af5d-59d2e24e66c9',
  'document.residence_document.first_name': 'Earnest',
  'document.residence_document.front.image': '0f8697e4-194e-40b5-8d0f-e4d796c812da',
  'document.residence_document.front.mime_type': '2e8b81f9-4053-44f9-b40b-f6bff21b09cc',
  'document.residence_document.full_address': '4719 Darwin Junctions Apt. 132',
  'document.residence_document.full_name': 'Miss Wilma Kuphal',
  'document.residence_document.gender': '71d8707a-875f-4846-a839-7ec63e89c2fe',
  'document.residence_document.issued_at': '7135193e-5708-4603-919a-04419a257870',
  'document.residence_document.issuing_country': 'Syrian Arab Republic',
  'document.residence_document.issuing_state': 'Wisconsin',
  'document.residence_document.last_name': 'Huels',
  'document.residence_document.nationality': '06c64072-ae85-4929-95ae-66e02af999c6',
  'document.residence_document.postal_code': 'd5b731be-b0f2-4502-bd40-4e780add657c',
  'document.residence_document.ref_number': 'cb0d8c41-043b-42bb-9c4b-76d5ef349c36',
  'document.residence_document.samba_activity_history_response': 'bdd254a8-6517-41f5-8f57-2f09bee53673',
  'document.residence_document.selfie.image': '1ae7275e-8a23-4dde-8b87-9ba131f2de79',
  'document.residence_document.selfie.mime_type': 'b83cf761-ae60-4ab5-aa54-0900fdbd3b22',
  'document.residence_document.state': 'Illinois',
  'document.residence_document.us_issuing_state': 'Oregon',
  'document.ssn_card.image': 'in ut cupidatat',
  'document.visa.address_line1': '22104 Murray Roads Apt. 803',
  'document.visa.back.image': 'labore sed',
  'document.visa.back.mime_type': 'quis',
  'document.visa.city': 'Kochboro',
  'document.visa.classified_document_type': 'minim magna ut voluptate in',
  'document.visa.clave_de_elector': 'pariatur laborum irure ut',
  'document.visa.curp': 'cupidatat cillum esse Ut',
  'document.visa.curp_validation_response': 'eb01dee9-040e-4977-961e-9d91b1428a97',
  'document.visa.dob': 'eiusmod ad',
  'document.visa.document_number': 'elit',
  'document.visa.expires_at': 'Ut cupidatat elit reprehenderit nisi',
  'document.visa.first_name': 'Meredith',
  'document.visa.front.image': 'et esse aute velit minim',
  'document.visa.front.mime_type': 'ullamco et',
  'document.visa.full_address': '58026 Charlene Brooks Apt. 903',
  'document.visa.full_name': 'Ed Schaefer',
  'document.visa.gender': 'pariatur anim officia',
  'document.visa.issued_at': 'pariatur non',
  'document.visa.issuing_country': 'Denmark',
  'document.visa.issuing_state': 'West Virginia',
  'document.visa.last_name': 'Crona',
  'document.visa.nationality': 'nostrud elit consequat',
  'document.visa.postal_code': 'quis dolore Lorem',
  'document.visa.ref_number': 'eu commodo',
  'document.visa.samba_activity_history_response': 'esse dolore eu ipsum deserunt',
  'document.visa.selfie.image': 'laboris reprehenderit',
  'document.visa.selfie.mime_type': 'ex labore',
  'document.visa.state': 'Mississippi',
  'document.visa.us_issuing_state': 'Arizona',
  'document.voter_identification.address_line1': '1769 Dangelo Lakes Apt. 779',
  'document.voter_identification.back.image': '14a2400b-f930-41e5-b8c3-ffc98e573e7d',
  'document.voter_identification.back.mime_type': 'c6153af2-50aa-4974-9a14-ae5afc3cf22a',
  'document.voter_identification.city': 'Arnoldoville',
  'document.voter_identification.classified_document_type': '299c751a-fc13-4586-960f-3427f18d5fb6',
  'document.voter_identification.clave_de_elector': '84c9a6c9-4bec-4446-a583-c910ff66455e',
  'document.voter_identification.curp': '49082a77-3294-43e0-b1dd-25fd7b9fdf94',
  'document.voter_identification.curp_validation_response': 'e91124dd-759d-4462-9c95-f5c97877e47c',
  'document.voter_identification.dob': '7ebe28b9-2e88-4f3b-836d-6275651adc09',
  'document.voter_identification.document_number': 'e1cc6f7f-6b56-4bf5-84a3-ed898a01d784',
  'document.voter_identification.expires_at': 'c64d5ab7-1dda-45e1-a094-fc439260f52b',
  'document.voter_identification.first_name': 'Raymundo',
  'document.voter_identification.front.image': '2268e77a-edb8-40e2-911b-d6cc801dc398',
  'document.voter_identification.front.mime_type': '36b6f3a7-4a19-4d2c-aa64-9c55b75f2cf7',
  'document.voter_identification.full_address': '973 Zulauf Island Suite 282',
  'document.voter_identification.full_name': 'Adam Kuphal',
  'document.voter_identification.gender': 'b20fb0fa-226e-44bf-9c94-130180ed251e',
  'document.voter_identification.issued_at': 'd453f3d2-ccf1-4a5b-a247-4f108a7b0cdd',
  'document.voter_identification.issuing_country': 'Switzerland',
  'document.voter_identification.issuing_state': 'Nevada',
  'document.voter_identification.last_name': 'Balistreri',
  'document.voter_identification.nationality': '90726cd4-e76b-4246-9be8-8c65e13f00f5',
  'document.voter_identification.postal_code': '6c9602ff-74be-4062-829e-88ae740e66e1',
  'document.voter_identification.ref_number': '8d83bf2f-748a-4dd9-874d-b810c27627aa',
  'document.voter_identification.samba_activity_history_response': '9b285252-0001-42db-89dc-20b8aec5be17',
  'document.voter_identification.selfie.image': 'f3141dae-bcbe-481e-9542-3be8fd9a24b9',
  'document.voter_identification.selfie.mime_type': '1e05acf6-7455-4106-978b-d0c93eb523f2',
  'document.voter_identification.state': 'Kansas',
  'document.voter_identification.us_issuing_state': 'Wyoming',
  'id.address_line1': '5047 S Center Street Apt. 110',
  'id.address_line2': '2000 1st Street Suite 604',
  'id.citizenships': ['CA'],
  'id.city': 'Dietrichworth',
  'id.country': 'Lebanon',
  'id.dob': '665ad4f3-f1c0-4a8f-8810-436f4be58f1c',
  'id.drivers_license_number': '519440c5-1e3a-4c24-a09e-2fdc78c6caf4',
  'id.drivers_license_state': 'New Hampshire',
  'id.email': 'margarett57@gmail.com',
  'id.first_name': 'Rosetta',
  'id.itin': '4674fbb8-c3c2-4bd0-b329-66c896355da8',
  'id.last_name': 'Cartwright',
  'id.middle_name': "Nora O'Connell",
  'id.nationality': '7398d193-3356-4551-bace-0aa2a87425e1',
  'id.phone_number': '+18925454753',
  'id.ssn4': 'f2b6b867-9f27-4e29-be2b-8d4f866eec7f',
  'id.ssn9': '2e48e547-66a3-4624-b9f8-9e92edf4f915',
  'id.state': 'North Dakota',
  'id.us_legal_status': 'e4467740-9536-4a10-a9e8-6410778344c8',
  'id.us_tax_id': '2ee95c33-c756-4531-ad45-9ad974f4bd89',
  'id.visa_expiration_date': 'ec2b71b7-00f0-4006-97fa-d22b075b39d2',
  'id.visa_kind': '5979e57b-aa0d-4a94-86d7-1b429688e52e',
  'id.zip': '94782-8986',
  'investor_profile.annual_income': 'enim consectetur magna consequat exercitation',
  'investor_profile.brokerage_firm_employer': 'occaecat',
  'investor_profile.declarations': ['family_of_political_figure'],
  'investor_profile.employer': 'irure Duis dolor fugiat do',
  'investor_profile.employment_status': 'aliquip qui',
  'investor_profile.family_member_names': ['Mr. Geoffrey Bauch'],
  'investor_profile.funding_sources': ['savings'],
  'investor_profile.investment_goals': ['growth', 'income', 'preserve_capital'],
  'investor_profile.net_worth': 'veniam incididunt ex sed fugiat',
  'investor_profile.occupation': 'in anim',
  'investor_profile.political_organization': 'occaecat laboris ut do',
  'investor_profile.risk_tolerance': 'laborum in',
  'investor_profile.senior_executive_symbols': ['sed eiusmod veniam dolor'],
};
export const hosted_NeuroIdentityIdResponse: NeuroIdentityIdResponse = {
  id: '2aac561e-b62a-4362-9120-92c3d84dcb6f',
};
export const hosted_ObConfigurationKind: ObConfigurationKind = 'document';
export const hosted_OnboardingRequirement: OnboardingRequirement = {
  authMethodKind: 'email',
  kind: 'register_auth_method',
};
export const hosted_OnboardingRequirementAuthorize: OnboardingRequirementAuthorize = {
  authorizedAt: '1942-02-21T01:33:48.0Z',
  fieldsToAuthorize: {
    collectedData: ['dob', 'nationality', 'business_phone_number'],
    documentTypes: ['proof_of_address', 'visa', 'residence_document'],
  },
  kind: 'authorize',
};
export const hosted_OnboardingRequirementCollectBusinessData: OnboardingRequirementCollectBusinessData = {
  kind: 'collect_business_data',
  missingAttributes: ['nationality', 'business_phone_number', 'nationality'],
  populatedAttributes: ['ssn4', 'business_website', 'email'],
  recollectAttributes: ['business_name', 'us_legal_status', 'ssn4'],
};
export const hosted_OnboardingRequirementCollectData: OnboardingRequirementCollectData = {
  kind: 'collect_data',
  missingAttributes: ['phone_number', 'business_name', 'email'],
  optionalAttributes: ['dob', 'us_legal_status', 'business_website'],
  populatedAttributes: ['business_name', 'phone_number', 'us_legal_status'],
  recollectAttributes: ['business_address', 'phone_number', 'us_legal_status'],
};
export const hosted_OnboardingRequirementCollectDocument: OnboardingRequirementCollectDocument = {
  config: {
    kind: 'identity',
    shouldCollectConsent: false,
    shouldCollectSelfie: false,
    supportedCountryAndDocTypes: {},
  },
  documentRequestId: '25527580-8e93-4f41-be3b-0d840cf2060a',
  kind: 'collect_document',
  uploadSettings: 'prefer_capture',
};
export const hosted_OnboardingRequirementCollectInvestorProfile: OnboardingRequirementCollectInvestorProfile = {
  kind: 'collect_investor_profile',
  missingAttributes: ['business_kyced_beneficial_owners', 'business_phone_number', 'dob'],
  missingDocument: false,
  populatedAttributes: ['name', 'us_tax_id', 'investor_profile'],
};
export const hosted_OnboardingRequirementCreateBusinessOnboarding: OnboardingRequirementCreateBusinessOnboarding = {
  kind: 'create_business_onboarding',
  requiresBusinessSelection: true,
};
export const hosted_OnboardingRequirementProcess: OnboardingRequirementProcess = {
  kind: 'process',
};
export const hosted_OnboardingRequirementRegisterAuthMethod: OnboardingRequirementRegisterAuthMethod = {
  authMethodKind: 'email',
  kind: 'register_auth_method',
};
export const hosted_OnboardingRequirementRegisterPasskey: OnboardingRequirementRegisterPasskey = {
  kind: 'liveness',
};
export const hosted_OnboardingResponse: OnboardingResponse = {
  authToken: '47a04282-eeab-4b1b-8620-2201f48afa8f',
};
export const hosted_OnboardingSessionResponse: OnboardingSessionResponse = {
  bootstrapData: {},
};
export const hosted_OnboardingStatusResponse: OnboardingStatusResponse = {
  allRequirements: [
    {
      isMet: false,
      kind: 'process',
    },
    {
      isMet: true,
      kind: 'process',
    },
    {
      isMet: false,
      kind: 'process',
    },
  ],
};
export const hosted_PostBusinessOnboardingRequest: PostBusinessOnboardingRequest = {
  inheritBusinessId: 'f6863402-d987-4c0d-bb28-6f65d008a1ef',
  kybFixtureResult: 'manual_review',
};
export const hosted_PostOnboardingRequest: PostOnboardingRequest = {
  fixtureResult: 'manual_review',
};
export const hosted_ProcessRequest: ProcessRequest = {
  fixtureResult: 'pass',
};
export const hosted_PublicOnboardingConfiguration: PublicOnboardingConfiguration = {
  allowInternationalResidents: false,
  allowedOrigins: ['enim quis consectetur', 'aliqua ut Duis et do', 'veniam dolore elit fugiat'],
  appClipExperienceId: 'db359bd3-ee8a-4fef-b50d-92d64e777bcc',
  appearance: {},
  canMakeRealDocScanCallsInSandbox: false,
  isAppClipEnabled: true,
  isInstantAppEnabled: false,
  isKyb: true,
  isLive: false,
  isNoPhoneFlow: true,
  isStepupEnabled: false,
  key: 'e4d7583c-9731-4364-9ef8-da5ecf8a1364',
  kind: 'auth',
  logoUrl: 'https://wry-creator.net/',
  name: 'Ramon Schmeler',
  nidEnabled: true,
  orgId: '8484d541-2eae-4585-91a6-d374f5b8d937',
  orgName: 'Darrel Thiel',
  privacyPolicyUrl: 'https://jaunty-husband.org/',
  requiredAuthMethods: ['passkey', 'passkey', 'email'],
  requiresIdDoc: true,
  skipConfirm: true,
  status: 'disabled',
  supportEmail: 'lafayette75@gmail.com',
  supportPhone: '+16923112870',
  supportWebsite: 'https://inconsequential-tarragon.name/',
  supportedCountries: ['QA', 'GU', 'MD'],
  workflowRequest: {
    config: {
      data: {
        playbookId: '2ef183f9-4fee-4c7e-afde-ff90b25503af',
        recollectAttributes: ['email', 'bank', 'full_address'],
        reuseExistingBoKyc: true,
      },
      kind: 'onboard',
    },
    note: 'sed quis exercitation et',
  },
};
export const hosted_RegisterPasskeyAttemptContext: RegisterPasskeyAttemptContext = {
  elapsedTimeInOsPromptMs: 50920410,
  errorMessage: 'ipsum enim',
};
export const hosted_RenderV1SdkArgs: RenderV1SdkArgs = {
  authToken: '20ab2344-79b9-4157-864f-6a2d827c4cdb',
  canCopy: false,
  defaultHidden: true,
  id: 'document.passport.back.image',
  label: 'anim ad',
  showHiddenToggle: true,
};
export const hosted_RequestedTokenScope: RequestedTokenScope = 'auth';
export const hosted_SdkArgs: SdkArgs = {
  data: {
    authToken: 'ca2782a5-a6f0-41e9-86a8-44270f743174',
    documentFixtureResult: 'pass',
    fixtureResult: 'pass',
    isComponentsSdk: false,
    l10N: {
      language: 'en',
      locale: 'en-US',
    },
    options: {
      showCompletionPage: true,
      showLogo: false,
    },
    publicKey: '5aa8dcbf-1691-4fbb-90af-614e08428f1a',
    sandboxId: '65880c05-2939-4082-967a-f003e1be2d79',
    shouldRelayToComponents: false,
    userData: {},
  },
  kind: 'verify_v1',
};
export const hosted_SdkArgsAuthV1: SdkArgsAuthV1 = {
  data: {
    l10N: {
      language: 'en',
      locale: 'en-US',
    },
    options: {
      showLogo: true,
    },
    publicKey: '360d5efa-5c95-498e-b52f-a0c4e3a1d48c',
    userData: {},
  },
  kind: 'auth_v1',
};
export const hosted_SdkArgsFormV1: SdkArgsFormV1 = {
  data: {
    authToken: '4aac6470-26c7-418d-a164-6c343eb1e60a',
    l10N: {
      language: 'en',
      locale: 'en-US',
    },
    options: {
      hideButtons: true,
      hideCancelButton: true,
      hideFootprintLogo: true,
    },
    title: 'amet',
  },
  kind: 'form_v1',
};
export const hosted_SdkArgsRenderV1: SdkArgsRenderV1 = {
  data: {
    authToken: '6bc8ffde-ab80-4517-ac75-32967bde8b97',
    canCopy: true,
    defaultHidden: true,
    id: 'document.visa.curp_validation_response',
    label: 'in enim sunt Duis culpa',
    showHiddenToggle: true,
  },
  kind: 'render_v1',
};
export const hosted_SdkArgsUpdateAuthMethodsV1: SdkArgsUpdateAuthMethodsV1 = {
  data: {
    authToken: '638fdcb3-4bea-4cf5-beab-bd444da8d884',
    l10N: {
      language: 'en',
      locale: 'en-US',
    },
    options: {
      showLogo: false,
    },
  },
  kind: 'update_auth_methods_v1',
};
export const hosted_SdkArgsVerifyResultV1: SdkArgsVerifyResultV1 = {
  data: {
    authToken: 'df86c475-af04-48eb-ae48-61c34b74850b',
    deviceResponse: 'Duis sint et mollit cupidatat',
  },
  kind: 'verify_result_v1',
};
export const hosted_SdkArgsVerifyV1: SdkArgsVerifyV1 = {
  data: {
    authToken: 'f1b649c1-f826-411f-beb7-279d6ab6c382',
    documentFixtureResult: 'pass',
    fixtureResult: 'pass',
    isComponentsSdk: true,
    l10N: {
      language: 'en',
      locale: 'en-US',
    },
    options: {
      showCompletionPage: true,
      showLogo: true,
    },
    publicKey: 'b9e37d22-f3a8-4e52-a42d-3f9df43bd573',
    sandboxId: 'b04edc68-9f52-4483-90cb-34ad1eac70c3',
    shouldRelayToComponents: false,
    userData: {},
  },
  kind: 'verify_v1',
};
export const hosted_SignupChallengeRequest: SignupChallengeRequest = {
  challengeKind: 'biometric',
  email: {
    isBootstrap: true,
    value: 'ad voluptate aliqua',
  },
  phoneNumber: {
    isBootstrap: false,
    value: 'sed consequat proident',
  },
  scope: 'auth',
};
export const hosted_SkipLivenessClientType: SkipLivenessClientType = 'mobile';
export const hosted_SkipLivenessContext: SkipLivenessContext = {
  attempts: [
    {
      elapsedTimeInOsPromptMs: -60840819,
      errorMessage: 'nostrud',
    },
    {
      elapsedTimeInOsPromptMs: 53713776,
      errorMessage: 'sed',
    },
    {
      elapsedTimeInOsPromptMs: -46265364,
      errorMessage: 'quis occaecat',
    },
  ],
  clientType: 'mobile',
  numAttempts: -70626919,
  reason: 'exercitation pariatur ad voluptate',
};
export const hosted_SkipPasskeyRegisterRequest: SkipPasskeyRegisterRequest = {
  context: {
    attempts: [
      {
        elapsedTimeInOsPromptMs: 60574509,
        errorMessage: 'eu officia',
      },
      {
        elapsedTimeInOsPromptMs: 22745737,
        errorMessage: 'Duis eu et',
      },
      {
        elapsedTimeInOsPromptMs: 38177811,
        errorMessage: 'est',
      },
    ],
    clientType: 'web',
    numAttempts: -16413372,
    reason: 'nostrud fugiat minim',
  },
};
export const hosted_SocureDeviceSessionIdRequest: SocureDeviceSessionIdRequest = {
  deviceSessionId: 'aabc0131-5d76-4f0b-9592-6ff8f90596b0',
};
export const hosted_StytchTelemetryRequest: StytchTelemetryRequest = {
  telemetryId: '7fab7c7a-7b8f-4b18-9d88-9c7afd4623ff',
};
export const hosted_UpdateAuthMethodsV1SdkArgs: UpdateAuthMethodsV1SdkArgs = {
  authToken: '85699da6-181e-4da0-97a4-df1ebe0a6499',
  l10N: {
    language: 'en',
    locale: 'en-US',
  },
  options: {
    showLogo: true,
  },
};
export const hosted_UpdateOrCreateHostedBusinessOwnerRequest: UpdateOrCreateHostedBusinessOwnerRequest = {
  data: {
    'bank.*.account_type': 'pariatur eu reprehenderit cupidatat',
    'bank.*.ach_account_id': 'c3b47ed4-3f11-4380-bec1-d9df2ca35f5a',
    'bank.*.ach_account_number': 'non pariatur',
    'bank.*.ach_routing_number': 'aliqua officia deserunt',
    'bank.*.fingerprint': 'ea in mollit proident',
    'bank.*.name': 'Alison Wintheiser',
    'card.*.billing_address.country': '7323 Wade Cove Suite 423',
    'card.*.billing_address.zip': '94317 Lowe Pike Apt. 553',
    'card.*.cvc': 'irure Ut in tempor dolore',
    'card.*.expiration': 'aute incididunt amet dolor',
    'card.*.expiration_month': 'ut elit occaecat',
    'card.*.expiration_year': 'ex nostrud',
    'card.*.fingerprint': 'Duis nostrud eu ut',
    'card.*.issuer': 'fugiat',
    'card.*.name': 'Mario Kuvalis',
    'card.*.number': 'reprehenderit do deserunt enim',
    'card.*.number_last4': 'minim esse',
    'custom.*': 'et',
    'document.custom.*': 'non pariatur quis exercitation qui',
    'document.drivers_license.address_line1': '903 Yundt Crescent Apt. 674',
    'document.drivers_license.back.image': 'eiusmod et',
    'document.drivers_license.back.mime_type': 'cupidatat',
    'document.drivers_license.city': 'Fort Moseschester',
    'document.drivers_license.classified_document_type': 'enim ex amet',
    'document.drivers_license.clave_de_elector': 'officia sed',
    'document.drivers_license.curp': 'tempor enim',
    'document.drivers_license.curp_validation_response': '5c429b88-8302-4627-af65-cc3a57e80e7c',
    'document.drivers_license.dob': 'proident nostrud',
    'document.drivers_license.document_number': 'aute Lorem quis',
    'document.drivers_license.expires_at': 'irure cillum labore elit veniam',
    'document.drivers_license.first_name': 'Dexter',
    'document.drivers_license.front.image': 'nostrud',
    'document.drivers_license.front.mime_type': 'anim sed ipsum ad',
    'document.drivers_license.full_address': '5087 Karl Forest Suite 939',
    'document.drivers_license.full_name': "Lela O'Hara-Keeling",
    'document.drivers_license.gender': 'sed sint quis dolore velit',
    'document.drivers_license.issued_at': 'sint labore',
    'document.drivers_license.issuing_country': 'United Kingdom',
    'document.drivers_license.issuing_state': 'Florida',
    'document.drivers_license.last_name': 'Spinka',
    'document.drivers_license.nationality': 'minim officia sit enim',
    'document.drivers_license.postal_code': 'ea',
    'document.drivers_license.ref_number': 'aliquip mollit pariatur in sed',
    'document.drivers_license.samba_activity_history_response': 'irure laboris sint',
    'document.drivers_license.selfie.image': 'consectetur amet',
    'document.drivers_license.selfie.mime_type': 'tempor ut irure',
    'document.drivers_license.state': 'Pennsylvania',
    'document.drivers_license.us_issuing_state': 'New Mexico',
    'document.finra_compliance_letter': 'quis',
    'document.id_card.address_line1': '1857 Al Course Apt. 815',
    'document.id_card.back.image': '0fac034b-3d74-4125-85d3-92102d5471be',
    'document.id_card.back.mime_type': '832f07a4-954a-4432-97d4-8d8b13ab7daa',
    'document.id_card.city': 'Bellamouth',
    'document.id_card.classified_document_type': '84a2e1a2-d1ea-4916-a31b-de0dda95891b',
    'document.id_card.clave_de_elector': 'feb9c48a-e409-4569-b73c-f07e94110045',
    'document.id_card.curp': 'a9dd9076-339b-4a17-8445-f591dd4737e1',
    'document.id_card.curp_validation_response': '978de5bc-54d7-466b-8c64-8a333796f116',
    'document.id_card.dob': 'e44be8a1-f9df-4d11-b1c1-629ce0aaf872',
    'document.id_card.document_number': '8b4dc959-499b-4453-8e39-99b3e56f7bc5',
    'document.id_card.expires_at': 'fa81ece8-8f9e-40ec-84b1-576fa53fa4c9',
    'document.id_card.first_name': 'Deon',
    'document.id_card.front.image': 'e418714e-07d5-4799-8a3c-4ed0fe70e8d5',
    'document.id_card.front.mime_type': '056e2072-7d56-4daa-9a9f-2b5f922a31d9',
    'document.id_card.full_address': '821 S Main Suite 573',
    'document.id_card.full_name': 'Gretchen Osinski',
    'document.id_card.gender': 'c208924e-ab2e-40f9-81c2-1e001cd01c08',
    'document.id_card.issued_at': '985decba-c31c-43f1-a0dd-bfa949070787',
    'document.id_card.issuing_country': 'Poland',
    'document.id_card.issuing_state': 'Kansas',
    'document.id_card.last_name': 'Waelchi',
    'document.id_card.nationality': 'e42b7d36-228d-4b3b-b2eb-8b9cc7cce8f2',
    'document.id_card.postal_code': 'db90b7a7-cad1-4444-a37a-bc3a2cf1dd06',
    'document.id_card.ref_number': '1ea801b8-3670-451e-b4e3-e53af85dd43b',
    'document.id_card.samba_activity_history_response': '3d21fe95-16bf-4b4d-ae62-6e863aad0395',
    'document.id_card.selfie.image': '21eed194-bacb-4865-8507-bf4eaaaacda8',
    'document.id_card.selfie.mime_type': '4d2f561c-1ec4-420a-9cb6-4676d4bec0f9',
    'document.id_card.state': 'Colorado',
    'document.id_card.us_issuing_state': 'Massachusetts',
    'document.passport.address_line1': '470 Main Street W Suite 336',
    'document.passport.back.image': 'voluptate qui dolor et labore',
    'document.passport.back.mime_type': 'mollit ut',
    'document.passport.city': 'Port Stephanystead',
    'document.passport.classified_document_type': 'sint nostrud incididunt',
    'document.passport.clave_de_elector': 'esse',
    'document.passport.curp': 'enim ipsum do veniam dolore',
    'document.passport.curp_validation_response': '8da9e1db-5330-44ff-ad26-7ab6a8b87144',
    'document.passport.dob': 'fugiat',
    'document.passport.document_number': 'amet non est',
    'document.passport.expires_at': 'deserunt eiusmod aute anim',
    'document.passport.first_name': 'Darwin',
    'document.passport.front.image': 'adipisicing ut sed',
    'document.passport.front.mime_type': 'velit consequat',
    'document.passport.full_address': '95998 E 8th Street Apt. 607',
    'document.passport.full_name': 'Zachary Lebsack IV',
    'document.passport.gender': 'amet',
    'document.passport.issued_at': 'irure sint nisi consequat dolore',
    'document.passport.issuing_country': 'Saint Pierre and Miquelon',
    'document.passport.issuing_state': 'Vermont',
    'document.passport.last_name': 'Gleichner',
    'document.passport.nationality': 'pariatur quis',
    'document.passport.postal_code': 'minim deserunt aliquip mollit nostrud',
    'document.passport.ref_number': 'consequat veniam ex',
    'document.passport.samba_activity_history_response': 'reprehenderit commodo Excepteur Duis esse',
    'document.passport.selfie.image': 'aliquip in commodo ut',
    'document.passport.selfie.mime_type': 'ut minim culpa dolor irure',
    'document.passport.state': 'Wyoming',
    'document.passport.us_issuing_state': 'Kentucky',
    'document.passport_card.address_line1': '92508 S Maple Street Apt. 177',
    'document.passport_card.back.image': 'do fugiat labore laborum Duis',
    'document.passport_card.back.mime_type': 'do ad laboris quis in',
    'document.passport_card.city': 'East Verda',
    'document.passport_card.classified_document_type': 'Ut esse dolore in labore',
    'document.passport_card.clave_de_elector': 'eu ut ipsum',
    'document.passport_card.curp': 'Duis non nostrud id',
    'document.passport_card.curp_validation_response': 'b115e7be-9b4b-40a3-a09e-56ad8223db1f',
    'document.passport_card.dob': 'qui quis labore dolore id',
    'document.passport_card.document_number': 'dolore tempor anim',
    'document.passport_card.expires_at': 'in aliquip laborum',
    'document.passport_card.first_name': 'Isabelle',
    'document.passport_card.front.image': 'esse non sint',
    'document.passport_card.front.mime_type': 'ipsum velit',
    'document.passport_card.full_address': '754 Jast Views Suite 925',
    'document.passport_card.full_name': 'Phil Boehm-Pfannerstill',
    'document.passport_card.gender': 'eu consectetur non sed',
    'document.passport_card.issued_at': 'dolor cillum ex nulla',
    'document.passport_card.issuing_country': 'Portugal',
    'document.passport_card.issuing_state': 'Vermont',
    'document.passport_card.last_name': 'Gerhold',
    'document.passport_card.nationality': 'deserunt ut',
    'document.passport_card.postal_code': 'tempor',
    'document.passport_card.ref_number': 'consectetur pariatur amet fugiat Excepteur',
    'document.passport_card.samba_activity_history_response': 'Lorem nulla proident',
    'document.passport_card.selfie.image': 'occaecat ea quis',
    'document.passport_card.selfie.mime_type': 'dolor tempor minim consequat sint',
    'document.passport_card.state': 'Virginia',
    'document.passport_card.us_issuing_state': 'Kansas',
    'document.permit.address_line1': '57162 Francesca Ridge Apt. 837',
    'document.permit.back.image': 'Lorem consectetur magna',
    'document.permit.back.mime_type': 'enim dolore',
    'document.permit.city': 'Kenworth',
    'document.permit.classified_document_type': 'esse adipisicing irure dolore',
    'document.permit.clave_de_elector': 'laborum',
    'document.permit.curp': 'amet mollit laboris eu',
    'document.permit.curp_validation_response': '46d5653f-e625-4066-bbe0-17691906904d',
    'document.permit.dob': 'occaecat sint',
    'document.permit.document_number': 'tempor et',
    'document.permit.expires_at': 'sed irure deserunt exercitation',
    'document.permit.first_name': 'Cullen',
    'document.permit.front.image': 'aliqua dolor consectetur dolore',
    'document.permit.front.mime_type': 'sunt',
    'document.permit.full_address': '470 Walter Trail Suite 298',
    'document.permit.full_name': 'Michael Hayes Jr.',
    'document.permit.gender': 'enim',
    'document.permit.issued_at': 'minim ea laboris do',
    'document.permit.issuing_country': 'United Arab Emirates',
    'document.permit.issuing_state': 'Nebraska',
    'document.permit.last_name': 'Dach-Bergstrom',
    'document.permit.nationality': 'pariatur ea dolor',
    'document.permit.postal_code': 'qui consectetur ullamco',
    'document.permit.ref_number': 'magna cillum ad dolore',
    'document.permit.samba_activity_history_response': 'laborum Ut eiusmod',
    'document.permit.selfie.image': 'non incididunt do',
    'document.permit.selfie.mime_type': 'voluptate Duis ad consequat consectetur',
    'document.permit.state': 'South Dakota',
    'document.permit.us_issuing_state': 'Missouri',
    'document.proof_of_address.image': '68684 Jannie Ports Apt. 492',
    'document.residence_document.address_line1': '9222 12th Street Apt. 103',
    'document.residence_document.back.image': 'df1baef3-7c65-4691-bf3b-b38ffcb4274a',
    'document.residence_document.back.mime_type': 'd4275c02-60ab-46be-817a-9cb530a1c435',
    'document.residence_document.city': 'Taliatown',
    'document.residence_document.classified_document_type': '1c26ff1f-b463-481a-9d02-aaeb1241297d',
    'document.residence_document.clave_de_elector': '8282e2c2-b405-494f-8ae9-d164ed7440eb',
    'document.residence_document.curp': '1f052704-799b-4c1c-b050-e543688b03df',
    'document.residence_document.curp_validation_response': 'ebc4707e-9858-48da-ad87-71e34eed321f',
    'document.residence_document.dob': '34b618d2-35f0-43de-bcf1-96f94e3ba302',
    'document.residence_document.document_number': '38a6f9f2-bedf-4151-b550-d2772994beab',
    'document.residence_document.expires_at': 'd5913254-c693-478d-a7b6-4df7145aadab',
    'document.residence_document.first_name': 'Leann',
    'document.residence_document.front.image': '94d1d6d9-a59b-4281-b491-e7d98cc48abb',
    'document.residence_document.front.mime_type': '87592282-1ad7-42ab-8f91-60aef04fa731',
    'document.residence_document.full_address': '4944 Williamson Burg Suite 517',
    'document.residence_document.full_name': 'Lori Wolf',
    'document.residence_document.gender': 'abacf971-5da5-4d27-8bed-63baa723a3fd',
    'document.residence_document.issued_at': 'c33de017-77c3-4a16-8132-22e1b2463a22',
    'document.residence_document.issuing_country': 'Bangladesh',
    'document.residence_document.issuing_state': 'Arkansas',
    'document.residence_document.last_name': 'Marks',
    'document.residence_document.nationality': '6db72b56-d093-437a-8cf1-2f14cadc4224',
    'document.residence_document.postal_code': 'e5fd923b-bee0-42be-9d79-e40b1a5e2099',
    'document.residence_document.ref_number': 'a0c1ae08-162f-45d4-b8e7-75be212f04d7',
    'document.residence_document.samba_activity_history_response': '645da6ea-e8c2-4af2-abe3-59193e3ef64b',
    'document.residence_document.selfie.image': 'fce14d86-b9d1-4799-82c7-14dd8c76357e',
    'document.residence_document.selfie.mime_type': 'bb6f2a24-dd9e-4abf-9ebb-794783668712',
    'document.residence_document.state': 'Kansas',
    'document.residence_document.us_issuing_state': 'Minnesota',
    'document.ssn_card.image': 'adipisicing anim ut enim aliquip',
    'document.visa.address_line1': '5450 E Jefferson Street Apt. 203',
    'document.visa.back.image': 'ipsum in dolor et labore',
    'document.visa.back.mime_type': 'Excepteur eu ad amet minim',
    'document.visa.city': 'Carmencester',
    'document.visa.classified_document_type': 'minim adipisicing sunt aliquip',
    'document.visa.clave_de_elector': 'officia',
    'document.visa.curp': 'in dolore ipsum fugiat consequat',
    'document.visa.curp_validation_response': '884fc769-5572-489d-9820-acdffdb9c867',
    'document.visa.dob': 'nisi do',
    'document.visa.document_number': 'nulla occaecat sunt',
    'document.visa.expires_at': 'mollit non qui nulla eiusmod',
    'document.visa.first_name': 'Kiley',
    'document.visa.front.image': 'adipisicing mollit',
    'document.visa.front.mime_type': 'occaecat aliqua',
    'document.visa.full_address': '7833 County Line Road Apt. 341',
    'document.visa.full_name': 'Minnie Koepp',
    'document.visa.gender': 'in',
    'document.visa.issued_at': 'Excepteur in proident ea',
    'document.visa.issuing_country': 'Turkey',
    'document.visa.issuing_state': 'Washington',
    'document.visa.last_name': 'Hintz',
    'document.visa.nationality': 'deserunt nulla',
    'document.visa.postal_code': 'est in quis',
    'document.visa.ref_number': 'culpa in qui',
    'document.visa.samba_activity_history_response': 'velit deserunt nisi voluptate anim',
    'document.visa.selfie.image': 'sed dolor est et cillum',
    'document.visa.selfie.mime_type': 'sit ad reprehenderit irure',
    'document.visa.state': 'Oregon',
    'document.visa.us_issuing_state': 'Maine',
    'document.voter_identification.address_line1': '317 W 1st Street Suite 153',
    'document.voter_identification.back.image': '65b75b8f-dea8-43d3-9ec1-c33dcc8cded5',
    'document.voter_identification.back.mime_type': '06a69f19-6fda-45e0-acde-e440b6cb8e2b',
    'document.voter_identification.city': 'Luigiview',
    'document.voter_identification.classified_document_type': '0cae6462-bddc-476f-aa18-ceacfc86a5f2',
    'document.voter_identification.clave_de_elector': '4bf6fd46-dbf0-485c-89a0-143fb0f95807',
    'document.voter_identification.curp': 'e6298ad0-ca7e-4917-a229-2fda0753e760',
    'document.voter_identification.curp_validation_response': '31e06af7-45d4-4855-8ab5-b916b59ca7ae',
    'document.voter_identification.dob': 'a9667195-4d07-4337-9d4f-8105c35abed4',
    'document.voter_identification.document_number': '318ee39e-a3bd-425f-b4f0-016aee1a70b8',
    'document.voter_identification.expires_at': '2bfe87db-6da9-404d-af55-f42fe41cb188',
    'document.voter_identification.first_name': 'Abbey',
    'document.voter_identification.front.image': '5833da00-96a9-4046-9262-d9ba5493499f',
    'document.voter_identification.front.mime_type': 'd597d2e8-d5fe-40ab-8606-494fbb70986e',
    'document.voter_identification.full_address': '6053 Eusebio Falls Suite 563',
    'document.voter_identification.full_name': 'Mrs. Kayla Fahey',
    'document.voter_identification.gender': 'ab56e050-62d8-4804-b840-3e9988a6ddc3',
    'document.voter_identification.issued_at': '0dbc3181-6a4b-4dc9-adc3-b88bb64c62ef',
    'document.voter_identification.issuing_country': 'Zambia',
    'document.voter_identification.issuing_state': 'Minnesota',
    'document.voter_identification.last_name': 'Pagac',
    'document.voter_identification.nationality': 'd0e2b6f3-0577-47ac-b761-01dd2ac77c53',
    'document.voter_identification.postal_code': 'bc8ac70e-d398-4834-acc6-55d8e31a515a',
    'document.voter_identification.ref_number': 'c0d37987-c1c5-412f-a348-d61970785f05',
    'document.voter_identification.samba_activity_history_response': '52fd9d2b-f93a-44d4-8e62-8549098cdad7',
    'document.voter_identification.selfie.image': '614e1a78-7feb-498f-8b5a-5dd45ef3d9e0',
    'document.voter_identification.selfie.mime_type': '6923e2ae-c679-4704-848d-5a391de6c1d8',
    'document.voter_identification.state': 'Oregon',
    'document.voter_identification.us_issuing_state': 'Missouri',
    'id.address_line1': '57573 Kelley Causeway Apt. 915',
    'id.address_line2': '652 Chestnut Street Suite 587',
    'id.citizenships': ['CA'],
    'id.city': 'East Ubaldofort',
    'id.country': 'Guinea-Bissau',
    'id.dob': 'd9c1533c-d14b-4abc-b6a6-8ecbe98a5f0c',
    'id.drivers_license_number': '19390a8b-9a66-4481-8d65-1a043c6d2dcb',
    'id.drivers_license_state': 'Indiana',
    'id.email': 'vince.mraz22@gmail.com',
    'id.first_name': 'Colby',
    'id.itin': '3bd79b5a-741e-4b7b-abef-12048e662295',
    'id.last_name': 'Friesen',
    'id.middle_name': 'Eunice Friesen',
    'id.nationality': '4088f0b8-460b-49d2-a09f-1a2cff464bc1',
    'id.phone_number': '+18533177735',
    'id.ssn4': '6ca76d12-e6fa-4329-9467-4e4c4429e889',
    'id.ssn9': '69e93e8e-83e2-4128-beb2-6ab6e32cbdbb',
    'id.state': 'Oklahoma',
    'id.us_legal_status': 'd4517d41-a1df-49a6-b2aa-4461dde8aa4b',
    'id.us_tax_id': 'c9605548-d7e3-46ce-98dd-71bad8dacaf3',
    'id.visa_expiration_date': '552de6a4-50ee-4658-8280-9f930e25f2cc',
    'id.visa_kind': '310484a6-6135-450d-a3fe-743b3f99dc79',
    'id.zip': '79428',
    'investor_profile.annual_income': 'laborum dolore',
    'investor_profile.brokerage_firm_employer': 'labore',
    'investor_profile.declarations': ['affiliated_with_us_broker'],
    'investor_profile.employer': 'sit',
    'investor_profile.employment_status': 'sit dolor',
    'investor_profile.family_member_names': ['Billie Mills'],
    'investor_profile.funding_sources': ['savings'],
    'investor_profile.investment_goals': ['growth', 'income', 'preserve_capital'],
    'investor_profile.net_worth': 'laborum',
    'investor_profile.occupation': 'do aute',
    'investor_profile.political_organization': 'laborum qui nisi aute cillum',
    'investor_profile.risk_tolerance': 'cillum',
    'investor_profile.senior_executive_symbols': ['ea'],
  },
  ownershipStake: 77074481,
  uuid: '5801ab10-beb7-4447-91bc-031c4e582ad2',
};
export const hosted_UserAuthScope: UserAuthScope = 'explicit_auth';
export const hosted_UserChallengeData: UserChallengeData = {
  biometricChallengeJson: 'quis id dolore fugiat mollit',
  challengeKind: 'sms',
  challengeToken: '5cd67c7b-e409-4322-8088-c0605fdb2cff',
  timeBeforeRetryS: 99732452,
  token: 'b5471bda-9197-42d3-8509-e830179cf3f1',
};
export const hosted_UserChallengeRequest: UserChallengeRequest = {
  actionKind: 'replace',
  email: 'natalia.dicki@gmail.com',
  kind: 'passkey',
  phoneNumber: '+16262204670',
};
export const hosted_UserChallengeResponse: UserChallengeResponse = {
  biometricChallengeJson: 'in',
  challengeToken: '8d76e550-2547-4fb3-b49e-1446f09fd22f',
  timeBeforeRetryS: 81762098,
};
export const hosted_UserChallengeVerifyRequest: UserChallengeVerifyRequest = {
  challengeResponse: 'amet consequat in',
  challengeToken: 'ae283eed-992f-469c-ae7a-5efceee26a77',
};
export const hosted_UserChallengeVerifyResponse: UserChallengeVerifyResponse = {
  authToken: '624998ae-34ed-496b-89df-d67ff0734dd5',
};
export const hosted_UserDataIdentifier: UserDataIdentifier = 'card.*.expiration';
export const hosted_UserDecryptRequest: UserDecryptRequest = {
  fields: ['id.address_line1', 'document.passport_card.nationality', 'document.drivers_license.full_name'],
  reason: 'sunt adipisicing deserunt',
  transforms: ['prefix(<n>)', 'to_lowercase', 'prefix(<n>)'],
  versionAt: '1911-08-13T18:10:09.0Z',
};
export const hosted_VerifyResultV1SdkArgs: VerifyResultV1SdkArgs = {
  authToken: '79b3047d-ce81-4bb3-b509-e39bc26fa006',
  deviceResponse: 'dolor mollit et laborum',
};
export const hosted_VerifyV1Options: VerifyV1Options = {
  showCompletionPage: false,
  showLogo: false,
};
export const hosted_VerifyV1SdkArgs: VerifyV1SdkArgs = {
  authToken: 'eb3a06a8-74fa-4f88-9b91-3550e495f613',
  documentFixtureResult: 'fail',
  fixtureResult: 'step_up',
  isComponentsSdk: true,
  l10N: {
    language: 'en',
    locale: 'en-US',
  },
  options: {
    showCompletionPage: true,
    showLogo: true,
  },
  publicKey: '25a6275b-bebd-4779-a3ac-21dc260bcd88',
  sandboxId: 'd1c74d2a-eaad-4a25-af9e-cc286ae2572a',
  shouldRelayToComponents: false,
  userData: {},
};
export const hosted_WorkflowFixtureResult: WorkflowFixtureResult = 'pass';
export const hosted_WorkflowRequestConfig: WorkflowRequestConfig = {
  data: {
    playbookId: '44a4e9db-810e-460c-843b-c148ba5b40a7',
    recollectAttributes: ['bank', 'business_website', 'us_legal_status'],
    reuseExistingBoKyc: false,
  },
  kind: 'onboard',
};
export const hosted_WorkflowRequestConfigDocument: WorkflowRequestConfigDocument = {
  data: {
    businessConfigs: [
      {
        data: {
          collectSelfie: false,
          documentTypesAndCountries: {
            countrySpecific: {},
            global: ['drivers_license', 'residence_document', 'drivers_license'],
          },
        },
        kind: 'identity',
      },
      {
        data: {
          collectSelfie: true,
          documentTypesAndCountries: {
            countrySpecific: {},
            global: ['id_card', 'residence_document', 'drivers_license'],
          },
        },
        kind: 'identity',
      },
      {
        data: {
          collectSelfie: false,
          documentTypesAndCountries: {
            countrySpecific: {},
            global: ['id_card', 'id_card', 'permit'],
          },
        },
        kind: 'identity',
      },
    ],
    configs: [
      {
        data: {
          collectSelfie: false,
          documentTypesAndCountries: {
            countrySpecific: {},
            global: ['permit', 'residence_document', 'drivers_license'],
          },
        },
        kind: 'identity',
      },
      {
        data: {
          collectSelfie: false,
          documentTypesAndCountries: {
            countrySpecific: {},
            global: ['id_card', 'residence_document', 'permit'],
          },
        },
        kind: 'identity',
      },
      {
        data: {
          collectSelfie: false,
          documentTypesAndCountries: {
            countrySpecific: {},
            global: ['permit', 'visa', 'voter_identification'],
          },
        },
        kind: 'identity',
      },
    ],
  },
  kind: 'document',
};
export const hosted_WorkflowRequestConfigOnboard: WorkflowRequestConfigOnboard = {
  data: {
    playbookId: '5b5573bd-f9e8-4997-91f6-8d73aa6418a8',
    recollectAttributes: ['full_address', 'card', 'card'],
    reuseExistingBoKyc: false,
  },
  kind: 'onboard',
};
export const dashboard_ActionKind: ActionKind = 'add_primary';
export const dashboard_Actor: Actor = {
  id: '790e0e91-7999-45b8-92d6-2c9b6115af8e',
  kind: 'user',
};
export const dashboard_ActorApiKey: ActorApiKey = {
  id: 'f6d41b04-20ac-4b18-9a06-b8abe1c8fb9a',
  kind: 'api_key',
  name: 'Angelina Murray',
};
export const dashboard_ActorFirmEmployee: ActorFirmEmployee = {
  kind: 'firm_employee',
};
export const dashboard_ActorFootprint: ActorFootprint = {
  kind: 'footprint',
};
export const dashboard_ActorOrganization: ActorOrganization = {
  email: 'jon79@gmail.com',
  firstName: 'Raquel',
  kind: 'organization',
  lastName: 'Spinka',
  member: 'exercitation tempor',
};
export const dashboard_ActorUser: ActorUser = {
  id: '50c4e2c1-87c1-4ed0-bc9b-bba4aa982c59',
  kind: 'user',
};
export const dashboard_AdverseMediaListKind: AdverseMediaListKind = 'cyber_crime';
export const dashboard_AmlDetail: AmlDetail = {
  hits: [
    {
      fields: {},
      matchTypes: ['qui in sit', 'labore sunt', 'sint'],
      media: [
        {
          date: '1924-12-16T03:09:53.0Z',
          pdfUrl: 'https://poor-colon.name',
          snippet: 'non nulla',
          title: 'dolor cillum',
          url: 'https://esteemed-republican.org',
        },
        {
          date: '1920-11-18T10:26:51.0Z',
          pdfUrl: 'https://poor-colon.name',
          snippet: 'sed',
          title: 'voluptate',
          url: 'https://esteemed-republican.org',
        },
        {
          date: '1961-12-14T05:37:56.0Z',
          pdfUrl: 'https://poor-colon.name',
          snippet: 'labore deserunt consequat',
          title: 'in anim tempor incididunt do',
          url: 'https://esteemed-republican.org',
        },
      ],
      name: 'Beulah Rosenbaum',
    },
    {
      fields: {},
      matchTypes: ['aliquip', 'consequat Excepteur dolore nisi ea', 'Duis esse elit'],
      media: [
        {
          date: '1969-02-17T06:25:26.0Z',
          pdfUrl: 'https://poor-colon.name',
          snippet: 'laboris',
          title: 'proident sint dolore',
          url: 'https://esteemed-republican.org',
        },
        {
          date: '1900-08-07T16:48:17.0Z',
          pdfUrl: 'https://poor-colon.name',
          snippet: 'in deserunt consequat',
          title: 'deserunt',
          url: 'https://esteemed-republican.org',
        },
        {
          date: '1941-04-13T03:23:03.0Z',
          pdfUrl: 'https://poor-colon.name',
          snippet: 'exercitation Lorem cupidatat consectetur non',
          title: 'ullamco nulla minim',
          url: 'https://esteemed-republican.org',
        },
      ],
      name: 'Beulah Rosenbaum',
    },
    {
      fields: {},
      matchTypes: ['aute ut ullamco velit', 'ex', 'Lorem est Duis dolor aute'],
      media: [
        {
          date: '1948-12-28T13:31:45.0Z',
          pdfUrl: 'https://poor-colon.name',
          snippet: 'ipsum tempor',
          title: 'Lorem magna ipsum',
          url: 'https://esteemed-republican.org',
        },
        {
          date: '1909-02-17T14:14:30.0Z',
          pdfUrl: 'https://poor-colon.name',
          snippet: 'fugiat velit aliquip',
          title: 'nulla cillum tempor minim',
          url: 'https://esteemed-republican.org',
        },
        {
          date: '1931-12-05T07:07:14.0Z',
          pdfUrl: 'https://poor-colon.name',
          snippet: 'in ut Lorem ullamco ex',
          title: 'aute ut tempor',
          url: 'https://esteemed-republican.org',
        },
      ],
      name: 'Beulah Rosenbaum',
    },
  ],
  shareUrl: 'https://assured-jogging.us',
};
export const dashboard_AmlHit: AmlHit = {
  fields: {},
  matchTypes: ['non', 'consequat dolore nisi dolore', 'incididunt'],
  media: [
    {
      date: '1931-07-28T11:32:49.0Z',
      pdfUrl: 'https://tasty-soybean.name',
      snippet: 'culpa ullamco elit',
      title: 'pariatur consequat',
      url: 'https://old-fashioned-creature.us/',
    },
    {
      date: '1955-12-21T04:57:44.0Z',
      pdfUrl: 'https://tasty-soybean.name',
      snippet: 'magna quis',
      title: 'tempor in enim',
      url: 'https://old-fashioned-creature.us/',
    },
    {
      date: '1956-12-09T01:58:03.0Z',
      pdfUrl: 'https://tasty-soybean.name',
      snippet: 'dolor est voluptate dolor',
      title: 'nulla',
      url: 'https://old-fashioned-creature.us/',
    },
  ],
  name: 'Gwendolyn Von Sr.',
};
export const dashboard_AmlHitMedia: AmlHitMedia = {
  date: '1962-09-15T20:24:01.0Z',
  pdfUrl: 'https://inexperienced-league.us',
  snippet: 'anim ut',
  title: 'officia',
  url: 'https://agreeable-stool.us/',
};
export const dashboard_AmlMatchKind: AmlMatchKind = 'exact_name';
export const dashboard_Annotation: Annotation = {
  id: 'a715ef5a-5c3f-4ffa-8b33-e723e22a5ef2',
  isPinned: false,
  note: 'aute minim voluptate anim occaecat',
  source: {
    id: '3968d23c-b399-43d0-a7f0-781488f80219',
    kind: 'user',
  },
  timestamp: '1905-01-20T23:57:01.0Z',
};
export const dashboard_ApiKeyStatus: ApiKeyStatus = 'enabled';
export const dashboard_AssumePartnerRoleRequest: AssumePartnerRoleRequest = {
  partnerTenantId: 'b2d2c462-066a-43cc-9379-06374ec042c3',
};
export const dashboard_AssumePartnerRoleResponse: AssumePartnerRoleResponse = {
  partnerTenant: {
    allowDomainAccess: true,
    domains: ['laborum reprehenderit eu pariatur', 'ut irure commodo minim', 'consectetur laboris cupidatat'],
    id: '682e0022-dc3d-4a3b-b4f5-76c2c8fbf178',
    isAuthMethodSupported: true,
    isDomainAlreadyClaimed: false,
    logoUrl: 'https://bleak-pantyhose.name/',
    name: 'Jody Schimmel Sr.',
    websiteUrl: 'https://uncommon-trash.us/',
  },
  token: '07022868-c818-41d7-bf34-4164e0b83c5c',
  user: {
    createdAt: '1926-08-04T19:05:24.0Z',
    email: 'freda.rogahn@gmail.com',
    firstName: 'Easter',
    id: '81ce518e-f6dd-4d37-80f3-dc27e8519832',
    isFirmEmployee: true,
    lastName: 'Kautzer',
    role: {
      createdAt: '1963-07-27T01:14:55.0Z',
      id: 'a21f1c11-e813-4b0f-8f7b-3c63dad69f30',
      isImmutable: true,
      kind: 'api_key',
      name: 'Delia Fadel Sr.',
      numActiveApiKeys: -50988420,
      numActiveUsers: -1736012,
      scopes: [
        {
          kind: 'read',
        },
        {
          kind: 'read',
        },
        {
          kind: 'read',
        },
      ],
    },
    rolebinding: {
      lastLoginAt: '1932-11-06T06:19:46.0Z',
    },
  },
};
export const dashboard_AssumeRoleRequest: AssumeRoleRequest = {
  tenantId: 'f2787f8f-ede9-4215-b8bc-72a3ea02d468',
};
export const dashboard_AssumeRoleResponse: AssumeRoleResponse = {
  tenant: {
    allowDomainAccess: false,
    allowedPreviewApis: ['vault_proxy_jit', 'client_vaulting_docs', 'liveness_list'],
    companySize: 's1_to10',
    domains: ['eu', 'in magna reprehenderit veniam', 'dolor esse dolore cillum nisi'],
    id: '503a6a65-c3c2-4cd2-8a60-9151e28f5846',
    isAuthMethodSupported: false,
    isDomainAlreadyClaimed: true,
    isProdAuthPlaybookRestricted: false,
    isProdKybPlaybookRestricted: true,
    isProdKycPlaybookRestricted: true,
    isProdNeuroEnabled: false,
    isProdSentilinkEnabled: false,
    isSandboxRestricted: false,
    logoUrl: 'https://probable-intervention.com',
    name: 'Ross Feeney',
    parent: {
      id: '942f1f0e-c04c-49b0-96a2-ad11c75f1213',
      name: 'Darlene Kovacek',
    },
    supportEmail: 'tommie63@gmail.com',
    supportPhone: '+17172633968',
    supportWebsite: 'https://aware-cosset.biz/',
    websiteUrl: 'https://courageous-entry.info',
  },
  token: '3aabc6a8-8f0a-4d8d-b696-d9fcd880c12b',
  user: {
    createdAt: '1906-12-23T02:15:51.0Z',
    email: 'bart52@gmail.com',
    firstName: 'Katarina',
    id: '9e13cd6e-73c9-4353-8cf8-a403324fc888',
    isFirmEmployee: false,
    lastName: 'Yost',
    role: {
      createdAt: '1942-05-25T08:32:45.0Z',
      id: '08dd8a61-41bb-4e8b-af42-9225c904daa7',
      isImmutable: false,
      kind: 'dashboard_user',
      name: 'Antoinette Robel',
      numActiveApiKeys: 62132850,
      numActiveUsers: 79210313,
      scopes: [
        {
          kind: 'read',
        },
        {
          kind: 'read',
        },
        {
          kind: 'read',
        },
      ],
    },
    rolebinding: {
      lastLoginAt: '1926-11-28T18:46:29.0Z',
    },
  },
};
export const dashboard_AttestedDeviceData: AttestedDeviceData = {
  appBundleId: '88358cb7-d458-4ea2-a7f2-c3969b28ddd3',
  deviceType: 'ios',
  fraudRisk: 'low',
  model: 'Lorem dolore',
  os: 'ea aliqua ullamco',
};
export const dashboard_AuditEvent: AuditEvent = {
  detail: {
    data: {
      createdFields: [
        'document.visa.full_address',
        'document.visa.front.mime_type',
        'document.residence_document.classified_document_type',
      ],
      fpId: '01e5abc4-7769-4430-9331-33f085ea0e1f',
    },
    kind: 'create_user',
  },
  id: '518d11a5-e49e-4d5c-bd71-c8c91c31efdb',
  insightEvent: {
    city: 'Vestafurt',
    country: 'Namibia',
    ipAddress: '25033 Upton Stravenue Apt. 330',
    latitude: -79200561.28420985,
    longitude: -44825337.29091127,
    metroCode: 'fugiat non nulla in',
    postalCode: 'et anim reprehenderit ea',
    region: 'dolore et nulla',
    regionName: 'Dianna Schiller',
    sessionId: 'c84a42d4-ec37-44ed-8cd9-243d040c4451',
    timeZone: 'culpa elit officia qui',
    timestamp: '1909-01-10T01:24:17.0Z',
    userAgent: 'nostrud culpa',
  },
  name: 'decrypt_org_api_key',
  principal: {
    id: '7962338d-b413-469b-abb9-e12670732d88',
    kind: 'user',
  },
  tenantId: '8f10e964-e03d-40c6-82cd-3274f0486bcd',
  timestamp: '1933-12-29T01:34:52.0Z',
};
export const dashboard_AuditEventApiKey: AuditEventApiKey = {
  id: '317d0b44-1cbb-447f-bed5-76213c370822',
  name: 'Orlando Stroman',
  role: {
    createdAt: '1910-02-09T02:50:22.0Z',
    id: '84590132-941e-42bb-be2c-c9941aa311f9',
    isImmutable: true,
    kind: 'api_key',
    name: 'Tabitha Conn',
    numActiveApiKeys: 15380009,
    numActiveUsers: 30457833,
    scopes: [
      {
        kind: 'read',
      },
      {
        kind: 'read',
      },
      {
        kind: 'read',
      },
    ],
  },
};
export const dashboard_AuditEventDetail: AuditEventDetail = {
  data: {
    createdFields: [
      'document.id_card.issuing_country',
      'document.passport_card.front.image',
      'business.corporation_type',
    ],
    fpId: '1595ebc7-1aa3-492e-a40c-8042c7745d87',
  },
  kind: 'create_user',
};
export const dashboard_AuditEventDetailCollectUserDocument: AuditEventDetailCollectUserDocument = {
  kind: 'collect_user_document',
};
export const dashboard_AuditEventDetailCompleteUserCheckLiveness: AuditEventDetailCompleteUserCheckLiveness = {
  kind: 'complete_user_check_liveness',
};
export const dashboard_AuditEventDetailCompleteUserCheckWatchlist: AuditEventDetailCompleteUserCheckWatchlist = {
  kind: 'complete_user_check_watchlist',
};
export const dashboard_AuditEventDetailCompleteUserVerification: AuditEventDetailCompleteUserVerification = {
  kind: 'complete_user_verification',
};
export const dashboard_AuditEventDetailCreateListEntry: AuditEventDetailCreateListEntry = {
  data: {
    listEntryCreationId: '9f3fbdc0-a348-428e-ad43-9622a052d59c',
    listId: '753b0f6f-bfa8-426e-b8dc-5d55274a9562',
  },
  kind: 'create_list_entry',
};
export const dashboard_AuditEventDetailCreateOrg: AuditEventDetailCreateOrg = {
  kind: 'create_org',
};
export const dashboard_AuditEventDetailCreateOrgApiKey: AuditEventDetailCreateOrgApiKey = {
  data: {
    apiKey: {
      id: 'c9cac702-95d4-4714-bb4b-e05d50dcf1fe',
      name: 'Rebecca Gleichner DDS',
      role: {
        createdAt: '1915-03-17T20:20:42.0Z',
        id: 'f3d6922a-325c-421d-aa41-9416c200f746',
        isImmutable: false,
        kind: 'dashboard_user',
        name: 'Jane Harvey',
        numActiveApiKeys: -5928957,
        numActiveUsers: -45832167,
        scopes: [
          {
            kind: 'read',
          },
          {
            kind: 'read',
          },
          {
            kind: 'read',
          },
        ],
      },
    },
  },
  kind: 'create_org_api_key',
};
export const dashboard_AuditEventDetailCreateOrgRole: AuditEventDetailCreateOrgRole = {
  data: {
    roleName: 'Jeannie Hirthe',
    scopes: [
      {
        kind: 'read',
      },
      {
        kind: 'read',
      },
      {
        kind: 'read',
      },
    ],
    tenantRoleId: 'a4899385-655b-4591-a313-abe887ec50ba',
  },
  kind: 'create_org_role',
};
export const dashboard_AuditEventDetailCreatePlaybook: AuditEventDetailCreatePlaybook = {
  data: {
    obConfigurationId: '3ecfc294-f88c-4cc1-ad64-9d06724f607f',
  },
  kind: 'create_playbook',
};
export const dashboard_AuditEventDetailCreateUser: AuditEventDetailCreateUser = {
  data: {
    createdFields: [
      'document.residence_document.issuing_state',
      'card.*.cvc',
      'document.id_card.classified_document_type',
    ],
    fpId: '57bcdd09-2734-43d1-8db7-19eca47c09ee',
  },
  kind: 'create_user',
};
export const dashboard_AuditEventDetailCreateUserAnnotation: AuditEventDetailCreateUserAnnotation = {
  kind: 'create_user_annotation',
};
export const dashboard_AuditEventDetailDeactivateOrgRole: AuditEventDetailDeactivateOrgRole = {
  data: {
    roleName: 'Dwayne Doyle',
    scopes: [
      {
        kind: 'read',
      },
      {
        kind: 'read',
      },
      {
        kind: 'read',
      },
    ],
    tenantRoleId: '6700c385-a574-461a-983e-4a3cff57e2e8',
  },
  kind: 'deactivate_org_role',
};
export const dashboard_AuditEventDetailDecryptOrgApiKey: AuditEventDetailDecryptOrgApiKey = {
  data: {
    apiKey: {
      id: '3cf9538f-bf0e-4b92-b016-32b6c289dbb2',
      name: 'Michael Von III',
      role: {
        createdAt: '1931-11-20T07:28:04.0Z',
        id: '6da6a499-5bdc-4b45-acc2-82c6d1701af8',
        isImmutable: false,
        kind: 'api_key',
        name: 'Caleb McCullough',
        numActiveApiKeys: -86612338,
        numActiveUsers: -19936768,
        scopes: [
          {
            kind: 'read',
          },
          {
            kind: 'read',
          },
          {
            kind: 'read',
          },
        ],
      },
    },
  },
  kind: 'decrypt_org_api_key',
};
export const dashboard_AuditEventDetailDecryptUserData: AuditEventDetailDecryptUserData = {
  data: {
    context: 'reflect',
    decryptedFields: ['document.permit.document_number', 'document.passport.issued_at', 'document.visa.gender'],
    fpId: '0b7d884e-b645-4486-a40a-05f4319818bb',
    reason: 'ea ut',
  },
  kind: 'decrypt_user_data',
};
export const dashboard_AuditEventDetailDeleteListEntry: AuditEventDetailDeleteListEntry = {
  data: {
    listEntryId: '1ccaf27a-61e0-4411-8243-52bd298c98ca',
    listId: 'fc1a62b8-e93e-4fdd-aff9-c01ae91b21c4',
  },
  kind: 'delete_list_entry',
};
export const dashboard_AuditEventDetailDeleteUser: AuditEventDetailDeleteUser = {
  data: {
    fpId: '4727d27a-8250-4052-869e-ea2be5d3017b',
  },
  kind: 'delete_user',
};
export const dashboard_AuditEventDetailDeleteUserData: AuditEventDetailDeleteUserData = {
  data: {
    deletedFields: ['document.passport.issuing_state', 'document.passport_card.dob', 'investor_profile.annual_income'],
    fpId: '051ca946-3d35-4606-899e-76be99c68791',
  },
  kind: 'delete_user_data',
};
export const dashboard_AuditEventDetailDisablePlaybook: AuditEventDetailDisablePlaybook = {
  kind: 'disable_playbook',
};
export const dashboard_AuditEventDetailEditPlaybook: AuditEventDetailEditPlaybook = {
  data: {
    obConfigurationId: 'fa7d1a85-7b91-4add-8562-0595aab3d270',
  },
  kind: 'edit_playbook',
};
export const dashboard_AuditEventDetailInviteOrgMember: AuditEventDetailInviteOrgMember = {
  data: {
    email: 'kaylah78@gmail.com',
    firstName: 'Janiya',
    lastName: 'White',
    scopes: [
      {
        kind: 'read',
      },
      {
        kind: 'read',
      },
      {
        kind: 'read',
      },
    ],
    tenantName: 'Patty Kulas',
    tenantRoleId: 'a26a8071-c49d-437e-81d0-d1d4b0f8a22e',
    tenantRoleName: 'Joey Mayer',
  },
  kind: 'invite_org_member',
};
export const dashboard_AuditEventDetailLoginOrgMember: AuditEventDetailLoginOrgMember = {
  kind: 'login_org_member',
};
export const dashboard_AuditEventDetailManuallyReviewEntity: AuditEventDetailManuallyReviewEntity = {
  data: {
    decisionStatus: 'step_up',
    fpId: '4a037525-46d5-4bd0-b110-10a334dcd750',
  },
  kind: 'manually_review_entity',
};
export const dashboard_AuditEventDetailOrgMemberJoined: AuditEventDetailOrgMemberJoined = {
  data: {
    email: 'arlie.hoeger@gmail.com',
    firstName: 'Eric',
    lastName: 'Green',
    tenantRole: {
      createdAt: '1915-10-08T18:01:26.0Z',
      id: '1cd14203-4478-4021-a94a-b85bea115d38',
      isImmutable: true,
      kind: 'dashboard_user',
      name: 'Willie Kohler MD',
      numActiveApiKeys: -68553613,
      numActiveUsers: -33581186,
      scopes: [
        {
          kind: 'read',
        },
        {
          kind: 'read',
        },
        {
          kind: 'read',
        },
      ],
    },
  },
  kind: 'org_member_joined',
};
export const dashboard_AuditEventDetailRemoveOrgMember: AuditEventDetailRemoveOrgMember = {
  data: {
    member: {
      email: 'hilbert41@gmail.com',
      firstName: 'Ocie',
      id: '9b3ee70b-bbc9-4c42-89e6-325f7efca8a7',
      lastName: 'Smith',
    },
  },
  kind: 'remove_org_member',
};
export const dashboard_AuditEventDetailRequestUserData: AuditEventDetailRequestUserData = {
  kind: 'request_user_data',
};
export const dashboard_AuditEventDetailStartUserVerification: AuditEventDetailStartUserVerification = {
  kind: 'start_user_verification',
};
export const dashboard_AuditEventDetailUpdateOrgApiKeyRole: AuditEventDetailUpdateOrgApiKeyRole = {
  data: {
    apiKey: {
      id: 'cc82ce07-fe4f-45df-9ecc-1bedf13d8b19',
      name: 'Pam Schowalter',
      role: {
        createdAt: '1896-10-24T19:12:58.0Z',
        id: '4e14ea08-57e6-4f9c-927a-2b408e1d22e8',
        isImmutable: false,
        kind: 'compliance_partner_dashboard_user',
        name: 'Joshua Renner PhD',
        numActiveApiKeys: -30233385,
        numActiveUsers: 19395810,
        scopes: [
          {
            kind: 'read',
          },
          {
            kind: 'read',
          },
          {
            kind: 'read',
          },
        ],
      },
    },
    newRole: {
      createdAt: '1890-12-23T12:46:33.0Z',
      id: 'd3b85a37-b219-4801-893b-5ab0a76cf43b',
      isImmutable: true,
      kind: 'dashboard_user',
      name: 'Woodrow Kozey',
      numActiveApiKeys: -39875879,
      numActiveUsers: -54610634,
      scopes: [
        {
          kind: 'read',
        },
        {
          kind: 'read',
        },
        {
          kind: 'read',
        },
      ],
    },
    oldRole: {
      createdAt: '1962-12-06T03:17:41.0Z',
      id: 'f38774df-b84d-45ce-bc0c-1c6891dded37',
      isImmutable: true,
      kind: 'compliance_partner_dashboard_user',
      name: 'Lois Roob',
      numActiveApiKeys: 30030082,
      numActiveUsers: -30106657,
      scopes: [
        {
          kind: 'read',
        },
        {
          kind: 'read',
        },
        {
          kind: 'read',
        },
      ],
    },
  },
  kind: 'update_org_api_key_role',
};
export const dashboard_AuditEventDetailUpdateOrgApiKeyStatus: AuditEventDetailUpdateOrgApiKeyStatus = {
  data: {
    apiKey: {
      id: 'e88d3e7b-38e7-43a8-be04-4fca52e4ab89',
      name: 'Rosemary Grimes',
      role: {
        createdAt: '1905-12-23T01:06:28.0Z',
        id: '4517451a-16e2-4525-a14e-8a8df55b2780',
        isImmutable: false,
        kind: 'api_key',
        name: 'Pete Kuhic',
        numActiveApiKeys: -42633076,
        numActiveUsers: 15308920,
        scopes: [
          {
            kind: 'read',
          },
          {
            kind: 'read',
          },
          {
            kind: 'read',
          },
        ],
      },
    },
    status: 'disabled',
  },
  kind: 'update_org_api_key_status',
};
export const dashboard_AuditEventDetailUpdateOrgMember: AuditEventDetailUpdateOrgMember = {
  data: {
    firstName: 'Michael',
    lastName: 'Reinger',
    newRole: {
      createdAt: '1944-08-22T14:54:17.0Z',
      id: '78d78637-3c90-463e-a5e6-af4e37cb91c4',
      isImmutable: false,
      kind: 'api_key',
      name: 'Sheryl Kilback',
      numActiveApiKeys: 19760290,
      numActiveUsers: -53321230,
      scopes: [
        {
          kind: 'read',
        },
        {
          kind: 'read',
        },
        {
          kind: 'read',
        },
      ],
    },
    oldRole: {
      createdAt: '1951-03-23T01:25:58.0Z',
      id: '08ff255a-35b6-4382-b072-4d55bbf2a82a',
      isImmutable: false,
      kind: 'compliance_partner_dashboard_user',
      name: 'Lois Wyman Sr.',
      numActiveApiKeys: 32285650,
      numActiveUsers: 46117115,
      scopes: [
        {
          kind: 'read',
        },
        {
          kind: 'read',
        },
        {
          kind: 'read',
        },
      ],
    },
    tenantUserId: 'e466b76b-a791-451d-9c0d-01bd6aaffe56',
  },
  kind: 'update_org_member',
};
export const dashboard_AuditEventDetailUpdateOrgRole: AuditEventDetailUpdateOrgRole = {
  data: {
    newScopes: [
      {
        kind: 'read',
      },
      {
        kind: 'read',
      },
      {
        kind: 'read',
      },
    ],
    prevScopes: [
      {
        kind: 'read',
      },
      {
        kind: 'read',
      },
      {
        kind: 'read',
      },
    ],
    roleName: 'Mae Erdman Sr.',
    tenantRoleId: '28392d08-4426-4fcf-b0d1-91aa366ce409',
  },
  kind: 'update_org_role',
};
export const dashboard_AuditEventDetailUpdateOrgSettings: AuditEventDetailUpdateOrgSettings = {
  kind: 'update_org_settings',
};
export const dashboard_AuditEventDetailUpdateUserData: AuditEventDetailUpdateUserData = {
  data: {
    fpId: '4b632385-7ea4-40b2-bcaa-06e0c24a8022',
    updatedFields: [
      'document.passport_card.full_name',
      'document.passport.classified_document_type',
      'document.voter_identification.issued_at',
    ],
  },
  kind: 'update_user_data',
};
export const dashboard_AuditEventName: AuditEventName = 'decrypt_user_data';
export const dashboard_AuditEventOrgMember: AuditEventOrgMember = {
  email: 'helga42@gmail.com',
  firstName: 'Esteban',
  id: '1279605f-4d2b-4a82-8583-686ee9db76a0',
  lastName: 'Rau',
};
export const dashboard_AuthEvent: AuthEvent = {
  createdAt: '1946-07-01T06:18:21.0Z',
  insight: {
    city: 'DuBuquefield',
    country: 'Papua New Guinea',
    ipAddress: '1844 Maximo Islands Apt. 257',
    latitude: -69998091.03417057,
    longitude: 69464871.63437709,
    metroCode: 'ea non ex',
    postalCode: 'tempor fugiat eiusmod',
    region: 'nostrud',
    regionName: 'Sophia Hintz',
    sessionId: '573a500d-7fe4-483f-a43c-de9287ec402b',
    timeZone: 'Lorem mollit',
    timestamp: '1922-11-28T18:22:01.0Z',
    userAgent: 'Lorem id qui pariatur eiusmod',
  },
  kind: 'third_party',
  linkedAttestations: [
    {
      appBundleId: '46554598-1c7c-4be5-8c8c-f6cca36dcda2',
      deviceType: 'android',
      fraudRisk: 'medium',
      model: 'incididunt id labore laborum sint',
      os: 'sunt velit Ut commodo enim',
    },
    {
      appBundleId: '46554598-1c7c-4be5-8c8c-f6cca36dcda2',
      deviceType: 'android',
      fraudRisk: 'low',
      model: 'voluptate sunt amet in',
      os: 'sunt',
    },
    {
      appBundleId: '46554598-1c7c-4be5-8c8c-f6cca36dcda2',
      deviceType: 'android',
      fraudRisk: 'medium',
      model: 'ea minim',
      os: 'ullamco',
    },
  ],
  scope: 'onboarding',
};
export const dashboard_AuthEventKind: AuthEventKind = 'third_party';
export const dashboard_AuthMethodKind: AuthMethodKind = 'email';
export const dashboard_AuthMethodUpdated: AuthMethodUpdated = {
  action: 'add_primary',
  insightEvent: {
    city: 'Lake Haskell',
    country: 'Luxembourg',
    ipAddress: '548 W Union Street Suite 936',
    latitude: 93342112.87336248,
    longitude: 24824770.824572086,
    metroCode: 'ad et Ut fugiat',
    postalCode: 'ullamco',
    region: 'incididunt eu in dolore cupidatat',
    regionName: 'Ms. Katrina Nienow',
    sessionId: '93895012-5f34-4814-a303-049b9f7af892',
    timeZone: 'voluptate consectetur',
    timestamp: '1923-05-07T23:55:37.0Z',
    userAgent: 'amet in',
  },
  kind: 'email',
};
export const dashboard_AuthOrgMember: AuthOrgMember = {
  email: 'macey98@gmail.com',
  firstName: 'Laurie',
  id: '4c00b8e6-9078-47a2-a8b9-cef7856b3a09',
  isAssumedSession: true,
  isFirmEmployee: true,
  lastName: 'Stehr',
  scopes: [
    {
      kind: 'read',
    },
    {
      kind: 'read',
    },
    {
      kind: 'read',
    },
  ],
  tenant: {
    allowDomainAccess: true,
    allowedPreviewApis: ['create_user_decision', 'create_user_decision', 'list_duplicate_users'],
    companySize: 's1001_plus',
    domains: ['adipisicing in laboris officia', 'ex', 'Ut cillum'],
    id: '61851d03-82c0-46c9-aca1-67796b0c49d6',
    isAuthMethodSupported: false,
    isDomainAlreadyClaimed: true,
    isProdAuthPlaybookRestricted: false,
    isProdKybPlaybookRestricted: true,
    isProdKycPlaybookRestricted: false,
    isProdNeuroEnabled: true,
    isProdSentilinkEnabled: false,
    isSandboxRestricted: false,
    logoUrl: 'https://considerate-typewriter.us/',
    name: 'Marcella Cremin',
    parent: {
      id: '4c2e0df3-1017-405c-bf59-0c90cf812aef',
      name: 'Kristina Green',
    },
    supportEmail: 'aniyah14@gmail.com',
    supportPhone: '+17977726005',
    supportWebsite: 'https://sniveling-elevation.com',
    websiteUrl: 'https://biodegradable-adaptation.com/',
  },
};
export const dashboard_BooleanOperator: BooleanOperator = 'not_eq';
export const dashboard_BusinessDetail: BusinessDetail = {
  entityType: 'dolore',
  formationDate: 'Excepteur cupidatat consequat ipsum in',
  formationState: 'Illinois',
  phoneNumbers: [
    {
      phone: '+16302754032',
      submitted: false,
      verified: false,
    },
    {
      phone: '+16302754032',
      submitted: false,
      verified: false,
    },
    {
      phone: '+16302754032',
      submitted: true,
      verified: true,
    },
  ],
  tin: {
    tin: 'pariatur est culpa Duis amet',
    verified: true,
  },
  website: {
    url: 'https://wonderful-swim.info/',
    verified: true,
  },
};
export const dashboard_BusinessInsights: BusinessInsights = {
  addresses: [
    {
      addressLine1: '412 West Road Apt. 685',
      addressLine2: '48290 Kristopher Oval Apt. 680',
      city: 'South Rolando',
      cmra: true,
      deliverable: false,
      latitude: -25344546.385856807,
      longitude: -5466956.412466124,
      postalCode: 'velit eu consectetur',
      propertyType: 'deserunt commodo et',
      sources: 'id sit eiusmod',
      state: 'Vermont',
      submitted: false,
      verified: true,
    },
    {
      addressLine1: '412 West Road Apt. 685',
      addressLine2: '48290 Kristopher Oval Apt. 680',
      city: 'South Rolando',
      cmra: false,
      deliverable: true,
      latitude: -69862990.10343364,
      longitude: -92085395.18558764,
      postalCode: 'eiusmod sunt sit aliquip nostrud',
      propertyType: 'exercitation aliqua qui ad ut',
      sources: 'ullamco veniam',
      state: 'Vermont',
      submitted: false,
      verified: false,
    },
    {
      addressLine1: '412 West Road Apt. 685',
      addressLine2: '48290 Kristopher Oval Apt. 680',
      city: 'South Rolando',
      cmra: true,
      deliverable: true,
      latitude: 92484949.30356136,
      longitude: 87914696.77622992,
      postalCode: 'do laboris Lorem',
      propertyType: 'dolor cillum',
      sources: 'do dolor laborum',
      state: 'Vermont',
      submitted: false,
      verified: false,
    },
  ],
  details: {
    entityType: 'consectetur anim reprehenderit dolor id',
    formationDate: 'qui',
    formationState: 'Texas',
    phoneNumbers: [
      {
        phone: '+19027321416',
        submitted: false,
        verified: false,
      },
      {
        phone: '+19027321416',
        submitted: true,
        verified: true,
      },
      {
        phone: '+19027321416',
        submitted: false,
        verified: false,
      },
    ],
    tin: {
      tin: 'elit',
      verified: true,
    },
    website: {
      url: 'https://fortunate-swim.us/',
      verified: true,
    },
  },
  names: [
    {
      kind: 'et',
      name: 'Freddie Reynolds Jr.',
      sources: 'mollit',
      subStatus: 'reprehenderit mollit eu',
      submitted: false,
      verified: false,
    },
    {
      kind: 'et irure laboris',
      name: 'Freddie Reynolds Jr.',
      sources: 'ullamco deserunt reprehenderit adipisicing',
      subStatus: 'proident id',
      submitted: false,
      verified: false,
    },
    {
      kind: 'Excepteur commodo Duis nulla',
      name: 'Freddie Reynolds Jr.',
      sources: 'sed veniam commodo',
      subStatus: 'quis nisi esse culpa',
      submitted: false,
      verified: true,
    },
  ],
  people: [
    {
      associationVerified: false,
      name: 'Glenda McCullough',
      role: 'qui nisi Lorem amet magna',
      sources: 'Lorem proident voluptate esse',
      submitted: false,
    },
    {
      associationVerified: true,
      name: 'Glenda McCullough',
      role: 'sint irure in veniam',
      sources: 'laboris Lorem esse',
      submitted: true,
    },
    {
      associationVerified: true,
      name: 'Glenda McCullough',
      role: 'sit ipsum non anim',
      sources: 'Duis irure dolore veniam nostrud',
      submitted: false,
    },
  ],
  registrations: [
    {
      addresses: ['aute dolore Ut mollit laboris', 'minim labore', 'cupidatat et Excepteur eiusmod'],
      entityType: 'fugiat enim consectetur laborum',
      fileNumber: 'ut officia',
      jurisdiction: 'consectetur laboris Ut fugiat quis',
      name: 'Lynn Mueller',
      officers: [
        {
          name: 'Tom Bins',
          roles: 'eu amet consequat cupidatat magna',
        },
        {
          name: 'Tom Bins',
          roles: 'sunt in qui anim',
        },
        {
          name: 'Tom Bins',
          roles: 'non',
        },
      ],
      registeredAgent: 'voluptate est incididunt laborum cillum',
      registrationDate: 'dolore irure Ut in',
      source: 'sed sunt Lorem',
      state: 'Idaho',
      status: 'nisi sunt eiusmod culpa aliqua',
      subStatus: 'et',
    },
    {
      addresses: ['fugiat eu irure nulla veniam', 'veniam', 'dolore irure cupidatat qui magna'],
      entityType: 'dolore velit',
      fileNumber: 'laborum minim sed esse',
      jurisdiction: 'in',
      name: 'Lynn Mueller',
      officers: [
        {
          name: 'Tom Bins',
          roles: 'pariatur',
        },
        {
          name: 'Tom Bins',
          roles: 'laborum dolore cupidatat nulla',
        },
        {
          name: 'Tom Bins',
          roles: 'sunt',
        },
      ],
      registeredAgent: 'laboris adipisicing occaecat',
      registrationDate: 'irure pariatur ad et tempor',
      source: 'ut officia sint incididunt',
      state: 'Idaho',
      status: 'ullamco qui',
      subStatus: 'aliquip elit sunt pariatur tempor',
    },
    {
      addresses: ['labore', 'sint mollit', 'dolor incididunt proident voluptate'],
      entityType: 'in irure',
      fileNumber: 'ut commodo',
      jurisdiction: 'ad reprehenderit laboris in proident',
      name: 'Lynn Mueller',
      officers: [
        {
          name: 'Tom Bins',
          roles: 'reprehenderit commodo ea',
        },
        {
          name: 'Tom Bins',
          roles: 'labore magna deserunt',
        },
        {
          name: 'Tom Bins',
          roles: 'dolore ea',
        },
      ],
      registeredAgent: 'nostrud sit',
      registrationDate: 'eiusmod quis nostrud',
      source: 'dolor id et anim cillum',
      state: 'Idaho',
      status: 'voluptate',
      subStatus: 'esse in et eiusmod adipisicing',
    },
  ],
  watchlist: {
    business: [
      {
        hits: [
          {
            agency: 'cupidatat reprehenderit id consectetur',
            agencyAbbr: 'dolore incididunt velit',
            agencyInformationUrl: 'https://rotating-fibre.name',
            agencyListUrl: 'https://harmful-sailor.biz/',
            entityAliases: ['tempor deserunt Ut', 'nulla', 'laboris esse consectetur quis est'],
            entityName: 'Sue Senger',
            listCountry: 'Niue',
            listName: 'Audrey Huels',
            url: 'https://willing-bathhouse.biz',
          },
          {
            agency: 'commodo laboris consectetur',
            agencyAbbr: 'aute aliquip exercitation',
            agencyInformationUrl: 'https://rotating-fibre.name',
            agencyListUrl: 'https://harmful-sailor.biz/',
            entityAliases: ['enim', 'velit', 'elit'],
            entityName: 'Sue Senger',
            listCountry: 'Niue',
            listName: 'Audrey Huels',
            url: 'https://willing-bathhouse.biz',
          },
          {
            agency: 'ad enim',
            agencyAbbr: 'esse ea',
            agencyInformationUrl: 'https://rotating-fibre.name',
            agencyListUrl: 'https://harmful-sailor.biz/',
            entityAliases: ['aute nostrud', 'deserunt', 'aute cupidatat sit Excepteur'],
            entityName: 'Sue Senger',
            listCountry: 'Niue',
            listName: 'Audrey Huels',
            url: 'https://willing-bathhouse.biz',
          },
        ],
        screenedEntityName: 'Roderick Rosenbaum',
      },
      {
        hits: [
          {
            agency: 'consequat ad',
            agencyAbbr: 'veniam ut',
            agencyInformationUrl: 'https://rotating-fibre.name',
            agencyListUrl: 'https://harmful-sailor.biz/',
            entityAliases: ['adipisicing proident ut laboris dolor', 'Duis nulla nostrud enim', 'labore'],
            entityName: 'Sue Senger',
            listCountry: 'Niue',
            listName: 'Audrey Huels',
            url: 'https://willing-bathhouse.biz',
          },
          {
            agency: 'commodo',
            agencyAbbr: 'enim elit do nisi',
            agencyInformationUrl: 'https://rotating-fibre.name',
            agencyListUrl: 'https://harmful-sailor.biz/',
            entityAliases: [
              'aliqua voluptate dolore Lorem laborum',
              'dolore consequat sint ullamco',
              'ut irure exercitation',
            ],
            entityName: 'Sue Senger',
            listCountry: 'Niue',
            listName: 'Audrey Huels',
            url: 'https://willing-bathhouse.biz',
          },
          {
            agency: 'sunt ut culpa aliqua',
            agencyAbbr: 'id ullamco nulla eiusmod',
            agencyInformationUrl: 'https://rotating-fibre.name',
            agencyListUrl: 'https://harmful-sailor.biz/',
            entityAliases: ['anim laboris in', 'pariatur', 'velit ullamco officia dolor'],
            entityName: 'Sue Senger',
            listCountry: 'Niue',
            listName: 'Audrey Huels',
            url: 'https://willing-bathhouse.biz',
          },
        ],
        screenedEntityName: 'Roderick Rosenbaum',
      },
      {
        hits: [
          {
            agency: 'aliquip qui sed sint dolore',
            agencyAbbr: 'in dolore',
            agencyInformationUrl: 'https://rotating-fibre.name',
            agencyListUrl: 'https://harmful-sailor.biz/',
            entityAliases: ['laboris', 'pariatur velit', 'nulla'],
            entityName: 'Sue Senger',
            listCountry: 'Niue',
            listName: 'Audrey Huels',
            url: 'https://willing-bathhouse.biz',
          },
          {
            agency: 'quis ea incididunt culpa in',
            agencyAbbr: 'dolore commodo esse tempor sit',
            agencyInformationUrl: 'https://rotating-fibre.name',
            agencyListUrl: 'https://harmful-sailor.biz/',
            entityAliases: ['elit do ut', 'consequat pariatur minim tempor', 'non eu'],
            entityName: 'Sue Senger',
            listCountry: 'Niue',
            listName: 'Audrey Huels',
            url: 'https://willing-bathhouse.biz',
          },
          {
            agency: 'aliquip Ut do ipsum',
            agencyAbbr: 'reprehenderit in',
            agencyInformationUrl: 'https://rotating-fibre.name',
            agencyListUrl: 'https://harmful-sailor.biz/',
            entityAliases: ['Duis aliquip', 'ipsum reprehenderit mollit sint', 'et veniam sit dolor'],
            entityName: 'Sue Senger',
            listCountry: 'Niue',
            listName: 'Audrey Huels',
            url: 'https://willing-bathhouse.biz',
          },
        ],
        screenedEntityName: 'Roderick Rosenbaum',
      },
    ],
    hitCount: 23715690,
    people: [
      {
        hits: [
          {
            agency: 'minim aliqua exercitation adipisicing',
            agencyAbbr: 'ut',
            agencyInformationUrl: 'https://angelic-word.org',
            agencyListUrl: 'https://athletic-lobster.biz',
            entityAliases: ['exercitation ut', 'sed veniam nulla aliqua non', 'occaecat veniam non sunt'],
            entityName: 'Taylor Ondricka',
            listCountry: 'Botswana',
            listName: 'Toni Streich DDS',
            url: 'https://tangible-newsletter.name',
          },
          {
            agency: 'veniam dolor eiusmod laboris',
            agencyAbbr: 'elit pariatur eiusmod dolor occaecat',
            agencyInformationUrl: 'https://angelic-word.org',
            agencyListUrl: 'https://athletic-lobster.biz',
            entityAliases: [
              'quis ullamco dolore dolor',
              'fugiat ex esse eiusmod',
              'nostrud et Duis eiusmod incididunt',
            ],
            entityName: 'Taylor Ondricka',
            listCountry: 'Botswana',
            listName: 'Toni Streich DDS',
            url: 'https://tangible-newsletter.name',
          },
          {
            agency: 'dolor dolor culpa',
            agencyAbbr: 'non aute proident quis culpa',
            agencyInformationUrl: 'https://angelic-word.org',
            agencyListUrl: 'https://athletic-lobster.biz',
            entityAliases: ['ea ut deserunt', 'sed ipsum Duis', 'tempor eiusmod adipisicing exercitation voluptate'],
            entityName: 'Taylor Ondricka',
            listCountry: 'Botswana',
            listName: 'Toni Streich DDS',
            url: 'https://tangible-newsletter.name',
          },
        ],
        screenedEntityName: 'Amy Beahan',
      },
      {
        hits: [
          {
            agency: 'non',
            agencyAbbr: 'sunt nulla ipsum',
            agencyInformationUrl: 'https://angelic-word.org',
            agencyListUrl: 'https://athletic-lobster.biz',
            entityAliases: ['ea', 'sint Duis nulla non dolor', 'in anim in magna veniam'],
            entityName: 'Taylor Ondricka',
            listCountry: 'Botswana',
            listName: 'Toni Streich DDS',
            url: 'https://tangible-newsletter.name',
          },
          {
            agency: 'quis',
            agencyAbbr: 'magna mollit adipisicing quis ullamco',
            agencyInformationUrl: 'https://angelic-word.org',
            agencyListUrl: 'https://athletic-lobster.biz',
            entityAliases: ['Ut esse mollit consequat', 'sunt', 'commodo ipsum reprehenderit cupidatat fugiat'],
            entityName: 'Taylor Ondricka',
            listCountry: 'Botswana',
            listName: 'Toni Streich DDS',
            url: 'https://tangible-newsletter.name',
          },
          {
            agency: 'Ut',
            agencyAbbr: 'sint irure anim',
            agencyInformationUrl: 'https://angelic-word.org',
            agencyListUrl: 'https://athletic-lobster.biz',
            entityAliases: ['ut magna', 'laborum magna id adipisicing', 'in consectetur labore'],
            entityName: 'Taylor Ondricka',
            listCountry: 'Botswana',
            listName: 'Toni Streich DDS',
            url: 'https://tangible-newsletter.name',
          },
        ],
        screenedEntityName: 'Amy Beahan',
      },
      {
        hits: [
          {
            agency: 'ea et pariatur cupidatat',
            agencyAbbr: 'veniam ipsum',
            agencyInformationUrl: 'https://angelic-word.org',
            agencyListUrl: 'https://athletic-lobster.biz',
            entityAliases: ['culpa veniam', 'ullamco ex', 'in laboris aute'],
            entityName: 'Taylor Ondricka',
            listCountry: 'Botswana',
            listName: 'Toni Streich DDS',
            url: 'https://tangible-newsletter.name',
          },
          {
            agency: 'nisi',
            agencyAbbr: 'eu',
            agencyInformationUrl: 'https://angelic-word.org',
            agencyListUrl: 'https://athletic-lobster.biz',
            entityAliases: ['dolore officia non cupidatat ex', 'laborum commodo', 'velit'],
            entityName: 'Taylor Ondricka',
            listCountry: 'Botswana',
            listName: 'Toni Streich DDS',
            url: 'https://tangible-newsletter.name',
          },
          {
            agency: 'pariatur cupidatat',
            agencyAbbr: 'dolore',
            agencyInformationUrl: 'https://angelic-word.org',
            agencyListUrl: 'https://athletic-lobster.biz',
            entityAliases: ['in', 'elit', 'sit'],
            entityName: 'Taylor Ondricka',
            listCountry: 'Botswana',
            listName: 'Toni Streich DDS',
            url: 'https://tangible-newsletter.name',
          },
        ],
        screenedEntityName: 'Amy Beahan',
      },
    ],
  },
};
export const dashboard_BusinessOwnerKind: BusinessOwnerKind = 'primary';
export const dashboard_BusinessOwnerSource: BusinessOwnerSource = 'hosted';
export const dashboard_CipKind: CipKind = 'alpaca';
export const dashboard_ClientDecryptRequest: ClientDecryptRequest = {
  fields: ['id.first_name', 'document.drivers_license.selfie.mime_type', 'document.id_card.front.image'],
  reason: 'eiusmod',
  transforms: ['to_uppercase', 'suffix(<n>)', 'to_uppercase'],
};
export const dashboard_ClientIdentity: ClientIdentity = {
  certificate: 'culpa occaecat Excepteur',
  key: 'f7752ed0-942f-445a-9c3a-b5f33f488892',
};
export const dashboard_CollectedDataOption: CollectedDataOption = 'ssn4';
export const dashboard_CompanySize: CompanySize = 's101_to1000';
export const dashboard_ComplianceCompanySummary: ComplianceCompanySummary = {
  companyName: 'Essie Blanda',
  id: 'f08e780f-8e88-4e96-9dc0-782e12f26287',
  numActivePlaybooks: 28298580,
  numControlsComplete: 41501285,
  numControlsTotal: -13167131,
};
export const dashboard_ComplianceDocData: ComplianceDocData = {
  data: {
    url: 'https://hateful-shipper.name',
  },
  kind: 'external_url',
};
export const dashboard_ComplianceDocDataExternalUrl: ComplianceDocDataExternalUrl = {
  data: {
    url: 'https://alienated-ownership.org/',
  },
  kind: 'external_url',
};
export const dashboard_ComplianceDocDataFileUpload: ComplianceDocDataFileUpload = {
  data: {
    data: 'reprehenderit cupidatat',
    filename: 'Mrs. Joanne Bernhard',
  },
  kind: 'file_upload',
};
export const dashboard_ComplianceDocDataKind: ComplianceDocDataKind = 'file_upload';
export const dashboard_ComplianceDocEvent: ComplianceDocEvent = {
  actor: {
    org: 'sed aliquip et eiusmod',
    user: {
      firstName: 'Hermina',
      id: 'cc67fea9-7fb1-4551-8188-891db828747e',
      lastName: 'McLaughlin',
    },
  },
  event: {
    data: {
      description: 'in ullamco ut dolore',
      name: 'Sandra Herzog III',
      templateId: 'ca66c58c-6496-46c8-b04b-ad823cdedb6d',
    },
    kind: 'requested',
  },
  timestamp: '1896-09-05T16:01:04.0Z',
};
export const dashboard_ComplianceDocEventAssigned: ComplianceDocEventAssigned = {
  assignedTo: {
    org: 'quis',
    user: {
      firstName: 'Stanford',
      id: 'a33f0671-3ae3-4acc-9300-aecf75ec7b87',
      lastName: 'Gottlieb',
    },
  },
  kind: 'tenant',
};
export const dashboard_ComplianceDocEventRequested: ComplianceDocEventRequested = {
  description: 'veniam esse',
  name: 'Darrell Bergstrom',
  templateId: '86b944f9-84a9-4744-b433-6c6e1f9dce83',
};
export const dashboard_ComplianceDocEventReviewed: ComplianceDocEventReviewed = {
  decision: 'accepted',
  note: 'et eu tempor',
};
export const dashboard_ComplianceDocEventSubmitted: ComplianceDocEventSubmitted = {
  kind: 'file_upload',
  submissionId: '1b58bf09-c7cb-49ac-afce-f7cb07638dc0',
};
export const dashboard_ComplianceDocEventType: ComplianceDocEventType = {
  data: {
    description: 'elit occaecat magna',
    name: 'Marcella Beatty',
    templateId: 'f824ba64-b197-4620-b9cc-5403e7a66bdd',
  },
  kind: 'requested',
};
export const dashboard_ComplianceDocEventTypeAssigned: ComplianceDocEventTypeAssigned = {
  data: {
    assignedTo: {
      org: 'officia',
      user: {
        firstName: 'Jaren',
        id: '208fd3fb-ad62-41ed-b8aa-5b04d6ce8d85',
        lastName: 'Moen',
      },
    },
    kind: 'partner_tenant',
  },
  kind: 'assigned',
};
export const dashboard_ComplianceDocEventTypeRequestRetracted: ComplianceDocEventTypeRequestRetracted = {
  data: {},
  kind: 'request_retracted',
};
export const dashboard_ComplianceDocEventTypeRequested: ComplianceDocEventTypeRequested = {
  data: {
    description: 'irure reprehenderit minim consectetur labore',
    name: 'Jake Barrows',
    templateId: '66e8a3d4-4539-47ca-a9d6-ea837f8f6a66',
  },
  kind: 'requested',
};
export const dashboard_ComplianceDocEventTypeReviewed: ComplianceDocEventTypeReviewed = {
  data: {
    decision: 'rejected',
    note: 'est nostrud Lorem',
  },
  kind: 'reviewed',
};
export const dashboard_ComplianceDocEventTypeSubmitted: ComplianceDocEventTypeSubmitted = {
  data: {
    kind: 'file_upload',
    submissionId: 'b93b6955-f4b0-4cbb-802b-e76297110145',
  },
  kind: 'submitted',
};
export const dashboard_ComplianceDocReviewDecision: ComplianceDocReviewDecision = 'rejected';
export const dashboard_ComplianceDocStatus: ComplianceDocStatus = 'waiting_for_upload';
export const dashboard_ComplianceDocSubmission: ComplianceDocSubmission = {
  createdAt: '1895-09-11T09:40:07.0Z',
  data: {
    data: {
      url: 'https://earnest-casket.info/',
    },
    kind: 'external_url',
  },
  id: 'dcca6c41-182f-4c7d-b303-fc7253ca63e5',
};
export const dashboard_ComplianceDocSummary: ComplianceDocSummary = {
  activeRequestId: 'cd1d76a7-5fc2-4a63-a587-4e8583aeaa6e',
  activeReviewId: '276cab32-ed9a-441f-9513-7231811e93ee',
  activeSubmissionId: 'ae2b70c8-b43a-42a8-a998-7f617858c85b',
  description: 'mollit laboris amet',
  id: '504dd487-04eb-4200-bc3e-84205ad1ca50',
  lastUpdated: '1926-12-10T09:56:07.0Z',
  name: 'Noah Marvin',
  partnerTenantAssignee: {
    firstName: 'Ulises',
    id: 'cbb5fb83-b9b1-4eec-aa29-8db37d9e4ec8',
    lastName: 'Murphy',
  },
  status: 'not_requested',
  templateId: '0bbce9af-1731-410a-8980-33c801d77ed0',
  tenantAssignee: {
    firstName: 'Pierce',
    id: 'bc0589ac-d02c-4e89-938a-78ce73eefa6b',
    lastName: 'Gislason',
  },
};
export const dashboard_ComplianceDocTemplate: ComplianceDocTemplate = {
  id: '19f24e5b-347b-49fc-a1f8-197d01952aa7',
  latestVersion: {
    createdAt: '1937-11-23T23:14:02.0Z',
    createdByPartnerTenantUser: {
      firstName: 'Mariah',
      id: 'f17809ac-8229-41b2-aa62-6e14a3ff660f',
      lastName: 'Cummings',
    },
    description: 'velit',
    id: 'b803a0b6-01e5-4c2c-b582-3c2db5e5785a',
    name: 'Lawrence Windler',
    templateId: '62c3b6bd-29d7-4b74-ba8d-323d0abfcda1',
  },
};
export const dashboard_ComplianceDocTemplateVersion: ComplianceDocTemplateVersion = {
  createdAt: '1938-05-23T12:51:13.0Z',
  createdByPartnerTenantUser: {
    firstName: 'Brook',
    id: '2afe8771-22d7-4549-8443-acfc6398ee58',
    lastName: 'Funk',
  },
  description: 'sit laboris ipsum in irure',
  id: 'ab49509b-e991-4260-87cf-13bf60547f1f',
  name: 'Phyllis Bruen',
  templateId: '7ff998e6-d4b3-4830-a332-21f7261b7048',
};
export const dashboard_ContactInfoKind: ContactInfoKind = 'email';
export const dashboard_CopyPlaybookRequest: CopyPlaybookRequest = {
  isLive: true,
  name: 'Elsa Pfeffer',
};
export const dashboard_CountrySpecificDocumentMapping: CountrySpecificDocumentMapping = {};
export const dashboard_CreateAnnotationRequest: CreateAnnotationRequest = {
  isPinned: false,
  note: 'culpa occaecat',
};
export const dashboard_CreateApiKeyRequest: CreateApiKeyRequest = {
  name: 'Mark Effertz',
  roleId: 'eb28970f-0d62-4233-851d-6ebe78dac89a',
};
export const dashboard_CreateComplianceDocRequest: CreateComplianceDocRequest = {
  description: 'in tempor consequat',
  name: 'Mrs. Kristie Konopelski II',
  templateVersionId: '120ae062-b678-420c-b9dd-b75d74a4f5ae',
};
export const dashboard_CreateComplianceDocTemplateRequest: CreateComplianceDocTemplateRequest = {
  description: 'Duis enim',
  name: 'Stephen Douglas',
};
export const dashboard_CreateEntityTokenRequest: CreateEntityTokenRequest = {
  key: 'a2952dd1-4d4c-4016-be89-ddf23dc6f803',
  kind: 'onboard',
  sendLink: true,
};
export const dashboard_CreateEntityTokenResponse: CreateEntityTokenResponse = {
  deliveryMethod: 'phone',
  expiresAt: '1948-05-11T18:27:40.0Z',
  link: 'voluptate',
  token: 'f1c6c7c1-c8bc-45db-9adc-56b9ec4bf71f',
};
export const dashboard_CreateKycLinksRequest: CreateKycLinksRequest = {
  sendToBoIds: ['Lorem', 'occaecat sit in nostrud', 'amet'],
};
export const dashboard_CreateListEntryRequest: CreateListEntryRequest = {
  entries: ['ut magna in ut Duis', 'nostrud aliqua sit aliquip magna', 'sit occaecat exercitation'],
};
export const dashboard_CreateListRequest: CreateListRequest = {
  alias: 'nisi et ut exercitation',
  entries: ['elit nulla', 'in', 'irure enim exercitation'],
  kind: 'phone_country_code',
  name: "Terri D'Amore",
};
export const dashboard_CreateOnboardingConfigurationRequest: CreateOnboardingConfigurationRequest = {
  allowInternationalResidents: false,
  allowUsResidents: true,
  allowUsTerritories: false,
  businessDocumentsToCollect: [
    {
      data: {
        collectSelfie: false,
        documentTypesAndCountries: {
          countrySpecific: {},
          global: ['passport_card', 'visa', 'permit'],
        },
      },
      kind: 'identity',
    },
    {
      data: {
        collectSelfie: true,
        documentTypesAndCountries: {
          countrySpecific: {},
          global: ['permit', 'passport', 'passport'],
        },
      },
      kind: 'identity',
    },
    {
      data: {
        collectSelfie: false,
        documentTypesAndCountries: {
          countrySpecific: {},
          global: ['id_card', 'drivers_license', 'residence_document'],
        },
      },
      kind: 'identity',
    },
  ],
  cipKind: 'alpaca',
  curpValidationEnabled: false,
  deprecatedCanAccessData: ['email', 'full_address', 'dob'],
  docScanForOptionalSsn: 'business_name',
  documentTypesAndCountries: {
    countrySpecific: {},
    global: ['passport', 'visa', 'passport_card'],
  },
  documentsToCollect: [
    {
      data: {
        collectSelfie: true,
        documentTypesAndCountries: {
          countrySpecific: {},
          global: ['passport_card', 'passport', 'drivers_license'],
        },
      },
      kind: 'identity',
    },
    {
      data: {
        collectSelfie: false,
        documentTypesAndCountries: {
          countrySpecific: {},
          global: ['visa', 'residence_document', 'passport'],
        },
      },
      kind: 'identity',
    },
    {
      data: {
        collectSelfie: true,
        documentTypesAndCountries: {
          countrySpecific: {},
          global: ['passport_card', 'passport', 'visa'],
        },
      },
      kind: 'identity',
    },
  ],
  enhancedAml: {
    adverseMedia: true,
    enhancedAml: false,
    matchKind: 'fuzzy_medium',
    ofac: true,
    pep: false,
  },
  internationalCountryRestrictions: ['LR', 'CL', 'NF'],
  isDocFirstFlow: true,
  isNoPhoneFlow: false,
  kind: 'kyb',
  mustCollectData: ['phone_number', 'dob', 'dob'],
  name: 'Bill Bayer',
  optionalData: ['business_corporation_type', 'ssn4', 'business_address'],
  promptForPasskey: true,
  requiredAuthMethods: ['email', 'email', 'phone'],
  skipConfirm: true,
  skipKyc: false,
  verificationChecks: [
    {
      data: {
        einOnly: false,
      },
      kind: 'kyb',
    },
    {
      data: {
        einOnly: true,
      },
      kind: 'kyb',
    },
    {
      data: {
        einOnly: true,
      },
      kind: 'kyb',
    },
  ],
};
export const dashboard_CreateOrgFrequentNoteRequest: CreateOrgFrequentNoteRequest = {
  content: 'Excepteur culpa',
  kind: 'annotation',
};
export const dashboard_CreateOrgTenantTagRequest: CreateOrgTenantTagRequest = {
  kind: 'person',
  tag: 'nulla est anim',
};
export const dashboard_CreatePlaybookVersionRequest: CreatePlaybookVersionRequest = {
  expectedLatestObcId: '0b8a9c6d-7fba-43fc-8b10-5e5b30fd947f',
  newOnboardingConfig: {
    allowInternationalResidents: false,
    allowUsResidents: false,
    allowUsTerritories: true,
    businessDocumentsToCollect: [
      {
        data: {
          collectSelfie: true,
          documentTypesAndCountries: {
            countrySpecific: {},
            global: ['id_card', 'voter_identification', 'passport'],
          },
        },
        kind: 'identity',
      },
      {
        data: {
          collectSelfie: false,
          documentTypesAndCountries: {
            countrySpecific: {},
            global: ['visa', 'drivers_license', 'permit'],
          },
        },
        kind: 'identity',
      },
      {
        data: {
          collectSelfie: false,
          documentTypesAndCountries: {
            countrySpecific: {},
            global: ['residence_document', 'id_card', 'visa'],
          },
        },
        kind: 'identity',
      },
    ],
    cipKind: 'apex',
    curpValidationEnabled: false,
    deprecatedCanAccessData: ['name', 'us_legal_status', 'card'],
    docScanForOptionalSsn: 'phone_number',
    documentTypesAndCountries: {
      countrySpecific: {},
      global: ['passport', 'passport', 'residence_document'],
    },
    documentsToCollect: [
      {
        data: {
          collectSelfie: false,
          documentTypesAndCountries: {
            countrySpecific: {},
            global: ['drivers_license', 'permit', 'passport'],
          },
        },
        kind: 'identity',
      },
      {
        data: {
          collectSelfie: false,
          documentTypesAndCountries: {
            countrySpecific: {},
            global: ['residence_document', 'residence_document', 'drivers_license'],
          },
        },
        kind: 'identity',
      },
      {
        data: {
          collectSelfie: false,
          documentTypesAndCountries: {
            countrySpecific: {},
            global: ['passport_card', 'drivers_license', 'drivers_license'],
          },
        },
        kind: 'identity',
      },
    ],
    enhancedAml: {
      adverseMedia: false,
      enhancedAml: true,
      matchKind: 'fuzzy_medium',
      ofac: true,
      pep: false,
    },
    internationalCountryRestrictions: ['BO', 'ML', 'CH'],
    isDocFirstFlow: true,
    isNoPhoneFlow: true,
    kind: 'auth',
    mustCollectData: ['investor_profile', 'us_legal_status', 'business_name'],
    name: 'Elaine Tillman PhD',
    optionalData: ['bank', 'us_tax_id', 'us_tax_id'],
    promptForPasskey: false,
    requiredAuthMethods: ['passkey', 'phone', 'email'],
    skipConfirm: true,
    skipKyc: true,
    verificationChecks: [
      {
        data: {
          einOnly: true,
        },
        kind: 'kyb',
      },
      {
        data: {
          einOnly: true,
        },
        kind: 'kyb',
      },
      {
        data: {
          einOnly: true,
        },
        kind: 'kyb',
      },
    ],
  },
};
export const dashboard_CreateProxyConfigRequest: CreateProxyConfigRequest = {
  accessReason: 'adipisicing labore dolore irure velit',
  clientIdentity: {
    certificate: 'ipsum',
    key: 'fc08605d-df2f-4f9c-8645-56f783b5de0e',
  },
  headers: [
    {
      name: 'Rachel Friesen',
      value: 'Ut',
    },
    {
      name: 'Rachel Friesen',
      value: 'fugiat in esse',
    },
    {
      name: 'Rachel Friesen',
      value: 'sed id aliquip exercitation Ut',
    },
  ],
  ingressSettings: {
    contentType: 'json',
    rules: [
      {
        target: 'id ad mollit',
        token: 'document.permit.back.image',
      },
      {
        target: 'sint ut',
        token: 'id.citizenships',
      },
      {
        target: 'occaecat laboris',
        token: 'document.id_card.ref_number',
      },
    ],
  },
  method: 'nisi',
  name: 'Lee Bahringer',
  pinnedServerCertificates: ['reprehenderit incididunt voluptate pariatur', 'ea eu est', 'pariatur id'],
  secretHeaders: [
    {
      name: 'Pablo Frami V',
      value: 'in sed esse cupidatat occaecat',
    },
    {
      name: 'Pablo Frami V',
      value: 'nostrud et sint culpa',
    },
    {
      name: 'Pablo Frami V',
      value: 'ut ullamco aliqua aliquip amet',
    },
  ],
  url: 'https://taut-scrap.biz/',
};
export const dashboard_CreateReviewRequest: CreateReviewRequest = {
  decision: 'accepted',
  note: 'occaecat Duis',
  submissionId: 'fa0c75cb-76ca-4d65-ac83-3c126f28cd34',
};
export const dashboard_CreateRule: CreateRule = {
  isShadow: true,
  name: 'Fannie Greenholt',
  ruleAction: 'step_up.identity',
  ruleExpression: [
    {
      field: 'document_barcode_content_matches',
      op: 'not_eq',
      value: true,
    },
    {
      field: 'dob_yob_matches',
      op: 'not_eq',
      value: false,
    },
    {
      field: 'dob_located_coppa_alert',
      op: 'eq',
      value: true,
    },
  ],
};
export const dashboard_CreateTagRequest: CreateTagRequest = {
  tag: 'veniam et do',
};
export const dashboard_CreateTenantAndroidAppMetaRequest: CreateTenantAndroidAppMetaRequest = {
  apkCertSha256S: ['est voluptate occaecat eu amet', 'nostrud proident', 'Lorem'],
  integrityDecryptionKey: '534aaa55-b14f-47d2-bf10-2a4a3ee045aa',
  integrityVerificationKey: '696bb606-c86d-40c6-a513-84ed5431aca2',
  packageNames: ['tempor', 'consectetur', 'Excepteur quis pariatur mollit'],
};
export const dashboard_CreateTenantIosAppMetaRequest: CreateTenantIosAppMetaRequest = {
  appBundleIds: ['exercitation ea ullamco adipisicing', 'aliquip', 'laboris minim tempor'],
  deviceCheckKeyId: 'f63d8231-1bcc-41ff-931e-75974574a3b7',
  deviceCheckPrivateKey: 'e0dec18f-7cdf-41a6-bad8-f970cd272da9',
  teamId: '028fb068-cfe1-4ada-a0e3-e06d5f8869e5',
};
export const dashboard_CreateTenantRoleRequest: CreateTenantRoleRequest = {
  kind: 'api_key',
  name: 'Geoffrey Abshire',
  scopes: [
    {
      kind: 'read',
    },
    {
      kind: 'read',
    },
    {
      kind: 'read',
    },
  ],
};
export const dashboard_CreateTenantUserRequest: CreateTenantUserRequest = {
  email: 'maeve94@gmail.com',
  firstName: 'Ewell',
  lastName: 'Hagenes',
  omitEmailInvite: true,
  redirectUrl: 'https://gullible-soup.net',
  roleId: '1947aac2-7c90-4c10-8cc0-ae78cfb206ad',
};
export const dashboard_CreateTokenResponse: CreateTokenResponse = {
  expiresAt: '1916-08-06T07:48:41.0Z',
  link: 'minim id',
  token: '0e29d8e2-2ac6-496d-bab1-c8b6373287a3',
};
export const dashboard_CursorPaginatedAuditEvent: CursorPaginatedAuditEvent = {
  data: [
    {
      detail: {
        data: {
          createdFields: [
            'document.passport_card.gender',
            'document.residence_document.samba_activity_history_response',
            'document.id_card.selfie.image',
          ],
          fpId: '90a3f49e-f974-469e-bf80-a38392065241',
        },
        kind: 'create_user',
      },
      id: 'ba1decac-a722-4d40-86ce-e92aaef2d4eb',
      insightEvent: {
        city: 'Mosheport',
        country: 'Cape Verde',
        ipAddress: '94533 Amelie Alley Apt. 609',
        latitude: 16317883.090590164,
        longitude: 6252570.432305619,
        metroCode: 'Excepteur',
        postalCode: 'cillum',
        region: 'reprehenderit sint non',
        regionName: 'Ellis Bauch',
        sessionId: 'dcdd5776-90d7-451f-898d-0250a63ed509',
        timeZone: 'ullamco nisi fugiat adipisicing',
        timestamp: '1893-01-27T04:47:01.0Z',
        userAgent: 'id sint quis aute cupidatat',
      },
      name: 'complete_user_verification',
      principal: {
        id: '761de038-3777-436a-b04e-873651348342',
        kind: 'user',
      },
      tenantId: '1a136940-9cfb-4661-b373-1a99fc75fef6',
      timestamp: '1920-01-20T19:43:27.0Z',
    },
    {
      detail: {
        data: {
          createdFields: [
            'document.residence_document.classified_document_type',
            'document.id_card.postal_code',
            'document.residence_document.postal_code',
          ],
          fpId: '90a3f49e-f974-469e-bf80-a38392065241',
        },
        kind: 'create_user',
      },
      id: 'ba1decac-a722-4d40-86ce-e92aaef2d4eb',
      insightEvent: {
        city: 'Mosheport',
        country: 'Cape Verde',
        ipAddress: '94533 Amelie Alley Apt. 609',
        latitude: 70925011.95629266,
        longitude: 25351171.735766843,
        metroCode: 'veniam Ut ut ex in',
        postalCode: 'adipisicing',
        region: 'ipsum velit aliquip exercitation laborum',
        regionName: 'Ellis Bauch',
        sessionId: 'dcdd5776-90d7-451f-898d-0250a63ed509',
        timeZone: 'Ut',
        timestamp: '1927-07-17T01:15:10.0Z',
        userAgent: 'sed amet velit',
      },
      name: 'decrypt_user_data',
      principal: {
        id: '761de038-3777-436a-b04e-873651348342',
        kind: 'user',
      },
      tenantId: '1a136940-9cfb-4661-b373-1a99fc75fef6',
      timestamp: '1909-07-02T08:11:47.0Z',
    },
    {
      detail: {
        data: {
          createdFields: [
            'document.residence_document.full_address',
            'document.voter_identification.city',
            'document.residence_document.front.image',
          ],
          fpId: '90a3f49e-f974-469e-bf80-a38392065241',
        },
        kind: 'create_user',
      },
      id: 'ba1decac-a722-4d40-86ce-e92aaef2d4eb',
      insightEvent: {
        city: 'Mosheport',
        country: 'Cape Verde',
        ipAddress: '94533 Amelie Alley Apt. 609',
        latitude: -28563598.92794606,
        longitude: -8800647.202693403,
        metroCode: 'ut sit qui',
        postalCode: 'mollit',
        region: 'dolore labore incididunt cupidatat ut',
        regionName: 'Ellis Bauch',
        sessionId: 'dcdd5776-90d7-451f-898d-0250a63ed509',
        timeZone: 'labore',
        timestamp: '1967-07-07T11:32:01.0Z',
        userAgent: 'Duis ex',
      },
      name: 'complete_user_verification',
      principal: {
        id: '761de038-3777-436a-b04e-873651348342',
        kind: 'user',
      },
      tenantId: '1a136940-9cfb-4661-b373-1a99fc75fef6',
      timestamp: '1931-08-28T08:52:30.0Z',
    },
  ],
  meta: {
    count: 53773273,
    next: 'nisi ad nostrud',
  },
};
export const dashboard_CursorPaginatedEntity: CursorPaginatedEntity = {
  data: [
    {
      data: [
        {
          dataKind: 'vault_data',
          identifier: 'document.visa.nationality',
          isDecryptable: false,
          source: 'vendor',
          transforms: {},
          value: 'ad officia reprehenderit commodo',
        },
        {
          dataKind: 'document_data',
          identifier: 'business.dba',
          isDecryptable: false,
          source: 'bootstrap',
          transforms: {},
          value: 'qui nisi fugiat minim mollit',
        },
        {
          dataKind: 'vault_data',
          identifier: 'id.address_line2',
          isDecryptable: false,
          source: 'ocr',
          transforms: {},
          value: 'cupidatat ut sunt',
        },
      ],
      externalId: '9289f8d0-52e3-41c5-b7e0-25ac5ad8021f',
      hasOutstandingWorkflowRequest: false,
      id: 'ea0f0ae7-3d54-4764-a644-6d46aeec4a14',
      isCreatedViaApi: false,
      isIdentifiable: true,
      isPortable: false,
      kind: 'person',
      label: 'offboard_fraud',
      lastActivityAt: '1908-09-14T11:09:30.0Z',
      manualReviewKinds: ['rule_triggered', 'rule_triggered', 'rule_triggered'],
      orderingId: -41231822,
      requiresManualReview: false,
      sandboxId: 'c4925264-d709-4c75-9d3a-b3e9ebd1af58',
      startTimestamp: '1940-11-26T01:13:32.0Z',
      status: 'pending',
      svId: '626e58ef-842e-450d-be79-7e6759b9b48d',
      tags: [
        {
          createdAt: '1919-10-06T03:38:20.0Z',
          id: '10c74658-f0ca-44b5-b853-6535a24d9518',
          tag: 'adipisicing',
        },
        {
          createdAt: '1913-10-16T23:08:39.0Z',
          id: '10c74658-f0ca-44b5-b853-6535a24d9518',
          tag: 'in Ut',
        },
        {
          createdAt: '1933-08-17T19:44:11.0Z',
          id: '10c74658-f0ca-44b5-b853-6535a24d9518',
          tag: 'pariatur do mollit',
        },
      ],
      vId: 'f5c860e6-8869-4ef5-b440-1bb50db1f3fa',
      watchlistCheck: {
        id: '68b88494-3263-4d2b-ad80-3cc5750d2257',
        reasonCodes: ['dob_mob_does_not_match', 'phone_number_input_invalid', 'document_requires_review'],
        status: 'pass',
      },
      workflows: [
        {
          createdAt: '1907-05-23T04:58:33.0Z',
          insightEvent: {
            city: 'Port Wilford',
            country: 'Israel',
            ipAddress: '863 Walker Via Suite 857',
            latitude: 64004267.70723376,
            longitude: -81961596.09417637,
            metroCode: 'irure',
            postalCode: 'laborum adipisicing pariatur nulla dolor',
            region: 'adipisicing in ipsum incididunt',
            regionName: 'Isaac MacGyver',
            sessionId: '17eec8aa-21f5-496f-8f08-b4c88b2702d9',
            timeZone: 'commodo aute ut velit',
            timestamp: '1951-06-04T08:59:20.0Z',
            userAgent: 'anim',
          },
          playbookId: '035fb141-36b6-49cf-9ceb-4b1977af0fa8',
          status: 'none',
        },
        {
          createdAt: '1895-10-12T17:36:56.0Z',
          insightEvent: {
            city: 'Port Wilford',
            country: 'Israel',
            ipAddress: '863 Walker Via Suite 857',
            latitude: -51189154.3184412,
            longitude: -5236781.348334134,
            metroCode: 'enim commodo',
            postalCode: 'ex',
            region: 'sed occaecat amet consequat',
            regionName: 'Isaac MacGyver',
            sessionId: '17eec8aa-21f5-496f-8f08-b4c88b2702d9',
            timeZone: 'mollit',
            timestamp: '1955-02-08T01:42:33.0Z',
            userAgent: 'occaecat',
          },
          playbookId: '035fb141-36b6-49cf-9ceb-4b1977af0fa8',
          status: 'none',
        },
        {
          createdAt: '1931-11-27T20:13:55.0Z',
          insightEvent: {
            city: 'Port Wilford',
            country: 'Israel',
            ipAddress: '863 Walker Via Suite 857',
            latitude: -40671998.46378951,
            longitude: 48127892.37149885,
            metroCode: 'sed amet',
            postalCode: 'non dolore elit',
            region: 'dolore esse aute veniam in',
            regionName: 'Isaac MacGyver',
            sessionId: '17eec8aa-21f5-496f-8f08-b4c88b2702d9',
            timeZone: 'Ut sunt',
            timestamp: '1953-10-20T11:27:16.0Z',
            userAgent: 'ullamco Excepteur',
          },
          playbookId: '035fb141-36b6-49cf-9ceb-4b1977af0fa8',
          status: 'none',
        },
      ],
    },
    {
      data: [
        {
          dataKind: 'vault_data',
          identifier: 'document.drivers_license.nationality',
          isDecryptable: true,
          source: 'client_tenant',
          transforms: {},
          value: 'ut qui quis',
        },
        {
          dataKind: 'document_data',
          identifier: 'document.drivers_license.curp_validation_response',
          isDecryptable: false,
          source: 'prefill',
          transforms: {},
          value: 'aute sint',
        },
        {
          dataKind: 'vault_data',
          identifier: 'document.passport_card.issuing_country',
          isDecryptable: false,
          source: 'client_tenant',
          transforms: {},
          value: 'Duis quis',
        },
      ],
      externalId: '9289f8d0-52e3-41c5-b7e0-25ac5ad8021f',
      hasOutstandingWorkflowRequest: true,
      id: 'ea0f0ae7-3d54-4764-a644-6d46aeec4a14',
      isCreatedViaApi: true,
      isIdentifiable: true,
      isPortable: false,
      kind: 'business',
      label: 'active',
      lastActivityAt: '1961-04-06T06:01:24.0Z',
      manualReviewKinds: ['rule_triggered', 'rule_triggered', 'document_needs_review'],
      orderingId: 58100611,
      requiresManualReview: true,
      sandboxId: 'c4925264-d709-4c75-9d3a-b3e9ebd1af58',
      startTimestamp: '1927-03-08T06:11:16.0Z',
      status: 'fail',
      svId: '626e58ef-842e-450d-be79-7e6759b9b48d',
      tags: [
        {
          createdAt: '1918-09-26T15:10:55.0Z',
          id: '10c74658-f0ca-44b5-b853-6535a24d9518',
          tag: 'nisi',
        },
        {
          createdAt: '1967-06-21T05:01:50.0Z',
          id: '10c74658-f0ca-44b5-b853-6535a24d9518',
          tag: 'laborum occaecat consectetur mollit officia',
        },
        {
          createdAt: '1931-09-26T23:27:13.0Z',
          id: '10c74658-f0ca-44b5-b853-6535a24d9518',
          tag: 'ex incididunt cillum veniam dolore',
        },
      ],
      vId: 'f5c860e6-8869-4ef5-b440-1bb50db1f3fa',
      watchlistCheck: {
        id: '68b88494-3263-4d2b-ad80-3cc5750d2257',
        reasonCodes: [
          'business_address_deliverable',
          'document_selfie_used_with_different_information',
          'business_address_close_match',
        ],
        status: 'not_needed',
      },
      workflows: [
        {
          createdAt: '1909-08-02T07:12:44.0Z',
          insightEvent: {
            city: 'Port Wilford',
            country: 'Israel',
            ipAddress: '863 Walker Via Suite 857',
            latitude: -90473768.02415976,
            longitude: -44252600.15946431,
            metroCode: 'commodo incididunt do aliqua',
            postalCode: 'nisi ad',
            region: 'laborum occaecat sint',
            regionName: 'Isaac MacGyver',
            sessionId: '17eec8aa-21f5-496f-8f08-b4c88b2702d9',
            timeZone: 'nisi Duis eu consectetur consequat',
            timestamp: '1950-10-27T22:24:51.0Z',
            userAgent: 'ex laborum',
          },
          playbookId: '035fb141-36b6-49cf-9ceb-4b1977af0fa8',
          status: 'pending',
        },
        {
          createdAt: '1926-07-27T18:46:30.0Z',
          insightEvent: {
            city: 'Port Wilford',
            country: 'Israel',
            ipAddress: '863 Walker Via Suite 857',
            latitude: 88549466.96799296,
            longitude: 866128.112760961,
            metroCode: 'ad',
            postalCode: 'adipisicing labore in do',
            region: 'adipisicing ad',
            regionName: 'Isaac MacGyver',
            sessionId: '17eec8aa-21f5-496f-8f08-b4c88b2702d9',
            timeZone: 'irure',
            timestamp: '1945-05-03T04:22:47.0Z',
            userAgent: 'veniam dolor',
          },
          playbookId: '035fb141-36b6-49cf-9ceb-4b1977af0fa8',
          status: 'incomplete',
        },
        {
          createdAt: '1922-11-19T18:49:05.0Z',
          insightEvent: {
            city: 'Port Wilford',
            country: 'Israel',
            ipAddress: '863 Walker Via Suite 857',
            latitude: 89693969.3520234,
            longitude: -41952736.72679911,
            metroCode: 'anim fugiat',
            postalCode: 'proident ea anim',
            region: 'commodo Excepteur magna',
            regionName: 'Isaac MacGyver',
            sessionId: '17eec8aa-21f5-496f-8f08-b4c88b2702d9',
            timeZone: 'laboris',
            timestamp: '1960-08-16T21:34:14.0Z',
            userAgent: 'do enim fugiat esse',
          },
          playbookId: '035fb141-36b6-49cf-9ceb-4b1977af0fa8',
          status: 'incomplete',
        },
      ],
    },
    {
      data: [
        {
          dataKind: 'vault_data',
          identifier: 'document.drivers_license.issuing_country',
          isDecryptable: false,
          source: 'client_tenant',
          transforms: {},
          value: 'Duis',
        },
        {
          dataKind: 'vault_data',
          identifier: 'business.formation_state',
          isDecryptable: true,
          source: 'bootstrap',
          transforms: {},
          value: 'incididunt non veniam',
        },
        {
          dataKind: 'document_data',
          identifier: 'document.drivers_license.curp_validation_response',
          isDecryptable: true,
          source: 'ocr',
          transforms: {},
          value: 'ut',
        },
      ],
      externalId: '9289f8d0-52e3-41c5-b7e0-25ac5ad8021f',
      hasOutstandingWorkflowRequest: false,
      id: 'ea0f0ae7-3d54-4764-a644-6d46aeec4a14',
      isCreatedViaApi: false,
      isIdentifiable: false,
      isPortable: true,
      kind: 'person',
      label: 'active',
      lastActivityAt: '1894-06-21T04:03:02.0Z',
      manualReviewKinds: ['document_needs_review', 'document_needs_review', 'document_needs_review'],
      orderingId: -44060489,
      requiresManualReview: false,
      sandboxId: 'c4925264-d709-4c75-9d3a-b3e9ebd1af58',
      startTimestamp: '1911-04-08T06:52:54.0Z',
      status: 'in_progress',
      svId: '626e58ef-842e-450d-be79-7e6759b9b48d',
      tags: [
        {
          createdAt: '1943-02-08T09:44:56.0Z',
          id: '10c74658-f0ca-44b5-b853-6535a24d9518',
          tag: 'sint minim sunt',
        },
        {
          createdAt: '1920-03-30T16:06:39.0Z',
          id: '10c74658-f0ca-44b5-b853-6535a24d9518',
          tag: 'magna laborum',
        },
        {
          createdAt: '1942-04-12T22:54:04.0Z',
          id: '10c74658-f0ca-44b5-b853-6535a24d9518',
          tag: 'adipisicing',
        },
      ],
      vId: 'f5c860e6-8869-4ef5-b440-1bb50db1f3fa',
      watchlistCheck: {
        id: '68b88494-3263-4d2b-ad80-3cc5750d2257',
        reasonCodes: [
          'document_pdf417_data_is_not_valid',
          'email_high_risk_domain',
          'sentilink_identity_theft_high_risk',
        ],
        status: 'fail',
      },
      workflows: [
        {
          createdAt: '1951-11-16T13:19:54.0Z',
          insightEvent: {
            city: 'Port Wilford',
            country: 'Israel',
            ipAddress: '863 Walker Via Suite 857',
            latitude: -10005315.03755942,
            longitude: -6482704.771369591,
            metroCode: 'ea aliquip culpa mollit commodo',
            postalCode: 'velit incididunt commodo',
            region: 'cupidatat laboris consequat est',
            regionName: 'Isaac MacGyver',
            sessionId: '17eec8aa-21f5-496f-8f08-b4c88b2702d9',
            timeZone: 'eiusmod culpa',
            timestamp: '1905-06-02T12:29:10.0Z',
            userAgent: 'sint aute officia',
          },
          playbookId: '035fb141-36b6-49cf-9ceb-4b1977af0fa8',
          status: 'pending',
        },
        {
          createdAt: '1931-11-10T12:43:29.0Z',
          insightEvent: {
            city: 'Port Wilford',
            country: 'Israel',
            ipAddress: '863 Walker Via Suite 857',
            latitude: 17452308.723555937,
            longitude: -81743623.95349015,
            metroCode: 'laborum Ut ea',
            postalCode: 'reprehenderit dolore qui',
            region: 'in exercitation id',
            regionName: 'Isaac MacGyver',
            sessionId: '17eec8aa-21f5-496f-8f08-b4c88b2702d9',
            timeZone: 'ad',
            timestamp: '1913-08-26T11:02:45.0Z',
            userAgent: 'ut sint dolore est',
          },
          playbookId: '035fb141-36b6-49cf-9ceb-4b1977af0fa8',
          status: 'pending',
        },
        {
          createdAt: '1932-06-12T14:18:17.0Z',
          insightEvent: {
            city: 'Port Wilford',
            country: 'Israel',
            ipAddress: '863 Walker Via Suite 857',
            latitude: -85134998.47388029,
            longitude: 11050552.94648993,
            metroCode: 'tempor ad',
            postalCode: 'in Duis ut occaecat ut',
            region: 'pariatur do adipisicing officia',
            regionName: 'Isaac MacGyver',
            sessionId: '17eec8aa-21f5-496f-8f08-b4c88b2702d9',
            timeZone: 'laboris',
            timestamp: '1912-02-01T19:25:56.0Z',
            userAgent: 'proident eiusmod nulla velit dolor',
          },
          playbookId: '035fb141-36b6-49cf-9ceb-4b1977af0fa8',
          status: 'incomplete',
        },
      ],
    },
  ],
  meta: {
    count: 63130031,
    next: 69965528,
  },
};
export const dashboard_CursorPaginatedListEvent: CursorPaginatedListEvent = {
  data: [
    {
      detail: {
        data: {
          entries: ['sunt eu veniam', 'in dolore', 'elit non culpa dolore'],
          listEntryCreationId: '1405edd8-1a95-4909-af17-d5a1eb29459b',
          listId: 'c7473bd8-3f76-441c-ac26-7b6a061c2983',
        },
        kind: 'create_list_entry',
      },
      id: '28785149-c832-48e9-abc9-36b7831704b1',
      insightEvent: {
        city: 'Jovannychester',
        country: 'Japan',
        ipAddress: '23758 S East Street Apt. 528',
        latitude: -51115591.16157909,
        longitude: -84605910.83890852,
        metroCode: 'Lorem deserunt ullamco',
        postalCode: 'pariatur',
        region: 'velit adipisicing cillum',
        regionName: 'Horace Ullrich',
        sessionId: '527b7e58-5313-4051-a932-da35a16f39f9',
        timeZone: 'ut nostrud elit',
        timestamp: '1960-05-07T22:37:40.0Z',
        userAgent: 'laboris irure proident',
      },
      name: 'start_user_verification',
      principal: {
        id: '7cfe3128-ae5a-4c2f-9d18-a6c4a8b19140',
        kind: 'user',
      },
      tenantId: 'b72a9ba9-482a-4eb0-9470-4009c2f1ac37',
      timestamp: '1912-08-13T08:38:43.0Z',
    },
    {
      detail: {
        data: {
          entries: ['laboris', 'Duis ut occaecat cupidatat', 'minim'],
          listEntryCreationId: '1405edd8-1a95-4909-af17-d5a1eb29459b',
          listId: 'c7473bd8-3f76-441c-ac26-7b6a061c2983',
        },
        kind: 'create_list_entry',
      },
      id: '28785149-c832-48e9-abc9-36b7831704b1',
      insightEvent: {
        city: 'Jovannychester',
        country: 'Japan',
        ipAddress: '23758 S East Street Apt. 528',
        latitude: 31106326.981500894,
        longitude: -5668702.988168523,
        metroCode: 'sed minim ea nulla Excepteur',
        postalCode: 'esse minim adipisicing',
        region: 'occaecat id sed adipisicing',
        regionName: 'Horace Ullrich',
        sessionId: '527b7e58-5313-4051-a932-da35a16f39f9',
        timeZone: 'sed minim',
        timestamp: '1943-07-17T12:31:48.0Z',
        userAgent: 'eu',
      },
      name: 'start_user_verification',
      principal: {
        id: '7cfe3128-ae5a-4c2f-9d18-a6c4a8b19140',
        kind: 'user',
      },
      tenantId: 'b72a9ba9-482a-4eb0-9470-4009c2f1ac37',
      timestamp: '1947-09-10T06:14:35.0Z',
    },
    {
      detail: {
        data: {
          entries: [
            'aute aliqua incididunt anim nisi',
            'labore laborum deserunt adipisicing consequat',
            'et consequat non',
          ],
          listEntryCreationId: '1405edd8-1a95-4909-af17-d5a1eb29459b',
          listId: 'c7473bd8-3f76-441c-ac26-7b6a061c2983',
        },
        kind: 'create_list_entry',
      },
      id: '28785149-c832-48e9-abc9-36b7831704b1',
      insightEvent: {
        city: 'Jovannychester',
        country: 'Japan',
        ipAddress: '23758 S East Street Apt. 528',
        latitude: 18036513.38034822,
        longitude: 60934163.44517127,
        metroCode: 'Ut',
        postalCode: 'est et consectetur',
        region: 'voluptate cupidatat',
        regionName: 'Horace Ullrich',
        sessionId: '527b7e58-5313-4051-a932-da35a16f39f9',
        timeZone: 'sunt qui eu in',
        timestamp: '1940-11-08T11:21:52.0Z',
        userAgent: 'velit aliqua sunt',
      },
      name: 'login_org_member',
      principal: {
        id: '7cfe3128-ae5a-4c2f-9d18-a6c4a8b19140',
        kind: 'user',
      },
      tenantId: 'b72a9ba9-482a-4eb0-9470-4009c2f1ac37',
      timestamp: '1934-07-06T05:59:12.0Z',
    },
  ],
  meta: {
    count: 44265973,
    next: 'in et id sed minim',
  },
};
export const dashboard_CustomDocumentConfig: CustomDocumentConfig = {
  description: 'voluptate veniam',
  identifier: 'document.id_card.clave_de_elector',
  name: 'Nicolas Ward',
  requiresHumanReview: false,
  uploadSettings: 'capture_only_on_mobile',
};
export const dashboard_DashboardSecretApiKey: DashboardSecretApiKey = {
  createdAt: '1895-05-24T13:57:26.0Z',
  id: '62ba2982-9416-4192-9d8d-ce1a73d05a05',
  isLive: false,
  key: 'a9e6aa87-72fe-40b5-9eab-ba39f3cc25fd',
  lastUsedAt: '1949-03-14T08:29:01.0Z',
  name: 'Dr. Ricardo Langosh',
  role: {
    createdAt: '1945-03-31T20:51:07.0Z',
    id: '5cab1dc1-bf4c-4a6a-9d01-aec0c3a4b7ac',
    isImmutable: true,
    kind: 'compliance_partner_dashboard_user',
    name: 'Mrs. Brittany Connelly',
    numActiveApiKeys: 77628462,
    numActiveUsers: 1019348,
    scopes: [
      {
        kind: 'read',
      },
      {
        kind: 'read',
      },
      {
        kind: 'read',
      },
    ],
  },
  scrubbedKey: '661bdfd1-cb1a-4d44-afd5-a615a17dadb6',
  status: 'disabled',
};
export const dashboard_DataAttributeKind: DataAttributeKind = 'document_data';
export const dashboard_DataCollectedInfo: DataCollectedInfo = {
  actor: {
    id: 'c008bcac-4e4a-41d7-902e-f3f3cfd08264',
    kind: 'user',
  },
  attributes: ['business_tin', 'business_address', 'dob'],
  isPrefill: false,
  targets: [
    'document.voter_identification.full_address',
    'document.drivers_license.nationality',
    'document.passport_card.curp_validation_response',
  ],
};
export const dashboard_DataIdentifier: DataIdentifier = 'business.formation_date';
export const dashboard_DataLifetimeSource: DataLifetimeSource = 'client_tenant';
export const dashboard_DbActor: DbActor = {
  data: {
    id: '719f959a-47e9-457f-9fae-cf2cd8b5226b',
  },
  kind: 'user',
};
export const dashboard_DbActorFirmEmployee: DbActorFirmEmployee = {
  data: {
    id: 'ed3ae1e2-6b10-4f82-a632-42caf2fd31d5',
  },
  kind: 'firm_employee',
};
export const dashboard_DbActorFootprint: DbActorFootprint = {
  kind: 'footprint',
};
export const dashboard_DbActorTenantApiKey: DbActorTenantApiKey = {
  data: {
    id: '39e3b751-3ba1-4f24-acc3-6d82efbe1a4f',
  },
  kind: 'tenant_api_key',
};
export const dashboard_DbActorTenantUser: DbActorTenantUser = {
  data: {
    id: 'd0203384-f90c-4e21-9df8-f7a94bd24e6c',
  },
  kind: 'tenant_user',
};
export const dashboard_DbActorUser: DbActorUser = {
  data: {
    id: 'a3acb3a5-d85b-4453-a22c-972fc4b8f18a',
  },
  kind: 'user',
};
export const dashboard_DecisionStatus: DecisionStatus = 'fail';
export const dashboard_DecryptionContext: DecryptionContext = 'vault_proxy';
export const dashboard_DeleteRequest: DeleteRequest = {
  deleteAll: false,
  fields: [
    'document.residence_document.full_name',
    'document.residence_document.selfie.mime_type',
    'document.id_card.curp_validation_response',
  ],
};
export const dashboard_DeviceFraudRiskLevel: DeviceFraudRiskLevel = 'medium';
export const dashboard_DeviceInsightField: DeviceInsightField = 'ip_address';
export const dashboard_DeviceInsightOperation: DeviceInsightOperation = {
  field: 'ip_address',
  op: 'is_in',
  value: 'anim commodo nulla dolor consectetur',
};
export const dashboard_DeviceType: DeviceType = 'android';
export const dashboard_DocsTokenResponse: DocsTokenResponse = {
  token: 'ad6eb44f-437d-4e0d-8189-d159bb330d6f',
};
export const dashboard_Document: Document = {
  completedVersion: 84443820,
  curpCompletedVersion: -2350034,
  documentScore: -57050975.59157788,
  kind: 'voter_identification',
  ocrConfidenceScore: -78310906.76388204,
  reviewStatus: 'unreviewed',
  sambaActivityHistoryCompletedVersion: -2698363,
  selfieScore: -74362032.63221093,
  startedAt: '1951-04-09T08:03:59.0Z',
  status: 'complete',
  statusDescription: 'Excepteur id et est',
  uploadSource: 'mobile',
  uploads: [
    {
      failureReasons: ['selfie_too_dark', 'barcode_not_detected', 'selfie_image_orientation_incorrect'],
      identifier: 'document.voter_identification.clave_de_elector',
      isExtraCompressed: false,
      side: 'back',
      timestamp: '1936-10-03T03:28:53.0Z',
      version: -78084870,
    },
    {
      failureReasons: ['wrong_document_side', 'drivers_license_permit_not_allowed', 'selfie_low_confidence'],
      identifier: 'document.voter_identification.postal_code',
      isExtraCompressed: true,
      side: 'front',
      timestamp: '1952-12-26T17:43:12.0Z',
      version: 70681143,
    },
    {
      failureReasons: ['selfie_has_face_mask', 'unsupported_document_type', 'selfie_blurry'],
      identifier: 'document.residence_document.issuing_country',
      isExtraCompressed: true,
      side: 'selfie',
      timestamp: '1893-02-14T10:27:17.0Z',
      version: -79673818,
    },
  ],
};
export const dashboard_DocumentAndCountryConfiguration: DocumentAndCountryConfiguration = {
  countrySpecific: {},
  global: ['visa', 'voter_identification', 'passport_card'],
};
export const dashboard_DocumentImageError: DocumentImageError = 'barcode_not_detected';
export const dashboard_DocumentKind: DocumentKind = 'drivers_license';
export const dashboard_DocumentRequest: DocumentRequest = {
  kind: 'proof_of_ssn',
  ruleSetResultId: 'b72de1a0-be5c-46e8-9d0e-e87526c715de',
};
export const dashboard_DocumentRequestConfig: DocumentRequestConfig = {
  data: {
    collectSelfie: true,
    documentTypesAndCountries: {
      countrySpecific: {},
      global: ['voter_identification', 'id_card', 'passport'],
    },
  },
  kind: 'identity',
};
export const dashboard_DocumentRequestConfigCustom: DocumentRequestConfigCustom = {
  data: {
    description: 'dolor laborum labore',
    identifier: 'custom.*',
    name: 'Jodi McDermott',
    requiresHumanReview: true,
    uploadSettings: 'capture_only_on_mobile',
  },
  kind: 'custom',
};
export const dashboard_DocumentRequestConfigIdentity: DocumentRequestConfigIdentity = {
  data: {
    collectSelfie: false,
    documentTypesAndCountries: {
      countrySpecific: {},
      global: ['permit', 'permit', 'id_card'],
    },
  },
  kind: 'identity',
};
export const dashboard_DocumentRequestConfigProofOfAddress: DocumentRequestConfigProofOfAddress = {
  data: {
    requiresHumanReview: true,
  },
  kind: 'proof_of_address',
};
export const dashboard_DocumentRequestConfigProofOfSsn: DocumentRequestConfigProofOfSsn = {
  data: {
    requiresHumanReview: true,
  },
  kind: 'proof_of_ssn',
};
export const dashboard_DocumentRequestKind: DocumentRequestKind = 'identity';
export const dashboard_DocumentReviewStatus: DocumentReviewStatus = 'pending_human_review';
export const dashboard_DocumentSide: DocumentSide = 'selfie';
export const dashboard_DocumentStatus: DocumentStatus = 'pending';
export const dashboard_DocumentUpload: DocumentUpload = {
  failureReasons: ['selfie_face_not_found', 'image_error', 'invalid_jpeg'],
  identifier: 'document.residence_document.gender',
  isExtraCompressed: false,
  side: 'front',
  timestamp: '1953-12-02T15:26:23.0Z',
  version: 93080216,
};
export const dashboard_DocumentUploadSettings: DocumentUploadSettings = 'prefer_capture';
export const dashboard_DocumentUploadedTimelineEvent: DocumentUploadedTimelineEvent = {
  config: {
    data: {
      collectSelfie: false,
      documentTypesAndCountries: {
        countrySpecific: {},
        global: ['passport', 'permit', 'drivers_license'],
      },
    },
    kind: 'identity',
  },
  deviceType: 'ios',
  documentType: 'id_card',
  status: 'pending',
};
export const dashboard_DupeKind: DupeKind = 'cookie_id';
export const dashboard_Dupes: Dupes = {
  otherTenant: {
    numMatches: -27344066,
    numTenants: -43899790,
  },
  sameTenant: [
    {
      data: [
        {
          dataKind: 'document_data',
          identifier: 'document.id_card.nationality',
          isDecryptable: false,
          source: 'components_sdk',
          transforms: {},
          value: 'sint pariatur culpa',
        },
        {
          dataKind: 'document_data',
          identifier: 'investor_profile.senior_executive_symbols',
          isDecryptable: true,
          source: 'ocr',
          transforms: {},
          value: 'Duis',
        },
        {
          dataKind: 'vault_data',
          identifier: 'document.residence_document.selfie.mime_type',
          isDecryptable: false,
          source: 'bootstrap',
          transforms: {},
          value: 'dolor elit in',
        },
      ],
      dupeKinds: ['cookie_id', 'cookie_id', 'ssn9'],
      fpId: '1d37dbdf-8b5c-4b12-924d-032deba2df5b',
      startTimestamp: '1955-02-19T01:41:52.0Z',
      status: 'in_progress',
    },
    {
      data: [
        {
          dataKind: 'document_data',
          identifier: 'document.visa.classified_document_type',
          isDecryptable: false,
          source: 'tenant',
          transforms: {},
          value: 'aliquip aliqua enim cillum',
        },
        {
          dataKind: 'document_data',
          identifier: 'document.voter_identification.back.mime_type',
          isDecryptable: false,
          source: 'prefill',
          transforms: {},
          value: 'dolor sunt laborum do',
        },
        {
          dataKind: 'document_data',
          identifier: 'document.passport_card.issuing_state',
          isDecryptable: false,
          source: 'ocr',
          transforms: {},
          value: 'nisi mollit cillum nulla sit',
        },
      ],
      dupeKinds: ['cookie_id', 'ssn9', 'bank_routing_account'],
      fpId: '1d37dbdf-8b5c-4b12-924d-032deba2df5b',
      startTimestamp: '1950-07-26T09:01:41.0Z',
      status: 'none',
    },
    {
      data: [
        {
          dataKind: 'vault_data',
          identifier: 'document.residence_document.expires_at',
          isDecryptable: false,
          source: 'bootstrap',
          transforms: {},
          value: 'pariatur in eiusmod',
        },
        {
          dataKind: 'vault_data',
          identifier: 'id.drivers_license_state',
          isDecryptable: false,
          source: 'client_tenant',
          transforms: {},
          value: 'culpa',
        },
        {
          dataKind: 'document_data',
          identifier: 'card.*.billing_address.country',
          isDecryptable: false,
          source: 'tenant',
          transforms: {},
          value: 'voluptate',
        },
      ],
      dupeKinds: ['device_id', 'card_number_cvc', 'bank_routing_account'],
      fpId: '1d37dbdf-8b5c-4b12-924d-032deba2df5b',
      startTimestamp: '1910-06-22T22:13:39.0Z',
      status: 'pass',
    },
  ],
};
export const dashboard_EditRule: EditRule = {
  ruleExpression: [
    {
      field: 'ssn_located_issue_date_cannot_be_verified',
      op: 'not_eq',
      value: false,
    },
    {
      field: 'ssn_potentially_belongs_to_another',
      op: 'eq',
      value: false,
    },
    {
      field: 'document_ocr_name_matches',
      op: 'eq',
      value: true,
    },
  ],
  ruleId: 'f3f80328-4e1a-4e29-b702-ed62b60265a7',
};
export const dashboard_Empty: Empty = {};
export const dashboard_EnclaveHealthResponse: EnclaveHealthResponse = {
  decryptMs: -18567333,
  keypairGenMs: -41244421,
  success: false,
};
export const dashboard_EnhancedAml: EnhancedAml = {
  adverseMedia: false,
  enhancedAml: true,
  matchKind: 'fuzzy_medium',
  ofac: false,
  pep: true,
};
export const dashboard_Entity: Entity = {
  data: [
    {
      dataKind: 'vault_data',
      identifier: 'card.*.expiration_year',
      isDecryptable: false,
      source: 'hosted',
      transforms: {},
      value: 'exercitation',
    },
    {
      dataKind: 'document_data',
      identifier: 'document.visa.first_name',
      isDecryptable: true,
      source: 'client_tenant',
      transforms: {},
      value: 'nulla cupidatat dolore adipisicing exercitation',
    },
    {
      dataKind: 'document_data',
      identifier: 'investor_profile.occupation',
      isDecryptable: true,
      source: 'tenant',
      transforms: {},
      value: 'laborum Duis',
    },
  ],
  externalId: '3fad5ed9-77cc-46ce-930d-5b2793f8b48e',
  hasOutstandingWorkflowRequest: true,
  id: '277e0b1c-59ba-402b-835f-cf922c24f69e',
  isCreatedViaApi: true,
  isIdentifiable: true,
  isPortable: false,
  kind: 'business',
  label: 'offboard_fraud',
  lastActivityAt: '1890-07-15T01:01:56.0Z',
  manualReviewKinds: ['rule_triggered', 'rule_triggered', 'document_needs_review'],
  orderingId: -35621100,
  requiresManualReview: false,
  sandboxId: '92eb538b-8483-4e7d-b536-9081f1008519',
  startTimestamp: '1921-01-18T23:55:51.0Z',
  status: 'fail',
  svId: '0521736c-40ff-418a-8211-fdec41b28b8e',
  tags: [
    {
      createdAt: '1902-12-03T05:52:51.0Z',
      id: '13f896a0-b930-4afb-ace7-7651a3135f2e',
      tag: 'Excepteur Lorem',
    },
    {
      createdAt: '1904-01-18T12:30:09.0Z',
      id: '13f896a0-b930-4afb-ace7-7651a3135f2e',
      tag: 'labore',
    },
    {
      createdAt: '1905-06-06T15:24:02.0Z',
      id: '13f896a0-b930-4afb-ace7-7651a3135f2e',
      tag: 'consequat veniam dolore voluptate',
    },
  ],
  vId: 'b72f7b2a-1f6f-41e7-b018-333f1702a46c',
  watchlistCheck: {
    id: '9494a19e-ac68-4655-bc20-e88337ab107d',
    reasonCodes: ['curp_service_not_available', 'name_does_not_match', 'business_website_unverified'],
    status: 'pass',
  },
  workflows: [
    {
      createdAt: '1906-11-27T01:46:33.0Z',
      insightEvent: {
        city: 'Stammfield',
        country: 'Switzerland',
        ipAddress: '17971 Eleazar Lake Suite 248',
        latitude: 91091649.84232688,
        longitude: -43037931.67959897,
        metroCode: 'culpa adipisicing',
        postalCode: 'nulla tempor',
        region: 'Duis non',
        regionName: 'Erin Swaniawski',
        sessionId: 'a5c0f86a-5f67-484b-98c8-14e0b3177348',
        timeZone: 'et',
        timestamp: '1908-07-25T12:04:52.0Z',
        userAgent: 'dolor commodo incididunt voluptate',
      },
      playbookId: '857e680c-cf2b-4e5b-957d-20221ff7668f',
      status: 'none',
    },
    {
      createdAt: '1961-10-10T05:16:42.0Z',
      insightEvent: {
        city: 'Stammfield',
        country: 'Switzerland',
        ipAddress: '17971 Eleazar Lake Suite 248',
        latitude: 11100256.469420299,
        longitude: -50318453.17635351,
        metroCode: 'laboris pariatur',
        postalCode: 'dolor cupidatat enim officia nisi',
        region: 'ipsum dolore id sed consequat',
        regionName: 'Erin Swaniawski',
        sessionId: 'a5c0f86a-5f67-484b-98c8-14e0b3177348',
        timeZone: 'nulla quis',
        timestamp: '1908-06-14T01:21:46.0Z',
        userAgent: 'ea aliquip pariatur irure est',
      },
      playbookId: '857e680c-cf2b-4e5b-957d-20221ff7668f',
      status: 'fail',
    },
    {
      createdAt: '1944-05-24T22:46:56.0Z',
      insightEvent: {
        city: 'Stammfield',
        country: 'Switzerland',
        ipAddress: '17971 Eleazar Lake Suite 248',
        latitude: -25182833.238609254,
        longitude: 50345231.4855378,
        metroCode: 'non irure',
        postalCode: 'ipsum eu minim',
        region: 'in cupidatat',
        regionName: 'Erin Swaniawski',
        sessionId: 'a5c0f86a-5f67-484b-98c8-14e0b3177348',
        timeZone: 'exercitation magna laboris occaecat amet',
        timestamp: '1949-03-22T13:39:21.0Z',
        userAgent: 'proident anim tempor',
      },
      playbookId: '857e680c-cf2b-4e5b-957d-20221ff7668f',
      status: 'pending',
    },
  ],
};
export const dashboard_EntityAction: EntityAction = {
  fpBid: '2785553b-dc76-460c-8164-d64e1787be6e',
  kind: 'trigger',
  note: 'Duis qui',
  trigger: {
    data: {
      businessConfigs: [
        {
          data: {
            collectSelfie: true,
            documentTypesAndCountries: {
              countrySpecific: {},
              global: ['permit', 'voter_identification', 'drivers_license'],
            },
          },
          kind: 'identity',
        },
        {
          data: {
            requiresHumanReview: false,
          },
          kind: 'proof_of_ssn',
        },
        {
          data: {
            requiresHumanReview: true,
          },
          kind: 'proof_of_address',
        },
      ],
      configs: [
        {
          data: {
            requiresHumanReview: false,
          },
          kind: 'proof_of_address',
        },
        {
          data: {
            requiresHumanReview: false,
          },
          kind: 'proof_of_ssn',
        },
        {
          data: {
            requiresHumanReview: true,
          },
          kind: 'proof_of_ssn',
        },
      ],
    },
    kind: 'document',
  },
};
export const dashboard_EntityActionClearReview: EntityActionClearReview = {
  kind: 'clear_review',
};
export const dashboard_EntityActionManualDecision: EntityActionManualDecision = {
  annotation: {
    isPinned: false,
    note: 'proident aute voluptate est',
  },
  kind: 'manual_decision',
  status: 'pass',
};
export const dashboard_EntityActionResponse: EntityActionResponse = {
  expiresAt: '1917-10-30T15:03:11.0Z',
  kind: 'trigger',
  link: 'fugiat adipisicing anim et enim',
  token: 'de8a5133-091c-4879-b82e-d3e27a7def31',
};
export const dashboard_EntityActionResponseTrigger: EntityActionResponseTrigger = {
  expiresAt: '1936-03-22T16:13:45.0Z',
  kind: 'trigger',
  link: 'dolore culpa',
  token: '44cb927d-71e5-4e9c-a2a4-73824bc3f3ce',
};
export const dashboard_EntityActionTrigger: EntityActionTrigger = {
  fpBid: '53553c19-481c-472f-b5c6-981395de46c8',
  kind: 'trigger',
  note: 'cillum',
  trigger: {
    data: {
      playbookId: '6e542123-e213-47be-870d-59dae64d51dc',
      recollectAttributes: ['business_website', 'us_tax_id', 'investor_profile'],
      reuseExistingBoKyc: false,
    },
    kind: 'onboard',
  },
};
export const dashboard_EntityActionsRequest: EntityActionsRequest = {
  actions: [
    {
      fpBid: '98aef0f8-a261-4906-8805-5934a4149c4e',
      kind: 'trigger',
      note: 'exercitation deserunt minim nulla',
      trigger: {
        data: {
          playbookId: 'f7677c88-b13a-4762-9dc6-a1363a704fa5',
          recollectAttributes: ['ssn4', 'business_phone_number', 'phone_number'],
          reuseExistingBoKyc: true,
        },
        kind: 'onboard',
      },
    },
    {
      fpBid: '98aef0f8-a261-4906-8805-5934a4149c4e',
      kind: 'trigger',
      note: 'tempor ut enim',
      trigger: {
        data: {
          playbookId: 'f7677c88-b13a-4762-9dc6-a1363a704fa5',
          recollectAttributes: ['email', 'email', 'business_address'],
          reuseExistingBoKyc: false,
        },
        kind: 'onboard',
      },
    },
    {
      fpBid: '98aef0f8-a261-4906-8805-5934a4149c4e',
      kind: 'trigger',
      note: 'eiusmod qui',
      trigger: {
        data: {
          playbookId: 'f7677c88-b13a-4762-9dc6-a1363a704fa5',
          recollectAttributes: ['us_tax_id', 'business_phone_number', 'email'],
          reuseExistingBoKyc: true,
        },
        kind: 'onboard',
      },
    },
  ],
};
export const dashboard_EntityAttribute: EntityAttribute = {
  dataKind: 'document_data',
  identifier: 'document.visa.full_name',
  isDecryptable: true,
  source: 'vendor',
  transforms: {},
  value: 'tempor consequat',
};
export const dashboard_EntityOnboarding: EntityOnboarding = {
  id: 'cfa455b0-a178-4dab-a96e-b505c29965d0',
  kind: 'document',
  playbookKey: '2c6b1579-a878-4723-a5b6-968b0d666bac',
  playbookName: 'Kyle Jacobi',
  ruleSetResults: [
    {
      id: 'c0f89046-673b-408f-ba38-54d43b1a29cd',
      timestamp: '1953-07-10T04:23:51.0Z',
    },
    {
      id: 'c0f89046-673b-408f-ba38-54d43b1a29cd',
      timestamp: '1927-12-02T20:01:46.0Z',
    },
    {
      id: 'c0f89046-673b-408f-ba38-54d43b1a29cd',
      timestamp: '1921-04-21T21:26:33.0Z',
    },
  ],
  seqno: -23781818,
  status: 'incomplete',
  timestamp: '1932-12-13T13:55:15.0Z',
};
export const dashboard_EntityOnboardingRuleSetResult: EntityOnboardingRuleSetResult = {
  id: 'd63c3f7e-bc44-49fc-80ed-ff85ba335f82',
  timestamp: '1911-04-21T17:21:45.0Z',
};
export const dashboard_EntityStatus: EntityStatus = 'pass';
export const dashboard_EntityWorkflow: EntityWorkflow = {
  createdAt: '1957-05-15T02:18:42.0Z',
  insightEvent: {
    city: 'Schaeferfort',
    country: 'Yemen',
    ipAddress: '8890 Shirley Ways Apt. 125',
    latitude: 62887500.43035951,
    longitude: -22899305.07545437,
    metroCode: 'eiusmod laboris in cillum sed',
    postalCode: 'elit minim',
    region: 'consequat sunt aliquip',
    regionName: 'Dr. Rufus Pouros',
    sessionId: 'f4179fbb-8326-4e69-a4b3-e3e94b4812ae',
    timeZone: 'tempor mollit velit nostrud',
    timestamp: '1921-12-03T21:13:08.0Z',
    userAgent: 'enim',
  },
  playbookId: 'cf4a48a7-943a-48cf-9e9b-9fcee6d45732',
  status: 'pending',
};
export const dashboard_Equals: Equals = 'not_eq';
export const dashboard_EvaluateRuleRequest: EvaluateRuleRequest = {
  add: [
    {
      isShadow: true,
      name: 'Charlene Tromp',
      ruleAction: 'step_up.identity_proof_of_ssn',
      ruleExpression: [
        {
          field: 'document_not_fake_image',
          op: 'not_eq',
          value: false,
        },
        {
          field: 'document_full_name_crosscheck_does_not_match',
          op: 'not_eq',
          value: false,
        },
        {
          field: 'document_selfie_mask',
          op: 'eq',
          value: true,
        },
      ],
    },
    {
      isShadow: false,
      name: 'Charlene Tromp',
      ruleAction: 'manual_review',
      ruleExpression: [
        {
          field: 'device_high_risk',
          op: 'eq',
          value: true,
        },
        {
          field: 'curp_service_not_available',
          op: 'not_eq',
          value: false,
        },
        {
          field: 'beneficial_owners_match',
          op: 'not_eq',
          value: true,
        },
      ],
    },
    {
      isShadow: true,
      name: 'Charlene Tromp',
      ruleAction: 'step_up.proof_of_address',
      ruleExpression: [
        {
          field: 'document_live_capture_failed',
          op: 'eq',
          value: false,
        },
        {
          field: 'business_address_commercial',
          op: 'not_eq',
          value: false,
        },
        {
          field: 'address_street_number_matches',
          op: 'not_eq',
          value: false,
        },
      ],
    },
  ],
  delete: ['quis in sed', 'nisi fugiat aliqua officia', 'aliqua nostrud'],
  edit: [
    {
      ruleExpression: [
        {
          field: 'subject_deceased',
          op: 'eq',
          value: true,
        },
        {
          field: 'name_matches',
          op: 'eq',
          value: false,
        },
        {
          field: 'curp_not_valid',
          op: 'not_eq',
          value: true,
        },
      ],
      ruleId: '0f8d698f-a396-4103-8c99-71b42b10755a',
    },
    {
      ruleExpression: [
        {
          field: 'tin_does_not_match',
          op: 'not_eq',
          value: true,
        },
        {
          field: 'document_ocr_name_does_not_match',
          op: 'eq',
          value: false,
        },
        {
          field: 'watchlist_hit_ofac',
          op: 'eq',
          value: false,
        },
      ],
      ruleId: '0f8d698f-a396-4103-8c99-71b42b10755a',
    },
    {
      ruleExpression: [
        {
          field: 'curp_not_valid',
          op: 'eq',
          value: true,
        },
        {
          field: 'itin_is_expired',
          op: 'eq',
          value: false,
        },
        {
          field: 'phone_located_name_matches',
          op: 'eq',
          value: true,
        },
      ],
      ruleId: '0f8d698f-a396-4103-8c99-71b42b10755a',
    },
  ],
  endTimestamp: '1903-03-05T10:23:17.0Z',
  startTimestamp: '1927-09-24T16:58:10.0Z',
};
export const dashboard_ExternalIntegrationCalled: ExternalIntegrationCalled = {
  externalId: 'b4baf450-9bee-457b-8c56-352779ab941c',
  integration: 'alpaca_cip',
  successful: true,
};
export const dashboard_ExternalIntegrationKind: ExternalIntegrationKind = 'alpaca_cip';
export const dashboard_FieldValidation: FieldValidation = {
  matchLevel: 'partial',
  signals: [
    {
      description: 'id in',
      matchLevel: 'no_match',
      note: 'non',
      reasonCode: 'address_alert_stability',
      severity: 'info',
    },
    {
      description: 'ut dolor elit cupidatat',
      matchLevel: 'partial',
      note: 'non do',
      reasonCode: 'document_dob_check_digit_matches',
      severity: 'low',
    },
    {
      description: 'esse dolore pariatur',
      matchLevel: 'could_not_match',
      note: 'nisi dolor',
      reasonCode: 'subject_deceased',
      severity: 'medium',
    },
  ],
};
export const dashboard_FieldValidationDetail: FieldValidationDetail = {
  description: 'elit do',
  matchLevel: 'no_match',
  note: 'aliquip',
  reasonCode: 'document_possible_image_alteration_back',
  severity: 'low',
};
export const dashboard_FilterFunction: FilterFunction = "encrypt('<algorithm>','<public_key>')";
export const dashboard_FootprintReasonCode: FootprintReasonCode = 'watchlist_hit_ofac';
export const dashboard_GetClientTokenResponse: GetClientTokenResponse = {
  expiresAt: '1903-12-25T09:17:55.0Z',
  tenant: {
    name: 'Della Friesen',
  },
  vaultFields: [
    'document.voter_identification.last_name',
    'document.residence_document.curp',
    'document.id_card.issued_at',
  ],
};
export const dashboard_GetClientTokenResponseTenant: GetClientTokenResponseTenant = {
  name: 'Doyle Thompson',
};
export const dashboard_GetFieldValidationResponse: GetFieldValidationResponse = {
  address: {
    matchLevel: 'partial',
    signals: [
      {
        description: 'pariatur exercitation non est',
        matchLevel: 'no_match',
        note: 'eiusmod dolor nostrud nulla',
        reasonCode: 'document_ocr_dob_matches',
        severity: 'low',
      },
      {
        description: 'Ut',
        matchLevel: 'exact',
        note: 'Ut',
        reasonCode: 'document_visible_photo_features_verified',
        severity: 'low',
      },
      {
        description: 'exercitation ut nulla commodo laborum',
        matchLevel: 'exact',
        note: 'qui',
        reasonCode: 'business_address_close_match',
        severity: 'info',
      },
    ],
  },
  businessAddress: {
    matchLevel: 'no_match',
    signals: [
      {
        description: 'nisi ut sed Ut',
        matchLevel: 'no_match',
        note: 'ut',
        reasonCode: 'document_is_permit_or_provisional_license',
        severity: 'info',
      },
      {
        description: 'amet esse culpa Duis cupidatat',
        matchLevel: 'partial',
        note: 'Duis occaecat sunt laboris',
        reasonCode: 'document_possible_image_alteration_front',
        severity: 'low',
      },
      {
        description: 'Ut incididunt id',
        matchLevel: 'exact',
        note: 'sint consectetur ad officia',
        reasonCode: 'sos_filing_not_found',
        severity: 'medium',
      },
    ],
  },
  businessBeneficialOwners: {
    matchLevel: 'could_not_match',
    signals: [
      {
        description: 'est ullamco cillum sit',
        matchLevel: 'partial',
        note: 'aute sint',
        reasonCode: 'business_name_no_watchlist_hits',
        severity: 'low',
      },
      {
        description: 'sit esse consectetur enim',
        matchLevel: 'partial',
        note: 'quis pariatur nisi in',
        reasonCode: 'tin_not_found',
        severity: 'low',
      },
      {
        description: 'occaecat consectetur dolore esse',
        matchLevel: 'no_match',
        note: 'proident',
        reasonCode: 'browser_tampering',
        severity: 'info',
      },
    ],
  },
  businessDba: {
    matchLevel: 'exact',
    signals: [
      {
        description: 'laborum',
        matchLevel: 'no_match',
        note: 'in nisi',
        reasonCode: 'document_ocr_successful',
        severity: 'medium',
      },
      {
        description: 'Ut occaecat officia',
        matchLevel: 'no_match',
        note: 'nisi cillum pariatur ad',
        reasonCode: 'visa_is_other',
        severity: 'info',
      },
      {
        description: 'non',
        matchLevel: 'could_not_match',
        note: 'laboris pariatur',
        reasonCode: 'document_ocr_address_could_not_match',
        severity: 'high',
      },
    ],
  },
  businessName: {
    matchLevel: 'exact',
    signals: [
      {
        description: 'laboris est',
        matchLevel: 'could_not_match',
        note: 'cupidatat',
        reasonCode: 'email_domain_corporate',
        severity: 'info',
      },
      {
        description: 'ut ullamco',
        matchLevel: 'no_match',
        note: 'id exercitation',
        reasonCode: 'business_website_parking_page',
        severity: 'info',
      },
      {
        description: 'reprehenderit dolore magna',
        matchLevel: 'could_not_match',
        note: 'in ut',
        reasonCode: 'tin_does_not_match',
        severity: 'low',
      },
    ],
  },
  businessPhoneNumber: {
    matchLevel: 'could_not_match',
    signals: [
      {
        description: 'labore non dolor laboris',
        matchLevel: 'exact',
        note: 'quis',
        reasonCode: 'curp_multiple_results_for_data',
        severity: 'high',
      },
      {
        description: 'id dolor culpa',
        matchLevel: 'partial',
        note: 'labore minim aliquip reprehenderit consequat',
        reasonCode: 'document_ocr_dob_matches',
        severity: 'high',
      },
      {
        description: 'dolore id laboris',
        matchLevel: 'could_not_match',
        note: 'minim ea cillum non ut',
        reasonCode: 'business_dba_match',
        severity: 'info',
      },
    ],
  },
  businessTin: {
    matchLevel: 'partial',
    signals: [
      {
        description: 'culpa aliquip consectetur cillum',
        matchLevel: 'partial',
        note: 'in qui incididunt',
        reasonCode: 'email_address_invalid',
        severity: 'low',
      },
      {
        description: 'est',
        matchLevel: 'partial',
        note: 'est',
        reasonCode: 'sentilink_identity_theft_low_risk',
        severity: 'medium',
      },
      {
        description: 'Lorem amet esse',
        matchLevel: 'no_match',
        note: 'Excepteur nisi laboris',
        reasonCode: 'document_selfie_glasses',
        severity: 'info',
      },
    ],
  },
  dob: {
    matchLevel: 'could_not_match',
    signals: [
      {
        description: 'ea elit in consectetur pariatur',
        matchLevel: 'could_not_match',
        note: 'ad',
        reasonCode: 'document_selfie_does_not_match',
        severity: 'low',
      },
      {
        description: 'id minim sed mollit sit',
        matchLevel: 'partial',
        note: 'aliqua ex',
        reasonCode: 'document_selfie_does_not_match',
        severity: 'medium',
      },
      {
        description: 'incididunt irure aute nulla dolor',
        matchLevel: 'no_match',
        note: 'sint',
        reasonCode: 'input_phone_number_does_not_match_input_state',
        severity: 'medium',
      },
    ],
  },
  document: {
    matchLevel: 'could_not_match',
    signals: [
      {
        description: 'dolore et Duis amet',
        matchLevel: 'partial',
        note: 'sunt adipisicing laborum',
        reasonCode: 'name_matches',
        severity: 'low',
      },
      {
        description: 'non',
        matchLevel: 'partial',
        note: 'in ipsum',
        reasonCode: 'dob_yob_matches',
        severity: 'low',
      },
      {
        description: 'est',
        matchLevel: 'could_not_match',
        note: 'ea cupidatat voluptate enim',
        reasonCode: 'beneficial_owners_do_not_match',
        severity: 'medium',
      },
    ],
  },
  email: {
    matchLevel: 'no_match',
    signals: [
      {
        description: 'cupidatat incididunt Lorem mollit irure',
        matchLevel: 'could_not_match',
        note: 'Lorem Duis labore do dolor',
        reasonCode: 'document_barcode_content_matches',
        severity: 'info',
      },
      {
        description: 'cillum',
        matchLevel: 'no_match',
        note: 'esse sit consectetur',
        reasonCode: 'document_full_name_crosscheck_matches',
        severity: 'high',
      },
      {
        description: 'sed labore',
        matchLevel: 'could_not_match',
        note: 'fugiat aute adipisicing Ut enim',
        reasonCode: 'ip_state_matches',
        severity: 'low',
      },
    ],
  },
  name: {
    matchLevel: 'no_match',
    signals: [
      {
        description: 'sunt fugiat',
        matchLevel: 'partial',
        note: 'Duis',
        reasonCode: 'business_address_close_match',
        severity: 'medium',
      },
      {
        description: 'esse ipsum non eu dolore',
        matchLevel: 'exact',
        note: 'adipisicing do ut irure',
        reasonCode: 'id_flagged',
        severity: 'info',
      },
      {
        description: 'et occaecat consequat dolore',
        matchLevel: 'partial',
        note: 'laborum voluptate magna laboris tempor',
        reasonCode: 'document_barcode_could_not_be_read',
        severity: 'low',
      },
    ],
  },
  phone: {
    matchLevel: 'exact',
    signals: [
      {
        description: 'quis cillum sit nisi sint',
        matchLevel: 'exact',
        note: 'ad enim in ullamco',
        reasonCode: 'address_input_not_on_file',
        severity: 'info',
      },
      {
        description: 'anim Excepteur incididunt',
        matchLevel: 'no_match',
        note: 'Excepteur eu',
        reasonCode: 'document_country_code_mismatch',
        severity: 'medium',
      },
      {
        description: 'dolor ea mollit magna',
        matchLevel: 'no_match',
        note: 'in non proident',
        reasonCode: 'name_does_not_match',
        severity: 'info',
      },
    ],
  },
  ssn: {
    matchLevel: 'no_match',
    signals: [
      {
        description: 'dolor magna aliqua ex',
        matchLevel: 'partial',
        note: 'nulla anim officia proident voluptate',
        reasonCode: 'ip_location_not_available',
        severity: 'high',
      },
      {
        description: 'sed ea',
        matchLevel: 'exact',
        note: 'esse exercitation labore ullamco',
        reasonCode: 'phone_number_mobile_account_status_suspended',
        severity: 'low',
      },
      {
        description: 'ex deserunt',
        matchLevel: 'partial',
        note: 'laborum dolor non esse',
        reasonCode: 'watchlist_hit_ofac',
        severity: 'high',
      },
    ],
  },
};
export const dashboard_GetUserVaultResponse: GetUserVaultResponse = {
  key: 'document.visa.issuing_state',
  value: true,
};
export const dashboard_IdDocKind: IdDocKind = 'voter_identification';
export const dashboard_IdentifyScope: IdentifyScope = 'auth';
export const dashboard_InProgressOnboarding: InProgressOnboarding = {
  fpId: '8b0242b1-7860-4fd8-aa48-efe5b89adad2',
  status: 'pending',
  tenant: {
    name: 'Robert Prohaska',
    websiteUrl: 'https://considerate-nightlife.net',
  },
  timestamp: '1909-10-13T04:50:14.0Z',
};
export const dashboard_InProgressOnboardingTenant: InProgressOnboardingTenant = {
  name: 'George Kutch',
  websiteUrl: 'https://comfortable-plastic.biz',
};
export const dashboard_IngressSettings: IngressSettings = {
  contentType: 'json',
  rules: [
    {
      target: 'laboris est',
      token: 'document.passport.nationality',
    },
    {
      target: 'do Lorem nisi non incididunt',
      token: 'document.passport.issuing_state',
    },
    {
      target: 'tempor adipisicing consectetur',
      token: 'document.residence_document.issued_at',
    },
  ],
};
export const dashboard_InsightAddress: InsightAddress = {
  addressLine1: '5610 W Center Street Apt. 209',
  addressLine2: '2051 Cleveland Street Suite 283',
  city: 'West Hannah',
  cmra: false,
  deliverable: true,
  latitude: -87765151.87582743,
  longitude: -8848938.284412086,
  postalCode: 'mollit',
  propertyType: 'in dolore officia',
  sources: 'proident dolor mollit nulla Duis',
  state: 'North Carolina',
  submitted: false,
  verified: false,
};
export const dashboard_InsightBusinessName: InsightBusinessName = {
  kind: 'ea',
  name: 'Archie Walter Jr.',
  sources: 'est exercitation sed',
  subStatus: 'occaecat dolor enim',
  submitted: false,
  verified: false,
};
export const dashboard_InsightEvent: InsightEvent = {
  city: 'East Odieville',
  country: 'Reunion',
  ipAddress: '261 Luella Shoals Suite 750',
  latitude: -8200168.500285894,
  longitude: 4879121.965058848,
  metroCode: 'in dolore',
  postalCode: 'laborum culpa',
  region: 'ex',
  regionName: 'Roosevelt Toy',
  sessionId: '9ebcd6f3-ed59-4612-bc39-383ce40c3a3c',
  timeZone: 'sit nisi',
  timestamp: '1934-06-11T11:10:41.0Z',
  userAgent: 'aliquip sit officia proident',
};
export const dashboard_InsightPerson: InsightPerson = {
  associationVerified: false,
  name: 'Deborah DuBuque',
  role: 'proident consectetur exercitation',
  sources: 'officia',
  submitted: false,
};
export const dashboard_InsightPhone: InsightPhone = {
  phone: '+16544282343',
  submitted: true,
  verified: false,
};
export const dashboard_InsightRegistration: InsightRegistration = {
  addresses: ['aliqua nulla', 'mollit', 'culpa'],
  entityType: 'ut ullamco',
  fileNumber: 'laboris quis',
  jurisdiction: 'in',
  name: 'Darin Schamberger',
  officers: [
    {
      name: 'Carl Sauer II',
      roles: 'sit',
    },
    {
      name: 'Carl Sauer II',
      roles: 'reprehenderit aliqua',
    },
    {
      name: 'Carl Sauer II',
      roles: 'aliqua pariatur qui ex adipisicing',
    },
  ],
  registeredAgent: 'enim',
  registrationDate: 'cillum voluptate fugiat enim',
  source: 'Lorem deserunt fugiat',
  state: 'Maryland',
  status: 'nostrud Excepteur voluptate',
  subStatus: 'consectetur ullamco cillum',
};
export const dashboard_InsightTin: InsightTin = {
  tin: 'laborum',
  verified: true,
};
export const dashboard_InsightWatchlist: InsightWatchlist = {
  business: [
    {
      hits: [
        {
          agency: 'incididunt in',
          agencyAbbr: 'sint nostrud id',
          agencyInformationUrl: 'https://smart-gloom.name',
          agencyListUrl: 'https://long-resolve.net',
          entityAliases: ['dolore mollit nulla esse in', 'est quis labore', 'aliqua ex veniam voluptate labore'],
          entityName: 'Victoria Dooley',
          listCountry: 'Trinidad and Tobago',
          listName: 'Dr. Erik Connelly',
          url: 'https://burdensome-napkin.org',
        },
        {
          agency: 'quis adipisicing ut Lorem',
          agencyAbbr: 'sunt Ut',
          agencyInformationUrl: 'https://smart-gloom.name',
          agencyListUrl: 'https://long-resolve.net',
          entityAliases: ['aliqua in ex qui pariatur', 'cupidatat reprehenderit', 'magna'],
          entityName: 'Victoria Dooley',
          listCountry: 'Trinidad and Tobago',
          listName: 'Dr. Erik Connelly',
          url: 'https://burdensome-napkin.org',
        },
        {
          agency: 'adipisicing',
          agencyAbbr: 'exercitation irure do',
          agencyInformationUrl: 'https://smart-gloom.name',
          agencyListUrl: 'https://long-resolve.net',
          entityAliases: ['eu incididunt dolor', 'labore ullamco elit laborum', 'pariatur in aute eiusmod'],
          entityName: 'Victoria Dooley',
          listCountry: 'Trinidad and Tobago',
          listName: 'Dr. Erik Connelly',
          url: 'https://burdensome-napkin.org',
        },
      ],
      screenedEntityName: 'Naomi McDermott',
    },
    {
      hits: [
        {
          agency: 'ut in cillum sed',
          agencyAbbr: 'non exercitation',
          agencyInformationUrl: 'https://smart-gloom.name',
          agencyListUrl: 'https://long-resolve.net',
          entityAliases: ['eiusmod', 'ullamco quis aute', 'laboris'],
          entityName: 'Victoria Dooley',
          listCountry: 'Trinidad and Tobago',
          listName: 'Dr. Erik Connelly',
          url: 'https://burdensome-napkin.org',
        },
        {
          agency: 'veniam commodo do',
          agencyAbbr: 'dolore reprehenderit',
          agencyInformationUrl: 'https://smart-gloom.name',
          agencyListUrl: 'https://long-resolve.net',
          entityAliases: ['Ut laboris pariatur labore nulla', 'nisi qui Excepteur commodo', 'pariatur quis'],
          entityName: 'Victoria Dooley',
          listCountry: 'Trinidad and Tobago',
          listName: 'Dr. Erik Connelly',
          url: 'https://burdensome-napkin.org',
        },
        {
          agency: 'sed nulla quis anim Lorem',
          agencyAbbr: 'cupidatat',
          agencyInformationUrl: 'https://smart-gloom.name',
          agencyListUrl: 'https://long-resolve.net',
          entityAliases: ['in occaecat', 'aliquip eu aute', 'veniam reprehenderit ea velit'],
          entityName: 'Victoria Dooley',
          listCountry: 'Trinidad and Tobago',
          listName: 'Dr. Erik Connelly',
          url: 'https://burdensome-napkin.org',
        },
      ],
      screenedEntityName: 'Naomi McDermott',
    },
    {
      hits: [
        {
          agency: 'in sed reprehenderit',
          agencyAbbr: 'nisi adipisicing fugiat esse',
          agencyInformationUrl: 'https://smart-gloom.name',
          agencyListUrl: 'https://long-resolve.net',
          entityAliases: ['culpa', 'anim', 'cillum'],
          entityName: 'Victoria Dooley',
          listCountry: 'Trinidad and Tobago',
          listName: 'Dr. Erik Connelly',
          url: 'https://burdensome-napkin.org',
        },
        {
          agency: 'ea sint aute',
          agencyAbbr: 'occaecat consectetur',
          agencyInformationUrl: 'https://smart-gloom.name',
          agencyListUrl: 'https://long-resolve.net',
          entityAliases: ['fugiat Ut anim exercitation dolore', 'laborum amet', 'amet anim dolore'],
          entityName: 'Victoria Dooley',
          listCountry: 'Trinidad and Tobago',
          listName: 'Dr. Erik Connelly',
          url: 'https://burdensome-napkin.org',
        },
        {
          agency: 'ut do consectetur',
          agencyAbbr: 'nostrud sunt',
          agencyInformationUrl: 'https://smart-gloom.name',
          agencyListUrl: 'https://long-resolve.net',
          entityAliases: ['enim do aliquip ex labore', 'sed voluptate proident in ad', 'in non ad'],
          entityName: 'Victoria Dooley',
          listCountry: 'Trinidad and Tobago',
          listName: 'Dr. Erik Connelly',
          url: 'https://burdensome-napkin.org',
        },
      ],
      screenedEntityName: 'Naomi McDermott',
    },
  ],
  hitCount: 67598993,
  people: [
    {
      hits: [
        {
          agency: 'cillum in consectetur veniam tempor',
          agencyAbbr: 'ut ea incididunt proident irure',
          agencyInformationUrl: 'https://kaleidoscopic-nightlife.info/',
          agencyListUrl: 'https://sore-commercial.info',
          entityAliases: ['nulla aliquip reprehenderit', 'Excepteur sunt ad', 'est exercitation ullamco sint Ut'],
          entityName: 'Patty Franey',
          listCountry: 'Panama',
          listName: 'Danielle Stiedemann',
          url: 'https://gripping-emergent.info',
        },
        {
          agency: 'incididunt tempor enim esse non',
          agencyAbbr: 'incididunt dolor',
          agencyInformationUrl: 'https://kaleidoscopic-nightlife.info/',
          agencyListUrl: 'https://sore-commercial.info',
          entityAliases: ['sit pariatur', 'mollit', 'cillum voluptate occaecat anim dolor'],
          entityName: 'Patty Franey',
          listCountry: 'Panama',
          listName: 'Danielle Stiedemann',
          url: 'https://gripping-emergent.info',
        },
        {
          agency: 'qui pariatur dolor officia',
          agencyAbbr: 'anim',
          agencyInformationUrl: 'https://kaleidoscopic-nightlife.info/',
          agencyListUrl: 'https://sore-commercial.info',
          entityAliases: ['commodo Lorem magna', 'nulla eiusmod consectetur esse veniam', 'sunt pariatur'],
          entityName: 'Patty Franey',
          listCountry: 'Panama',
          listName: 'Danielle Stiedemann',
          url: 'https://gripping-emergent.info',
        },
      ],
      screenedEntityName: 'Jeffrey Mraz',
    },
    {
      hits: [
        {
          agency: 'ut',
          agencyAbbr: 'non in eu Ut',
          agencyInformationUrl: 'https://kaleidoscopic-nightlife.info/',
          agencyListUrl: 'https://sore-commercial.info',
          entityAliases: ['labore sed', 'fugiat dolore eiusmod', 'quis voluptate fugiat elit dolore'],
          entityName: 'Patty Franey',
          listCountry: 'Panama',
          listName: 'Danielle Stiedemann',
          url: 'https://gripping-emergent.info',
        },
        {
          agency: 'in',
          agencyAbbr: 'occaecat',
          agencyInformationUrl: 'https://kaleidoscopic-nightlife.info/',
          agencyListUrl: 'https://sore-commercial.info',
          entityAliases: ['ipsum fugiat ut esse', 'magna ullamco', 'Ut consequat minim dolor voluptate'],
          entityName: 'Patty Franey',
          listCountry: 'Panama',
          listName: 'Danielle Stiedemann',
          url: 'https://gripping-emergent.info',
        },
        {
          agency: 'quis aliquip dolor Duis',
          agencyAbbr: 'aliqua anim',
          agencyInformationUrl: 'https://kaleidoscopic-nightlife.info/',
          agencyListUrl: 'https://sore-commercial.info',
          entityAliases: ['veniam pariatur', 'ullamco aliquip sit', 'quis cupidatat in sint'],
          entityName: 'Patty Franey',
          listCountry: 'Panama',
          listName: 'Danielle Stiedemann',
          url: 'https://gripping-emergent.info',
        },
      ],
      screenedEntityName: 'Jeffrey Mraz',
    },
    {
      hits: [
        {
          agency: 'nisi laboris consectetur',
          agencyAbbr: 'magna laborum reprehenderit amet elit',
          agencyInformationUrl: 'https://kaleidoscopic-nightlife.info/',
          agencyListUrl: 'https://sore-commercial.info',
          entityAliases: ['laboris tempor enim Lorem ipsum', 'ad deserunt ullamco', 'culpa Duis incididunt'],
          entityName: 'Patty Franey',
          listCountry: 'Panama',
          listName: 'Danielle Stiedemann',
          url: 'https://gripping-emergent.info',
        },
        {
          agency: 'elit est',
          agencyAbbr: 'dolore pariatur',
          agencyInformationUrl: 'https://kaleidoscopic-nightlife.info/',
          agencyListUrl: 'https://sore-commercial.info',
          entityAliases: ['enim do in', 'veniam mollit', 'pariatur id'],
          entityName: 'Patty Franey',
          listCountry: 'Panama',
          listName: 'Danielle Stiedemann',
          url: 'https://gripping-emergent.info',
        },
        {
          agency: 'in nostrud dolor sint commodo',
          agencyAbbr: 'fugiat laboris',
          agencyInformationUrl: 'https://kaleidoscopic-nightlife.info/',
          agencyListUrl: 'https://sore-commercial.info',
          entityAliases: ['exercitation', 'non ea sit nostrud laborum', 'elit esse'],
          entityName: 'Patty Franey',
          listCountry: 'Panama',
          listName: 'Danielle Stiedemann',
          url: 'https://gripping-emergent.info',
        },
      ],
      screenedEntityName: 'Jeffrey Mraz',
    },
  ],
};
export const dashboard_InsightWebsite: InsightWebsite = {
  url: 'https://helpful-finding.org/',
  verified: true,
};
export const dashboard_IntegrityRequest: IntegrityRequest = {
  fields: ['document.voter_identification.issuing_country', 'document.passport.selfie.mime_type', 'id.ssn9'],
  signingKey: 'bdbd5cd5-598e-41d1-96a5-1caea3889034',
};
export const dashboard_IntegrityResponse: IntegrityResponse = {
  key: 'card.*.number_last4',
  value: {},
};
export const dashboard_InvestorProfileDeclaration: InvestorProfileDeclaration = 'senior_political_figure';
export const dashboard_InvestorProfileFundingSource: InvestorProfileFundingSource = 'investments';
export const dashboard_InvestorProfileInvestmentGoal: InvestorProfileInvestmentGoal = 'income';
export const dashboard_InvoicePreview: InvoicePreview = {
  lastUpdatedAt: '1966-05-02T13:06:51.0Z',
  lineItems: [
    {
      description: 'aliquip et',
      id: 'ffd73533-6a6d-4856-b37d-8aa61790dfd8',
      notionalCents: -12906532,
      quantity: -26703468,
      unitPriceCents: 'veniam irure in reprehenderit ipsum',
    },
    {
      description: 'in magna',
      id: 'ffd73533-6a6d-4856-b37d-8aa61790dfd8',
      notionalCents: 98074205,
      quantity: 64789278,
      unitPriceCents: 'culpa minim ut ex tempor',
    },
    {
      description: 'enim',
      id: 'ffd73533-6a6d-4856-b37d-8aa61790dfd8',
      notionalCents: 59354896,
      quantity: -3712286,
      unitPriceCents: 'minim',
    },
  ],
};
export const dashboard_InvokeVaultProxyPermission: InvokeVaultProxyPermission = {
  kind: 'any',
};
export const dashboard_InvokeVaultProxyPermissionAny: InvokeVaultProxyPermissionAny = {
  kind: 'any',
};
export const dashboard_InvokeVaultProxyPermissionId: InvokeVaultProxyPermissionId = {
  id: 'bf06dada-b237-4929-98b9-e260456e1da7',
  kind: 'id',
};
export const dashboard_InvokeVaultProxyPermissionJustInTime: InvokeVaultProxyPermissionJustInTime = {
  kind: 'just_in_time',
};
export const dashboard_IsIn: IsIn = 'is_not_in';
export const dashboard_Iso3166TwoDigitCountryCode: Iso3166TwoDigitCountryCode = 'GN';
export const dashboard_LabelAdded: LabelAdded = {
  kind: 'active',
};
export const dashboard_LabelKind: LabelKind = 'active';
export const dashboard_LineItem: LineItem = {
  description: 'nostrud in nisi dolor',
  id: '8a2b1e49-8194-4d0b-9e06-8022959cd848',
  notionalCents: -46474882,
  quantity: 31246058,
  unitPriceCents: 'eu Excepteur laboris velit',
};
export const dashboard_LinkAuthRequest: LinkAuthRequest = {
  emailAddress: 'jaylen.fahey@gmail.com',
  redirectUrl: 'https://hasty-humor.name',
};
export const dashboard_List: List = {
  actor: {
    data: {
      id: 'e212187f-e336-4736-88d4-812d57b69b9b',
    },
    kind: 'user',
  },
  alias: 'laborum voluptate ad consectetur',
  createdAt: '1956-07-15T19:22:49.0Z',
  entriesCount: -36189841,
  id: 'ec7feede-6ecc-473d-bcd3-403b72700473',
  kind: 'ip_address',
  name: 'Keith Shields II',
  usedInPlaybook: true,
};
export const dashboard_ListDetails: ListDetails = {
  actor: {
    data: {
      id: '410de101-3846-4cc8-a26e-196bf1580579',
    },
    kind: 'user',
  },
  alias: 'in incididunt cupidatat consectetur fugiat',
  createdAt: '1894-09-10T08:38:41.0Z',
  id: '8adfd079-8425-48a3-ae52-5f29e659359d',
  kind: 'phone_number',
  name: 'Brandi Reinger',
  playbooks: [
    {
      id: 'f2b68018-5bdf-43a2-9d1a-06e87073f670',
      key: '9480d365-60d6-4a34-ab50-9debeca50d62',
      name: 'Gilbert Kuhlman',
      rules: [
        {
          action: 'pass_with_manual_review',
          createdAt: '1953-02-14T02:05:53.0Z',
          isShadow: true,
          kind: 'business',
          name: 'Austin McKenzie',
          ruleAction: {
            config: {},
            kind: 'pass_with_manual_review',
          },
          ruleExpression: [
            {
              field: 'document_ocr_name_could_not_match',
              op: 'not_eq',
              value: true,
            },
            {
              field: 'phone_number_mobile_account_status_deactivated',
              op: 'not_eq',
              value: false,
            },
            {
              field: 'document_sex_crosscheck_does_not_match',
              op: 'not_eq',
              value: true,
            },
          ],
          ruleId: 'ca368b30-a791-4211-aec4-820e31cd2aeb',
        },
        {
          action: 'step_up.identity_proof_of_ssn_proof_of_address',
          createdAt: '1945-07-14T10:11:01.0Z',
          isShadow: false,
          kind: 'any',
          name: 'Austin McKenzie',
          ruleAction: {
            config: {},
            kind: 'pass_with_manual_review',
          },
          ruleExpression: [
            {
              field: 'beneficial_owners_do_not_match',
              op: 'eq',
              value: false,
            },
            {
              field: 'dob_mob_matches',
              op: 'eq',
              value: true,
            },
            {
              field: 'address_input_is_not_deliverable',
              op: 'not_eq',
              value: true,
            },
          ],
          ruleId: 'ca368b30-a791-4211-aec4-820e31cd2aeb',
        },
        {
          action: 'fail',
          createdAt: '1947-11-29T16:50:58.0Z',
          isShadow: false,
          kind: 'any',
          name: 'Austin McKenzie',
          ruleAction: {
            config: {},
            kind: 'pass_with_manual_review',
          },
          ruleExpression: [
            {
              field: 'sos_filing_no_status',
              op: 'not_eq',
              value: true,
            },
            {
              field: 'address_located_is_not_standard_general_delivery',
              op: 'not_eq',
              value: true,
            },
            {
              field: 'address_input_is_not_standard_mail_drop',
              op: 'not_eq',
              value: true,
            },
          ],
          ruleId: 'ca368b30-a791-4211-aec4-820e31cd2aeb',
        },
      ],
    },
    {
      id: 'f2b68018-5bdf-43a2-9d1a-06e87073f670',
      key: '9480d365-60d6-4a34-ab50-9debeca50d62',
      name: 'Gilbert Kuhlman',
      rules: [
        {
          action: 'step_up.identity_proof_of_ssn',
          createdAt: '1933-12-25T15:23:47.0Z',
          isShadow: false,
          kind: 'person',
          name: 'Austin McKenzie',
          ruleAction: {
            config: {},
            kind: 'pass_with_manual_review',
          },
          ruleExpression: [
            {
              field: 'browser_automation',
              op: 'not_eq',
              value: false,
            },
            {
              field: 'document_ocr_last_name_matches',
              op: 'not_eq',
              value: true,
            },
            {
              field: 'name_matches',
              op: 'eq',
              value: false,
            },
          ],
          ruleId: 'ca368b30-a791-4211-aec4-820e31cd2aeb',
        },
        {
          action: 'step_up.custom',
          createdAt: '1903-10-08T19:08:29.0Z',
          isShadow: true,
          kind: 'any',
          name: 'Austin McKenzie',
          ruleAction: {
            config: {},
            kind: 'pass_with_manual_review',
          },
          ruleExpression: [
            {
              field: 'business_dba_does_not_match',
              op: 'not_eq',
              value: false,
            },
            {
              field: 'document_photo_is_screen_capture',
              op: 'not_eq',
              value: true,
            },
            {
              field: 'behavior_fraud_ring_risk',
              op: 'not_eq',
              value: false,
            },
          ],
          ruleId: 'ca368b30-a791-4211-aec4-820e31cd2aeb',
        },
        {
          action: 'pass_with_manual_review',
          createdAt: '1921-10-27T17:10:35.0Z',
          isShadow: false,
          kind: 'person',
          name: 'Austin McKenzie',
          ruleAction: {
            config: {},
            kind: 'pass_with_manual_review',
          },
          ruleExpression: [
            {
              field: 'sos_business_address_filing_not_found',
              op: 'not_eq',
              value: false,
            },
            {
              field: 'credit_established_before_ssn_date',
              op: 'not_eq',
              value: true,
            },
            {
              field: 'address_state_matches',
              op: 'eq',
              value: true,
            },
          ],
          ruleId: 'ca368b30-a791-4211-aec4-820e31cd2aeb',
        },
      ],
    },
    {
      id: 'f2b68018-5bdf-43a2-9d1a-06e87073f670',
      key: '9480d365-60d6-4a34-ab50-9debeca50d62',
      name: 'Gilbert Kuhlman',
      rules: [
        {
          action: 'step_up.identity',
          createdAt: '1900-10-13T13:32:44.0Z',
          isShadow: true,
          kind: 'any',
          name: 'Austin McKenzie',
          ruleAction: {
            config: {},
            kind: 'pass_with_manual_review',
          },
          ruleExpression: [
            {
              field: 'document_invalid_issuance_or_expiration_date',
              op: 'not_eq',
              value: false,
            },
            {
              field: 'address_input_is_not_standard_uspo',
              op: 'not_eq',
              value: true,
            },
            {
              field: 'ssn_issue_date_cannot_be_verified',
              op: 'not_eq',
              value: false,
            },
          ],
          ruleId: 'ca368b30-a791-4211-aec4-820e31cd2aeb',
        },
        {
          action: 'manual_review',
          createdAt: '1916-10-02T21:22:08.0Z',
          isShadow: true,
          kind: 'any',
          name: 'Austin McKenzie',
          ruleAction: {
            config: {},
            kind: 'pass_with_manual_review',
          },
          ruleExpression: [
            {
              field: 'sos_filing_not_found',
              op: 'eq',
              value: false,
            },
            {
              field: 'sos_filing_no_status',
              op: 'not_eq',
              value: false,
            },
            {
              field: 'behavior_automatic_activity',
              op: 'eq',
              value: true,
            },
          ],
          ruleId: 'ca368b30-a791-4211-aec4-820e31cd2aeb',
        },
        {
          action: 'step_up.proof_of_address',
          createdAt: '1897-03-12T12:33:52.0Z',
          isShadow: true,
          kind: 'person',
          name: 'Austin McKenzie',
          ruleAction: {
            config: {},
            kind: 'pass_with_manual_review',
          },
          ruleExpression: [
            {
              field: 'name_last_matches',
              op: 'eq',
              value: false,
            },
            {
              field: 'document_ocr_name_could_not_match',
              op: 'not_eq',
              value: true,
            },
            {
              field: 'device_multiple_users',
              op: 'eq',
              value: false,
            },
          ],
          ruleId: 'ca368b30-a791-4211-aec4-820e31cd2aeb',
        },
      ],
    },
  ],
};
export const dashboard_ListEntitiesSearchRequest: ListEntitiesSearchRequest = {
  externalId: '28495320-873c-4a3a-b564-c6aab37fab65',
  hasOutstandingWorkflowRequest: true,
  kind: 'person',
  labels: ['active', 'offboard_other', 'offboard_other'],
  pagination: {
    cursor: -95898485,
    pageSize: 32404382,
  },
  playbookIds: ['amet sed', 'dolore magna minim', 'do sed'],
  requiresManualReview: true,
  search: 'reprehenderit dolor magna velit',
  showAll: false,
  statuses: ['none', 'fail', 'fail'],
  tags: ['labore in dolore dolor consequat', 'est mollit', 'in ullamco'],
  timestampGte: '1902-03-24T09:59:12.0Z',
  timestampLte: '1914-04-29T08:20:30.0Z',
  watchlistHit: true,
};
export const dashboard_ListEntry: ListEntry = {
  actor: {
    data: {
      id: '5b092022-7dcf-42a1-a3ef-078fec2ace0e',
    },
    kind: 'user',
  },
  createdAt: '1894-01-30T09:56:30.0Z',
  data: 'tempor',
  id: '10cde94f-4060-4a7a-8d83-14ece0d97093',
};
export const dashboard_ListEvent: ListEvent = {
  detail: {
    data: {
      entries: ['culpa ipsum', 'tempor sed minim do cillum', 'reprehenderit mollit'],
      listEntryCreationId: 'ae79fb8d-4ba4-4094-8b3f-889bf70a7bff',
      listId: 'e2aa4ac2-9bd8-414a-b469-cdd3516142b6',
    },
    kind: 'create_list_entry',
  },
  id: 'bd976a4f-d507-48c1-b9c3-42a2474850a0',
  insightEvent: {
    city: 'Bernhardside',
    country: 'Bahrain',
    ipAddress: '30005 Breitenberg Square Suite 696',
    latitude: -98245848.95283137,
    longitude: 84780595.64372176,
    metroCode: 'mollit amet',
    postalCode: 'do est ad',
    region: 'magna qui consequat',
    regionName: 'Sonya Stokes',
    sessionId: '9fb98317-1e60-4f3c-bd9d-89e987906a96',
    timeZone: 'officia pariatur dolore Excepteur',
    timestamp: '1944-10-30T05:19:49.0Z',
    userAgent: 'dolor ipsum elit dolore adipisicing',
  },
  name: 'complete_user_check_liveness',
  principal: {
    id: '7ef2f35b-73ab-46ba-8d07-52ae6bf62df6',
    kind: 'user',
  },
  tenantId: 'e20344d3-0b59-472a-85b5-4fec67a5ab76',
  timestamp: '1947-07-12T05:28:51.0Z',
};
export const dashboard_ListEventDetail: ListEventDetail = {
  data: {
    entries: ['consectetur dolor deserunt', 'nostrud dolore id Ut', 'in pariatur sunt ea'],
    listEntryCreationId: 'a2d743f7-337a-4300-9d74-72000c803ad7',
    listId: '2a21540f-209c-4391-8845-a8b9dba4fabc',
  },
  kind: 'create_list_entry',
};
export const dashboard_ListEventDetailCreateListEntry: ListEventDetailCreateListEntry = {
  data: {
    entries: ['mollit velit', 'dolore incididunt Duis', 'commodo anim'],
    listEntryCreationId: '04f8e8a2-5849-48df-97a9-f60ccb022d91',
    listId: 'ed083548-3c08-4094-926f-3130b275133e',
  },
  kind: 'create_list_entry',
};
export const dashboard_ListEventDetailDeleteListEntry: ListEventDetailDeleteListEntry = {
  data: {
    entry: 'veniam ad eu',
    listEntryId: 'bf17b809-d859-4bf2-b90b-d6ac27516940',
    listId: '4e3766fb-db0f-45c5-b1b3-7bc2945ef556',
  },
  kind: 'delete_list_entry',
};
export const dashboard_ListKind: ListKind = 'ip_address';
export const dashboard_ListPlaybookUsage: ListPlaybookUsage = {
  id: 'bae5b7ec-995e-463d-8e98-9795d18843d3',
  key: '10f5ca34-343e-47ca-af95-c6e03c95e5ab',
  name: 'Raul Herzog III',
  rules: [
    {
      action: 'step_up.custom',
      createdAt: '1915-05-05T08:03:23.0Z',
      isShadow: true,
      kind: 'business',
      name: 'Cary Simonis-Casper',
      ruleAction: {
        config: {},
        kind: 'pass_with_manual_review',
      },
      ruleExpression: [
        {
          field: 'ip_input_invalid',
          op: 'eq',
          value: true,
        },
        {
          field: 'sos_filing_not_found',
          op: 'not_eq',
          value: true,
        },
        {
          field: 'business_name_similar_match',
          op: 'not_eq',
          value: false,
        },
      ],
      ruleId: '09785287-5804-4d7b-b1d0-fcd62f6e3d5a',
    },
    {
      action: 'manual_review',
      createdAt: '1923-06-12T22:51:47.0Z',
      isShadow: true,
      kind: 'any',
      name: 'Cary Simonis-Casper',
      ruleAction: {
        config: {},
        kind: 'pass_with_manual_review',
      },
      ruleExpression: [
        {
          field: 'phone_located_name_does_not_match',
          op: 'not_eq',
          value: true,
        },
        {
          field: 'curp_not_valid',
          op: 'not_eq',
          value: false,
        },
        {
          field: 'document_selfie_was_skipped',
          op: 'not_eq',
          value: false,
        },
      ],
      ruleId: '09785287-5804-4d7b-b1d0-fcd62f6e3d5a',
    },
    {
      action: 'step_up.identity_proof_of_ssn',
      createdAt: '1964-01-06T13:46:32.0Z',
      isShadow: false,
      kind: 'any',
      name: 'Cary Simonis-Casper',
      ruleAction: {
        config: {},
        kind: 'pass_with_manual_review',
      },
      ruleExpression: [
        {
          field: 'document_barcode_could_not_be_detected',
          op: 'not_eq',
          value: false,
        },
        {
          field: 'email_domain_recently_created',
          op: 'not_eq',
          value: true,
        },
        {
          field: 'document_barcode_could_not_be_read',
          op: 'not_eq',
          value: false,
        },
      ],
      ruleId: '09785287-5804-4d7b-b1d0-fcd62f6e3d5a',
    },
  ],
};
export const dashboard_LiteOrgMember: LiteOrgMember = {
  firstName: 'Jarret',
  id: '16a13601-e37a-4d2c-9cd6-6c244d9be86e',
  lastName: 'Hirthe',
};
export const dashboard_LiteUserAndOrg: LiteUserAndOrg = {
  org: 'in id sed nisi',
  user: {
    firstName: 'Evie',
    id: '062a9170-3a03-4526-8f22-e1bc3c8c84dd',
    lastName: 'Pouros',
  },
};
export const dashboard_LivenessAttributes: LivenessAttributes = {
  device: 'mollit do',
  issuers: ['google', 'footprint', 'apple'],
  metadata: {},
  os: 'ex magna culpa',
};
export const dashboard_LivenessEvent: LivenessEvent = {
  attributes: {
    device: 'dolor enim commodo anim in',
    issuers: ['google', 'footprint', 'apple'],
    metadata: {},
    os: 'veniam',
  },
  insightEvent: {
    city: 'South Paulineland',
    country: 'Isle of Man',
    ipAddress: '926 Kaia Bypass Suite 980',
    latitude: -77072562.98655905,
    longitude: -43104757.70910647,
    metroCode: 'ex',
    postalCode: 'elit ex',
    region: 'ad commodo',
    regionName: 'Rudolph Schamberger III',
    sessionId: '10a9ff1b-d62e-4d68-8506-0e91a5f17b0c',
    timeZone: 'mollit officia elit ad pariatur',
    timestamp: '1940-12-05T18:56:59.0Z',
    userAgent: 'esse ullamco ad laborum deserunt',
  },
  source: 'privacy_pass',
};
export const dashboard_LivenessIssuer: LivenessIssuer = 'google';
export const dashboard_LivenessSource: LivenessSource = 'google_device_attestation';
export const dashboard_ManualDecisionRequest: ManualDecisionRequest = {
  annotation: {
    isPinned: false,
    note: 'occaecat ut laboris qui sit',
  },
  status: 'pass',
};
export const dashboard_ManualReview: ManualReview = {
  kind: 'document_needs_review',
};
export const dashboard_ManualReviewKind: ManualReviewKind = 'rule_triggered';
export const dashboard_MatchLevel: MatchLevel = 'exact';
export const dashboard_ModernEntityDecryptResponse: ModernEntityDecryptResponse = {
  'bank.*.account_type': 'ex sunt',
  'bank.*.ach_account_id': '01d07fd4-7415-4690-a242-8f75201ca711',
  'bank.*.ach_account_number': 'quis',
  'bank.*.ach_routing_number': 'non',
  'bank.*.fingerprint': 'sed ea',
  'bank.*.name': 'Norma Ritchie',
  'business.address_line1': '775 Abshire Prairie Apt. 578',
  'business.address_line2': '4760 Legros Meadow Suite 674',
  'business.city': 'Purdyton',
  'business.corporation_type': 'aute',
  'business.country': 'Madagascar',
  'business.dba': 'Duis eiusmod',
  'business.formation_date': 'Lorem elit',
  'business.formation_state': 'Virginia',
  'business.name': 'Olga Harvey-Reinger',
  'business.phone_number': '+17978292070',
  'business.state': 'Nebraska',
  'business.tin': 'qui pariatur nostrud',
  'business.website': 'https://vivacious-fraudster.info/',
  'business.zip': '24392-5424',
  'card.*.billing_address.country': '721 Kreiger Square Apt. 307',
  'card.*.billing_address.zip': "415 O'Hara Circles Apt. 191",
  'card.*.cvc': 'non do qui',
  'card.*.expiration': 'magna deserunt enim',
  'card.*.expiration_month': 'velit Excepteur in eu incididunt',
  'card.*.expiration_year': 'quis',
  'card.*.fingerprint': 'sint eiusmod Duis',
  'card.*.issuer': 'id irure',
  'card.*.name': 'Dr. Garry Hammes',
  'card.*.number': 'Excepteur',
  'card.*.number_last4': 'pariatur laboris',
  'custom.*': 'reprehenderit Ut elit dolore',
  'document.custom.*': 'ut consequat',
  'document.drivers_license.address_line1': '8110 S Jefferson Street Suite 591',
  'document.drivers_license.back.image': 'mollit',
  'document.drivers_license.back.mime_type': 'consequat ea ex ad',
  'document.drivers_license.city': 'Carmenside',
  'document.drivers_license.classified_document_type': 'aute id laborum in et',
  'document.drivers_license.clave_de_elector': 'minim exercitation cupidatat adipisicing ut',
  'document.drivers_license.curp': 'eu mollit consectetur dolore velit',
  'document.drivers_license.curp_validation_response': 'e8a5e88f-e423-4a29-b849-6b255296b750',
  'document.drivers_license.dob': 'deserunt',
  'document.drivers_license.document_number': 'et culpa tempor dolor elit',
  'document.drivers_license.expires_at': 'occaecat commodo dolor consequat',
  'document.drivers_license.first_name': 'Icie',
  'document.drivers_license.front.image': 'id',
  'document.drivers_license.front.mime_type': 'reprehenderit sit',
  'document.drivers_license.full_address': '37619 W Church Street Suite 473',
  'document.drivers_license.full_name': 'Lula Greenholt',
  'document.drivers_license.gender': 'ut nostrud aute consequat',
  'document.drivers_license.issued_at': 'amet laboris',
  'document.drivers_license.issuing_country': 'Curacao',
  'document.drivers_license.issuing_state': 'Indiana',
  'document.drivers_license.last_name': 'Wisozk',
  'document.drivers_license.nationality': 'laborum exercitation commodo',
  'document.drivers_license.postal_code': 'anim minim',
  'document.drivers_license.ref_number': 'tempor elit in deserunt Ut',
  'document.drivers_license.samba_activity_history_response': 'aliquip mollit dolor do',
  'document.drivers_license.selfie.image': 'qui officia',
  'document.drivers_license.selfie.mime_type': 'ipsum culpa tempor non ex',
  'document.drivers_license.state': 'Missouri',
  'document.drivers_license.us_issuing_state': 'Hawaii',
  'document.finra_compliance_letter': 'eiusmod ullamco nisi labore',
  'document.id_card.address_line1': '2194 Sipes Flats Suite 894',
  'document.id_card.back.image': 'ca49eab8-d85b-44c0-bf4d-d3d5c8c2dba3',
  'document.id_card.back.mime_type': '07255268-9485-49e9-b871-91ccec1a5878',
  'document.id_card.city': 'West Elizabethfield',
  'document.id_card.classified_document_type': 'd2a6c3e9-4682-46bb-bfbb-3047432a9010',
  'document.id_card.clave_de_elector': '4fb04e0d-19bd-48a7-9817-ba0f66bf39e3',
  'document.id_card.curp': '954010a5-001a-4760-8b43-c617a436b8d4',
  'document.id_card.curp_validation_response': 'e21b337d-cc33-4907-ba39-bbdf04f191f4',
  'document.id_card.dob': '0cab4ee7-b24b-4627-a8e4-b646fde8fcb7',
  'document.id_card.document_number': 'c0efdb7d-b5d3-481c-bd6b-f8b11315f137',
  'document.id_card.expires_at': '6fdef801-0765-433b-8153-735b7ccad035',
  'document.id_card.first_name': 'Emie',
  'document.id_card.front.image': '90f57391-a043-4167-8890-5e075e2255d6',
  'document.id_card.front.mime_type': '9d7c543f-1189-4f3d-a2a7-441dc43bdba7',
  'document.id_card.full_address': '4079 Schmidt Freeway Apt. 320',
  'document.id_card.full_name': 'Clifton Torp',
  'document.id_card.gender': '725e77db-2e6b-4309-b9ef-4df9c24a935b',
  'document.id_card.issued_at': '78fd212b-5636-4995-8169-c187d9c79b6d',
  'document.id_card.issuing_country': 'Cuba',
  'document.id_card.issuing_state': 'Montana',
  'document.id_card.last_name': 'Schaefer',
  'document.id_card.nationality': '4bf34745-2440-485f-8762-5beb03fc4a7e',
  'document.id_card.postal_code': '3d02a16e-1cef-4642-9e0d-2d2193d9cf7d',
  'document.id_card.ref_number': '6376dffc-f519-439b-b7fa-5fedc202a55d',
  'document.id_card.samba_activity_history_response': '0fde5427-dfeb-4608-a231-93112061bf11',
  'document.id_card.selfie.image': 'c15e997b-80a9-4a00-a356-7f1f28858dc5',
  'document.id_card.selfie.mime_type': 'de4a5247-e26b-44bf-acdf-4f5685070f06',
  'document.id_card.state': 'Alaska',
  'document.id_card.us_issuing_state': 'Indiana',
  'document.passport.address_line1': '37338 Hessel Prairie Apt. 655',
  'document.passport.back.image': 'laborum',
  'document.passport.back.mime_type': 'et sit esse adipisicing in',
  'document.passport.city': 'East Timmothy',
  'document.passport.classified_document_type': 'veniam',
  'document.passport.clave_de_elector': 'qui voluptate veniam',
  'document.passport.curp': 'sint',
  'document.passport.curp_validation_response': '08e764a5-e7df-4fc1-be45-b1a2d04dcfbf',
  'document.passport.dob': 'non et',
  'document.passport.document_number': 'ullamco anim commodo pariatur amet',
  'document.passport.expires_at': 'ex et dolore',
  'document.passport.first_name': 'Wilfrid',
  'document.passport.front.image': 'eu deserunt',
  'document.passport.front.mime_type': 'exercitation',
  'document.passport.full_address': '293 S Center Street Suite 763',
  'document.passport.full_name': 'Debra McGlynn',
  'document.passport.gender': 'sunt dolore dolore mollit',
  'document.passport.issued_at': 'dolore laborum aliquip ullamco pariatur',
  'document.passport.issuing_country': 'Saint Kitts and Nevis',
  'document.passport.issuing_state': 'Connecticut',
  'document.passport.last_name': 'Heidenreich',
  'document.passport.nationality': 'ea eu in sit elit',
  'document.passport.postal_code': 'ullamco laborum commodo nulla culpa',
  'document.passport.ref_number': 'ut Duis',
  'document.passport.samba_activity_history_response': 'pariatur officia',
  'document.passport.selfie.image': 'mollit dolor cillum',
  'document.passport.selfie.mime_type': 'deserunt incididunt dolore in aliquip',
  'document.passport.state': 'Massachusetts',
  'document.passport.us_issuing_state': 'Montana',
  'document.passport_card.address_line1': '78170 Baumbach Street Suite 991',
  'document.passport_card.back.image': 'qui ex',
  'document.passport_card.back.mime_type': 'laborum',
  'document.passport_card.city': 'South Abelfurt',
  'document.passport_card.classified_document_type': 'proident nisi aliquip mollit commodo',
  'document.passport_card.clave_de_elector': 'labore exercitation occaecat laboris',
  'document.passport_card.curp': 'elit ullamco proident',
  'document.passport_card.curp_validation_response': 'b1b3da4c-0c26-478f-9bda-84514c7a9e4a',
  'document.passport_card.dob': 'sed',
  'document.passport_card.document_number': 'velit dolor quis',
  'document.passport_card.expires_at': 'dolore in velit',
  'document.passport_card.first_name': 'Rico',
  'document.passport_card.front.image': 'irure',
  'document.passport_card.front.mime_type': 'sunt ut Lorem in',
  'document.passport_card.full_address': '86896 W State Street Apt. 127',
  'document.passport_card.full_name': 'Walter Hermiston-Bosco MD',
  'document.passport_card.gender': 'in ea Ut',
  'document.passport_card.issued_at': 'velit ea Lorem in labore',
  'document.passport_card.issuing_country': 'Israel',
  'document.passport_card.issuing_state': 'Pennsylvania',
  'document.passport_card.last_name': 'Rowe',
  'document.passport_card.nationality': 'est proident',
  'document.passport_card.postal_code': 'cupidatat ut ut',
  'document.passport_card.ref_number': 'anim cillum',
  'document.passport_card.samba_activity_history_response': 'culpa sint',
  'document.passport_card.selfie.image': 'fugiat occaecat ut id',
  'document.passport_card.selfie.mime_type': 'ut',
  'document.passport_card.state': 'New Hampshire',
  'document.passport_card.us_issuing_state': 'Indiana',
  'document.permit.address_line1': '720 N Bridge Street Apt. 639',
  'document.permit.back.image': 'ut eu cupidatat',
  'document.permit.back.mime_type': 'Duis',
  'document.permit.city': 'New Victorfield',
  'document.permit.classified_document_type': 'proident eu',
  'document.permit.clave_de_elector': 'aliquip',
  'document.permit.curp': 'in sit elit anim quis',
  'document.permit.curp_validation_response': '9bba4683-1662-4517-9c1d-48eaaa186a5e',
  'document.permit.dob': 'cillum commodo veniam in cupidatat',
  'document.permit.document_number': 'Lorem dolore',
  'document.permit.expires_at': 'ex reprehenderit esse dolor',
  'document.permit.first_name': 'Joaquin',
  'document.permit.front.image': 'aute quis ex',
  'document.permit.front.mime_type': 'ad dolor irure aute do',
  'document.permit.full_address': '21417 E 6th Street Suite 812',
  'document.permit.full_name': 'Rodolfo Schamberger',
  'document.permit.gender': 'ut reprehenderit magna nulla Ut',
  'document.permit.issued_at': 'nulla in',
  'document.permit.issuing_country': 'Senegal',
  'document.permit.issuing_state': 'Idaho',
  'document.permit.last_name': 'Mann',
  'document.permit.nationality': 'exercitation ad enim',
  'document.permit.postal_code': 'id commodo dolore pariatur exercitation',
  'document.permit.ref_number': 'dolore aute occaecat et deserunt',
  'document.permit.samba_activity_history_response': 'consectetur aliquip laboris',
  'document.permit.selfie.image': 'nisi officia ex adipisicing cupidatat',
  'document.permit.selfie.mime_type': 'ea eiusmod qui minim fugiat',
  'document.permit.state': 'Oregon',
  'document.permit.us_issuing_state': 'Oklahoma',
  'document.proof_of_address.image': '6088 E 4th Street Apt. 380',
  'document.residence_document.address_line1': '5330 Ferry Locks Suite 668',
  'document.residence_document.back.image': '9f270a47-c328-4b9c-9f83-6ad558ee64fe',
  'document.residence_document.back.mime_type': 'e7ff56dc-3a4c-4e38-ac7b-45757668b2e8',
  'document.residence_document.city': 'Orvilleburgh',
  'document.residence_document.classified_document_type': 'fe4f8d7c-ca35-4212-87bb-cf3689972fc8',
  'document.residence_document.clave_de_elector': 'eb6c0834-b4e7-4e31-a029-2070bde2306b',
  'document.residence_document.curp': '79bae1e4-ee4c-4fb9-8f9b-c42b93dff4dd',
  'document.residence_document.curp_validation_response': 'c97e828c-a93d-477e-911b-0e9249ea1b3c',
  'document.residence_document.dob': '79cd9547-cfae-4c46-921f-eb759f3b8c8f',
  'document.residence_document.document_number': '24be021c-8d9c-4e86-b216-3208e9ebfdf7',
  'document.residence_document.expires_at': 'e79ec7aa-64fc-4ee5-88dd-3e39849d8e5b',
  'document.residence_document.first_name': 'Vladimir',
  'document.residence_document.front.image': '883cc900-14bf-4c18-af7e-8cdc6f906508',
  'document.residence_document.front.mime_type': '754cf4c9-8968-4906-b32d-497a7a7177ce',
  'document.residence_document.full_address': '7061 Kay Lane Apt. 452',
  'document.residence_document.full_name': 'Sally Terry',
  'document.residence_document.gender': 'aab05828-3163-4e2f-b328-e5b485591dc8',
  'document.residence_document.issued_at': '62d50db1-10f1-44f0-8afa-f328ba9d0fcf',
  'document.residence_document.issuing_country': 'Madagascar',
  'document.residence_document.issuing_state': 'Arizona',
  'document.residence_document.last_name': 'Graham-Hilpert',
  'document.residence_document.nationality': '14a02aec-c827-46b0-b212-cd665e51b69b',
  'document.residence_document.postal_code': '324ff136-cf99-474d-ae05-e6d3a9712254',
  'document.residence_document.ref_number': 'e036d96d-caeb-4e55-ba36-ad9eea06e8a4',
  'document.residence_document.samba_activity_history_response': 'e03bdda5-c542-422d-808f-354c86307435',
  'document.residence_document.selfie.image': '91190621-6a11-4b54-9aa9-b4c9e277998a',
  'document.residence_document.selfie.mime_type': 'a48aff70-6dbd-4350-bb80-66244edd5ea1',
  'document.residence_document.state': 'Delaware',
  'document.residence_document.us_issuing_state': 'Nebraska',
  'document.ssn_card.image': 'et consequat',
  'document.visa.address_line1': '594 Parisian Rue Suite 334',
  'document.visa.back.image': 'proident aute do tempor pariatur',
  'document.visa.back.mime_type': 'quis cillum',
  'document.visa.city': 'Port Bonitacester',
  'document.visa.classified_document_type': 'sint anim quis',
  'document.visa.clave_de_elector': 'dolor',
  'document.visa.curp': 'magna ut eu',
  'document.visa.curp_validation_response': '1f9e586c-8029-4e56-b6af-5160c673c108',
  'document.visa.dob': 'nulla',
  'document.visa.document_number': 'nulla',
  'document.visa.expires_at': 'deserunt eu ad Excepteur pariatur',
  'document.visa.first_name': 'Clint',
  'document.visa.front.image': 'exercitation velit',
  'document.visa.front.mime_type': 'in anim dolore',
  'document.visa.full_address': '9812 Swaniawski Cliff Suite 469',
  'document.visa.full_name': 'Christopher Schimmel',
  'document.visa.gender': 'eu commodo est',
  'document.visa.issued_at': 'Excepteur sint Duis',
  'document.visa.issuing_country': 'Australia',
  'document.visa.issuing_state': 'Idaho',
  'document.visa.last_name': 'Johnson-Prosacco',
  'document.visa.nationality': 'laborum',
  'document.visa.postal_code': 'anim mollit est ipsum',
  'document.visa.ref_number': 'ut pariatur dolor in',
  'document.visa.samba_activity_history_response': 'sunt sit anim enim',
  'document.visa.selfie.image': 'anim cupidatat',
  'document.visa.selfie.mime_type': 'pariatur Lorem commodo eiusmod',
  'document.visa.state': 'Arkansas',
  'document.visa.us_issuing_state': 'Connecticut',
  'document.voter_identification.address_line1': '996 S Division Street Suite 607',
  'document.voter_identification.back.image': '4211e634-2b25-4052-b88e-652fc5aed578',
  'document.voter_identification.back.mime_type': '4d78ea1b-1907-4a32-971b-d12e8b56f599',
  'document.voter_identification.city': 'West Tierra',
  'document.voter_identification.classified_document_type': 'e6e9078e-6a14-4355-9395-bb5da231b42f',
  'document.voter_identification.clave_de_elector': '4de807d7-4173-4766-a068-d1c29c8b7f04',
  'document.voter_identification.curp': 'dac9c4c4-3414-4378-9b9c-4068741bde84',
  'document.voter_identification.curp_validation_response': '291b6f48-4050-48c1-90e5-3819510297c8',
  'document.voter_identification.dob': 'bca42de6-db2d-40c4-93b7-59128c8735ce',
  'document.voter_identification.document_number': 'fc19f692-49a9-4b7b-a4cb-7c7106abcc7f',
  'document.voter_identification.expires_at': '5aebf9d3-e20e-4b9c-bd37-dbadc0d9267c',
  'document.voter_identification.first_name': 'Alba',
  'document.voter_identification.front.image': '35ee8f09-e262-4ac0-94f1-1ac75ed8c3d8',
  'document.voter_identification.front.mime_type': 'e2e6cd29-3307-45e9-9c56-7e169ce2fb74',
  'document.voter_identification.full_address': '1397 Luettgen-Conn Valley Apt. 644',
  'document.voter_identification.full_name': 'Mr. Angel Goyette',
  'document.voter_identification.gender': 'd90f6528-fe33-4a08-bdf0-0a8ee1205c96',
  'document.voter_identification.issued_at': '0d8d97ba-ea33-42d2-b24e-b92d93656a99',
  'document.voter_identification.issuing_country': 'Dominican Republic',
  'document.voter_identification.issuing_state': 'Idaho',
  'document.voter_identification.last_name': 'Hessel',
  'document.voter_identification.nationality': '579bd981-6365-43e6-9952-c338264a89cc',
  'document.voter_identification.postal_code': 'dff877b9-b355-482b-9524-afe4b2df11d4',
  'document.voter_identification.ref_number': '3aad76b0-405e-4a60-bc2f-25c6ddb14bf8',
  'document.voter_identification.samba_activity_history_response': 'd974f46a-5260-4210-9e00-b89459f98140',
  'document.voter_identification.selfie.image': '8ce161eb-9cc4-4109-a7de-a15eb870d7dc',
  'document.voter_identification.selfie.mime_type': '2111d51a-3b6a-4075-ac56-3a224e316c02',
  'document.voter_identification.state': 'Missouri',
  'document.voter_identification.us_issuing_state': 'Florida',
  'id.address_line1': '706 S Broadway Street Suite 105',
  'id.address_line2': '8405 McKenzie Bypass Suite 689',
  'id.citizenships': ['CA'],
  'id.city': 'Ferryfield',
  'id.country': 'Uruguay',
  'id.dob': '0430a70e-96c8-45fc-9c56-06e1e6dfd618',
  'id.drivers_license_number': 'e553bacc-1aeb-4e7b-934c-42576ef5336f',
  'id.drivers_license_state': 'Maine',
  'id.email': 'maia21@gmail.com',
  'id.first_name': 'Mae',
  'id.itin': 'e04fda04-1a25-44e2-a2a3-0e113ab345e7',
  'id.last_name': 'Jacobs',
  'id.middle_name': 'Grace Schaden',
  'id.nationality': 'd7c291f9-ff82-42bb-b445-2e8adb596fc2',
  'id.phone_number': '+16878616855',
  'id.ssn4': '144e4cc5-a455-494d-8cf8-4e26e81104b6',
  'id.ssn9': '46808916-456e-41f8-989a-c47f60b21774',
  'id.state': 'Louisiana',
  'id.us_legal_status': 'bf7ab1ba-88bc-48cc-a425-93574f649117',
  'id.us_tax_id': '82ea6306-a8c8-48d8-9db9-c313ae1d4e59',
  'id.visa_expiration_date': '2c4ab09b-4ca1-40a7-a04d-53fbfe3010f8',
  'id.visa_kind': '7b182140-d49a-455a-befb-2f92ae11474d',
  'id.zip': '70917-8363',
  'investor_profile.annual_income': 'quis ex officia nisi',
  'investor_profile.brokerage_firm_employer': 'commodo dolor ipsum',
  'investor_profile.declarations': ['senior_executive'],
  'investor_profile.employer': 'nostrud pariatur Excepteur',
  'investor_profile.employment_status': 'ipsum commodo',
  'investor_profile.family_member_names': ['Alma Schultz'],
  'investor_profile.funding_sources': ['savings'],
  'investor_profile.investment_goals': ['growth', 'income', 'preserve_capital'],
  'investor_profile.net_worth': 'sint ad Ut exercitation',
  'investor_profile.occupation': 'exercitation aliqua',
  'investor_profile.political_organization': 'nisi do minim',
  'investor_profile.risk_tolerance': 'adipisicing consectetur Excepteur do',
  'investor_profile.senior_executive_symbols': ['proident id culpa ut sed'],
};
export const dashboard_MultiUpdateRuleRequest: MultiUpdateRuleRequest = {
  add: [
    {
      isShadow: false,
      name: 'Cory Wisoky',
      ruleAction: 'step_up.identity',
      ruleExpression: [
        {
          field: 'address_input_is_po_box',
          op: 'eq',
          value: false,
        },
        {
          field: 'address_alert_stability',
          op: 'eq',
          value: false,
        },
        {
          field: 'device_bot_risk',
          op: 'eq',
          value: false,
        },
      ],
    },
    {
      isShadow: false,
      name: 'Cory Wisoky',
      ruleAction: 'step_up.identity_proof_of_ssn_proof_of_address',
      ruleExpression: [
        {
          field: 'address_street_name_partially_matches',
          op: 'eq',
          value: true,
        },
        {
          field: 'address_street_name_does_not_match',
          op: 'eq',
          value: false,
        },
        {
          field: 'dob_mob_does_not_match',
          op: 'not_eq',
          value: false,
        },
      ],
    },
    {
      isShadow: true,
      name: 'Cory Wisoky',
      ruleAction: 'step_up.identity_proof_of_ssn',
      ruleExpression: [
        {
          field: 'input_phone_number_does_not_match_ip_state',
          op: 'not_eq',
          value: false,
        },
        {
          field: 'name_matches',
          op: 'not_eq',
          value: false,
        },
        {
          field: 'beneficial_owners_do_not_match',
          op: 'not_eq',
          value: true,
        },
      ],
    },
  ],
  delete: ['in sed', 'Lorem veniam', 'dolore elit aute ipsum'],
  edit: [
    {
      ruleExpression: [
        {
          field: 'curp_service_not_available',
          op: 'not_eq',
          value: false,
        },
        {
          field: 'name_does_not_match',
          op: 'eq',
          value: false,
        },
        {
          field: 'document_alignment_failed',
          op: 'eq',
          value: true,
        },
      ],
      ruleId: 'f7d53aa4-6344-4f53-b8a9-cb5ca107c16d',
    },
    {
      ruleExpression: [
        {
          field: 'business_dba_does_not_match',
          op: 'eq',
          value: false,
        },
        {
          field: 'document_type_not_allowed',
          op: 'not_eq',
          value: false,
        },
        {
          field: 'address_input_is_not_standard_hospital',
          op: 'eq',
          value: true,
        },
      ],
      ruleId: 'f7d53aa4-6344-4f53-b8a9-cb5ca107c16d',
    },
    {
      ruleExpression: [
        {
          field: 'document_selfie_matches',
          op: 'eq',
          value: true,
        },
        {
          field: 'address_located_is_high_risk_address',
          op: 'not_eq',
          value: true,
        },
        {
          field: 'address_input_is_not_standard_mail_drop',
          op: 'not_eq',
          value: true,
        },
      ],
      ruleId: 'f7d53aa4-6344-4f53-b8a9-cb5ca107c16d',
    },
  ],
  expectedRuleSetVersion: 73467657,
};
export const dashboard_NumberOperator: NumberOperator = 'lt';
export const dashboard_ObConfigurationKind: ObConfigurationKind = 'kyc';
export const dashboard_Officer: Officer = {
  name: 'Evelyn Green',
  roles: 'ut officia',
};
export const dashboard_OffsetPaginatedDashboardSecretApiKey: OffsetPaginatedDashboardSecretApiKey = {
  data: [
    {
      createdAt: '1944-05-21T04:10:38.0Z',
      id: '7651ec54-a80a-43f5-a899-454ce65909fd',
      isLive: false,
      key: '4564060c-a83b-4d0d-85a9-84b245ae113e',
      lastUsedAt: '1956-06-30T19:28:18.0Z',
      name: 'Dr. Reginald Beatty',
      role: {
        createdAt: '1925-04-16T03:14:28.0Z',
        id: '0f546d32-3989-4aac-9b2d-5ad1a555bc71',
        isImmutable: true,
        kind: 'compliance_partner_dashboard_user',
        name: 'Mr. Billy Roob',
        numActiveApiKeys: 78687977,
        numActiveUsers: -30258195,
        scopes: [
          {
            kind: 'read',
          },
          {
            kind: 'read',
          },
          {
            kind: 'read',
          },
        ],
      },
      scrubbedKey: '96e31ef2-82a4-476a-97ce-3a6b85ef869d',
      status: 'enabled',
    },
    {
      createdAt: '1922-08-16T07:41:12.0Z',
      id: '7651ec54-a80a-43f5-a899-454ce65909fd',
      isLive: false,
      key: '4564060c-a83b-4d0d-85a9-84b245ae113e',
      lastUsedAt: '1944-03-03T19:11:27.0Z',
      name: 'Dr. Reginald Beatty',
      role: {
        createdAt: '1915-04-13T21:20:11.0Z',
        id: '0f546d32-3989-4aac-9b2d-5ad1a555bc71',
        isImmutable: false,
        kind: 'dashboard_user',
        name: 'Mr. Billy Roob',
        numActiveApiKeys: 48270321,
        numActiveUsers: -16567046,
        scopes: [
          {
            kind: 'read',
          },
          {
            kind: 'read',
          },
          {
            kind: 'read',
          },
        ],
      },
      scrubbedKey: '96e31ef2-82a4-476a-97ce-3a6b85ef869d',
      status: 'enabled',
    },
    {
      createdAt: '1946-04-21T20:09:03.0Z',
      id: '7651ec54-a80a-43f5-a899-454ce65909fd',
      isLive: true,
      key: '4564060c-a83b-4d0d-85a9-84b245ae113e',
      lastUsedAt: '1946-06-29T07:02:16.0Z',
      name: 'Dr. Reginald Beatty',
      role: {
        createdAt: '1905-03-02T21:18:26.0Z',
        id: '0f546d32-3989-4aac-9b2d-5ad1a555bc71',
        isImmutable: false,
        kind: 'compliance_partner_dashboard_user',
        name: 'Mr. Billy Roob',
        numActiveApiKeys: 3124223,
        numActiveUsers: 7338810,
        scopes: [
          {
            kind: 'read',
          },
          {
            kind: 'read',
          },
          {
            kind: 'read',
          },
        ],
      },
      scrubbedKey: '96e31ef2-82a4-476a-97ce-3a6b85ef869d',
      status: 'enabled',
    },
  ],
  meta: {
    count: -20539151,
    nextPage: 19473597,
  },
};
export const dashboard_OffsetPaginatedEntityOnboarding: OffsetPaginatedEntityOnboarding = {
  data: [
    {
      id: '88d31449-2ad8-4277-ac39-e2b6f29819ca',
      kind: 'kyb',
      playbookKey: '6626610f-8533-4a11-adf8-9c8c5369d4d7',
      playbookName: 'Example Playbook',
      ruleSetResults: [
        {
          id: 'cf3ca0f3-449f-4f72-96ba-4147d4c3883e',
          timestamp: '1949-07-23T10:38:04.0Z',
        },
        {
          id: 'cf3ca0f3-449f-4f72-96ba-4147d4c3883e',
          timestamp: '1891-07-18T02:12:29.0Z',
        },
        {
          id: 'cf3ca0f3-449f-4f72-96ba-4147d4c3883e',
          timestamp: '1900-07-15T09:23:13.0Z',
        },
      ],
      seqno: 43797063,
      status: 'fail',
      timestamp: '1962-06-13T06:33:18.0Z',
    },
    {
      id: '88d31449-2ad8-4277-ac39-e2b6f29819ca',
      kind: 'kyc',
      playbookKey: '6626610f-8533-4a11-adf8-9c8c5369d4d7',
      playbookName: 'Example Playbook',
      ruleSetResults: [
        {
          id: 'cf3ca0f3-449f-4f72-96ba-4147d4c3883e',
          timestamp: '1947-11-12T20:01:50.0Z',
        },
        {
          id: 'cf3ca0f3-449f-4f72-96ba-4147d4c3883e',
          timestamp: '1948-06-12T15:48:42.0Z',
        },
        {
          id: 'cf3ca0f3-449f-4f72-96ba-4147d4c3883e',
          timestamp: '1920-09-16T14:26:17.0Z',
        },
      ],
      seqno: -4726749,
      status: 'pending',
      timestamp: '1899-04-27T06:52:49.0Z',
    },
    {
      id: '88d31449-2ad8-4277-ac39-e2b6f29819ca',
      kind: 'document',
      playbookKey: '6626610f-8533-4a11-adf8-9c8c5369d4d7',
      playbookName: 'Example Playbook',
      ruleSetResults: [
        {
          id: 'cf3ca0f3-449f-4f72-96ba-4147d4c3883e',
          timestamp: '1927-02-18T12:29:56.0Z',
        },
        {
          id: 'cf3ca0f3-449f-4f72-96ba-4147d4c3883e',
          timestamp: '1903-04-03T12:51:39.0Z',
        },
        {
          id: 'cf3ca0f3-449f-4f72-96ba-4147d4c3883e',
          timestamp: '1918-10-27T01:51:42.0Z',
        },
      ],
      seqno: -17580459,
      status: 'pass',
      timestamp: '1919-12-27T09:46:49.0Z',
    },
  ],
  meta: {
    nextPage: 26570948,
  },
};
export const dashboard_OffsetPaginatedList: OffsetPaginatedList = {
  data: [
    {
      actor: {
        data: {
          id: '8bc1ec79-7565-4e65-9bcc-dd8181d2743b',
        },
        kind: 'user',
      },
      alias: 'velit',
      createdAt: '1957-03-28T13:49:59.0Z',
      entriesCount: 93453427,
      id: '0b49bb29-170f-48c0-b641-e18e5a998ff6',
      kind: 'email_domain',
      name: 'Jorge Schumm',
      usedInPlaybook: true,
    },
    {
      actor: {
        data: {
          id: '8bc1ec79-7565-4e65-9bcc-dd8181d2743b',
        },
        kind: 'user',
      },
      alias: 'fugiat quis cillum reprehenderit pariatur',
      createdAt: '1954-05-07T04:42:39.0Z',
      entriesCount: -58665568,
      id: '0b49bb29-170f-48c0-b641-e18e5a998ff6',
      kind: 'ip_address',
      name: 'Jorge Schumm',
      usedInPlaybook: false,
    },
    {
      actor: {
        data: {
          id: '8bc1ec79-7565-4e65-9bcc-dd8181d2743b',
        },
        kind: 'user',
      },
      alias: 'reprehenderit dolore pariatur in',
      createdAt: '1923-08-27T11:15:53.0Z',
      entriesCount: -19804152,
      id: '0b49bb29-170f-48c0-b641-e18e5a998ff6',
      kind: 'email_address',
      name: 'Jorge Schumm',
      usedInPlaybook: false,
    },
  ],
  meta: {
    count: 58908476,
    nextPage: -76200070,
  },
};
export const dashboard_OffsetPaginatedOnboardingConfiguration: OffsetPaginatedOnboardingConfiguration = {
  data: [
    {
      allowInternationalResidents: true,
      allowUsResidents: false,
      allowUsTerritoryResidents: true,
      author: {
        id: '7eca9203-f949-4779-b00a-920ec0d3abcd',
        kind: 'user',
      },
      businessDocumentsToCollect: [
        {
          data: {
            collectSelfie: false,
            documentTypesAndCountries: {
              countrySpecific: {},
              global: ['drivers_license', 'passport', 'visa'],
            },
          },
          kind: 'identity',
        },
        {
          data: {
            collectSelfie: true,
            documentTypesAndCountries: {
              countrySpecific: {},
              global: ['voter_identification', 'visa', 'passport'],
            },
          },
          kind: 'identity',
        },
        {
          data: {
            collectSelfie: true,
            documentTypesAndCountries: {
              countrySpecific: {},
              global: ['voter_identification', 'drivers_license', 'voter_identification'],
            },
          },
          kind: 'identity',
        },
      ],
      canAccessData: ['nationality', 'dob', 'business_phone_number'],
      cipKind: 'alpaca',
      createdAt: '1919-08-21T09:24:23.0Z',
      curpValidationEnabled: false,
      documentTypesAndCountries: {
        countrySpecific: {},
        global: ['drivers_license', 'drivers_license', 'voter_identification'],
      },
      documentsToCollect: [
        {
          data: {
            collectSelfie: false,
            documentTypesAndCountries: {
              countrySpecific: {},
              global: ['passport', 'voter_identification', 'residence_document'],
            },
          },
          kind: 'identity',
        },
        {
          data: {
            collectSelfie: false,
            documentTypesAndCountries: {
              countrySpecific: {},
              global: ['passport_card', 'id_card', 'voter_identification'],
            },
          },
          kind: 'identity',
        },
        {
          data: {
            collectSelfie: false,
            documentTypesAndCountries: {
              countrySpecific: {},
              global: ['id_card', 'visa', 'drivers_license'],
            },
          },
          kind: 'identity',
        },
      ],
      enhancedAml: {
        adverseMedia: false,
        enhancedAml: true,
        matchKind: 'fuzzy_low',
        ofac: true,
        pep: false,
      },
      id: 'e93c09c3-c61b-4db3-8e1d-4d836e884c38',
      internationalCountryRestrictions: ['MR', 'MY', 'ST'],
      isDocFirstFlow: false,
      isLive: true,
      isNoPhoneFlow: true,
      isRulesEnabled: false,
      key: 'a813d49d-d44f-4a09-a909-715257c0b9d0',
      kind: 'document',
      mustCollectData: ['nationality', 'us_legal_status', 'name'],
      name: 'Devin Connelly',
      optionalData: ['ssn9', 'us_legal_status', 'card'],
      playbookId: '6626610f-8533-4a11-adf8-9c8c5369d4d7',
      promptForPasskey: false,
      requiredAuthMethods: ['passkey', 'email', 'email'],
      ruleSet: {
        version: 7723693,
      },
      skipConfirm: false,
      skipKyb: true,
      skipKyc: false,
      status: 'disabled',
      verificationChecks: [
        {
          data: {
            einOnly: false,
          },
          kind: 'kyb',
        },
        {
          data: {
            einOnly: true,
          },
          kind: 'kyb',
        },
        {
          data: {
            einOnly: false,
          },
          kind: 'kyb',
        },
      ],
    },
    {
      allowInternationalResidents: true,
      allowUsResidents: true,
      allowUsTerritoryResidents: false,
      author: {
        id: '7eca9203-f949-4779-b00a-920ec0d3abcd',
        kind: 'user',
      },
      businessDocumentsToCollect: [
        {
          data: {
            collectSelfie: true,
            documentTypesAndCountries: {
              countrySpecific: {},
              global: ['permit', 'visa', 'passport'],
            },
          },
          kind: 'identity',
        },
        {
          data: {
            collectSelfie: false,
            documentTypesAndCountries: {
              countrySpecific: {},
              global: ['residence_document', 'passport_card', 'id_card'],
            },
          },
          kind: 'identity',
        },
        {
          data: {
            collectSelfie: true,
            documentTypesAndCountries: {
              countrySpecific: {},
              global: ['passport_card', 'voter_identification', 'permit'],
            },
          },
          kind: 'identity',
        },
      ],
      canAccessData: ['business_website', 'business_phone_number', 'name'],
      cipKind: 'apex',
      createdAt: '1938-01-08T17:46:59.0Z',
      curpValidationEnabled: true,
      documentTypesAndCountries: {
        countrySpecific: {},
        global: ['permit', 'id_card', 'visa'],
      },
      documentsToCollect: [
        {
          data: {
            collectSelfie: false,
            documentTypesAndCountries: {
              countrySpecific: {},
              global: ['visa', 'residence_document', 'visa'],
            },
          },
          kind: 'identity',
        },
        {
          data: {
            collectSelfie: false,
            documentTypesAndCountries: {
              countrySpecific: {},
              global: ['permit', 'voter_identification', 'visa'],
            },
          },
          kind: 'identity',
        },
        {
          data: {
            collectSelfie: false,
            documentTypesAndCountries: {
              countrySpecific: {},
              global: ['voter_identification', 'drivers_license', 'passport_card'],
            },
          },
          kind: 'identity',
        },
      ],
      enhancedAml: {
        adverseMedia: false,
        enhancedAml: true,
        matchKind: 'fuzzy_medium',
        ofac: false,
        pep: true,
      },
      id: 'e93c09c3-c61b-4db3-8e1d-4d836e884c38',
      internationalCountryRestrictions: ['UA', 'LC', 'MQ'],
      isDocFirstFlow: false,
      isLive: true,
      isNoPhoneFlow: false,
      isRulesEnabled: true,
      key: 'a813d49d-d44f-4a09-a909-715257c0b9d0',
      kind: 'kyc',
      mustCollectData: ['full_address', 'dob', 'card'],
      name: 'Devin Connelly',
      optionalData: ['dob', 'email', 'business_website'],
      playbookId: '6626610f-8533-4a11-adf8-9c8c5369d4d7',
      promptForPasskey: true,
      requiredAuthMethods: ['phone', 'passkey', 'phone'],
      ruleSet: {
        version: 83574655,
      },
      skipConfirm: true,
      skipKyb: false,
      skipKyc: true,
      status: 'enabled',
      verificationChecks: [
        {
          data: {
            einOnly: true,
          },
          kind: 'kyb',
        },
        {
          data: {
            einOnly: true,
          },
          kind: 'kyb',
        },
        {
          data: {
            einOnly: true,
          },
          kind: 'kyb',
        },
      ],
    },
    {
      allowInternationalResidents: true,
      allowUsResidents: false,
      allowUsTerritoryResidents: true,
      author: {
        id: '7eca9203-f949-4779-b00a-920ec0d3abcd',
        kind: 'user',
      },
      businessDocumentsToCollect: [
        {
          data: {
            collectSelfie: false,
            documentTypesAndCountries: {
              countrySpecific: {},
              global: ['residence_document', 'permit', 'id_card'],
            },
          },
          kind: 'identity',
        },
        {
          data: {
            collectSelfie: true,
            documentTypesAndCountries: {
              countrySpecific: {},
              global: ['permit', 'permit', 'passport'],
            },
          },
          kind: 'identity',
        },
        {
          data: {
            collectSelfie: false,
            documentTypesAndCountries: {
              countrySpecific: {},
              global: ['visa', 'drivers_license', 'residence_document'],
            },
          },
          kind: 'identity',
        },
      ],
      canAccessData: ['nationality', 'full_address', 'bank'],
      cipKind: 'apex',
      createdAt: '1952-03-31T15:55:43.0Z',
      curpValidationEnabled: true,
      documentTypesAndCountries: {
        countrySpecific: {},
        global: ['voter_identification', 'voter_identification', 'permit'],
      },
      documentsToCollect: [
        {
          data: {
            collectSelfie: true,
            documentTypesAndCountries: {
              countrySpecific: {},
              global: ['permit', 'permit', 'permit'],
            },
          },
          kind: 'identity',
        },
        {
          data: {
            collectSelfie: false,
            documentTypesAndCountries: {
              countrySpecific: {},
              global: ['visa', 'residence_document', 'drivers_license'],
            },
          },
          kind: 'identity',
        },
        {
          data: {
            collectSelfie: true,
            documentTypesAndCountries: {
              countrySpecific: {},
              global: ['visa', 'drivers_license', 'id_card'],
            },
          },
          kind: 'identity',
        },
      ],
      enhancedAml: {
        adverseMedia: true,
        enhancedAml: true,
        matchKind: 'exact_name',
        ofac: false,
        pep: true,
      },
      id: 'e93c09c3-c61b-4db3-8e1d-4d836e884c38',
      internationalCountryRestrictions: ['EC', 'SN', 'LV'],
      isDocFirstFlow: false,
      isLive: true,
      isNoPhoneFlow: false,
      isRulesEnabled: false,
      key: 'a813d49d-d44f-4a09-a909-715257c0b9d0',
      kind: 'document',
      mustCollectData: ['business_website', 'bank', 'bank'],
      name: 'Devin Connelly',
      optionalData: ['ssn9', 'phone_number', 'bank'],
      playbookId: '6626610f-8533-4a11-adf8-9c8c5369d4d7',
      promptForPasskey: false,
      requiredAuthMethods: ['passkey', 'passkey', 'phone'],
      ruleSet: {
        version: -32586226,
      },
      skipConfirm: false,
      skipKyb: true,
      skipKyc: false,
      status: 'enabled',
      verificationChecks: [
        {
          data: {
            einOnly: true,
          },
          kind: 'kyb',
        },
        {
          data: {
            einOnly: false,
          },
          kind: 'kyb',
        },
        {
          data: {
            einOnly: false,
          },
          kind: 'kyb',
        },
      ],
    },
  ],
  meta: {
    count: 1690841,
    nextPage: -78488081,
  },
};
export const dashboard_OffsetPaginatedOrganizationMember: OffsetPaginatedOrganizationMember = {
  data: [
    {
      createdAt: '1954-07-11T04:55:04.0Z',
      email: 'lawrence.hagenes21@gmail.com',
      firstName: 'Edna',
      id: 'd4adfe26-f057-44b5-8182-f95d0ea48db4',
      isFirmEmployee: false,
      lastName: 'West',
      role: {
        createdAt: '1925-04-09T09:56:15.0Z',
        id: '46fb89e4-ea0a-4995-a644-109f8422d918',
        isImmutable: false,
        kind: 'api_key',
        name: 'Darnell Lynch',
        numActiveApiKeys: -19605513,
        numActiveUsers: -98230669,
        scopes: [
          {
            kind: 'read',
          },
          {
            kind: 'read',
          },
          {
            kind: 'read',
          },
        ],
      },
      rolebinding: {
        lastLoginAt: '1968-07-07T11:15:39.0Z',
      },
    },
    {
      createdAt: '1937-10-07T01:46:25.0Z',
      email: 'lawrence.hagenes21@gmail.com',
      firstName: 'Edna',
      id: 'd4adfe26-f057-44b5-8182-f95d0ea48db4',
      isFirmEmployee: false,
      lastName: 'West',
      role: {
        createdAt: '1969-03-31T11:06:34.0Z',
        id: '46fb89e4-ea0a-4995-a644-109f8422d918',
        isImmutable: true,
        kind: 'dashboard_user',
        name: 'Darnell Lynch',
        numActiveApiKeys: 12065992,
        numActiveUsers: 66466195,
        scopes: [
          {
            kind: 'read',
          },
          {
            kind: 'read',
          },
          {
            kind: 'read',
          },
        ],
      },
      rolebinding: {
        lastLoginAt: '1916-05-08T07:55:18.0Z',
      },
    },
    {
      createdAt: '1911-09-22T10:42:44.0Z',
      email: 'lawrence.hagenes21@gmail.com',
      firstName: 'Edna',
      id: 'd4adfe26-f057-44b5-8182-f95d0ea48db4',
      isFirmEmployee: false,
      lastName: 'West',
      role: {
        createdAt: '1915-09-30T18:55:57.0Z',
        id: '46fb89e4-ea0a-4995-a644-109f8422d918',
        isImmutable: true,
        kind: 'api_key',
        name: 'Darnell Lynch',
        numActiveApiKeys: -58368066,
        numActiveUsers: -43163533,
        scopes: [
          {
            kind: 'read',
          },
          {
            kind: 'read',
          },
          {
            kind: 'read',
          },
        ],
      },
      rolebinding: {
        lastLoginAt: '1950-07-22T10:19:18.0Z',
      },
    },
  ],
  meta: {
    count: 23917935,
    nextPage: -35360318,
  },
};
export const dashboard_OffsetPaginatedOrganizationRole: OffsetPaginatedOrganizationRole = {
  data: [
    {
      createdAt: '1960-01-14T04:40:45.0Z',
      id: 'aad6683d-84f0-4586-b5be-007c3136d6ee',
      isImmutable: true,
      kind: 'dashboard_user',
      name: 'Clint Mohr',
      numActiveApiKeys: 30362222,
      numActiveUsers: 53961487,
      scopes: [
        {
          kind: 'read',
        },
        {
          kind: 'read',
        },
        {
          kind: 'read',
        },
      ],
    },
    {
      createdAt: '1946-02-26T20:06:33.0Z',
      id: 'aad6683d-84f0-4586-b5be-007c3136d6ee',
      isImmutable: true,
      kind: 'dashboard_user',
      name: 'Clint Mohr',
      numActiveApiKeys: 98583300,
      numActiveUsers: 62948498,
      scopes: [
        {
          kind: 'read',
        },
        {
          kind: 'read',
        },
        {
          kind: 'read',
        },
      ],
    },
    {
      createdAt: '1938-11-11T03:45:30.0Z',
      id: 'aad6683d-84f0-4586-b5be-007c3136d6ee',
      isImmutable: true,
      kind: 'api_key',
      name: 'Clint Mohr',
      numActiveApiKeys: -6440623,
      numActiveUsers: 43865274,
      scopes: [
        {
          kind: 'read',
        },
        {
          kind: 'read',
        },
        {
          kind: 'read',
        },
      ],
    },
  ],
  meta: {
    count: -61548331,
    nextPage: -72132177,
  },
};
export const dashboard_OmittedSecretCustomHeader: OmittedSecretCustomHeader = {
  id: '7821881f-74f5-4b6a-b24f-db7bde49e90f',
  name: 'Eleanor Hane',
};
export const dashboard_OnboardingConfiguration: OnboardingConfiguration = {
  allowInternationalResidents: true,
  allowUsResidents: false,
  allowUsTerritoryResidents: true,
  author: {
    id: '4c3b8c09-fde8-410a-aca4-b0d112343deb',
    kind: 'user',
  },
  businessDocumentsToCollect: [
    {
      data: {
        collectSelfie: false,
        documentTypesAndCountries: {
          countrySpecific: {},
          global: ['passport_card', 'drivers_license', 'passport_card'],
        },
      },
      kind: 'identity',
    },
    {
      data: {
        collectSelfie: true,
        documentTypesAndCountries: {
          countrySpecific: {},
          global: ['drivers_license', 'drivers_license', 'voter_identification'],
        },
      },
      kind: 'identity',
    },
    {
      data: {
        collectSelfie: false,
        documentTypesAndCountries: {
          countrySpecific: {},
          global: ['permit', 'passport', 'voter_identification'],
        },
      },
      kind: 'identity',
    },
  ],
  canAccessData: ['business_name', 'full_address', 'nationality'],
  cipKind: 'alpaca',
  createdAt: '1919-03-24T05:04:03.0Z',
  curpValidationEnabled: false,
  deactivatedAt: '1940-04-29T01:41:01.0Z',
  documentTypesAndCountries: {
    countrySpecific: {},
    global: ['visa', 'residence_document', 'passport'],
  },
  documentsToCollect: [
    {
      data: {
        collectSelfie: true,
        documentTypesAndCountries: {
          countrySpecific: {},
          global: ['voter_identification', 'residence_document', 'residence_document'],
        },
      },
      kind: 'identity',
    },
    {
      data: {
        collectSelfie: false,
        documentTypesAndCountries: {
          countrySpecific: {},
          global: ['drivers_license', 'permit', 'visa'],
        },
      },
      kind: 'identity',
    },
    {
      data: {
        collectSelfie: true,
        documentTypesAndCountries: {
          countrySpecific: {},
          global: ['voter_identification', 'passport_card', 'passport'],
        },
      },
      kind: 'identity',
    },
  ],
  enhancedAml: {
    adverseMedia: true,
    enhancedAml: true,
    matchKind: 'fuzzy_low',
    ofac: true,
    pep: false,
  },
  id: '8ba86e5f-07e1-42e4-a919-820477e6f085',
  internationalCountryRestrictions: ['AU', 'PY', 'NI'],
  isDocFirstFlow: true,
  isLive: true,
  isNoPhoneFlow: false,
  isRulesEnabled: true,
  key: '792f73c0-dc71-4207-a457-091e366ef20c',
  kind: 'auth',
  mustCollectData: ['name', 'email', 'business_kyced_beneficial_owners'],
  name: 'Lorenzo Abshire',
  optionalData: ['business_kyced_beneficial_owners', 'business_name', 'us_tax_id'],
  playbookId: 'f4904a80-ea55-4ab3-9c2f-2c46063d2d4d',
  promptForPasskey: true,
  requiredAuthMethods: ['passkey', 'email', 'phone'],
  ruleSet: {
    version: 32856698,
  },
  skipConfirm: true,
  skipKyb: true,
  skipKyc: true,
  status: 'disabled',
  verificationChecks: [
    {
      data: {
        einOnly: false,
      },
      kind: 'kyb',
    },
    {
      data: {
        einOnly: false,
      },
      kind: 'kyb',
    },
    {
      data: {
        einOnly: false,
      },
      kind: 'kyb',
    },
  ],
};
export const dashboard_OnboardingStatus: OnboardingStatus = 'pass';
export const dashboard_OnboardingTimelineInfo: OnboardingTimelineInfo = {
  event: 'sint',
  sessionId: '67060f97-ad17-4a25-818c-c0f5aac0373e',
};
export const dashboard_OrgClientSecurityConfig: OrgClientSecurityConfig = {
  allowedOrigins: [
    'quis officia non irure commodo',
    'ipsum cillum sunt nostrud labore',
    'consequat consectetur esse Duis',
  ],
  isLive: true,
};
export const dashboard_OrgFrequentNote: OrgFrequentNote = {
  content: 'ullamco',
  id: '161c635d-7729-4416-972e-050b884a6c4a',
  kind: 'trigger',
};
export const dashboard_OrgLoginResponse: OrgLoginResponse = {
  authToken: '3d8739b4-e4d0-42d1-81bc-465066353609',
  createdNewTenant: true,
  isFirstLogin: false,
  isMissingRequestedOrg: true,
  partnerTenant: {
    allowDomainAccess: true,
    domains: ['consequat ut', 'Excepteur reprehenderit quis', 'Ut'],
    id: 'c5f8123c-1fc2-4ad2-b7b8-d7b65e4fab2d',
    isAuthMethodSupported: true,
    isDomainAlreadyClaimed: true,
    logoUrl: 'https://darling-replacement.name/',
    name: 'Wayne Cassin',
    websiteUrl: 'https://enraged-railway.com/',
  },
  requiresOnboarding: false,
  tenant: {
    allowDomainAccess: true,
    allowedPreviewApis: ['tags', 'documents_list', 'legacy_onboarding_status_webhook'],
    companySize: 's51_to100',
    domains: ['nulla aute reprehenderit', 'tempor consectetur fugiat', 'est'],
    id: '56212b5c-6737-4672-bcd0-70311e7052da',
    isAuthMethodSupported: true,
    isDomainAlreadyClaimed: true,
    isProdAuthPlaybookRestricted: true,
    isProdKybPlaybookRestricted: true,
    isProdKycPlaybookRestricted: true,
    isProdNeuroEnabled: true,
    isProdSentilinkEnabled: false,
    isSandboxRestricted: true,
    logoUrl: 'https://multicolored-shipper.net/',
    name: 'Alex Labadie I',
    parent: {
      id: '321c6b71-7d62-4a29-b2f4-0189179466a8',
      name: 'Angelica Nienow',
    },
    supportEmail: 'blanche_kuhic41@gmail.com',
    supportPhone: '+14315826038',
    supportWebsite: 'https://livid-declaration.us/',
    websiteUrl: 'https://ignorant-heating.us',
  },
  user: {
    createdAt: '1926-08-12T08:29:17.0Z',
    email: 'osvaldo81@gmail.com',
    firstName: 'Maya',
    id: '77e3f190-32f5-464d-95d3-77ac79a2a3a1',
    isFirmEmployee: true,
    lastName: 'Wolf',
    role: {
      createdAt: '1928-05-30T04:28:51.0Z',
      id: 'dc83a049-d3dc-4355-94ab-01184eddbb2d',
      isImmutable: false,
      kind: 'compliance_partner_dashboard_user',
      name: 'Jill Spinka IV',
      numActiveApiKeys: -60908963,
      numActiveUsers: 89034736,
      scopes: [
        {
          kind: 'read',
        },
        {
          kind: 'read',
        },
        {
          kind: 'read',
        },
      ],
    },
    rolebinding: {
      lastLoginAt: '1904-11-11T18:43:35.0Z',
    },
  },
};
export const dashboard_OrgMetrics: OrgMetrics = {
  failOnboardings: 24386977,
  incompleteOnboardings: 46734391,
  newVaults: 63547062,
  passOnboardings: 60601036,
  totalOnboardings: 98260186,
};
export const dashboard_OrgMetricsResponse: OrgMetricsResponse = {
  business: {
    failOnboardings: 57028148,
    incompleteOnboardings: -90724613,
    newVaults: 82075100,
    passOnboardings: -5676351,
    totalOnboardings: -47259764,
  },
  user: {
    failOnboardings: -75145434,
    incompleteOnboardings: 3752657,
    newVaults: -95263133,
    passOnboardings: -88999068,
    totalOnboardings: -55439229,
  },
};
export const dashboard_OrgTenantTag: OrgTenantTag = {
  id: '17d19602-9a8e-40ac-bee2-5e44ef2c3a3f',
  kind: 'business',
  tag: 'ut ea laborum ullamco',
};
export const dashboard_Organization: Organization = {
  allowDomainAccess: false,
  allowedPreviewApis: ['implicit_auth', 'risk_signals_list', 'labels'],
  companySize: 's1001_plus',
  domains: ['consectetur fugiat', 'occaecat anim', 'fugiat laboris nisi Lorem in'],
  id: 'c0ccc556-8c45-4e86-905c-e4e72ee3e1ec',
  isAuthMethodSupported: true,
  isDomainAlreadyClaimed: true,
  isProdAuthPlaybookRestricted: true,
  isProdKybPlaybookRestricted: false,
  isProdKycPlaybookRestricted: true,
  isProdNeuroEnabled: true,
  isProdSentilinkEnabled: false,
  isSandboxRestricted: true,
  logoUrl: 'https://expert-equal.org/',
  name: 'Elbert Beatty',
  parent: {
    id: '7cc01dca-b4ab-41c1-9896-12545a50cc88',
    name: 'Sonya Sanford',
  },
  supportEmail: 'cleve.bauch@gmail.com',
  supportPhone: '+16609304274',
  supportWebsite: 'https://lonely-outrun.name/',
  websiteUrl: 'https://tough-term.com/',
};
export const dashboard_OrganizationMember: OrganizationMember = {
  createdAt: '1949-04-22T13:10:10.0Z',
  email: 'brenda.christiansen@gmail.com',
  firstName: 'Ottilie',
  id: '9f00036a-a101-46a9-9519-5b0f4dfe1a4b',
  isFirmEmployee: true,
  lastName: 'Leuschke',
  role: {
    createdAt: '1919-04-05T06:51:40.0Z',
    id: '8ca4c7c3-7fd4-49ef-bac2-a1127bf6b80e',
    isImmutable: true,
    kind: 'dashboard_user',
    name: 'Josefina Veum',
    numActiveApiKeys: 42832278,
    numActiveUsers: -90804217,
    scopes: [
      {
        kind: 'read',
      },
      {
        kind: 'read',
      },
      {
        kind: 'read',
      },
    ],
  },
  rolebinding: {
    lastLoginAt: '1935-09-19T09:49:01.0Z',
  },
};
export const dashboard_OrganizationRole: OrganizationRole = {
  createdAt: '1895-01-08T09:07:28.0Z',
  id: '538d0041-c1da-4aa4-9636-7a8c3bb92754',
  isImmutable: true,
  kind: 'api_key',
  name: 'Marjorie Ortiz',
  numActiveApiKeys: 79026303,
  numActiveUsers: 8837918,
  scopes: [
    {
      kind: 'read',
    },
    {
      kind: 'read',
    },
    {
      kind: 'read',
    },
  ],
};
export const dashboard_OrganizationRolebinding: OrganizationRolebinding = {
  lastLoginAt: '1892-02-13T20:44:46.0Z',
};
export const dashboard_OtherTenantDupes: OtherTenantDupes = {
  numMatches: -48416503,
  numTenants: -75290789,
};
export const dashboard_ParentOrganization: ParentOrganization = {
  id: '7d4b127d-e29b-4b44-ae3b-0c228c9eb00e',
  name: 'Bruce Metz',
};
export const dashboard_PartnerLoginRequest: PartnerLoginRequest = {
  code: 'non velit do',
  requestOrgId: 'f20831d1-5c6b-4ae7-9888-156c7b6b7c8a',
};
export const dashboard_PartnerOrganization: PartnerOrganization = {
  allowDomainAccess: false,
  domains: ['fugiat nostrud', 'et id sint ut', 'ut dolor'],
  id: 'bcf685ff-2ccb-4d7f-817a-b466bd63fcd5',
  isAuthMethodSupported: false,
  isDomainAlreadyClaimed: false,
  logoUrl: 'https://minor-precedent.name',
  name: 'Freddie Orn',
  websiteUrl: 'https://terrible-deduction.org',
};
export const dashboard_PatchProxyConfigRequest: PatchProxyConfigRequest = {
  accessReason: 'culpa',
  addSecretHeaders: [
    {
      name: 'Jo Wiza',
      value: 'ut ullamco pariatur dolor',
    },
    {
      name: 'Jo Wiza',
      value: 'dolor fugiat ex',
    },
    {
      name: 'Jo Wiza',
      value: 'magna cillum reprehenderit',
    },
  ],
  clientIdentity: {
    certificate: 'eiusmod quis',
    key: '4763135f-29a0-44ec-aaa3-f75f82e5cd9d',
  },
  deleteSecretHeaders: ['dolor veniam', 'Lorem et consectetur', 'reprehenderit'],
  headers: [
    {
      name: 'Amy Roberts',
      value: 'nisi consectetur non cillum',
    },
    {
      name: 'Amy Roberts',
      value: 'ad',
    },
    {
      name: 'Amy Roberts',
      value: 'consectetur tempor veniam adipisicing',
    },
  ],
  ingressSettings: {
    contentType: 'json',
    rules: [
      {
        target: 'labore dolore ipsum laboris',
        token: 'document.drivers_license.issued_at',
      },
      {
        target: 'dolore non',
        token: 'id.phone_number',
      },
      {
        target: 'sed exercitation Excepteur',
        token: 'document.voter_identification.document_number',
      },
    ],
  },
  method: 'Excepteur magna',
  name: 'Meredith Franecki MD',
  pinnedServerCertificates: ['sed magna', 'cupidatat exercitation', 'ipsum'],
  status: 'disabled',
  url: 'https://shabby-tail.net/',
};
export const dashboard_PhoneLookupAttributes: PhoneLookupAttributes = 'line_type_intelligence';
export const dashboard_PlainCustomHeader: PlainCustomHeader = {
  name: 'Pat Hane',
  value: 'dolor consectetur',
};
export const dashboard_PreviewApi: PreviewApi = 'decisions_list';
export const dashboard_PrivateBusinessOwner: PrivateBusinessOwner = {
  fpId: 'af38c335-844c-4bcc-b380-fa0a21e03e81',
  id: '60bd9d13-4b29-4879-a6af-6b29c73107e2',
  kind: 'primary',
  name: 'Leslie Waelchi',
  ownershipStake: -10665692,
  ownershipStakeDi: 'document.id_card.back.mime_type',
  source: 'hosted',
  status: 'fail',
};
export const dashboard_PrivateBusinessOwnerKycLink: PrivateBusinessOwnerKycLink = {
  id: '2cce5dda-1edc-41b8-9c93-39fd506d3e30',
  link: 'voluptate aute',
  name: 'Lora Nikolaus',
  token: '94f45ffb-484a-4ae6-b5c3-0b1bbca8d54e',
};
export const dashboard_PrivateOwnedBusiness: PrivateOwnedBusiness = {
  id: '5b617a49-a919-4bec-8f67-f7184379c1b0',
  status: 'fail',
};
export const dashboard_ProxyConfigBasic: ProxyConfigBasic = {
  createdAt: '1969-07-10T01:25:35.0Z',
  deactivatedAt: '1921-07-17T16:07:48.0Z',
  id: 'ef47b848-4507-4a30-9436-b7a5d36f9f02',
  isLive: true,
  method: 'aute Duis aliqua Ut cupidatat',
  name: 'Steve Klocko',
  status: 'disabled',
  url: 'https://sudden-yogurt.us/',
};
export const dashboard_ProxyConfigDetailed: ProxyConfigDetailed = {
  accessReason: 'enim consectetur',
  clientCertificate: 'irure',
  createdAt: '1919-01-04T07:01:36.0Z',
  deactivatedAt: '1969-11-27T10:25:03.0Z',
  headers: [
    {
      name: 'Craig Bogisich',
      value: 'enim exercitation in do',
    },
    {
      name: 'Craig Bogisich',
      value: 'non ex mollit',
    },
    {
      name: 'Craig Bogisich',
      value: 'enim proident sit adipisicing quis',
    },
  ],
  id: '0890d5c5-56ef-400c-b218-0c9834f5b321',
  ingressContentType: 'json',
  ingressRules: [
    {
      target: 'exercitation sed occaecat sit reprehenderit',
      token: 'document.visa.full_address',
    },
    {
      target: 'culpa',
      token: 'document.residence_document.curp_validation_response',
    },
    {
      target: 'sunt',
      token: 'document.voter_identification.front.image',
    },
  ],
  isLive: true,
  method: 'labore dolore ex dolore',
  name: 'Brent Towne',
  pinnedServerCertificates: ['dolore aliqua', 'Ut non ea in culpa', 'est tempor Excepteur in'],
  secretHeaders: [
    {
      id: 'e97fa3b9-5d4b-4b82-b260-ce6eeb363e46',
      name: 'Lillie Ryan',
    },
    {
      id: 'e97fa3b9-5d4b-4b82-b260-ce6eeb363e46',
      name: 'Lillie Ryan',
    },
    {
      id: 'e97fa3b9-5d4b-4b82-b260-ce6eeb363e46',
      name: 'Lillie Ryan',
    },
  ],
  status: 'enabled',
  url: 'https://crazy-procurement.biz',
};
export const dashboard_ProxyIngressContentType: ProxyIngressContentType = 'json';
export const dashboard_ProxyIngressRule: ProxyIngressRule = {
  target: 'ea',
  token: 'document.drivers_license.front.image',
};
export const dashboard_RawUserDataRequest: RawUserDataRequest = {
  key: 'bank.*.ach_account_id',
  value: {},
};
export const dashboard_RestoreOnboardingConfigurationRequest: RestoreOnboardingConfigurationRequest = {
  expectedLatestObcId: '79aef31e-8a37-40b1-82ab-7e18001871e4',
  restoreObcId: '2ae7b681-a5b6-4b61-af5e-57706329af55',
};
export const dashboard_ReuploadComplianceDocRequest: ReuploadComplianceDocRequest = {
  description: 'quis aute',
  name: 'Donnie Bechtelar',
};
export const dashboard_RiskScore: RiskScore = 'experian_score';
export const dashboard_RiskSignal: RiskSignal = {
  description: 'tempor qui dolor fugiat',
  group: 'phone',
  id: '284ea003-4911-46f8-beb0-d4f0a7418014',
  note: 'ullamco',
  onboardingDecisionId: '2d7de04c-ccc8-4252-a23a-a0ee934953b2',
  reasonCode: 'document_barcode_content_does_not_match',
  scopes: ['business_phone_number', 'street_address', 'street_address'],
  severity: 'low',
  timestamp: '1960-04-07T16:37:50.0Z',
};
export const dashboard_RiskSignalDetail: RiskSignalDetail = {
  description: 'dolor ut adipisicing',
  hasAmlHits: true,
  hasSentilinkDetail: false,
  id: '0eabb0b1-6dba-4234-aa9b-ed942d603c12',
  note: 'ipsum eu mollit',
  onboardingDecisionId: '287e494c-5dc2-452f-b692-a3189f8f1050',
  reasonCode: 'document_ocr_last_name_matches',
  scopes: ['country', 'behavior', 'business_address'],
  severity: 'low',
  timestamp: '1905-08-09T05:47:11.0Z',
};
export const dashboard_RiskSignalGroupKind: RiskSignalGroupKind = 'native_device';
export const dashboard_Rule: Rule = {
  action: 'step_up.identity_proof_of_ssn_proof_of_address',
  createdAt: '1948-11-29T17:34:56.0Z',
  isShadow: true,
  kind: 'person',
  name: 'Stacy Heller',
  ruleAction: {
    config: {},
    kind: 'pass_with_manual_review',
  },
  ruleExpression: [
    {
      field: 'ip_alert_high_risk_tor',
      op: 'not_eq',
      value: true,
    },
    {
      field: 'email_domain_corporate',
      op: 'eq',
      value: false,
    },
    {
      field: 'ip_alert_high_risk_proxy',
      op: 'not_eq',
      value: true,
    },
  ],
  ruleId: '408e3083-38db-49a0-98cf-e87fef631997',
};
export const dashboard_RuleAction: RuleAction = 'step_up.custom';
export const dashboard_RuleActionConfig: RuleActionConfig = {
  config: {},
  kind: 'pass_with_manual_review',
};
export const dashboard_RuleActionConfigFail: RuleActionConfigFail = {
  config: {},
  kind: 'fail',
};
export const dashboard_RuleActionConfigManualReview: RuleActionConfigManualReview = {
  config: {},
  kind: 'manual_review',
};
export const dashboard_RuleActionConfigPassWithManualReview: RuleActionConfigPassWithManualReview = {
  config: {},
  kind: 'pass_with_manual_review',
};
export const dashboard_RuleActionConfigStepUp: RuleActionConfigStepUp = {
  config: [
    {
      data: {
        collectSelfie: true,
        documentTypesAndCountries: {
          countrySpecific: {},
          global: ['id_card', 'visa', 'residence_document'],
        },
      },
      kind: 'identity',
    },
    {
      data: {
        collectSelfie: false,
        documentTypesAndCountries: {
          countrySpecific: {},
          global: ['residence_document', 'passport', 'passport'],
        },
      },
      kind: 'identity',
    },
    {
      data: {
        collectSelfie: true,
        documentTypesAndCountries: {
          countrySpecific: {},
          global: ['id_card', 'id_card', 'drivers_license'],
        },
      },
      kind: 'identity',
    },
  ],
  kind: 'step_up',
};
export const dashboard_RuleActionMigration: RuleActionMigration = 'manual_review';
export const dashboard_RuleEvalResult: RuleEvalResult = {
  backtestActionTriggered: 'step_up.identity_proof_of_ssn',
  currentStatus: 'pass',
  fpId: '3b6bfdfe-0232-4a1c-8366-8306d23a9478',
  historicalActionTriggered: 'step_up.identity',
};
export const dashboard_RuleEvalResults: RuleEvalResults = {
  results: [
    {
      backtestActionTriggered: 'step_up.identity_proof_of_ssn',
      currentStatus: 'pass',
      fpId: '1a68bb1a-fe9e-4f86-9ce6-704751d8bd05',
      historicalActionTriggered: 'manual_review',
    },
    {
      backtestActionTriggered: 'step_up.identity',
      currentStatus: 'fail',
      fpId: '1a68bb1a-fe9e-4f86-9ce6-704751d8bd05',
      historicalActionTriggered: 'pass_with_manual_review',
    },
    {
      backtestActionTriggered: 'pass_with_manual_review',
      currentStatus: 'pass',
      fpId: '1a68bb1a-fe9e-4f86-9ce6-704751d8bd05',
      historicalActionTriggered: 'step_up.custom',
    },
  ],
  stats: {
    countByBacktestActionTriggered: {},
    countByHistoricalActionTriggered: {},
    countByHistoricalAndBacktestActionTriggered: {},
    total: 82853894,
  },
};
export const dashboard_RuleEvalStats: RuleEvalStats = {
  countByBacktestActionTriggered: {},
  countByHistoricalActionTriggered: {},
  countByHistoricalAndBacktestActionTriggered: {},
  total: -61560433,
};
export const dashboard_RuleExpression: RuleExpression = [
  {
    field: 'address_state_matches',
    op: 'eq',
    value: true,
  },
  {
    field: 'document_visible_photo_features_not_verified',
    op: 'eq',
    value: true,
  },
  {
    field: 'dob_yob_not_available',
    op: 'eq',
    value: false,
  },
];
export const dashboard_RuleExpressionCondition: RuleExpressionCondition = {
  field: 'drivers_license_number_not_valid',
  op: 'not_eq',
  value: false,
};
export const dashboard_RuleInstanceKind: RuleInstanceKind = 'business';
export const dashboard_RuleResult: RuleResult = {
  result: false,
  rule: {
    action: 'fail',
    createdAt: '1905-01-03T02:22:19.0Z',
    isShadow: true,
    kind: 'any',
    name: 'Mr. Roberto Casper',
    ruleAction: {
      config: {},
      kind: 'pass_with_manual_review',
    },
    ruleExpression: [
      {
        field: 'address_input_is_not_deliverable',
        op: 'not_eq',
        value: true,
      },
      {
        field: 'ip_proxy',
        op: 'not_eq',
        value: true,
      },
      {
        field: 'document_ocr_first_name_does_not_match',
        op: 'not_eq',
        value: false,
      },
    ],
    ruleId: '99815f1a-c984-4ffe-915e-9e1efa279810',
  },
};
export const dashboard_RuleSet: RuleSet = {
  version: -67232831,
};
export const dashboard_RuleSetResult: RuleSetResult = {
  actionTriggered: 'pass_with_manual_review',
  createdAt: '1910-07-09T10:01:49.0Z',
  obConfigurationId: 'a7317a71-c422-4124-b998-14f5d4cd43f8',
  ruleActionTriggered: {
    config: {},
    kind: 'pass_with_manual_review',
  },
  ruleResults: [
    {
      result: true,
      rule: {
        action: 'step_up.identity_proof_of_ssn_proof_of_address',
        createdAt: '1949-04-08T03:50:25.0Z',
        isShadow: true,
        kind: 'any',
        name: 'Mrs. Priscilla Rutherford',
        ruleAction: {
          config: {},
          kind: 'pass_with_manual_review',
        },
        ruleExpression: [
          {
            field: 'business_name_no_watchlist_hits',
            op: 'eq',
            value: false,
          },
          {
            field: 'document_barcode_detected',
            op: 'not_eq',
            value: true,
          },
          {
            field: 'ip_alert_high_risk_spam',
            op: 'not_eq',
            value: false,
          },
        ],
        ruleId: 'b59229ee-71d7-4421-916a-3cc31fa7a706',
      },
    },
    {
      result: true,
      rule: {
        action: 'step_up.custom',
        createdAt: '1961-09-26T01:48:41.0Z',
        isShadow: true,
        kind: 'any',
        name: 'Mrs. Priscilla Rutherford',
        ruleAction: {
          config: {},
          kind: 'pass_with_manual_review',
        },
        ruleExpression: [
          {
            field: 'curp_service_not_available',
            op: 'eq',
            value: false,
          },
          {
            field: 'business_name_no_watchlist_hits',
            op: 'eq',
            value: true,
          },
          {
            field: 'document_selfie_not_live_image',
            op: 'eq',
            value: false,
          },
        ],
        ruleId: 'b59229ee-71d7-4421-916a-3cc31fa7a706',
      },
    },
    {
      result: false,
      rule: {
        action: 'step_up.custom',
        createdAt: '1895-12-20T05:07:55.0Z',
        isShadow: false,
        kind: 'person',
        name: 'Mrs. Priscilla Rutherford',
        ruleAction: {
          config: {},
          kind: 'pass_with_manual_review',
        },
        ruleExpression: [
          {
            field: 'document_photo_is_not_paper_capture',
            op: 'eq',
            value: true,
          },
          {
            field: 'document_sex_crosscheck_matches',
            op: 'not_eq',
            value: true,
          },
          {
            field: 'phone_number_mobile_account_status_absent',
            op: 'not_eq',
            value: true,
          },
        ],
        ruleId: 'b59229ee-71d7-4421-916a-3cc31fa7a706',
      },
    },
  ],
};
export const dashboard_SameTenantDupe: SameTenantDupe = {
  data: [
    {
      dataKind: 'vault_data',
      identifier: 'document.permit.curp_validation_response',
      isDecryptable: true,
      source: 'prefill',
      transforms: {},
      value: 'dolore sed amet ullamco',
    },
    {
      dataKind: 'vault_data',
      identifier: 'document.visa.state',
      isDecryptable: true,
      source: 'prefill',
      transforms: {},
      value: 'in et ullamco',
    },
    {
      dataKind: 'document_data',
      identifier: 'business.city',
      isDecryptable: true,
      source: 'bootstrap',
      transforms: {},
      value: 'ex proident Ut magna non',
    },
  ],
  dupeKinds: ['dob_ssn4', 'cookie_id', 'phone_number'],
  fpId: '8b552a04-fb13-4769-bc6a-5a23fcc559c4',
  startTimestamp: '1904-01-21T04:30:04.0Z',
  status: 'fail',
};
export const dashboard_ScoreBand: ScoreBand = 'low';
export const dashboard_SearchEntitiesRequest: SearchEntitiesRequest = {
  externalId: '684ac69a-2f56-48e6-85eb-f3ea2739a137',
  hasOutstandingWorkflowRequest: true,
  kind: 'business',
  labels: ['offboard_other', 'offboard_fraud', 'active'],
  playbookIds: ['ea eiusmod', 'adipisicing sunt esse ea', 'sunt et elit id reprehenderit'],
  requiresManualReview: false,
  search: 'enim',
  showAll: false,
  statuses: ['incomplete', 'pass', 'pass'],
  tags: ['cupidatat aute est ipsum', 'mollit incididunt Lorem do', 'deserunt laborum adipisicing'],
  timestampGte: '1938-02-20T23:08:44.0Z',
  timestampLte: '1915-04-11T09:21:38.0Z',
  watchlistHit: false,
};
export const dashboard_SecretApiKey: SecretApiKey = 'commodo laboris sunt';
export const dashboard_SecretCustomHeader: SecretCustomHeader = {
  name: 'Lynda Wisozk',
  value: 'velit voluptate',
};
export const dashboard_SentilinkDetail: SentilinkDetail = {
  idTheft: {
    reasonCodes: [
      {
        code: 'consectetur irure sit dolor Lorem',
        direction: 'ea dolor qui',
        explanation: 'voluptate deserunt dolor',
        rank: -57084716,
      },
      {
        code: 'commodo incididunt qui',
        direction: 'aliquip amet sit',
        explanation: 'ut et',
        rank: -47593839,
      },
      {
        code: 'labore commodo',
        direction: 'ea quis Duis dolor elit',
        explanation: 'occaecat',
        rank: 42114060,
      },
    ],
    score: -99098767,
    scoreBand: 'low',
  },
  synthetic: {
    reasonCodes: [
      {
        code: 'id',
        direction: 'Ut Duis occaecat id proident',
        explanation: 'velit in deserunt in anim',
        rank: -61561460,
      },
      {
        code: 'qui ut ea sint',
        direction: 'deserunt exercitation',
        explanation: 'esse',
        rank: -56311024,
      },
      {
        code: 'exercitation',
        direction: 'nisi sit',
        explanation: 'esse ut cillum pariatur minim',
        rank: 79731876,
      },
    ],
    score: 46312870,
    scoreBand: 'medium',
  },
};
export const dashboard_SentilinkReasonCode: SentilinkReasonCode = {
  code: 'id',
  direction: 'in dolore dolor adipisicing',
  explanation: 'ut nisi laboris consectetur',
  rank: 41960061,
};
export const dashboard_SentilinkScoreDetail: SentilinkScoreDetail = {
  reasonCodes: [
    {
      code: 'Duis officia do',
      direction: 'dolore quis laboris non',
      explanation: 'mollit et magna elit',
      rank: -25870150,
    },
    {
      code: 'nulla ut exercitation do ea',
      direction: 'eu ad officia et consectetur',
      explanation: 'ipsum veniam exercitation laboris',
      rank: -10022883,
    },
    {
      code: 'Duis ipsum',
      direction: 'occaecat incididunt',
      explanation: 'Excepteur amet elit',
      rank: -2986178,
    },
  ],
  score: -11455846,
  scoreBand: 'high',
};
export const dashboard_SignalScope: SignalScope = 'state';
export const dashboard_SignalSeverity: SignalSeverity = 'info';
export const dashboard_SubmitExternalUrlRequest: SubmitExternalUrlRequest = {
  url: 'https://ornate-contrail.org/',
};
export const dashboard_TenantAndroidAppMeta: TenantAndroidAppMeta = {
  apkCertSha256S: ['sint', 'in dolore', 'id cupidatat'],
  id: 'e66847fb-5123-41c6-9348-ae80fe3c0e98',
  integrityDecryptionKey: '735cbd77-6ec3-4944-847f-44e9795770f9',
  integrityVerificationKey: '70487420-08ab-498a-bc5c-02ad2754cbcc',
  packageNames: ['irure exercitation non nulla incididunt', 'amet commodo veniam', 'aliqua in pariatur Ut'],
  tenantId: 'f0e8ce5e-e21d-4f4f-bd5a-81b205efa8c0',
};
export const dashboard_TenantFrequentNoteKind: TenantFrequentNoteKind = 'annotation';
export const dashboard_TenantIosAppMeta: TenantIosAppMeta = {
  appBundleIds: ['veniam commodo do', 'id consectetur ut', 'in veniam'],
  deviceCheckKeyId: '4b854c10-41f4-4d28-bda5-c52c9fd91a66',
  deviceCheckPrivateKey: '1d272c27-653d-4d9e-93eb-2c94f1931a19',
  id: '1f74f145-8b2c-486a-8570-326f0b58cfc8',
  teamId: '6009a99d-55b7-4dd9-a6ad-789660ecb694',
  tenantId: 'f112063f-0f8d-491e-a030-78622dbb4e16',
};
export const dashboard_TenantKind: TenantKind = 'tenant';
export const dashboard_TenantLoginRequest: TenantLoginRequest = {
  code: 'et Lorem est',
  requestOrgId: 'eefc02b5-0ac0-4247-96c4-69d703fd3be7',
};
export const dashboard_TenantRoleKindDiscriminant: TenantRoleKindDiscriminant = 'api_key';
export const dashboard_TenantScope: TenantScope = {
  kind: 'read',
};
export const dashboard_TenantScopeAdmin: TenantScopeAdmin = {
  kind: 'admin',
};
export const dashboard_TenantScopeApiKeys: TenantScopeApiKeys = {
  kind: 'api_keys',
};
export const dashboard_TenantScopeAuthToken: TenantScopeAuthToken = {
  kind: 'auth_token',
};
export const dashboard_TenantScopeCipIntegration: TenantScopeCipIntegration = {
  kind: 'cip_integration',
};
export const dashboard_TenantScopeCompliancePartnerAdmin: TenantScopeCompliancePartnerAdmin = {
  kind: 'compliance_partner_admin',
};
export const dashboard_TenantScopeCompliancePartnerManageReviews: TenantScopeCompliancePartnerManageReviews = {
  kind: 'compliance_partner_manage_reviews',
};
export const dashboard_TenantScopeCompliancePartnerManageTemplates: TenantScopeCompliancePartnerManageTemplates = {
  kind: 'compliance_partner_manage_templates',
};
export const dashboard_TenantScopeCompliancePartnerRead: TenantScopeCompliancePartnerRead = {
  kind: 'compliance_partner_read',
};
export const dashboard_TenantScopeDecrypt: TenantScopeDecrypt = {
  data: 'card',
  kind: 'decrypt',
};
export const dashboard_TenantScopeDecryptAll: TenantScopeDecryptAll = {
  kind: 'decrypt_all',
};
export const dashboard_TenantScopeDecryptAllExceptPciData: TenantScopeDecryptAllExceptPciData = {
  kind: 'decrypt_all_except_pci_data',
};
export const dashboard_TenantScopeDecryptCustom: TenantScopeDecryptCustom = {
  kind: 'decrypt_custom',
};
export const dashboard_TenantScopeDecryptDocument: TenantScopeDecryptDocument = {
  kind: 'decrypt_document',
};
export const dashboard_TenantScopeDecryptDocumentAndSelfie: TenantScopeDecryptDocumentAndSelfie = {
  kind: 'decrypt_document_and_selfie',
};
export const dashboard_TenantScopeInvokeVaultProxy: TenantScopeInvokeVaultProxy = {
  data: {
    kind: 'any',
  },
  kind: 'invoke_vault_proxy',
};
export const dashboard_TenantScopeLabelAndTag: TenantScopeLabelAndTag = {
  kind: 'label_and_tag',
};
export const dashboard_TenantScopeManageComplianceDocSubmission: TenantScopeManageComplianceDocSubmission = {
  kind: 'manage_compliance_doc_submission',
};
export const dashboard_TenantScopeManageVaultProxy: TenantScopeManageVaultProxy = {
  kind: 'manage_vault_proxy',
};
export const dashboard_TenantScopeManageWebhooks: TenantScopeManageWebhooks = {
  kind: 'manage_webhooks',
};
export const dashboard_TenantScopeManualReview: TenantScopeManualReview = {
  kind: 'manual_review',
};
export const dashboard_TenantScopeOnboarding: TenantScopeOnboarding = {
  kind: 'onboarding',
};
export const dashboard_TenantScopeOnboardingConfiguration: TenantScopeOnboardingConfiguration = {
  kind: 'onboarding_configuration',
};
export const dashboard_TenantScopeOrgSettings: TenantScopeOrgSettings = {
  kind: 'org_settings',
};
export const dashboard_TenantScopeRead: TenantScopeRead = {
  kind: 'read',
};
export const dashboard_TenantScopeTriggerKyb: TenantScopeTriggerKyb = {
  kind: 'trigger_kyb',
};
export const dashboard_TenantScopeTriggerKyc: TenantScopeTriggerKyc = {
  kind: 'trigger_kyc',
};
export const dashboard_TenantScopeWriteEntities: TenantScopeWriteEntities = {
  kind: 'write_entities',
};
export const dashboard_TenantScopeWriteLists: TenantScopeWriteLists = {
  kind: 'write_lists',
};
export const dashboard_TerminalDecisionStatus: TerminalDecisionStatus = 'pass';
export const dashboard_TimelineOnboardingDecision: TimelineOnboardingDecision = {
  clearedManualReviews: [
    {
      kind: 'document_needs_review',
    },
    {
      kind: 'document_needs_review',
    },
    {
      kind: 'document_needs_review',
    },
  ],
  id: 'a879cd2d-fb65-4fc0-b790-6700284dd6ac',
  obConfiguration: {
    id: '4ba02c9d-8a73-400e-b0eb-e2bfc584d6fc',
    mustCollectData: ['business_address', 'ssn4', 'full_address'],
    name: 'Elmer Green-Bode',
  },
  ranRulesInSandbox: true,
  ruleSetResultId: '52f17b12-f513-4d68-8267-fab717c02d03',
  source: {
    id: '6aaee309-1208-40e5-944c-ea4186032cdb',
    kind: 'user',
  },
  status: 'pass',
  timestamp: '1932-01-04T03:24:49.0Z',
  workflowKind: 'alpaca_kyc',
};
export const dashboard_TimelinePlaybook: TimelinePlaybook = {
  id: '367621e6-a7ff-43f5-9764-6199e904bb6a',
  mustCollectData: ['business_phone_number', 'business_address', 'business_website'],
  name: 'Clara Herzog',
};
export const dashboard_TokenOperationKind: TokenOperationKind = 'update_auth_methods';
export const dashboard_TriggerRequest: TriggerRequest = {
  fpBid: '54bda7fa-e958-4aaa-b672-6dbbca8b515a',
  note: 'minim dolore consequat commodo',
  trigger: {
    data: {
      playbookId: 'ef1a3dd4-7bc3-4a73-8ba2-f6606c165557',
      recollectAttributes: ['nationality', 'business_kyced_beneficial_owners', 'bank'],
      reuseExistingBoKyc: true,
    },
    kind: 'onboard',
  },
};
export const dashboard_UnvalidatedRuleExpression: UnvalidatedRuleExpression = [
  {
    field: 'business_address_match',
    op: 'eq',
    value: false,
  },
  {
    field: 'document_no_image_alteration_front',
    op: 'not_eq',
    value: false,
  },
  {
    field: 'document_full_name_crosscheck_does_not_match',
    op: 'not_eq',
    value: true,
  },
];
export const dashboard_UpdateAnnotationRequest: UpdateAnnotationRequest = {
  isPinned: true,
};
export const dashboard_UpdateApiKeyRequest: UpdateApiKeyRequest = {
  name: 'Krystal Balistreri',
  roleId: 'd1c4ee93-c3c4-46ba-afcf-6ada2a81b8fb',
  status: 'enabled',
};
export const dashboard_UpdateClientSecurityConfig: UpdateClientSecurityConfig = {
  allowedOrigins: ['aliquip', 'commodo cupidatat culpa', 'cupidatat pariatur minim nisi cillum'],
};
export const dashboard_UpdateComplianceDocAssignmentRequest: UpdateComplianceDocAssignmentRequest = {
  userId: 'a2daf3bc-b7fd-42bf-a604-4c23b889275b',
};
export const dashboard_UpdateComplianceDocTemplateRequest: UpdateComplianceDocTemplateRequest = {
  description: 'nulla anim',
  name: 'Kayla Hartmann IV',
};
export const dashboard_UpdateLabelRequest: UpdateLabelRequest = {
  kind: 'offboard_fraud',
};
export const dashboard_UpdateListRequest: UpdateListRequest = {
  alias: 'aliqua et',
  name: 'Grady Lind',
};
export const dashboard_UpdateObConfigRequest: UpdateObConfigRequest = {
  name: 'Patsy Funk',
  promptForPasskey: false,
  skipConfirm: true,
  status: 'disabled',
};
export const dashboard_UpdatePartnerTenantRequest: UpdatePartnerTenantRequest = {
  allowDomainAccess: false,
  name: 'Dr. Deanna Morissette',
  websiteUrl: 'https://polite-bookend.com/',
};
export const dashboard_UpdateTenantAndroidAppMetaRequest: UpdateTenantAndroidAppMetaRequest = {
  apkCertSha256S: ['anim aliquip', 'nulla sint', 'voluptate dolore Excepteur est'],
  integrityDecryptionKey: 'aaec2951-dbb1-4547-ac67-c3f3605e1d28',
  integrityVerificationKey: '0378eb27-50a7-43b9-8d67-dfcbce53f720',
  packageNames: ['incididunt', 'labore id', 'dolore ullamco'],
};
export const dashboard_UpdateTenantIosAppMetaRequest: UpdateTenantIosAppMetaRequest = {
  appBundleIds: ['ullamco ipsum', 'anim laborum aliqua', 'culpa'],
  deviceCheckKeyId: '3d268de5-62d0-4d80-8d33-ebab0f939753',
  deviceCheckPrivateKey: '6a4af98c-62cc-44bd-8d98-febe320265d8',
  teamId: '6d929467-2946-4a9f-afda-40dc44e4ade3',
};
export const dashboard_UpdateTenantRequest: UpdateTenantRequest = {
  allowDomainAccess: false,
  clearSupportEmail: false,
  clearSupportPhone: false,
  clearSupportWebsite: false,
  companySize: 's1001_plus',
  name: 'Wesley Tillman',
  privacyPolicyUrl: 'https://beloved-meal.name',
  supportEmail: 'norbert12@gmail.com',
  supportPhone: '+13177702663',
  supportWebsite: 'https://nifty-forage.biz',
  websiteUrl: 'https://unimportant-term.net',
};
export const dashboard_UpdateTenantRoleRequest: UpdateTenantRoleRequest = {
  name: 'Ramon Bashirian',
  scopes: [
    {
      kind: 'read',
    },
    {
      kind: 'read',
    },
    {
      kind: 'read',
    },
  ],
};
export const dashboard_UpdateTenantRolebindingRequest: UpdateTenantRolebindingRequest = {
  roleId: '91e4a4f5-7f3b-415f-9ae0-6dcb818777d4',
};
export const dashboard_UpdateTenantUserRequest: UpdateTenantUserRequest = {
  firstName: 'Amaya',
  lastName: 'Beer',
};
export const dashboard_UploadSource: UploadSource = 'mobile';
export const dashboard_UserAiSummary: UserAiSummary = {
  conclusion: 'aliqua eu',
  detailedSummary: 'nisi velit labore cillum ipsum',
  highLevelSummary: 'consequat labore eu aliqua',
  riskSignalSummary: 'magna',
};
export const dashboard_UserDataIdentifier: UserDataIdentifier = 'id.country';
export const dashboard_UserDecryptRequest: UserDecryptRequest = {
  fields: [
    'document.passport_card.curp_validation_response',
    'document.voter_identification.selfie.mime_type',
    'card.*.expiration',
  ],
  reason: 'eu aute velit laborum dolore',
  transforms: ["date_format('<from_format>','<to_format>')", 'prefix(<n>)', 'suffix(<n>)'],
  versionAt: '1891-03-31T04:49:11.0Z',
};
export const dashboard_UserDecryptResponse: UserDecryptResponse = {
  key: 'document.permit.postal_code',
  value: {},
};
export const dashboard_UserDeleteResponse: UserDeleteResponse = {
  key: 'id.ssn4',
  value: false,
};
export const dashboard_UserInsight: UserInsight = {
  description: 'in aliqua magna',
  name: 'Karen McClure',
  scope: 'workflow',
  unit: 'duration_ms',
  value: 'proident tempor ipsum qui',
};
export const dashboard_UserInsightScope: UserInsightScope = 'behavior';
export const dashboard_UserInsightUnit: UserInsightUnit = 'boolean';
export const dashboard_UserLabel: UserLabel = {
  createdAt: '1927-07-17T14:20:28.0Z',
  kind: 'active',
};
export const dashboard_UserTag: UserTag = {
  createdAt: '1918-02-19T23:26:14.0Z',
  id: 'b4cba478-b6ec-4e41-995e-e875a841f2a4',
  tag: 'voluptate',
};
export const dashboard_UserTimeline: UserTimeline = {
  event: {
    data: {
      actor: {
        id: 'c59be8cf-faff-4af4-9d2d-2555534a130d',
        kind: 'user',
      },
      attributes: ['business_corporation_type', 'investor_profile', 'business_kyced_beneficial_owners'],
      isPrefill: false,
      targets: ['document.drivers_license.city', 'document.visa.back.image', 'document.permit.state'],
    },
    kind: 'data_collected',
  },
  seqno: -6635230,
  timestamp: '1940-05-01T04:09:38.0Z',
};
export const dashboard_UserTimelineEvent: UserTimelineEvent = {
  data: {
    actor: {
      id: 'a49c6ae8-bbb6-478e-8e3e-ba2d39e00e53',
      kind: 'user',
    },
    attributes: ['ssn9', 'us_tax_id', 'business_tin'],
    isPrefill: true,
    targets: [
      'document.voter_identification.full_name',
      'card.*.billing_address.country',
      'document.passport.address_line1',
    ],
  },
  kind: 'data_collected',
};
export const dashboard_UserTimelineEventAnnotation: UserTimelineEventAnnotation = {
  data: {
    id: '2163d2f3-0bfc-4bb0-b757-83ed1ff7b856',
    isPinned: false,
    note: 'enim',
    source: {
      id: '3f0a3e6f-6f2e-4eac-97c7-6ec7ae7f0893',
      kind: 'user',
    },
    timestamp: '1941-11-01T01:39:16.0Z',
  },
  kind: 'annotation',
};
export const dashboard_UserTimelineEventAuthMethodUpdated: UserTimelineEventAuthMethodUpdated = {
  data: {
    action: 'add_primary',
    insightEvent: {
      city: 'West Nellie',
      country: 'El Salvador',
      ipAddress: '49747 Center Street Apt. 222',
      latitude: 57937526.54385415,
      longitude: 15402501.555539057,
      metroCode: 'Excepteur',
      postalCode: 'velit aliquip magna consequat',
      region: 'aliqua sit aute',
      regionName: 'Crystal Doyle',
      sessionId: '47b7a9d6-b345-4eff-bcf6-0c96c94cee1f',
      timeZone: 'Ut deserunt',
      timestamp: '1936-06-04T01:58:31.0Z',
      userAgent: 'Lorem',
    },
    kind: 'email',
  },
  kind: 'auth_method_updated',
};
export const dashboard_UserTimelineEventBusinessOwnerCompletedKyc: UserTimelineEventBusinessOwnerCompletedKyc = {
  data: {
    decision: {
      clearedManualReviews: [
        {
          kind: 'rule_triggered',
        },
        {
          kind: 'document_needs_review',
        },
        {
          kind: 'document_needs_review',
        },
      ],
      id: '5f2f3ae5-8758-462a-854a-0c4195cb469e',
      obConfiguration: {
        id: '03eae7be-3038-487c-8a46-b071fff01b4d',
        mustCollectData: ['card', 'us_legal_status', 'us_legal_status'],
        name: 'Guadalupe Nitzsche',
      },
      ranRulesInSandbox: false,
      ruleSetResultId: '76777816-5588-44d3-9ce8-5dd62d2bd4da',
      source: {
        id: '51aecba3-5218-435d-a40d-4a084db19256',
        kind: 'user',
      },
      status: 'pass',
      timestamp: '1914-12-10T01:11:44.0Z',
      workflowKind: 'kyc',
    },
    fpId: '3882e700-3bd9-4606-b19f-e05f9923c118',
  },
  kind: 'business_owner_completed_kyc',
};
export const dashboard_UserTimelineEventDataCollected: UserTimelineEventDataCollected = {
  data: {
    actor: {
      id: 'b308fb06-c9be-473f-9ad9-78986d85eea5',
      kind: 'user',
    },
    attributes: ['ssn4', 'business_kyced_beneficial_owners', 'business_kyced_beneficial_owners'],
    isPrefill: false,
    targets: ['card.*.expiration_year', 'document.passport.issuing_state', 'id.middle_name'],
  },
  kind: 'data_collected',
};
export const dashboard_UserTimelineEventDocumentUploaded: UserTimelineEventDocumentUploaded = {
  data: {
    config: {
      data: {
        collectSelfie: true,
        documentTypesAndCountries: {
          countrySpecific: {},
          global: ['voter_identification', 'passport_card', 'id_card'],
        },
      },
      kind: 'identity',
    },
    deviceType: 'ios',
    documentType: 'passport',
    status: 'failed',
  },
  kind: 'document_uploaded',
};
export const dashboard_UserTimelineEventExternalIntegrationCalled: UserTimelineEventExternalIntegrationCalled = {
  data: {
    externalId: '031d33fc-7e95-4646-bce5-838be493687c',
    integration: 'alpaca_cip',
    successful: true,
  },
  kind: 'external_integration_called',
};
export const dashboard_UserTimelineEventLabelAdded: UserTimelineEventLabelAdded = {
  data: {
    kind: 'active',
  },
  kind: 'label_added',
};
export const dashboard_UserTimelineEventLiveness: UserTimelineEventLiveness = {
  data: {
    attributes: {
      device: 'tempor eiusmod occaecat quis',
      issuers: ['footprint', 'footprint', 'cloudflare'],
      metadata: {},
      os: 'reprehenderit eu id',
    },
    insightEvent: {
      city: 'Vonshire',
      country: 'Latvia',
      ipAddress: '833 Graham Overpass Suite 590',
      latitude: -8028729.352235422,
      longitude: -80407628.13278826,
      metroCode: 'elit ut cillum',
      postalCode: 'Duis sed nulla proident ullamco',
      region: 'tempor velit',
      regionName: 'Marilyn Johnston',
      sessionId: 'f8c6b184-b94f-4756-be57-2e470f27169b',
      timeZone: 'in tempor proident anim in',
      timestamp: '1894-04-14T13:16:01.0Z',
      userAgent: 'ullamco tempor enim dolor occaecat',
    },
    source: 'apple_device_attestation',
  },
  kind: 'liveness',
};
export const dashboard_UserTimelineEventOnboardingDecision: UserTimelineEventOnboardingDecision = {
  data: {
    annotation: {
      id: '4e83cfc5-8d29-49cf-85f0-0012b770a678',
      isPinned: false,
      note: 'sed incididunt',
      source: {
        id: 'fa9ac550-c231-4fa1-a1f9-940d4ba7dd58',
        kind: 'user',
      },
      timestamp: '1925-02-05T06:25:07.0Z',
    },
    decision: {
      clearedManualReviews: [
        {
          kind: 'document_needs_review',
        },
        {
          kind: 'rule_triggered',
        },
        {
          kind: 'rule_triggered',
        },
      ],
      id: '2b64a4e6-4941-438c-88f8-d7dfaaa72dc8',
      obConfiguration: {
        id: '4422c4b8-d424-49f8-89be-6d02a7ba71c5',
        mustCollectData: ['business_name', 'phone_number', 'business_tin'],
        name: 'Alfredo King',
      },
      ranRulesInSandbox: false,
      ruleSetResultId: 'faa372d0-3e7d-4faa-b967-32f9ef639a71',
      source: {
        id: 'fbe1698e-f62f-4c02-9af6-cca075cfb2fe',
        kind: 'user',
      },
      status: 'pass',
      timestamp: '1928-05-15T02:12:20.0Z',
      workflowKind: 'kyc',
    },
    workflowSource: 'tenant',
  },
  kind: 'onboarding_decision',
};
export const dashboard_UserTimelineEventOnboardingTimeline: UserTimelineEventOnboardingTimeline = {
  data: {
    event: 'dolore ullamco culpa in esse',
    sessionId: '7da98b9c-501b-4807-9fcc-c6630015fd3c',
  },
  kind: 'onboarding_timeline',
};
export const dashboard_UserTimelineEventStepUp: UserTimelineEventStepUp = {
  data: [
    {
      kind: 'proof_of_ssn',
      ruleSetResultId: 'c954cbca-386e-4cd9-8ff7-8ee75ba24e7c',
    },
    {
      kind: 'identity',
      ruleSetResultId: 'c954cbca-386e-4cd9-8ff7-8ee75ba24e7c',
    },
    {
      kind: 'proof_of_ssn',
      ruleSetResultId: 'c954cbca-386e-4cd9-8ff7-8ee75ba24e7c',
    },
  ],
  kind: 'step_up',
};
export const dashboard_UserTimelineEventVaultCreated: UserTimelineEventVaultCreated = {
  data: {
    actor: {
      id: 'f9907fd5-8657-4adc-b8d0-79e64d916e5e',
      kind: 'user',
    },
  },
  kind: 'vault_created',
};
export const dashboard_UserTimelineEventWatchlistCheck: UserTimelineEventWatchlistCheck = {
  data: {
    id: '972ceb12-49f6-4959-bf10-bd212c5b4290',
    reasonCodes: ['device_reputation', 'document_ocr_first_name_matches', 'document_photo_is_paper_capture'],
    status: 'not_needed',
  },
  kind: 'watchlist_check',
};
export const dashboard_UserTimelineEventWorkflowStarted: UserTimelineEventWorkflowStarted = {
  data: {
    kind: 'document',
    playbook: {
      id: 'eb6f55e8-7b9e-4302-8b07-9dafb30bed16',
      mustCollectData: ['business_kyced_beneficial_owners', 'ssn4', 'business_website'],
      name: 'Ed Koelpin',
    },
    workflowSource: 'tenant',
  },
  kind: 'workflow_started',
};
export const dashboard_UserTimelineEventWorkflowTriggered: UserTimelineEventWorkflowTriggered = {
  data: {
    actor: {
      id: 'd52773cc-a1f5-4133-93ed-260322708c07',
      kind: 'user',
    },
    config: {
      data: {
        playbookId: '25e3a989-3259-4ab2-b264-f21e00fcd015',
        recollectAttributes: ['business_address', 'business_tin', 'dob'],
        reuseExistingBoKyc: true,
      },
      kind: 'onboard',
    },
    fpId: 'da664919-9631-4b66-9154-ce8c43555f67',
    note: 'cupidatat',
    requestIsActive: false,
  },
  kind: 'workflow_triggered',
};
export const dashboard_VaultCreated: VaultCreated = {
  actor: {
    id: '305157cd-57d4-45f1-ac4c-a1fb5890f411',
    kind: 'user',
  },
};
export const dashboard_VaultDrAwsPreEnrollResponse: VaultDrAwsPreEnrollResponse = {
  externalId: 'f63833cc-3972-434a-b459-e2ef366e6d82',
};
export const dashboard_VaultDrEnrollRequest: VaultDrEnrollRequest = {
  awsAccountId: '0dd2eb44-b005-4ae5-be24-dbcbfb26d442',
  awsRoleName: 'Sandy Hermann',
  orgPublicKeys: ['exercitation in', 'quis dolore deserunt', 'id'],
  reEnroll: false,
  s3BucketName: 'Lewis Denesik',
};
export const dashboard_VaultDrEnrollResponse: VaultDrEnrollResponse = {};
export const dashboard_VaultDrEnrolledStatus: VaultDrEnrolledStatus = {
  awsAccountId: 'b8f5478e-a0c9-4928-835a-5f56de060185',
  awsRoleName: 'Percy Haag',
  backupLagSeconds: -84102994,
  bucketPathNamespace: 'Mr. Francisco Welch',
  enrolledAt: '1905-03-25T15:57:19.0Z',
  latestBackupRecordTimestamp: '1952-12-19T17:05:32.0Z',
  orgPublicKeys: [
    'aute exercitation veniam incididunt velit',
    'non ea aliquip ut labore',
    'magna in quis proident exercitation',
  ],
  s3BucketName: 'Harold Aufderhar',
};
export const dashboard_VaultDrRevealWrappedRecordKeysRequest: VaultDrRevealWrappedRecordKeysRequest = {
  recordPaths: ['Lorem esse dolor ea', 'non voluptate', 'in aliquip cupidatat dolor dolor'],
};
export const dashboard_VaultDrRevealWrappedRecordKeysResponse: VaultDrRevealWrappedRecordKeysResponse = {
  wrappedRecordKeys: {},
};
export const dashboard_VaultDrStatus: VaultDrStatus = {
  enrolledStatus: {
    awsAccountId: '78e661ad-21a5-4008-bcf1-86b5e8f697c0',
    awsRoleName: 'Myra Cole',
    backupLagSeconds: -30089490,
    bucketPathNamespace: 'Tyrone Howe',
    enrolledAt: '1904-10-31T07:42:11.0Z',
    latestBackupRecordTimestamp: '1956-04-30T22:01:25.0Z',
    orgPublicKeys: ['aliquip ea eiusmod in enim', 'ut', 'incididunt nisi exercitation'],
    s3BucketName: 'Miss Bonnie Rowe',
  },
  isLive: false,
  orgId: '215bcc4a-72c0-4229-a18a-74dd4c3d5aa3',
  orgName: 'Marian Towne',
};
export const dashboard_VaultKind: VaultKind = 'business';
export const dashboard_VaultOperation: VaultOperation = {
  field: 'investor_profile.occupation',
  op: 'eq',
  value: 'pariatur laboris',
};
export const dashboard_VerificationCheck: VerificationCheck = {
  data: {
    einOnly: true,
  },
  kind: 'kyb',
};
export const dashboard_VerificationCheckAml: VerificationCheckAml = {
  data: {
    adverseMedia: true,
    adverseMediaLists: ['financial_crime', 'violent_crime', 'general_minor'],
    continuousMonitoring: true,
    matchKind: 'exact_name_and_dob_year',
    ofac: false,
    pep: true,
  },
  kind: 'aml',
};
export const dashboard_VerificationCheckBusinessAml: VerificationCheckBusinessAml = {
  data: {},
  kind: 'business_aml',
};
export const dashboard_VerificationCheckCurpValidation: VerificationCheckCurpValidation = {
  data: {},
  kind: 'curp_validation',
};
export const dashboard_VerificationCheckIdentityDocument: VerificationCheckIdentityDocument = {
  data: {},
  kind: 'identity_document',
};
export const dashboard_VerificationCheckKyb: VerificationCheckKyb = {
  data: {
    einOnly: false,
  },
  kind: 'kyb',
};
export const dashboard_VerificationCheckKyc: VerificationCheckKyc = {
  data: {},
  kind: 'kyc',
};
export const dashboard_VerificationCheckNeuroId: VerificationCheckNeuroId = {
  data: {},
  kind: 'neuro_id',
};
export const dashboard_VerificationCheckPhone: VerificationCheckPhone = {
  data: {
    attributes: ['line_type_intelligence', 'line_type_intelligence', 'line_type_intelligence'],
  },
  kind: 'phone',
};
export const dashboard_VerificationCheckSentilink: VerificationCheckSentilink = {
  data: {},
  kind: 'sentilink',
};
export const dashboard_VerificationCheckStytchDevice: VerificationCheckStytchDevice = {
  data: {},
  kind: 'stytch_device',
};
export const dashboard_WatchlistCheck: WatchlistCheck = {
  id: '5d06a348-6b39-4dbe-bce3-0aeda9dcecc5',
  reasonCodes: ['address_zip_code_does_not_match', 'document_low_match_score_with_selfie', 'name_last_does_not_match'],
  status: 'pending',
};
export const dashboard_WatchlistCheckStatusKind: WatchlistCheckStatusKind = 'error';
export const dashboard_WatchlistEntry: WatchlistEntry = {
  hits: [
    {
      agency: 'sunt Ut',
      agencyAbbr: 'elit incididunt dolor reprehenderit exercitation',
      agencyInformationUrl: 'https://tender-concentration.name/',
      agencyListUrl: 'https://oddball-populist.info/',
      entityAliases: ['sint amet et ex', 'dolor eu magna proident irure', 'Ut'],
      entityName: 'Margaret Boyer',
      listCountry: 'Turkey',
      listName: 'Guadalupe Hintz',
      url: 'https://orderly-step.name',
    },
    {
      agency: 'Lorem tempor',
      agencyAbbr: 'esse tempor proident consequat',
      agencyInformationUrl: 'https://tender-concentration.name/',
      agencyListUrl: 'https://oddball-populist.info/',
      entityAliases: ['in sint', 'aliqua sint Ut eiusmod et', 'labore dolore culpa ut'],
      entityName: 'Margaret Boyer',
      listCountry: 'Turkey',
      listName: 'Guadalupe Hintz',
      url: 'https://orderly-step.name',
    },
    {
      agency: 'ea',
      agencyAbbr: 'reprehenderit magna consectetur',
      agencyInformationUrl: 'https://tender-concentration.name/',
      agencyListUrl: 'https://oddball-populist.info/',
      entityAliases: ['nisi ut et sunt laborum', 'eu nulla', 'in quis in'],
      entityName: 'Margaret Boyer',
      listCountry: 'Turkey',
      listName: 'Guadalupe Hintz',
      url: 'https://orderly-step.name',
    },
  ],
  screenedEntityName: 'Kristi Mitchell',
};
export const dashboard_WatchlistHit: WatchlistHit = {
  agency: 'occaecat minim Excepteur elit dolore',
  agencyAbbr: 'dolor',
  agencyInformationUrl: 'https://frugal-humidity.com/',
  agencyListUrl: 'https://sick-disconnection.name/',
  entityAliases: ['id dolor est consectetur', 'id cillum in', 'Ut eiusmod irure esse'],
  entityName: 'Joseph Powlowski',
  listCountry: 'Greenland',
  listName: 'Luz Olson',
  url: 'https://indelible-custody.net',
};
export const dashboard_WebhookPortalResponse: WebhookPortalResponse = {
  appId: '9f4b76dd-4350-4675-82a6-0fb914b928e8',
  token: '4be15425-befa-4709-ada0-d8733cfe03fd',
  url: 'https://silver-dredger.name/',
};
export const dashboard_WorkflowKind: WorkflowKind = 'kyb';
export const dashboard_WorkflowRequestConfig: WorkflowRequestConfig = {
  data: {
    playbookId: 'd8e6617d-30c7-4c60-877f-e9917c128abc',
    recollectAttributes: ['dob', 'business_kyced_beneficial_owners', 'us_tax_id'],
    reuseExistingBoKyc: true,
  },
  kind: 'onboard',
};
export const dashboard_WorkflowRequestConfigDocument: WorkflowRequestConfigDocument = {
  data: {
    businessConfigs: [
      {
        data: {
          collectSelfie: false,
          documentTypesAndCountries: {
            countrySpecific: {},
            global: ['permit', 'id_card', 'id_card'],
          },
        },
        kind: 'identity',
      },
      {
        data: {
          collectSelfie: true,
          documentTypesAndCountries: {
            countrySpecific: {},
            global: ['id_card', 'id_card', 'drivers_license'],
          },
        },
        kind: 'identity',
      },
      {
        data: {
          collectSelfie: true,
          documentTypesAndCountries: {
            countrySpecific: {},
            global: ['id_card', 'voter_identification', 'drivers_license'],
          },
        },
        kind: 'identity',
      },
    ],
    configs: [
      {
        data: {
          collectSelfie: true,
          documentTypesAndCountries: {
            countrySpecific: {},
            global: ['passport_card', 'passport_card', 'voter_identification'],
          },
        },
        kind: 'identity',
      },
      {
        data: {
          collectSelfie: true,
          documentTypesAndCountries: {
            countrySpecific: {},
            global: ['passport_card', 'passport_card', 'id_card'],
          },
        },
        kind: 'identity',
      },
      {
        data: {
          collectSelfie: false,
          documentTypesAndCountries: {
            countrySpecific: {},
            global: ['passport', 'drivers_license', 'residence_document'],
          },
        },
        kind: 'identity',
      },
    ],
  },
  kind: 'document',
};
export const dashboard_WorkflowRequestConfigOnboard: WorkflowRequestConfigOnboard = {
  data: {
    playbookId: '46361b19-f134-49f5-a5af-7dc9de850981',
    recollectAttributes: ['email', 'business_name', 'phone_number'],
    reuseExistingBoKyc: false,
  },
  kind: 'onboard',
};
export const dashboard_WorkflowSource: WorkflowSource = 'unknown';
export const dashboard_WorkflowStarted: WorkflowStarted = {
  kind: 'document',
  playbook: {
    id: 'b1526656-9e3e-4a7b-810b-02974920798a',
    mustCollectData: ['business_address', 'ssn9', 'bank'],
    name: 'Glenn Balistreri',
  },
  workflowSource: 'tenant',
};
export const dashboard_WorkflowStartedEventKind: WorkflowStartedEventKind = 'playbook';
export const dashboard_WorkflowTriggered: WorkflowTriggered = {
  actor: {
    id: '21200ed0-b4d0-44d6-a342-9f9d2827e58d',
    kind: 'user',
  },
  config: {
    data: {
      playbookId: 'ab17bbfa-4bc8-47b9-968b-b9fd6138018a',
      recollectAttributes: ['business_phone_number', 'us_legal_status', 'us_legal_status'],
      reuseExistingBoKyc: false,
    },
    kind: 'onboard',
  },
  fpId: '37abc640-ae65-4b3d-97e4-6dab15498974',
  note: 'ullamco ex aute amet aliqua',
  requestIsActive: true,
};
