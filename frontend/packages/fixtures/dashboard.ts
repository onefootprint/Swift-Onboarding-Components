import type {
  ActionKind,
  Actor,
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
  AuditEventDetail,
  AuditEventName,
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
  ComplianceDocDataKind,
  ComplianceDocEvent,
  ComplianceDocEventAssigned,
  ComplianceDocEventRequested,
  ComplianceDocEventReviewed,
  ComplianceDocEventSubmitted,
  ComplianceDocEventType,
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
  EntityActionResponse,
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
  InvoicePreview,
  InvokeVaultProxyPermission,
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
  ReuploadComplianceDocRequest,
  RiskScore,
  RiskSignal,
  RiskSignalDetail,
  RiskSignalGroupKind,
  Rule,
  RuleAction,
  RuleActionConfig,
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
  WatchlistCheck,
  WatchlistCheckStatusKind,
  WatchlistEntry,
  WatchlistHit,
  WebhookPortalResponse,
  WorkflowKind,
  WorkflowRequestConfig,
  WorkflowSource,
  WorkflowStarted,
  WorkflowStartedEventKind,
  WorkflowTriggered,
} from '@onefootprint/request-types/dashboard';
import merge from 'lodash/merge';

export const getActionKind = (props: Partial<ActionKind>) => (props ?? 'add_primary') as ActionKind;
export const getActor = (props: Partial<Actor>) =>
  merge(
    {
      id: '854798bd-fb5e-4eee-bcac-3fabddb382df',
      kind: 'user',
    },
    props,
  ) as Actor;
export const getAdverseMediaListKind = (props: Partial<AdverseMediaListKind>) =>
  (props ?? 'narcotics') as AdverseMediaListKind;
export const getAmlDetail = (props: Partial<AmlDetail>) =>
  merge(
    {
      hits: [
        {
          fields: {},
          matchTypes: ['qui', 'incididunt in laborum', 'qui'],
          media: [
            {
              date: '1945-08-09T01:38:46.0Z',
              pdfUrl: 'https://pastel-tusk.us/',
              snippet: 'eiusmod do adipisicing exercitation',
              title: 'et esse reprehenderit',
              url: 'https://enraged-bin.us',
            },
            {
              date: '1938-07-12T23:58:46.0Z',
              pdfUrl: 'https://pastel-tusk.us/',
              snippet: 'non elit occaecat voluptate mollit',
              title: 'fugiat nulla commodo',
              url: 'https://enraged-bin.us',
            },
            {
              date: '1897-05-18T12:12:38.0Z',
              pdfUrl: 'https://pastel-tusk.us/',
              snippet: 'culpa esse officia incididunt occaecat',
              title: 'non Excepteur',
              url: 'https://enraged-bin.us',
            },
          ],
          name: 'Mrs. Shelley Pouros',
        },
        {
          fields: {},
          matchTypes: ['et', 'laborum pariatur in', 'et'],
          media: [
            {
              date: '1953-11-07T21:56:40.0Z',
              pdfUrl: 'https://pastel-tusk.us/',
              snippet: 'ipsum',
              title: 'veniam ex eu',
              url: 'https://enraged-bin.us',
            },
            {
              date: '1915-09-12T10:44:17.0Z',
              pdfUrl: 'https://pastel-tusk.us/',
              snippet: 'pariatur',
              title: 'minim cupidatat non nostrud',
              url: 'https://enraged-bin.us',
            },
            {
              date: '1948-06-05T05:33:51.0Z',
              pdfUrl: 'https://pastel-tusk.us/',
              snippet: 'aute aliquip sit nostrud',
              title: 'incididunt',
              url: 'https://enraged-bin.us',
            },
          ],
          name: 'Mrs. Shelley Pouros',
        },
        {
          fields: {},
          matchTypes: ['culpa', 'dolore commodo elit', 'non cillum veniam occaecat id'],
          media: [
            {
              date: '1894-05-09T19:17:48.0Z',
              pdfUrl: 'https://pastel-tusk.us/',
              snippet: 'sit ut ea',
              title: 'id esse culpa ullamco cupidatat',
              url: 'https://enraged-bin.us',
            },
            {
              date: '1920-04-08T19:32:03.0Z',
              pdfUrl: 'https://pastel-tusk.us/',
              snippet: 'id',
              title: 'pariatur',
              url: 'https://enraged-bin.us',
            },
            {
              date: '1910-05-16T04:45:54.0Z',
              pdfUrl: 'https://pastel-tusk.us/',
              snippet: 'aliquip',
              title: 'ut nulla',
              url: 'https://enraged-bin.us',
            },
          ],
          name: 'Mrs. Shelley Pouros',
        },
      ],
      shareUrl: 'https://handsome-tapioca.com',
    },
    props,
  ) as AmlDetail;
export const getAmlHit = (props: Partial<AmlHit>) =>
  merge(
    {
      fields: {},
      matchTypes: ['dolore', 'incididunt eiusmod deserunt magna', 'et dolor qui ea occaecat'],
      media: [
        {
          date: '1960-11-06T04:39:30.0Z',
          pdfUrl: 'https://variable-populist.net',
          snippet: 'Excepteur eu Ut in',
          title: 'eiusmod proident laboris minim',
          url: 'https://standard-flood.biz',
        },
        {
          date: '1945-11-20T21:01:49.0Z',
          pdfUrl: 'https://variable-populist.net',
          snippet: 'in sunt aute reprehenderit',
          title: 'quis laboris occaecat eiusmod consequat',
          url: 'https://standard-flood.biz',
        },
        {
          date: '1891-09-30T12:39:31.0Z',
          pdfUrl: 'https://variable-populist.net',
          snippet: 'non consectetur',
          title: 'ut deserunt Lorem reprehenderit ullamco',
          url: 'https://standard-flood.biz',
        },
      ],
      name: 'Samantha Bartoletti',
    },
    props,
  ) as AmlHit;
export const getAmlHitMedia = (props: Partial<AmlHitMedia>) =>
  merge(
    {
      date: '1956-12-21T03:07:32.0Z',
      pdfUrl: 'https://ironclad-testimonial.com',
      snippet: 'tempor enim',
      title: 'exercitation commodo',
      url: 'https://agile-sock.us',
    },
    props,
  ) as AmlHitMedia;
export const getAmlMatchKind = (props: Partial<AmlMatchKind>) => (props ?? 'fuzzy_high') as AmlMatchKind;
export const getAnnotation = (props: Partial<Annotation>) =>
  merge(
    {
      id: '4a1976b7-77ea-479e-b359-5b675d60947e',
      isPinned: true,
      note: 'nisi irure Ut velit minim',
      source: {
        id: '651a20ff-03df-4a27-9d07-bd42893453a7',
        kind: 'user',
      },
      timestamp: '1946-09-08T22:55:54.0Z',
    },
    props,
  ) as Annotation;
export const getApiKeyStatus = (props: Partial<ApiKeyStatus>) => (props ?? 'enabled') as ApiKeyStatus;
export const getAssumePartnerRoleRequest = (props: Partial<AssumePartnerRoleRequest>) =>
  merge(
    {
      partnerTenantId: '8e481214-2619-4b3d-8cb4-60cf927b3edc',
    },
    props,
  ) as AssumePartnerRoleRequest;
export const getAssumePartnerRoleResponse = (props: Partial<AssumePartnerRoleResponse>) =>
  merge(
    {
      partnerTenant: {
        allowDomainAccess: true,
        domains: ['ad', 'dolor anim do', 'qui minim fugiat pariatur'],
        id: '85aa9b97-0472-4332-82f2-0d256cb41bb6',
        isAuthMethodSupported: false,
        isDomainAlreadyClaimed: true,
        logoUrl: 'https://ample-season.org',
        name: 'Inez Brown',
        websiteUrl: 'https://utilized-freight.us/',
      },
      token: '40a145be-794e-46fa-ab9f-824c9075599c',
      user: {
        createdAt: '1916-07-04T14:18:49.0Z',
        email: 'mckayla59@gmail.com',
        firstName: 'Stone',
        id: '999d1d00-0a48-4d25-94cb-ea3f371952bc',
        isFirmEmployee: false,
        lastName: 'Collins',
        role: {
          createdAt: '1960-01-18T19:21:10.0Z',
          id: 'a5c8291b-6595-47d2-81ef-3f7854b86755',
          isImmutable: true,
          kind: 'dashboard_user',
          name: 'Leona Wunsch',
          numActiveApiKeys: -63682847,
          numActiveUsers: 34386206,
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
          lastLoginAt: '1914-10-14T13:10:09.0Z',
        },
      },
    },
    props,
  ) as AssumePartnerRoleResponse;
export const getAssumeRoleRequest = (props: Partial<AssumeRoleRequest>) =>
  merge(
    {
      tenantId: '8b775ec9-576d-45b1-ae03-3da415e64ad4',
    },
    props,
  ) as AssumeRoleRequest;
export const getAssumeRoleResponse = (props: Partial<AssumeRoleResponse>) =>
  merge(
    {
      tenant: {
        allowDomainAccess: false,
        allowedPreviewApis: ['tags', 'vault_disaster_recovery', 'legacy_onboarding_status_webhook'],
        companySize: 's51_to100',
        domains: ['deserunt mollit cillum aliquip qui', 'dolor sunt', 'dolor non sint'],
        id: '79917aaa-0111-4f0f-9640-25572835abe5',
        isAuthMethodSupported: true,
        isDomainAlreadyClaimed: true,
        isProdAuthPlaybookRestricted: true,
        isProdKybPlaybookRestricted: true,
        isProdKycPlaybookRestricted: true,
        isProdNeuroEnabled: false,
        isProdSentilinkEnabled: false,
        isSandboxRestricted: true,
        logoUrl: 'https://grumpy-hepatitis.org/',
        name: 'Neal Barrows',
        parent: {
          id: 'bfdead98-71a4-4ba6-9c7a-9cdcd332d30a',
          name: 'Jeanne Lowe',
        },
        supportEmail: 'winston_champlin58@gmail.com',
        supportPhone: '+17673380659',
        supportWebsite: 'https://dense-coin.name/',
        websiteUrl: 'https://profuse-reach.biz/',
      },
      token: '27730d79-2143-4308-bda5-e9b783c94257',
      user: {
        createdAt: '1944-06-13T18:05:27.0Z',
        email: 'bria_treutel@gmail.com',
        firstName: 'Edna',
        id: 'adc8c19c-74cc-42ca-8d74-7de7dcb9f764',
        isFirmEmployee: false,
        lastName: 'Franey',
        role: {
          createdAt: '1908-03-10T21:13:01.0Z',
          id: 'd62772dc-aeb6-46d5-bff6-86a3a691fa7c',
          isImmutable: false,
          kind: 'compliance_partner_dashboard_user',
          name: 'David Pfannerstill I',
          numActiveApiKeys: 84390315,
          numActiveUsers: 48205111,
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
          lastLoginAt: '1907-12-04T07:51:31.0Z',
        },
      },
    },
    props,
  ) as AssumeRoleResponse;
export const getAttestedDeviceData = (props: Partial<AttestedDeviceData>) =>
  merge(
    {
      appBundleId: '12e23fbf-c7bb-4877-ad00-0d9e945eaf65',
      deviceType: 'ios',
      fraudRisk: 'high',
      model: 'adipisicing',
      os: 'nisi amet',
    },
    props,
  ) as AttestedDeviceData;
export const getAuditEvent = (props: Partial<AuditEvent>) =>
  merge(
    {
      detail: {
        data: {
          createdFields: ['document.permit.selfie.mime_type', 'document.id_card.issuing_state', 'id.email'],
          fpId: '8c7b2bfc-c81f-4587-8a10-a3d9f715c283',
        },
        kind: 'create_user',
      },
      id: 'f8a2faba-870e-4ef8-83bf-7c426c8b2b91',
      insightEvent: {
        city: 'Prestonbury',
        country: 'Niue',
        ipAddress: '594 Sporer Flat Suite 180',
        latitude: 50446306.67734215,
        longitude: -26658599.66064717,
        metroCode: 'proident et tempor deserunt',
        postalCode: 'reprehenderit ad',
        region: 'laboris velit dolore',
        regionName: 'Sabrina Gutmann',
        sessionId: '663152e5-b2fa-4b93-b3d1-6c3da51f0db8',
        timeZone: 'cupidatat elit aliquip eu qui',
        timestamp: '1967-09-28T09:44:15.0Z',
        userAgent: 'sed',
      },
      name: 'Bryan Feeney',
      principal: {
        id: '0b4811b1-81bd-410e-9012-9d321690259f',
        kind: 'user',
      },
      tenantId: '66713d96-dc9e-4531-a26f-23efb9af7de9',
      timestamp: '1911-12-03T23:59:54.0Z',
    },
    props,
  ) as AuditEvent;
export const getAuditEventDetail = (props: Partial<AuditEventDetail>) =>
  merge(
    {
      data: {
        createdFields: ['business.corporation_type', 'id.visa_expiration_date', 'document.passport_card.selfie.image'],
        fpId: '16bc7ee9-555a-438d-aba5-495d585b8001',
      },
      kind: 'create_user',
    },
    props,
  ) as AuditEventDetail;
export const getAuditEventName = (props: Partial<AuditEventName>) => (props ?? 'update_org_settings') as AuditEventName;
export const getAuthEvent = (props: Partial<AuthEvent>) =>
  merge(
    {
      createdAt: '1901-01-07T07:59:41.0Z',
      insight: {
        city: 'North April',
        country: 'French Southern Territories',
        ipAddress: '85447 Myron Coves Apt. 731',
        latitude: 65729191.560064256,
        longitude: -24130240.72241497,
        metroCode: 'adipisicing amet deserunt sunt aliquip',
        postalCode: 'occaecat nulla deserunt reprehenderit',
        region: 'occaecat mollit dolor',
        regionName: 'Jon Weimann',
        sessionId: '37dbda7c-2d32-43d0-9e80-518f05f55bd5',
        timeZone: 'sed fugiat id eiusmod aute',
        timestamp: '1940-10-02T20:35:58.0Z',
        userAgent: 'anim incididunt non',
      },
      kind: 'email',
      linkedAttestations: [
        {
          appBundleId: '43d9b925-f4e5-4a74-b929-8182a8a49e64',
          deviceType: 'android',
          fraudRisk: 'high',
          model: 'dolor adipisicing incididunt',
          os: 'anim',
        },
        {
          appBundleId: '43d9b925-f4e5-4a74-b929-8182a8a49e64',
          deviceType: 'ios',
          fraudRisk: 'low',
          model: 'dolor',
          os: 'aliquip pariatur consequat enim',
        },
        {
          appBundleId: '43d9b925-f4e5-4a74-b929-8182a8a49e64',
          deviceType: 'ios',
          fraudRisk: 'low',
          model: 'quis id sunt dolor',
          os: 'qui sed eu et',
        },
      ],
      scope: 'auth',
    },
    props,
  ) as AuthEvent;
export const getAuthEventKind = (props: Partial<AuthEventKind>) => (props ?? 'email') as AuthEventKind;
export const getAuthMethodKind = (props: Partial<AuthMethodKind>) => (props ?? 'email') as AuthMethodKind;
export const getAuthMethodUpdated = (props: Partial<AuthMethodUpdated>) =>
  merge(
    {
      action: 'replace',
      insightEvent: {
        city: 'Lake Emerson',
        country: 'Central African Republic',
        ipAddress: '5862 6th Avenue Suite 592',
        latitude: 56534296.86767891,
        longitude: -69328968.06895012,
        metroCode: 'labore occaecat cupidatat ad',
        postalCode: 'dolor',
        region: 'consectetur ut',
        regionName: 'Timmy Grant',
        sessionId: '75ef382c-523f-44eb-803d-f2b460b5cea8',
        timeZone: 'consectetur tempor',
        timestamp: '1905-09-10T15:24:02.0Z',
        userAgent: 'voluptate nostrud',
      },
      kind: 'passkey',
    },
    props,
  ) as AuthMethodUpdated;
export const getAuthOrgMember = (props: Partial<AuthOrgMember>) =>
  merge(
    {
      email: 'robbie9@gmail.com',
      firstName: 'Efren',
      id: '69100a03-3320-49db-8d5b-c142c225b279',
      isAssumedSession: true,
      isFirmEmployee: false,
      lastName: 'Howell',
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
        allowedPreviewApis: ['vault_integrity', 'vault_disaster_recovery', 'vault_versioning'],
        companySize: 's51_to100',
        domains: ['nostrud officia Duis fugiat', 'aliquip amet Excepteur non', 'sed sit mollit'],
        id: 'd9b0807d-518a-4f3b-9b2a-f2a33b1eb1cb',
        isAuthMethodSupported: false,
        isDomainAlreadyClaimed: true,
        isProdAuthPlaybookRestricted: false,
        isProdKybPlaybookRestricted: false,
        isProdKycPlaybookRestricted: true,
        isProdNeuroEnabled: false,
        isProdSentilinkEnabled: true,
        isSandboxRestricted: true,
        logoUrl: 'https://fond-draft.net/',
        name: 'Edna Bergnaum',
        parent: {
          id: 'ef677e83-638b-4242-acf2-1450a47de0be',
          name: 'Patti Schinner MD',
        },
        supportEmail: 'tate18@gmail.com',
        supportPhone: '+13994827911',
        supportWebsite: 'https://noxious-printer.info/',
        websiteUrl: 'https://variable-slide.com/',
      },
    },
    props,
  ) as AuthOrgMember;
export const getBooleanOperator = (props: Partial<BooleanOperator>) => (props ?? 'not_eq') as BooleanOperator;
export const getBusinessDetail = (props: Partial<BusinessDetail>) =>
  merge(
    {
      entityType: 'dolor voluptate nulla ex',
      formationDate: 'dolore veniam ut laborum',
      formationState: 'Arkansas',
      phoneNumbers: [
        {
          phone: '+17015482953',
          submitted: false,
          verified: true,
        },
        {
          phone: '+17015482953',
          submitted: false,
          verified: false,
        },
        {
          phone: '+17015482953',
          submitted: true,
          verified: true,
        },
      ],
      tin: {
        tin: 'irure Lorem sint est nisi',
        verified: false,
      },
      website: {
        url: 'https://orderly-bowler.info/',
        verified: true,
      },
    },
    props,
  ) as BusinessDetail;
export const getBusinessInsights = (props: Partial<BusinessInsights>) =>
  merge(
    {
      addresses: [
        {
          addressLine1: '955 Else Fords Suite 434',
          addressLine2: '7197 Alanna Green Suite 118',
          city: 'Bartolettiborough',
          cmra: false,
          deliverable: false,
          latitude: 61438263.7966063,
          longitude: 4457951.768473923,
          postalCode: 'dolore eu velit ullamco id',
          propertyType: 'anim',
          sources: 'occaecat Excepteur Ut in ea',
          state: 'North Dakota',
          submitted: false,
          verified: true,
        },
        {
          addressLine1: '955 Else Fords Suite 434',
          addressLine2: '7197 Alanna Green Suite 118',
          city: 'Bartolettiborough',
          cmra: false,
          deliverable: false,
          latitude: -64001289.03724207,
          longitude: -29275031.179681316,
          postalCode: 'exercitation est Lorem sed aliqua',
          propertyType: 'mollit incididunt ipsum',
          sources: 'Ut id irure est velit',
          state: 'North Dakota',
          submitted: false,
          verified: false,
        },
        {
          addressLine1: '955 Else Fords Suite 434',
          addressLine2: '7197 Alanna Green Suite 118',
          city: 'Bartolettiborough',
          cmra: false,
          deliverable: false,
          latitude: 13562179.037463233,
          longitude: 27046088.981884748,
          postalCode: 'ea Lorem',
          propertyType: 'nulla',
          sources: 'sunt',
          state: 'North Dakota',
          submitted: true,
          verified: false,
        },
      ],
      details: {
        entityType: 'dolore',
        formationDate: 'sed ea',
        formationState: 'Iowa',
        phoneNumbers: [
          {
            phone: '+14597131340',
            submitted: false,
            verified: false,
          },
          {
            phone: '+14597131340',
            submitted: false,
            verified: false,
          },
          {
            phone: '+14597131340',
            submitted: true,
            verified: true,
          },
        ],
        tin: {
          tin: 'sed est ea',
          verified: false,
        },
        website: {
          url: 'https://strong-label.name',
          verified: true,
        },
      },
      names: [
        {
          kind: 'cupidatat laborum nulla',
          name: 'Leland Aufderhar',
          sources: 'consectetur proident nisi elit in',
          subStatus: 'incididunt',
          submitted: false,
          verified: false,
        },
        {
          kind: 'elit in officia consectetur',
          name: 'Leland Aufderhar',
          sources: 'mollit',
          subStatus: 'adipisicing ut Lorem dolore culpa',
          submitted: true,
          verified: false,
        },
        {
          kind: 'in sed ad',
          name: 'Leland Aufderhar',
          sources: 'in',
          subStatus: 'et sint pariatur quis tempor',
          submitted: false,
          verified: false,
        },
      ],
      people: [
        {
          associationVerified: false,
          name: 'Timothy Kuhlman',
          role: 'ut',
          sources: 'proident',
          submitted: false,
        },
        {
          associationVerified: true,
          name: 'Timothy Kuhlman',
          role: 'ad occaecat eiusmod sit',
          sources: 'velit',
          submitted: true,
        },
        {
          associationVerified: true,
          name: 'Timothy Kuhlman',
          role: 'elit qui Ut dolore',
          sources: 'proident adipisicing aute magna',
          submitted: false,
        },
      ],
      registrations: [
        {
          addresses: ['aliquip exercitation', 'anim velit reprehenderit aute', 'qui ex'],
          entityType: 'quis ut id deserunt consectetur',
          fileNumber: 'in magna',
          jurisdiction: 'mollit magna',
          name: 'Gregg Hammes',
          officers: [
            {
              name: 'Linda McLaughlin',
              roles: 'dolore occaecat',
            },
            {
              name: 'Linda McLaughlin',
              roles: 'qui dolore ullamco eiusmod',
            },
            {
              name: 'Linda McLaughlin',
              roles: 'Duis eiusmod',
            },
          ],
          registeredAgent: 'in',
          registrationDate: 'pariatur sunt',
          source: 'sed eiusmod',
          state: 'Maine',
          status: 'ut',
          subStatus: 'nisi adipisicing ea ullamco anim',
        },
        {
          addresses: ['tempor ex deserunt nostrud aliquip', 'minim quis laboris ea', 'anim dolore ipsum'],
          entityType: 'velit in esse',
          fileNumber: 'mollit',
          jurisdiction: 'labore fugiat',
          name: 'Gregg Hammes',
          officers: [
            {
              name: 'Linda McLaughlin',
              roles: 'cillum aliquip ut Lorem irure',
            },
            {
              name: 'Linda McLaughlin',
              roles: 'ad do',
            },
            {
              name: 'Linda McLaughlin',
              roles: 'qui',
            },
          ],
          registeredAgent: 'ullamco dolore esse irure sint',
          registrationDate: 'qui dolore tempor',
          source: 'aliquip laboris voluptate sit est',
          state: 'Maine',
          status: 'tempor aliquip',
          subStatus: 'aute irure',
        },
        {
          addresses: ['nostrud ad fugiat est dolore', 'incididunt amet', 'sint ea ex'],
          entityType: 'veniam est',
          fileNumber: 'ut laborum',
          jurisdiction: 'Ut culpa in cupidatat id',
          name: 'Gregg Hammes',
          officers: [
            {
              name: 'Linda McLaughlin',
              roles: 'ut',
            },
            {
              name: 'Linda McLaughlin',
              roles: 'officia elit',
            },
            {
              name: 'Linda McLaughlin',
              roles: 'velit sint irure consequat',
            },
          ],
          registeredAgent: 'in',
          registrationDate: 'consectetur non commodo Excepteur',
          source: 'adipisicing ad proident culpa',
          state: 'Maine',
          status: 'magna amet voluptate quis nostrud',
          subStatus: 'incididunt',
        },
      ],
      watchlist: {
        business: [
          {
            hits: [
              {
                agency: 'eiusmod velit',
                agencyAbbr: 'irure labore mollit anim',
                agencyInformationUrl: 'https://linear-humidity.name/',
                agencyListUrl: 'https://unsung-bench.name/',
                entityAliases: ['in dolor Excepteur', 'eiusmod ut Duis voluptate sunt', 'Excepteur'],
                entityName: 'Jeremy Ebert',
                listCountry: 'Northern Mariana Islands',
                listName: 'Helen Green',
                url: 'https://rundown-poppy.us',
              },
              {
                agency: 'cillum aute et id est',
                agencyAbbr: 'et culpa dolore laborum nostrud',
                agencyInformationUrl: 'https://linear-humidity.name/',
                agencyListUrl: 'https://unsung-bench.name/',
                entityAliases: ['non tempor dolor', 'proident', 'et'],
                entityName: 'Jeremy Ebert',
                listCountry: 'Northern Mariana Islands',
                listName: 'Helen Green',
                url: 'https://rundown-poppy.us',
              },
              {
                agency: 'incididunt dolore',
                agencyAbbr: 'deserunt Lorem reprehenderit esse eiusmod',
                agencyInformationUrl: 'https://linear-humidity.name/',
                agencyListUrl: 'https://unsung-bench.name/',
                entityAliases: ['sunt quis est ipsum', 'amet culpa velit occaecat minim', 'dolor'],
                entityName: 'Jeremy Ebert',
                listCountry: 'Northern Mariana Islands',
                listName: 'Helen Green',
                url: 'https://rundown-poppy.us',
              },
            ],
            screenedEntityName: 'Mrs. Jessie Dickens',
          },
          {
            hits: [
              {
                agency: 'in sunt',
                agencyAbbr: 'elit Ut',
                agencyInformationUrl: 'https://linear-humidity.name/',
                agencyListUrl: 'https://unsung-bench.name/',
                entityAliases: ['Lorem', 'Ut dolore Duis velit', 'nisi dolor quis'],
                entityName: 'Jeremy Ebert',
                listCountry: 'Northern Mariana Islands',
                listName: 'Helen Green',
                url: 'https://rundown-poppy.us',
              },
              {
                agency: 'elit amet',
                agencyAbbr: 'id laborum ullamco laboris eiusmod',
                agencyInformationUrl: 'https://linear-humidity.name/',
                agencyListUrl: 'https://unsung-bench.name/',
                entityAliases: ['dolore', 'cillum nostrud minim officia nisi', 'fugiat'],
                entityName: 'Jeremy Ebert',
                listCountry: 'Northern Mariana Islands',
                listName: 'Helen Green',
                url: 'https://rundown-poppy.us',
              },
              {
                agency: 'reprehenderit minim nostrud Ut',
                agencyAbbr: 'ex magna',
                agencyInformationUrl: 'https://linear-humidity.name/',
                agencyListUrl: 'https://unsung-bench.name/',
                entityAliases: ['anim officia', 'non', 'adipisicing'],
                entityName: 'Jeremy Ebert',
                listCountry: 'Northern Mariana Islands',
                listName: 'Helen Green',
                url: 'https://rundown-poppy.us',
              },
            ],
            screenedEntityName: 'Mrs. Jessie Dickens',
          },
          {
            hits: [
              {
                agency: 'cupidatat',
                agencyAbbr: 'voluptate irure Excepteur dolore',
                agencyInformationUrl: 'https://linear-humidity.name/',
                agencyListUrl: 'https://unsung-bench.name/',
                entityAliases: [
                  'dolore reprehenderit incididunt fugiat deserunt',
                  'ut nostrud irure',
                  'incididunt cupidatat',
                ],
                entityName: 'Jeremy Ebert',
                listCountry: 'Northern Mariana Islands',
                listName: 'Helen Green',
                url: 'https://rundown-poppy.us',
              },
              {
                agency: 'sit aliquip dolor in nisi',
                agencyAbbr: 'dolor est Lorem esse tempor',
                agencyInformationUrl: 'https://linear-humidity.name/',
                agencyListUrl: 'https://unsung-bench.name/',
                entityAliases: ['est labore', 'irure laborum minim', 'laborum sed'],
                entityName: 'Jeremy Ebert',
                listCountry: 'Northern Mariana Islands',
                listName: 'Helen Green',
                url: 'https://rundown-poppy.us',
              },
              {
                agency: 'Lorem',
                agencyAbbr: 'anim irure',
                agencyInformationUrl: 'https://linear-humidity.name/',
                agencyListUrl: 'https://unsung-bench.name/',
                entityAliases: ['amet dolor', 'nisi quis dolor dolor', 'sunt non'],
                entityName: 'Jeremy Ebert',
                listCountry: 'Northern Mariana Islands',
                listName: 'Helen Green',
                url: 'https://rundown-poppy.us',
              },
            ],
            screenedEntityName: 'Mrs. Jessie Dickens',
          },
        ],
        hitCount: 94217827,
        people: [
          {
            hits: [
              {
                agency: 'in magna veniam mollit velit',
                agencyAbbr: 'nulla occaecat labore',
                agencyInformationUrl: 'https://posh-worth.org/',
                agencyListUrl: 'https://naughty-heartache.net/',
                entityAliases: ['tempor enim ea qui', 'culpa', 'anim dolore Duis'],
                entityName: 'Leroy Rogahn',
                listCountry: 'Thailand',
                listName: "Marilyn D'Amore",
                url: 'https://superficial-midwife.org',
              },
              {
                agency: 'ea adipisicing',
                agencyAbbr: 'adipisicing id consequat',
                agencyInformationUrl: 'https://posh-worth.org/',
                agencyListUrl: 'https://naughty-heartache.net/',
                entityAliases: [
                  'consectetur sed irure',
                  'consectetur quis aliquip veniam',
                  'Lorem adipisicing magna in',
                ],
                entityName: 'Leroy Rogahn',
                listCountry: 'Thailand',
                listName: "Marilyn D'Amore",
                url: 'https://superficial-midwife.org',
              },
              {
                agency: 'ipsum veniam aute',
                agencyAbbr: 'fugiat aliqua',
                agencyInformationUrl: 'https://posh-worth.org/',
                agencyListUrl: 'https://naughty-heartache.net/',
                entityAliases: ['in et non', 'labore ipsum Duis', 'cillum nostrud proident'],
                entityName: 'Leroy Rogahn',
                listCountry: 'Thailand',
                listName: "Marilyn D'Amore",
                url: 'https://superficial-midwife.org',
              },
            ],
            screenedEntityName: 'Gloria Wehner',
          },
          {
            hits: [
              {
                agency: 'occaecat irure commodo nulla in',
                agencyAbbr: 'sint Ut ex',
                agencyInformationUrl: 'https://posh-worth.org/',
                agencyListUrl: 'https://naughty-heartache.net/',
                entityAliases: ['tempor', 'adipisicing sunt aliquip', 'in officia'],
                entityName: 'Leroy Rogahn',
                listCountry: 'Thailand',
                listName: "Marilyn D'Amore",
                url: 'https://superficial-midwife.org',
              },
              {
                agency: 'culpa dolore et',
                agencyAbbr: 'ipsum sunt',
                agencyInformationUrl: 'https://posh-worth.org/',
                agencyListUrl: 'https://naughty-heartache.net/',
                entityAliases: ['ullamco Lorem Duis', 'aute nostrud reprehenderit adipisicing', 'officia'],
                entityName: 'Leroy Rogahn',
                listCountry: 'Thailand',
                listName: "Marilyn D'Amore",
                url: 'https://superficial-midwife.org',
              },
              {
                agency: 'do voluptate sed veniam',
                agencyAbbr: 'proident',
                agencyInformationUrl: 'https://posh-worth.org/',
                agencyListUrl: 'https://naughty-heartache.net/',
                entityAliases: ['nulla', 'consequat tempor', 'est adipisicing exercitation'],
                entityName: 'Leroy Rogahn',
                listCountry: 'Thailand',
                listName: "Marilyn D'Amore",
                url: 'https://superficial-midwife.org',
              },
            ],
            screenedEntityName: 'Gloria Wehner',
          },
          {
            hits: [
              {
                agency: 'est incididunt',
                agencyAbbr: 'tempor',
                agencyInformationUrl: 'https://posh-worth.org/',
                agencyListUrl: 'https://naughty-heartache.net/',
                entityAliases: ['in irure', 'ullamco tempor sed aliquip', 'mollit fugiat consequat pariatur cillum'],
                entityName: 'Leroy Rogahn',
                listCountry: 'Thailand',
                listName: "Marilyn D'Amore",
                url: 'https://superficial-midwife.org',
              },
              {
                agency: 'nostrud esse nulla laboris',
                agencyAbbr: 'mollit enim elit',
                agencyInformationUrl: 'https://posh-worth.org/',
                agencyListUrl: 'https://naughty-heartache.net/',
                entityAliases: ['ipsum', 'elit velit', 'exercitation Lorem dolore commodo'],
                entityName: 'Leroy Rogahn',
                listCountry: 'Thailand',
                listName: "Marilyn D'Amore",
                url: 'https://superficial-midwife.org',
              },
              {
                agency: 'culpa dolore cillum velit dolore',
                agencyAbbr: 'consequat cillum eiusmod ipsum aute',
                agencyInformationUrl: 'https://posh-worth.org/',
                agencyListUrl: 'https://naughty-heartache.net/',
                entityAliases: ['aliqua consequat esse dolor ut', 'deserunt sunt', 'incididunt dolore ut ea consequat'],
                entityName: 'Leroy Rogahn',
                listCountry: 'Thailand',
                listName: "Marilyn D'Amore",
                url: 'https://superficial-midwife.org',
              },
            ],
            screenedEntityName: 'Gloria Wehner',
          },
        ],
      },
    },
    props,
  ) as BusinessInsights;
export const getBusinessOwnerKind = (props: Partial<BusinessOwnerKind>) => (props ?? 'primary') as BusinessOwnerKind;
export const getBusinessOwnerSource = (props: Partial<BusinessOwnerSource>) =>
  (props ?? 'tenant') as BusinessOwnerSource;
export const getCipKind = (props: Partial<CipKind>) => (props ?? 'alpaca') as CipKind;
export const getClientDecryptRequest = (props: Partial<ClientDecryptRequest>) =>
  merge(
    {
      fields: ['id.first_name', 'id.last_name'],
      reason: 'Lorem ipsum dolor',
      transforms: null,
    },
    props,
  ) as ClientDecryptRequest;
export const getClientIdentity = (props: Partial<ClientIdentity>) =>
  merge(
    {
      certificate: 'reprehenderit in in ea',
      key: '860a93d5-ba15-433a-b6a9-924b2d293fd8',
    },
    props,
  ) as ClientIdentity;
export const getCollectedDataOption = (props: Partial<CollectedDataOption>) => (props ?? 'dob') as CollectedDataOption;
export const getCompanySize = (props: Partial<CompanySize>) => (props ?? 's1_to10') as CompanySize;
export const getComplianceCompanySummary = (props: Partial<ComplianceCompanySummary>) =>
  merge(
    {
      companyName: 'Jimmy Botsford MD',
      id: 'edf2558e-d4fa-4426-be81-b4310f15288f',
      numActivePlaybooks: 94968794,
      numControlsComplete: 8259615,
      numControlsTotal: -71318476,
    },
    props,
  ) as ComplianceCompanySummary;
export const getComplianceDocData = (props: Partial<ComplianceDocData>) =>
  merge(
    {
      data: {
        url: 'https://self-assured-developmental.name/',
      },
      kind: 'external_url',
    },
    props,
  ) as ComplianceDocData;
export const getComplianceDocDataKind = (props: Partial<ComplianceDocDataKind>) =>
  (props ?? 'file_upload') as ComplianceDocDataKind;
export const getComplianceDocEvent = (props: Partial<ComplianceDocEvent>) =>
  merge(
    {
      actor: {
        org: 'ut',
        user: {
          firstName: 'Hortense',
          id: '7bc8205d-ab0a-473f-91e2-fbce0129a93b',
          lastName: 'Langworth',
        },
      },
      event: {
        data: {
          description: 'aute id culpa in in',
          name: 'Willie Dietrich',
          templateId: '8857d463-ea3e-4784-a025-a1fee24618e0',
        },
        kind: 'requested',
      },
      timestamp: '1940-05-30T21:21:16.0Z',
    },
    props,
  ) as ComplianceDocEvent;
export const getComplianceDocEventAssigned = (props: Partial<ComplianceDocEventAssigned>) =>
  merge(
    {
      assignedTo: {
        org: 'ad qui eu ea enim',
        user: {
          firstName: 'Justina',
          id: '03ae6780-8b3b-4b29-88e9-6968f9e6fa7e',
          lastName: 'Thiel',
        },
      },
      kind: 'partner_tenant',
    },
    props,
  ) as ComplianceDocEventAssigned;
export const getComplianceDocEventRequested = (props: Partial<ComplianceDocEventRequested>) =>
  merge(
    {
      description: 'deserunt',
      name: 'Lynne Gusikowski',
      templateId: '1184e180-3756-480a-a408-4bba45444841',
    },
    props,
  ) as ComplianceDocEventRequested;
export const getComplianceDocEventReviewed = (props: Partial<ComplianceDocEventReviewed>) =>
  merge(
    {
      decision: 'accepted',
      note: 'aliqua est laboris',
    },
    props,
  ) as ComplianceDocEventReviewed;
export const getComplianceDocEventSubmitted = (props: Partial<ComplianceDocEventSubmitted>) =>
  merge(
    {
      kind: 'external_url',
      submissionId: 'e6730008-f84c-4201-a514-fc3e2a8bfda0',
    },
    props,
  ) as ComplianceDocEventSubmitted;
export const getComplianceDocEventType = (props: Partial<ComplianceDocEventType>) =>
  merge(
    {
      data: {
        description: 'tempor Duis exercitation sunt',
        name: 'Freda Mitchell',
        templateId: 'e5d2d7bb-56b6-458f-85c8-13c3a0f78597',
      },
      kind: 'requested',
    },
    props,
  ) as ComplianceDocEventType;
export const getComplianceDocReviewDecision = (props: Partial<ComplianceDocReviewDecision>) =>
  (props ?? 'rejected') as ComplianceDocReviewDecision;
export const getComplianceDocStatus = (props: Partial<ComplianceDocStatus>) =>
  (props ?? 'not_requested') as ComplianceDocStatus;
export const getComplianceDocSubmission = (props: Partial<ComplianceDocSubmission>) =>
  merge(
    {
      createdAt: '1956-05-17T17:13:22.0Z',
      data: {
        data: {
          url: 'https://misguided-boyfriend.name/',
        },
        kind: 'external_url',
      },
      id: '583705a6-7b6f-4076-9fbf-28b37130d1d9',
    },
    props,
  ) as ComplianceDocSubmission;
export const getComplianceDocSummary = (props: Partial<ComplianceDocSummary>) =>
  merge(
    {
      activeRequestId: 'd6a13f47-c6c7-40fe-a7fd-9595d0e48433',
      activeReviewId: 'a93a4a4c-a624-44e7-93c2-4ad00ac0a3f1',
      activeSubmissionId: '1674a543-fc5a-42da-969c-108b235ef133',
      description: 'labore qui',
      id: '5800c909-35c2-4cb0-b5ce-b55e47fb66fd',
      lastUpdated: '1918-11-09T03:52:09.0Z',
      name: 'Theresa Boehm',
      partnerTenantAssignee: {
        firstName: 'Dianna',
        id: '512badb7-d319-4383-a4aa-e89c42f3563e',
        lastName: 'Mann',
      },
      status: 'waiting_for_upload',
      templateId: '0d29299f-538d-4263-a0ad-17772626e7fb',
      tenantAssignee: {
        firstName: 'Theron',
        id: 'f6c8fe21-b824-455a-9e42-74c7021304c0',
        lastName: 'Frami',
      },
    },
    props,
  ) as ComplianceDocSummary;
export const getComplianceDocTemplate = (props: Partial<ComplianceDocTemplate>) =>
  merge(
    {
      id: '816a2bb6-a479-439c-a991-af43356bb7e7',
      latestVersion: {
        createdAt: '1954-08-16T16:26:11.0Z',
        createdByPartnerTenantUser: {
          firstName: 'Afton',
          id: '475e9511-b1e2-499e-a49a-a63d10ed0dc3',
          lastName: 'Yost',
        },
        description: 'ut cupidatat culpa dolor cillum',
        id: '9e8a9d16-6141-4b88-9ee6-916d2f309d37',
        name: 'Penny Corwin',
        templateId: '2e7150ee-c306-4c7b-b80a-42cb29142f2e',
      },
    },
    props,
  ) as ComplianceDocTemplate;
export const getComplianceDocTemplateVersion = (props: Partial<ComplianceDocTemplateVersion>) =>
  merge(
    {
      createdAt: '1927-06-22T17:43:41.0Z',
      createdByPartnerTenantUser: {
        firstName: 'Adele',
        id: '9a6d4dfa-5e01-42a3-9b36-bb395b25119e',
        lastName: 'Waelchi',
      },
      description: 'occaecat esse',
      id: 'b8069fed-4c43-4b14-ae0d-4b06156f40bf',
      name: 'Angie Trantow',
      templateId: 'ea2a6af3-566e-45ba-a8b1-7bef137d48fc',
    },
    props,
  ) as ComplianceDocTemplateVersion;
export const getContactInfoKind = (props: Partial<ContactInfoKind>) => (props ?? 'email') as ContactInfoKind;
export const getCopyPlaybookRequest = (props: Partial<CopyPlaybookRequest>) =>
  merge(
    {
      isLive: false,
      name: 'Courtney Lockman',
    },
    props,
  ) as CopyPlaybookRequest;
export const getCountrySpecificDocumentMapping = (props: Partial<CountrySpecificDocumentMapping>) =>
  merge({}, props) as CountrySpecificDocumentMapping;
export const getCreateAnnotationRequest = (props: Partial<CreateAnnotationRequest>) =>
  merge(
    {
      isPinned: true,
      note: 'consectetur',
    },
    props,
  ) as CreateAnnotationRequest;
export const getCreateApiKeyRequest = (props: Partial<CreateApiKeyRequest>) =>
  merge(
    {
      name: 'Nicholas Schuppe',
      roleId: '35f752de-0834-40ba-a98c-6c2e801d21f1',
    },
    props,
  ) as CreateApiKeyRequest;
export const getCreateComplianceDocRequest = (props: Partial<CreateComplianceDocRequest>) =>
  merge(
    {
      description: 'in ea',
      name: 'Wesley Greenfelder',
      templateVersionId: '67910d0a-26c9-45c9-92da-114698ecd4a7',
    },
    props,
  ) as CreateComplianceDocRequest;
export const getCreateComplianceDocTemplateRequest = (props: Partial<CreateComplianceDocTemplateRequest>) =>
  merge(
    {
      description: 'aliquip cillum voluptate ullamco proident',
      name: 'Sonya Herman',
    },
    props,
  ) as CreateComplianceDocTemplateRequest;
export const getCreateEntityTokenRequest = (props: Partial<CreateEntityTokenRequest>) =>
  merge(
    {
      key: 'eca635e0-a843-4a35-9b11-558f97e098c3',
      kind: 'update_auth_methods',
      sendLink: false,
    },
    props,
  ) as CreateEntityTokenRequest;
export const getCreateEntityTokenResponse = (props: Partial<CreateEntityTokenResponse>) =>
  merge(
    {
      deliveryMethod: 'phone',
      expiresAt: '1963-11-25T22:10:26.0Z',
      link: 'dolore',
      token: 'cc5078b5-e8b7-4656-973c-4c8a89feee4c',
    },
    props,
  ) as CreateEntityTokenResponse;
export const getCreateKycLinksRequest = (props: Partial<CreateKycLinksRequest>) =>
  merge(
    {
      sendToBoIds: ['bo_EBYciq9X2bkIPMMqnL4R9P'],
    },
    props,
  ) as CreateKycLinksRequest;
export const getCreateListEntryRequest = (props: Partial<CreateListEntryRequest>) =>
  merge(
    {
      entries: ['exercitation cupidatat Ut Excepteur', 'dolor id sit', 'mollit exercitation tempor laboris do'],
    },
    props,
  ) as CreateListEntryRequest;
export const getCreateListRequest = (props: Partial<CreateListRequest>) =>
  merge(
    {
      alias: 'qui',
      entries: ['qui id deserunt ut', 'dolore', 'mollit in'],
      kind: 'ip_address',
      name: 'Mrs. Kari Block',
    },
    props,
  ) as CreateListRequest;
export const getCreateOnboardingConfigurationRequest = (props: Partial<CreateOnboardingConfigurationRequest>) =>
  merge(
    {
      allowInternationalResidents: true,
      allowReonboard: true,
      allowUsResidents: false,
      allowUsTerritories: false,
      businessDocumentsToCollect: [
        {
          data: {
            collectSelfie: false,
            documentTypesAndCountries: {
              countrySpecific: {},
              global: ['passport', 'id_card', 'residence_document'],
            },
          },
          kind: 'identity',
        },
        {
          data: {
            collectSelfie: false,
            documentTypesAndCountries: {
              countrySpecific: {},
              global: ['residence_document', 'drivers_license', 'voter_identification'],
            },
          },
          kind: 'identity',
        },
        {
          data: {
            collectSelfie: false,
            documentTypesAndCountries: {
              countrySpecific: {},
              global: ['passport_card', 'voter_identification', 'visa'],
            },
          },
          kind: 'identity',
        },
      ],
      cipKind: 'alpaca',
      curpValidationEnabled: true,
      deprecatedCanAccessData: ['us_legal_status', 'business_tin', 'business_name'],
      docScanForOptionalSsn: 'business_kyced_beneficial_owners',
      documentTypesAndCountries: {
        countrySpecific: {},
        global: ['id_card', 'voter_identification', 'permit'],
      },
      documentsToCollect: [
        {
          data: {
            collectSelfie: false,
            documentTypesAndCountries: {
              countrySpecific: {},
              global: ['drivers_license', 'passport_card', 'drivers_license'],
            },
          },
          kind: 'identity',
        },
        {
          data: {
            collectSelfie: true,
            documentTypesAndCountries: {
              countrySpecific: {},
              global: ['passport_card', 'id_card', 'id_card'],
            },
          },
          kind: 'identity',
        },
        {
          data: {
            collectSelfie: true,
            documentTypesAndCountries: {
              countrySpecific: {},
              global: ['voter_identification', 'residence_document', 'voter_identification'],
            },
          },
          kind: 'identity',
        },
      ],
      enhancedAml: {
        adverseMedia: false,
        enhancedAml: false,
        matchKind: 'exact_name_and_dob_year',
        ofac: true,
        pep: false,
      },
      internationalCountryRestrictions: ['GI', 'MK', 'PW'],
      isDocFirstFlow: true,
      isNoPhoneFlow: true,
      kind: 'document',
      mustCollectData: ['dob', 'us_tax_id', 'email'],
      name: 'Guadalupe Kuphal',
      optionalData: ['card', 'card', 'ssn9'],
      promptForPasskey: false,
      requiredAuthMethods: ['phone', 'phone', 'email'],
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
  ) as CreateOnboardingConfigurationRequest;
export const getCreateOrgFrequentNoteRequest = (props: Partial<CreateOrgFrequentNoteRequest>) =>
  merge(
    {
      content: 'ut',
      kind: 'manual_review',
    },
    props,
  ) as CreateOrgFrequentNoteRequest;
export const getCreateOrgTenantTagRequest = (props: Partial<CreateOrgTenantTagRequest>) =>
  merge(
    {
      kind: 'person',
      tag: 'sunt qui eiusmod pariatur magna',
    },
    props,
  ) as CreateOrgTenantTagRequest;
export const getCreateProxyConfigRequest = (props: Partial<CreateProxyConfigRequest>) =>
  merge(
    {
      accessReason: 'nostrud cillum qui consequat',
      clientIdentity: {
        certificate: 'cillum labore',
        key: '400eae3b-9666-47da-937e-beb2a6b87aa8',
      },
      headers: [
        {
          name: 'Guy Kuvalis',
          value: 'in',
        },
        {
          name: 'Guy Kuvalis',
          value: 'consequat ex adipisicing',
        },
        {
          name: 'Guy Kuvalis',
          value: 'cupidatat sit do',
        },
      ],
      ingressSettings: {
        contentType: 'json',
        rules: [
          {
            target: 'qui anim',
            token: 'e4b6253b-ca7c-4807-897d-7bd92b5ccdd5',
          },
          {
            target: 'Ut aliquip',
            token: 'e4b6253b-ca7c-4807-897d-7bd92b5ccdd5',
          },
          {
            target: 'culpa nisi non fugiat',
            token: 'e4b6253b-ca7c-4807-897d-7bd92b5ccdd5',
          },
        ],
      },
      method: 'consequat adipisicing Excepteur laboris',
      name: 'Adrienne Crist V',
      pinnedServerCertificates: ['anim', 'minim', 'incididunt ullamco irure Ut aliquip'],
      secretHeaders: [
        {
          name: 'Mark Emmerich',
          value: 'aute ullamco',
        },
        {
          name: 'Mark Emmerich',
          value: 'ipsum deserunt eiusmod',
        },
        {
          name: 'Mark Emmerich',
          value: 'culpa labore id fugiat',
        },
      ],
      url: 'https://far-flung-airline.net/',
    },
    props,
  ) as CreateProxyConfigRequest;
export const getCreateReviewRequest = (props: Partial<CreateReviewRequest>) =>
  merge(
    {
      decision: 'accepted',
      note: 'proident qui Duis elit',
      submissionId: '17145710-66e3-490d-bb46-f8695a0060e7',
    },
    props,
  ) as CreateReviewRequest;
export const getCreateRule = (props: Partial<CreateRule>) =>
  merge(
    {
      isShadow: false,
      name: 'Michael Conroy',
      ruleAction: 'step_up.identity_proof_of_ssn',
      ruleExpression: [
        {
          field: 'document_possible_fake_image',
          op: 'eq',
          value: true,
        },
        {
          field: 'ssn_not_on_file',
          op: 'eq',
          value: true,
        },
        {
          field: 'business_name_alternate_match',
          op: 'not_eq',
          value: false,
        },
      ],
    },
    props,
  ) as CreateRule;
export const getCreateTagRequest = (props: Partial<CreateTagRequest>) =>
  merge(
    {
      tag: 'transaction_chargeback',
    },
    props,
  ) as CreateTagRequest;
export const getCreateTenantAndroidAppMetaRequest = (props: Partial<CreateTenantAndroidAppMetaRequest>) =>
  merge(
    {
      apkCertSha256S: ['ad', 'sint', 'quis do cupidatat dolor Duis'],
      integrityDecryptionKey: '32e4cf34-afe9-4077-bcf4-e5b2e0f55f8f',
      integrityVerificationKey: '95f9d6ab-ee80-4e3e-a241-b6f9ce73c908',
      packageNames: ['exercitation in Ut', 'Lorem exercitation magna', 'eu Ut adipisicing laboris'],
    },
    props,
  ) as CreateTenantAndroidAppMetaRequest;
export const getCreateTenantIosAppMetaRequest = (props: Partial<CreateTenantIosAppMetaRequest>) =>
  merge(
    {
      appBundleIds: ['laborum', 'id eiusmod', 'laborum'],
      deviceCheckKeyId: '189cd392-3c0a-4782-b9c4-0981aaa999a8',
      deviceCheckPrivateKey: 'ab024154-a122-4f06-91b0-66e67d14624f',
      teamId: '7130f26b-11f9-4739-9d78-a9c11f7d5bde',
    },
    props,
  ) as CreateTenantIosAppMetaRequest;
export const getCreateTenantRoleRequest = (props: Partial<CreateTenantRoleRequest>) =>
  merge(
    {
      kind: 'dashboard_user',
      name: 'Karla Farrell',
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
  ) as CreateTenantRoleRequest;
export const getCreateTenantUserRequest = (props: Partial<CreateTenantUserRequest>) =>
  merge(
    {
      email: 'vicky_hodkiewicz@gmail.com',
      firstName: 'Landen',
      lastName: 'Streich',
      omitEmailInvite: false,
      redirectUrl: 'https://minor-lifestyle.us',
      roleId: '52d952e1-ef33-4010-88e3-eb688d944361',
    },
    props,
  ) as CreateTenantUserRequest;
export const getCreateTokenResponse = (props: Partial<CreateTokenResponse>) =>
  merge(
    {
      expiresAt: '1943-07-30T01:24:12.0Z',
      kind: 'trigger',
      link: 'https://verify.onefootprint.com/?type=user#utok_ssPvNRjNGdk8Iq9qgf6lsO2iTVhALuR4Nt',
      token: 'utok_ssPvNRjNGdk8Iq9qgf6lsO2iTVhALuR4Nt',
    },
    props,
  ) as CreateTokenResponse;
export const getCursorPaginatedAuditEvent = (props: Partial<CursorPaginatedAuditEvent>) =>
  merge(
    {
      data: [
        {
          detail: {
            data: {
              createdFields: [
                'document.residence_document.curp',
                'document.passport_card.nationality',
                'document.voter_identification.first_name',
              ],
              fpId: '1464a5d0-dfa3-47bd-8800-6c194c167881',
            },
            kind: 'create_user',
          },
          id: '43da3360-ccb2-4bc8-a9c5-d4774c63ceba',
          insightEvent: {
            city: 'Aftonfield',
            country: 'Slovakia',
            ipAddress: '9590 Park Street Suite 334',
            latitude: -4863572.370384842,
            longitude: -32644510.035669863,
            metroCode: 'ipsum',
            postalCode: 'incididunt anim sunt',
            region: 'culpa eu',
            regionName: 'Janice Weber',
            sessionId: 'b05b2b7c-6c87-43b0-a18c-38f02fc35c3d',
            timeZone: 'id exercitation pariatur',
            timestamp: '1942-06-01T07:02:22.0Z',
            userAgent: 'eiusmod minim',
          },
          name: 'Rosemary Wisozk',
          principal: {
            id: 'b0674a6a-7178-4fff-b89f-4ef1868e9e27',
            kind: 'user',
          },
          tenantId: '71a2a286-c332-4944-9810-14b885a596bb',
          timestamp: '1940-08-05T10:29:01.0Z',
        },
        {
          detail: {
            data: {
              createdFields: [
                'bank.*.ach_routing_number',
                'document.voter_identification.classified_document_type',
                'id.visa_expiration_date',
              ],
              fpId: '1464a5d0-dfa3-47bd-8800-6c194c167881',
            },
            kind: 'create_user',
          },
          id: '43da3360-ccb2-4bc8-a9c5-d4774c63ceba',
          insightEvent: {
            city: 'Aftonfield',
            country: 'Slovakia',
            ipAddress: '9590 Park Street Suite 334',
            latitude: -38453806.31230899,
            longitude: -56483110.50001147,
            metroCode: 'occaecat voluptate sint pariatur',
            postalCode: 'in',
            region: 'dolor eu culpa',
            regionName: 'Janice Weber',
            sessionId: 'b05b2b7c-6c87-43b0-a18c-38f02fc35c3d',
            timeZone: 'in sit est aliqua dolore',
            timestamp: '1911-04-08T02:01:50.0Z',
            userAgent: 'sunt veniam',
          },
          name: 'Rosemary Wisozk',
          principal: {
            id: 'b0674a6a-7178-4fff-b89f-4ef1868e9e27',
            kind: 'user',
          },
          tenantId: '71a2a286-c332-4944-9810-14b885a596bb',
          timestamp: '1962-03-20T06:58:16.0Z',
        },
        {
          detail: {
            data: {
              createdFields: [
                'document.residence_document.selfie.mime_type',
                'investor_profile.political_organization',
                'document.visa.back.image',
              ],
              fpId: '1464a5d0-dfa3-47bd-8800-6c194c167881',
            },
            kind: 'create_user',
          },
          id: '43da3360-ccb2-4bc8-a9c5-d4774c63ceba',
          insightEvent: {
            city: 'Aftonfield',
            country: 'Slovakia',
            ipAddress: '9590 Park Street Suite 334',
            latitude: -26741273.763514474,
            longitude: -95315787.81703036,
            metroCode: 'ut ipsum',
            postalCode: 'id culpa pariatur sunt labore',
            region: 'laboris amet est Duis',
            regionName: 'Janice Weber',
            sessionId: 'b05b2b7c-6c87-43b0-a18c-38f02fc35c3d',
            timeZone: 'Ut magna',
            timestamp: '1926-08-04T16:18:01.0Z',
            userAgent: 'Duis in',
          },
          name: 'Rosemary Wisozk',
          principal: {
            id: 'b0674a6a-7178-4fff-b89f-4ef1868e9e27',
            kind: 'user',
          },
          tenantId: '71a2a286-c332-4944-9810-14b885a596bb',
          timestamp: '1936-07-18T23:36:36.0Z',
        },
      ],
      meta: {
        count: 10000,
        next: 1234,
      },
    },
    props,
  ) as CursorPaginatedAuditEvent;
export const getCursorPaginatedEntity = (props: Partial<CursorPaginatedEntity>) =>
  merge(
    {
      data: [
        {
          attributes: [
            'document.id_card.classified_document_type',
            'document.passport.expires_at',
            'document.drivers_license.selfie.image',
          ],
          data: [
            {
              dataKind: 'vault_data',
              identifier: 'ce30bc49-3de9-465a-bb3c-a79375a96b63',
              isDecryptable: true,
              source: 'bootstrap',
              transforms: {},
              value: 'consequat Ut eiusmod quis',
            },
            {
              dataKind: 'vault_data',
              identifier: 'ce30bc49-3de9-465a-bb3c-a79375a96b63',
              isDecryptable: true,
              source: 'bootstrap',
              transforms: {},
              value: 'laboris',
            },
            {
              dataKind: 'vault_data',
              identifier: 'ce30bc49-3de9-465a-bb3c-a79375a96b63',
              isDecryptable: true,
              source: 'bootstrap',
              transforms: {},
              value: 'sed sit',
            },
          ],
          decryptableAttributes: [
            'document.residence_document.address_line1',
            'document.id_card.issuing_country',
            'document.passport_card.front.mime_type',
          ],
          decryptedAttributes: {},
          externalId: 'dd020fde-b84d-47a7-8b39-b450f2d52c4f',
          hasOutstandingWorkflowRequest: false,
          id: '589b5aec-0f21-4bda-bbd4-959206136416',
          isCreatedViaApi: true,
          isIdentifiable: false,
          isPortable: true,
          kind: 'person',
          label: 'offboard_other',
          lastActivityAt: '1918-04-02T12:14:11.0Z',
          manualReviewKinds: ['document_needs_review', 'document_needs_review', 'rule_triggered'],
          orderingId: -11588051,
          requiresManualReview: true,
          sandboxId: 'd2c58015-3119-466a-8c0b-8223c26f5f8a',
          startTimestamp: '1948-02-16T16:12:44.0Z',
          status: 'in_progress',
          svId: 'c3f674a9-de07-4a77-9c58-2e51f027f5dd',
          tags: [
            {
              createdAt: '1920-01-08T08:16:11.0Z',
              id: 'tag_2ZwAl6LyHB6l7Ap2Ksdw8X',
              tag: 'transaction_chargeback',
            },
            {
              createdAt: '1956-09-27T16:22:45.0Z',
              id: 'tag_2ZwAl6LyHB6l7Ap2Ksdw8X',
              tag: 'transaction_chargeback',
            },
            {
              createdAt: '1897-08-16T06:21:50.0Z',
              id: 'tag_2ZwAl6LyHB6l7Ap2Ksdw8X',
              tag: 'transaction_chargeback',
            },
          ],
          vId: '69ff0cec-ca20-47ea-9dc8-4fe1242dbb4b',
          watchlistCheck: {
            id: 'e091122d-1ce0-4456-b0ea-096f3f8fbdaf',
            reasonCodes: ['subject_deceased', 'document_visible_photo_features_verified', 'address_risk_alert'],
            status: 'fail',
          },
          workflows: [
            {
              createdAt: '1933-08-25T07:11:32.0Z',
              insightEvent: {
                city: 'Fort Arjunfield',
                country: 'Mauritania',
                ipAddress: '90510 Jerry Route Suite 505',
                latitude: 36272852.78435272,
                longitude: 66316548.834290326,
                metroCode: 'ea dolore tempor ex amet',
                postalCode: 'laboris consectetur irure sint dolore',
                region: 'mollit reprehenderit',
                regionName: 'Jenna Ryan',
                sessionId: 'bcb73635-fd7a-4dcb-adcf-a8e7c59dd73e',
                timeZone: 'nulla mollit eu cillum incididunt',
                timestamp: '1945-11-08T21:58:46.0Z',
                userAgent: 'do consectetur in officia velit',
              },
              playbookId: '8d33e5f7-33b0-4af7-a05c-1af7c57e3266',
              status: 'incomplete',
            },
            {
              createdAt: '1945-11-29T10:47:54.0Z',
              insightEvent: {
                city: 'Fort Arjunfield',
                country: 'Mauritania',
                ipAddress: '90510 Jerry Route Suite 505',
                latitude: -18304522.837033182,
                longitude: 89202951.67105728,
                metroCode: 'deserunt elit laboris laborum veniam',
                postalCode: 'Duis in',
                region: 'pariatur',
                regionName: 'Jenna Ryan',
                sessionId: 'bcb73635-fd7a-4dcb-adcf-a8e7c59dd73e',
                timeZone: 'est commodo',
                timestamp: '1908-04-28T19:55:13.0Z',
                userAgent: 'ut nulla dolore sit',
              },
              playbookId: '8d33e5f7-33b0-4af7-a05c-1af7c57e3266',
              status: 'none',
            },
            {
              createdAt: '1933-09-22T16:47:55.0Z',
              insightEvent: {
                city: 'Fort Arjunfield',
                country: 'Mauritania',
                ipAddress: '90510 Jerry Route Suite 505',
                latitude: -31087101.618756562,
                longitude: 26407738.890069157,
                metroCode: 'velit deserunt ut',
                postalCode: 'dolor ex',
                region: 'esse cupidatat Excepteur ipsum in',
                regionName: 'Jenna Ryan',
                sessionId: 'bcb73635-fd7a-4dcb-adcf-a8e7c59dd73e',
                timeZone: 'in cillum eiusmod occaecat',
                timestamp: '1928-11-02T17:27:12.0Z',
                userAgent: 'mollit ut consequat dolore',
              },
              playbookId: '8d33e5f7-33b0-4af7-a05c-1af7c57e3266',
              status: 'pass',
            },
          ],
        },
        {
          attributes: ['document.permit.postal_code', 'document.passport.address_line1', 'card.*.number'],
          data: [
            {
              dataKind: 'document_data',
              identifier: 'ce30bc49-3de9-465a-bb3c-a79375a96b63',
              isDecryptable: true,
              source: 'tenant',
              transforms: {},
              value: 'eiusmod veniam',
            },
            {
              dataKind: 'document_data',
              identifier: 'ce30bc49-3de9-465a-bb3c-a79375a96b63',
              isDecryptable: false,
              source: 'client_tenant',
              transforms: {},
              value: 'eiusmod nisi labore',
            },
            {
              dataKind: 'vault_data',
              identifier: 'ce30bc49-3de9-465a-bb3c-a79375a96b63',
              isDecryptable: true,
              source: 'components_sdk',
              transforms: {},
              value: 'enim dolor sit ut esse',
            },
          ],
          decryptableAttributes: [
            'document.ssn_card.image',
            'document.residence_document.back.image',
            'document.passport_card.state',
          ],
          decryptedAttributes: {},
          externalId: 'dd020fde-b84d-47a7-8b39-b450f2d52c4f',
          hasOutstandingWorkflowRequest: false,
          id: '589b5aec-0f21-4bda-bbd4-959206136416',
          isCreatedViaApi: false,
          isIdentifiable: false,
          isPortable: false,
          kind: 'business',
          label: 'offboard_fraud',
          lastActivityAt: '1912-08-27T13:12:22.0Z',
          manualReviewKinds: ['rule_triggered', 'document_needs_review', 'rule_triggered'],
          orderingId: 78473148,
          requiresManualReview: true,
          sandboxId: 'd2c58015-3119-466a-8c0b-8223c26f5f8a',
          startTimestamp: '1942-02-08T10:42:45.0Z',
          status: 'none',
          svId: 'c3f674a9-de07-4a77-9c58-2e51f027f5dd',
          tags: [
            {
              createdAt: '1914-03-15T11:53:44.0Z',
              id: 'tag_2ZwAl6LyHB6l7Ap2Ksdw8X',
              tag: 'transaction_chargeback',
            },
            {
              createdAt: '1905-01-17T06:05:01.0Z',
              id: 'tag_2ZwAl6LyHB6l7Ap2Ksdw8X',
              tag: 'transaction_chargeback',
            },
            {
              createdAt: '1931-09-13T10:13:40.0Z',
              id: 'tag_2ZwAl6LyHB6l7Ap2Ksdw8X',
              tag: 'transaction_chargeback',
            },
          ],
          vId: '69ff0cec-ca20-47ea-9dc8-4fe1242dbb4b',
          watchlistCheck: {
            id: 'e091122d-1ce0-4456-b0ea-096f3f8fbdaf',
            reasonCodes: [
              'synthetic_identity_low_risk',
              'ip_state_does_not_match',
              'sos_domestic_filing_partially_active',
            ],
            status: 'pass',
          },
          workflows: [
            {
              createdAt: '1948-10-26T20:58:51.0Z',
              insightEvent: {
                city: 'Fort Arjunfield',
                country: 'Mauritania',
                ipAddress: '90510 Jerry Route Suite 505',
                latitude: 13325498.405402675,
                longitude: -16740605.598774612,
                metroCode: 'qui esse Excepteur',
                postalCode: 'culpa laboris adipisicing',
                region: 'Duis',
                regionName: 'Jenna Ryan',
                sessionId: 'bcb73635-fd7a-4dcb-adcf-a8e7c59dd73e',
                timeZone: 'commodo esse',
                timestamp: '1938-04-25T23:05:47.0Z',
                userAgent: 'elit dolor',
              },
              playbookId: '8d33e5f7-33b0-4af7-a05c-1af7c57e3266',
              status: 'pass',
            },
            {
              createdAt: '1925-10-02T18:56:16.0Z',
              insightEvent: {
                city: 'Fort Arjunfield',
                country: 'Mauritania',
                ipAddress: '90510 Jerry Route Suite 505',
                latitude: -6716226.058190957,
                longitude: 22804207.346521333,
                metroCode: 'ex aute amet',
                postalCode: 'commodo aliqua consequat in eiusmod',
                region: 'id cupidatat ex Duis',
                regionName: 'Jenna Ryan',
                sessionId: 'bcb73635-fd7a-4dcb-adcf-a8e7c59dd73e',
                timeZone: 'ad et adipisicing',
                timestamp: '1938-10-12T05:34:47.0Z',
                userAgent: 'laboris in',
              },
              playbookId: '8d33e5f7-33b0-4af7-a05c-1af7c57e3266',
              status: 'fail',
            },
            {
              createdAt: '1963-12-20T17:36:42.0Z',
              insightEvent: {
                city: 'Fort Arjunfield',
                country: 'Mauritania',
                ipAddress: '90510 Jerry Route Suite 505',
                latitude: 46734099.58162317,
                longitude: -69124238.13487631,
                metroCode: 'sit sed',
                postalCode: 'Lorem Ut dolor nulla',
                region: 'occaecat ex aliquip',
                regionName: 'Jenna Ryan',
                sessionId: 'bcb73635-fd7a-4dcb-adcf-a8e7c59dd73e',
                timeZone: 'ex laborum nulla',
                timestamp: '1958-04-04T02:22:14.0Z',
                userAgent: 'et esse cupidatat proident ex',
              },
              playbookId: '8d33e5f7-33b0-4af7-a05c-1af7c57e3266',
              status: 'pass',
            },
          ],
        },
        {
          attributes: [
            'document.passport.curp_validation_response',
            'document.voter_identification.selfie.image',
            'document.permit.dob',
          ],
          data: [
            {
              dataKind: 'vault_data',
              identifier: 'ce30bc49-3de9-465a-bb3c-a79375a96b63',
              isDecryptable: false,
              source: 'prefill',
              transforms: {},
              value: 'exercitation',
            },
            {
              dataKind: 'document_data',
              identifier: 'ce30bc49-3de9-465a-bb3c-a79375a96b63',
              isDecryptable: true,
              source: 'client_tenant',
              transforms: {},
              value: 'minim cupidatat elit',
            },
            {
              dataKind: 'vault_data',
              identifier: 'ce30bc49-3de9-465a-bb3c-a79375a96b63',
              isDecryptable: true,
              source: 'bootstrap',
              transforms: {},
              value: 'sed',
            },
          ],
          decryptableAttributes: [
            'id.middle_name',
            'document.voter_identification.front.mime_type',
            'document.permit.state',
          ],
          decryptedAttributes: {},
          externalId: 'dd020fde-b84d-47a7-8b39-b450f2d52c4f',
          hasOutstandingWorkflowRequest: true,
          id: '589b5aec-0f21-4bda-bbd4-959206136416',
          isCreatedViaApi: false,
          isIdentifiable: false,
          isPortable: false,
          kind: 'person',
          label: 'active',
          lastActivityAt: '1900-11-27T17:18:17.0Z',
          manualReviewKinds: ['rule_triggered', 'document_needs_review', 'rule_triggered'],
          orderingId: -8220112,
          requiresManualReview: false,
          sandboxId: 'd2c58015-3119-466a-8c0b-8223c26f5f8a',
          startTimestamp: '1939-01-18T09:06:20.0Z',
          status: 'pending',
          svId: 'c3f674a9-de07-4a77-9c58-2e51f027f5dd',
          tags: [
            {
              createdAt: '1896-03-01T15:17:23.0Z',
              id: 'tag_2ZwAl6LyHB6l7Ap2Ksdw8X',
              tag: 'transaction_chargeback',
            },
            {
              createdAt: '1943-11-24T10:53:31.0Z',
              id: 'tag_2ZwAl6LyHB6l7Ap2Ksdw8X',
              tag: 'transaction_chargeback',
            },
            {
              createdAt: '1923-12-26T01:15:23.0Z',
              id: 'tag_2ZwAl6LyHB6l7Ap2Ksdw8X',
              tag: 'transaction_chargeback',
            },
          ],
          vId: '69ff0cec-ca20-47ea-9dc8-4fe1242dbb4b',
          watchlistCheck: {
            id: 'e091122d-1ce0-4456-b0ea-096f3f8fbdaf',
            reasonCodes: [
              'phone_located_matches',
              'document_ocr_dob_could_not_match',
              'input_phone_number_does_not_match_located_state_history',
            ],
            status: 'not_needed',
          },
          workflows: [
            {
              createdAt: '1969-10-22T14:38:47.0Z',
              insightEvent: {
                city: 'Fort Arjunfield',
                country: 'Mauritania',
                ipAddress: '90510 Jerry Route Suite 505',
                latitude: 48513436.242325395,
                longitude: 99130839.16304201,
                metroCode: 'dolore Duis consequat Ut tempor',
                postalCode: 'aliquip eiusmod cupidatat',
                region: 'Lorem reprehenderit mollit',
                regionName: 'Jenna Ryan',
                sessionId: 'bcb73635-fd7a-4dcb-adcf-a8e7c59dd73e',
                timeZone: 'veniam ut',
                timestamp: '1900-04-28T09:42:10.0Z',
                userAgent: 'officia minim ad adipisicing',
              },
              playbookId: '8d33e5f7-33b0-4af7-a05c-1af7c57e3266',
              status: 'fail',
            },
            {
              createdAt: '1906-08-14T21:24:27.0Z',
              insightEvent: {
                city: 'Fort Arjunfield',
                country: 'Mauritania',
                ipAddress: '90510 Jerry Route Suite 505',
                latitude: -1476336.9476662874,
                longitude: -21807425.663483888,
                metroCode: 'dolor ut sed',
                postalCode: 'Duis veniam labore pariatur',
                region: 'Lorem',
                regionName: 'Jenna Ryan',
                sessionId: 'bcb73635-fd7a-4dcb-adcf-a8e7c59dd73e',
                timeZone: 'nulla officia sint esse',
                timestamp: '1967-06-29T08:36:34.0Z',
                userAgent: 'nulla nisi minim sed',
              },
              playbookId: '8d33e5f7-33b0-4af7-a05c-1af7c57e3266',
              status: 'none',
            },
            {
              createdAt: '1905-09-10T06:48:59.0Z',
              insightEvent: {
                city: 'Fort Arjunfield',
                country: 'Mauritania',
                ipAddress: '90510 Jerry Route Suite 505',
                latitude: -53452846.00441142,
                longitude: 10844889.651044413,
                metroCode: 'Lorem',
                postalCode: 'culpa Lorem commodo sint',
                region: 'amet eu deserunt',
                regionName: 'Jenna Ryan',
                sessionId: 'bcb73635-fd7a-4dcb-adcf-a8e7c59dd73e',
                timeZone: 'deserunt eiusmod do ullamco ut',
                timestamp: '1958-05-02T12:37:16.0Z',
                userAgent: 'Duis est',
              },
              playbookId: '8d33e5f7-33b0-4af7-a05c-1af7c57e3266',
              status: 'pending',
            },
          ],
        },
      ],
      meta: {
        count: 10000,
        next: 1234,
      },
    },
    props,
  ) as CursorPaginatedEntity;
export const getCursorPaginatedListEvent = (props: Partial<CursorPaginatedListEvent>) =>
  merge(
    {
      data: [
        {
          detail: {
            data: {
              entries: ['enim consequat in magna consectetur', 'consequat ut Ut', 'cillum ex in'],
              listEntryCreationId: '02c78ef9-6552-47b5-828f-cfe5df43bca0',
              listId: 'cd5121d7-1176-4aad-8b8d-49af111b2551',
            },
            kind: 'create_list_entry',
          },
          id: 'bfacfc50-5cb3-4060-935d-d8e2560cf55a',
          insightEvent: {
            city: 'Maribelfield',
            country: 'Algeria',
            ipAddress: '5326 E Market Street Suite 346',
            latitude: -46334987.40301678,
            longitude: 23226492.77249016,
            metroCode: 'consectetur irure',
            postalCode: 'dolore nisi',
            region: 'amet Duis aute',
            regionName: 'Alicia Pollich',
            sessionId: '55360417-561b-457a-b0a1-ed73d79d9eac',
            timeZone: 'nostrud proident',
            timestamp: '1936-12-13T07:27:56.0Z',
            userAgent: 'dolore',
          },
          name: 'Angelo Bergstrom',
          principal: {
            id: '4a155ff1-04d5-4dc8-aa05-f7caa1235308',
            kind: 'user',
          },
          tenantId: 'fd899442-15eb-4545-9c57-76d06182ceb8',
          timestamp: '1957-01-06T09:45:55.0Z',
        },
        {
          detail: {
            data: {
              entries: ['Lorem', 'cupidatat amet quis in', 'aliquip'],
              listEntryCreationId: '02c78ef9-6552-47b5-828f-cfe5df43bca0',
              listId: 'cd5121d7-1176-4aad-8b8d-49af111b2551',
            },
            kind: 'create_list_entry',
          },
          id: 'bfacfc50-5cb3-4060-935d-d8e2560cf55a',
          insightEvent: {
            city: 'Maribelfield',
            country: 'Algeria',
            ipAddress: '5326 E Market Street Suite 346',
            latitude: 83974443.73231822,
            longitude: -67762046.05887286,
            metroCode: 'cillum Lorem',
            postalCode: 'consectetur ut',
            region: 'ut',
            regionName: 'Alicia Pollich',
            sessionId: '55360417-561b-457a-b0a1-ed73d79d9eac',
            timeZone: 'quis aliquip',
            timestamp: '1910-09-06T12:08:22.0Z',
            userAgent: 'pariatur minim',
          },
          name: 'Angelo Bergstrom',
          principal: {
            id: '4a155ff1-04d5-4dc8-aa05-f7caa1235308',
            kind: 'user',
          },
          tenantId: 'fd899442-15eb-4545-9c57-76d06182ceb8',
          timestamp: '1954-07-08T22:08:10.0Z',
        },
        {
          detail: {
            data: {
              entries: [
                'adipisicing voluptate est veniam mollit',
                'ipsum mollit eu Excepteur',
                'amet adipisicing id aliqua aliquip',
              ],
              listEntryCreationId: '02c78ef9-6552-47b5-828f-cfe5df43bca0',
              listId: 'cd5121d7-1176-4aad-8b8d-49af111b2551',
            },
            kind: 'create_list_entry',
          },
          id: 'bfacfc50-5cb3-4060-935d-d8e2560cf55a',
          insightEvent: {
            city: 'Maribelfield',
            country: 'Algeria',
            ipAddress: '5326 E Market Street Suite 346',
            latitude: 5055137.417143658,
            longitude: -62616431.842770435,
            metroCode: 'aliqua ut',
            postalCode: 'proident reprehenderit commodo',
            region: 'ex',
            regionName: 'Alicia Pollich',
            sessionId: '55360417-561b-457a-b0a1-ed73d79d9eac',
            timeZone: 'ullamco Lorem',
            timestamp: '1936-07-26T07:16:01.0Z',
            userAgent: 'tempor ut',
          },
          name: 'Angelo Bergstrom',
          principal: {
            id: '4a155ff1-04d5-4dc8-aa05-f7caa1235308',
            kind: 'user',
          },
          tenantId: 'fd899442-15eb-4545-9c57-76d06182ceb8',
          timestamp: '1938-11-09T08:17:35.0Z',
        },
      ],
      meta: {
        count: 10000,
        next: 1234,
      },
    },
    props,
  ) as CursorPaginatedListEvent;
export const getCustomDocumentConfig = (props: Partial<CustomDocumentConfig>) =>
  merge(
    {
      description: 'est',
      identifier: 'e7851afa-3aa2-40e1-a07e-b79350936ac2',
      name: 'Tommy Quitzon',
      requiresHumanReview: true,
      uploadSettings: 'prefer_upload',
    },
    props,
  ) as CustomDocumentConfig;
export const getDashboardSecretApiKey = (props: Partial<DashboardSecretApiKey>) =>
  merge(
    {
      createdAt: '1943-08-29T14:16:32.0Z',
      id: '994dbc70-78e5-4ca0-bfa2-f675be0148ae',
      isLive: true,
      key: '03191914-eef3-4bd0-af06-fc81a99363b3',
      lastUsedAt: '1914-01-10T02:27:08.0Z',
      name: 'May Schulist',
      role: {
        createdAt: '1964-11-26T18:30:25.0Z',
        id: '9d755d32-d282-488f-9faf-c9b56ab05614',
        isImmutable: true,
        kind: 'api_key',
        name: 'Ollie Stroman',
        numActiveApiKeys: 47552634,
        numActiveUsers: -14998917,
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
      scrubbedKey: 'a73d8810-84f8-4266-adfa-f7cafd4d38f2',
      status: 'enabled',
    },
    props,
  ) as DashboardSecretApiKey;
export const getDataAttributeKind = (props: Partial<DataAttributeKind>) =>
  (props ?? 'document_data') as DataAttributeKind;
export const getDataCollectedInfo = (props: Partial<DataCollectedInfo>) =>
  merge(
    {
      actor: {
        id: '6017e49d-278b-423c-a064-0062f1c29b7b',
        kind: 'user',
      },
      attributes: ['email', 'name', 'business_address'],
      isPrefill: false,
      targets: [
        'document.voter_identification.classified_document_type',
        'document.voter_identification.curp_validation_response',
        'document.passport.full_address',
      ],
    },
    props,
  ) as DataCollectedInfo;
export const getDataIdentifier = (props: Partial<DataIdentifier>) =>
  (props ?? 'document.permit.issuing_state') as DataIdentifier;
export const getDataLifetimeSource = (props: Partial<DataLifetimeSource>) =>
  (props ?? 'bootstrap') as DataLifetimeSource;
export const getDbActor = (props: Partial<DbActor>) =>
  merge(
    {
      data: {
        id: '50e18067-7c70-4db9-9099-53249dca5ece',
      },
      kind: 'user',
    },
    props,
  ) as DbActor;
export const getDecisionStatus = (props: Partial<DecisionStatus>) => (props ?? 'fail') as DecisionStatus;
export const getDecryptionContext = (props: Partial<DecryptionContext>) => (props ?? 'api') as DecryptionContext;
export const getDeleteRequest = (props: Partial<DeleteRequest>) =>
  merge(
    {
      deleteAll: null,
      fields: ['id.first_name', 'id.last_name'],
    },
    props,
  ) as DeleteRequest;
export const getDeviceFraudRiskLevel = (props: Partial<DeviceFraudRiskLevel>) =>
  (props ?? 'medium') as DeviceFraudRiskLevel;
export const getDeviceInsightField = (props: Partial<DeviceInsightField>) =>
  (props ?? 'ip_address') as DeviceInsightField;
export const getDeviceInsightOperation = (props: Partial<DeviceInsightOperation>) =>
  merge(
    {
      field: 'ip_address',
      op: 'is_in',
      value: 'ullamco in',
    },
    props,
  ) as DeviceInsightOperation;
export const getDeviceType = (props: Partial<DeviceType>) => (props ?? 'ios') as DeviceType;
export const getDocsTokenResponse = (props: Partial<DocsTokenResponse>) =>
  merge(
    {
      token: 'c436c08d-6658-43ab-b494-61bb46afa2f6',
    },
    props,
  ) as DocsTokenResponse;
export const getDocument = (props: Partial<Document>) =>
  merge(
    {
      completedVersion: 44193978,
      curpCompletedVersion: -92036354,
      documentScore: 65150579.97464609,
      kind: 'visa',
      ocrConfidenceScore: 52819051.13430011,
      reviewStatus: 'not_needed',
      sambaActivityHistoryCompletedVersion: -31657323,
      selfieScore: 20262955.390802205,
      startedAt: '1912-08-16T12:55:31.0Z',
      status: 'pending',
      uploadSource: 'desktop',
      uploads: [
        {
          failureReasons: ['selfie_blurry', 'wrong_document_side', 'selfie_image_orientation_incorrect'],
          identifier: '154f6da0-2902-4538-8b81-a41dfa8dc4c7',
          isExtraCompressed: true,
          side: 'ae52e936-9934-410b-84f6-138b31e15e26',
          timestamp: '1946-07-24T11:57:36.0Z',
          version: -56947063,
        },
        {
          failureReasons: ['unknown_document_type', 'barcode_not_detected', 'document_missing_four_corners'],
          identifier: '154f6da0-2902-4538-8b81-a41dfa8dc4c7',
          isExtraCompressed: false,
          side: 'ae52e936-9934-410b-84f6-138b31e15e26',
          timestamp: '1894-05-06T07:21:12.0Z',
          version: -8080924,
        },
        {
          failureReasons: ['document_too_small', 'document_border_too_small', 'face_not_found'],
          identifier: '154f6da0-2902-4538-8b81-a41dfa8dc4c7',
          isExtraCompressed: true,
          side: 'ae52e936-9934-410b-84f6-138b31e15e26',
          timestamp: '1919-05-28T09:42:33.0Z',
          version: 93856416,
        },
      ],
    },
    props,
  ) as Document;
export const getDocumentAndCountryConfiguration = (props: Partial<DocumentAndCountryConfiguration>) =>
  merge(
    {
      countrySpecific: {},
      global: ['voter_identification', 'residence_document', 'voter_identification'],
    },
    props,
  ) as DocumentAndCountryConfiguration;
export const getDocumentImageError = (props: Partial<DocumentImageError>) =>
  (props ?? 'document_border_too_small') as DocumentImageError;
export const getDocumentKind = (props: Partial<DocumentKind>) => (props ?? 'custom') as DocumentKind;
export const getDocumentRequest = (props: Partial<DocumentRequest>) =>
  merge(
    {
      kind: 'identity',
      ruleSetResultId: '17d97d9f-a7f2-4c1f-8735-a4ff1d0e98aa',
    },
    props,
  ) as DocumentRequest;
export const getDocumentRequestConfig = (props: Partial<DocumentRequestConfig>) =>
  merge(
    {
      data: {
        collectSelfie: true,
        documentTypesAndCountries: {
          countrySpecific: {},
          global: ['passport_card', 'residence_document', 'passport_card'],
        },
      },
      kind: 'identity',
    },
    props,
  ) as DocumentRequestConfig;
export const getDocumentRequestKind = (props: Partial<DocumentRequestKind>) =>
  (props ?? 'proof_of_address') as DocumentRequestKind;
export const getDocumentReviewStatus = (props: Partial<DocumentReviewStatus>) =>
  (props ?? 'reviewed_by_machine') as DocumentReviewStatus;
export const getDocumentSide = (props: Partial<DocumentSide>) => (props ?? 'selfie') as DocumentSide;
export const getDocumentStatus = (props: Partial<DocumentStatus>) => (props ?? 'pending') as DocumentStatus;
export const getDocumentUpload = (props: Partial<DocumentUpload>) =>
  merge(
    {
      failureReasons: ['unknown_error', 'document_glare', 'document_missing_four_corners'],
      identifier: '25872977-6721-4dff-a5d6-efa386c08dff',
      isExtraCompressed: false,
      side: 'c640d9e2-7d0e-43a5-a84f-d497ef65d3d6',
      timestamp: '1904-12-20T16:21:42.0Z',
      version: -81387940,
    },
    props,
  ) as DocumentUpload;
export const getDocumentUploadSettings = (props: Partial<DocumentUploadSettings>) =>
  (props ?? 'prefer_upload') as DocumentUploadSettings;
export const getDocumentUploadedTimelineEvent = (props: Partial<DocumentUploadedTimelineEvent>) =>
  merge(
    {
      config: {
        data: {
          collectSelfie: true,
          documentTypesAndCountries: {
            countrySpecific: {},
            global: ['id_card', 'id_card', 'id_card'],
          },
        },
        kind: 'identity',
      },
      deviceType: 'ios',
      documentType: 'permit',
      status: 'pending',
    },
    props,
  ) as DocumentUploadedTimelineEvent;
export const getDupeKind = (props: Partial<DupeKind>) => (props ?? 'selfie') as DupeKind;
export const getDupes = (props: Partial<Dupes>) =>
  merge(
    {
      otherTenant: {
        numMatches: 97442323,
        numTenants: -65512022,
      },
      sameTenant: [
        {
          data: [
            {
              dataKind: 'document_data',
              identifier: '08b1f3fe-f724-4c72-b29e-12cd32873755',
              isDecryptable: true,
              source: 'ocr',
              transforms: {},
              value: 'sed',
            },
            {
              dataKind: 'document_data',
              identifier: '08b1f3fe-f724-4c72-b29e-12cd32873755',
              isDecryptable: true,
              source: 'components_sdk',
              transforms: {},
              value: 'reprehenderit velit adipisicing culpa',
            },
            {
              dataKind: 'vault_data',
              identifier: '08b1f3fe-f724-4c72-b29e-12cd32873755',
              isDecryptable: true,
              source: 'prefill',
              transforms: {},
              value: 'irure ut',
            },
          ],
          dupeKinds: ['card_number_cvc', 'selfie', 'name_ssn4'],
          fpId: '687a7568-226c-4280-a700-071a6c7ce88d',
          startTimestamp: '1939-03-20T02:58:13.0Z',
          status: 'pending',
        },
        {
          data: [
            {
              dataKind: 'vault_data',
              identifier: '08b1f3fe-f724-4c72-b29e-12cd32873755',
              isDecryptable: true,
              source: 'ocr',
              transforms: {},
              value: 'laborum labore nulla magna aliqua',
            },
            {
              dataKind: 'document_data',
              identifier: '08b1f3fe-f724-4c72-b29e-12cd32873755',
              isDecryptable: true,
              source: 'prefill',
              transforms: {},
              value: 'elit veniam commodo do labore',
            },
            {
              dataKind: 'vault_data',
              identifier: '08b1f3fe-f724-4c72-b29e-12cd32873755',
              isDecryptable: true,
              source: 'bootstrap',
              transforms: {},
              value: 'consequat dolor',
            },
          ],
          dupeKinds: ['name_dob', 'bank_routing_account', 'phone_number'],
          fpId: '687a7568-226c-4280-a700-071a6c7ce88d',
          startTimestamp: '1944-10-25T21:50:35.0Z',
          status: 'incomplete',
        },
        {
          data: [
            {
              dataKind: 'document_data',
              identifier: '08b1f3fe-f724-4c72-b29e-12cd32873755',
              isDecryptable: false,
              source: 'prefill',
              transforms: {},
              value: 'in et',
            },
            {
              dataKind: 'vault_data',
              identifier: '08b1f3fe-f724-4c72-b29e-12cd32873755',
              isDecryptable: false,
              source: 'tenant',
              transforms: {},
              value: 'occaecat',
            },
            {
              dataKind: 'vault_data',
              identifier: '08b1f3fe-f724-4c72-b29e-12cd32873755',
              isDecryptable: true,
              source: 'components_sdk',
              transforms: {},
              value: 'dolore',
            },
          ],
          dupeKinds: ['bank_routing_account', 'name_ssn4', 'ssn9'],
          fpId: '687a7568-226c-4280-a700-071a6c7ce88d',
          startTimestamp: '1937-03-26T13:28:28.0Z',
          status: 'in_progress',
        },
      ],
    },
    props,
  ) as Dupes;
export const getEditRule = (props: Partial<EditRule>) =>
  merge(
    {
      ruleExpression: [
        {
          field: 'business_name_similar_match',
          op: 'eq',
          value: true,
        },
        {
          field: 'browser_automation',
          op: 'not_eq',
          value: true,
        },
        {
          field: 'business_address_deliverable',
          op: 'eq',
          value: true,
        },
      ],
      ruleId: '972ffa9f-68bd-4333-9f25-6d1783bdd919',
    },
    props,
  ) as EditRule;
export const getEmpty = (props: Partial<Empty>) => merge({}, props) as Empty;
export const getEnclaveHealthResponse = (props: Partial<EnclaveHealthResponse>) =>
  merge(
    {
      decryptMs: 32030326,
      keypairGenMs: 30250206,
      success: true,
    },
    props,
  ) as EnclaveHealthResponse;
export const getEnhancedAml = (props: Partial<EnhancedAml>) =>
  merge(
    {
      adverseMedia: false,
      enhancedAml: false,
      matchKind: 'fuzzy_medium',
      ofac: true,
      pep: false,
    },
    props,
  ) as EnhancedAml;
export const getEntity = (props: Partial<Entity>) =>
  merge(
    {
      attributes: [
        'document.passport_card.full_address',
        'document.visa.classified_document_type',
        'document.id_card.address_line1',
      ],
      data: [
        {
          dataKind: 'document_data',
          identifier: 'e02e12db-8a38-4b81-9a6c-0fdce1798996',
          isDecryptable: false,
          source: 'client_tenant',
          transforms: {},
          value: 'fugiat est in cillum',
        },
        {
          dataKind: 'vault_data',
          identifier: 'e02e12db-8a38-4b81-9a6c-0fdce1798996',
          isDecryptable: true,
          source: 'bootstrap',
          transforms: {},
          value: 'nulla',
        },
        {
          dataKind: 'vault_data',
          identifier: 'e02e12db-8a38-4b81-9a6c-0fdce1798996',
          isDecryptable: false,
          source: 'tenant',
          transforms: {},
          value: 'sunt laborum eiusmod do',
        },
      ],
      decryptableAttributes: ['document.id_card.state', 'document.residence_document.last_name', 'id.us_legal_status'],
      decryptedAttributes: {},
      externalId: 'b8b0ef2b-c25f-4d6d-bd0a-d5b069233af0',
      hasOutstandingWorkflowRequest: true,
      id: '66e306a9-3f30-4ef8-8705-153ec443c672',
      isCreatedViaApi: false,
      isIdentifiable: true,
      isPortable: false,
      kind: 'person',
      label: 'offboard_fraud',
      lastActivityAt: '1949-07-18T22:54:19.0Z',
      manualReviewKinds: ['document_needs_review', 'document_needs_review', 'rule_triggered'],
      orderingId: -93048219,
      requiresManualReview: true,
      sandboxId: 'fc56a856-c466-46f6-82ce-d6e958ae5041',
      startTimestamp: '1902-11-25T20:22:38.0Z',
      status: 'pass',
      svId: '4c9c3fec-7024-493f-9973-b940fa906303',
      tags: [
        {
          createdAt: '1925-07-06T09:47:21.0Z',
          id: 'tag_2ZwAl6LyHB6l7Ap2Ksdw8X',
          tag: 'transaction_chargeback',
        },
        {
          createdAt: '1901-09-07T11:38:59.0Z',
          id: 'tag_2ZwAl6LyHB6l7Ap2Ksdw8X',
          tag: 'transaction_chargeback',
        },
        {
          createdAt: '1906-06-21T16:51:48.0Z',
          id: 'tag_2ZwAl6LyHB6l7Ap2Ksdw8X',
          tag: 'transaction_chargeback',
        },
      ],
      vId: '0adbde5a-836b-41ef-b197-1701a4665890',
      watchlistCheck: {
        id: '9ed638f6-831e-4b72-bc20-61d82c23c732',
        reasonCodes: ['document_low_match_score_with_selfie', 'ssn_input_is_invalid', 'ip_vpn'],
        status: 'fail',
      },
      workflows: [
        {
          createdAt: '1931-05-25T02:38:51.0Z',
          insightEvent: {
            city: 'Fort Corenecester',
            country: 'Nepal',
            ipAddress: '500 E Central Avenue Suite 694',
            latitude: 57690017.07432139,
            longitude: 68465125.73705131,
            metroCode: 'voluptate',
            postalCode: 'sint ea',
            region: 'id eiusmod aute sed',
            regionName: "Maggie D'Amore",
            sessionId: '12154d6f-8cb2-45e2-870a-f7ff4c33e855',
            timeZone: 'ut mollit qui anim',
            timestamp: '1899-05-20T02:05:57.0Z',
            userAgent: 'aute velit',
          },
          playbookId: '8965e32c-94d8-44ef-bbe3-4ec49010be72',
          status: 'pending',
        },
        {
          createdAt: '1953-02-16T20:20:36.0Z',
          insightEvent: {
            city: 'Fort Corenecester',
            country: 'Nepal',
            ipAddress: '500 E Central Avenue Suite 694',
            latitude: 62327468.18875113,
            longitude: 68770276.09436256,
            metroCode: 'laborum',
            postalCode: 'Excepteur',
            region: 'exercitation',
            regionName: "Maggie D'Amore",
            sessionId: '12154d6f-8cb2-45e2-870a-f7ff4c33e855',
            timeZone: 'cillum Excepteur laboris magna ipsum',
            timestamp: '1942-10-11T21:20:26.0Z',
            userAgent: 'Duis dolor',
          },
          playbookId: '8965e32c-94d8-44ef-bbe3-4ec49010be72',
          status: 'pass',
        },
        {
          createdAt: '1899-09-13T07:23:09.0Z',
          insightEvent: {
            city: 'Fort Corenecester',
            country: 'Nepal',
            ipAddress: '500 E Central Avenue Suite 694',
            latitude: -25700.494573310018,
            longitude: 27226806.094379306,
            metroCode: 'dolor Ut',
            postalCode: 'irure',
            region: 'ullamco',
            regionName: "Maggie D'Amore",
            sessionId: '12154d6f-8cb2-45e2-870a-f7ff4c33e855',
            timeZone: 'ad sit aliquip deserunt',
            timestamp: '1955-02-14T17:26:31.0Z',
            userAgent: 'commodo',
          },
          playbookId: '8965e32c-94d8-44ef-bbe3-4ec49010be72',
          status: 'incomplete',
        },
      ],
    },
    props,
  ) as Entity;
export const getEntityAction = (props: Partial<EntityAction>) =>
  merge(
    {
      fpBid: '8bcb52ef-3199-499f-8545-1d829843d7cc',
      kind: 'trigger',
      note: 'ut',
      trigger: {
        data: {
          playbookId: 'f98181b9-7667-4d78-bea8-594aaa7e4184',
          recollectAttributes: ['ssn4', 'business_kyced_beneficial_owners', 'name'],
          reuseExistingBoKyc: true,
        },
        kind: 'onboard',
      },
    },
    props,
  ) as EntityAction;
export const getEntityActionResponse = (props: Partial<EntityActionResponse>) =>
  merge(
    {
      expiresAt: '1955-06-26T14:27:14.0Z',
      kind: 'trigger',
      link: 'https://verify.onefootprint.com/?type=user#utok_ssPvNRjNGdk8Iq9qgf6lsO2iTVhALuR4Nt',
      token: 'utok_ssPvNRjNGdk8Iq9qgf6lsO2iTVhALuR4Nt',
    },
    props,
  ) as EntityActionResponse;
export const getEntityActionsRequest = (props: Partial<EntityActionsRequest>) =>
  merge(
    {
      actions: [
        {
          fpBid: '2008faaa-a4b3-427e-adbe-b33c4bedf7fa',
          kind: 'trigger',
          note: 'sit',
          trigger: {
            data: {
              playbookId: 'cd0fec6b-f3aa-437e-9504-3c90b2d7530b',
              recollectAttributes: ['business_phone_number', 'name', 'business_address'],
              reuseExistingBoKyc: true,
            },
            kind: 'onboard',
          },
        },
        {
          fpBid: '2008faaa-a4b3-427e-adbe-b33c4bedf7fa',
          kind: 'trigger',
          note: 'dolor',
          trigger: {
            data: {
              playbookId: 'cd0fec6b-f3aa-437e-9504-3c90b2d7530b',
              recollectAttributes: ['business_beneficial_owners', 'business_website', 'bank'],
              reuseExistingBoKyc: false,
            },
            kind: 'onboard',
          },
        },
        {
          fpBid: '2008faaa-a4b3-427e-adbe-b33c4bedf7fa',
          kind: 'trigger',
          note: 'est',
          trigger: {
            data: {
              playbookId: 'cd0fec6b-f3aa-437e-9504-3c90b2d7530b',
              recollectAttributes: ['us_tax_id', 'name', 'full_address'],
              reuseExistingBoKyc: true,
            },
            kind: 'onboard',
          },
        },
      ],
    },
    props,
  ) as EntityActionsRequest;
export const getEntityAttribute = (props: Partial<EntityAttribute>) =>
  merge(
    {
      dataKind: 'document_data',
      identifier: '9607baaf-bf40-4eae-b941-24ce162efd9a',
      isDecryptable: true,
      source: 'components_sdk',
      transforms: {},
      value: 'voluptate ea nostrud cupidatat officia',
    },
    props,
  ) as EntityAttribute;
export const getEntityOnboarding = (props: Partial<EntityOnboarding>) =>
  merge(
    {
      id: '6f762f24-0080-4295-9351-2206c26f869c',
      playbookKey: 'pb_live_fZvYlX3JpanlQ3MAwE45g0',
      ruleSetResults: [
        {
          id: 'a94f93df-85c0-4d6f-8f34-970a84cf1a16',
          timestamp: '1906-12-16T05:42:14.0Z',
        },
        {
          id: 'a94f93df-85c0-4d6f-8f34-970a84cf1a16',
          timestamp: '1946-01-05T21:57:15.0Z',
        },
        {
          id: 'a94f93df-85c0-4d6f-8f34-970a84cf1a16',
          timestamp: '1957-12-05T18:53:48.0Z',
        },
      ],
      seqno: -43778718,
      status: 'fail',
      timestamp: '1931-12-05T22:19:55.0Z',
    },
    props,
  ) as EntityOnboarding;
export const getEntityOnboardingRuleSetResult = (props: Partial<EntityOnboardingRuleSetResult>) =>
  merge(
    {
      id: '2e06775c-9e50-4828-994d-63a056db853f',
      timestamp: '1965-01-06T20:28:08.0Z',
    },
    props,
  ) as EntityOnboardingRuleSetResult;
export const getEntityStatus = (props: Partial<EntityStatus>) => (props ?? 'none') as EntityStatus;
export const getEntityWorkflow = (props: Partial<EntityWorkflow>) =>
  merge(
    {
      createdAt: '1948-06-18T20:45:26.0Z',
      insightEvent: {
        city: 'East Dock',
        country: 'Angola',
        ipAddress: '2533 Jared Pike Suite 452',
        latitude: -31923249.14921026,
        longitude: 12186130.982524455,
        metroCode: 'dolor eu ullamco veniam',
        postalCode: 'in exercitation',
        region: 'fugiat consequat',
        regionName: 'Derrick Cole',
        sessionId: 'acc26057-611b-45fb-ab5a-1257ab398b4d',
        timeZone: 'elit',
        timestamp: '1937-07-15T11:19:03.0Z',
        userAgent: 'fugiat',
      },
      playbookId: '742f3a98-2b89-4324-9631-2820a01f2f88',
      status: 'pending',
    },
    props,
  ) as EntityWorkflow;
export const getEquals = (props: Partial<Equals>) => (props ?? 'eq') as Equals;
export const getEvaluateRuleRequest = (props: Partial<EvaluateRuleRequest>) =>
  merge(
    {
      add: [
        {
          isShadow: false,
          name: 'Travis Mueller',
          ruleAction: 'step_up.identity',
          ruleExpression: [
            {
              field: 'sos_active_filing_found',
              op: 'not_eq',
              value: true,
            },
            {
              field: 'us_tax_id_is_itin',
              op: 'eq',
              value: false,
            },
            {
              field: 'document_country_code_mismatch',
              op: 'not_eq',
              value: true,
            },
          ],
        },
        {
          isShadow: true,
          name: 'Travis Mueller',
          ruleAction: 'step_up.identity',
          ruleExpression: [
            {
              field: 'document_photo_is_paper_capture',
              op: 'eq',
              value: true,
            },
            {
              field: 'document_ocr_dob_matches',
              op: 'eq',
              value: false,
            },
            {
              field: 'sos_domestic_filing_status_pending_inactive',
              op: 'eq',
              value: false,
            },
          ],
        },
        {
          isShadow: true,
          name: 'Travis Mueller',
          ruleAction: 'manual_review',
          ruleExpression: [
            {
              field: 'document_not_live_capture',
              op: 'eq',
              value: true,
            },
            {
              field: 'sentilink_identity_theft_high_risk',
              op: 'not_eq',
              value: true,
            },
            {
              field: 'document_not_verified',
              op: 'eq',
              value: false,
            },
          ],
        },
      ],
      delete: ['deserunt ea esse reprehenderit', 'anim qui minim irure labore', 'laborum Lorem fugiat aute nostrud'],
      edit: [
        {
          ruleExpression: [
            {
              field: 'address_input_is_not_standard_prison',
              op: 'eq',
              value: false,
            },
            {
              field: 'subject_deceased',
              op: 'eq',
              value: true,
            },
            {
              field: 'ssn_input_is_itin',
              op: 'eq',
              value: true,
            },
          ],
          ruleId: '5dffef05-c7f1-4fa2-9ebd-01d899bdd4c0',
        },
        {
          ruleExpression: [
            {
              field: 'business_name_no_watchlist_hits',
              op: 'eq',
              value: true,
            },
            {
              field: 'beneficial_owners_do_not_match',
              op: 'not_eq',
              value: true,
            },
            {
              field: 'email_high_risk_fraud',
              op: 'eq',
              value: true,
            },
          ],
          ruleId: '5dffef05-c7f1-4fa2-9ebd-01d899bdd4c0',
        },
        {
          ruleExpression: [
            {
              field: 'address_input_is_not_standard_university',
              op: 'not_eq',
              value: false,
            },
            {
              field: 'dob_matches',
              op: 'not_eq',
              value: true,
            },
            {
              field: 'address_located_is_not_standard_campground',
              op: 'not_eq',
              value: true,
            },
          ],
          ruleId: '5dffef05-c7f1-4fa2-9ebd-01d899bdd4c0',
        },
      ],
      endTimestamp: '1895-02-03T08:07:57.0Z',
      startTimestamp: '1951-07-22T02:47:11.0Z',
    },
    props,
  ) as EvaluateRuleRequest;
export const getExternalIntegrationCalled = (props: Partial<ExternalIntegrationCalled>) =>
  merge(
    {
      externalId: '3308ca64-34ed-452b-a220-b98be66b67d7',
      integration: 'alpaca_cip',
      successful: false,
    },
    props,
  ) as ExternalIntegrationCalled;
export const getExternalIntegrationKind = (props: Partial<ExternalIntegrationKind>) =>
  (props ?? 'alpaca_cip') as ExternalIntegrationKind;
export const getFieldValidation = (props: Partial<FieldValidation>) =>
  merge(
    {
      matchLevel: 'no_match',
      signals: [
        {
          description: 'cillum sunt consectetur',
          matchLevel: 'partial',
          note: 'tempor dolore',
          reasonCode: 'document_selfie_does_not_match',
          severity: 'high',
        },
        {
          description: 'amet sit ea',
          matchLevel: 'exact',
          note: 'ut aute exercitation occaecat ipsum',
          reasonCode: 'device_gps_spoofing',
          severity: 'high',
        },
        {
          description: 'sint dolor aute eiusmod',
          matchLevel: 'no_match',
          note: 'sit tempor consectetur quis',
          reasonCode: 'document_possible_image_alteration',
          severity: 'medium',
        },
      ],
    },
    props,
  ) as FieldValidation;
export const getFieldValidationDetail = (props: Partial<FieldValidationDetail>) =>
  merge(
    {
      description: 'culpa ad',
      matchLevel: 'no_match',
      note: 'cillum qui',
      reasonCode: 'attested_device_android_risky',
      severity: 'info',
    },
    props,
  ) as FieldValidationDetail;
export const getFilterFunction = (props: Partial<FilterFunction>) =>
  (props ?? "encrypt('<algorithm>','<public_key>')") as FilterFunction;
export const getFootprintReasonCode = (props: Partial<FootprintReasonCode>) =>
  (props ?? 'address_city_matches') as FootprintReasonCode;
export const getGetClientTokenResponse = (props: Partial<GetClientTokenResponse>) =>
  merge(
    {
      expiresAt: '1914-10-15T18:15:17.0Z',
      tenant: {
        name: 'Pablo Murazik',
      },
      vaultFields: [
        'document.passport.back.mime_type',
        'document.id_card.postal_code',
        'document.voter_identification.selfie.mime_type',
      ],
    },
    props,
  ) as GetClientTokenResponse;
export const getGetClientTokenResponseTenant = (props: Partial<GetClientTokenResponseTenant>) =>
  merge(
    {
      name: 'Cecil Turcotte',
    },
    props,
  ) as GetClientTokenResponseTenant;
export const getGetFieldValidationResponse = (props: Partial<GetFieldValidationResponse>) =>
  merge(
    {
      address: {
        matchLevel: 'exact',
        signals: [
          {
            description: 'culpa velit veniam sint',
            matchLevel: 'no_match',
            note: 'Excepteur quis velit fugiat',
            reasonCode: 'sos_domestic_filing_status_pending_inactive',
            severity: 'medium',
          },
          {
            description: 'consequat aute deserunt cillum',
            matchLevel: 'no_match',
            note: 'in Excepteur commodo ex',
            reasonCode: 'document_ocr_not_successful',
            severity: 'medium',
          },
          {
            description: 'sit mollit eu',
            matchLevel: 'partial',
            note: 'in Ut',
            reasonCode: 'ip_not_located',
            severity: 'high',
          },
        ],
      },
      businessAddress: {
        matchLevel: 'exact',
        signals: [
          {
            description: 'consectetur enim laboris cupidatat',
            matchLevel: 'no_match',
            note: 'id eiusmod eu dolor',
            reasonCode: 'document_selfie_bad_quality',
            severity: 'medium',
          },
          {
            description: 'magna elit labore',
            matchLevel: 'could_not_match',
            note: 'culpa',
            reasonCode: 'device_gps_spoofing',
            severity: 'info',
          },
          {
            description: 'ullamco ut cupidatat dolore',
            matchLevel: 'exact',
            note: 'officia id cillum irure dolore',
            reasonCode: 'multiple_records_found',
            severity: 'low',
          },
        ],
      },
      businessBeneficialOwners: {
        matchLevel: 'exact',
        signals: [
          {
            description: 'irure ut voluptate non',
            matchLevel: 'could_not_match',
            note: 'minim labore et',
            reasonCode: 'sos_domestic_active_filing_found',
            severity: 'info',
          },
          {
            description: 'et Duis labore do incididunt',
            matchLevel: 'could_not_match',
            note: 'enim ex ad',
            reasonCode: 'business_address_not_deliverable',
            severity: 'high',
          },
          {
            description: 'eiusmod',
            matchLevel: 'could_not_match',
            note: 'ipsum quis sunt',
            reasonCode: 'document_photo_is_not_screen_capture',
            severity: 'low',
          },
        ],
      },
      businessDba: {
        matchLevel: 'partial',
        signals: [
          {
            description: 'laborum nostrud ipsum',
            matchLevel: 'exact',
            note: 'voluptate exercitation tempor',
            reasonCode: 'id_flagged',
            severity: 'info',
          },
          {
            description: 'velit officia id',
            matchLevel: 'exact',
            note: 'nulla ut',
            reasonCode: 'document_visible_photo_features_not_verified',
            severity: 'high',
          },
          {
            description: 'voluptate irure amet consectetur dolore',
            matchLevel: 'no_match',
            note: 'dolore elit',
            reasonCode: 'tin_does_not_match',
            severity: 'low',
          },
        ],
      },
      businessName: {
        matchLevel: 'could_not_match',
        signals: [
          {
            description: 'Lorem consequat reprehenderit ea eiusmod',
            matchLevel: 'exact',
            note: 'in id nostrud',
            reasonCode: 'document_ocr_last_name_does_not_match',
            severity: 'info',
          },
          {
            description: 'dolor laboris mollit sed culpa',
            matchLevel: 'exact',
            note: 'aute enim',
            reasonCode: 'attested_device_android',
            severity: 'info',
          },
          {
            description: 'ullamco Ut consequat deserunt',
            matchLevel: 'could_not_match',
            note: 'dolore',
            reasonCode: 'ssn_issue_date_cannot_be_verified',
            severity: 'low',
          },
        ],
      },
      businessPhoneNumber: {
        matchLevel: 'no_match',
        signals: [
          {
            description: 'enim occaecat labore esse',
            matchLevel: 'partial',
            note: 'consequat',
            reasonCode: 'phone_located_name_does_not_match',
            severity: 'medium',
          },
          {
            description: 'elit deserunt reprehenderit eiusmod',
            matchLevel: 'could_not_match',
            note: 'consectetur sint',
            reasonCode: 'input_phone_number_does_not_match_ip_state',
            severity: 'high',
          },
          {
            description: 'ipsum sit',
            matchLevel: 'no_match',
            note: 'et enim nostrud',
            reasonCode: 'curp_input_curp_invalid',
            severity: 'medium',
          },
        ],
      },
      businessTin: {
        matchLevel: 'exact',
        signals: [
          {
            description: 'laboris adipisicing',
            matchLevel: 'no_match',
            note: 'consectetur',
            reasonCode: 'phone_located_name_partially_matches',
            severity: 'low',
          },
          {
            description: 'culpa deserunt qui quis',
            matchLevel: 'no_match',
            note: 'enim occaecat',
            reasonCode: 'business_address_does_not_match',
            severity: 'low',
          },
          {
            description: 'ad nisi adipisicing cupidatat',
            matchLevel: 'could_not_match',
            note: 'eiusmod enim amet reprehenderit',
            reasonCode: 'dob_matches',
            severity: 'high',
          },
        ],
      },
      dob: {
        matchLevel: 'partial',
        signals: [
          {
            description: 'anim dolor Excepteur elit consectetur',
            matchLevel: 'could_not_match',
            note: 'ipsum et in',
            reasonCode: 'tin_match',
            severity: 'medium',
          },
          {
            description: 'irure incididunt ea aliqua',
            matchLevel: 'no_match',
            note: 'eiusmod sed eu',
            reasonCode: 'phone_located_name_partially_matches',
            severity: 'medium',
          },
          {
            description: 'nisi minim adipisicing proident Duis',
            matchLevel: 'exact',
            note: 'amet Excepteur proident aliquip ut',
            reasonCode: 'dob_does_not_match',
            severity: 'low',
          },
        ],
      },
      document: {
        matchLevel: 'partial',
        signals: [
          {
            description: 'ipsum nisi Duis',
            matchLevel: 'partial',
            note: 'voluptate',
            reasonCode: 'document_barcode_could_not_be_detected',
            severity: 'low',
          },
          {
            description: 'consequat',
            matchLevel: 'partial',
            note: 'occaecat est nisi dolor dolore',
            reasonCode: 'phone_located_address_does_not_match',
            severity: 'info',
          },
          {
            description: 'ut',
            matchLevel: 'partial',
            note: 'in',
            reasonCode: 'dob_yob_does_not_match',
            severity: 'low',
          },
        ],
      },
      email: {
        matchLevel: 'could_not_match',
        signals: [
          {
            description: 'in mollit elit Lorem',
            matchLevel: 'no_match',
            note: 'esse velit Ut tempor elit',
            reasonCode: 'document_barcode_could_be_read',
            severity: 'high',
          },
          {
            description: 'id sed in fugiat',
            matchLevel: 'could_not_match',
            note: 'ad sint qui',
            reasonCode: 'watchlist_hit_warning',
            severity: 'medium',
          },
          {
            description: 'Lorem laboris eiusmod quis',
            matchLevel: 'exact',
            note: 'eiusmod',
            reasonCode: 'document_ocr_first_name_does_not_match',
            severity: 'medium',
          },
        ],
      },
      name: {
        matchLevel: 'exact',
        signals: [
          {
            description: 'proident nisi et',
            matchLevel: 'could_not_match',
            note: 'irure sunt in magna',
            reasonCode: 'email_domain_private',
            severity: 'low',
          },
          {
            description: 'tempor dolore in',
            matchLevel: 'partial',
            note: 'officia commodo et dolore eu',
            reasonCode: 'dob_mob_not_available',
            severity: 'low',
          },
          {
            description: 'qui eu aliqua Ut',
            matchLevel: 'partial',
            note: 'Ut nulla nisi laborum',
            reasonCode: 'document_pdf417_data_is_valid',
            severity: 'info',
          },
        ],
      },
      phone: {
        matchLevel: 'could_not_match',
        signals: [
          {
            description: 'dolor eu aute consectetur incididunt',
            matchLevel: 'exact',
            note: 'Excepteur tempor id',
            reasonCode: 'address_city_does_not_match',
            severity: 'low',
          },
          {
            description: 'Ut ipsum',
            matchLevel: 'no_match',
            note: 'voluptate',
            reasonCode: 'curp_malformed',
            severity: 'medium',
          },
          {
            description: 'consectetur id aliquip et',
            matchLevel: 'exact',
            note: 'commodo cillum et laboris',
            reasonCode: 'id_not_located',
            severity: 'high',
          },
        ],
      },
      ssn: {
        matchLevel: 'no_match',
        signals: [
          {
            description: 'veniam in',
            matchLevel: 'partial',
            note: 'in adipisicing pariatur',
            reasonCode: 'phone_located_does_not_match',
            severity: 'low',
          },
          {
            description: 'in ut sint dolor sit',
            matchLevel: 'could_not_match',
            note: 'eu ut',
            reasonCode: 'document_visible_photo_features_not_verified',
            severity: 'high',
          },
          {
            description: 'esse velit mollit',
            matchLevel: 'exact',
            note: 'ad dolore',
            reasonCode: 'sentilink_synthetic_identity_medium_risk',
            severity: 'high',
          },
        ],
      },
    },
    props,
  ) as GetFieldValidationResponse;
export const getGetUserVaultResponse = (props: Partial<GetUserVaultResponse>) =>
  merge(
    {
      customCreditCard: true,
      'id.dob': false,
      'id.first_name': true,
      'id.ssn9': true,
    },
    props,
  ) as GetUserVaultResponse;
export const getIdDocKind = (props: Partial<IdDocKind>) => (props ?? 'permit') as IdDocKind;
export const getIdentifyScope = (props: Partial<IdentifyScope>) => (props ?? 'auth') as IdentifyScope;
export const getInProgressOnboarding = (props: Partial<InProgressOnboarding>) =>
  merge(
    {
      fpId: 'c982ac8e-49a2-4c42-9d8f-78bc5c37138a',
      status: 'incomplete',
      tenant: {
        name: 'Jake Fisher-Little',
        websiteUrl: 'https://soggy-academics.biz/',
      },
      timestamp: '1952-06-08T17:12:42.0Z',
    },
    props,
  ) as InProgressOnboarding;
export const getInProgressOnboardingTenant = (props: Partial<InProgressOnboardingTenant>) =>
  merge(
    {
      name: 'Brittany Donnelly',
      websiteUrl: 'https://outlandish-order.info',
    },
    props,
  ) as InProgressOnboardingTenant;
export const getIngressSettings = (props: Partial<IngressSettings>) =>
  merge(
    {
      contentType: 'json',
      rules: [
        {
          target: 'aute',
          token: 'b43c983e-c68a-43ae-95e6-be170502967d',
        },
        {
          target: 'ad',
          token: 'b43c983e-c68a-43ae-95e6-be170502967d',
        },
        {
          target: 'dolore sed nisi sunt ad',
          token: 'b43c983e-c68a-43ae-95e6-be170502967d',
        },
      ],
    },
    props,
  ) as IngressSettings;
export const getInsightAddress = (props: Partial<InsightAddress>) =>
  merge(
    {
      addressLine1: '5595 Cherry Street Suite 935',
      addressLine2: '527 Schneider Dam Apt. 353',
      city: 'East Victorland',
      cmra: false,
      deliverable: true,
      latitude: 11652623.372281298,
      longitude: 1254768.914360091,
      postalCode: 'sit ad consequat occaecat',
      propertyType: 'reprehenderit occaecat consequat sunt proident',
      sources: 'sed',
      state: 'California',
      submitted: false,
      verified: true,
    },
    props,
  ) as InsightAddress;
export const getInsightBusinessName = (props: Partial<InsightBusinessName>) =>
  merge(
    {
      kind: 'dolore sint voluptate Ut ex',
      name: 'Edwin Becker',
      sources: 'ut',
      subStatus: 'Duis do aliqua in',
      submitted: true,
      verified: true,
    },
    props,
  ) as InsightBusinessName;
export const getInsightEvent = (props: Partial<InsightEvent>) =>
  merge(
    {
      city: 'New Laceyberg',
      country: 'Belgium',
      ipAddress: '3895 Jacobson Skyway Apt. 143',
      latitude: 51378495.41721636,
      longitude: -67563959.24112004,
      metroCode: 'esse Ut',
      postalCode: 'sint Ut id',
      region: 'nulla aliqua proident Excepteur enim',
      regionName: 'Dr. Wanda Will',
      sessionId: 'd12c6448-68f4-4720-a8d6-753cbea72a65',
      timeZone: 'incididunt velit magna ut in',
      timestamp: '1930-02-03T21:37:29.0Z',
      userAgent: 'dolore esse magna adipisicing ipsum',
    },
    props,
  ) as InsightEvent;
export const getInsightPerson = (props: Partial<InsightPerson>) =>
  merge(
    {
      associationVerified: false,
      name: 'Dwayne Moen',
      role: 'dolor',
      sources: 'velit reprehenderit laboris aliqua',
      submitted: true,
    },
    props,
  ) as InsightPerson;
export const getInsightPhone = (props: Partial<InsightPhone>) =>
  merge(
    {
      phone: '+17653903043',
      submitted: false,
      verified: false,
    },
    props,
  ) as InsightPhone;
export const getInsightRegistration = (props: Partial<InsightRegistration>) =>
  merge(
    {
      addresses: ['minim consectetur dolor Lorem fugiat', 'id occaecat in dolor', 'veniam fugiat dolore aute'],
      entityType: 'velit',
      fileNumber: 'nulla dolor aute labore sunt',
      jurisdiction: 'eu reprehenderit in et',
      name: 'Van Schoen',
      officers: [
        {
          name: 'Laverne Cassin',
          roles: 'ut dolor',
        },
        {
          name: 'Laverne Cassin',
          roles: 'veniam',
        },
        {
          name: 'Laverne Cassin',
          roles: 'qui anim',
        },
      ],
      registeredAgent: 'Duis adipisicing',
      registrationDate: 'laboris deserunt aliquip amet',
      source: 'aliquip commodo elit',
      state: 'Alabama',
      status: 'minim deserunt esse quis ullamco',
      subStatus: 'nostrud ut',
    },
    props,
  ) as InsightRegistration;
export const getInsightTin = (props: Partial<InsightTin>) =>
  merge(
    {
      tin: 'veniam officia do',
      verified: false,
    },
    props,
  ) as InsightTin;
export const getInsightWatchlist = (props: Partial<InsightWatchlist>) =>
  merge(
    {
      business: [
        {
          hits: [
            {
              agency: 'ad',
              agencyAbbr: 'eiusmod et aute fugiat eu',
              agencyInformationUrl: 'https://imaginative-crocodile.us/',
              agencyListUrl: 'https://shameful-trolley.name/',
              entityAliases: ['nulla', 'laborum', 'dolor sit'],
              entityName: 'Christy Baumbach',
              listCountry: 'Algeria',
              listName: 'Ralph Howell',
              url: 'https://splendid-address.info',
            },
            {
              agency: 'veniam id in magna sunt',
              agencyAbbr: 'officia commodo',
              agencyInformationUrl: 'https://imaginative-crocodile.us/',
              agencyListUrl: 'https://shameful-trolley.name/',
              entityAliases: ['in dolore in incididunt', 'proident reprehenderit', 'sit pariatur nostrud'],
              entityName: 'Christy Baumbach',
              listCountry: 'Algeria',
              listName: 'Ralph Howell',
              url: 'https://splendid-address.info',
            },
            {
              agency: 'dolor in esse',
              agencyAbbr: 'officia',
              agencyInformationUrl: 'https://imaginative-crocodile.us/',
              agencyListUrl: 'https://shameful-trolley.name/',
              entityAliases: ['irure', 'cupidatat', 'culpa Duis'],
              entityName: 'Christy Baumbach',
              listCountry: 'Algeria',
              listName: 'Ralph Howell',
              url: 'https://splendid-address.info',
            },
          ],
          screenedEntityName: 'Lindsey Considine',
        },
        {
          hits: [
            {
              agency: 'in cillum velit commodo',
              agencyAbbr: 'pariatur ad deserunt exercitation commodo',
              agencyInformationUrl: 'https://imaginative-crocodile.us/',
              agencyListUrl: 'https://shameful-trolley.name/',
              entityAliases: ['mollit laboris eiusmod qui', 'dolor', 'dolore id laboris non'],
              entityName: 'Christy Baumbach',
              listCountry: 'Algeria',
              listName: 'Ralph Howell',
              url: 'https://splendid-address.info',
            },
            {
              agency: 'consequat sint mollit',
              agencyAbbr: 'dolor deserunt dolor',
              agencyInformationUrl: 'https://imaginative-crocodile.us/',
              agencyListUrl: 'https://shameful-trolley.name/',
              entityAliases: ['mollit do cillum irure qui', 'occaecat nisi velit exercitation dolor', 'cillum irure'],
              entityName: 'Christy Baumbach',
              listCountry: 'Algeria',
              listName: 'Ralph Howell',
              url: 'https://splendid-address.info',
            },
            {
              agency: 'fugiat cupidatat',
              agencyAbbr: 'Duis dolor occaecat Ut',
              agencyInformationUrl: 'https://imaginative-crocodile.us/',
              agencyListUrl: 'https://shameful-trolley.name/',
              entityAliases: ['culpa fugiat mollit', 'et laboris', 'consectetur aliqua id magna'],
              entityName: 'Christy Baumbach',
              listCountry: 'Algeria',
              listName: 'Ralph Howell',
              url: 'https://splendid-address.info',
            },
          ],
          screenedEntityName: 'Lindsey Considine',
        },
        {
          hits: [
            {
              agency: 'voluptate non ea sunt Duis',
              agencyAbbr: 'proident',
              agencyInformationUrl: 'https://imaginative-crocodile.us/',
              agencyListUrl: 'https://shameful-trolley.name/',
              entityAliases: ['magna irure', 'qui laboris', 'reprehenderit'],
              entityName: 'Christy Baumbach',
              listCountry: 'Algeria',
              listName: 'Ralph Howell',
              url: 'https://splendid-address.info',
            },
            {
              agency: 'sit ut laboris fugiat Ut',
              agencyAbbr: 'minim labore sit dolor',
              agencyInformationUrl: 'https://imaginative-crocodile.us/',
              agencyListUrl: 'https://shameful-trolley.name/',
              entityAliases: ['sed', 'ad anim proident id', 'dolore'],
              entityName: 'Christy Baumbach',
              listCountry: 'Algeria',
              listName: 'Ralph Howell',
              url: 'https://splendid-address.info',
            },
            {
              agency: 'Excepteur',
              agencyAbbr: 'non enim',
              agencyInformationUrl: 'https://imaginative-crocodile.us/',
              agencyListUrl: 'https://shameful-trolley.name/',
              entityAliases: ['sit et quis ad dolore', 'voluptate aliquip', 'ut proident'],
              entityName: 'Christy Baumbach',
              listCountry: 'Algeria',
              listName: 'Ralph Howell',
              url: 'https://splendid-address.info',
            },
          ],
          screenedEntityName: 'Lindsey Considine',
        },
      ],
      hitCount: 37470799,
      people: [
        {
          hits: [
            {
              agency: 'voluptate',
              agencyAbbr: 'consectetur proident nisi culpa',
              agencyInformationUrl: 'https://warlike-hello.name',
              agencyListUrl: 'https://amazing-desk.name',
              entityAliases: ['cupidatat', 'amet reprehenderit ipsum ea irure', 'id non'],
              entityName: 'Aubrey Jerde DDS',
              listCountry: 'Virgin Islands, U.S.',
              listName: 'Melissa Huel',
              url: 'https://radiant-institute.biz',
            },
            {
              agency: 'sit culpa ipsum in',
              agencyAbbr: 'est in',
              agencyInformationUrl: 'https://warlike-hello.name',
              agencyListUrl: 'https://amazing-desk.name',
              entityAliases: ['deserunt incididunt esse sint', 'et in non ut minim', 'aliquip deserunt qui ut'],
              entityName: 'Aubrey Jerde DDS',
              listCountry: 'Virgin Islands, U.S.',
              listName: 'Melissa Huel',
              url: 'https://radiant-institute.biz',
            },
            {
              agency: 'non reprehenderit',
              agencyAbbr: 'laboris ullamco labore sunt',
              agencyInformationUrl: 'https://warlike-hello.name',
              agencyListUrl: 'https://amazing-desk.name',
              entityAliases: ['eiusmod', 'id esse', 'Excepteur voluptate enim dolore'],
              entityName: 'Aubrey Jerde DDS',
              listCountry: 'Virgin Islands, U.S.',
              listName: 'Melissa Huel',
              url: 'https://radiant-institute.biz',
            },
          ],
          screenedEntityName: 'Ismael Graham',
        },
        {
          hits: [
            {
              agency: 'voluptate',
              agencyAbbr: 'velit laboris Excepteur ipsum',
              agencyInformationUrl: 'https://warlike-hello.name',
              agencyListUrl: 'https://amazing-desk.name',
              entityAliases: ['elit dolore tempor commodo sint', 'ut ut commodo', 'nostrud labore ea id'],
              entityName: 'Aubrey Jerde DDS',
              listCountry: 'Virgin Islands, U.S.',
              listName: 'Melissa Huel',
              url: 'https://radiant-institute.biz',
            },
            {
              agency: 'amet id adipisicing',
              agencyAbbr: 'id ad',
              agencyInformationUrl: 'https://warlike-hello.name',
              agencyListUrl: 'https://amazing-desk.name',
              entityAliases: ['eiusmod', 'cupidatat', 'officia elit sint ut Excepteur'],
              entityName: 'Aubrey Jerde DDS',
              listCountry: 'Virgin Islands, U.S.',
              listName: 'Melissa Huel',
              url: 'https://radiant-institute.biz',
            },
            {
              agency: 'est',
              agencyAbbr: 'amet deserunt dolore incididunt',
              agencyInformationUrl: 'https://warlike-hello.name',
              agencyListUrl: 'https://amazing-desk.name',
              entityAliases: ['sunt veniam laboris Lorem', 'veniam', 'Ut est mollit'],
              entityName: 'Aubrey Jerde DDS',
              listCountry: 'Virgin Islands, U.S.',
              listName: 'Melissa Huel',
              url: 'https://radiant-institute.biz',
            },
          ],
          screenedEntityName: 'Ismael Graham',
        },
        {
          hits: [
            {
              agency: 'mollit Duis sunt',
              agencyAbbr: 'ut elit incididunt qui mollit',
              agencyInformationUrl: 'https://warlike-hello.name',
              agencyListUrl: 'https://amazing-desk.name',
              entityAliases: ['pariatur', 'occaecat laborum consequat quis', 'laborum veniam quis non'],
              entityName: 'Aubrey Jerde DDS',
              listCountry: 'Virgin Islands, U.S.',
              listName: 'Melissa Huel',
              url: 'https://radiant-institute.biz',
            },
            {
              agency: 'esse enim ut dolore',
              agencyAbbr: 'Lorem consectetur ipsum tempor',
              agencyInformationUrl: 'https://warlike-hello.name',
              agencyListUrl: 'https://amazing-desk.name',
              entityAliases: ['id laborum labore', 'ad', 'sunt ut nulla tempor fugiat'],
              entityName: 'Aubrey Jerde DDS',
              listCountry: 'Virgin Islands, U.S.',
              listName: 'Melissa Huel',
              url: 'https://radiant-institute.biz',
            },
            {
              agency: 'et',
              agencyAbbr: 'anim exercitation deserunt do',
              agencyInformationUrl: 'https://warlike-hello.name',
              agencyListUrl: 'https://amazing-desk.name',
              entityAliases: ['nisi sint enim', 'est amet exercitation', 'nulla labore deserunt dolor et'],
              entityName: 'Aubrey Jerde DDS',
              listCountry: 'Virgin Islands, U.S.',
              listName: 'Melissa Huel',
              url: 'https://radiant-institute.biz',
            },
          ],
          screenedEntityName: 'Ismael Graham',
        },
      ],
    },
    props,
  ) as InsightWatchlist;
export const getInsightWebsite = (props: Partial<InsightWebsite>) =>
  merge(
    {
      url: 'https://left-nougat.name',
      verified: false,
    },
    props,
  ) as InsightWebsite;
export const getIntegrityRequest = (props: Partial<IntegrityRequest>) =>
  merge(
    {
      fields: [
        'document.permit.clave_de_elector',
        'document.drivers_license.clave_de_elector',
        'document.visa.back.mime_type',
      ],
      signingKey: 'e8456e96-6efe-46fa-8482-d8f078426e75',
    },
    props,
  ) as IntegrityRequest;
export const getIntegrityResponse = (props: Partial<IntegrityResponse>) =>
  merge(
    {
      customCreditCard: 'f7dbdc6...',
      'id.last_name': 'f7ee801830...',
      'id.ssn9': '1cefe40fa...',
    },
    props,
  ) as IntegrityResponse;
export const getInvoicePreview = (props: Partial<InvoicePreview>) =>
  merge(
    {
      lastUpdatedAt: '1893-10-31T01:01:21.0Z',
      lineItems: [
        {
          description: 'incididunt ad irure ipsum adipisicing',
          id: '43cbb2b5-e0ae-469c-81b9-6c16f567fc9e',
          notionalCents: 72952582,
          quantity: 69321701,
          unitPriceCents: 'velit et deserunt dolor labore',
        },
        {
          description: 'incididunt enim',
          id: '43cbb2b5-e0ae-469c-81b9-6c16f567fc9e',
          notionalCents: 10056964,
          quantity: -33989985,
          unitPriceCents: 'et ut',
        },
        {
          description: 'in adipisicing non dolor',
          id: '43cbb2b5-e0ae-469c-81b9-6c16f567fc9e',
          notionalCents: 12325420,
          quantity: 56592365,
          unitPriceCents: 'cupidatat',
        },
      ],
    },
    props,
  ) as InvoicePreview;
export const getInvokeVaultProxyPermission = (props: Partial<InvokeVaultProxyPermission>) =>
  merge(
    {
      kind: 'any',
    },
    props,
  ) as InvokeVaultProxyPermission;
export const getIsIn = (props: Partial<IsIn>) => (props ?? 'is_not_in') as IsIn;
export const getIso3166TwoDigitCountryCode = (props: Partial<Iso3166TwoDigitCountryCode>) =>
  (props ?? 'MQ') as Iso3166TwoDigitCountryCode;
export const getLabelAdded = (props: Partial<LabelAdded>) =>
  merge(
    {
      kind: 'active',
    },
    props,
  ) as LabelAdded;
export const getLabelKind = (props: Partial<LabelKind>) => (props ?? 'active') as LabelKind;
export const getLineItem = (props: Partial<LineItem>) =>
  merge(
    {
      description: 'culpa est officia qui mollit',
      id: '9ae4570a-1ec0-4019-8665-b3aa7b7d0ed1',
      notionalCents: -9629722,
      quantity: 46032130,
      unitPriceCents: 'laboris irure dolore sed ut',
    },
    props,
  ) as LineItem;
export const getLinkAuthRequest = (props: Partial<LinkAuthRequest>) =>
  merge(
    {
      emailAddress: 'gideon19@gmail.com',
      redirectUrl: 'https://wealthy-pliers.name/',
    },
    props,
  ) as LinkAuthRequest;
export const getList = (props: Partial<List>) =>
  merge(
    {
      actor: {
        data: {
          id: 'd5f6524b-d480-4c89-8212-9052ae8a784c',
        },
        kind: 'user',
      },
      alias: 'minim occaecat labore',
      createdAt: '1911-10-26T17:46:24.0Z',
      entriesCount: 77929902,
      id: '8f2f8eaf-06ad-4419-9aff-c789a53b0e69',
      kind: 'ip_address',
      name: 'Sally Robel MD',
      usedInPlaybook: true,
    },
    props,
  ) as List;
export const getListDetails = (props: Partial<ListDetails>) =>
  merge(
    {
      actor: {
        data: {
          id: '65f44ad5-2d63-4209-8e88-a32c724bf5b4',
        },
        kind: 'user',
      },
      alias: 'Excepteur voluptate aute sunt aliqua',
      createdAt: '1928-07-22T22:48:19.0Z',
      id: '09c59ba2-a8c8-46c5-abbc-94f684d8ed20',
      kind: 'phone_country_code',
      name: 'Alexis Swaniawski',
      playbooks: [
        {
          id: '8e373c80-285d-4a14-862b-dba047194339',
          key: 'e638bfd4-0ee1-43bb-bf87-b2eca5490525',
          name: 'Alyssa Bins',
          rules: [
            {
              action: 'step_up.proof_of_address',
              createdAt: '1947-08-19T17:53:44.0Z',
              isShadow: true,
              kind: 'business',
              name: 'Carrie Osinski',
              ruleAction: {
                config: {},
                kind: 'pass_with_manual_review',
              },
              ruleExpression: [
                {
                  field: 'tin_match',
                  op: 'eq',
                  value: true,
                },
                {
                  field: 'business_name_no_watchlist_hits',
                  op: 'not_eq',
                  value: true,
                },
                {
                  field: 'ip_proxy',
                  op: 'not_eq',
                  value: false,
                },
              ],
              ruleId: 'b3e477ac-1266-4e91-b3d2-abcba8041599',
            },
            {
              action: 'step_up.identity',
              createdAt: '1920-09-21T01:46:20.0Z',
              isShadow: true,
              kind: 'business',
              name: 'Carrie Osinski',
              ruleAction: {
                config: {},
                kind: 'pass_with_manual_review',
              },
              ruleExpression: [
                {
                  field: 'attested_device_fraud_duplicate_risk_medium',
                  op: 'eq',
                  value: true,
                },
                {
                  field: 'sos_domestic_filing_status_not_in_good_standing',
                  op: 'eq',
                  value: true,
                },
                {
                  field: 'ssn_not_on_file',
                  op: 'not_eq',
                  value: false,
                },
              ],
              ruleId: 'b3e477ac-1266-4e91-b3d2-abcba8041599',
            },
            {
              action: 'step_up.proof_of_address',
              createdAt: '1960-01-04T13:28:54.0Z',
              isShadow: true,
              kind: 'any',
              name: 'Carrie Osinski',
              ruleAction: {
                config: {},
                kind: 'pass_with_manual_review',
              },
              ruleExpression: [
                {
                  field: 'sos_domestic_filing_status_not_provided_by_state',
                  op: 'not_eq',
                  value: false,
                },
                {
                  field: 'us_tax_id_is_itin',
                  op: 'eq',
                  value: true,
                },
                {
                  field: 'document_ocr_not_successful',
                  op: 'eq',
                  value: false,
                },
              ],
              ruleId: 'b3e477ac-1266-4e91-b3d2-abcba8041599',
            },
          ],
        },
        {
          id: '8e373c80-285d-4a14-862b-dba047194339',
          key: 'e638bfd4-0ee1-43bb-bf87-b2eca5490525',
          name: 'Alyssa Bins',
          rules: [
            {
              action: 'step_up.proof_of_address',
              createdAt: '1965-01-13T07:01:45.0Z',
              isShadow: false,
              kind: 'any',
              name: 'Carrie Osinski',
              ruleAction: {
                config: {},
                kind: 'pass_with_manual_review',
              },
              ruleExpression: [
                {
                  field: 'business_phone_number_match',
                  op: 'eq',
                  value: true,
                },
                {
                  field: 'document_not_verified',
                  op: 'not_eq',
                  value: false,
                },
                {
                  field: 'beneficial_owner_failed_kyc',
                  op: 'eq',
                  value: true,
                },
              ],
              ruleId: 'b3e477ac-1266-4e91-b3d2-abcba8041599',
            },
            {
              action: 'manual_review',
              createdAt: '1945-07-20T11:40:33.0Z',
              isShadow: true,
              kind: 'any',
              name: 'Carrie Osinski',
              ruleAction: {
                config: {},
                kind: 'pass_with_manual_review',
              },
              ruleExpression: [
                {
                  field: 'document_number_check_digit_does_not_match',
                  op: 'not_eq',
                  value: true,
                },
                {
                  field: 'ssn_located_is_itin',
                  op: 'eq',
                  value: true,
                },
                {
                  field: 'dob_does_not_match',
                  op: 'eq',
                  value: false,
                },
              ],
              ruleId: 'b3e477ac-1266-4e91-b3d2-abcba8041599',
            },
            {
              action: 'step_up.proof_of_address',
              createdAt: '1897-09-09T07:08:27.0Z',
              isShadow: false,
              kind: 'any',
              name: 'Carrie Osinski',
              ruleAction: {
                config: {},
                kind: 'pass_with_manual_review',
              },
              ruleExpression: [
                {
                  field: 'dob_located_age_below_minimum',
                  op: 'not_eq',
                  value: false,
                },
                {
                  field: 'ip_alert_data_center',
                  op: 'not_eq',
                  value: true,
                },
                {
                  field: 'business_website_verified',
                  op: 'not_eq',
                  value: false,
                },
              ],
              ruleId: 'b3e477ac-1266-4e91-b3d2-abcba8041599',
            },
          ],
        },
        {
          id: '8e373c80-285d-4a14-862b-dba047194339',
          key: 'e638bfd4-0ee1-43bb-bf87-b2eca5490525',
          name: 'Alyssa Bins',
          rules: [
            {
              action: 'step_up.identity_proof_of_ssn',
              createdAt: '1900-05-26T05:27:42.0Z',
              isShadow: false,
              kind: 'person',
              name: 'Carrie Osinski',
              ruleAction: {
                config: {},
                kind: 'pass_with_manual_review',
              },
              ruleExpression: [
                {
                  field: 'document_barcode_content_does_not_match',
                  op: 'not_eq',
                  value: true,
                },
                {
                  field: 'dob_located_age_above_maximum',
                  op: 'eq',
                  value: true,
                },
                {
                  field: 'input_phone_number_does_not_match_ip_state',
                  op: 'eq',
                  value: true,
                },
              ],
              ruleId: 'b3e477ac-1266-4e91-b3d2-abcba8041599',
            },
            {
              action: 'step_up.custom',
              createdAt: '1925-01-12T10:57:01.0Z',
              isShadow: false,
              kind: 'person',
              name: 'Carrie Osinski',
              ruleAction: {
                config: {},
                kind: 'pass_with_manual_review',
              },
              ruleExpression: [
                {
                  field: 'document_dob_crosscheck_does_not_match',
                  op: 'eq',
                  value: true,
                },
                {
                  field: 'document_ocr_first_name_matches',
                  op: 'eq',
                  value: false,
                },
                {
                  field: 'sos_business_address_filing_not_found',
                  op: 'not_eq',
                  value: false,
                },
              ],
              ruleId: 'b3e477ac-1266-4e91-b3d2-abcba8041599',
            },
            {
              action: 'step_up.proof_of_address',
              createdAt: '1916-07-28T15:38:53.0Z',
              isShadow: false,
              kind: 'person',
              name: 'Carrie Osinski',
              ruleAction: {
                config: {},
                kind: 'pass_with_manual_review',
              },
              ruleExpression: [
                {
                  field: 'curp_input_curp_invalid',
                  op: 'eq',
                  value: false,
                },
                {
                  field: 'curp_multiple_results_for_data',
                  op: 'eq',
                  value: true,
                },
                {
                  field: 'device_velocity',
                  op: 'not_eq',
                  value: false,
                },
              ],
              ruleId: 'b3e477ac-1266-4e91-b3d2-abcba8041599',
            },
          ],
        },
      ],
    },
    props,
  ) as ListDetails;
export const getListEntitiesSearchRequest = (props: Partial<ListEntitiesSearchRequest>) =>
  merge(
    {
      externalId: '327f1b8f-22b7-4d29-b9fe-4dec0f01216a',
      hasOutstandingWorkflowRequest: true,
      kind: 'business',
      labels: ['offboard_fraud', 'active', 'offboard_other'],
      pagination: {
        cursor: null,
        pageSize: 10,
      },
      playbookIds: ['quis aliquip ad ipsum non', 'sed ipsum non', 'quis Duis reprehenderit amet'],
      requiresManualReview: false,
      search: 'id et veniam consequat cillum',
      showAll: true,
      statuses: ['none', 'none', 'pass'],
      tags: ['culpa Excepteur reprehenderit ut consectetur', 'adipisicing', 'aute magna voluptate'],
      timestampGte: '1893-03-11T01:12:36.0Z',
      timestampLte: '1917-10-31T03:41:35.0Z',
      watchlistHit: true,
    },
    props,
  ) as ListEntitiesSearchRequest;
export const getListEntry = (props: Partial<ListEntry>) =>
  merge(
    {
      actor: {
        data: {
          id: '7613bc77-8ab5-40d1-be3f-d6578cee7479',
        },
        kind: 'user',
      },
      createdAt: '1952-10-03T10:14:01.0Z',
      data: 'esse minim ex cupidatat',
      id: '6ddfd770-7145-445b-a3cd-bd8bc622a84a',
    },
    props,
  ) as ListEntry;
export const getListEvent = (props: Partial<ListEvent>) =>
  merge(
    {
      detail: {
        data: {
          entries: ['aute ut dolore', 'sit dolore eu sed', 'deserunt sint qui sed ipsum'],
          listEntryCreationId: '916e558d-b40f-4c61-bedf-99a7326349f5',
          listId: '3fef960d-b34c-4b1f-bc78-bd292d23cf2a',
        },
        kind: 'create_list_entry',
      },
      id: '0dbdc0a3-d03d-4f0e-a01f-febace4c00ce',
      insightEvent: {
        city: 'Port Ikefurt',
        country: 'Malta',
        ipAddress: '68117 Litzy Heights Apt. 284',
        latitude: 63900560.2915653,
        longitude: -8975770.494365156,
        metroCode: 'elit enim non pariatur',
        postalCode: 'anim dolore mollit deserunt dolor',
        region: 'sint Excepteur',
        regionName: 'Jaime Hirthe',
        sessionId: '0f6b5c58-923e-4f8a-aa31-14537c13dc4e',
        timeZone: 'laborum velit',
        timestamp: '1935-02-05T08:38:46.0Z',
        userAgent: 'sit irure commodo ad esse',
      },
      name: 'Maxine Reichert',
      principal: {
        id: 'c8bb4fdc-f3bf-4d19-8daa-63ff1dafec93',
        kind: 'user',
      },
      tenantId: 'e9de1ebc-a20d-41a4-88cd-0eb00d62cfbb',
      timestamp: '1949-10-03T12:41:30.0Z',
    },
    props,
  ) as ListEvent;
export const getListEventDetail = (props: Partial<ListEventDetail>) =>
  merge(
    {
      data: {
        entries: ['pariatur anim', 'cillum', 'et magna sit'],
        listEntryCreationId: '674e5f8f-00f8-4cf6-9404-ad47a1fb9c40',
        listId: '66e138e4-d3af-4c79-8f08-ad580492aa8f',
      },
      kind: 'create_list_entry',
    },
    props,
  ) as ListEventDetail;
export const getListKind = (props: Partial<ListKind>) => (props ?? 'email_domain') as ListKind;
export const getListPlaybookUsage = (props: Partial<ListPlaybookUsage>) =>
  merge(
    {
      id: '9f1fb051-d64a-47a6-a448-cb313283a042',
      key: 'c0568a35-2843-43ba-85f1-5e922cee6b45',
      name: 'Marilyn Nader',
      rules: [
        {
          action: 'fail',
          createdAt: '1896-08-19T21:42:11.0Z',
          isShadow: false,
          kind: 'person',
          name: 'Dr. April Hauck',
          ruleAction: {
            config: {},
            kind: 'pass_with_manual_review',
          },
          ruleExpression: [
            {
              field: 'document_visible_photo_features_not_verified',
              op: 'eq',
              value: true,
            },
            {
              field: 'sos_domestic_filing_status_pending_active',
              op: 'eq',
              value: true,
            },
            {
              field: 'sos_business_address_active_filing_found',
              op: 'not_eq',
              value: false,
            },
          ],
          ruleId: 'e2283b5e-3833-482a-8cd2-41288aa59851',
        },
        {
          action: 'step_up.identity_proof_of_ssn_proof_of_address',
          createdAt: '1925-06-05T03:06:11.0Z',
          isShadow: true,
          kind: 'business',
          name: 'Dr. April Hauck',
          ruleAction: {
            config: {},
            kind: 'pass_with_manual_review',
          },
          ruleExpression: [
            {
              field: 'email_high_risk_fraud',
              op: 'not_eq',
              value: true,
            },
            {
              field: 'beneficial_owners_partial_match',
              op: 'not_eq',
              value: true,
            },
            {
              field: 'address_input_is_not_standard_university',
              op: 'eq',
              value: false,
            },
          ],
          ruleId: 'e2283b5e-3833-482a-8cd2-41288aa59851',
        },
        {
          action: 'pass_with_manual_review',
          createdAt: '1931-04-04T17:20:40.0Z',
          isShadow: true,
          kind: 'person',
          name: 'Dr. April Hauck',
          ruleAction: {
            config: {},
            kind: 'pass_with_manual_review',
          },
          ruleExpression: [
            {
              field: 'business_address_commercial',
              op: 'eq',
              value: true,
            },
            {
              field: 'tin_match',
              op: 'eq',
              value: false,
            },
            {
              field: 'document_selfie_used_with_different_information',
              op: 'eq',
              value: true,
            },
          ],
          ruleId: 'e2283b5e-3833-482a-8cd2-41288aa59851',
        },
      ],
    },
    props,
  ) as ListPlaybookUsage;
export const getLiteOrgMember = (props: Partial<LiteOrgMember>) =>
  merge(
    {
      firstName: 'Krystina',
      id: '3de30dc6-3c0e-45b9-af91-c076225e7292',
      lastName: 'Ruecker',
    },
    props,
  ) as LiteOrgMember;
export const getLiteUserAndOrg = (props: Partial<LiteUserAndOrg>) =>
  merge(
    {
      org: 'culpa',
      user: {
        firstName: 'Daija',
        id: '9b30bb70-cfff-4439-9c7f-7ba083361b20',
        lastName: 'Osinski',
      },
    },
    props,
  ) as LiteUserAndOrg;
export const getLivenessAttributes = (props: Partial<LivenessAttributes>) =>
  merge(
    {
      device: 'adipisicing pariatur',
      issuers: ['google', 'cloudflare', 'apple'],
      metadata: {},
      os: 'eiusmod nostrud aliqua veniam',
    },
    props,
  ) as LivenessAttributes;
export const getLivenessEvent = (props: Partial<LivenessEvent>) =>
  merge(
    {
      attributes: {
        device: 'fugiat deserunt labore sunt',
        issuers: ['google', 'google', 'cloudflare'],
        metadata: {},
        os: 'dolor culpa consequat ullamco',
      },
      insightEvent: {
        city: 'Kautzerchester',
        country: 'Lithuania',
        ipAddress: '44228 Medhurst Corner Apt. 413',
        latitude: 11889804.400364265,
        longitude: 64909680.6193521,
        metroCode: 'commodo laboris in irure',
        postalCode: 'Ut eiusmod deserunt sunt adipisicing',
        region: 'aliquip fugiat do non irure',
        regionName: 'Bobbie Ebert',
        sessionId: '51dbdcfe-1e32-4c0e-bcd6-8b74b1c60b06',
        timeZone: 'adipisicing minim deserunt',
        timestamp: '1955-03-02T22:32:38.0Z',
        userAgent: 'ut',
      },
      source: 'google_device_attestation',
    },
    props,
  ) as LivenessEvent;
export const getLivenessIssuer = (props: Partial<LivenessIssuer>) => (props ?? 'cloudflare') as LivenessIssuer;
export const getLivenessSource = (props: Partial<LivenessSource>) =>
  (props ?? 'webauthn_attestation') as LivenessSource;
export const getManualDecisionRequest = (props: Partial<ManualDecisionRequest>) =>
  merge(
    {
      annotation: {
        isPinned: true,
        note: 'et mollit Duis',
      },
      kind: 'manual_decision',
      status: 'pass',
    },
    props,
  ) as ManualDecisionRequest;
export const getManualReview = (props: Partial<ManualReview>) =>
  merge(
    {
      kind: 'rule_triggered',
    },
    props,
  ) as ManualReview;
export const getManualReviewKind = (props: Partial<ManualReviewKind>) =>
  (props ?? 'document_needs_review') as ManualReviewKind;
export const getMatchLevel = (props: Partial<MatchLevel>) => (props ?? 'exact') as MatchLevel;
export const getMultiUpdateRuleRequest = (props: Partial<MultiUpdateRuleRequest>) =>
  merge(
    {
      add: [
        {
          isShadow: true,
          name: 'Elizabeth Fritsch',
          ruleAction: 'pass_with_manual_review',
          ruleExpression: [
            {
              field: 'address_alert_single_address_in_file',
              op: 'not_eq',
              value: false,
            },
            {
              field: 'bureau_deleted_record',
              op: 'not_eq',
              value: false,
            },
            {
              field: 'email_address_invalid',
              op: 'not_eq',
              value: false,
            },
          ],
        },
        {
          isShadow: true,
          name: 'Elizabeth Fritsch',
          ruleAction: 'step_up.identity_proof_of_ssn_proof_of_address',
          ruleExpression: [
            {
              field: 'ssn_input_is_invalid',
              op: 'eq',
              value: true,
            },
            {
              field: 'email_domain_recently_created',
              op: 'eq',
              value: true,
            },
            {
              field: 'document_expiration_date_crosscheck_matches',
              op: 'eq',
              value: true,
            },
          ],
        },
        {
          isShadow: true,
          name: 'Elizabeth Fritsch',
          ruleAction: 'fail',
          ruleExpression: [
            {
              field: 'name_does_not_match',
              op: 'eq',
              value: false,
            },
            {
              field: 'document_field_crosscheck_failed',
              op: 'not_eq',
              value: false,
            },
            {
              field: 'address_located_is_not_standard_general_delivery',
              op: 'eq',
              value: false,
            },
          ],
        },
      ],
      delete: ['ea Duis', 'Duis', 'officia tempor pariatur Ut'],
      edit: [
        {
          ruleExpression: [
            {
              field: 'address_input_not_on_file',
              op: 'not_eq',
              value: false,
            },
            {
              field: 'ip_not_located',
              op: 'eq',
              value: true,
            },
            {
              field: 'address_input_is_non_residential',
              op: 'not_eq',
              value: true,
            },
          ],
          ruleId: 'a0c0ddc3-623c-4a23-a8a2-50461a328b4d',
        },
        {
          ruleExpression: [
            {
              field: 'business_address_close_match',
              op: 'not_eq',
              value: false,
            },
            {
              field: 'phone_located_address_matches',
              op: 'not_eq',
              value: false,
            },
            {
              field: 'document_full_name_crosscheck_does_not_match',
              op: 'eq',
              value: false,
            },
          ],
          ruleId: 'a0c0ddc3-623c-4a23-a8a2-50461a328b4d',
        },
        {
          ruleExpression: [
            {
              field: 'ip_proxy',
              op: 'eq',
              value: true,
            },
            {
              field: 'address_matches',
              op: 'eq',
              value: false,
            },
            {
              field: 'sos_business_address_filing_not_found',
              op: 'eq',
              value: false,
            },
          ],
          ruleId: 'a0c0ddc3-623c-4a23-a8a2-50461a328b4d',
        },
      ],
      expectedRuleSetVersion: -2451440,
    },
    props,
  ) as MultiUpdateRuleRequest;
export const getNumberOperator = (props: Partial<NumberOperator>) => (props ?? 'lt') as NumberOperator;
export const getObConfigurationKind = (props: Partial<ObConfigurationKind>) =>
  (props ?? 'document') as ObConfigurationKind;
export const getOfficer = (props: Partial<Officer>) =>
  merge(
    {
      name: 'Cory Goldner',
      roles: 'id esse in sed',
    },
    props,
  ) as Officer;
export const getOffsetPaginatedDashboardSecretApiKey = (props: Partial<OffsetPaginatedDashboardSecretApiKey>) =>
  merge(
    {
      data: [
        {
          createdAt: '1898-10-22T15:36:43.0Z',
          id: '5efc1e67-b61c-465b-8759-9f67719e0e3d',
          isLive: true,
          key: '983e2a92-0d3b-4df6-a14d-2f08d5061b89',
          lastUsedAt: '1891-06-15T20:07:33.0Z',
          name: 'Darla Rice IV',
          role: {
            createdAt: '1945-03-15T01:53:01.0Z',
            id: 'cbfef214-2ae3-4923-94c7-9209631c6ed2',
            isImmutable: false,
            kind: 'dashboard_user',
            name: 'Mona Kreiger DVM',
            numActiveApiKeys: -36815535,
            numActiveUsers: -73938919,
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
          scrubbedKey: '4fd2f31d-bf79-4fe8-bf92-505922e2385f',
          status: 'disabled',
        },
        {
          createdAt: '1924-02-08T18:20:39.0Z',
          id: '5efc1e67-b61c-465b-8759-9f67719e0e3d',
          isLive: true,
          key: '983e2a92-0d3b-4df6-a14d-2f08d5061b89',
          lastUsedAt: '1957-03-27T01:59:51.0Z',
          name: 'Darla Rice IV',
          role: {
            createdAt: '1915-12-03T02:16:24.0Z',
            id: 'cbfef214-2ae3-4923-94c7-9209631c6ed2',
            isImmutable: true,
            kind: 'dashboard_user',
            name: 'Mona Kreiger DVM',
            numActiveApiKeys: -45116585,
            numActiveUsers: 63136631,
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
          scrubbedKey: '4fd2f31d-bf79-4fe8-bf92-505922e2385f',
          status: 'enabled',
        },
        {
          createdAt: '1966-11-18T10:28:03.0Z',
          id: '5efc1e67-b61c-465b-8759-9f67719e0e3d',
          isLive: false,
          key: '983e2a92-0d3b-4df6-a14d-2f08d5061b89',
          lastUsedAt: '1898-02-19T18:37:01.0Z',
          name: 'Darla Rice IV',
          role: {
            createdAt: '1933-09-11T04:40:46.0Z',
            id: 'cbfef214-2ae3-4923-94c7-9209631c6ed2',
            isImmutable: true,
            kind: 'api_key',
            name: 'Mona Kreiger DVM',
            numActiveApiKeys: 67537695,
            numActiveUsers: 56160070,
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
          scrubbedKey: '4fd2f31d-bf79-4fe8-bf92-505922e2385f',
          status: 'enabled',
        },
      ],
      meta: {
        count: 10000,
        nextPage: 2,
      },
    },
    props,
  ) as OffsetPaginatedDashboardSecretApiKey;
export const getOffsetPaginatedEntityOnboarding = (props: Partial<OffsetPaginatedEntityOnboarding>) =>
  merge(
    {
      data: [
        {
          id: '077aad89-395b-4b5e-a239-d79908ebb90e',
          playbookKey: 'pb_live_fZvYlX3JpanlQ3MAwE45g0',
          ruleSetResults: [
            {
              id: 'e8552635-c367-42cd-b79e-fe8c2924ef64',
              timestamp: '1940-11-25T15:50:27.0Z',
            },
            {
              id: 'e8552635-c367-42cd-b79e-fe8c2924ef64',
              timestamp: '1920-03-11T13:45:12.0Z',
            },
            {
              id: 'e8552635-c367-42cd-b79e-fe8c2924ef64',
              timestamp: '1903-07-25T08:30:02.0Z',
            },
          ],
          seqno: -27371663,
          status: 'none',
          timestamp: '1915-11-04T14:56:40.0Z',
        },
        {
          id: '077aad89-395b-4b5e-a239-d79908ebb90e',
          playbookKey: 'pb_live_fZvYlX3JpanlQ3MAwE45g0',
          ruleSetResults: [
            {
              id: 'e8552635-c367-42cd-b79e-fe8c2924ef64',
              timestamp: '1939-07-12T19:43:04.0Z',
            },
            {
              id: 'e8552635-c367-42cd-b79e-fe8c2924ef64',
              timestamp: '1968-08-16T18:18:34.0Z',
            },
            {
              id: 'e8552635-c367-42cd-b79e-fe8c2924ef64',
              timestamp: '1939-06-27T08:45:42.0Z',
            },
          ],
          seqno: 80133951,
          status: 'incomplete',
          timestamp: '1924-10-06T18:26:33.0Z',
        },
        {
          id: '077aad89-395b-4b5e-a239-d79908ebb90e',
          playbookKey: 'pb_live_fZvYlX3JpanlQ3MAwE45g0',
          ruleSetResults: [
            {
              id: 'e8552635-c367-42cd-b79e-fe8c2924ef64',
              timestamp: '1961-06-04T01:53:45.0Z',
            },
            {
              id: 'e8552635-c367-42cd-b79e-fe8c2924ef64',
              timestamp: '1923-12-26T02:45:02.0Z',
            },
            {
              id: 'e8552635-c367-42cd-b79e-fe8c2924ef64',
              timestamp: '1903-07-28T05:01:51.0Z',
            },
          ],
          seqno: 23215327,
          status: 'pass',
          timestamp: '1961-02-03T22:35:24.0Z',
        },
      ],
      meta: {
        nextPage: 2,
      },
    },
    props,
  ) as OffsetPaginatedEntityOnboarding;
export const getOffsetPaginatedList = (props: Partial<OffsetPaginatedList>) =>
  merge(
    {
      data: [
        {
          actor: {
            data: {
              id: 'd0bd25ea-a192-40c7-b061-f2735d9f1d08',
            },
            kind: 'user',
          },
          alias: 'exercitation',
          createdAt: '1920-08-13T02:55:01.0Z',
          entriesCount: 35262639,
          id: '881128f5-1a37-4929-8632-b6c714158216',
          kind: 'ip_address',
          name: 'Shelly Smith',
          usedInPlaybook: false,
        },
        {
          actor: {
            data: {
              id: 'd0bd25ea-a192-40c7-b061-f2735d9f1d08',
            },
            kind: 'user',
          },
          alias: 'ut reprehenderit irure deserunt',
          createdAt: '1909-07-10T05:48:40.0Z',
          entriesCount: -46408731,
          id: '881128f5-1a37-4929-8632-b6c714158216',
          kind: 'ssn9',
          name: 'Shelly Smith',
          usedInPlaybook: true,
        },
        {
          actor: {
            data: {
              id: 'd0bd25ea-a192-40c7-b061-f2735d9f1d08',
            },
            kind: 'user',
          },
          alias: 'elit dolor',
          createdAt: '1890-01-06T23:01:10.0Z',
          entriesCount: -9470628,
          id: '881128f5-1a37-4929-8632-b6c714158216',
          kind: 'ssn9',
          name: 'Shelly Smith',
          usedInPlaybook: true,
        },
      ],
      meta: {
        count: 10000,
        nextPage: 2,
      },
    },
    props,
  ) as OffsetPaginatedList;
export const getOffsetPaginatedOnboardingConfiguration = (props: Partial<OffsetPaginatedOnboardingConfiguration>) =>
  merge(
    {
      data: [
        {
          allowInternationalResidents: true,
          allowReonboard: true,
          allowUsResidents: false,
          allowUsTerritoryResidents: false,
          author: {
            id: '25fcadb1-110c-4e83-a596-48366e78ce62',
            kind: 'user',
          },
          businessDocumentsToCollect: [
            {
              data: {
                collectSelfie: true,
                documentTypesAndCountries: {
                  countrySpecific: {},
                  global: ['drivers_license', 'residence_document', 'voter_identification'],
                },
              },
              kind: 'identity',
            },
            {
              data: {
                collectSelfie: true,
                documentTypesAndCountries: {
                  countrySpecific: {},
                  global: ['drivers_license', 'passport_card', 'residence_document'],
                },
              },
              kind: 'identity',
            },
            {
              data: {
                collectSelfie: true,
                documentTypesAndCountries: {
                  countrySpecific: {},
                  global: ['id_card', 'permit', 'drivers_license'],
                },
              },
              kind: 'identity',
            },
          ],
          canAccessData: ['business_website', 'business_tin', 'phone_number'],
          cipKind: 'apex',
          createdAt: '1953-02-23T14:54:21.0Z',
          curpValidationEnabled: false,
          documentTypesAndCountries: {
            countrySpecific: {},
            global: ['passport_card', 'passport', 'residence_document'],
          },
          documentsToCollect: [
            {
              data: {
                collectSelfie: true,
                documentTypesAndCountries: {
                  countrySpecific: {},
                  global: ['visa', 'drivers_license', 'permit'],
                },
              },
              kind: 'identity',
            },
            {
              data: {
                collectSelfie: true,
                documentTypesAndCountries: {
                  countrySpecific: {},
                  global: ['residence_document', 'permit', 'passport'],
                },
              },
              kind: 'identity',
            },
            {
              data: {
                collectSelfie: false,
                documentTypesAndCountries: {
                  countrySpecific: {},
                  global: ['passport', 'drivers_license', 'voter_identification'],
                },
              },
              kind: 'identity',
            },
          ],
          enhancedAml: {
            adverseMedia: true,
            enhancedAml: false,
            matchKind: 'fuzzy_low',
            ofac: true,
            pep: false,
          },
          id: '6e33c75c-31ee-4956-8fac-3ed47755d1b7',
          internationalCountryRestrictions: ['MP', 'AR', 'SX'],
          isDocFirstFlow: false,
          isLive: false,
          isNoPhoneFlow: false,
          isRulesEnabled: false,
          key: '15d32e29-5bc3-4dc8-a3ad-6a7fc4a0be6e',
          kind: 'kyc',
          mustCollectData: ['business_kyced_beneficial_owners', 'business_beneficial_owners', 'ssn9'],
          name: 'Cristina Bailey',
          optionalData: ['us_legal_status', 'ssn9', 'business_corporation_type'],
          promptForPasskey: false,
          requiredAuthMethods: ['passkey', 'passkey', 'phone'],
          ruleSet: {
            version: -93521090,
          },
          skipConfirm: false,
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
          ],
        },
        {
          allowInternationalResidents: false,
          allowReonboard: true,
          allowUsResidents: false,
          allowUsTerritoryResidents: true,
          author: {
            id: '25fcadb1-110c-4e83-a596-48366e78ce62',
            kind: 'user',
          },
          businessDocumentsToCollect: [
            {
              data: {
                collectSelfie: false,
                documentTypesAndCountries: {
                  countrySpecific: {},
                  global: ['passport', 'id_card', 'permit'],
                },
              },
              kind: 'identity',
            },
            {
              data: {
                collectSelfie: false,
                documentTypesAndCountries: {
                  countrySpecific: {},
                  global: ['passport', 'passport', 'drivers_license'],
                },
              },
              kind: 'identity',
            },
            {
              data: {
                collectSelfie: false,
                documentTypesAndCountries: {
                  countrySpecific: {},
                  global: ['passport_card', 'voter_identification', 'voter_identification'],
                },
              },
              kind: 'identity',
            },
          ],
          canAccessData: ['email', 'bank', 'full_address'],
          cipKind: 'apex',
          createdAt: '1966-01-13T22:36:58.0Z',
          curpValidationEnabled: false,
          documentTypesAndCountries: {
            countrySpecific: {},
            global: ['drivers_license', 'passport', 'drivers_license'],
          },
          documentsToCollect: [
            {
              data: {
                collectSelfie: true,
                documentTypesAndCountries: {
                  countrySpecific: {},
                  global: ['permit', 'voter_identification', 'residence_document'],
                },
              },
              kind: 'identity',
            },
            {
              data: {
                collectSelfie: false,
                documentTypesAndCountries: {
                  countrySpecific: {},
                  global: ['passport', 'passport_card', 'visa'],
                },
              },
              kind: 'identity',
            },
            {
              data: {
                collectSelfie: true,
                documentTypesAndCountries: {
                  countrySpecific: {},
                  global: ['permit', 'id_card', 'drivers_license'],
                },
              },
              kind: 'identity',
            },
          ],
          enhancedAml: {
            adverseMedia: true,
            enhancedAml: false,
            matchKind: 'fuzzy_low',
            ofac: false,
            pep: false,
          },
          id: '6e33c75c-31ee-4956-8fac-3ed47755d1b7',
          internationalCountryRestrictions: ['NZ', 'ST', 'NG'],
          isDocFirstFlow: false,
          isLive: false,
          isNoPhoneFlow: false,
          isRulesEnabled: true,
          key: '15d32e29-5bc3-4dc8-a3ad-6a7fc4a0be6e',
          kind: 'kyb',
          mustCollectData: ['business_corporation_type', 'ssn4', 'ssn4'],
          name: 'Cristina Bailey',
          optionalData: ['investor_profile', 'business_beneficial_owners', 'bank'],
          promptForPasskey: false,
          requiredAuthMethods: ['passkey', 'email', 'phone'],
          ruleSet: {
            version: -98952522,
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
          ],
        },
        {
          allowInternationalResidents: true,
          allowReonboard: false,
          allowUsResidents: false,
          allowUsTerritoryResidents: false,
          author: {
            id: '25fcadb1-110c-4e83-a596-48366e78ce62',
            kind: 'user',
          },
          businessDocumentsToCollect: [
            {
              data: {
                collectSelfie: false,
                documentTypesAndCountries: {
                  countrySpecific: {},
                  global: ['permit', 'voter_identification', 'drivers_license'],
                },
              },
              kind: 'identity',
            },
            {
              data: {
                collectSelfie: true,
                documentTypesAndCountries: {
                  countrySpecific: {},
                  global: ['id_card', 'permit', 'voter_identification'],
                },
              },
              kind: 'identity',
            },
            {
              data: {
                collectSelfie: false,
                documentTypesAndCountries: {
                  countrySpecific: {},
                  global: ['residence_document', 'passport_card', 'passport_card'],
                },
              },
              kind: 'identity',
            },
          ],
          canAccessData: ['business_address', 'ssn9', 'ssn4'],
          cipKind: 'alpaca',
          createdAt: '1927-10-01T05:08:47.0Z',
          curpValidationEnabled: false,
          documentTypesAndCountries: {
            countrySpecific: {},
            global: ['passport_card', 'permit', 'drivers_license'],
          },
          documentsToCollect: [
            {
              data: {
                collectSelfie: true,
                documentTypesAndCountries: {
                  countrySpecific: {},
                  global: ['id_card', 'permit', 'permit'],
                },
              },
              kind: 'identity',
            },
            {
              data: {
                collectSelfie: false,
                documentTypesAndCountries: {
                  countrySpecific: {},
                  global: ['passport', 'permit', 'residence_document'],
                },
              },
              kind: 'identity',
            },
            {
              data: {
                collectSelfie: false,
                documentTypesAndCountries: {
                  countrySpecific: {},
                  global: ['voter_identification', 'voter_identification', 'voter_identification'],
                },
              },
              kind: 'identity',
            },
          ],
          enhancedAml: {
            adverseMedia: false,
            enhancedAml: false,
            matchKind: 'fuzzy_high',
            ofac: true,
            pep: false,
          },
          id: '6e33c75c-31ee-4956-8fac-3ed47755d1b7',
          internationalCountryRestrictions: ['JO', 'BH', 'HT'],
          isDocFirstFlow: true,
          isLive: true,
          isNoPhoneFlow: true,
          isRulesEnabled: false,
          key: '15d32e29-5bc3-4dc8-a3ad-6a7fc4a0be6e',
          kind: 'kyb',
          mustCollectData: ['ssn4', 'phone_number', 'full_address'],
          name: 'Cristina Bailey',
          optionalData: ['nationality', 'ssn9', 'bank'],
          promptForPasskey: true,
          requiredAuthMethods: ['phone', 'passkey', 'phone'],
          ruleSet: {
            version: -54696608,
          },
          skipConfirm: false,
          skipKyb: true,
          skipKyc: true,
          status: 'enabled',
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
                einOnly: true,
              },
              kind: 'kyb',
            },
          ],
        },
      ],
      meta: {
        count: 10000,
        nextPage: 2,
      },
    },
    props,
  ) as OffsetPaginatedOnboardingConfiguration;
export const getOffsetPaginatedOrganizationMember = (props: Partial<OffsetPaginatedOrganizationMember>) =>
  merge(
    {
      data: [
        {
          createdAt: '1956-06-29T11:12:07.0Z',
          email: 'heidi_abshire45@gmail.com',
          firstName: 'Aaron',
          id: '2b16dd7c-eb70-4144-9fad-60363a8743ab',
          isFirmEmployee: false,
          lastName: 'Reilly-Kovacek',
          role: {
            createdAt: '1931-10-08T02:49:02.0Z',
            id: 'e3a30568-7db5-427f-8ccd-e2d2b6462f13',
            isImmutable: false,
            kind: 'compliance_partner_dashboard_user',
            name: "Courtney O'Keefe-Heathcote",
            numActiveApiKeys: 84125047,
            numActiveUsers: 53867267,
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
            lastLoginAt: '1949-11-17T13:26:56.0Z',
          },
        },
        {
          createdAt: '1931-03-07T09:03:39.0Z',
          email: 'heidi_abshire45@gmail.com',
          firstName: 'Aaron',
          id: '2b16dd7c-eb70-4144-9fad-60363a8743ab',
          isFirmEmployee: true,
          lastName: 'Reilly-Kovacek',
          role: {
            createdAt: '1927-11-02T01:10:39.0Z',
            id: 'e3a30568-7db5-427f-8ccd-e2d2b6462f13',
            isImmutable: true,
            kind: 'dashboard_user',
            name: "Courtney O'Keefe-Heathcote",
            numActiveApiKeys: 92487107,
            numActiveUsers: 69538557,
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
            lastLoginAt: '1897-07-16T10:10:20.0Z',
          },
        },
        {
          createdAt: '1895-01-29T01:05:58.0Z',
          email: 'heidi_abshire45@gmail.com',
          firstName: 'Aaron',
          id: '2b16dd7c-eb70-4144-9fad-60363a8743ab',
          isFirmEmployee: false,
          lastName: 'Reilly-Kovacek',
          role: {
            createdAt: '1912-09-03T01:21:55.0Z',
            id: 'e3a30568-7db5-427f-8ccd-e2d2b6462f13',
            isImmutable: false,
            kind: 'api_key',
            name: "Courtney O'Keefe-Heathcote",
            numActiveApiKeys: -30992189,
            numActiveUsers: -27725384,
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
            lastLoginAt: '1896-09-03T02:15:39.0Z',
          },
        },
      ],
      meta: {
        count: 10000,
        nextPage: 2,
      },
    },
    props,
  ) as OffsetPaginatedOrganizationMember;
export const getOffsetPaginatedOrganizationRole = (props: Partial<OffsetPaginatedOrganizationRole>) =>
  merge(
    {
      data: [
        {
          createdAt: '1947-03-15T09:54:58.0Z',
          id: '60ec984c-adf3-4f21-84e3-4144a284768b',
          isImmutable: true,
          kind: 'dashboard_user',
          name: 'Tricia Rowe',
          numActiveApiKeys: -23928596,
          numActiveUsers: -6740034,
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
          createdAt: '1963-06-13T07:37:21.0Z',
          id: '60ec984c-adf3-4f21-84e3-4144a284768b',
          isImmutable: false,
          kind: 'dashboard_user',
          name: 'Tricia Rowe',
          numActiveApiKeys: 72791024,
          numActiveUsers: -60632713,
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
          createdAt: '1931-12-24T15:16:23.0Z',
          id: '60ec984c-adf3-4f21-84e3-4144a284768b',
          isImmutable: false,
          kind: 'dashboard_user',
          name: 'Tricia Rowe',
          numActiveApiKeys: 81958821,
          numActiveUsers: 2109240,
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
        count: 10000,
        nextPage: 2,
      },
    },
    props,
  ) as OffsetPaginatedOrganizationRole;
export const getOmittedSecretCustomHeader = (props: Partial<OmittedSecretCustomHeader>) =>
  merge(
    {
      id: 'b6791999-ef72-4159-b9f2-b69cf01c5283',
      name: 'Erica Macejkovic DVM',
    },
    props,
  ) as OmittedSecretCustomHeader;
export const getOnboardingConfiguration = (props: Partial<OnboardingConfiguration>) =>
  merge(
    {
      allowInternationalResidents: false,
      allowReonboard: false,
      allowUsResidents: false,
      allowUsTerritoryResidents: true,
      author: {
        id: 'fe0e0963-9e90-4bda-b243-ce3f1f20c5b6',
        kind: 'user',
      },
      businessDocumentsToCollect: [
        {
          data: {
            collectSelfie: false,
            documentTypesAndCountries: {
              countrySpecific: {},
              global: ['drivers_license', 'passport_card', 'visa'],
            },
          },
          kind: 'identity',
        },
        {
          data: {
            collectSelfie: true,
            documentTypesAndCountries: {
              countrySpecific: {},
              global: ['passport_card', 'voter_identification', 'voter_identification'],
            },
          },
          kind: 'identity',
        },
        {
          data: {
            collectSelfie: true,
            documentTypesAndCountries: {
              countrySpecific: {},
              global: ['id_card', 'passport', 'id_card'],
            },
          },
          kind: 'identity',
        },
      ],
      canAccessData: ['email', 'full_address', 'ssn9'],
      cipKind: 'apex',
      createdAt: '1942-07-28T18:04:48.0Z',
      curpValidationEnabled: true,
      documentTypesAndCountries: {
        countrySpecific: {},
        global: ['permit', 'drivers_license', 'id_card'],
      },
      documentsToCollect: [
        {
          data: {
            collectSelfie: true,
            documentTypesAndCountries: {
              countrySpecific: {},
              global: ['residence_document', 'permit', 'visa'],
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
        {
          data: {
            collectSelfie: true,
            documentTypesAndCountries: {
              countrySpecific: {},
              global: ['visa', 'residence_document', 'residence_document'],
            },
          },
          kind: 'identity',
        },
      ],
      enhancedAml: {
        adverseMedia: true,
        enhancedAml: true,
        matchKind: 'exact_name',
        ofac: true,
        pep: false,
      },
      id: '05406547-9e9f-447a-bfc0-e52cc568722a',
      internationalCountryRestrictions: ['GP', 'TJ', 'ZA'],
      isDocFirstFlow: true,
      isLive: false,
      isNoPhoneFlow: false,
      isRulesEnabled: false,
      key: '77a3de12-fb5f-4910-bf52-151764d51e04',
      kind: 'kyb',
      mustCollectData: ['business_kyced_beneficial_owners', 'nationality', 'nationality'],
      name: 'Amy Roob',
      optionalData: ['business_kyced_beneficial_owners', 'name', 'business_tin'],
      promptForPasskey: true,
      requiredAuthMethods: ['email', 'phone', 'passkey'],
      ruleSet: {
        version: 84989566,
      },
      skipConfirm: true,
      skipKyb: false,
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
            einOnly: true,
          },
          kind: 'kyb',
        },
      ],
    },
    props,
  ) as OnboardingConfiguration;
export const getOnboardingStatus = (props: Partial<OnboardingStatus>) => (props ?? 'none') as OnboardingStatus;
export const getOnboardingTimelineInfo = (props: Partial<OnboardingTimelineInfo>) =>
  merge(
    {
      event: 'eiusmod Ut incididunt aliquip',
      sessionId: '59f6d954-d9e1-496b-a823-7da5b7fd25c7',
    },
    props,
  ) as OnboardingTimelineInfo;
export const getOrgClientSecurityConfig = (props: Partial<OrgClientSecurityConfig>) =>
  merge(
    {
      allowedOrigins: [
        'incididunt Duis nostrud culpa enim',
        'incididunt dolore ut',
        'sunt quis dolore dolor reprehenderit',
      ],
      isLive: false,
    },
    props,
  ) as OrgClientSecurityConfig;
export const getOrgFrequentNote = (props: Partial<OrgFrequentNote>) =>
  merge(
    {
      content: 'id',
      id: '030f6857-de14-4cfc-8f9e-3529b9aef846',
      kind: 'trigger',
    },
    props,
  ) as OrgFrequentNote;
export const getOrgLoginResponse = (props: Partial<OrgLoginResponse>) =>
  merge(
    {
      authToken: '24a5960a-7f4a-4080-a126-810e283a10cd',
      createdNewTenant: false,
      isFirstLogin: false,
      isMissingRequestedOrg: true,
      partnerTenant: {
        allowDomainAccess: true,
        domains: ['id tempor voluptate labore ut', 'minim', 'cillum irure'],
        id: 'd2a62a33-53c5-4505-90a4-0f4eed11a8b5',
        isAuthMethodSupported: true,
        isDomainAlreadyClaimed: true,
        logoUrl: 'https://noxious-flu.com',
        name: 'Lucy Bogisich',
        websiteUrl: 'https://untried-depot.us/',
      },
      requiresOnboarding: true,
      tenant: {
        allowDomainAccess: false,
        allowedPreviewApis: ['list_business_owners', 'decisions_list', 'implicit_auth'],
        companySize: 's101_to1000',
        domains: ['dolore ea', 'et voluptate dolore occaecat', 'sunt mollit non tempor ut'],
        id: 'bc3ec5eb-7741-4fea-bc63-01cb3cbc7117',
        isAuthMethodSupported: false,
        isDomainAlreadyClaimed: true,
        isProdAuthPlaybookRestricted: true,
        isProdKybPlaybookRestricted: false,
        isProdKycPlaybookRestricted: true,
        isProdNeuroEnabled: true,
        isProdSentilinkEnabled: true,
        isSandboxRestricted: false,
        logoUrl: 'https://rough-bracelet.org/',
        name: 'Mandy Gerhold',
        parent: {
          id: '20a42ed2-2729-41c5-a022-1896276d4fb7',
          name: 'Miss Sheri Jacobs',
        },
        supportEmail: 'calista41@gmail.com',
        supportPhone: '+17598230671',
        supportWebsite: 'https://avaricious-forage.org/',
        websiteUrl: 'https://witty-comparison.net',
      },
      user: {
        createdAt: '1896-11-17T05:38:56.0Z',
        email: 'emmet.mitchell@gmail.com',
        firstName: 'Winfield',
        id: '083364c8-c714-4df8-8351-bbab34d4d5ca',
        isFirmEmployee: true,
        lastName: 'Lang',
        role: {
          createdAt: '1967-04-22T14:53:47.0Z',
          id: '3244c030-1e02-4933-b6f4-c454119f2a4d',
          isImmutable: false,
          kind: 'dashboard_user',
          name: 'Tara Bednar IV',
          numActiveApiKeys: -55929747,
          numActiveUsers: 36812971,
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
          lastLoginAt: '1928-08-03T14:08:52.0Z',
        },
      },
    },
    props,
  ) as OrgLoginResponse;
export const getOrgMetrics = (props: Partial<OrgMetrics>) =>
  merge(
    {
      failOnboardings: 73131126,
      incompleteOnboardings: -49382531,
      newVaults: 64732321,
      passOnboardings: -40019372,
      totalOnboardings: 90656076,
    },
    props,
  ) as OrgMetrics;
export const getOrgMetricsResponse = (props: Partial<OrgMetricsResponse>) =>
  merge(
    {
      business: {
        failOnboardings: -26988259,
        incompleteOnboardings: 17041198,
        newVaults: -41965997,
        passOnboardings: -84013443,
        totalOnboardings: -39972304,
      },
      user: {
        failOnboardings: -39071383,
        incompleteOnboardings: -8947197,
        newVaults: -85746452,
        passOnboardings: -75871457,
        totalOnboardings: -11126411,
      },
    },
    props,
  ) as OrgMetricsResponse;
export const getOrgTenantTag = (props: Partial<OrgTenantTag>) =>
  merge(
    {
      id: 'd6d44116-959f-40db-b230-024aa70fbc6c',
      kind: 'business',
      tag: 'non Lorem officia cupidatat fugiat',
    },
    props,
  ) as OrgTenantTag;
export const getOrganization = (props: Partial<Organization>) =>
  merge(
    {
      allowDomainAccess: false,
      allowedPreviewApis: ['client_vaulting_docs', 'decisions_list', 'implicit_auth'],
      companySize: 's1001_plus',
      domains: ['tempor nostrud culpa', 'nulla occaecat ullamco culpa', 'exercitation aute'],
      id: '77f290ca-ad5a-45cd-8f7b-09544ccfef37',
      isAuthMethodSupported: true,
      isDomainAlreadyClaimed: true,
      isProdAuthPlaybookRestricted: true,
      isProdKybPlaybookRestricted: false,
      isProdKycPlaybookRestricted: true,
      isProdNeuroEnabled: true,
      isProdSentilinkEnabled: true,
      isSandboxRestricted: false,
      logoUrl: 'https://webbed-postbox.name/',
      name: 'Mr. Bernard Swift',
      parent: {
        id: 'ab332ae8-f467-4305-8fec-226837a20db8',
        name: 'Mr. Ben Murray',
      },
      supportEmail: 'mervin_littel10@gmail.com',
      supportPhone: '+13774917840',
      supportWebsite: 'https://tragic-dime.org/',
      websiteUrl: 'https://pale-shark.com/',
    },
    props,
  ) as Organization;
export const getOrganizationMember = (props: Partial<OrganizationMember>) =>
  merge(
    {
      createdAt: '1940-02-19T20:32:02.0Z',
      email: 'benton_ruecker@gmail.com',
      firstName: 'Clint',
      id: '2d063d75-c297-406d-b649-8953ab7c842e',
      isFirmEmployee: false,
      lastName: 'Wisozk-Aufderhar',
      role: {
        createdAt: '1935-07-08T21:24:37.0Z',
        id: 'd688d206-90dc-48b9-8e00-f329efd35074',
        isImmutable: false,
        kind: 'compliance_partner_dashboard_user',
        name: 'David Heidenreich',
        numActiveApiKeys: 3449874,
        numActiveUsers: 54404806,
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
        lastLoginAt: '1895-01-21T15:45:43.0Z',
      },
    },
    props,
  ) as OrganizationMember;
export const getOrganizationRole = (props: Partial<OrganizationRole>) =>
  merge(
    {
      createdAt: '1938-07-05T22:10:19.0Z',
      id: '0ee9dd72-fd2c-4327-b7d7-2ab0bd4f3309',
      isImmutable: true,
      kind: 'dashboard_user',
      name: 'Amelia Pagac',
      numActiveApiKeys: -98465260,
      numActiveUsers: 77710474,
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
  ) as OrganizationRole;
export const getOrganizationRolebinding = (props: Partial<OrganizationRolebinding>) =>
  merge(
    {
      lastLoginAt: '1934-03-22T07:13:44.0Z',
    },
    props,
  ) as OrganizationRolebinding;
export const getOtherTenantDupes = (props: Partial<OtherTenantDupes>) =>
  merge(
    {
      numMatches: -29687210,
      numTenants: 10462955,
    },
    props,
  ) as OtherTenantDupes;
export const getParentOrganization = (props: Partial<ParentOrganization>) =>
  merge(
    {
      id: 'cf97e373-5cf6-4131-9180-a1ca3073700b',
      name: 'Dale Greenfelder',
    },
    props,
  ) as ParentOrganization;
export const getPartnerLoginRequest = (props: Partial<PartnerLoginRequest>) =>
  merge(
    {
      code: 'ipsum',
      requestOrgId: 'dc232011-3dcf-4650-9890-f7efa50ee3c4',
    },
    props,
  ) as PartnerLoginRequest;
export const getPartnerOrganization = (props: Partial<PartnerOrganization>) =>
  merge(
    {
      allowDomainAccess: true,
      domains: ['commodo nisi exercitation proident', 'ullamco dolor', 'occaecat veniam ut cillum laborum'],
      id: '29732b91-51c0-47b4-ad44-2b76fd65334d',
      isAuthMethodSupported: false,
      isDomainAlreadyClaimed: true,
      logoUrl: 'https://steel-viability.info',
      name: 'Lloyd Conn',
      websiteUrl: 'https://wide-eyed-charlatan.info',
    },
    props,
  ) as PartnerOrganization;
export const getPatchProxyConfigRequest = (props: Partial<PatchProxyConfigRequest>) =>
  merge(
    {
      accessReason: 'cillum',
      addSecretHeaders: [
        {
          name: 'Whitney Smith',
          value: 'in tempor',
        },
        {
          name: 'Whitney Smith',
          value: 'labore irure',
        },
        {
          name: 'Whitney Smith',
          value: 'aliquip ea nulla dolor',
        },
      ],
      clientIdentity: {
        certificate: 'sint',
        key: 'dd0c0adb-a7f4-4986-a9f0-b1ee5679e347',
      },
      deleteSecretHeaders: ['ipsum officia magna dolore labore', 'voluptate', 'laboris occaecat'],
      headers: [
        {
          name: 'Milton McClure',
          value: 'cupidatat aliqua minim Duis exercitation',
        },
        {
          name: 'Milton McClure',
          value: 'adipisicing aute Duis Lorem',
        },
        {
          name: 'Milton McClure',
          value: 'reprehenderit enim cupidatat ipsum in',
        },
      ],
      ingressSettings: {
        contentType: 'json',
        rules: [
          {
            target: 'dolore consectetur sint in',
            token: '47bdf51a-98f4-482f-b7bd-84b57a2f617a',
          },
          {
            target: 'veniam anim exercitation',
            token: '47bdf51a-98f4-482f-b7bd-84b57a2f617a',
          },
          {
            target: 'minim quis',
            token: '47bdf51a-98f4-482f-b7bd-84b57a2f617a',
          },
        ],
      },
      method: 'et est ea',
      name: 'Billy Treutel',
      pinnedServerCertificates: ['elit exercitation', 'ad exercitation do', 'dolore consequat reprehenderit ex'],
      status: 'enabled',
      url: 'https://average-appliance.com/',
    },
    props,
  ) as PatchProxyConfigRequest;
export const getPhoneLookupAttributes = (props: Partial<PhoneLookupAttributes>) =>
  (props ?? 'line_type_intelligence') as PhoneLookupAttributes;
export const getPlainCustomHeader = (props: Partial<PlainCustomHeader>) =>
  merge(
    {
      name: 'Joanne Mosciski IV',
      value: 'Duis Excepteur exercitation deserunt',
    },
    props,
  ) as PlainCustomHeader;
export const getPreviewApi = (props: Partial<PreviewApi>) => (props ?? 'vault_proxy') as PreviewApi;
export const getPrivateBusinessOwner = (props: Partial<PrivateBusinessOwner>) =>
  merge(
    {
      fpId: '67ac5d3c-a783-4921-b34e-48e9d3ad8752',
      id: '4a3624e3-9e8e-4d57-9187-a17e1675c3ab',
      kind: 'secondary',
      name: 'Dawn Schmitt',
      ownershipStake: 66236386,
      ownershipStakeDi: 'document.voter_identification.selfie.mime_type',
      source: 'hosted',
      status: 'pending',
    },
    props,
  ) as PrivateBusinessOwner;
export const getPrivateBusinessOwnerKycLink = (props: Partial<PrivateBusinessOwnerKycLink>) =>
  merge(
    {
      id: 'bo_EBYciq9X2bkIPMMqnL4R9P',
      link: 'https://api.onefootprint.com?type=bo&r=380#botok_2dpe8Wye1ZJLsx6KoppVGdcxGzh2HUwjwR',
      name: 'Jane D.',
      token: 'botok_2dpe8Wye1ZJLsx6KoppVGdcxGzh2HUwjwR',
    },
    props,
  ) as PrivateBusinessOwnerKycLink;
export const getPrivateOwnedBusiness = (props: Partial<PrivateOwnedBusiness>) =>
  merge(
    {
      id: '9241585d-7e90-4a1b-9fb9-61e9c549c44b',
      status: 'pass',
    },
    props,
  ) as PrivateOwnedBusiness;
export const getProxyConfigBasic = (props: Partial<ProxyConfigBasic>) =>
  merge(
    {
      createdAt: '1927-02-22T06:29:22.0Z',
      deactivatedAt: '1930-04-01T07:52:06.0Z',
      id: '15af53c6-5e03-4f41-80c2-81c04d4c0835',
      isLive: false,
      method: 'dolore ea proident non ad',
      name: 'Stella Pfannerstill',
      status: 'disabled',
      url: 'https://square-eyebrow.net/',
    },
    props,
  ) as ProxyConfigBasic;
export const getProxyConfigDetailed = (props: Partial<ProxyConfigDetailed>) =>
  merge(
    {
      accessReason: 'Excepteur dolor ut dolore deserunt',
      clientCertificate: 'non',
      createdAt: '1955-01-06T06:29:42.0Z',
      deactivatedAt: '1940-09-28T06:01:54.0Z',
      headers: [
        {
          name: 'Mr. Fredrick Bernier',
          value: 'dolor id',
        },
        {
          name: 'Mr. Fredrick Bernier',
          value: 'Lorem commodo laborum ea',
        },
        {
          name: 'Mr. Fredrick Bernier',
          value: 'in Excepteur ullamco',
        },
      ],
      id: '8085cc85-f45e-49c7-8606-7fd667214e5e',
      ingressContentType: 'json',
      ingressRules: [
        {
          target: 'id ullamco labore Ut',
          token: '703e96df-f0ef-4b51-83b8-88eb341f6f8f',
        },
        {
          target: 'Excepteur',
          token: '703e96df-f0ef-4b51-83b8-88eb341f6f8f',
        },
        {
          target: 'fugiat',
          token: '703e96df-f0ef-4b51-83b8-88eb341f6f8f',
        },
      ],
      isLive: true,
      method: 'consequat ullamco dolore in',
      name: 'Perry Daugherty',
      pinnedServerCertificates: ['sit ex', 'non ea eiusmod consequat laborum', 'dolore fugiat'],
      secretHeaders: [
        {
          id: '36cceb6f-6b93-41cb-bad2-a23c81c52654',
          name: 'Ms. Anita Schaden',
        },
        {
          id: '36cceb6f-6b93-41cb-bad2-a23c81c52654',
          name: 'Ms. Anita Schaden',
        },
        {
          id: '36cceb6f-6b93-41cb-bad2-a23c81c52654',
          name: 'Ms. Anita Schaden',
        },
      ],
      status: 'enabled',
      url: 'https://familiar-masterpiece.name',
    },
    props,
  ) as ProxyConfigDetailed;
export const getProxyIngressContentType = (props: Partial<ProxyIngressContentType>) =>
  (props ?? 'json') as ProxyIngressContentType;
export const getProxyIngressRule = (props: Partial<ProxyIngressRule>) =>
  merge(
    {
      target: 'culpa',
      token: '72895270-d89b-4f7f-b60a-a6dc49527b71',
    },
    props,
  ) as ProxyIngressRule;
export const getRawUserDataRequest = (props: Partial<RawUserDataRequest>) =>
  merge(
    {
      customUserId: '7c50e2bc-c31f-42e3-b2b0-9852010cfd58',
      'id.first_name': 'Jane',
      'id.last_name': 'Doe',
    },
    props,
  ) as RawUserDataRequest;
export const getReuploadComplianceDocRequest = (props: Partial<ReuploadComplianceDocRequest>) =>
  merge(
    {
      description: 'sed est voluptate Lorem cillum',
      name: 'Olga Harris',
    },
    props,
  ) as ReuploadComplianceDocRequest;
export const getRiskScore = (props: Partial<RiskScore>) => (props ?? 'incode_selfie_match_score') as RiskScore;
export const getRiskSignal = (props: Partial<RiskSignal>) =>
  merge(
    {
      description: 'id reprehenderit sint exercitation',
      group: 'phone',
      id: '9d9bcd67-0bbf-4aec-8542-b4f741687ee8',
      note: 'ex ullamco amet',
      onboardingDecisionId: '74f79979-467b-449a-8d3a-4f1fb2e53d56',
      reasonCode: 'sos_business_address_filing_status_not_available',
      scopes: ['selfie', 'document', 'dob'],
      severity: 'info',
      timestamp: '1953-06-05T01:56:59.0Z',
    },
    props,
  ) as RiskSignal;
export const getRiskSignalDetail = (props: Partial<RiskSignalDetail>) =>
  merge(
    {
      description: 'elit ut aliquip Duis',
      hasAmlHits: true,
      hasSentilinkDetail: true,
      id: 'b87dcbe8-7a79-4693-b080-c2ac6bb0e087',
      note: 'ad Excepteur ullamco dolore',
      onboardingDecisionId: '00d2dd91-5aec-4317-9ed9-82665c5ac35b',
      reasonCode: 'document_type_not_allowed',
      scopes: ['business_tin', 'native_device', 'beneficial_owners'],
      severity: 'high',
      timestamp: '1940-08-16T01:09:01.0Z',
    },
    props,
  ) as RiskSignalDetail;
export const getRiskSignalGroupKind = (props: Partial<RiskSignalGroupKind>) => (props ?? 'doc') as RiskSignalGroupKind;
export const getRule = (props: Partial<Rule>) =>
  merge(
    {
      action: 'manual_review',
      createdAt: '1919-06-02T16:56:02.0Z',
      isShadow: false,
      kind: 'any',
      name: 'Amelia Hand',
      ruleAction: {
        config: {},
        kind: 'pass_with_manual_review',
      },
      ruleExpression: [
        {
          field: 'document_not_live_capture',
          op: 'eq',
          value: false,
        },
        {
          field: 'ssn_not_on_file',
          op: 'not_eq',
          value: false,
        },
        {
          field: 'attested_device_fraud_duplicate_risk_medium',
          op: 'not_eq',
          value: false,
        },
      ],
      ruleId: '63bed8a8-b9b8-4383-a12e-0eac99f08fa0',
    },
    props,
  ) as Rule;
export const getRuleAction = (props: Partial<RuleAction>) => (props ?? 'pass_with_manual_review') as RuleAction;
export const getRuleActionConfig = (props: Partial<RuleActionConfig>) =>
  merge(
    {
      config: {},
      kind: 'pass_with_manual_review',
    },
    props,
  ) as RuleActionConfig;
export const getRuleActionMigration = (props: Partial<RuleActionMigration>) =>
  (props ?? 'step_up.proof_of_address') as RuleActionMigration;
export const getRuleEvalResult = (props: Partial<RuleEvalResult>) =>
  merge(
    {
      backtestActionTriggered: 'pass_with_manual_review',
      currentStatus: 'incomplete',
      fpId: '3b490dff-e87f-4dfb-b706-bf601da6b68b',
      historicalActionTriggered: 'step_up.identity_proof_of_ssn',
    },
    props,
  ) as RuleEvalResult;
export const getRuleEvalResults = (props: Partial<RuleEvalResults>) =>
  merge(
    {
      results: [
        {
          backtestActionTriggered: 'step_up.custom',
          currentStatus: 'fail',
          fpId: '4d03f052-2582-4e90-a8f9-30659928032d',
          historicalActionTriggered: 'manual_review',
        },
        {
          backtestActionTriggered: 'manual_review',
          currentStatus: 'pending',
          fpId: '4d03f052-2582-4e90-a8f9-30659928032d',
          historicalActionTriggered: 'step_up.identity_proof_of_ssn_proof_of_address',
        },
        {
          backtestActionTriggered: 'step_up.proof_of_address',
          currentStatus: 'pending',
          fpId: '4d03f052-2582-4e90-a8f9-30659928032d',
          historicalActionTriggered: 'step_up.identity_proof_of_ssn',
        },
      ],
      stats: {
        countByBacktestActionTriggered: {},
        countByHistoricalActionTriggered: {},
        countByHistoricalAndBacktestActionTriggered: {},
        total: 30634894,
      },
    },
    props,
  ) as RuleEvalResults;
export const getRuleEvalStats = (props: Partial<RuleEvalStats>) =>
  merge(
    {
      countByBacktestActionTriggered: {},
      countByHistoricalActionTriggered: {},
      countByHistoricalAndBacktestActionTriggered: {},
      total: 10421375,
    },
    props,
  ) as RuleEvalStats;
export const getRuleExpression = (props: Partial<RuleExpression>) =>
  merge(
    [
      {
        field: 'multiple_records_found',
        op: 'eq',
        value: false,
      },
      {
        field: 'document_full_name_crosscheck_does_not_match',
        op: 'eq',
        value: false,
      },
      {
        field: 'watchlist_hit_pep',
        op: 'not_eq',
        value: false,
      },
    ],
    props,
  ) as RuleExpression;
export const getRuleExpressionCondition = (props: Partial<RuleExpressionCondition>) =>
  merge(
    {
      field: 'curp_malformed',
      op: 'eq',
      value: false,
    },
    props,
  ) as RuleExpressionCondition;
export const getRuleInstanceKind = (props: Partial<RuleInstanceKind>) => (props ?? 'any') as RuleInstanceKind;
export const getRuleResult = (props: Partial<RuleResult>) =>
  merge(
    {
      result: true,
      rule: {
        action: 'step_up.proof_of_address',
        createdAt: '1905-10-07T08:26:19.0Z',
        isShadow: true,
        kind: 'any',
        name: 'Iris Borer',
        ruleAction: {
          config: {},
          kind: 'pass_with_manual_review',
        },
        ruleExpression: [
          {
            field: 'business_address_does_not_match',
            op: 'eq',
            value: false,
          },
          {
            field: 'sos_business_address_filing_not_found',
            op: 'not_eq',
            value: false,
          },
          {
            field: 'business_dba_match',
            op: 'eq',
            value: true,
          },
        ],
        ruleId: '2412ab6f-65b0-4cf3-82dc-b3193a85a9f7',
      },
    },
    props,
  ) as RuleResult;
export const getRuleSet = (props: Partial<RuleSet>) =>
  merge(
    {
      version: -92189603,
    },
    props,
  ) as RuleSet;
export const getRuleSetResult = (props: Partial<RuleSetResult>) =>
  merge(
    {
      actionTriggered: 'fail',
      createdAt: '1910-09-25T11:40:47.0Z',
      obConfigurationId: '13c75146-4a1c-4e10-af65-1663b4b19bf9',
      ruleActionTriggered: {
        config: {},
        kind: 'pass_with_manual_review',
      },
      ruleResults: [
        {
          result: false,
          rule: {
            action: 'fail',
            createdAt: '1965-07-02T07:58:26.0Z',
            isShadow: true,
            kind: 'any',
            name: 'Aubrey Rath-VonRueden II',
            ruleAction: {
              config: {},
              kind: 'pass_with_manual_review',
            },
            ruleExpression: [
              {
                field: 'device_reputation',
                op: 'not_eq',
                value: false,
              },
              {
                field: 'bureau_deleted_record',
                op: 'not_eq',
                value: true,
              },
              {
                field: 'sos_filing_not_found',
                op: 'not_eq',
                value: true,
              },
            ],
            ruleId: '52452363-2fff-415a-a733-d28422aa12a0',
          },
        },
        {
          result: false,
          rule: {
            action: 'manual_review',
            createdAt: '1909-09-08T18:22:01.0Z',
            isShadow: true,
            kind: 'person',
            name: 'Aubrey Rath-VonRueden II',
            ruleAction: {
              config: {},
              kind: 'pass_with_manual_review',
            },
            ruleExpression: [
              {
                field: 'document_possible_image_alteration',
                op: 'eq',
                value: true,
              },
              {
                field: 'business_address_not_deliverable',
                op: 'eq',
                value: false,
              },
              {
                field: 'business_address_similar_match',
                op: 'not_eq',
                value: true,
              },
            ],
            ruleId: '52452363-2fff-415a-a733-d28422aa12a0',
          },
        },
        {
          result: true,
          rule: {
            action: 'pass_with_manual_review',
            createdAt: '1905-05-05T05:12:39.0Z',
            isShadow: true,
            kind: 'person',
            name: 'Aubrey Rath-VonRueden II',
            ruleAction: {
              config: {},
              kind: 'pass_with_manual_review',
            },
            ruleExpression: [
              {
                field: 'business_website_parking_page',
                op: 'not_eq',
                value: false,
              },
              {
                field: 'document_dob_crosscheck_matches',
                op: 'not_eq',
                value: false,
              },
              {
                field: 'business_website_online',
                op: 'not_eq',
                value: true,
              },
            ],
            ruleId: '52452363-2fff-415a-a733-d28422aa12a0',
          },
        },
      ],
    },
    props,
  ) as RuleSetResult;
export const getSameTenantDupe = (props: Partial<SameTenantDupe>) =>
  merge(
    {
      data: [
        {
          dataKind: 'document_data',
          identifier: '4ce11bc4-ba07-486d-baf5-850e059d1f1d',
          isDecryptable: true,
          source: 'client_tenant',
          transforms: {},
          value: 'id',
        },
        {
          dataKind: 'vault_data',
          identifier: '4ce11bc4-ba07-486d-baf5-850e059d1f1d',
          isDecryptable: false,
          source: 'components_sdk',
          transforms: {},
          value: 'irure do',
        },
        {
          dataKind: 'document_data',
          identifier: '4ce11bc4-ba07-486d-baf5-850e059d1f1d',
          isDecryptable: false,
          source: 'tenant',
          transforms: {},
          value: 'elit dolor amet dolore',
        },
      ],
      dupeKinds: ['name_dob', 'name_dob', 'card_number_cvc'],
      fpId: '93fdb5b4-e1a2-418c-a1fa-7157edc55921',
      startTimestamp: '1917-01-02T03:50:17.0Z',
      status: 'none',
    },
    props,
  ) as SameTenantDupe;
export const getScoreBand = (props: Partial<ScoreBand>) => (props ?? 'medium') as ScoreBand;
export const getSecretApiKey = (props: Partial<SecretApiKey>) => (props ?? 'sint nisi') as SecretApiKey;
export const getSecretCustomHeader = (props: Partial<SecretCustomHeader>) =>
  merge(
    {
      name: 'Maria Carroll III',
      value: 'mollit cupidatat enim deserunt irure',
    },
    props,
  ) as SecretCustomHeader;
export const getSentilinkDetail = (props: Partial<SentilinkDetail>) =>
  merge(
    {
      idTheft: {
        reasonCodes: [
          {
            code: 'id',
            direction: 'velit ullamco',
            explanation: 'est Ut in',
            rank: 36318547,
          },
          {
            code: 'laboris anim laborum officia et',
            direction: 'non dolor officia',
            explanation: 'in irure tempor sit laboris',
            rank: -30278280,
          },
          {
            code: 'ut fugiat dolore pariatur qui',
            direction: 'voluptate minim aliquip',
            explanation: 'ut tempor',
            rank: 12049826,
          },
        ],
        score: 40289081,
        scoreBand: 'high',
      },
      synthetic: {
        reasonCodes: [
          {
            code: 'eiusmod id laboris voluptate',
            direction: 'dolor quis commodo officia',
            explanation: 'cillum magna irure dolore',
            rank: 79111532,
          },
          {
            code: 'et do adipisicing',
            direction: 'Duis cillum nulla voluptate',
            explanation: 'dolor',
            rank: 52697240,
          },
          {
            code: 'in voluptate fugiat sint',
            direction: 'mollit reprehenderit minim',
            explanation: 'Lorem',
            rank: 92214040,
          },
        ],
        score: -36696653,
        scoreBand: 'high',
      },
    },
    props,
  ) as SentilinkDetail;
export const getSentilinkReasonCode = (props: Partial<SentilinkReasonCode>) =>
  merge(
    {
      code: 'Duis aliqua sit',
      direction: 'consectetur culpa veniam',
      explanation: 'exercitation non',
      rank: -11856647,
    },
    props,
  ) as SentilinkReasonCode;
export const getSentilinkScoreDetail = (props: Partial<SentilinkScoreDetail>) =>
  merge(
    {
      reasonCodes: [
        {
          code: 'magna aliqua minim',
          direction: 'dolore anim et',
          explanation: 'nostrud',
          rank: -69041267,
        },
        {
          code: 'in',
          direction: 'velit consequat',
          explanation: 'non enim Lorem elit',
          rank: 14776302,
        },
        {
          code: 'dolor tempor Excepteur',
          direction: 'consequat',
          explanation: 'commodo aute Lorem fugiat eu',
          rank: 58310396,
        },
      ],
      score: -12607508,
      scoreBand: 'low',
    },
    props,
  ) as SentilinkScoreDetail;
export const getSignalScope = (props: Partial<SignalScope>) => (props ?? 'business_name') as SignalScope;
export const getSignalSeverity = (props: Partial<SignalSeverity>) => (props ?? 'medium') as SignalSeverity;
export const getSubmitExternalUrlRequest = (props: Partial<SubmitExternalUrlRequest>) =>
  merge(
    {
      url: 'https://negligible-beret.us/',
    },
    props,
  ) as SubmitExternalUrlRequest;
export const getTenantAndroidAppMeta = (props: Partial<TenantAndroidAppMeta>) =>
  merge(
    {
      apkCertSha256S: ['qui enim sunt ad ut', 'anim', 'sint adipisicing'],
      id: '89c89ef1-dce4-4be5-bda1-bc68c5b15258',
      integrityDecryptionKey: 'eef825b5-e218-44f3-ac30-170f5e49280d',
      integrityVerificationKey: 'd5cc0f38-65e6-4197-92c4-d6922d55ddc5',
      packageNames: ['sed dolor incididunt do', 'magna esse', 'Ut exercitation commodo eu'],
      tenantId: '67a86b6e-125f-42eb-8cc3-e0ae711a5315',
    },
    props,
  ) as TenantAndroidAppMeta;
export const getTenantFrequentNoteKind = (props: Partial<TenantFrequentNoteKind>) =>
  (props ?? 'annotation') as TenantFrequentNoteKind;
export const getTenantIosAppMeta = (props: Partial<TenantIosAppMeta>) =>
  merge(
    {
      appBundleIds: ['aliqua non ipsum', 'Duis eiusmod veniam aliquip eu', 'nulla tempor do'],
      deviceCheckKeyId: '71a16e5f-4a0a-46a5-9e2f-7f808e2fe7b9',
      deviceCheckPrivateKey: '3b42ab1a-7a3c-4bd7-a4d4-aaf7e2cd7493',
      id: 'acf61867-cb34-45ee-b399-2418feb697af',
      teamId: '676f29bb-c23a-43a4-a606-d657931d5955',
      tenantId: '81631296-b945-44dd-813b-41db404b60ce',
    },
    props,
  ) as TenantIosAppMeta;
export const getTenantKind = (props: Partial<TenantKind>) => (props ?? 'partner_tenant') as TenantKind;
export const getTenantLoginRequest = (props: Partial<TenantLoginRequest>) =>
  merge(
    {
      code: 'consectetur cillum in',
      requestOrgId: '8249f540-6528-4cb8-992b-be67b33a53b6',
    },
    props,
  ) as TenantLoginRequest;
export const getTenantRoleKindDiscriminant = (props: Partial<TenantRoleKindDiscriminant>) =>
  (props ?? 'api_key') as TenantRoleKindDiscriminant;
export const getTenantScope = (props: Partial<TenantScope>) =>
  merge(
    {
      kind: 'read',
    },
    props,
  ) as TenantScope;
export const getTerminalDecisionStatus = (props: Partial<TerminalDecisionStatus>) =>
  (props ?? 'fail') as TerminalDecisionStatus;
export const getTimelineOnboardingDecision = (props: Partial<TimelineOnboardingDecision>) =>
  merge(
    {
      clearedManualReviews: [
        {
          kind: 'rule_triggered',
        },
        {
          kind: 'rule_triggered',
        },
        {
          kind: 'document_needs_review',
        },
      ],
      id: '65dd426d-779a-42dc-a5f3-0204509558af',
      obConfiguration: {
        id: '321c039e-1d2f-4d58-a830-e5d5a99597ec',
        mustCollectData: ['phone_number', 'nationality', 'full_address'],
        name: 'Roberto Rempel V',
      },
      ranRulesInSandbox: true,
      ruleSetResultId: '8791b0d3-aabd-43f7-b9a8-deb83336fe7c',
      source: {
        id: '09eecea7-b910-4754-9b6b-e857280f8ee1',
        kind: 'user',
      },
      status: 'none',
      timestamp: '1943-12-23T14:36:56.0Z',
      workflowKind: 'kyc',
    },
    props,
  ) as TimelineOnboardingDecision;
export const getTimelinePlaybook = (props: Partial<TimelinePlaybook>) =>
  merge(
    {
      id: 'ab9392ce-28b8-4d89-b7fa-65faea16e222',
      mustCollectData: ['phone_number', 'business_phone_number', 'business_corporation_type'],
      name: 'Chester Hickle',
    },
    props,
  ) as TimelinePlaybook;
export const getTokenOperationKind = (props: Partial<TokenOperationKind>) => (props ?? 'inherit') as TokenOperationKind;
export const getTriggerRequest = (props: Partial<TriggerRequest>) =>
  merge(
    {
      fpBid: '7bf7793f-cecd-4796-b955-0c3983d68e23',
      kind: 'trigger',
      note: 'in sunt occaecat',
      trigger: {
        data: {
          playbookId: 'fed107f9-ebd5-4d97-b890-647c5eb29b76',
          recollectAttributes: ['business_kyced_beneficial_owners', 'phone_number', 'us_tax_id'],
          reuseExistingBoKyc: false,
        },
        kind: 'onboard',
      },
    },
    props,
  ) as TriggerRequest;
export const getUnvalidatedRuleExpression = (props: Partial<UnvalidatedRuleExpression>) =>
  merge(
    [
      {
        field: 'address_street_name_does_not_match',
        op: 'not_eq',
        value: true,
      },
      {
        field: 'watchlist_hit_ofac',
        op: 'eq',
        value: false,
      },
      {
        field: 'document_photo_is_not_paper_capture',
        op: 'not_eq',
        value: true,
      },
    ],
    props,
  ) as UnvalidatedRuleExpression;
export const getUpdateAnnotationRequest = (props: Partial<UpdateAnnotationRequest>) =>
  merge(
    {
      isPinned: true,
    },
    props,
  ) as UpdateAnnotationRequest;
export const getUpdateApiKeyRequest = (props: Partial<UpdateApiKeyRequest>) =>
  merge(
    {
      name: 'Edna Reilly',
      roleId: 'fb761523-bdf7-47fd-bb93-f6cee84a1ff1',
      status: 'enabled',
    },
    props,
  ) as UpdateApiKeyRequest;
export const getUpdateClientSecurityConfig = (props: Partial<UpdateClientSecurityConfig>) =>
  merge(
    {
      allowedOrigins: ['cillum amet in sed esse', 'deserunt ex in dolor', 'consectetur culpa'],
    },
    props,
  ) as UpdateClientSecurityConfig;
export const getUpdateComplianceDocAssignmentRequest = (props: Partial<UpdateComplianceDocAssignmentRequest>) =>
  merge(
    {
      userId: 'f9183408-3e79-4459-b495-b18d82ab7fe1',
    },
    props,
  ) as UpdateComplianceDocAssignmentRequest;
export const getUpdateComplianceDocTemplateRequest = (props: Partial<UpdateComplianceDocTemplateRequest>) =>
  merge(
    {
      description: 'eu tempor',
      name: 'Luther Prosacco',
    },
    props,
  ) as UpdateComplianceDocTemplateRequest;
export const getUpdateLabelRequest = (props: Partial<UpdateLabelRequest>) =>
  merge(
    {
      kind: 'offboard_other',
    },
    props,
  ) as UpdateLabelRequest;
export const getUpdateListRequest = (props: Partial<UpdateListRequest>) =>
  merge(
    {
      alias: 'in laborum sit Duis mollit',
      name: 'Jeremy Koss',
    },
    props,
  ) as UpdateListRequest;
export const getUpdateObConfigRequest = (props: Partial<UpdateObConfigRequest>) =>
  merge(
    {
      allowReonboard: true,
      name: 'Mildred Bosco',
      promptForPasskey: false,
      skipConfirm: false,
      status: 'disabled',
    },
    props,
  ) as UpdateObConfigRequest;
export const getUpdatePartnerTenantRequest = (props: Partial<UpdatePartnerTenantRequest>) =>
  merge(
    {
      allowDomainAccess: false,
      name: 'Adrian Okuneva',
      websiteUrl: 'https://good-natured-mallard.info/',
    },
    props,
  ) as UpdatePartnerTenantRequest;
export const getUpdateTenantAndroidAppMetaRequest = (props: Partial<UpdateTenantAndroidAppMetaRequest>) =>
  merge(
    {
      apkCertSha256S: ['mollit dolor voluptate', 'sunt', 'dolor dolor in'],
      integrityDecryptionKey: '3095afdc-2ac3-43fa-a29d-e5a78e36fe81',
      integrityVerificationKey: 'ad5daec4-2301-460a-8f22-efa1ded79f5a',
      packageNames: ['incididunt est in voluptate', 'non sed Ut enim amet', 'Ut sit incididunt aliqua ut'],
    },
    props,
  ) as UpdateTenantAndroidAppMetaRequest;
export const getUpdateTenantIosAppMetaRequest = (props: Partial<UpdateTenantIosAppMetaRequest>) =>
  merge(
    {
      appBundleIds: ['aliqua esse eu aliquip', 'ea in deserunt culpa', 'dolor ad veniam'],
      deviceCheckKeyId: '56455ef5-15f7-4730-8fed-d1a89c3c2578',
      deviceCheckPrivateKey: '14e23ad1-5297-496f-9e90-5926ddf4d4a0',
      teamId: 'e20d4330-23da-4075-b7da-610340883e6d',
    },
    props,
  ) as UpdateTenantIosAppMetaRequest;
export const getUpdateTenantRequest = (props: Partial<UpdateTenantRequest>) =>
  merge(
    {
      allowDomainAccess: true,
      clearSupportEmail: false,
      clearSupportPhone: true,
      clearSupportWebsite: true,
      companySize: 's51_to100',
      name: 'Dr. Oscar Waelchi',
      privacyPolicyUrl: 'https://dutiful-peninsula.us',
      supportEmail: 'grayson.kovacek27@gmail.com',
      supportPhone: '+19308040874',
      supportWebsite: 'https://giving-swing.name/',
      websiteUrl: 'https://concrete-essence.net',
    },
    props,
  ) as UpdateTenantRequest;
export const getUpdateTenantRoleRequest = (props: Partial<UpdateTenantRoleRequest>) =>
  merge(
    {
      name: 'Laurie Wuckert',
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
  ) as UpdateTenantRoleRequest;
export const getUpdateTenantRolebindingRequest = (props: Partial<UpdateTenantRolebindingRequest>) =>
  merge(
    {
      roleId: 'c37e37d1-3dc6-49bd-a628-b0adea809704',
    },
    props,
  ) as UpdateTenantRolebindingRequest;
export const getUpdateTenantUserRequest = (props: Partial<UpdateTenantUserRequest>) =>
  merge(
    {
      firstName: 'Ludie',
      lastName: 'McDermott',
    },
    props,
  ) as UpdateTenantUserRequest;
export const getUploadSource = (props: Partial<UploadSource>) => (props ?? 'mobile') as UploadSource;
export const getUserAiSummary = (props: Partial<UserAiSummary>) =>
  merge(
    {
      conclusion: 'non',
      detailedSummary: 'cupidatat laborum cillum deserunt dolor',
      highLevelSummary: 'Ut',
      riskSignalSummary: 'aliqua',
    },
    props,
  ) as UserAiSummary;
export const getUserDataIdentifier = (props: Partial<UserDataIdentifier>) =>
  (props ?? 'document.voter_identification.full_address') as UserDataIdentifier;
export const getUserDecryptRequest = (props: Partial<UserDecryptRequest>) =>
  merge(
    {
      fields: ['id.first_name', 'id.last_name'],
      reason: 'Lorem ipsum dolor',
      transforms: null,
      versionAt: null,
    },
    props,
  ) as UserDecryptRequest;
export const getUserDecryptResponse = (props: Partial<UserDecryptResponse>) =>
  merge(
    {
      'id.first_name': 'Jane',
      'id.last_name': 'Doe',
    },
    props,
  ) as UserDecryptResponse;
export const getUserDeleteResponse = (props: Partial<UserDeleteResponse>) =>
  merge(
    {
      'id.first_name': true,
      'id.last_name': false,
    },
    props,
  ) as UserDeleteResponse;
export const getUserInsight = (props: Partial<UserInsight>) =>
  merge(
    {
      description: 'mollit ut',
      name: 'Thomas Parker',
      scope: 'device',
      unit: 'string',
      value: 'aliquip mollit veniam in',
    },
    props,
  ) as UserInsight;
export const getUserInsightScope = (props: Partial<UserInsightScope>) => (props ?? 'workflow') as UserInsightScope;
export const getUserInsightUnit = (props: Partial<UserInsightUnit>) => (props ?? 'string') as UserInsightUnit;
export const getUserLabel = (props: Partial<UserLabel>) =>
  merge(
    {
      createdAt: '1956-06-08T12:53:19.0Z',
      kind: 'offboard_fraud',
    },
    props,
  ) as UserLabel;
export const getUserTag = (props: Partial<UserTag>) =>
  merge(
    {
      createdAt: '1920-10-30T15:19:36.0Z',
      id: 'tag_2ZwAl6LyHB6l7Ap2Ksdw8X',
      tag: 'transaction_chargeback',
    },
    props,
  ) as UserTag;
export const getUserTimeline = (props: Partial<UserTimeline>) =>
  merge(
    {
      event: {
        data: {
          actor: {
            id: 'd49043f6-97e0-429a-a5aa-1e79dc651009',
            kind: 'user',
          },
          attributes: ['ssn4', 'dob', 'card'],
          isPrefill: true,
          targets: [
            'document.drivers_license.clave_de_elector',
            'document.permit.expires_at',
            'document.passport.back.image',
          ],
        },
        kind: 'data_collected',
      },
      seqno: 97596995,
      timestamp: '1936-12-15T17:32:44.0Z',
    },
    props,
  ) as UserTimeline;
export const getUserTimelineEvent = (props: Partial<UserTimelineEvent>) =>
  merge(
    {
      data: {
        actor: {
          id: '7ac1ec4a-afc9-483d-a1ac-a8421b53927b',
          kind: 'user',
        },
        attributes: ['us_legal_status', 'investor_profile', 'ssn9'],
        isPrefill: false,
        targets: ['document.permit.selfie.mime_type', 'document.passport_card.selfie.image', 'document.visa.curp'],
      },
      kind: 'data_collected',
    },
    props,
  ) as UserTimelineEvent;
export const getVaultCreated = (props: Partial<VaultCreated>) =>
  merge(
    {
      actor: {
        id: '06dc1bb5-2e14-4727-8851-c2391270c498',
        kind: 'user',
      },
    },
    props,
  ) as VaultCreated;
export const getVaultDrAwsPreEnrollResponse = (props: Partial<VaultDrAwsPreEnrollResponse>) =>
  merge(
    {
      externalId: 'bf990054-70af-4031-982a-cce1550bcd48',
    },
    props,
  ) as VaultDrAwsPreEnrollResponse;
export const getVaultDrEnrollRequest = (props: Partial<VaultDrEnrollRequest>) =>
  merge(
    {
      awsAccountId: 'e3e45923-8dd7-4135-b0cb-f151785ff389',
      awsRoleName: 'Courtney Abshire',
      orgPublicKeys: ['ipsum dolore', 'ut sit eiusmod sunt id', 'dolore labore minim magna'],
      reEnroll: false,
      s3BucketName: 'Lonnie Kassulke MD',
    },
    props,
  ) as VaultDrEnrollRequest;
export const getVaultDrEnrollResponse = (props: Partial<VaultDrEnrollResponse>) =>
  merge({}, props) as VaultDrEnrollResponse;
export const getVaultDrEnrolledStatus = (props: Partial<VaultDrEnrolledStatus>) =>
  merge(
    {
      awsAccountId: '49eecf87-b4e9-462b-9e6b-fe85ec6ed165',
      awsRoleName: 'Lila Muller',
      backupLagSeconds: -16326331,
      bucketPathNamespace: 'Deborah Buckridge',
      enrolledAt: '1960-08-12T21:31:53.0Z',
      latestBackupRecordTimestamp: '1969-08-08T22:03:09.0Z',
      orgPublicKeys: ['fugiat sint cillum laboris', 'veniam irure eu', 'dolor exercitation amet'],
      s3BucketName: 'Johnny Boehm',
    },
    props,
  ) as VaultDrEnrolledStatus;
export const getVaultDrRevealWrappedRecordKeysRequest = (props: Partial<VaultDrRevealWrappedRecordKeysRequest>) =>
  merge(
    {
      recordPaths: ['officia esse nostrud eiusmod', 'et consequat voluptate', 'velit'],
    },
    props,
  ) as VaultDrRevealWrappedRecordKeysRequest;
export const getVaultDrRevealWrappedRecordKeysResponse = (props: Partial<VaultDrRevealWrappedRecordKeysResponse>) =>
  merge(
    {
      wrappedRecordKeys: {},
    },
    props,
  ) as VaultDrRevealWrappedRecordKeysResponse;
export const getVaultDrStatus = (props: Partial<VaultDrStatus>) =>
  merge(
    {
      enrolledStatus: {
        awsAccountId: 'c7753259-9dda-4655-a68b-04adb651eb89',
        awsRoleName: 'Ramiro Williamson',
        backupLagSeconds: -78032834,
        bucketPathNamespace: 'Jane Altenwerth',
        enrolledAt: '1901-04-08T05:32:01.0Z',
        latestBackupRecordTimestamp: '1928-02-14T15:14:19.0Z',
        orgPublicKeys: ['qui ut', 'amet reprehenderit', 'adipisicing magna in non tempor'],
        s3BucketName: 'Myrtle Turner',
      },
      isLive: true,
      orgId: '46f4b064-9023-4950-98c0-b120182aa92f',
      orgName: 'Myra Schmitt',
    },
    props,
  ) as VaultDrStatus;
export const getVaultKind = (props: Partial<VaultKind>) => (props ?? 'business') as VaultKind;
export const getVaultOperation = (props: Partial<VaultOperation>) =>
  merge(
    {
      field: 'document.permit.full_name',
      op: 'eq',
      value: 'labore sint nulla',
    },
    props,
  ) as VaultOperation;
export const getVerificationCheck = (props: Partial<VerificationCheck>) =>
  merge(
    {
      data: {
        einOnly: false,
      },
      kind: 'kyb',
    },
    props,
  ) as VerificationCheck;
export const getWatchlistCheck = (props: Partial<WatchlistCheck>) =>
  merge(
    {
      id: 'fef6b6e8-a5fa-4681-b4e3-0741a5370b5e',
      reasonCodes: ['business_phone_number_does_not_match', 'document_selfie_glasses', 'document_not_live_capture'],
      status: 'error',
    },
    props,
  ) as WatchlistCheck;
export const getWatchlistCheckStatusKind = (props: Partial<WatchlistCheckStatusKind>) =>
  (props ?? 'not_needed') as WatchlistCheckStatusKind;
export const getWatchlistEntry = (props: Partial<WatchlistEntry>) =>
  merge(
    {
      hits: [
        {
          agency: 'sunt dolore incididunt',
          agencyAbbr: 'tempor proident ad dolor nisi',
          agencyInformationUrl: 'https://skeletal-meander.org',
          agencyListUrl: 'https://pleasant-tackle.org/',
          entityAliases: ['elit cillum consequat Duis quis', 'ut', 'ipsum nostrud'],
          entityName: 'Miss Kay Mraz',
          listCountry: 'Belize',
          listName: 'Don Mayer-Steuber',
          url: 'https://clueless-saw.org',
        },
        {
          agency: 'ea sed anim do esse',
          agencyAbbr: 'elit Ut occaecat',
          agencyInformationUrl: 'https://skeletal-meander.org',
          agencyListUrl: 'https://pleasant-tackle.org/',
          entityAliases: ['enim sed est ut eu', 'cupidatat nostrud cillum Excepteur', 'incididunt ut'],
          entityName: 'Miss Kay Mraz',
          listCountry: 'Belize',
          listName: 'Don Mayer-Steuber',
          url: 'https://clueless-saw.org',
        },
        {
          agency: 'ad aliquip',
          agencyAbbr: 'officia deserunt tempor',
          agencyInformationUrl: 'https://skeletal-meander.org',
          agencyListUrl: 'https://pleasant-tackle.org/',
          entityAliases: ['mollit dolore in do sit', 'Excepteur', 'eu laborum do et'],
          entityName: 'Miss Kay Mraz',
          listCountry: 'Belize',
          listName: 'Don Mayer-Steuber',
          url: 'https://clueless-saw.org',
        },
      ],
      screenedEntityName: 'Lola Pollich',
    },
    props,
  ) as WatchlistEntry;
export const getWatchlistHit = (props: Partial<WatchlistHit>) =>
  merge(
    {
      agency: 'et in Duis in non',
      agencyAbbr: 'adipisicing culpa quis ex',
      agencyInformationUrl: 'https://winged-guard.net',
      agencyListUrl: 'https://forsaken-fat.name/',
      entityAliases: ['nisi dolore', 'Lorem in nisi', 'dolor reprehenderit Duis Excepteur'],
      entityName: 'Kathleen McDermott',
      listCountry: 'Syrian Arab Republic',
      listName: 'Maxine Gutkowski',
      url: 'https://shiny-comparison.org',
    },
    props,
  ) as WatchlistHit;
export const getWebhookPortalResponse = (props: Partial<WebhookPortalResponse>) =>
  merge(
    {
      appId: 'a98aef21-2767-4879-8d3d-8e7c52892305',
      token: 'db5606ab-ae1b-421c-8aa8-7321ae68e7e6',
      url: 'https://warlike-scratch.com',
    },
    props,
  ) as WebhookPortalResponse;
export const getWorkflowKind = (props: Partial<WorkflowKind>) => (props ?? 'document') as WorkflowKind;
export const getWorkflowRequestConfig = (props: Partial<WorkflowRequestConfig>) =>
  merge(
    {
      data: {
        playbookId: '676232d0-ffb0-4726-9817-7fc792b49792',
        recollectAttributes: ['investor_profile', 'business_kyced_beneficial_owners', 'ssn9'],
        reuseExistingBoKyc: true,
      },
      kind: 'onboard',
    },
    props,
  ) as WorkflowRequestConfig;
export const getWorkflowSource = (props: Partial<WorkflowSource>) => (props ?? 'unknown') as WorkflowSource;
export const getWorkflowStarted = (props: Partial<WorkflowStarted>) =>
  merge(
    {
      kind: 'document',
      playbook: {
        id: 'f60c9504-a7b9-44eb-8b33-675f6b3ad984',
        mustCollectData: ['us_legal_status', 'business_name', 'business_tin'],
        name: 'Mr. Laurence Kemmer',
      },
    },
    props,
  ) as WorkflowStarted;
export const getWorkflowStartedEventKind = (props: Partial<WorkflowStartedEventKind>) =>
  (props ?? 'playbook') as WorkflowStartedEventKind;
export const getWorkflowTriggered = (props: Partial<WorkflowTriggered>) =>
  merge(
    {
      actor: {
        id: '98502151-a24e-4e12-9e87-19710c772701',
        kind: 'user',
      },
      config: {
        data: {
          playbookId: '6e70d563-b310-41e0-9cc3-ad4a06283765',
          recollectAttributes: ['email', 'business_name', 'phone_number'],
          reuseExistingBoKyc: true,
        },
        kind: 'onboard',
      },
      fpId: '70289f84-99c9-4e26-b612-c239a4a070e7',
      note: 'tempor incididunt eu',
      requestIsActive: false,
    },
    props,
  ) as WorkflowTriggered;
