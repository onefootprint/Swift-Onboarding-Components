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
import deepmerge from 'deepmerge';

export const getActionKind = (props: ActionKind): ActionKind => props ?? 'add_primary';

export const getActor = (
  props: Partial<Actor>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): Actor =>
  deepmerge<Actor>(
    {
      id: '790e0e91-7999-45b8-92d6-2c9b6115af8e',
      kind: 'user',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getActorApiKey = (
  props: Partial<ActorApiKey>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): ActorApiKey =>
  deepmerge<ActorApiKey>(
    {
      id: 'f6d41b04-20ac-4b18-9a06-b8abe1c8fb9a',
      kind: 'api_key',
      name: 'Angelina Murray',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getActorFirmEmployee = (
  props: Partial<ActorFirmEmployee>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): ActorFirmEmployee =>
  deepmerge<ActorFirmEmployee>(
    {
      kind: 'firm_employee',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getActorFootprint = (
  props: Partial<ActorFootprint>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): ActorFootprint =>
  deepmerge<ActorFootprint>(
    {
      kind: 'footprint',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getActorOrganization = (
  props: Partial<ActorOrganization>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): ActorOrganization =>
  deepmerge<ActorOrganization>(
    {
      email: 'jon79@gmail.com',
      firstName: 'Raquel',
      kind: 'organization',
      lastName: 'Spinka',
      member: 'exercitation tempor',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getActorUser = (
  props: Partial<ActorUser>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): ActorUser =>
  deepmerge<ActorUser>(
    {
      id: '50c4e2c1-87c1-4ed0-bc9b-bba4aa982c59',
      kind: 'user',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );
export const getAdverseMediaListKind = (props: AdverseMediaListKind): AdverseMediaListKind => props ?? 'cyber_crime';

export const getAmlDetail = (
  props: Partial<AmlDetail>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): AmlDetail =>
  deepmerge<AmlDetail>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getAmlHit = (
  props: Partial<AmlHit>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): AmlHit =>
  deepmerge<AmlHit>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getAmlHitMedia = (
  props: Partial<AmlHitMedia>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): AmlHitMedia =>
  deepmerge<AmlHitMedia>(
    {
      date: '1962-09-15T20:24:01.0Z',
      pdfUrl: 'https://inexperienced-league.us',
      snippet: 'anim ut',
      title: 'officia',
      url: 'https://agreeable-stool.us/',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );
export const getAmlMatchKind = (props: AmlMatchKind): AmlMatchKind => props ?? 'exact_name';

export const getAnnotation = (
  props: Partial<Annotation>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): Annotation =>
  deepmerge<Annotation>(
    {
      id: 'a715ef5a-5c3f-4ffa-8b33-e723e22a5ef2',
      isPinned: false,
      note: 'aute minim voluptate anim occaecat',
      source: {
        id: '3968d23c-b399-43d0-a7f0-781488f80219',
        kind: 'user',
      },
      timestamp: '1905-01-20T23:57:01.0Z',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );
export const getApiKeyStatus = (props: ApiKeyStatus): ApiKeyStatus => props ?? 'enabled';

export const getAssumePartnerRoleRequest = (
  props: Partial<AssumePartnerRoleRequest>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): AssumePartnerRoleRequest =>
  deepmerge<AssumePartnerRoleRequest>(
    {
      partnerTenantId: 'b2d2c462-066a-43cc-9379-06374ec042c3',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getAssumePartnerRoleResponse = (
  props: Partial<AssumePartnerRoleResponse>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): AssumePartnerRoleResponse =>
  deepmerge<AssumePartnerRoleResponse>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getAssumeRoleRequest = (
  props: Partial<AssumeRoleRequest>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): AssumeRoleRequest =>
  deepmerge<AssumeRoleRequest>(
    {
      tenantId: 'f2787f8f-ede9-4215-b8bc-72a3ea02d468',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getAssumeRoleResponse = (
  props: Partial<AssumeRoleResponse>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): AssumeRoleResponse =>
  deepmerge<AssumeRoleResponse>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getAttestedDeviceData = (
  props: Partial<AttestedDeviceData>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): AttestedDeviceData =>
  deepmerge<AttestedDeviceData>(
    {
      appBundleId: '88358cb7-d458-4ea2-a7f2-c3969b28ddd3',
      deviceType: 'ios',
      fraudRisk: 'low',
      model: 'Lorem dolore',
      os: 'ea aliqua ullamco',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getAuditEvent = (
  props: Partial<AuditEvent>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): AuditEvent =>
  deepmerge<AuditEvent>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getAuditEventApiKey = (
  props: Partial<AuditEventApiKey>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): AuditEventApiKey =>
  deepmerge<AuditEventApiKey>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getAuditEventDetail = (
  props: Partial<AuditEventDetail>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): AuditEventDetail =>
  deepmerge<AuditEventDetail>(
    {
      data: {
        createdFields: [
          'document.id_card.issuing_country',
          'document.passport_card.front.image',
          'business.corporation_type',
        ],
        fpId: '1595ebc7-1aa3-492e-a40c-8042c7745d87',
      },
      kind: 'create_user',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getAuditEventDetailCollectUserDocument = (
  props: Partial<AuditEventDetailCollectUserDocument>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): AuditEventDetailCollectUserDocument =>
  deepmerge<AuditEventDetailCollectUserDocument>(
    {
      kind: 'collect_user_document',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getAuditEventDetailCompleteUserCheckLiveness = (
  props: Partial<AuditEventDetailCompleteUserCheckLiveness>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): AuditEventDetailCompleteUserCheckLiveness =>
  deepmerge<AuditEventDetailCompleteUserCheckLiveness>(
    {
      kind: 'complete_user_check_liveness',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getAuditEventDetailCompleteUserCheckWatchlist = (
  props: Partial<AuditEventDetailCompleteUserCheckWatchlist>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): AuditEventDetailCompleteUserCheckWatchlist =>
  deepmerge<AuditEventDetailCompleteUserCheckWatchlist>(
    {
      kind: 'complete_user_check_watchlist',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getAuditEventDetailCompleteUserVerification = (
  props: Partial<AuditEventDetailCompleteUserVerification>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): AuditEventDetailCompleteUserVerification =>
  deepmerge<AuditEventDetailCompleteUserVerification>(
    {
      kind: 'complete_user_verification',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getAuditEventDetailCreateListEntry = (
  props: Partial<AuditEventDetailCreateListEntry>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): AuditEventDetailCreateListEntry =>
  deepmerge<AuditEventDetailCreateListEntry>(
    {
      data: {
        listEntryCreationId: '9f3fbdc0-a348-428e-ad43-9622a052d59c',
        listId: '753b0f6f-bfa8-426e-b8dc-5d55274a9562',
      },
      kind: 'create_list_entry',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getAuditEventDetailCreateOrg = (
  props: Partial<AuditEventDetailCreateOrg>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): AuditEventDetailCreateOrg =>
  deepmerge<AuditEventDetailCreateOrg>(
    {
      kind: 'create_org',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getAuditEventDetailCreateOrgApiKey = (
  props: Partial<AuditEventDetailCreateOrgApiKey>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): AuditEventDetailCreateOrgApiKey =>
  deepmerge<AuditEventDetailCreateOrgApiKey>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getAuditEventDetailCreateOrgRole = (
  props: Partial<AuditEventDetailCreateOrgRole>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): AuditEventDetailCreateOrgRole =>
  deepmerge<AuditEventDetailCreateOrgRole>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getAuditEventDetailCreatePlaybook = (
  props: Partial<AuditEventDetailCreatePlaybook>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): AuditEventDetailCreatePlaybook =>
  deepmerge<AuditEventDetailCreatePlaybook>(
    {
      data: {
        obConfigurationId: '3ecfc294-f88c-4cc1-ad64-9d06724f607f',
      },
      kind: 'create_playbook',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getAuditEventDetailCreateUser = (
  props: Partial<AuditEventDetailCreateUser>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): AuditEventDetailCreateUser =>
  deepmerge<AuditEventDetailCreateUser>(
    {
      data: {
        createdFields: [
          'document.residence_document.issuing_state',
          'card.*.cvc',
          'document.id_card.classified_document_type',
        ],
        fpId: '57bcdd09-2734-43d1-8db7-19eca47c09ee',
      },
      kind: 'create_user',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getAuditEventDetailCreateUserAnnotation = (
  props: Partial<AuditEventDetailCreateUserAnnotation>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): AuditEventDetailCreateUserAnnotation =>
  deepmerge<AuditEventDetailCreateUserAnnotation>(
    {
      kind: 'create_user_annotation',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getAuditEventDetailDeactivateOrgRole = (
  props: Partial<AuditEventDetailDeactivateOrgRole>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): AuditEventDetailDeactivateOrgRole =>
  deepmerge<AuditEventDetailDeactivateOrgRole>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getAuditEventDetailDecryptOrgApiKey = (
  props: Partial<AuditEventDetailDecryptOrgApiKey>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): AuditEventDetailDecryptOrgApiKey =>
  deepmerge<AuditEventDetailDecryptOrgApiKey>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getAuditEventDetailDecryptUserData = (
  props: Partial<AuditEventDetailDecryptUserData>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): AuditEventDetailDecryptUserData =>
  deepmerge<AuditEventDetailDecryptUserData>(
    {
      data: {
        context: 'reflect',
        decryptedFields: ['document.permit.document_number', 'document.passport.issued_at', 'document.visa.gender'],
        fpId: '0b7d884e-b645-4486-a40a-05f4319818bb',
        reason: 'ea ut',
      },
      kind: 'decrypt_user_data',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getAuditEventDetailDeleteListEntry = (
  props: Partial<AuditEventDetailDeleteListEntry>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): AuditEventDetailDeleteListEntry =>
  deepmerge<AuditEventDetailDeleteListEntry>(
    {
      data: {
        listEntryId: '1ccaf27a-61e0-4411-8243-52bd298c98ca',
        listId: 'fc1a62b8-e93e-4fdd-aff9-c01ae91b21c4',
      },
      kind: 'delete_list_entry',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getAuditEventDetailDeleteUser = (
  props: Partial<AuditEventDetailDeleteUser>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): AuditEventDetailDeleteUser =>
  deepmerge<AuditEventDetailDeleteUser>(
    {
      data: {
        fpId: '4727d27a-8250-4052-869e-ea2be5d3017b',
      },
      kind: 'delete_user',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getAuditEventDetailDeleteUserData = (
  props: Partial<AuditEventDetailDeleteUserData>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): AuditEventDetailDeleteUserData =>
  deepmerge<AuditEventDetailDeleteUserData>(
    {
      data: {
        deletedFields: [
          'document.passport.issuing_state',
          'document.passport_card.dob',
          'investor_profile.annual_income',
        ],
        fpId: '051ca946-3d35-4606-899e-76be99c68791',
      },
      kind: 'delete_user_data',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getAuditEventDetailDisablePlaybook = (
  props: Partial<AuditEventDetailDisablePlaybook>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): AuditEventDetailDisablePlaybook =>
  deepmerge<AuditEventDetailDisablePlaybook>(
    {
      kind: 'disable_playbook',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getAuditEventDetailEditPlaybook = (
  props: Partial<AuditEventDetailEditPlaybook>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): AuditEventDetailEditPlaybook =>
  deepmerge<AuditEventDetailEditPlaybook>(
    {
      data: {
        obConfigurationId: 'fa7d1a85-7b91-4add-8562-0595aab3d270',
      },
      kind: 'edit_playbook',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getAuditEventDetailInviteOrgMember = (
  props: Partial<AuditEventDetailInviteOrgMember>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): AuditEventDetailInviteOrgMember =>
  deepmerge<AuditEventDetailInviteOrgMember>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getAuditEventDetailLoginOrgMember = (
  props: Partial<AuditEventDetailLoginOrgMember>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): AuditEventDetailLoginOrgMember =>
  deepmerge<AuditEventDetailLoginOrgMember>(
    {
      kind: 'login_org_member',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getAuditEventDetailManuallyReviewEntity = (
  props: Partial<AuditEventDetailManuallyReviewEntity>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): AuditEventDetailManuallyReviewEntity =>
  deepmerge<AuditEventDetailManuallyReviewEntity>(
    {
      data: {
        decisionStatus: 'step_up',
        fpId: '4a037525-46d5-4bd0-b110-10a334dcd750',
      },
      kind: 'manually_review_entity',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getAuditEventDetailOrgMemberJoined = (
  props: Partial<AuditEventDetailOrgMemberJoined>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): AuditEventDetailOrgMemberJoined =>
  deepmerge<AuditEventDetailOrgMemberJoined>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getAuditEventDetailRemoveOrgMember = (
  props: Partial<AuditEventDetailRemoveOrgMember>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): AuditEventDetailRemoveOrgMember =>
  deepmerge<AuditEventDetailRemoveOrgMember>(
    {
      data: {
        member: {
          email: 'hilbert41@gmail.com',
          firstName: 'Ocie',
          id: '9b3ee70b-bbc9-4c42-89e6-325f7efca8a7',
          lastName: 'Smith',
        },
      },
      kind: 'remove_org_member',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getAuditEventDetailRequestUserData = (
  props: Partial<AuditEventDetailRequestUserData>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): AuditEventDetailRequestUserData =>
  deepmerge<AuditEventDetailRequestUserData>(
    {
      kind: 'request_user_data',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getAuditEventDetailStartUserVerification = (
  props: Partial<AuditEventDetailStartUserVerification>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): AuditEventDetailStartUserVerification =>
  deepmerge<AuditEventDetailStartUserVerification>(
    {
      kind: 'start_user_verification',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getAuditEventDetailUpdateOrgApiKeyRole = (
  props: Partial<AuditEventDetailUpdateOrgApiKeyRole>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): AuditEventDetailUpdateOrgApiKeyRole =>
  deepmerge<AuditEventDetailUpdateOrgApiKeyRole>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getAuditEventDetailUpdateOrgApiKeyStatus = (
  props: Partial<AuditEventDetailUpdateOrgApiKeyStatus>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): AuditEventDetailUpdateOrgApiKeyStatus =>
  deepmerge<AuditEventDetailUpdateOrgApiKeyStatus>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getAuditEventDetailUpdateOrgMember = (
  props: Partial<AuditEventDetailUpdateOrgMember>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): AuditEventDetailUpdateOrgMember =>
  deepmerge<AuditEventDetailUpdateOrgMember>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getAuditEventDetailUpdateOrgRole = (
  props: Partial<AuditEventDetailUpdateOrgRole>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): AuditEventDetailUpdateOrgRole =>
  deepmerge<AuditEventDetailUpdateOrgRole>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getAuditEventDetailUpdateOrgSettings = (
  props: Partial<AuditEventDetailUpdateOrgSettings>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): AuditEventDetailUpdateOrgSettings =>
  deepmerge<AuditEventDetailUpdateOrgSettings>(
    {
      kind: 'update_org_settings',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getAuditEventDetailUpdateUserData = (
  props: Partial<AuditEventDetailUpdateUserData>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): AuditEventDetailUpdateUserData =>
  deepmerge<AuditEventDetailUpdateUserData>(
    {
      data: {
        fpId: '4b632385-7ea4-40b2-bcaa-06e0c24a8022',
        updatedFields: [
          'document.passport_card.full_name',
          'document.passport.classified_document_type',
          'document.voter_identification.issued_at',
        ],
      },
      kind: 'update_user_data',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );
export const getAuditEventName = (props: AuditEventName): AuditEventName => props ?? 'decrypt_user_data';

export const getAuditEventOrgMember = (
  props: Partial<AuditEventOrgMember>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): AuditEventOrgMember =>
  deepmerge<AuditEventOrgMember>(
    {
      email: 'helga42@gmail.com',
      firstName: 'Esteban',
      id: '1279605f-4d2b-4a82-8583-686ee9db76a0',
      lastName: 'Rau',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getAuthEvent = (
  props: Partial<AuthEvent>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): AuthEvent =>
  deepmerge<AuthEvent>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );
export const getAuthEventKind = (props: AuthEventKind): AuthEventKind => props ?? 'third_party';
export const getAuthMethodKind = (props: AuthMethodKind): AuthMethodKind => props ?? 'email';

export const getAuthMethodUpdated = (
  props: Partial<AuthMethodUpdated>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): AuthMethodUpdated =>
  deepmerge<AuthMethodUpdated>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getAuthOrgMember = (
  props: Partial<AuthOrgMember>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): AuthOrgMember =>
  deepmerge<AuthOrgMember>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );
export const getBooleanOperator = (props: BooleanOperator): BooleanOperator => props ?? 'not_eq';

export const getBusinessDetail = (
  props: Partial<BusinessDetail>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): BusinessDetail =>
  deepmerge<BusinessDetail>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getBusinessInsights = (
  props: Partial<BusinessInsights>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): BusinessInsights =>
  deepmerge<BusinessInsights>(
    {
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
                entityAliases: [
                  'ea ut deserunt',
                  'sed ipsum Duis',
                  'tempor eiusmod adipisicing exercitation voluptate',
                ],
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );
export const getBusinessOwnerKind = (props: BusinessOwnerKind): BusinessOwnerKind => props ?? 'primary';
export const getBusinessOwnerSource = (props: BusinessOwnerSource): BusinessOwnerSource => props ?? 'hosted';
export const getCipKind = (props: CipKind): CipKind => props ?? 'alpaca';

export const getClientDecryptRequest = (
  props: Partial<ClientDecryptRequest>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): ClientDecryptRequest =>
  deepmerge<ClientDecryptRequest>(
    {
      fields: ['id.first_name', 'document.drivers_license.selfie.mime_type', 'document.id_card.front.image'],
      reason: 'eiusmod',
      transforms: ['to_uppercase', 'suffix(<n>)', 'to_uppercase'],
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getClientIdentity = (
  props: Partial<ClientIdentity>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): ClientIdentity =>
  deepmerge<ClientIdentity>(
    {
      certificate: 'culpa occaecat Excepteur',
      key: 'f7752ed0-942f-445a-9c3a-b5f33f488892',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );
export const getCollectedDataOption = (props: CollectedDataOption): CollectedDataOption => props ?? 'ssn4';
export const getCompanySize = (props: CompanySize): CompanySize => props ?? 's101_to1000';

export const getComplianceCompanySummary = (
  props: Partial<ComplianceCompanySummary>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): ComplianceCompanySummary =>
  deepmerge<ComplianceCompanySummary>(
    {
      companyName: 'Essie Blanda',
      id: 'f08e780f-8e88-4e96-9dc0-782e12f26287',
      numActivePlaybooks: 28298580,
      numControlsComplete: 41501285,
      numControlsTotal: -13167131,
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getComplianceDocData = (
  props: Partial<ComplianceDocData>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): ComplianceDocData =>
  deepmerge<ComplianceDocData>(
    {
      data: {
        url: 'https://hateful-shipper.name',
      },
      kind: 'external_url',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getComplianceDocDataExternalUrl = (
  props: Partial<ComplianceDocDataExternalUrl>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): ComplianceDocDataExternalUrl =>
  deepmerge<ComplianceDocDataExternalUrl>(
    {
      data: {
        url: 'https://alienated-ownership.org/',
      },
      kind: 'external_url',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getComplianceDocDataFileUpload = (
  props: Partial<ComplianceDocDataFileUpload>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): ComplianceDocDataFileUpload =>
  deepmerge<ComplianceDocDataFileUpload>(
    {
      data: {
        data: 'reprehenderit cupidatat',
        filename: 'Mrs. Joanne Bernhard',
      },
      kind: 'file_upload',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );
export const getComplianceDocDataKind = (props: ComplianceDocDataKind): ComplianceDocDataKind => props ?? 'file_upload';

export const getComplianceDocEvent = (
  props: Partial<ComplianceDocEvent>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): ComplianceDocEvent =>
  deepmerge<ComplianceDocEvent>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getComplianceDocEventAssigned = (
  props: Partial<ComplianceDocEventAssigned>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): ComplianceDocEventAssigned =>
  deepmerge<ComplianceDocEventAssigned>(
    {
      assignedTo: {
        org: 'quis',
        user: {
          firstName: 'Stanford',
          id: 'a33f0671-3ae3-4acc-9300-aecf75ec7b87',
          lastName: 'Gottlieb',
        },
      },
      kind: 'tenant',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getComplianceDocEventRequested = (
  props: Partial<ComplianceDocEventRequested>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): ComplianceDocEventRequested =>
  deepmerge<ComplianceDocEventRequested>(
    {
      description: 'veniam esse',
      name: 'Darrell Bergstrom',
      templateId: '86b944f9-84a9-4744-b433-6c6e1f9dce83',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getComplianceDocEventReviewed = (
  props: Partial<ComplianceDocEventReviewed>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): ComplianceDocEventReviewed =>
  deepmerge<ComplianceDocEventReviewed>(
    {
      decision: 'accepted',
      note: 'et eu tempor',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getComplianceDocEventSubmitted = (
  props: Partial<ComplianceDocEventSubmitted>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): ComplianceDocEventSubmitted =>
  deepmerge<ComplianceDocEventSubmitted>(
    {
      kind: 'file_upload',
      submissionId: '1b58bf09-c7cb-49ac-afce-f7cb07638dc0',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getComplianceDocEventType = (
  props: Partial<ComplianceDocEventType>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): ComplianceDocEventType =>
  deepmerge<ComplianceDocEventType>(
    {
      data: {
        description: 'elit occaecat magna',
        name: 'Marcella Beatty',
        templateId: 'f824ba64-b197-4620-b9cc-5403e7a66bdd',
      },
      kind: 'requested',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getComplianceDocEventTypeAssigned = (
  props: Partial<ComplianceDocEventTypeAssigned>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): ComplianceDocEventTypeAssigned =>
  deepmerge<ComplianceDocEventTypeAssigned>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getComplianceDocEventTypeRequestRetracted = (
  props: Partial<ComplianceDocEventTypeRequestRetracted>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): ComplianceDocEventTypeRequestRetracted =>
  deepmerge<ComplianceDocEventTypeRequestRetracted>(
    {
      data: {},
      kind: 'request_retracted',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getComplianceDocEventTypeRequested = (
  props: Partial<ComplianceDocEventTypeRequested>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): ComplianceDocEventTypeRequested =>
  deepmerge<ComplianceDocEventTypeRequested>(
    {
      data: {
        description: 'irure reprehenderit minim consectetur labore',
        name: 'Jake Barrows',
        templateId: '66e8a3d4-4539-47ca-a9d6-ea837f8f6a66',
      },
      kind: 'requested',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getComplianceDocEventTypeReviewed = (
  props: Partial<ComplianceDocEventTypeReviewed>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): ComplianceDocEventTypeReviewed =>
  deepmerge<ComplianceDocEventTypeReviewed>(
    {
      data: {
        decision: 'rejected',
        note: 'est nostrud Lorem',
      },
      kind: 'reviewed',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getComplianceDocEventTypeSubmitted = (
  props: Partial<ComplianceDocEventTypeSubmitted>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): ComplianceDocEventTypeSubmitted =>
  deepmerge<ComplianceDocEventTypeSubmitted>(
    {
      data: {
        kind: 'file_upload',
        submissionId: 'b93b6955-f4b0-4cbb-802b-e76297110145',
      },
      kind: 'submitted',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );
export const getComplianceDocReviewDecision = (props: ComplianceDocReviewDecision): ComplianceDocReviewDecision =>
  props ?? 'rejected';
export const getComplianceDocStatus = (props: ComplianceDocStatus): ComplianceDocStatus =>
  props ?? 'waiting_for_upload';

export const getComplianceDocSubmission = (
  props: Partial<ComplianceDocSubmission>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): ComplianceDocSubmission =>
  deepmerge<ComplianceDocSubmission>(
    {
      createdAt: '1895-09-11T09:40:07.0Z',
      data: {
        data: {
          url: 'https://earnest-casket.info/',
        },
        kind: 'external_url',
      },
      id: 'dcca6c41-182f-4c7d-b303-fc7253ca63e5',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getComplianceDocSummary = (
  props: Partial<ComplianceDocSummary>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): ComplianceDocSummary =>
  deepmerge<ComplianceDocSummary>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getComplianceDocTemplate = (
  props: Partial<ComplianceDocTemplate>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): ComplianceDocTemplate =>
  deepmerge<ComplianceDocTemplate>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getComplianceDocTemplateVersion = (
  props: Partial<ComplianceDocTemplateVersion>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): ComplianceDocTemplateVersion =>
  deepmerge<ComplianceDocTemplateVersion>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );
export const getContactInfoKind = (props: ContactInfoKind): ContactInfoKind => props ?? 'email';

export const getCopyPlaybookRequest = (
  props: Partial<CopyPlaybookRequest>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): CopyPlaybookRequest =>
  deepmerge<CopyPlaybookRequest>(
    {
      isLive: true,
      name: 'Elsa Pfeffer',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getCountrySpecificDocumentMapping = (
  props: Partial<CountrySpecificDocumentMapping>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): CountrySpecificDocumentMapping =>
  deepmerge<CountrySpecificDocumentMapping>({}, props, {
    ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}),
  });

export const getCreateAnnotationRequest = (
  props: Partial<CreateAnnotationRequest>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): CreateAnnotationRequest =>
  deepmerge<CreateAnnotationRequest>(
    {
      isPinned: false,
      note: 'culpa occaecat',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getCreateApiKeyRequest = (
  props: Partial<CreateApiKeyRequest>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): CreateApiKeyRequest =>
  deepmerge<CreateApiKeyRequest>(
    {
      name: 'Mark Effertz',
      roleId: 'eb28970f-0d62-4233-851d-6ebe78dac89a',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getCreateComplianceDocRequest = (
  props: Partial<CreateComplianceDocRequest>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): CreateComplianceDocRequest =>
  deepmerge<CreateComplianceDocRequest>(
    {
      description: 'in tempor consequat',
      name: 'Mrs. Kristie Konopelski II',
      templateVersionId: '120ae062-b678-420c-b9dd-b75d74a4f5ae',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getCreateComplianceDocTemplateRequest = (
  props: Partial<CreateComplianceDocTemplateRequest>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): CreateComplianceDocTemplateRequest =>
  deepmerge<CreateComplianceDocTemplateRequest>(
    {
      description: 'Duis enim',
      name: 'Stephen Douglas',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getCreateEntityTokenRequest = (
  props: Partial<CreateEntityTokenRequest>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): CreateEntityTokenRequest =>
  deepmerge<CreateEntityTokenRequest>(
    {
      key: 'a2952dd1-4d4c-4016-be89-ddf23dc6f803',
      kind: 'onboard',
      sendLink: true,
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getCreateEntityTokenResponse = (
  props: Partial<CreateEntityTokenResponse>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): CreateEntityTokenResponse =>
  deepmerge<CreateEntityTokenResponse>(
    {
      deliveryMethod: 'phone',
      expiresAt: '1948-05-11T18:27:40.0Z',
      link: 'voluptate',
      token: 'f1c6c7c1-c8bc-45db-9adc-56b9ec4bf71f',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getCreateKycLinksRequest = (
  props: Partial<CreateKycLinksRequest>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): CreateKycLinksRequest =>
  deepmerge<CreateKycLinksRequest>(
    {
      sendToBoIds: ['Lorem', 'occaecat sit in nostrud', 'amet'],
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getCreateListEntryRequest = (
  props: Partial<CreateListEntryRequest>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): CreateListEntryRequest =>
  deepmerge<CreateListEntryRequest>(
    {
      entries: ['ut magna in ut Duis', 'nostrud aliqua sit aliquip magna', 'sit occaecat exercitation'],
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getCreateListRequest = (
  props: Partial<CreateListRequest>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): CreateListRequest =>
  deepmerge<CreateListRequest>(
    {
      alias: 'nisi et ut exercitation',
      entries: ['elit nulla', 'in', 'irure enim exercitation'],
      kind: 'phone_country_code',
      name: "Terri D'Amore",
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getCreateOnboardingConfigurationRequest = (
  props: Partial<CreateOnboardingConfigurationRequest>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): CreateOnboardingConfigurationRequest =>
  deepmerge<CreateOnboardingConfigurationRequest>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getCreateOrgFrequentNoteRequest = (
  props: Partial<CreateOrgFrequentNoteRequest>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): CreateOrgFrequentNoteRequest =>
  deepmerge<CreateOrgFrequentNoteRequest>(
    {
      content: 'Excepteur culpa',
      kind: 'annotation',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getCreateOrgTenantTagRequest = (
  props: Partial<CreateOrgTenantTagRequest>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): CreateOrgTenantTagRequest =>
  deepmerge<CreateOrgTenantTagRequest>(
    {
      kind: 'person',
      tag: 'nulla est anim',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getCreatePlaybookVersionRequest = (
  props: Partial<CreatePlaybookVersionRequest>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): CreatePlaybookVersionRequest =>
  deepmerge<CreatePlaybookVersionRequest>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getCreateProxyConfigRequest = (
  props: Partial<CreateProxyConfigRequest>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): CreateProxyConfigRequest =>
  deepmerge<CreateProxyConfigRequest>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getCreateReviewRequest = (
  props: Partial<CreateReviewRequest>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): CreateReviewRequest =>
  deepmerge<CreateReviewRequest>(
    {
      decision: 'accepted',
      note: 'occaecat Duis',
      submissionId: 'fa0c75cb-76ca-4d65-ac83-3c126f28cd34',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getCreateRule = (
  props: Partial<CreateRule>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): CreateRule =>
  deepmerge<CreateRule>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getCreateTagRequest = (
  props: Partial<CreateTagRequest>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): CreateTagRequest =>
  deepmerge<CreateTagRequest>(
    {
      tag: 'veniam et do',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getCreateTenantAndroidAppMetaRequest = (
  props: Partial<CreateTenantAndroidAppMetaRequest>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): CreateTenantAndroidAppMetaRequest =>
  deepmerge<CreateTenantAndroidAppMetaRequest>(
    {
      apkCertSha256S: ['est voluptate occaecat eu amet', 'nostrud proident', 'Lorem'],
      integrityDecryptionKey: '534aaa55-b14f-47d2-bf10-2a4a3ee045aa',
      integrityVerificationKey: '696bb606-c86d-40c6-a513-84ed5431aca2',
      packageNames: ['tempor', 'consectetur', 'Excepteur quis pariatur mollit'],
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getCreateTenantIosAppMetaRequest = (
  props: Partial<CreateTenantIosAppMetaRequest>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): CreateTenantIosAppMetaRequest =>
  deepmerge<CreateTenantIosAppMetaRequest>(
    {
      appBundleIds: ['exercitation ea ullamco adipisicing', 'aliquip', 'laboris minim tempor'],
      deviceCheckKeyId: 'f63d8231-1bcc-41ff-931e-75974574a3b7',
      deviceCheckPrivateKey: 'e0dec18f-7cdf-41a6-bad8-f970cd272da9',
      teamId: '028fb068-cfe1-4ada-a0e3-e06d5f8869e5',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getCreateTenantRoleRequest = (
  props: Partial<CreateTenantRoleRequest>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): CreateTenantRoleRequest =>
  deepmerge<CreateTenantRoleRequest>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getCreateTenantUserRequest = (
  props: Partial<CreateTenantUserRequest>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): CreateTenantUserRequest =>
  deepmerge<CreateTenantUserRequest>(
    {
      email: 'maeve94@gmail.com',
      firstName: 'Ewell',
      lastName: 'Hagenes',
      omitEmailInvite: true,
      redirectUrl: 'https://gullible-soup.net',
      roleId: '1947aac2-7c90-4c10-8cc0-ae78cfb206ad',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getCreateTokenResponse = (
  props: Partial<CreateTokenResponse>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): CreateTokenResponse =>
  deepmerge<CreateTokenResponse>(
    {
      expiresAt: '1916-08-06T07:48:41.0Z',
      link: 'minim id',
      token: '0e29d8e2-2ac6-496d-bab1-c8b6373287a3',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getCursorPaginatedAuditEvent = (
  props: Partial<CursorPaginatedAuditEvent>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): CursorPaginatedAuditEvent =>
  deepmerge<CursorPaginatedAuditEvent>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getCursorPaginatedEntity = (
  props: Partial<CursorPaginatedEntity>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): CursorPaginatedEntity =>
  deepmerge<CursorPaginatedEntity>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getCursorPaginatedListEvent = (
  props: Partial<CursorPaginatedListEvent>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): CursorPaginatedListEvent =>
  deepmerge<CursorPaginatedListEvent>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getCustomDocumentConfig = (
  props: Partial<CustomDocumentConfig>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): CustomDocumentConfig =>
  deepmerge<CustomDocumentConfig>(
    {
      description: 'voluptate veniam',
      identifier: 'document.id_card.clave_de_elector',
      name: 'Nicolas Ward',
      requiresHumanReview: false,
      uploadSettings: 'capture_only_on_mobile',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getDashboardSecretApiKey = (
  props: Partial<DashboardSecretApiKey>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): DashboardSecretApiKey =>
  deepmerge<DashboardSecretApiKey>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );
export const getDataAttributeKind = (props: DataAttributeKind): DataAttributeKind => props ?? 'document_data';

export const getDataCollectedInfo = (
  props: Partial<DataCollectedInfo>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): DataCollectedInfo =>
  deepmerge<DataCollectedInfo>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );
export const getDataIdentifier = (props: DataIdentifier): DataIdentifier => props ?? 'business.formation_date';
export const getDataLifetimeSource = (props: DataLifetimeSource): DataLifetimeSource => props ?? 'client_tenant';

export const getDbActor = (
  props: Partial<DbActor>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): DbActor =>
  deepmerge<DbActor>(
    {
      data: {
        id: '719f959a-47e9-457f-9fae-cf2cd8b5226b',
      },
      kind: 'user',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getDbActorFirmEmployee = (
  props: Partial<DbActorFirmEmployee>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): DbActorFirmEmployee =>
  deepmerge<DbActorFirmEmployee>(
    {
      data: {
        id: 'ed3ae1e2-6b10-4f82-a632-42caf2fd31d5',
      },
      kind: 'firm_employee',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getDbActorFootprint = (
  props: Partial<DbActorFootprint>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): DbActorFootprint =>
  deepmerge<DbActorFootprint>(
    {
      kind: 'footprint',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getDbActorTenantApiKey = (
  props: Partial<DbActorTenantApiKey>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): DbActorTenantApiKey =>
  deepmerge<DbActorTenantApiKey>(
    {
      data: {
        id: '39e3b751-3ba1-4f24-acc3-6d82efbe1a4f',
      },
      kind: 'tenant_api_key',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getDbActorTenantUser = (
  props: Partial<DbActorTenantUser>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): DbActorTenantUser =>
  deepmerge<DbActorTenantUser>(
    {
      data: {
        id: 'd0203384-f90c-4e21-9df8-f7a94bd24e6c',
      },
      kind: 'tenant_user',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getDbActorUser = (
  props: Partial<DbActorUser>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): DbActorUser =>
  deepmerge<DbActorUser>(
    {
      data: {
        id: 'a3acb3a5-d85b-4453-a22c-972fc4b8f18a',
      },
      kind: 'user',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );
export const getDecisionStatus = (props: DecisionStatus): DecisionStatus => props ?? 'fail';
export const getDecryptionContext = (props: DecryptionContext): DecryptionContext => props ?? 'vault_proxy';

export const getDeleteRequest = (
  props: Partial<DeleteRequest>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): DeleteRequest =>
  deepmerge<DeleteRequest>(
    {
      deleteAll: false,
      fields: [
        'document.residence_document.full_name',
        'document.residence_document.selfie.mime_type',
        'document.id_card.curp_validation_response',
      ],
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );
export const getDeviceFraudRiskLevel = (props: DeviceFraudRiskLevel): DeviceFraudRiskLevel => props ?? 'medium';
export const getDeviceInsightField = (props: DeviceInsightField): DeviceInsightField => props ?? 'ip_address';

export const getDeviceInsightOperation = (
  props: Partial<DeviceInsightOperation>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): DeviceInsightOperation =>
  deepmerge<DeviceInsightOperation>(
    {
      field: 'ip_address',
      op: 'is_in',
      value: 'anim commodo nulla dolor consectetur',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );
export const getDeviceType = (props: DeviceType): DeviceType => props ?? 'android';

export const getDocsTokenResponse = (
  props: Partial<DocsTokenResponse>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): DocsTokenResponse =>
  deepmerge<DocsTokenResponse>(
    {
      token: 'ad6eb44f-437d-4e0d-8189-d159bb330d6f',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getDocument = (
  props: Partial<Document>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): Document =>
  deepmerge<Document>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getDocumentAndCountryConfiguration = (
  props: Partial<DocumentAndCountryConfiguration>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): DocumentAndCountryConfiguration =>
  deepmerge<DocumentAndCountryConfiguration>(
    {
      countrySpecific: {},
      global: ['visa', 'voter_identification', 'passport_card'],
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );
export const getDocumentImageError = (props: DocumentImageError): DocumentImageError => props ?? 'barcode_not_detected';
export const getDocumentKind = (props: DocumentKind): DocumentKind => props ?? 'drivers_license';

export const getDocumentRequest = (
  props: Partial<DocumentRequest>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): DocumentRequest =>
  deepmerge<DocumentRequest>(
    {
      kind: 'proof_of_ssn',
      ruleSetResultId: 'b72de1a0-be5c-46e8-9d0e-e87526c715de',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getDocumentRequestConfig = (
  props: Partial<DocumentRequestConfig>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): DocumentRequestConfig =>
  deepmerge<DocumentRequestConfig>(
    {
      data: {
        collectSelfie: true,
        documentTypesAndCountries: {
          countrySpecific: {},
          global: ['voter_identification', 'id_card', 'passport'],
        },
      },
      kind: 'identity',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getDocumentRequestConfigCustom = (
  props: Partial<DocumentRequestConfigCustom>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): DocumentRequestConfigCustom =>
  deepmerge<DocumentRequestConfigCustom>(
    {
      data: {
        description: 'dolor laborum labore',
        identifier: 'custom.*',
        name: 'Jodi McDermott',
        requiresHumanReview: true,
        uploadSettings: 'capture_only_on_mobile',
      },
      kind: 'custom',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getDocumentRequestConfigIdentity = (
  props: Partial<DocumentRequestConfigIdentity>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): DocumentRequestConfigIdentity =>
  deepmerge<DocumentRequestConfigIdentity>(
    {
      data: {
        collectSelfie: false,
        documentTypesAndCountries: {
          countrySpecific: {},
          global: ['permit', 'permit', 'id_card'],
        },
      },
      kind: 'identity',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getDocumentRequestConfigProofOfAddress = (
  props: Partial<DocumentRequestConfigProofOfAddress>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): DocumentRequestConfigProofOfAddress =>
  deepmerge<DocumentRequestConfigProofOfAddress>(
    {
      data: {
        requiresHumanReview: true,
      },
      kind: 'proof_of_address',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getDocumentRequestConfigProofOfSsn = (
  props: Partial<DocumentRequestConfigProofOfSsn>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): DocumentRequestConfigProofOfSsn =>
  deepmerge<DocumentRequestConfigProofOfSsn>(
    {
      data: {
        requiresHumanReview: true,
      },
      kind: 'proof_of_ssn',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );
export const getDocumentRequestKind = (props: DocumentRequestKind): DocumentRequestKind => props ?? 'identity';
export const getDocumentReviewStatus = (props: DocumentReviewStatus): DocumentReviewStatus =>
  props ?? 'pending_human_review';
export const getDocumentSide = (props: DocumentSide): DocumentSide => props ?? 'selfie';
export const getDocumentStatus = (props: DocumentStatus): DocumentStatus => props ?? 'pending';

export const getDocumentUpload = (
  props: Partial<DocumentUpload>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): DocumentUpload =>
  deepmerge<DocumentUpload>(
    {
      failureReasons: ['selfie_face_not_found', 'image_error', 'invalid_jpeg'],
      identifier: 'document.residence_document.gender',
      isExtraCompressed: false,
      side: 'front',
      timestamp: '1953-12-02T15:26:23.0Z',
      version: 93080216,
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );
export const getDocumentUploadSettings = (props: DocumentUploadSettings): DocumentUploadSettings =>
  props ?? 'prefer_capture';

export const getDocumentUploadedTimelineEvent = (
  props: Partial<DocumentUploadedTimelineEvent>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): DocumentUploadedTimelineEvent =>
  deepmerge<DocumentUploadedTimelineEvent>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );
export const getDupeKind = (props: DupeKind): DupeKind => props ?? 'cookie_id';

export const getDupes = (
  props: Partial<Dupes>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): Dupes =>
  deepmerge<Dupes>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getEditRule = (
  props: Partial<EditRule>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): EditRule =>
  deepmerge<EditRule>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getEmpty = (
  props: Partial<Empty>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): Empty =>
  deepmerge<Empty>({}, props, {
    ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}),
  });

export const getEnclaveHealthResponse = (
  props: Partial<EnclaveHealthResponse>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): EnclaveHealthResponse =>
  deepmerge<EnclaveHealthResponse>(
    {
      decryptMs: -18567333,
      keypairGenMs: -41244421,
      success: false,
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getEnhancedAml = (
  props: Partial<EnhancedAml>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): EnhancedAml =>
  deepmerge<EnhancedAml>(
    {
      adverseMedia: false,
      enhancedAml: true,
      matchKind: 'fuzzy_medium',
      ofac: false,
      pep: true,
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getEntity = (
  props: Partial<Entity>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): Entity =>
  deepmerge<Entity>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getEntityAction = (
  props: Partial<EntityAction>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): EntityAction =>
  deepmerge<EntityAction>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getEntityActionClearReview = (
  props: Partial<EntityActionClearReview>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): EntityActionClearReview =>
  deepmerge<EntityActionClearReview>(
    {
      kind: 'clear_review',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getEntityActionManualDecision = (
  props: Partial<EntityActionManualDecision>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): EntityActionManualDecision =>
  deepmerge<EntityActionManualDecision>(
    {
      annotation: {
        isPinned: false,
        note: 'proident aute voluptate est',
      },
      kind: 'manual_decision',
      status: 'pass',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getEntityActionResponse = (
  props: Partial<EntityActionResponse>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): EntityActionResponse =>
  deepmerge<EntityActionResponse>(
    {
      expiresAt: '1917-10-30T15:03:11.0Z',
      kind: 'trigger',
      link: 'fugiat adipisicing anim et enim',
      token: 'de8a5133-091c-4879-b82e-d3e27a7def31',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getEntityActionResponseTrigger = (
  props: Partial<EntityActionResponseTrigger>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): EntityActionResponseTrigger =>
  deepmerge<EntityActionResponseTrigger>(
    {
      expiresAt: '1936-03-22T16:13:45.0Z',
      kind: 'trigger',
      link: 'dolore culpa',
      token: '44cb927d-71e5-4e9c-a2a4-73824bc3f3ce',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getEntityActionTrigger = (
  props: Partial<EntityActionTrigger>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): EntityActionTrigger =>
  deepmerge<EntityActionTrigger>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getEntityActionsRequest = (
  props: Partial<EntityActionsRequest>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): EntityActionsRequest =>
  deepmerge<EntityActionsRequest>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getEntityAttribute = (
  props: Partial<EntityAttribute>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): EntityAttribute =>
  deepmerge<EntityAttribute>(
    {
      dataKind: 'document_data',
      identifier: 'document.visa.full_name',
      isDecryptable: true,
      source: 'vendor',
      transforms: {},
      value: 'tempor consequat',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getEntityOnboarding = (
  props: Partial<EntityOnboarding>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): EntityOnboarding =>
  deepmerge<EntityOnboarding>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getEntityOnboardingRuleSetResult = (
  props: Partial<EntityOnboardingRuleSetResult>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): EntityOnboardingRuleSetResult =>
  deepmerge<EntityOnboardingRuleSetResult>(
    {
      id: 'd63c3f7e-bc44-49fc-80ed-ff85ba335f82',
      timestamp: '1911-04-21T17:21:45.0Z',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );
export const getEntityStatus = (props: EntityStatus): EntityStatus => props ?? 'pass';

export const getEntityWorkflow = (
  props: Partial<EntityWorkflow>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): EntityWorkflow =>
  deepmerge<EntityWorkflow>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );
export const getEquals = (props: Equals): Equals => props ?? 'not_eq';

export const getEvaluateRuleRequest = (
  props: Partial<EvaluateRuleRequest>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): EvaluateRuleRequest =>
  deepmerge<EvaluateRuleRequest>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getExternalIntegrationCalled = (
  props: Partial<ExternalIntegrationCalled>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): ExternalIntegrationCalled =>
  deepmerge<ExternalIntegrationCalled>(
    {
      externalId: 'b4baf450-9bee-457b-8c56-352779ab941c',
      integration: 'alpaca_cip',
      successful: true,
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );
export const getExternalIntegrationKind = (props: ExternalIntegrationKind): ExternalIntegrationKind =>
  props ?? 'alpaca_cip';

export const getFieldValidation = (
  props: Partial<FieldValidation>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): FieldValidation =>
  deepmerge<FieldValidation>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getFieldValidationDetail = (
  props: Partial<FieldValidationDetail>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): FieldValidationDetail =>
  deepmerge<FieldValidationDetail>(
    {
      description: 'elit do',
      matchLevel: 'no_match',
      note: 'aliquip',
      reasonCode: 'document_possible_image_alteration_back',
      severity: 'low',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );
export const getFilterFunction = (props: FilterFunction): FilterFunction =>
  props ?? "encrypt('<algorithm>','<public_key>')";
export const getFootprintReasonCode = (props: FootprintReasonCode): FootprintReasonCode =>
  props ?? 'watchlist_hit_ofac';

export const getGetClientTokenResponse = (
  props: Partial<GetClientTokenResponse>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): GetClientTokenResponse =>
  deepmerge<GetClientTokenResponse>(
    {
      expiresAt: '1903-12-25T09:17:55.0Z',
      tenant: {
        name: 'Della Friesen',
      },
      vaultFields: [
        'document.voter_identification.last_name',
        'document.residence_document.curp',
        'document.id_card.issued_at',
      ],
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getGetClientTokenResponseTenant = (
  props: Partial<GetClientTokenResponseTenant>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): GetClientTokenResponseTenant =>
  deepmerge<GetClientTokenResponseTenant>(
    {
      name: 'Doyle Thompson',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getGetFieldValidationResponse = (
  props: Partial<GetFieldValidationResponse>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): GetFieldValidationResponse =>
  deepmerge<GetFieldValidationResponse>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getGetUserVaultResponse = (
  props: Partial<GetUserVaultResponse>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): GetUserVaultResponse =>
  deepmerge<GetUserVaultResponse>(
    {
      key: 'document.visa.issuing_state',
      value: true,
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );
export const getIdDocKind = (props: IdDocKind): IdDocKind => props ?? 'voter_identification';
export const getIdentifyScope = (props: IdentifyScope): IdentifyScope => props ?? 'auth';

export const getInProgressOnboarding = (
  props: Partial<InProgressOnboarding>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): InProgressOnboarding =>
  deepmerge<InProgressOnboarding>(
    {
      fpId: '8b0242b1-7860-4fd8-aa48-efe5b89adad2',
      status: 'pending',
      tenant: {
        name: 'Robert Prohaska',
        websiteUrl: 'https://considerate-nightlife.net',
      },
      timestamp: '1909-10-13T04:50:14.0Z',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getInProgressOnboardingTenant = (
  props: Partial<InProgressOnboardingTenant>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): InProgressOnboardingTenant =>
  deepmerge<InProgressOnboardingTenant>(
    {
      name: 'George Kutch',
      websiteUrl: 'https://comfortable-plastic.biz',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getIngressSettings = (
  props: Partial<IngressSettings>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): IngressSettings =>
  deepmerge<IngressSettings>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getInsightAddress = (
  props: Partial<InsightAddress>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): InsightAddress =>
  deepmerge<InsightAddress>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getInsightBusinessName = (
  props: Partial<InsightBusinessName>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): InsightBusinessName =>
  deepmerge<InsightBusinessName>(
    {
      kind: 'ea',
      name: 'Archie Walter Jr.',
      sources: 'est exercitation sed',
      subStatus: 'occaecat dolor enim',
      submitted: false,
      verified: false,
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getInsightEvent = (
  props: Partial<InsightEvent>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): InsightEvent =>
  deepmerge<InsightEvent>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getInsightPerson = (
  props: Partial<InsightPerson>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): InsightPerson =>
  deepmerge<InsightPerson>(
    {
      associationVerified: false,
      name: 'Deborah DuBuque',
      role: 'proident consectetur exercitation',
      sources: 'officia',
      submitted: false,
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getInsightPhone = (
  props: Partial<InsightPhone>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): InsightPhone =>
  deepmerge<InsightPhone>(
    {
      phone: '+16544282343',
      submitted: true,
      verified: false,
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getInsightRegistration = (
  props: Partial<InsightRegistration>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): InsightRegistration =>
  deepmerge<InsightRegistration>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getInsightTin = (
  props: Partial<InsightTin>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): InsightTin =>
  deepmerge<InsightTin>(
    {
      tin: 'laborum',
      verified: true,
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getInsightWatchlist = (
  props: Partial<InsightWatchlist>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): InsightWatchlist =>
  deepmerge<InsightWatchlist>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getInsightWebsite = (
  props: Partial<InsightWebsite>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): InsightWebsite =>
  deepmerge<InsightWebsite>(
    {
      url: 'https://helpful-finding.org/',
      verified: true,
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getIntegrityRequest = (
  props: Partial<IntegrityRequest>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): IntegrityRequest =>
  deepmerge<IntegrityRequest>(
    {
      fields: ['document.voter_identification.issuing_country', 'document.passport.selfie.mime_type', 'id.ssn9'],
      signingKey: 'bdbd5cd5-598e-41d1-96a5-1caea3889034',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getIntegrityResponse = (
  props: Partial<IntegrityResponse>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): IntegrityResponse =>
  deepmerge<IntegrityResponse>(
    {
      key: 'card.*.number_last4',
      value: {},
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );
export const getInvestorProfileDeclaration = (props: InvestorProfileDeclaration): InvestorProfileDeclaration =>
  props ?? 'senior_political_figure';
export const getInvestorProfileFundingSource = (props: InvestorProfileFundingSource): InvestorProfileFundingSource =>
  props ?? 'investments';
export const getInvestorProfileInvestmentGoal = (props: InvestorProfileInvestmentGoal): InvestorProfileInvestmentGoal =>
  props ?? 'income';

export const getInvoicePreview = (
  props: Partial<InvoicePreview>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): InvoicePreview =>
  deepmerge<InvoicePreview>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getInvokeVaultProxyPermission = (
  props: Partial<InvokeVaultProxyPermission>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): InvokeVaultProxyPermission =>
  deepmerge<InvokeVaultProxyPermission>(
    {
      kind: 'any',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getInvokeVaultProxyPermissionAny = (
  props: Partial<InvokeVaultProxyPermissionAny>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): InvokeVaultProxyPermissionAny =>
  deepmerge<InvokeVaultProxyPermissionAny>(
    {
      kind: 'any',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getInvokeVaultProxyPermissionId = (
  props: Partial<InvokeVaultProxyPermissionId>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): InvokeVaultProxyPermissionId =>
  deepmerge<InvokeVaultProxyPermissionId>(
    {
      id: 'bf06dada-b237-4929-98b9-e260456e1da7',
      kind: 'id',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getInvokeVaultProxyPermissionJustInTime = (
  props: Partial<InvokeVaultProxyPermissionJustInTime>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): InvokeVaultProxyPermissionJustInTime =>
  deepmerge<InvokeVaultProxyPermissionJustInTime>(
    {
      kind: 'just_in_time',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );
export const getIsIn = (props: IsIn): IsIn => props ?? 'is_not_in';
export const getIso3166TwoDigitCountryCode = (props: Iso3166TwoDigitCountryCode): Iso3166TwoDigitCountryCode =>
  props ?? 'GN';

export const getLabelAdded = (
  props: Partial<LabelAdded>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): LabelAdded =>
  deepmerge<LabelAdded>(
    {
      kind: 'active',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );
export const getLabelKind = (props: LabelKind): LabelKind => props ?? 'active';

export const getLineItem = (
  props: Partial<LineItem>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): LineItem =>
  deepmerge<LineItem>(
    {
      description: 'nostrud in nisi dolor',
      id: '8a2b1e49-8194-4d0b-9e06-8022959cd848',
      notionalCents: -46474882,
      quantity: 31246058,
      unitPriceCents: 'eu Excepteur laboris velit',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getLinkAuthRequest = (
  props: Partial<LinkAuthRequest>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): LinkAuthRequest =>
  deepmerge<LinkAuthRequest>(
    {
      emailAddress: 'jaylen.fahey@gmail.com',
      redirectUrl: 'https://hasty-humor.name',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getList = (props: Partial<List>, options: { overwriteArray: boolean } = { overwriteArray: true }): List =>
  deepmerge<List>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getListDetails = (
  props: Partial<ListDetails>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): ListDetails =>
  deepmerge<ListDetails>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getListEntitiesSearchRequest = (
  props: Partial<ListEntitiesSearchRequest>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): ListEntitiesSearchRequest =>
  deepmerge<ListEntitiesSearchRequest>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getListEntry = (
  props: Partial<ListEntry>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): ListEntry =>
  deepmerge<ListEntry>(
    {
      actor: {
        data: {
          id: '5b092022-7dcf-42a1-a3ef-078fec2ace0e',
        },
        kind: 'user',
      },
      createdAt: '1894-01-30T09:56:30.0Z',
      data: 'tempor',
      id: '10cde94f-4060-4a7a-8d83-14ece0d97093',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getListEvent = (
  props: Partial<ListEvent>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): ListEvent =>
  deepmerge<ListEvent>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getListEventDetail = (
  props: Partial<ListEventDetail>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): ListEventDetail =>
  deepmerge<ListEventDetail>(
    {
      data: {
        entries: ['consectetur dolor deserunt', 'nostrud dolore id Ut', 'in pariatur sunt ea'],
        listEntryCreationId: 'a2d743f7-337a-4300-9d74-72000c803ad7',
        listId: '2a21540f-209c-4391-8845-a8b9dba4fabc',
      },
      kind: 'create_list_entry',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getListEventDetailCreateListEntry = (
  props: Partial<ListEventDetailCreateListEntry>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): ListEventDetailCreateListEntry =>
  deepmerge<ListEventDetailCreateListEntry>(
    {
      data: {
        entries: ['mollit velit', 'dolore incididunt Duis', 'commodo anim'],
        listEntryCreationId: '04f8e8a2-5849-48df-97a9-f60ccb022d91',
        listId: 'ed083548-3c08-4094-926f-3130b275133e',
      },
      kind: 'create_list_entry',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getListEventDetailDeleteListEntry = (
  props: Partial<ListEventDetailDeleteListEntry>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): ListEventDetailDeleteListEntry =>
  deepmerge<ListEventDetailDeleteListEntry>(
    {
      data: {
        entry: 'veniam ad eu',
        listEntryId: 'bf17b809-d859-4bf2-b90b-d6ac27516940',
        listId: '4e3766fb-db0f-45c5-b1b3-7bc2945ef556',
      },
      kind: 'delete_list_entry',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );
export const getListKind = (props: ListKind): ListKind => props ?? 'ip_address';

export const getListPlaybookUsage = (
  props: Partial<ListPlaybookUsage>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): ListPlaybookUsage =>
  deepmerge<ListPlaybookUsage>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getLiteOrgMember = (
  props: Partial<LiteOrgMember>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): LiteOrgMember =>
  deepmerge<LiteOrgMember>(
    {
      firstName: 'Jarret',
      id: '16a13601-e37a-4d2c-9cd6-6c244d9be86e',
      lastName: 'Hirthe',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getLiteUserAndOrg = (
  props: Partial<LiteUserAndOrg>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): LiteUserAndOrg =>
  deepmerge<LiteUserAndOrg>(
    {
      org: 'in id sed nisi',
      user: {
        firstName: 'Evie',
        id: '062a9170-3a03-4526-8f22-e1bc3c8c84dd',
        lastName: 'Pouros',
      },
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getLivenessAttributes = (
  props: Partial<LivenessAttributes>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): LivenessAttributes =>
  deepmerge<LivenessAttributes>(
    {
      device: 'mollit do',
      issuers: ['google', 'footprint', 'apple'],
      metadata: {},
      os: 'ex magna culpa',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getLivenessEvent = (
  props: Partial<LivenessEvent>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): LivenessEvent =>
  deepmerge<LivenessEvent>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );
export const getLivenessIssuer = (props: LivenessIssuer): LivenessIssuer => props ?? 'google';
export const getLivenessSource = (props: LivenessSource): LivenessSource => props ?? 'google_device_attestation';

export const getManualDecisionRequest = (
  props: Partial<ManualDecisionRequest>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): ManualDecisionRequest =>
  deepmerge<ManualDecisionRequest>(
    {
      annotation: {
        isPinned: false,
        note: 'occaecat ut laboris qui sit',
      },
      status: 'pass',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getManualReview = (
  props: Partial<ManualReview>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): ManualReview =>
  deepmerge<ManualReview>(
    {
      kind: 'document_needs_review',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );
export const getManualReviewKind = (props: ManualReviewKind): ManualReviewKind => props ?? 'rule_triggered';
export const getMatchLevel = (props: MatchLevel): MatchLevel => props ?? 'exact';

export const getModernEntityDecryptResponse = (
  props: Partial<ModernEntityDecryptResponse>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): ModernEntityDecryptResponse =>
  deepmerge<ModernEntityDecryptResponse>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getMultiUpdateRuleRequest = (
  props: Partial<MultiUpdateRuleRequest>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): MultiUpdateRuleRequest =>
  deepmerge<MultiUpdateRuleRequest>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );
export const getNumberOperator = (props: NumberOperator): NumberOperator => props ?? 'lt';
export const getObConfigurationKind = (props: ObConfigurationKind): ObConfigurationKind => props ?? 'kyc';

export const getOfficer = (
  props: Partial<Officer>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): Officer =>
  deepmerge<Officer>(
    {
      name: 'Evelyn Green',
      roles: 'ut officia',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getOffsetPaginatedDashboardSecretApiKey = (
  props: Partial<OffsetPaginatedDashboardSecretApiKey>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): OffsetPaginatedDashboardSecretApiKey =>
  deepmerge<OffsetPaginatedDashboardSecretApiKey>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getOffsetPaginatedEntityOnboarding = (
  props: Partial<OffsetPaginatedEntityOnboarding>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): OffsetPaginatedEntityOnboarding =>
  deepmerge<OffsetPaginatedEntityOnboarding>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getOffsetPaginatedList = (
  props: Partial<OffsetPaginatedList>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): OffsetPaginatedList =>
  deepmerge<OffsetPaginatedList>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getOffsetPaginatedOnboardingConfiguration = (
  props: Partial<OffsetPaginatedOnboardingConfiguration>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): OffsetPaginatedOnboardingConfiguration =>
  deepmerge<OffsetPaginatedOnboardingConfiguration>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getOffsetPaginatedOrganizationMember = (
  props: Partial<OffsetPaginatedOrganizationMember>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): OffsetPaginatedOrganizationMember =>
  deepmerge<OffsetPaginatedOrganizationMember>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getOffsetPaginatedOrganizationRole = (
  props: Partial<OffsetPaginatedOrganizationRole>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): OffsetPaginatedOrganizationRole =>
  deepmerge<OffsetPaginatedOrganizationRole>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getOmittedSecretCustomHeader = (
  props: Partial<OmittedSecretCustomHeader>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): OmittedSecretCustomHeader =>
  deepmerge<OmittedSecretCustomHeader>(
    {
      id: '7821881f-74f5-4b6a-b24f-db7bde49e90f',
      name: 'Eleanor Hane',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getOnboardingConfiguration = (
  props: Partial<OnboardingConfiguration>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): OnboardingConfiguration =>
  deepmerge<OnboardingConfiguration>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );
export const getOnboardingStatus = (props: OnboardingStatus): OnboardingStatus => props ?? 'pass';

export const getOnboardingTimelineInfo = (
  props: Partial<OnboardingTimelineInfo>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): OnboardingTimelineInfo =>
  deepmerge<OnboardingTimelineInfo>(
    {
      event: 'sint',
      sessionId: '67060f97-ad17-4a25-818c-c0f5aac0373e',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getOrgClientSecurityConfig = (
  props: Partial<OrgClientSecurityConfig>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): OrgClientSecurityConfig =>
  deepmerge<OrgClientSecurityConfig>(
    {
      allowedOrigins: [
        'quis officia non irure commodo',
        'ipsum cillum sunt nostrud labore',
        'consequat consectetur esse Duis',
      ],
      isLive: true,
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getOrgFrequentNote = (
  props: Partial<OrgFrequentNote>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): OrgFrequentNote =>
  deepmerge<OrgFrequentNote>(
    {
      content: 'ullamco',
      id: '161c635d-7729-4416-972e-050b884a6c4a',
      kind: 'trigger',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getOrgLoginResponse = (
  props: Partial<OrgLoginResponse>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): OrgLoginResponse =>
  deepmerge<OrgLoginResponse>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getOrgMetrics = (
  props: Partial<OrgMetrics>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): OrgMetrics =>
  deepmerge<OrgMetrics>(
    {
      failOnboardings: 24386977,
      incompleteOnboardings: 46734391,
      newVaults: 63547062,
      passOnboardings: 60601036,
      totalOnboardings: 98260186,
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getOrgMetricsResponse = (
  props: Partial<OrgMetricsResponse>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): OrgMetricsResponse =>
  deepmerge<OrgMetricsResponse>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getOrgTenantTag = (
  props: Partial<OrgTenantTag>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): OrgTenantTag =>
  deepmerge<OrgTenantTag>(
    {
      id: '17d19602-9a8e-40ac-bee2-5e44ef2c3a3f',
      kind: 'business',
      tag: 'ut ea laborum ullamco',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getOrganization = (
  props: Partial<Organization>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): Organization =>
  deepmerge<Organization>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getOrganizationMember = (
  props: Partial<OrganizationMember>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): OrganizationMember =>
  deepmerge<OrganizationMember>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getOrganizationRole = (
  props: Partial<OrganizationRole>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): OrganizationRole =>
  deepmerge<OrganizationRole>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getOrganizationRolebinding = (
  props: Partial<OrganizationRolebinding>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): OrganizationRolebinding =>
  deepmerge<OrganizationRolebinding>(
    {
      lastLoginAt: '1892-02-13T20:44:46.0Z',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getOtherTenantDupes = (
  props: Partial<OtherTenantDupes>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): OtherTenantDupes =>
  deepmerge<OtherTenantDupes>(
    {
      numMatches: -48416503,
      numTenants: -75290789,
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getParentOrganization = (
  props: Partial<ParentOrganization>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): ParentOrganization =>
  deepmerge<ParentOrganization>(
    {
      id: '7d4b127d-e29b-4b44-ae3b-0c228c9eb00e',
      name: 'Bruce Metz',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getPartnerLoginRequest = (
  props: Partial<PartnerLoginRequest>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): PartnerLoginRequest =>
  deepmerge<PartnerLoginRequest>(
    {
      code: 'non velit do',
      requestOrgId: 'f20831d1-5c6b-4ae7-9888-156c7b6b7c8a',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getPartnerOrganization = (
  props: Partial<PartnerOrganization>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): PartnerOrganization =>
  deepmerge<PartnerOrganization>(
    {
      allowDomainAccess: false,
      domains: ['fugiat nostrud', 'et id sint ut', 'ut dolor'],
      id: 'bcf685ff-2ccb-4d7f-817a-b466bd63fcd5',
      isAuthMethodSupported: false,
      isDomainAlreadyClaimed: false,
      logoUrl: 'https://minor-precedent.name',
      name: 'Freddie Orn',
      websiteUrl: 'https://terrible-deduction.org',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getPatchProxyConfigRequest = (
  props: Partial<PatchProxyConfigRequest>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): PatchProxyConfigRequest =>
  deepmerge<PatchProxyConfigRequest>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );
export const getPhoneLookupAttributes = (props: PhoneLookupAttributes): PhoneLookupAttributes =>
  props ?? 'line_type_intelligence';

export const getPlainCustomHeader = (
  props: Partial<PlainCustomHeader>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): PlainCustomHeader =>
  deepmerge<PlainCustomHeader>(
    {
      name: 'Pat Hane',
      value: 'dolor consectetur',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );
export const getPreviewApi = (props: PreviewApi): PreviewApi => props ?? 'decisions_list';

export const getPrivateBusinessOwner = (
  props: Partial<PrivateBusinessOwner>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): PrivateBusinessOwner =>
  deepmerge<PrivateBusinessOwner>(
    {
      fpId: 'af38c335-844c-4bcc-b380-fa0a21e03e81',
      id: '60bd9d13-4b29-4879-a6af-6b29c73107e2',
      kind: 'primary',
      name: 'Leslie Waelchi',
      ownershipStake: -10665692,
      ownershipStakeDi: 'document.id_card.back.mime_type',
      source: 'hosted',
      status: 'fail',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getPrivateBusinessOwnerKycLink = (
  props: Partial<PrivateBusinessOwnerKycLink>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): PrivateBusinessOwnerKycLink =>
  deepmerge<PrivateBusinessOwnerKycLink>(
    {
      id: '2cce5dda-1edc-41b8-9c93-39fd506d3e30',
      link: 'voluptate aute',
      name: 'Lora Nikolaus',
      token: '94f45ffb-484a-4ae6-b5c3-0b1bbca8d54e',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getPrivateOwnedBusiness = (
  props: Partial<PrivateOwnedBusiness>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): PrivateOwnedBusiness =>
  deepmerge<PrivateOwnedBusiness>(
    {
      id: '5b617a49-a919-4bec-8f67-f7184379c1b0',
      status: 'fail',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getProxyConfigBasic = (
  props: Partial<ProxyConfigBasic>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): ProxyConfigBasic =>
  deepmerge<ProxyConfigBasic>(
    {
      createdAt: '1969-07-10T01:25:35.0Z',
      deactivatedAt: '1921-07-17T16:07:48.0Z',
      id: 'ef47b848-4507-4a30-9436-b7a5d36f9f02',
      isLive: true,
      method: 'aute Duis aliqua Ut cupidatat',
      name: 'Steve Klocko',
      status: 'disabled',
      url: 'https://sudden-yogurt.us/',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getProxyConfigDetailed = (
  props: Partial<ProxyConfigDetailed>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): ProxyConfigDetailed =>
  deepmerge<ProxyConfigDetailed>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );
export const getProxyIngressContentType = (props: ProxyIngressContentType): ProxyIngressContentType => props ?? 'json';

export const getProxyIngressRule = (
  props: Partial<ProxyIngressRule>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): ProxyIngressRule =>
  deepmerge<ProxyIngressRule>(
    {
      target: 'ea',
      token: 'document.drivers_license.front.image',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getRawUserDataRequest = (
  props: Partial<RawUserDataRequest>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): RawUserDataRequest =>
  deepmerge<RawUserDataRequest>(
    {
      key: 'bank.*.ach_account_id',
      value: {},
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getRestoreOnboardingConfigurationRequest = (
  props: Partial<RestoreOnboardingConfigurationRequest>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): RestoreOnboardingConfigurationRequest =>
  deepmerge<RestoreOnboardingConfigurationRequest>(
    {
      expectedLatestObcId: '79aef31e-8a37-40b1-82ab-7e18001871e4',
      restoreObcId: '2ae7b681-a5b6-4b61-af5e-57706329af55',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getReuploadComplianceDocRequest = (
  props: Partial<ReuploadComplianceDocRequest>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): ReuploadComplianceDocRequest =>
  deepmerge<ReuploadComplianceDocRequest>(
    {
      description: 'quis aute',
      name: 'Donnie Bechtelar',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );
export const getRiskScore = (props: RiskScore): RiskScore => props ?? 'experian_score';

export const getRiskSignal = (
  props: Partial<RiskSignal>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): RiskSignal =>
  deepmerge<RiskSignal>(
    {
      description: 'tempor qui dolor fugiat',
      group: 'phone',
      id: '284ea003-4911-46f8-beb0-d4f0a7418014',
      note: 'ullamco',
      onboardingDecisionId: '2d7de04c-ccc8-4252-a23a-a0ee934953b2',
      reasonCode: 'document_barcode_content_does_not_match',
      scopes: ['business_phone_number', 'street_address', 'street_address'],
      severity: 'low',
      timestamp: '1960-04-07T16:37:50.0Z',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getRiskSignalDetail = (
  props: Partial<RiskSignalDetail>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): RiskSignalDetail =>
  deepmerge<RiskSignalDetail>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );
export const getRiskSignalGroupKind = (props: RiskSignalGroupKind): RiskSignalGroupKind => props ?? 'native_device';

export const getRule = (props: Partial<Rule>, options: { overwriteArray: boolean } = { overwriteArray: true }): Rule =>
  deepmerge<Rule>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );
export const getRuleAction = (props: RuleAction): RuleAction => props ?? 'step_up.custom';

export const getRuleActionConfig = (
  props: Partial<RuleActionConfig>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): RuleActionConfig =>
  deepmerge<RuleActionConfig>(
    {
      config: {},
      kind: 'pass_with_manual_review',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getRuleActionConfigFail = (
  props: Partial<RuleActionConfigFail>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): RuleActionConfigFail =>
  deepmerge<RuleActionConfigFail>(
    {
      config: {},
      kind: 'fail',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getRuleActionConfigManualReview = (
  props: Partial<RuleActionConfigManualReview>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): RuleActionConfigManualReview =>
  deepmerge<RuleActionConfigManualReview>(
    {
      config: {},
      kind: 'manual_review',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getRuleActionConfigPassWithManualReview = (
  props: Partial<RuleActionConfigPassWithManualReview>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): RuleActionConfigPassWithManualReview =>
  deepmerge<RuleActionConfigPassWithManualReview>(
    {
      config: {},
      kind: 'pass_with_manual_review',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getRuleActionConfigStepUp = (
  props: Partial<RuleActionConfigStepUp>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): RuleActionConfigStepUp =>
  deepmerge<RuleActionConfigStepUp>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );
export const getRuleActionMigration = (props: RuleActionMigration): RuleActionMigration => props ?? 'manual_review';

export const getRuleEvalResult = (
  props: Partial<RuleEvalResult>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): RuleEvalResult =>
  deepmerge<RuleEvalResult>(
    {
      backtestActionTriggered: 'step_up.identity_proof_of_ssn',
      currentStatus: 'pass',
      fpId: '3b6bfdfe-0232-4a1c-8366-8306d23a9478',
      historicalActionTriggered: 'step_up.identity',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getRuleEvalResults = (
  props: Partial<RuleEvalResults>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): RuleEvalResults =>
  deepmerge<RuleEvalResults>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getRuleEvalStats = (
  props: Partial<RuleEvalStats>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): RuleEvalStats =>
  deepmerge<RuleEvalStats>(
    {
      countByBacktestActionTriggered: {},
      countByHistoricalActionTriggered: {},
      countByHistoricalAndBacktestActionTriggered: {},
      total: -61560433,
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getRuleExpression = (
  props: Partial<RuleExpression>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): RuleExpression =>
  deepmerge<RuleExpression>(
    [
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
    ],
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getRuleExpressionCondition = (
  props: Partial<RuleExpressionCondition>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): RuleExpressionCondition =>
  deepmerge<RuleExpressionCondition>(
    {
      field: 'drivers_license_number_not_valid',
      op: 'not_eq',
      value: false,
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );
export const getRuleInstanceKind = (props: RuleInstanceKind): RuleInstanceKind => props ?? 'business';

export const getRuleResult = (
  props: Partial<RuleResult>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): RuleResult =>
  deepmerge<RuleResult>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getRuleSet = (
  props: Partial<RuleSet>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): RuleSet =>
  deepmerge<RuleSet>(
    {
      version: -67232831,
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getRuleSetResult = (
  props: Partial<RuleSetResult>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): RuleSetResult =>
  deepmerge<RuleSetResult>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getSameTenantDupe = (
  props: Partial<SameTenantDupe>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): SameTenantDupe =>
  deepmerge<SameTenantDupe>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );
export const getScoreBand = (props: ScoreBand): ScoreBand => props ?? 'low';

export const getSearchEntitiesRequest = (
  props: Partial<SearchEntitiesRequest>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): SearchEntitiesRequest =>
  deepmerge<SearchEntitiesRequest>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );
export const getSecretApiKey = (props: SecretApiKey): SecretApiKey => props ?? 'commodo laboris sunt';

export const getSecretCustomHeader = (
  props: Partial<SecretCustomHeader>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): SecretCustomHeader =>
  deepmerge<SecretCustomHeader>(
    {
      name: 'Lynda Wisozk',
      value: 'velit voluptate',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getSentilinkDetail = (
  props: Partial<SentilinkDetail>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): SentilinkDetail =>
  deepmerge<SentilinkDetail>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getSentilinkReasonCode = (
  props: Partial<SentilinkReasonCode>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): SentilinkReasonCode =>
  deepmerge<SentilinkReasonCode>(
    {
      code: 'id',
      direction: 'in dolore dolor adipisicing',
      explanation: 'ut nisi laboris consectetur',
      rank: 41960061,
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getSentilinkScoreDetail = (
  props: Partial<SentilinkScoreDetail>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): SentilinkScoreDetail =>
  deepmerge<SentilinkScoreDetail>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );
export const getSignalScope = (props: SignalScope): SignalScope => props ?? 'state';
export const getSignalSeverity = (props: SignalSeverity): SignalSeverity => props ?? 'info';

export const getSubmitExternalUrlRequest = (
  props: Partial<SubmitExternalUrlRequest>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): SubmitExternalUrlRequest =>
  deepmerge<SubmitExternalUrlRequest>(
    {
      url: 'https://ornate-contrail.org/',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getTenantAndroidAppMeta = (
  props: Partial<TenantAndroidAppMeta>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): TenantAndroidAppMeta =>
  deepmerge<TenantAndroidAppMeta>(
    {
      apkCertSha256S: ['sint', 'in dolore', 'id cupidatat'],
      id: 'e66847fb-5123-41c6-9348-ae80fe3c0e98',
      integrityDecryptionKey: '735cbd77-6ec3-4944-847f-44e9795770f9',
      integrityVerificationKey: '70487420-08ab-498a-bc5c-02ad2754cbcc',
      packageNames: ['irure exercitation non nulla incididunt', 'amet commodo veniam', 'aliqua in pariatur Ut'],
      tenantId: 'f0e8ce5e-e21d-4f4f-bd5a-81b205efa8c0',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );
export const getTenantFrequentNoteKind = (props: TenantFrequentNoteKind): TenantFrequentNoteKind =>
  props ?? 'annotation';

export const getTenantIosAppMeta = (
  props: Partial<TenantIosAppMeta>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): TenantIosAppMeta =>
  deepmerge<TenantIosAppMeta>(
    {
      appBundleIds: ['veniam commodo do', 'id consectetur ut', 'in veniam'],
      deviceCheckKeyId: '4b854c10-41f4-4d28-bda5-c52c9fd91a66',
      deviceCheckPrivateKey: '1d272c27-653d-4d9e-93eb-2c94f1931a19',
      id: '1f74f145-8b2c-486a-8570-326f0b58cfc8',
      teamId: '6009a99d-55b7-4dd9-a6ad-789660ecb694',
      tenantId: 'f112063f-0f8d-491e-a030-78622dbb4e16',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );
export const getTenantKind = (props: TenantKind): TenantKind => props ?? 'tenant';

export const getTenantLoginRequest = (
  props: Partial<TenantLoginRequest>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): TenantLoginRequest =>
  deepmerge<TenantLoginRequest>(
    {
      code: 'et Lorem est',
      requestOrgId: 'eefc02b5-0ac0-4247-96c4-69d703fd3be7',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );
export const getTenantRoleKindDiscriminant = (props: TenantRoleKindDiscriminant): TenantRoleKindDiscriminant =>
  props ?? 'api_key';

export const getTenantScope = (
  props: Partial<TenantScope>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): TenantScope =>
  deepmerge<TenantScope>(
    {
      kind: 'read',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getTenantScopeAdmin = (
  props: Partial<TenantScopeAdmin>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): TenantScopeAdmin =>
  deepmerge<TenantScopeAdmin>(
    {
      kind: 'admin',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getTenantScopeApiKeys = (
  props: Partial<TenantScopeApiKeys>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): TenantScopeApiKeys =>
  deepmerge<TenantScopeApiKeys>(
    {
      kind: 'api_keys',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getTenantScopeAuthToken = (
  props: Partial<TenantScopeAuthToken>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): TenantScopeAuthToken =>
  deepmerge<TenantScopeAuthToken>(
    {
      kind: 'auth_token',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getTenantScopeCipIntegration = (
  props: Partial<TenantScopeCipIntegration>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): TenantScopeCipIntegration =>
  deepmerge<TenantScopeCipIntegration>(
    {
      kind: 'cip_integration',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getTenantScopeCompliancePartnerAdmin = (
  props: Partial<TenantScopeCompliancePartnerAdmin>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): TenantScopeCompliancePartnerAdmin =>
  deepmerge<TenantScopeCompliancePartnerAdmin>(
    {
      kind: 'compliance_partner_admin',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getTenantScopeCompliancePartnerManageReviews = (
  props: Partial<TenantScopeCompliancePartnerManageReviews>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): TenantScopeCompliancePartnerManageReviews =>
  deepmerge<TenantScopeCompliancePartnerManageReviews>(
    {
      kind: 'compliance_partner_manage_reviews',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getTenantScopeCompliancePartnerManageTemplates = (
  props: Partial<TenantScopeCompliancePartnerManageTemplates>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): TenantScopeCompliancePartnerManageTemplates =>
  deepmerge<TenantScopeCompliancePartnerManageTemplates>(
    {
      kind: 'compliance_partner_manage_templates',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getTenantScopeCompliancePartnerRead = (
  props: Partial<TenantScopeCompliancePartnerRead>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): TenantScopeCompliancePartnerRead =>
  deepmerge<TenantScopeCompliancePartnerRead>(
    {
      kind: 'compliance_partner_read',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getTenantScopeDecrypt = (
  props: Partial<TenantScopeDecrypt>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): TenantScopeDecrypt =>
  deepmerge<TenantScopeDecrypt>(
    {
      data: 'card',
      kind: 'decrypt',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getTenantScopeDecryptAll = (
  props: Partial<TenantScopeDecryptAll>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): TenantScopeDecryptAll =>
  deepmerge<TenantScopeDecryptAll>(
    {
      kind: 'decrypt_all',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getTenantScopeDecryptAllExceptPciData = (
  props: Partial<TenantScopeDecryptAllExceptPciData>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): TenantScopeDecryptAllExceptPciData =>
  deepmerge<TenantScopeDecryptAllExceptPciData>(
    {
      kind: 'decrypt_all_except_pci_data',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getTenantScopeDecryptCustom = (
  props: Partial<TenantScopeDecryptCustom>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): TenantScopeDecryptCustom =>
  deepmerge<TenantScopeDecryptCustom>(
    {
      kind: 'decrypt_custom',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getTenantScopeDecryptDocument = (
  props: Partial<TenantScopeDecryptDocument>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): TenantScopeDecryptDocument =>
  deepmerge<TenantScopeDecryptDocument>(
    {
      kind: 'decrypt_document',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getTenantScopeDecryptDocumentAndSelfie = (
  props: Partial<TenantScopeDecryptDocumentAndSelfie>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): TenantScopeDecryptDocumentAndSelfie =>
  deepmerge<TenantScopeDecryptDocumentAndSelfie>(
    {
      kind: 'decrypt_document_and_selfie',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getTenantScopeInvokeVaultProxy = (
  props: Partial<TenantScopeInvokeVaultProxy>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): TenantScopeInvokeVaultProxy =>
  deepmerge<TenantScopeInvokeVaultProxy>(
    {
      data: {
        kind: 'any',
      },
      kind: 'invoke_vault_proxy',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getTenantScopeLabelAndTag = (
  props: Partial<TenantScopeLabelAndTag>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): TenantScopeLabelAndTag =>
  deepmerge<TenantScopeLabelAndTag>(
    {
      kind: 'label_and_tag',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getTenantScopeManageComplianceDocSubmission = (
  props: Partial<TenantScopeManageComplianceDocSubmission>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): TenantScopeManageComplianceDocSubmission =>
  deepmerge<TenantScopeManageComplianceDocSubmission>(
    {
      kind: 'manage_compliance_doc_submission',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getTenantScopeManageVaultProxy = (
  props: Partial<TenantScopeManageVaultProxy>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): TenantScopeManageVaultProxy =>
  deepmerge<TenantScopeManageVaultProxy>(
    {
      kind: 'manage_vault_proxy',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getTenantScopeManageWebhooks = (
  props: Partial<TenantScopeManageWebhooks>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): TenantScopeManageWebhooks =>
  deepmerge<TenantScopeManageWebhooks>(
    {
      kind: 'manage_webhooks',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getTenantScopeManualReview = (
  props: Partial<TenantScopeManualReview>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): TenantScopeManualReview =>
  deepmerge<TenantScopeManualReview>(
    {
      kind: 'manual_review',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getTenantScopeOnboarding = (
  props: Partial<TenantScopeOnboarding>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): TenantScopeOnboarding =>
  deepmerge<TenantScopeOnboarding>(
    {
      kind: 'onboarding',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getTenantScopeOnboardingConfiguration = (
  props: Partial<TenantScopeOnboardingConfiguration>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): TenantScopeOnboardingConfiguration =>
  deepmerge<TenantScopeOnboardingConfiguration>(
    {
      kind: 'onboarding_configuration',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getTenantScopeOrgSettings = (
  props: Partial<TenantScopeOrgSettings>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): TenantScopeOrgSettings =>
  deepmerge<TenantScopeOrgSettings>(
    {
      kind: 'org_settings',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getTenantScopeRead = (
  props: Partial<TenantScopeRead>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): TenantScopeRead =>
  deepmerge<TenantScopeRead>(
    {
      kind: 'read',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getTenantScopeTriggerKyb = (
  props: Partial<TenantScopeTriggerKyb>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): TenantScopeTriggerKyb =>
  deepmerge<TenantScopeTriggerKyb>(
    {
      kind: 'trigger_kyb',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getTenantScopeTriggerKyc = (
  props: Partial<TenantScopeTriggerKyc>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): TenantScopeTriggerKyc =>
  deepmerge<TenantScopeTriggerKyc>(
    {
      kind: 'trigger_kyc',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getTenantScopeWriteEntities = (
  props: Partial<TenantScopeWriteEntities>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): TenantScopeWriteEntities =>
  deepmerge<TenantScopeWriteEntities>(
    {
      kind: 'write_entities',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getTenantScopeWriteLists = (
  props: Partial<TenantScopeWriteLists>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): TenantScopeWriteLists =>
  deepmerge<TenantScopeWriteLists>(
    {
      kind: 'write_lists',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );
export const getTerminalDecisionStatus = (props: TerminalDecisionStatus): TerminalDecisionStatus => props ?? 'pass';

export const getTimelineOnboardingDecision = (
  props: Partial<TimelineOnboardingDecision>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): TimelineOnboardingDecision =>
  deepmerge<TimelineOnboardingDecision>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getTimelinePlaybook = (
  props: Partial<TimelinePlaybook>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): TimelinePlaybook =>
  deepmerge<TimelinePlaybook>(
    {
      id: '367621e6-a7ff-43f5-9764-6199e904bb6a',
      mustCollectData: ['business_phone_number', 'business_address', 'business_website'],
      name: 'Clara Herzog',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );
export const getTokenOperationKind = (props: TokenOperationKind): TokenOperationKind => props ?? 'update_auth_methods';

export const getTriggerRequest = (
  props: Partial<TriggerRequest>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): TriggerRequest =>
  deepmerge<TriggerRequest>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getUnvalidatedRuleExpression = (
  props: Partial<UnvalidatedRuleExpression>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): UnvalidatedRuleExpression =>
  deepmerge<UnvalidatedRuleExpression>(
    [
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
    ],
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getUpdateAnnotationRequest = (
  props: Partial<UpdateAnnotationRequest>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): UpdateAnnotationRequest =>
  deepmerge<UpdateAnnotationRequest>(
    {
      isPinned: true,
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getUpdateApiKeyRequest = (
  props: Partial<UpdateApiKeyRequest>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): UpdateApiKeyRequest =>
  deepmerge<UpdateApiKeyRequest>(
    {
      name: 'Krystal Balistreri',
      roleId: 'd1c4ee93-c3c4-46ba-afcf-6ada2a81b8fb',
      status: 'enabled',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getUpdateClientSecurityConfig = (
  props: Partial<UpdateClientSecurityConfig>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): UpdateClientSecurityConfig =>
  deepmerge<UpdateClientSecurityConfig>(
    {
      allowedOrigins: ['aliquip', 'commodo cupidatat culpa', 'cupidatat pariatur minim nisi cillum'],
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getUpdateComplianceDocAssignmentRequest = (
  props: Partial<UpdateComplianceDocAssignmentRequest>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): UpdateComplianceDocAssignmentRequest =>
  deepmerge<UpdateComplianceDocAssignmentRequest>(
    {
      userId: 'a2daf3bc-b7fd-42bf-a604-4c23b889275b',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getUpdateComplianceDocTemplateRequest = (
  props: Partial<UpdateComplianceDocTemplateRequest>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): UpdateComplianceDocTemplateRequest =>
  deepmerge<UpdateComplianceDocTemplateRequest>(
    {
      description: 'nulla anim',
      name: 'Kayla Hartmann IV',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getUpdateLabelRequest = (
  props: Partial<UpdateLabelRequest>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): UpdateLabelRequest =>
  deepmerge<UpdateLabelRequest>(
    {
      kind: 'offboard_fraud',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getUpdateListRequest = (
  props: Partial<UpdateListRequest>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): UpdateListRequest =>
  deepmerge<UpdateListRequest>(
    {
      alias: 'aliqua et',
      name: 'Grady Lind',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getUpdateObConfigRequest = (
  props: Partial<UpdateObConfigRequest>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): UpdateObConfigRequest =>
  deepmerge<UpdateObConfigRequest>(
    {
      name: 'Patsy Funk',
      promptForPasskey: false,
      skipConfirm: true,
      status: 'disabled',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getUpdatePartnerTenantRequest = (
  props: Partial<UpdatePartnerTenantRequest>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): UpdatePartnerTenantRequest =>
  deepmerge<UpdatePartnerTenantRequest>(
    {
      allowDomainAccess: false,
      name: 'Dr. Deanna Morissette',
      websiteUrl: 'https://polite-bookend.com/',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getUpdateTenantAndroidAppMetaRequest = (
  props: Partial<UpdateTenantAndroidAppMetaRequest>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): UpdateTenantAndroidAppMetaRequest =>
  deepmerge<UpdateTenantAndroidAppMetaRequest>(
    {
      apkCertSha256S: ['anim aliquip', 'nulla sint', 'voluptate dolore Excepteur est'],
      integrityDecryptionKey: 'aaec2951-dbb1-4547-ac67-c3f3605e1d28',
      integrityVerificationKey: '0378eb27-50a7-43b9-8d67-dfcbce53f720',
      packageNames: ['incididunt', 'labore id', 'dolore ullamco'],
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getUpdateTenantIosAppMetaRequest = (
  props: Partial<UpdateTenantIosAppMetaRequest>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): UpdateTenantIosAppMetaRequest =>
  deepmerge<UpdateTenantIosAppMetaRequest>(
    {
      appBundleIds: ['ullamco ipsum', 'anim laborum aliqua', 'culpa'],
      deviceCheckKeyId: '3d268de5-62d0-4d80-8d33-ebab0f939753',
      deviceCheckPrivateKey: '6a4af98c-62cc-44bd-8d98-febe320265d8',
      teamId: '6d929467-2946-4a9f-afda-40dc44e4ade3',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getUpdateTenantRequest = (
  props: Partial<UpdateTenantRequest>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): UpdateTenantRequest =>
  deepmerge<UpdateTenantRequest>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getUpdateTenantRoleRequest = (
  props: Partial<UpdateTenantRoleRequest>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): UpdateTenantRoleRequest =>
  deepmerge<UpdateTenantRoleRequest>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getUpdateTenantRolebindingRequest = (
  props: Partial<UpdateTenantRolebindingRequest>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): UpdateTenantRolebindingRequest =>
  deepmerge<UpdateTenantRolebindingRequest>(
    {
      roleId: '91e4a4f5-7f3b-415f-9ae0-6dcb818777d4',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getUpdateTenantUserRequest = (
  props: Partial<UpdateTenantUserRequest>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): UpdateTenantUserRequest =>
  deepmerge<UpdateTenantUserRequest>(
    {
      firstName: 'Amaya',
      lastName: 'Beer',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );
export const getUploadSource = (props: UploadSource): UploadSource => props ?? 'mobile';

export const getUserAiSummary = (
  props: Partial<UserAiSummary>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): UserAiSummary =>
  deepmerge<UserAiSummary>(
    {
      conclusion: 'aliqua eu',
      detailedSummary: 'nisi velit labore cillum ipsum',
      highLevelSummary: 'consequat labore eu aliqua',
      riskSignalSummary: 'magna',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );
export const getUserDataIdentifier = (props: UserDataIdentifier): UserDataIdentifier => props ?? 'id.country';

export const getUserDecryptRequest = (
  props: Partial<UserDecryptRequest>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): UserDecryptRequest =>
  deepmerge<UserDecryptRequest>(
    {
      fields: [
        'document.passport_card.curp_validation_response',
        'document.voter_identification.selfie.mime_type',
        'card.*.expiration',
      ],
      reason: 'eu aute velit laborum dolore',
      transforms: ["date_format('<from_format>','<to_format>')", 'prefix(<n>)', 'suffix(<n>)'],
      versionAt: '1891-03-31T04:49:11.0Z',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getUserDecryptResponse = (
  props: Partial<UserDecryptResponse>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): UserDecryptResponse =>
  deepmerge<UserDecryptResponse>(
    {
      key: 'document.permit.postal_code',
      value: {},
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getUserDeleteResponse = (
  props: Partial<UserDeleteResponse>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): UserDeleteResponse =>
  deepmerge<UserDeleteResponse>(
    {
      key: 'id.ssn4',
      value: false,
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getUserInsight = (
  props: Partial<UserInsight>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): UserInsight =>
  deepmerge<UserInsight>(
    {
      description: 'in aliqua magna',
      name: 'Karen McClure',
      scope: 'workflow',
      unit: 'duration_ms',
      value: 'proident tempor ipsum qui',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );
export const getUserInsightScope = (props: UserInsightScope): UserInsightScope => props ?? 'behavior';
export const getUserInsightUnit = (props: UserInsightUnit): UserInsightUnit => props ?? 'boolean';

export const getUserLabel = (
  props: Partial<UserLabel>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): UserLabel =>
  deepmerge<UserLabel>(
    {
      createdAt: '1927-07-17T14:20:28.0Z',
      kind: 'active',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getUserTag = (
  props: Partial<UserTag>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): UserTag =>
  deepmerge<UserTag>(
    {
      createdAt: '1918-02-19T23:26:14.0Z',
      id: 'b4cba478-b6ec-4e41-995e-e875a841f2a4',
      tag: 'voluptate',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getUserTimeline = (
  props: Partial<UserTimeline>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): UserTimeline =>
  deepmerge<UserTimeline>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getUserTimelineEvent = (
  props: Partial<UserTimelineEvent>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): UserTimelineEvent =>
  deepmerge<UserTimelineEvent>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getUserTimelineEventAnnotation = (
  props: Partial<UserTimelineEventAnnotation>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): UserTimelineEventAnnotation =>
  deepmerge<UserTimelineEventAnnotation>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getUserTimelineEventAuthMethodUpdated = (
  props: Partial<UserTimelineEventAuthMethodUpdated>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): UserTimelineEventAuthMethodUpdated =>
  deepmerge<UserTimelineEventAuthMethodUpdated>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getUserTimelineEventBusinessOwnerCompletedKyc = (
  props: Partial<UserTimelineEventBusinessOwnerCompletedKyc>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): UserTimelineEventBusinessOwnerCompletedKyc =>
  deepmerge<UserTimelineEventBusinessOwnerCompletedKyc>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getUserTimelineEventDataCollected = (
  props: Partial<UserTimelineEventDataCollected>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): UserTimelineEventDataCollected =>
  deepmerge<UserTimelineEventDataCollected>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getUserTimelineEventDocumentUploaded = (
  props: Partial<UserTimelineEventDocumentUploaded>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): UserTimelineEventDocumentUploaded =>
  deepmerge<UserTimelineEventDocumentUploaded>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getUserTimelineEventExternalIntegrationCalled = (
  props: Partial<UserTimelineEventExternalIntegrationCalled>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): UserTimelineEventExternalIntegrationCalled =>
  deepmerge<UserTimelineEventExternalIntegrationCalled>(
    {
      data: {
        externalId: '031d33fc-7e95-4646-bce5-838be493687c',
        integration: 'alpaca_cip',
        successful: true,
      },
      kind: 'external_integration_called',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getUserTimelineEventLabelAdded = (
  props: Partial<UserTimelineEventLabelAdded>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): UserTimelineEventLabelAdded =>
  deepmerge<UserTimelineEventLabelAdded>(
    {
      data: {
        kind: 'active',
      },
      kind: 'label_added',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getUserTimelineEventLiveness = (
  props: Partial<UserTimelineEventLiveness>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): UserTimelineEventLiveness =>
  deepmerge<UserTimelineEventLiveness>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getUserTimelineEventOnboardingDecision = (
  props: Partial<UserTimelineEventOnboardingDecision>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): UserTimelineEventOnboardingDecision =>
  deepmerge<UserTimelineEventOnboardingDecision>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getUserTimelineEventOnboardingTimeline = (
  props: Partial<UserTimelineEventOnboardingTimeline>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): UserTimelineEventOnboardingTimeline =>
  deepmerge<UserTimelineEventOnboardingTimeline>(
    {
      data: {
        event: 'dolore ullamco culpa in esse',
        sessionId: '7da98b9c-501b-4807-9fcc-c6630015fd3c',
      },
      kind: 'onboarding_timeline',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getUserTimelineEventStepUp = (
  props: Partial<UserTimelineEventStepUp>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): UserTimelineEventStepUp =>
  deepmerge<UserTimelineEventStepUp>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getUserTimelineEventVaultCreated = (
  props: Partial<UserTimelineEventVaultCreated>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): UserTimelineEventVaultCreated =>
  deepmerge<UserTimelineEventVaultCreated>(
    {
      data: {
        actor: {
          id: 'f9907fd5-8657-4adc-b8d0-79e64d916e5e',
          kind: 'user',
        },
      },
      kind: 'vault_created',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getUserTimelineEventWatchlistCheck = (
  props: Partial<UserTimelineEventWatchlistCheck>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): UserTimelineEventWatchlistCheck =>
  deepmerge<UserTimelineEventWatchlistCheck>(
    {
      data: {
        id: '972ceb12-49f6-4959-bf10-bd212c5b4290',
        reasonCodes: ['device_reputation', 'document_ocr_first_name_matches', 'document_photo_is_paper_capture'],
        status: 'not_needed',
      },
      kind: 'watchlist_check',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getUserTimelineEventWorkflowStarted = (
  props: Partial<UserTimelineEventWorkflowStarted>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): UserTimelineEventWorkflowStarted =>
  deepmerge<UserTimelineEventWorkflowStarted>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getUserTimelineEventWorkflowTriggered = (
  props: Partial<UserTimelineEventWorkflowTriggered>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): UserTimelineEventWorkflowTriggered =>
  deepmerge<UserTimelineEventWorkflowTriggered>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getVaultCreated = (
  props: Partial<VaultCreated>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): VaultCreated =>
  deepmerge<VaultCreated>(
    {
      actor: {
        id: '305157cd-57d4-45f1-ac4c-a1fb5890f411',
        kind: 'user',
      },
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getVaultDrAwsPreEnrollResponse = (
  props: Partial<VaultDrAwsPreEnrollResponse>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): VaultDrAwsPreEnrollResponse =>
  deepmerge<VaultDrAwsPreEnrollResponse>(
    {
      externalId: 'f63833cc-3972-434a-b459-e2ef366e6d82',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getVaultDrEnrollRequest = (
  props: Partial<VaultDrEnrollRequest>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): VaultDrEnrollRequest =>
  deepmerge<VaultDrEnrollRequest>(
    {
      awsAccountId: '0dd2eb44-b005-4ae5-be24-dbcbfb26d442',
      awsRoleName: 'Sandy Hermann',
      orgPublicKeys: ['exercitation in', 'quis dolore deserunt', 'id'],
      reEnroll: false,
      s3BucketName: 'Lewis Denesik',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getVaultDrEnrollResponse = (
  props: Partial<VaultDrEnrollResponse>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): VaultDrEnrollResponse =>
  deepmerge<VaultDrEnrollResponse>({}, props, {
    ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}),
  });

export const getVaultDrEnrolledStatus = (
  props: Partial<VaultDrEnrolledStatus>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): VaultDrEnrolledStatus =>
  deepmerge<VaultDrEnrolledStatus>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getVaultDrRevealWrappedRecordKeysRequest = (
  props: Partial<VaultDrRevealWrappedRecordKeysRequest>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): VaultDrRevealWrappedRecordKeysRequest =>
  deepmerge<VaultDrRevealWrappedRecordKeysRequest>(
    {
      recordPaths: ['Lorem esse dolor ea', 'non voluptate', 'in aliquip cupidatat dolor dolor'],
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getVaultDrRevealWrappedRecordKeysResponse = (
  props: Partial<VaultDrRevealWrappedRecordKeysResponse>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): VaultDrRevealWrappedRecordKeysResponse =>
  deepmerge<VaultDrRevealWrappedRecordKeysResponse>(
    {
      wrappedRecordKeys: {},
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getVaultDrStatus = (
  props: Partial<VaultDrStatus>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): VaultDrStatus =>
  deepmerge<VaultDrStatus>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );
export const getVaultKind = (props: VaultKind): VaultKind => props ?? 'business';

export const getVaultOperation = (
  props: Partial<VaultOperation>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): VaultOperation =>
  deepmerge<VaultOperation>(
    {
      field: 'investor_profile.occupation',
      op: 'eq',
      value: 'pariatur laboris',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getVerificationCheck = (
  props: Partial<VerificationCheck>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): VerificationCheck =>
  deepmerge<VerificationCheck>(
    {
      data: {
        einOnly: true,
      },
      kind: 'kyb',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getVerificationCheckAml = (
  props: Partial<VerificationCheckAml>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): VerificationCheckAml =>
  deepmerge<VerificationCheckAml>(
    {
      data: {
        adverseMedia: true,
        adverseMediaLists: ['financial_crime', 'violent_crime', 'general_minor'],
        continuousMonitoring: true,
        matchKind: 'exact_name_and_dob_year',
        ofac: false,
        pep: true,
      },
      kind: 'aml',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getVerificationCheckBusinessAml = (
  props: Partial<VerificationCheckBusinessAml>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): VerificationCheckBusinessAml =>
  deepmerge<VerificationCheckBusinessAml>(
    {
      data: {},
      kind: 'business_aml',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getVerificationCheckCurpValidation = (
  props: Partial<VerificationCheckCurpValidation>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): VerificationCheckCurpValidation =>
  deepmerge<VerificationCheckCurpValidation>(
    {
      data: {},
      kind: 'curp_validation',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getVerificationCheckIdentityDocument = (
  props: Partial<VerificationCheckIdentityDocument>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): VerificationCheckIdentityDocument =>
  deepmerge<VerificationCheckIdentityDocument>(
    {
      data: {},
      kind: 'identity_document',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getVerificationCheckKyb = (
  props: Partial<VerificationCheckKyb>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): VerificationCheckKyb =>
  deepmerge<VerificationCheckKyb>(
    {
      data: {
        einOnly: false,
      },
      kind: 'kyb',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getVerificationCheckKyc = (
  props: Partial<VerificationCheckKyc>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): VerificationCheckKyc =>
  deepmerge<VerificationCheckKyc>(
    {
      data: {},
      kind: 'kyc',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getVerificationCheckNeuroId = (
  props: Partial<VerificationCheckNeuroId>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): VerificationCheckNeuroId =>
  deepmerge<VerificationCheckNeuroId>(
    {
      data: {},
      kind: 'neuro_id',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getVerificationCheckPhone = (
  props: Partial<VerificationCheckPhone>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): VerificationCheckPhone =>
  deepmerge<VerificationCheckPhone>(
    {
      data: {
        attributes: ['line_type_intelligence', 'line_type_intelligence', 'line_type_intelligence'],
      },
      kind: 'phone',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getVerificationCheckSentilink = (
  props: Partial<VerificationCheckSentilink>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): VerificationCheckSentilink =>
  deepmerge<VerificationCheckSentilink>(
    {
      data: {},
      kind: 'sentilink',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getVerificationCheckStytchDevice = (
  props: Partial<VerificationCheckStytchDevice>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): VerificationCheckStytchDevice =>
  deepmerge<VerificationCheckStytchDevice>(
    {
      data: {},
      kind: 'stytch_device',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getWatchlistCheck = (
  props: Partial<WatchlistCheck>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): WatchlistCheck =>
  deepmerge<WatchlistCheck>(
    {
      id: '5d06a348-6b39-4dbe-bce3-0aeda9dcecc5',
      reasonCodes: [
        'address_zip_code_does_not_match',
        'document_low_match_score_with_selfie',
        'name_last_does_not_match',
      ],
      status: 'pending',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );
export const getWatchlistCheckStatusKind = (props: WatchlistCheckStatusKind): WatchlistCheckStatusKind =>
  props ?? 'error';

export const getWatchlistEntry = (
  props: Partial<WatchlistEntry>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): WatchlistEntry =>
  deepmerge<WatchlistEntry>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getWatchlistHit = (
  props: Partial<WatchlistHit>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): WatchlistHit =>
  deepmerge<WatchlistHit>(
    {
      agency: 'occaecat minim Excepteur elit dolore',
      agencyAbbr: 'dolor',
      agencyInformationUrl: 'https://frugal-humidity.com/',
      agencyListUrl: 'https://sick-disconnection.name/',
      entityAliases: ['id dolor est consectetur', 'id cillum in', 'Ut eiusmod irure esse'],
      entityName: 'Joseph Powlowski',
      listCountry: 'Greenland',
      listName: 'Luz Olson',
      url: 'https://indelible-custody.net',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getWebhookPortalResponse = (
  props: Partial<WebhookPortalResponse>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): WebhookPortalResponse =>
  deepmerge<WebhookPortalResponse>(
    {
      appId: '9f4b76dd-4350-4675-82a6-0fb914b928e8',
      token: '4be15425-befa-4709-ada0-d8733cfe03fd',
      url: 'https://silver-dredger.name/',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );
export const getWorkflowKind = (props: WorkflowKind): WorkflowKind => props ?? 'kyb';

export const getWorkflowRequestConfig = (
  props: Partial<WorkflowRequestConfig>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): WorkflowRequestConfig =>
  deepmerge<WorkflowRequestConfig>(
    {
      data: {
        playbookId: 'd8e6617d-30c7-4c60-877f-e9917c128abc',
        recollectAttributes: ['dob', 'business_kyced_beneficial_owners', 'us_tax_id'],
        reuseExistingBoKyc: true,
      },
      kind: 'onboard',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getWorkflowRequestConfigDocument = (
  props: Partial<WorkflowRequestConfigDocument>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): WorkflowRequestConfigDocument =>
  deepmerge<WorkflowRequestConfigDocument>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getWorkflowRequestConfigOnboard = (
  props: Partial<WorkflowRequestConfigOnboard>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): WorkflowRequestConfigOnboard =>
  deepmerge<WorkflowRequestConfigOnboard>(
    {
      data: {
        playbookId: '46361b19-f134-49f5-a5af-7dc9de850981',
        recollectAttributes: ['email', 'business_name', 'phone_number'],
        reuseExistingBoKyc: false,
      },
      kind: 'onboard',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );
export const getWorkflowSource = (props: WorkflowSource): WorkflowSource => props ?? 'unknown';

export const getWorkflowStarted = (
  props: Partial<WorkflowStarted>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): WorkflowStarted =>
  deepmerge<WorkflowStarted>(
    {
      kind: 'document',
      playbook: {
        id: 'b1526656-9e3e-4a7b-810b-02974920798a',
        mustCollectData: ['business_address', 'ssn9', 'bank'],
        name: 'Glenn Balistreri',
      },
      workflowSource: 'tenant',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );
export const getWorkflowStartedEventKind = (props: WorkflowStartedEventKind): WorkflowStartedEventKind =>
  props ?? 'playbook';

export const getWorkflowTriggered = (
  props: Partial<WorkflowTriggered>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): WorkflowTriggered =>
  deepmerge<WorkflowTriggered>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );
