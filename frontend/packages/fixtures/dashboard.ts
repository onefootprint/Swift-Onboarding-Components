import type {
  AmlDetail,
  Annotation,
  AssumePartnerRoleRequest,
  AssumePartnerRoleResponse,
  AssumeRoleRequest,
  AssumeRoleResponse,
  AuthEvent,
  AuthOrgMember,
  BusinessInsights,
  ClientDecryptRequest,
  ComplianceCompanySummary,
  ComplianceDocEvent,
  ComplianceDocSubmission,
  ComplianceDocSummary,
  ComplianceDocTemplate,
  CopyPlaybookRequest,
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
  CreateTagRequest,
  CreateTenantAndroidAppMetaRequest,
  CreateTenantIosAppMetaRequest,
  CreateTenantRoleRequest,
  CreateTenantUserRequest,
  CursorPaginatedAuditEvent,
  CursorPaginatedEntity,
  CursorPaginatedListEvent,
  DeleteRequest,
  DocsTokenResponse,
  Document,
  Dupes,
  Empty,
  EnclaveHealthResponse,
  Entity,
  EntityActionResponse,
  EntityActionsRequest,
  EntityAttribute,
  EvaluateRuleRequest,
  GetClientTokenResponse,
  GetFieldValidationResponse,
  GetUserVaultResponse,
  InProgressOnboarding,
  IntegrityRequest,
  IntegrityResponse,
  InvoicePreview,
  LinkAuthRequest,
  List,
  ListDetails,
  ListEntitiesSearchRequest,
  ListEntry,
  LivenessEvent,
  MultiUpdateRuleRequest,
  OffsetPaginatedEntityOnboarding,
  OffsetPaginatedList,
  OffsetPaginatedOnboardingConfiguration,
  OffsetPaginatedOrganizationMember,
  OffsetPaginatedOrganizationRole,
  OffsetPaginatedSecretApiKey,
  OnboardingConfiguration,
  OrgClientSecurityConfig,
  OrgFrequentNote,
  OrgLoginResponse,
  OrgMetricsResponse,
  OrgTenantTag,
  Organization,
  OrganizationMember,
  OrganizationRole,
  PartnerLoginRequest,
  PartnerOrganization,
  PatchProxyConfigRequest,
  PrivateBusinessOwner,
  PrivateBusinessOwnerKycLink,
  PrivateOwnedBusiness,
  ProxyConfigBasic,
  ProxyConfigDetailed,
  RawUserDataRequest,
  ReuploadComplianceDocRequest,
  RiskSignal,
  RiskSignalDetail,
  Rule,
  RuleEvalResults,
  RuleSetResult,
  SecretApiKey,
  SentilinkDetail,
  SubmitExternalUrlRequest,
  TenantAndroidAppMeta,
  TenantIosAppMeta,
  TenantLoginRequest,
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
  UserAiSummary,
  UserDecryptRequest,
  UserDecryptResponse,
  UserDeleteResponse,
  UserInsight,
  UserLabel,
  UserTag,
  UserTimeline,
  VaultDrAwsPreEnrollResponse,
  VaultDrEnrollRequest,
  VaultDrEnrollResponse,
  VaultDrRevealWrappedRecordKeysRequest,
  VaultDrRevealWrappedRecordKeysResponse,
  VaultDrStatus,
  WebhookPortalResponse,
} from '@onefootprint/request-types/dashboard';
import merge from 'lodash/merge';

export const getAmlDetail = (props: Partial<AmlDetail>) =>
  merge(
    {
      hits: [
        {
          matchTypes: ['quis fugiat', 'ipsum', 'ut incididunt dolor nisi est'],
          media: [
            {
              date: '1941-08-16T07:21:07.0Z',
              pdfUrl: 'https://unwritten-cash.net',
              snippet: 'aliqua amet adipisicing aliquip officia',
              title: 'aliqua adipisicing veniam',
              url: 'https://ordinary-deed.org/',
            },
            {
              date: '1905-04-27T07:40:22.0Z',
              pdfUrl: 'https://unwritten-cash.net',
              snippet: 'non',
              title: 'amet enim',
              url: 'https://ordinary-deed.org/',
            },
            {
              date: '1937-01-19T20:49:52.0Z',
              pdfUrl: 'https://pointed-hydrant.org',
              snippet: 'consequat et quis',
              title: 'tempor incididunt',
              url: 'https://good-natured-stitcher.com',
            },
          ],
          name: 'Erik Jast',
        },
        {
          matchTypes: ['est Lorem commodo', 'incididunt nisi dolor fugiat enim', 'laboris aute Excepteur culpa amet'],
          media: [
            {
              date: '1955-11-21T17:18:30.0Z',
              pdfUrl: 'https://pointed-hydrant.org',
              snippet: 'incididunt amet',
              title: 'dolor',
              url: 'https://apt-convection.us/',
            },
            {
              date: '1890-06-22T08:32:51.0Z',
              pdfUrl: 'https://pointed-hydrant.org',
              snippet: 'Ut ex voluptate adipisicing',
              title: 'adipisicing',
              url: 'https://good-natured-stitcher.com',
            },
            {
              date: '1942-02-01T06:31:38.0Z',
              pdfUrl: 'https://partial-advancement.info',
              snippet: 'commodo veniam in',
              title: 'magna in',
              url: 'https://ignorant-scorn.info/',
            },
          ],
          name: 'Taylor McGlynn',
        },
        {
          matchTypes: ['consectetur Excepteur', 'nisi', 'cupidatat in'],
          media: [
            {
              date: '1893-02-18T13:19:30.0Z',
              pdfUrl: 'https://pointed-hydrant.org',
              snippet: 'nostrud adipisicing in proident',
              title: 'in',
              url: 'https://good-natured-stitcher.com',
            },
            {
              date: '1964-09-09T01:33:44.0Z',
              pdfUrl: 'https://pointed-hydrant.org',
              snippet: 'ut nostrud et',
              title: 'ea eu aute laboris enim',
              url: 'https://good-natured-stitcher.com',
            },
            {
              date: '1935-06-26T23:33:47.0Z',
              pdfUrl: 'https://pointed-hydrant.org',
              snippet: 'deserunt sunt aute elit quis',
              title: 'dolore voluptate Excepteur',
              url: 'https://good-natured-stitcher.com',
            },
          ],
          name: 'Taylor McGlynn',
        },
      ],
      shareUrl: 'https://infatuated-alb.org/',
    },
    props,
  ) as AmlDetail;
export const getAnnotation = (props: Partial<Annotation>) =>
  merge(
    {
      id: '56b9ec9e-f862-4e51-98cc-618ad46602c7',
      isPinned: false,
      note: 'quis dolor',
      source: 'footprint',
      timestamp: '1901-05-11T18:31:56.0Z',
    },
    props,
  ) as Annotation;
export const getAssumePartnerRoleRequest = (props: Partial<AssumePartnerRoleRequest>) =>
  merge(
    {
      partnerTenantId: 'a67fe17b-0b95-4f8f-99ea-c07c567fac43',
    },
    props,
  ) as AssumePartnerRoleRequest;
export const getAssumePartnerRoleResponse = (props: Partial<AssumePartnerRoleResponse>) =>
  merge(
    {
      partnerTenant: {
        allowDomainAccess: true,
        domains: ['Ut ad eiusmod', 'non', 'voluptate'],
        id: '7fbcb5f2-011a-4415-80e2-51ee754d2b1f',
        isAuthMethodSupported: true,
        isDomainAlreadyClaimed: true,
        logoUrl: 'https://decisive-programme.com/',
        name: 'Casey Christiansen',
        websiteUrl: 'https://grizzled-lender.com/',
      },
      token: '2206671b-2c3c-42b0-9e31-a9a34b412f29',
      user: {
        createdAt: '1947-08-12T01:32:56.0Z',
        email: 'kathleen.glover@gmail.com',
        firstName: 'Colten',
        id: '7c209bdc-2086-4429-940e-56e7e041499c',
        isFirmEmployee: false,
        lastName: 'Reilly',
        role: {
          createdAt: '1916-03-05T19:43:45.0Z',
          id: '9b0a6dad-966a-4195-b6c1-32354d28f8eb',
          isImmutable: true,
          kind: 'ApiKey',
          name: 'Margie Kuhn',
          numActiveApiKeys: 95293195,
          numActiveUsers: -12491949,
          scopes: ['onboarding_configuration', 'admin', 'decrypt_custom'],
        },
        rolebinding: {
          lastLoginAt: '1927-05-15T19:15:07.0Z',
        },
      },
    },
    props,
  ) as AssumePartnerRoleResponse;
export const getAssumeRoleRequest = (props: Partial<AssumeRoleRequest>) =>
  merge(
    {
      tenantId: '886aca09-26a4-47bf-94b2-33a2b524c717',
    },
    props,
  ) as AssumeRoleRequest;
export const getAssumeRoleResponse = (props: Partial<AssumeRoleResponse>) =>
  merge(
    {
      tenant: {
        allowDomainAccess: false,
        allowedPreviewApis: ['onboardings_list', 'manage_verified_contact_info', 'decisions_list'],
        companySize: 's1_to10',
        domains: ['nulla Lorem cillum amet', 'sit occaecat fugiat amet', 'voluptate'],
        id: '34bfd536-f868-4394-9717-e6923b7316e5',
        isAuthMethodSupported: false,
        isDomainAlreadyClaimed: true,
        isProdAuthPlaybookRestricted: true,
        isProdKybPlaybookRestricted: true,
        isProdKycPlaybookRestricted: true,
        isProdNeuroEnabled: false,
        isProdSentilinkEnabled: false,
        isSandboxRestricted: false,
        logoUrl: 'https://antique-fowl.org/',
        name: 'Lindsay Nolan',
        parent: {
          id: '40516649-bdde-43e6-8fb5-0d20b996f330',
          name: 'Diana Kuphal',
        },
        supportEmail: 'angelo24@gmail.com',
        supportPhone: '+17212840024',
        supportWebsite: 'https://whole-papa.name',
        websiteUrl: 'https://oddball-account.org/',
      },
      token: 'c5e6b204-6b5e-4c00-8016-443e67b1198e',
      user: {
        createdAt: '1914-02-14T06:07:51.0Z',
        email: 'delphia.davis@gmail.com',
        firstName: 'Elinore',
        id: '2c11a2a3-db3e-4dc9-b850-d401c0c26127',
        isFirmEmployee: true,
        lastName: 'Aufderhar-Lowe',
        role: {
          createdAt: '1919-09-25T16:59:27.0Z',
          id: 'bbc06dbf-1b27-4303-8f80-ff43ebe93833',
          isImmutable: true,
          kind: 'CompliancePartnerDashboardUser',
          name: 'Pamela Leannon',
          numActiveApiKeys: -62765567,
          numActiveUsers: 76289061,
          scopes: ['decrypt_all_except_pci_data', 'read', 'write_lists'],
        },
        rolebinding: {
          lastLoginAt: '1929-07-01T01:06:25.0Z',
        },
      },
    },
    props,
  ) as AssumeRoleResponse;
export const getAuthEvent = (props: Partial<AuthEvent>) =>
  merge(
    {
      createdAt: '1893-11-17T01:44:28.0Z',
      insight: {
        city: 'Julianneton',
        country: 'Pakistan',
        ipAddress: '834 Theresia Stravenue Suite 167',
        latitude: 43073754.32310873,
        longitude: -28262776.657895923,
        metroCode: 'fugiat dolor',
        postalCode: 'sed',
        region: 'cupidatat eiusmod Duis pariatur',
        regionName: 'Eric Lang',
        sessionId: 'fb18c073-37fe-45b9-a842-8ce23cfdee3b',
        timeZone: 'magna',
        timestamp: '1909-05-03T20:59:08.0Z',
        userAgent: 'Ut Lorem occaecat sit commodo',
      },
      kind: 'third_party',
      linkedAttestations: [
        {
          appBundleId: '3064114f-a830-4e0c-8130-d49dbd639b74',
          deviceType: 'ios',
          fraudRisk: 'low',
          model: 'ex id et do',
          os: 'anim',
        },
        {
          appBundleId: '3064114f-a830-4e0c-8130-d49dbd639b74',
          deviceType: 'ios',
          fraudRisk: 'high',
          model: 'dolore',
          os: 'quis nostrud veniam',
        },
        {
          appBundleId: '3064114f-a830-4e0c-8130-d49dbd639b74',
          deviceType: 'android',
          fraudRisk: 'medium',
          model: 'nostrud reprehenderit Ut',
          os: 'adipisicing ullamco sed',
        },
      ],
      scope: 'my1fp',
    },
    props,
  ) as AuthEvent;
export const getAuthOrgMember = (props: Partial<AuthOrgMember>) =>
  merge(
    {
      email: 'jaylen_wolf@gmail.com',
      firstName: 'Kylee',
      id: '71190fe6-b441-4750-ba83-4ba22918826b',
      isAssumedSession: false,
      isFirmEmployee: true,
      lastName: 'Goodwin',
      scopes: ['manage_webhooks', 'write_entities', 'read'],
      tenant: {
        allowDomainAccess: true,
        allowedPreviewApis: ['vault_disaster_recovery', 'onboardings_list', 'tags'],
        companySize: 's51_to100',
        domains: ['ipsum in quis', 'amet', 'ut'],
        id: 'ab26871b-930e-4595-92fe-16cdaea61641',
        isAuthMethodSupported: false,
        isDomainAlreadyClaimed: false,
        isProdAuthPlaybookRestricted: false,
        isProdKybPlaybookRestricted: false,
        isProdKycPlaybookRestricted: true,
        isProdNeuroEnabled: false,
        isProdSentilinkEnabled: true,
        isSandboxRestricted: false,
        logoUrl: 'https://boring-tenement.us',
        name: 'Melvin Klein',
        parent: {
          id: '6fd29a39-b68c-4f89-8e68-b7147a839bee',
          name: 'Hattie Berge',
        },
        supportEmail: 'virgil.marvin@gmail.com',
        supportPhone: '+15577111854',
        supportWebsite: 'https://alienated-breastplate.org',
        websiteUrl: 'https://metallic-humor.biz',
      },
    },
    props,
  ) as AuthOrgMember;
export const getBusinessInsights = (props: Partial<BusinessInsights>) =>
  merge(
    {
      addresses: [
        {
          addressLine1: '8194 Amos Center Suite 276',
          addressLine2: '765 Candida Loop Apt. 335',
          city: 'West Shaunside',
          cmra: false,
          deliverable: true,
          latitude: -71069603.74805817,
          longitude: 74166989.84610316,
          postalCode: 'id',
          propertyType: 'esse',
          sources: 'irure sint incididunt non dolore',
          state: 'Delaware',
          submitted: false,
          verified: true,
        },
        {
          addressLine1: '8194 Amos Center Suite 276',
          addressLine2: '7796 W 1st Street Suite 215',
          city: 'West Shaunside',
          cmra: false,
          deliverable: true,
          latitude: 23236394.254205093,
          longitude: 26741917.66161625,
          postalCode: 'tempor',
          propertyType: 'ut veniam',
          sources: 'eiusmod',
          state: 'South Carolina',
          submitted: true,
          verified: true,
        },
        {
          addressLine1: '7554 Angelo Well Suite 437',
          addressLine2: '99034 Johanna Neck Apt. 471',
          city: 'Port Rashawnchester',
          cmra: true,
          deliverable: false,
          latitude: 77054825.74787724,
          longitude: -21939669.494741574,
          postalCode: 'Lorem enim pariatur eiusmod proident',
          propertyType: 'reprehenderit aute anim',
          sources: 'sunt enim',
          state: 'South Dakota',
          submitted: true,
          verified: true,
        },
      ],
      details: {
        entityType: 'do veniam sit mollit',
        formationDate: 'voluptate',
        formationState: 'New Jersey',
        phoneNumbers: [
          {
            phone: '+17038402947',
            submitted: false,
            verified: false,
          },
          {
            phone: '+17038402947',
            submitted: false,
            verified: true,
          },
          {
            phone: '+12982662324',
            submitted: false,
            verified: true,
          },
        ],
        tin: {
          tin: 'velit',
          verified: false,
        },
        website: {
          url: 'https://thick-arcade.us/',
          verified: true,
        },
      },
      names: [
        {
          kind: 'laboris tempor',
          name: 'Shari Jenkins',
          sources: 'Excepteur enim amet eiusmod aute',
          subStatus: 'nisi Ut',
          submitted: true,
          verified: true,
        },
        {
          kind: 'pariatur minim',
          name: 'Nellie Bartell',
          sources: 'elit incididunt officia dolore ut',
          subStatus: 'ut deserunt dolore incididunt',
          submitted: false,
          verified: true,
        },
        {
          kind: 'nostrud irure aute laboris',
          name: 'Nellie Bartell',
          sources: 'Lorem reprehenderit dolor tempor',
          subStatus: 'dolor dolor nostrud exercitation eiusmod',
          submitted: true,
          verified: false,
        },
      ],
      people: [
        {
          associationVerified: false,
          name: 'Erin Nader',
          role: 'enim aute aliquip',
          sources: 'sit incididunt ipsum nostrud veniam',
          submitted: true,
        },
        {
          associationVerified: false,
          name: 'Dr. Ebony Langosh',
          role: 'dolor ea reprehenderit et occaecat',
          sources: 'do consectetur incididunt minim',
          submitted: false,
        },
        {
          associationVerified: false,
          name: 'Miranda Flatley',
          role: 'nisi irure',
          sources: 'Ut ea',
          submitted: false,
        },
      ],
      registrations: [
        {
          addresses: [
            'Ut sunt aute officia culpa',
            'aute in pariatur officia adipisicing',
            'culpa laboris deserunt Excepteur et',
          ],
          entityType: 'ut aliqua dolore do',
          fileNumber: 'amet proident minim fugiat',
          jurisdiction: 'sit voluptate id consectetur',
          name: 'Santos Stracke',
          officers: [
            {
              name: 'Blake Kunze',
              roles: 'enim ipsum ea',
            },
            {
              name: 'Neal Monahan',
              roles: 'dolore consequat cillum',
            },
            {
              name: 'Miss Vera Muller',
              roles: 'Ut ullamco sint',
            },
          ],
          registeredAgent: 'elit mollit incididunt ea',
          registrationDate: 'sint',
          source: 'Ut minim qui irure dolore',
          state: 'New Hampshire',
          status: 'tempor',
          subStatus: 'pariatur ad anim aliqua ullamco',
        },
        {
          addresses: ['anim officia', 'minim do enim', 'adipisicing in ut'],
          entityType: 'Excepteur sint dolor',
          fileNumber: 'sed',
          jurisdiction: 'nulla',
          name: 'Santos Stracke',
          officers: [
            {
              name: 'Neal Monahan',
              roles: 'cupidatat ut',
            },
            {
              name: 'Neal Monahan',
              roles: 'ex',
            },
            {
              name: 'Neal Monahan',
              roles: 'sint',
            },
          ],
          registeredAgent: 'exercitation aute ipsum qui deserunt',
          registrationDate: 'magna nisi enim',
          source: 'nostrud occaecat Excepteur laboris ex',
          state: 'Montana',
          status: 'Duis',
          subStatus: 'ipsum irure',
        },
        {
          addresses: ['id', 'amet', 'eu anim ullamco veniam enim'],
          entityType: 'sunt proident ea',
          fileNumber: 'laboris ut in',
          jurisdiction: 'dolore voluptate',
          name: 'Santos Stracke',
          officers: [
            {
              name: 'Miss Claire Shields',
              roles: 'tempor ut',
            },
            {
              name: 'Neal Monahan',
              roles: 'aute eiusmod nulla',
            },
            {
              name: 'Neal Monahan',
              roles: 'occaecat mollit Excepteur laborum et',
            },
          ],
          registeredAgent: 'consequat ea',
          registrationDate: 'est',
          source: 'ad anim commodo consectetur laborum',
          state: 'Montana',
          status: 'esse nisi',
          subStatus: 'est magna Lorem sit labore',
        },
      ],
      watchlist: {
        business: [
          {
            hits: [
              {
                agency: 'voluptate exercitation',
                agencyAbbr: 'voluptate dolor Lorem ut fugiat',
                agencyInformationUrl: 'https://trusty-sonar.us',
                agencyListUrl: 'https://pushy-draft.us/',
                entityAliases: [
                  'quis incididunt in nulla dolore',
                  'minim veniam ipsum non',
                  'deserunt voluptate laborum',
                ],
                entityName: 'Lionel Balistreri',
                listCountry: 'Samoa',
                listName: 'Gwendolyn Johnson',
                url: 'https://happy-diversity.biz',
              },
              {
                agency: 'ipsum',
                agencyAbbr: 'ipsum ad officia consequat',
                agencyInformationUrl: 'https://palatable-lyre.net',
                agencyListUrl: 'https://fussy-flat.net/',
                entityAliases: ['sed non sit', 'Lorem esse occaecat', 'sint Excepteur'],
                entityName: 'Arturo McGlynn',
                listCountry: 'Qatar',
                listName: 'Angela Aufderhar',
                url: 'https://turbulent-elevator.biz',
              },
              {
                agency: 'cupidatat amet',
                agencyAbbr: 'pariatur in et irure',
                agencyInformationUrl: 'https://happy-go-lucky-management.name/',
                agencyListUrl: 'https://fussy-flat.net/',
                entityAliases: ['in', 'proident sed culpa non', 'eu ipsum'],
                entityName: 'Tommie Cronin',
                listCountry: 'Samoa',
                listName: 'Gwendolyn Johnson',
                url: 'https://runny-marten.info',
              },
            ],
            screenedEntityName: 'Dawn Weissnat',
          },
          {
            hits: [
              {
                agency: 'consequat id culpa Lorem Excepteur',
                agencyAbbr: 'adipisicing Lorem quis et dolor',
                agencyInformationUrl: 'https://trusty-sonar.us',
                agencyListUrl: 'https://fussy-flat.net/',
                entityAliases: ['labore veniam nulla occaecat quis', 'cupidatat', 'occaecat'],
                entityName: 'Lionel Balistreri',
                listCountry: 'Samoa',
                listName: 'Gwendolyn Johnson',
                url: 'https://turbulent-elevator.biz',
              },
              {
                agency: 'Ut dolor laboris',
                agencyAbbr: 'veniam nisi aute id',
                agencyInformationUrl: 'https://trusty-sonar.us',
                agencyListUrl: 'https://fussy-flat.net/',
                entityAliases: ['deserunt sed', 'reprehenderit', 'in'],
                entityName: 'Lionel Balistreri',
                listCountry: 'Samoa',
                listName: 'Gwendolyn Johnson',
                url: 'https://turbulent-elevator.biz',
              },
              {
                agency: 'tempor pariatur dolore',
                agencyAbbr: 'commodo laboris velit laborum ullamco',
                agencyInformationUrl: 'https://sarcastic-wallaby.com/',
                agencyListUrl: 'https://fussy-flat.net/',
                entityAliases: ['pariatur nostrud', 'minim est officia sint', 'elit proident'],
                entityName: 'Willie Towne',
                listCountry: 'Samoa',
                listName: 'Gwendolyn Johnson',
                url: 'https://turbulent-elevator.biz',
              },
            ],
            screenedEntityName: 'Dennis MacGyver',
          },
          {
            hits: [
              {
                agency: 'ipsum sed incididunt',
                agencyAbbr: 'esse enim dolore tempor',
                agencyInformationUrl: 'https://trusty-sonar.us',
                agencyListUrl: 'https://fussy-flat.net/',
                entityAliases: ['consectetur', 'irure Duis eiusmod amet tempor', 'laboris sit'],
                entityName: 'Lionel Balistreri',
                listCountry: 'Samoa',
                listName: 'Gwendolyn Johnson',
                url: 'https://turbulent-elevator.biz',
              },
              {
                agency: 'minim ad',
                agencyAbbr: 'velit',
                agencyInformationUrl: 'https://trusty-sonar.us',
                agencyListUrl: 'https://fussy-flat.net/',
                entityAliases: ['est irure incididunt', 'pariatur magna', 'officia Lorem ea'],
                entityName: 'Lionel Balistreri',
                listCountry: 'Samoa',
                listName: 'Gwendolyn Johnson',
                url: 'https://turbulent-elevator.biz',
              },
              {
                agency: 'ipsum',
                agencyAbbr: 'et enim sit Ut',
                agencyInformationUrl: 'https://trusty-sonar.us',
                agencyListUrl: 'https://fussy-flat.net/',
                entityAliases: ['id cupidatat in est velit', 'amet dolor sed', 'proident'],
                entityName: 'Lionel Balistreri',
                listCountry: 'Samoa',
                listName: 'Gwendolyn Johnson',
                url: 'https://turbulent-elevator.biz',
              },
            ],
            screenedEntityName: 'Dennis MacGyver',
          },
        ],
        hitCount: 93968776,
        people: [
          {
            hits: [
              {
                agency: 'pariatur est elit eu',
                agencyAbbr: 'in eu',
                agencyInformationUrl: 'https://dim-ectoderm.org',
                agencyListUrl: 'https://possible-airman.name',
                entityAliases: ['commodo', 'enim occaecat ut sit fugiat', 'minim elit consectetur deserunt laborum'],
                entityName: 'Dr. Edgar Schneider',
                listCountry: 'Angola',
                listName: 'Mike Thompson',
                url: 'https://majestic-lobster.biz/',
              },
              {
                agency: 'sunt',
                agencyAbbr: 'in aliqua officia',
                agencyInformationUrl: 'https://dim-ectoderm.org',
                agencyListUrl: 'https://recent-bandwidth.org',
                entityAliases: ['tempor voluptate Ut est', 'aliqua', 'consequat est'],
                entityName: 'Dr. Edgar Schneider',
                listCountry: 'French Guiana',
                listName: 'Spencer Senger-Wintheiser',
                url: 'https://hungry-word.info/',
              },
              {
                agency: 'ea sed officia',
                agencyAbbr: 'in',
                agencyInformationUrl: 'https://dim-ectoderm.org',
                agencyListUrl: 'https://possible-airman.name',
                entityAliases: ['dolor', 'dolor in', 'nulla'],
                entityName: 'Dr. Edgar Schneider',
                listCountry: 'Angola',
                listName: 'Mike Thompson',
                url: 'https://majestic-lobster.biz/',
              },
            ],
            screenedEntityName: 'Bob Paucek',
          },
          {
            hits: [
              {
                agency: 'quis',
                agencyAbbr: 'reprehenderit laboris',
                agencyInformationUrl: 'https://astonishing-newsprint.info/',
                agencyListUrl: 'https://recent-bandwidth.org',
                entityAliases: ['irure Duis', 'ut', 'nisi aute ex'],
                entityName: 'Willis Senger',
                listCountry: 'French Guiana',
                listName: 'Spencer Senger-Wintheiser',
                url: 'https://hungry-word.info/',
              },
              {
                agency: 'Ut occaecat',
                agencyAbbr: 'ex laborum Duis minim',
                agencyInformationUrl: 'https://dim-ectoderm.org',
                agencyListUrl: 'https://possible-airman.name',
                entityAliases: ['anim', 'dolor minim in nisi', 'Lorem culpa ullamco'],
                entityName: 'Dr. Edgar Schneider',
                listCountry: 'Angola',
                listName: 'Mike Thompson',
                url: 'https://majestic-lobster.biz/',
              },
              {
                agency: 'sint anim voluptate',
                agencyAbbr: 'est',
                agencyInformationUrl: 'https://astonishing-newsprint.info/',
                agencyListUrl: 'https://recent-bandwidth.org',
                entityAliases: [
                  'dolore in nisi',
                  'consectetur esse ut occaecat',
                  'cillum cupidatat reprehenderit sit consectetur',
                ],
                entityName: 'Willis Senger',
                listCountry: 'French Guiana',
                listName: 'Spencer Senger-Wintheiser',
                url: 'https://hungry-word.info/',
              },
            ],
            screenedEntityName: 'Bob Paucek',
          },
          {
            hits: [
              {
                agency: 'dolore pariatur esse fugiat tempor',
                agencyAbbr: 'Excepteur ex culpa ea',
                agencyInformationUrl: 'https://astonishing-newsprint.info/',
                agencyListUrl: 'https://recent-bandwidth.org',
                entityAliases: ['aliquip', 'id ea fugiat dolore', 'consectetur'],
                entityName: 'Willis Senger',
                listCountry: 'French Guiana',
                listName: 'Spencer Senger-Wintheiser',
                url: 'https://hungry-word.info/',
              },
              {
                agency: 'in commodo in aliquip',
                agencyAbbr: 'sint amet nulla ut labore',
                agencyInformationUrl: 'https://astonishing-newsprint.info/',
                agencyListUrl: 'https://recent-bandwidth.org',
                entityAliases: [
                  'exercitation do in voluptate aliquip',
                  'laboris velit est',
                  'labore Duis nostrud velit fugiat',
                ],
                entityName: 'Willis Senger',
                listCountry: 'French Guiana',
                listName: 'Spencer Senger-Wintheiser',
                url: 'https://hungry-word.info/',
              },
              {
                agency: 'aliquip',
                agencyAbbr: 'ad ea laborum anim',
                agencyInformationUrl: 'https://bad-publicity.biz/',
                agencyListUrl: 'https://petty-sanity.us/',
                entityAliases: ['pariatur eiusmod dolor culpa enim', 'velit veniam ut consequat', 'reprehenderit'],
                entityName: 'Darrell Little',
                listCountry: 'French Guiana',
                listName: 'Spencer Senger-Wintheiser',
                url: 'https://hungry-word.info/',
              },
            ],
            screenedEntityName: 'Geoffrey Fadel-Ondricka',
          },
        ],
      },
    },
    props,
  ) as BusinessInsights;
export const getClientDecryptRequest = (props: Partial<ClientDecryptRequest>) =>
  merge(
    {
      fields: ['document.permit.expires_at', 'document.finra_compliance_letter', 'document.drivers_license.gender'],
      reason: 'mollit qui et',
      transforms: ["hmac_sha256('<key>')", 'prefix(<n>)', "encrypt('<algorithm>','<public_key>')"],
    },
    props,
  ) as ClientDecryptRequest;
export const getComplianceCompanySummary = (props: Partial<ComplianceCompanySummary>) =>
  merge(
    {
      companyName: 'Everett Streich',
      id: 'f3abe848-e64b-41a9-b06f-6713a8e61c63',
      numActivePlaybooks: -34497261,
      numControlsComplete: 70551037,
      numControlsTotal: 99115741,
    },
    props,
  ) as ComplianceCompanySummary;
export const getComplianceDocEvent = (props: Partial<ComplianceDocEvent>) =>
  merge(
    {
      actor: {
        org: 'cupidatat elit',
        user: {
          firstName: 'Claude',
          id: '6980f3dc-24d8-430e-bbcc-c218868376cf',
          lastName: 'McGlynn',
        },
      },
      event: 'ipsum',
      timestamp: '1894-09-17T01:14:12.0Z',
    },
    props,
  ) as ComplianceDocEvent;
export const getComplianceDocSubmission = (props: Partial<ComplianceDocSubmission>) =>
  merge(
    {
      createdAt: '1918-06-23T23:50:01.0Z',
      data: 'cillum non',
      id: '7443c1f7-fe77-41a1-a06f-c61452b7f115',
    },
    props,
  ) as ComplianceDocSubmission;
export const getComplianceDocSummary = (props: Partial<ComplianceDocSummary>) =>
  merge(
    {
      activeRequestId: 'c0671538-71af-481f-babd-0f840f5e48d2',
      activeReviewId: '2e449280-4475-47d8-95f8-a801b5a98b6a',
      activeSubmissionId: '0ce2af57-863c-41a5-a126-e7f02060269c',
      description: 'do sed Lorem veniam',
      id: 'bbc553c9-8940-4b1c-8884-3378100dec23',
      lastUpdated: '1898-11-23T09:30:03.0Z',
      name: 'Robin Osinski',
      partnerTenantAssignee: {
        firstName: 'Helena',
        id: '7413ee6f-b052-4608-b4ff-051562ea3551',
        lastName: 'Metz',
      },
      status: 'waiting_for_upload',
      templateId: '2b8d6c01-7695-40d2-b775-30ac2ff63ffd',
      tenantAssignee: {
        firstName: 'Amari',
        id: '6cacfc68-f92d-4890-b202-1e9ac17a1cf9',
        lastName: 'Flatley',
      },
    },
    props,
  ) as ComplianceDocSummary;
export const getComplianceDocTemplate = (props: Partial<ComplianceDocTemplate>) =>
  merge(
    {
      id: 'b4ddb4ae-9580-4073-a2dd-76b6b81cc75e',
      latestVersion: {
        createdAt: '1908-07-26T11:12:55.0Z',
        createdByPartnerTenantUser: {
          firstName: 'Alexie',
          id: 'ab55d413-bee3-4663-9f39-5c845058818e',
          lastName: 'Oberbrunner',
        },
        description: 'eu velit veniam aliqua sit',
        id: '0de544ba-a32b-4b36-8796-4f5da7b4d7bc',
        name: 'Tim Fahey',
        templateId: 'dd8e0a9d-6eba-46ce-9dec-a1fc5d29db45',
      },
    },
    props,
  ) as ComplianceDocTemplate;
export const getCopyPlaybookRequest = (props: Partial<CopyPlaybookRequest>) =>
  merge(
    {
      isLive: false,
      name: 'Mr. Wilbur Hermiston DVM',
    },
    props,
  ) as CopyPlaybookRequest;
export const getCreateAnnotationRequest = (props: Partial<CreateAnnotationRequest>) =>
  merge(
    {
      isPinned: true,
      note: 'aliquip minim ad',
    },
    props,
  ) as CreateAnnotationRequest;
export const getCreateApiKeyRequest = (props: Partial<CreateApiKeyRequest>) =>
  merge(
    {
      name: 'Nettie Hessel',
      roleId: '6712792f-8325-43a4-a739-c08ba0338522',
    },
    props,
  ) as CreateApiKeyRequest;
export const getCreateComplianceDocRequest = (props: Partial<CreateComplianceDocRequest>) =>
  merge(
    {
      description: 'Excepteur ut',
      name: 'Hilda Hickle',
      templateVersionId: '35a67611-85ce-4bc9-a8d9-076f6eec720b',
    },
    props,
  ) as CreateComplianceDocRequest;
export const getCreateComplianceDocTemplateRequest = (props: Partial<CreateComplianceDocTemplateRequest>) =>
  merge(
    {
      description: 'nostrud in quis Lorem in',
      name: 'Josh Metz-Bartoletti',
    },
    props,
  ) as CreateComplianceDocTemplateRequest;
export const getCreateEntityTokenRequest = (props: Partial<CreateEntityTokenRequest>) =>
  merge(
    {
      key: 'c9faaa78-5dbb-4f57-b6e7-2eb36aca976f',
      kind: 'user',
      sendLink: true,
    },
    props,
  ) as CreateEntityTokenRequest;
export const getCreateEntityTokenResponse = (props: Partial<CreateEntityTokenResponse>) =>
  merge(
    {
      deliveryMethod: 'email',
      expiresAt: '1905-09-23T02:37:13.0Z',
      link: 'dolor consequat ullamco',
      token: 'e0be478d-f047-4292-be6c-ea0f88939a59',
    },
    props,
  ) as CreateEntityTokenResponse;
export const getCreateKycLinksRequest = (props: Partial<CreateKycLinksRequest>) =>
  merge(
    {
      sendToBoIds: ['deserunt ipsum pariatur non veniam', 'et elit dolor consectetur', 'dolore do'],
    },
    props,
  ) as CreateKycLinksRequest;
export const getCreateListEntryRequest = (props: Partial<CreateListEntryRequest>) =>
  merge(
    {
      entries: ['non', 'pariatur proident', 'eiusmod ut'],
    },
    props,
  ) as CreateListEntryRequest;
export const getCreateListRequest = (props: Partial<CreateListRequest>) =>
  merge(
    {
      alias: 'sed in eu',
      entries: ['anim tempor mollit et', 'laborum aute dolore consectetur eu', 'id sint reprehenderit eu quis'],
      kind: 'phone_country_code',
      name: 'Candice Marvin',
    },
    props,
  ) as CreateListRequest;
export const getCreateOnboardingConfigurationRequest = (props: Partial<CreateOnboardingConfigurationRequest>) =>
  merge(
    {
      allowInternationalResidents: false,
      allowReonboard: false,
      allowUsResidents: false,
      allowUsTerritories: true,
      businessDocumentsToCollect: [
        'ullamco aliqua laborum anim',
        'in dolore aliquip pariatur laborum',
        'non do labore',
      ],
      canAccessData: ['Card', 'UsLegalStatus', 'Email'],
      cipKind: 'alpaca',
      curpValidationEnabled: false,
      deprecatedCanAccessData: ['business_website', 'business_name', 'name'],
      docScanForOptionalSsn: 'Card',
      documentTypesAndCountries: {
        countrySpecific: {},
        global: ['id_card', 'passport', 'passport_card'],
      },
      documentsToCollect: [
        'enim aliquip laboris labore in',
        'adipisicing elit laboris est Duis',
        'dolore Ut consectetur ullamco',
      ],
      enhancedAml: {
        adverseMedia: true,
        enhancedAml: true,
        matchKind: 'fuzzy_high',
        ofac: true,
        pep: true,
      },
      internationalCountryRestrictions: ['JM', 'AX', 'GU'],
      isDocFirstFlow: false,
      isNoPhoneFlow: true,
      kind: 'kyb',
      mustCollectData: ['Nationality', 'Card', 'Ssn9'],
      name: 'Rex Emmerich',
      optionalData: ['InvestorProfile', 'Bank', 'Ssn9'],
      promptForPasskey: true,
      requiredAuthMethods: ['phone', 'email', 'phone'],
      skipConfirm: true,
      skipKyc: false,
      verificationChecks: ['id mollit laborum fugiat exercitation', 'sit dolore', 'sit aliquip qui nulla'],
    },
    props,
  ) as CreateOnboardingConfigurationRequest;
export const getCreateOrgFrequentNoteRequest = (props: Partial<CreateOrgFrequentNoteRequest>) =>
  merge(
    {
      content: 'proident reprehenderit',
      kind: 'trigger',
    },
    props,
  ) as CreateOrgFrequentNoteRequest;
export const getCreateOrgTenantTagRequest = (props: Partial<CreateOrgTenantTagRequest>) =>
  merge(
    {
      kind: 'person',
      tag: 'deserunt pariatur',
    },
    props,
  ) as CreateOrgTenantTagRequest;
export const getCreateProxyConfigRequest = (props: Partial<CreateProxyConfigRequest>) =>
  merge(
    {
      accessReason: 'incididunt in Lorem',
      clientIdentity: {
        certificate: 'in ex',
        key: '82cc3def-0f40-44db-a869-38ead4b55df1',
      },
      headers: [
        {
          name: 'Kim Jenkins',
          value: 'laboris fugiat sunt cupidatat',
        },
        {
          name: 'Jeanette Goldner-Renner',
          value: 'velit id fugiat',
        },
        {
          name: 'Jeanette Goldner-Renner',
          value: 'dolor ut',
        },
      ],
      ingressSettings: {
        contentType: 'json',
        rules: [
          {
            target: 'enim incididunt dolore',
            token: '57a8c8b6-2e50-4961-b684-c5870a3eaa96',
          },
          {
            target: 'nostrud velit mollit minim',
            token: '57a8c8b6-2e50-4961-b684-c5870a3eaa96',
          },
          {
            target: 'eu',
            token: '57a8c8b6-2e50-4961-b684-c5870a3eaa96',
          },
        ],
      },
      method: 'labore non qui',
      name: 'Robert Rempel',
      pinnedServerCertificates: ['deserunt sint voluptate', 'adipisicing', 'ut ipsum enim sed'],
      secretHeaders: [
        {
          name: 'Elizabeth Leffler DVM',
          value: 'Duis aute',
        },
        {
          name: 'Elizabeth Leffler DVM',
          value: 'Duis elit Excepteur ex labore',
        },
        {
          name: 'Elizabeth Leffler DVM',
          value: 'aliquip ea consequat',
        },
      ],
      url: 'https://mean-soup.name',
    },
    props,
  ) as CreateProxyConfigRequest;
export const getCreateReviewRequest = (props: Partial<CreateReviewRequest>) =>
  merge(
    {
      decision: 'rejected',
      note: 'ut mollit et',
      submissionId: '9a495328-55e8-4f8b-9a32-c6d466714031',
    },
    props,
  ) as CreateReviewRequest;
export const getCreateTagRequest = (props: Partial<CreateTagRequest>) =>
  merge(
    {
      tag: 'eu ut occaecat',
    },
    props,
  ) as CreateTagRequest;
export const getCreateTenantAndroidAppMetaRequest = (props: Partial<CreateTenantAndroidAppMetaRequest>) =>
  merge(
    {
      apkCertSha256S: ['magna ex minim ipsum', 'nisi sunt', 'ullamco dolor est'],
      integrityDecryptionKey: 'ff4a4ae9-1467-4fa2-a6cf-171cbe317bf8',
      integrityVerificationKey: '90d5a8dd-611a-4ea6-9c70-297c8ea5f787',
      packageNames: ['aliquip Excepteur elit', 'nisi qui', 'esse dolor consectetur ut'],
    },
    props,
  ) as CreateTenantAndroidAppMetaRequest;
export const getCreateTenantIosAppMetaRequest = (props: Partial<CreateTenantIosAppMetaRequest>) =>
  merge(
    {
      appBundleIds: ['nostrud aliquip minim ipsum aute', 'Duis est minim', 'consequat nisi dolore qui voluptate'],
      deviceCheckKeyId: '7d1c09db-a9fe-4edc-bcb3-e842de7cce1e',
      deviceCheckPrivateKey: '6df72272-3a34-4ccb-b2b7-6e612f7fc942',
      teamId: '626b4b33-a7a8-4890-a1df-132d0f0c9599',
    },
    props,
  ) as CreateTenantIosAppMetaRequest;
export const getCreateTenantRoleRequest = (props: Partial<CreateTenantRoleRequest>) =>
  merge(
    {
      kind: 'ApiKey',
      name: 'Natasha Schoen',
      scopes: ['decrypt_document_and_selfie', 'cip_integration', 'decrypt_document'],
    },
    props,
  ) as CreateTenantRoleRequest;
export const getCreateTenantUserRequest = (props: Partial<CreateTenantUserRequest>) =>
  merge(
    {
      email: 'conor_conn41@gmail.com',
      firstName: 'Godfrey',
      lastName: 'Dickinson',
      omitEmailInvite: false,
      redirectUrl: 'https://sparse-tackle.com/',
      roleId: '9c015c90-61f7-46c2-92e0-ce76d27f8967',
    },
    props,
  ) as CreateTenantUserRequest;
export const getCursorPaginatedAuditEvent = (props: Partial<CursorPaginatedAuditEvent>) =>
  merge(
    {
      data: [
        {
          detail: 'create_playbook',
          id: '0d9bad32-6f34-4cce-85ac-8eb752e2c8c9',
          insightEvent: {
            city: 'Nikkiton',
            country: 'Virgin Islands, British',
            ipAddress: '671 Maud Loop Suite 449',
            latitude: 54947066.46517265,
            longitude: -97407832.08868757,
            metroCode: 'cupidatat',
            postalCode: 'cillum consequat',
            region: 'est',
            regionName: 'Gilbert Nienow',
            sessionId: '02d187c3-3838-42c2-9d86-7d1bdddf998d',
            timeZone: 'cupidatat',
            timestamp: '1931-06-18T08:50:01.0Z',
            userAgent: 'fugiat do dolor ea eu',
          },
          name: 'Claudia Monahan-Murazik',
          principal: 'footprint',
          tenantId: 'f3fc9876-55dc-44a2-92c4-4c288ec66345',
          timestamp: '1913-10-30T17:50:53.0Z',
        },
        {
          detail: 'edit_playbook',
          id: '2fc613cd-1124-4c53-86af-0e4de5f2a137',
          insightEvent: {
            city: 'New Felixfield',
            country: 'Burundi',
            ipAddress: '671 Maud Loop Suite 449',
            latitude: -19252390.387834907,
            longitude: 85219477.8425622,
            metroCode: 'esse ut do proident',
            postalCode: 'velit amet ad dolore',
            region: 'Ut Duis officia in',
            regionName: 'Miss Geraldine Morar',
            sessionId: 'f7bf14f0-f377-475e-81a8-c98f31904dfb',
            timeZone: 'eiusmod reprehenderit',
            timestamp: '1896-08-04T04:25:14.0Z',
            userAgent: 'consequat adipisicing',
          },
          name: 'Belinda Heaney',
          principal: 'firm_employee',
          tenantId: '422c93a1-f12e-41d7-9b65-b9925c65087c',
          timestamp: '1959-08-12T10:33:37.0Z',
        },
        {
          detail: 'create_org',
          id: '2fc613cd-1124-4c53-86af-0e4de5f2a137',
          insightEvent: {
            city: 'New Felixfield',
            country: 'Burundi',
            ipAddress: '671 Maud Loop Suite 449',
            latitude: 27143525.966842443,
            longitude: -29509719.54716204,
            metroCode: 'qui fugiat pariatur id',
            postalCode: 'mollit labore aliquip nostrud deserunt',
            region: 'fugiat id',
            regionName: 'Miss Geraldine Morar',
            sessionId: 'f7bf14f0-f377-475e-81a8-c98f31904dfb',
            timeZone: 'incididunt laborum',
            timestamp: '1938-03-17T22:58:46.0Z',
            userAgent: 'Duis culpa exercitation ullamco adipisicing',
          },
          name: 'Belinda Heaney',
          principal: 'firm_employee',
          tenantId: '422c93a1-f12e-41d7-9b65-b9925c65087c',
          timestamp: '1932-01-04T19:01:21.0Z',
        },
      ],
      meta: {
        count: -9204888,
        next: 'velit quis aliqua elit',
      },
    },
    props,
  ) as CursorPaginatedAuditEvent;
export const getCursorPaginatedEntity = (props: Partial<CursorPaginatedEntity>) =>
  merge(
    {
      data: [
        {
          attributes: ['bank.*.account_type', 'document.residence_document.issuing_country', 'id.ssn4'],
          data: [
            {
              dataKind: 'document_data',
              identifier: 'd9134e0e-4101-44ac-8990-9bd64294b56c',
              isDecryptable: false,
              source: 'client_tenant',
              value: 'aliquip ullamco',
            },
            {
              dataKind: 'document_data',
              identifier: 'd9134e0e-4101-44ac-8990-9bd64294b56c',
              isDecryptable: false,
              source: 'hosted',
              value: 'cillum nulla sunt fugiat elit',
            },
            {
              dataKind: 'document_data',
              identifier: 'd9134e0e-4101-44ac-8990-9bd64294b56c',
              isDecryptable: true,
              source: 'ocr',
              value: 'consequat non',
            },
          ],
          decryptableAttributes: [
            'document.proof_of_address.image',
            'document.residence_document.selfie.mime_type',
            'document.permit.curp_validation_response',
          ],
          decryptedAttributes: {},
          externalId: 'c0a2453f-5a2f-4313-83e5-cbdcb2d2448c',
          hasOutstandingWorkflowRequest: true,
          id: '729211b8-3cf5-4d23-953a-10f551440ce3',
          isCreatedViaApi: false,
          isIdentifiable: true,
          isPortable: false,
          kind: 'person',
          label: 'offboard_fraud',
          lastActivityAt: '1910-07-24T13:42:09.0Z',
          manualReviewKinds: ['rule_triggered', 'document_needs_review', 'document_needs_review'],
          orderingId: -19592475,
          requiresManualReview: false,
          sandboxId: 'ede946c2-30e2-48aa-aca0-5c72fd22cf69',
          startTimestamp: '1969-08-15T17:06:02.0Z',
          status: 'fail',
          svId: 'd4f9935c-65e8-4c9d-9568-c2e4d5461152',
          tags: [
            {
              createdAt: '1965-02-28T21:27:54.0Z',
              id: '9cc8af93-ad53-4a57-aec9-e7873d6473fc',
              tag: 'cillum magna incididunt non adipisicing',
            },
            {
              createdAt: '1893-02-19T01:09:19.0Z',
              id: '1fa40134-648d-46f7-8bb1-e046e5e54111',
              tag: 'irure sed qui',
            },
            {
              createdAt: '1945-05-07T15:35:25.0Z',
              id: '1fa40134-648d-46f7-8bb1-e046e5e54111',
              tag: 'officia',
            },
          ],
          vId: '3bbe0649-974f-4f3f-a5c2-9435b8f45613',
          watchlistCheck: {
            id: '157177db-bb77-4eea-98a3-2cabda38a872',
            reasonCodes: [
              'document_selfie_glasses',
              'document_photo_is_not_screen_capture',
              'name_first_partially_matches',
            ],
            status: 'error',
          },
          workflows: [
            {
              createdAt: '1945-01-29T20:05:23.0Z',
              insightEvent: {
                city: 'Lake Shannystead',
                country: 'Sweden',
                ipAddress: '327 Harris Heights Suite 347',
                latitude: 66420130.09575942,
                longitude: 96784280.38657284,
                metroCode: 'dolor exercitation ea',
                postalCode: 'in ullamco sed enim veniam',
                region: 'laborum sint Lorem occaecat',
                regionName: 'Amelia Will',
                sessionId: '4329f3ae-374d-4dd9-b4df-dad870fea6e8',
                timeZone: 'dolor aute elit nulla tempor',
                timestamp: '1910-12-03T06:05:59.0Z',
                userAgent: 'labore reprehenderit laborum velit',
              },
              playbookId: '522f882d-5e56-491f-a0ab-f1aedac97303',
              status: 'none',
            },
            {
              createdAt: '1968-10-21T16:35:53.0Z',
              insightEvent: {
                city: 'East Keegan',
                country: 'Rwanda',
                ipAddress: '5732 Littel Loop Suite 339',
                latitude: -72831924.6448613,
                longitude: 47129805.9273853,
                metroCode: 'sit reprehenderit',
                postalCode: 'ut in consequat veniam sint',
                region: 'enim laborum magna nulla exercitation',
                regionName: 'Amelia Will',
                sessionId: '4e5f5f3a-3292-41ff-93dc-93559a0afaeb',
                timeZone: 'ipsum qui pariatur in',
                timestamp: '1940-01-14T09:04:24.0Z',
                userAgent: 'deserunt nisi',
              },
              playbookId: 'b402aa92-3e20-411f-96e3-072101997e65',
              status: 'pass',
            },
            {
              createdAt: '1955-04-07T01:37:02.0Z',
              insightEvent: {
                city: 'East Keegan',
                country: 'French Guiana',
                ipAddress: '5732 Littel Loop Suite 339',
                latitude: -13095337.265393063,
                longitude: -98351289.21925028,
                metroCode: 'quis occaecat mollit magna',
                postalCode: 'magna Lorem aliqua quis',
                region: 'ex pariatur sit ullamco',
                regionName: 'Amelia Will',
                sessionId: '4e5f5f3a-3292-41ff-93dc-93559a0afaeb',
                timeZone: 'reprehenderit Duis sit dolor aliquip',
                timestamp: '1945-07-25T06:19:20.0Z',
                userAgent: 'ipsum',
              },
              playbookId: 'b402aa92-3e20-411f-96e3-072101997e65',
              status: 'fail',
            },
          ],
        },
        {
          attributes: [
            'document.visa.clave_de_elector',
            'document.passport.back.image',
            'document.drivers_license.selfie.image',
          ],
          data: [
            {
              dataKind: 'vault_data',
              identifier: 'd9134e0e-4101-44ac-8990-9bd64294b56c',
              isDecryptable: true,
              source: 'components_sdk',
              value: 'adipisicing incididunt ea elit officia',
            },
            {
              dataKind: 'vault_data',
              identifier: 'e3d52007-2daa-4dd9-8bcb-6a01c1a8817b',
              isDecryptable: false,
              source: 'hosted',
              value: 'Duis laborum exercitation minim',
            },
            {
              dataKind: 'document_data',
              identifier: 'e3d52007-2daa-4dd9-8bcb-6a01c1a8817b',
              isDecryptable: true,
              source: 'tenant',
              value: 'culpa',
            },
          ],
          decryptableAttributes: [
            'document.permit.issued_at',
            'document.passport_card.issuing_country',
            'document.ssn_card.image',
          ],
          decryptedAttributes: {},
          externalId: 'c0a2453f-5a2f-4313-83e5-cbdcb2d2448c',
          hasOutstandingWorkflowRequest: true,
          id: '729211b8-3cf5-4d23-953a-10f551440ce3',
          isCreatedViaApi: false,
          isIdentifiable: true,
          isPortable: true,
          kind: 'business',
          label: 'offboard_fraud',
          lastActivityAt: '1892-07-04T13:58:30.0Z',
          manualReviewKinds: ['document_needs_review', 'document_needs_review', 'document_needs_review'],
          orderingId: -8016509,
          requiresManualReview: true,
          sandboxId: 'ede946c2-30e2-48aa-aca0-5c72fd22cf69',
          startTimestamp: '1911-01-25T11:31:09.0Z',
          status: 'fail',
          svId: 'd4f9935c-65e8-4c9d-9568-c2e4d5461152',
          tags: [
            {
              createdAt: '1905-05-13T15:46:28.0Z',
              id: '9cc8af93-ad53-4a57-aec9-e7873d6473fc',
              tag: 'anim amet labore',
            },
            {
              createdAt: '1932-05-01T20:18:43.0Z',
              id: '1fa40134-648d-46f7-8bb1-e046e5e54111',
              tag: 'in labore ea',
            },
            {
              createdAt: '1932-08-07T20:25:33.0Z',
              id: '1fa40134-648d-46f7-8bb1-e046e5e54111',
              tag: 'adipisicing',
            },
          ],
          vId: '3bbe0649-974f-4f3f-a5c2-9435b8f45613',
          watchlistCheck: {
            id: '157177db-bb77-4eea-98a3-2cabda38a872',
            reasonCodes: ['business_dba_match', 'sos_domestic_filing_not_found', 'document_ocr_not_successful'],
            status: 'pending',
          },
          workflows: [
            {
              createdAt: '1906-07-20T02:08:47.0Z',
              insightEvent: {
                city: 'Lake Shannystead',
                country: 'Mauritius',
                ipAddress: '327 Harris Heights Suite 347',
                latitude: 6396329.095703065,
                longitude: 13030889.22663264,
                metroCode: 'et',
                postalCode: 'culpa adipisicing',
                region: 'officia sed dolor dolore occaecat',
                regionName: 'Jaime Windler',
                sessionId: '4329f3ae-374d-4dd9-b4df-dad870fea6e8',
                timeZone: 'eu quis Excepteur ipsum',
                timestamp: '1934-01-30T11:54:01.0Z',
                userAgent: 'et reprehenderit ut ullamco sed',
              },
              playbookId: '522f882d-5e56-491f-a0ab-f1aedac97303',
              status: 'pass',
            },
            {
              createdAt: '1927-06-06T22:09:01.0Z',
              insightEvent: {
                city: 'Lake Shannystead',
                country: 'Sweden',
                ipAddress: '327 Harris Heights Suite 347',
                latitude: 69269317.9309448,
                longitude: -92424407.39334312,
                metroCode: 'Excepteur aliqua nostrud',
                postalCode: 'Excepteur dolor',
                region: 'deserunt eiusmod',
                regionName: 'Salvador West',
                sessionId: '4329f3ae-374d-4dd9-b4df-dad870fea6e8',
                timeZone: 'voluptate quis adipisicing',
                timestamp: '1951-07-17T14:58:46.0Z',
                userAgent: 'cillum exercitation nostrud',
              },
              playbookId: '522f882d-5e56-491f-a0ab-f1aedac97303',
              status: 'none',
            },
            {
              createdAt: '1943-01-25T23:15:18.0Z',
              insightEvent: {
                city: 'North Ocie',
                country: 'Mauritius',
                ipAddress: '9808 Clark Street Apt. 697',
                latitude: 55922766.93963197,
                longitude: -41177785.64484333,
                metroCode: 'dolore enim ipsum',
                postalCode: 'nulla aute in',
                region: 'commodo ut',
                regionName: 'Jaime Windler',
                sessionId: '07f4116a-346c-4277-b353-6aff2c47b234',
                timeZone: 'mollit',
                timestamp: '1911-08-26T12:19:49.0Z',
                userAgent: 'in proident non veniam',
              },
              playbookId: 'b402aa92-3e20-411f-96e3-072101997e65',
              status: 'fail',
            },
          ],
        },
        {
          attributes: ['id.city', 'document.passport_card.dob', 'document.drivers_license.selfie.image'],
          data: [
            {
              dataKind: 'document_data',
              identifier: 'e3d52007-2daa-4dd9-8bcb-6a01c1a8817b',
              isDecryptable: false,
              source: 'ocr',
              value: 'dolore sed sit eiusmod',
            },
            {
              dataKind: 'document_data',
              identifier: 'e3d52007-2daa-4dd9-8bcb-6a01c1a8817b',
              isDecryptable: true,
              source: 'prefill',
              value: 'dolore sed amet veniam',
            },
            {
              dataKind: 'vault_data',
              identifier: 'e3d52007-2daa-4dd9-8bcb-6a01c1a8817b',
              isDecryptable: true,
              source: 'tenant',
              value: 'ut tempor',
            },
          ],
          decryptableAttributes: [
            'document.visa.issuing_country',
            'document.visa.expires_at',
            'card.*.expiration_month',
          ],
          decryptedAttributes: {},
          externalId: 'efad63d6-faed-4f67-80fc-08286c318c95',
          hasOutstandingWorkflowRequest: true,
          id: '9a433515-2266-4602-9053-121fe74a794f',
          isCreatedViaApi: false,
          isIdentifiable: false,
          isPortable: true,
          kind: 'business',
          label: 'offboard_fraud',
          lastActivityAt: '1899-04-13T12:46:11.0Z',
          manualReviewKinds: ['rule_triggered', 'document_needs_review', 'document_needs_review'],
          orderingId: 57489798,
          requiresManualReview: true,
          sandboxId: '9667e9c3-3ade-48b5-884a-2216cc1988da',
          startTimestamp: '1903-12-06T05:29:50.0Z',
          status: 'none',
          svId: '384deb01-5b4a-47ff-a66a-236cf3bc95be',
          tags: [
            {
              createdAt: '1895-05-05T21:04:27.0Z',
              id: '1fa40134-648d-46f7-8bb1-e046e5e54111',
              tag: 'cupidatat qui labore',
            },
            {
              createdAt: '1946-07-28T08:23:05.0Z',
              id: '1fa40134-648d-46f7-8bb1-e046e5e54111',
              tag: 'in Ut id ut',
            },
            {
              createdAt: '1907-01-02T11:18:59.0Z',
              id: '1fa40134-648d-46f7-8bb1-e046e5e54111',
              tag: 'enim dolor',
            },
          ],
          vId: '34d66f90-a33e-45d5-a217-58754e63d9d6',
          watchlistCheck: {
            id: '9eb49da2-b1ee-4730-88e1-3915865fb13d',
            reasonCodes: ['us_tax_id_is_itin', 'business_phone_number_match', 'business_website_unverified'],
            status: 'error',
          },
          workflows: [
            {
              createdAt: '1966-08-19T05:26:34.0Z',
              insightEvent: {
                city: 'East Keegan',
                country: 'Rwanda',
                ipAddress: '5732 Littel Loop Suite 339',
                latitude: -5498736.554255322,
                longitude: -96193163.82666053,
                metroCode: 'incididunt elit cillum aliquip voluptate',
                postalCode: 'magna non mollit',
                region: 'culpa deserunt aliquip mollit exercitation',
                regionName: 'Amelia Will',
                sessionId: '4e5f5f3a-3292-41ff-93dc-93559a0afaeb',
                timeZone: 'irure tempor',
                timestamp: '1956-09-06T08:01:08.0Z',
                userAgent: 'dolor anim irure',
              },
              playbookId: 'b402aa92-3e20-411f-96e3-072101997e65',
              status: 'incomplete',
            },
            {
              createdAt: '1960-05-04T07:37:13.0Z',
              insightEvent: {
                city: 'East Keegan',
                country: 'Rwanda',
                ipAddress: '5732 Littel Loop Suite 339',
                latitude: -39276682.61361341,
                longitude: 58173827.60973367,
                metroCode: 'minim velit occaecat',
                postalCode: 'in culpa minim aliqua',
                region: 'occaecat incididunt sed deserunt ad',
                regionName: 'Amelia Will',
                sessionId: '4e5f5f3a-3292-41ff-93dc-93559a0afaeb',
                timeZone: 'veniam enim Lorem aute',
                timestamp: '1962-09-11T20:19:13.0Z',
                userAgent: 'elit nisi reprehenderit enim',
              },
              playbookId: 'b402aa92-3e20-411f-96e3-072101997e65',
              status: 'incomplete',
            },
            {
              createdAt: '1957-11-15T07:45:27.0Z',
              insightEvent: {
                city: 'East Keegan',
                country: 'Rwanda',
                ipAddress: '5732 Littel Loop Suite 339',
                latitude: 11331569.626757294,
                longitude: -16285615.85359019,
                metroCode: 'irure cillum ad',
                postalCode: 'elit laborum consequat',
                region: 'in',
                regionName: 'Amelia Will',
                sessionId: '4e5f5f3a-3292-41ff-93dc-93559a0afaeb',
                timeZone: 'anim dolor consequat',
                timestamp: '1945-01-16T19:08:20.0Z',
                userAgent: 'in dolore incididunt velit dolore',
              },
              playbookId: 'b402aa92-3e20-411f-96e3-072101997e65',
              status: 'none',
            },
          ],
        },
      ],
      meta: {
        count: 7664003,
        next: 73000805,
      },
    },
    props,
  ) as CursorPaginatedEntity;
export const getCursorPaginatedListEvent = (props: Partial<CursorPaginatedListEvent>) =>
  merge(
    {
      data: [
        {
          detail: 'mollit minim ut',
          id: '077227d7-296a-422a-be91-098a4d5e7609',
          insightEvent: {
            city: 'West Audrey',
            country: 'Heard Island and McDonald Islands',
            ipAddress: '16165 Aiden Club Suite 113',
            latitude: -75599247.95520443,
            longitude: -7654937.13004899,
            metroCode: 'magna aute ipsum',
            postalCode: 'esse ut',
            region: 'consequat in',
            regionName: 'Edith Wolf',
            sessionId: 'ebf0809b-4cfb-4745-8fdb-a76d4b5ae7b8',
            timeZone: 'consectetur',
            timestamp: '1905-12-06T04:37:15.0Z',
            userAgent: 'esse Lorem adipisicing culpa ad',
          },
          name: 'Eric Emmerich',
          principal: 'footprint',
          tenantId: '18b417e0-5494-46c2-a13b-90b77d2f746a',
          timestamp: '1939-06-13T06:17:51.0Z',
        },
        {
          detail: 'nisi eu est',
          id: '805cb669-9601-4cd0-9f2a-60528d11df2a',
          insightEvent: {
            city: 'West Audrey',
            country: 'Papua New Guinea',
            ipAddress: '16165 Aiden Club Suite 113',
            latitude: 71942845.58338234,
            longitude: 13085025.602447197,
            metroCode: 'amet anim ut est non',
            postalCode: 'eiusmod culpa',
            region: 'in velit proident',
            regionName: 'Edith Wolf',
            sessionId: 'ebf0809b-4cfb-4745-8fdb-a76d4b5ae7b8',
            timeZone: 'commodo consectetur fugiat ex laborum',
            timestamp: '1898-04-24T13:48:58.0Z',
            userAgent: 'ut cillum Duis Lorem',
          },
          name: 'Dr. Jay Sawayn PhD',
          principal: 'firm_employee',
          tenantId: '7eebc2cd-dba2-499d-a40b-3bd4be51e2ee',
          timestamp: '1958-04-29T14:43:18.0Z',
        },
        {
          detail: 'voluptate exercitation anim enim',
          id: '805cb669-9601-4cd0-9f2a-60528d11df2a',
          insightEvent: {
            city: 'West Audrey',
            country: 'Papua New Guinea',
            ipAddress: '16165 Aiden Club Suite 113',
            latitude: -50653322.69164298,
            longitude: 94727195.45014954,
            metroCode: 'eiusmod aute dolore mollit est',
            postalCode: 'est ut labore adipisicing',
            region: 'quis',
            regionName: 'Edith Wolf',
            sessionId: 'ebf0809b-4cfb-4745-8fdb-a76d4b5ae7b8',
            timeZone: 'est Ut consectetur in',
            timestamp: '1965-04-15T14:07:21.0Z',
            userAgent: 'Ut dolore',
          },
          name: 'Dr. Jay Sawayn PhD',
          principal: 'firm_employee',
          tenantId: '7eebc2cd-dba2-499d-a40b-3bd4be51e2ee',
          timestamp: '1922-06-09T03:37:41.0Z',
        },
      ],
      meta: {
        count: 91030627,
        next: 'qui Lorem',
      },
    },
    props,
  ) as CursorPaginatedListEvent;
export const getDeleteRequest = (props: Partial<DeleteRequest>) =>
  merge(
    {
      deleteAll: false,
      fields: [
        'document.voter_identification.dob',
        'document.residence_document.front.mime_type',
        'document.drivers_license.selfie.mime_type',
      ],
    },
    props,
  ) as DeleteRequest;
export const getDocsTokenResponse = (props: Partial<DocsTokenResponse>) =>
  merge(
    {
      token: 'e1852ee5-679d-4260-b92c-76e609c59641',
    },
    props,
  ) as DocsTokenResponse;
export const getDocument = (props: Partial<Document>) =>
  merge(
    {
      completedVersion: 15001711,
      curpCompletedVersion: -67804617,
      documentScore: 18869657.02572176,
      kind: 'id_card',
      ocrConfidenceScore: -24067831.627324134,
      reviewStatus: 'pending_machine_review',
      selfieScore: 58194394.94926214,
      startedAt: '1910-02-13T09:33:26.0Z',
      status: 'complete',
      uploadSource: 'Desktop',
      uploads: [
        {
          failureReasons: [
            'selfie_low_confidence',
            'drivers_license_permit_not_allowed',
            'selfie_image_size_unsupported',
          ],
          identifier: '1f38a3c3-382c-4d02-b850-b101c6ce9035',
          isExtraCompressed: false,
          side: '82147a05-5eab-4d06-8ba8-280ad1c4d3e4',
          timestamp: '1933-12-14T22:05:37.0Z',
          version: -3389463,
        },
        {
          failureReasons: ['document_too_small', 'document_missing_four_corners', 'selfie_blurry'],
          identifier: '1f38a3c3-382c-4d02-b850-b101c6ce9035',
          isExtraCompressed: true,
          side: '82147a05-5eab-4d06-8ba8-280ad1c4d3e4',
          timestamp: '1937-05-20T01:28:03.0Z',
          version: -35444473,
        },
        {
          failureReasons: ['selfie_blurry', 'wrong_document_side', 'unknown_document_type'],
          identifier: '1f38a3c3-382c-4d02-b850-b101c6ce9035',
          isExtraCompressed: true,
          side: '82147a05-5eab-4d06-8ba8-280ad1c4d3e4',
          timestamp: '1906-05-17T17:25:40.0Z',
          version: 77108509,
        },
      ],
    },
    props,
  ) as Document;
export const getDupes = (props: Partial<Dupes>) =>
  merge(
    {
      otherTenant: {
        numMatches: 44068895,
        numTenants: -38094617,
      },
      sameTenant: [
        {
          data: [
            {
              dataKind: 'document_data',
              identifier: 'b5373771-6eb1-44bf-8c9e-0f1c871d1f1b',
              isDecryptable: true,
              source: 'ocr',
              value: 'ea',
            },
            {
              dataKind: 'vault_data',
              identifier: 'b5373771-6eb1-44bf-8c9e-0f1c871d1f1b',
              isDecryptable: false,
              source: 'ocr',
              value: 'cupidatat anim ut aute quis',
            },
            {
              dataKind: 'document_data',
              identifier: 'df2cfd2c-bbff-4fa7-9b18-cc84688a6b05',
              isDecryptable: true,
              source: 'ocr',
              value: 'tempor dolore ipsum',
            },
          ],
          dupeKinds: ['ssn9', 'dob_ssn4', 'name_dob'],
          fpId: '2092c170-d534-4775-ba0c-8e1ec6f08033',
          startTimestamp: '1905-01-06T15:27:07.0Z',
          status: 'pass',
        },
        {
          data: [
            {
              dataKind: 'document_data',
              identifier: 'b5373771-6eb1-44bf-8c9e-0f1c871d1f1b',
              isDecryptable: false,
              source: 'prefill',
              value: 'Duis in ipsum nostrud',
            },
            {
              dataKind: 'document_data',
              identifier: 'df2cfd2c-bbff-4fa7-9b18-cc84688a6b05',
              isDecryptable: false,
              source: 'ocr',
              value: 'in',
            },
            {
              dataKind: 'document_data',
              identifier: 'df2cfd2c-bbff-4fa7-9b18-cc84688a6b05',
              isDecryptable: true,
              source: 'components_sdk',
              value: 'nisi eu',
            },
          ],
          dupeKinds: ['name_ssn4', 'bank_routing_account', 'dob_ssn4'],
          fpId: '2092c170-d534-4775-ba0c-8e1ec6f08033',
          startTimestamp: '1931-12-11T12:32:56.0Z',
          status: 'pass',
        },
        {
          data: [
            {
              dataKind: 'vault_data',
              identifier: 'b5373771-6eb1-44bf-8c9e-0f1c871d1f1b',
              isDecryptable: true,
              source: 'prefill',
              value: 'ut cupidatat',
            },
            {
              dataKind: 'vault_data',
              identifier: 'df2cfd2c-bbff-4fa7-9b18-cc84688a6b05',
              isDecryptable: true,
              source: 'hosted',
              value: 'eu magna Ut in do',
            },
            {
              dataKind: 'document_data',
              identifier: 'df2cfd2c-bbff-4fa7-9b18-cc84688a6b05',
              isDecryptable: true,
              source: 'bootstrap',
              value: 'sit pariatur laborum exercitation eiusmod',
            },
          ],
          dupeKinds: ['name_ssn4', 'dob_ssn4', 'cookie_id'],
          fpId: '2092c170-d534-4775-ba0c-8e1ec6f08033',
          startTimestamp: '1959-09-15T05:29:47.0Z',
          status: 'incomplete',
        },
      ],
    },
    props,
  ) as Dupes;
export const getEmpty = (props: Partial<Empty>) => merge({}, props) as Empty;
export const getEnclaveHealthResponse = (props: Partial<EnclaveHealthResponse>) =>
  merge(
    {
      decryptMs: -90080479,
      keypairGenMs: 88053880,
      success: false,
    },
    props,
  ) as EnclaveHealthResponse;
export const getEntity = (props: Partial<Entity>) =>
  merge(
    {
      attributes: ['card.*.expiration_month', 'investor_profile.declarations', 'id.us_tax_id'],
      data: [
        {
          dataKind: 'document_data',
          identifier: '39625447-ff3e-44ac-a9db-e8270f67e74e',
          isDecryptable: true,
          source: 'hosted',
          transforms: {},
          value: 'occaecat Ut',
        },
        {
          dataKind: 'document_data',
          identifier: '39625447-ff3e-44ac-a9db-e8270f67e74e',
          isDecryptable: true,
          source: 'vendor',
          transforms: {},
          value: 'et quis esse occaecat adipisicing',
        },
        {
          dataKind: 'vault_data',
          identifier: '39625447-ff3e-44ac-a9db-e8270f67e74e',
          isDecryptable: false,
          source: 'vendor',
          transforms: {},
          value: 'consequat qui',
        },
      ],
      decryptableAttributes: ['document.residence_document.back.image', 'business.address_line1', 'id.state'],
      decryptedAttributes: {},
      externalId: 'a6d44c09-8779-4979-95ab-fd89e4ddd111',
      hasOutstandingWorkflowRequest: true,
      id: '064f6a2d-cb58-4287-abb6-5d36fe80fab1',
      isCreatedViaApi: false,
      isIdentifiable: true,
      isPortable: true,
      kind: 'person',
      label: 'active',
      lastActivityAt: '1928-01-31T07:08:36.0Z',
      manualReviewKinds: ['document_needs_review', 'rule_triggered', 'rule_triggered'],
      orderingId: 41300701,
      requiresManualReview: false,
      sandboxId: '95812486-f06e-4744-a16d-b3510e93e6b2',
      startTimestamp: '1968-09-27T16:03:27.0Z',
      status: 'fail',
      svId: 'e3dcce9b-a1e0-40a7-a2a6-b891e079707d',
      tags: [
        {
          createdAt: '1918-01-24T16:39:35.0Z',
          id: '01da8293-a7d2-4d97-bb75-afb4a73c4c22',
          tag: 'incididunt tempor',
        },
        {
          createdAt: '1963-10-20T04:54:40.0Z',
          id: '46443e28-987f-4789-8461-4474b8c4527e',
          tag: 'Ut pariatur',
        },
        {
          createdAt: '1933-04-15T01:21:44.0Z',
          id: '46443e28-987f-4789-8461-4474b8c4527e',
          tag: 'esse',
        },
      ],
      vId: '9b01de92-2c54-4c3d-92c1-d55aee535c34',
      watchlistCheck: {
        id: 'b8d72636-5454-4768-bcc9-06e64581b905',
        reasonCodes: [
          'document_restricted_template_type',
          'browser_tampering',
          'sos_business_address_filing_not_found',
        ],
        status: 'pass',
      },
      workflows: [
        {
          createdAt: '1964-10-15T18:31:26.0Z',
          insightEvent: {
            city: 'North Darionworth',
            country: 'Heard Island and McDonald Islands',
            ipAddress: '39472 N Church Street Apt. 999',
            latitude: 91097955.0432108,
            longitude: -28783994.194314793,
            metroCode: 'sint dolore labore',
            postalCode: 'magna sit sed labore',
            region: 'eu reprehenderit dolore',
            regionName: 'Garry Oberbrunner',
            sessionId: '75e69259-e369-4de7-b4a8-e97b8605c0ee',
            timeZone: 'eiusmod do in',
            timestamp: '1924-12-06T06:32:01.0Z',
            userAgent: 'velit deserunt voluptate do',
          },
          playbookId: 'a0c32f9b-fd73-425f-9dce-e7481b697d71',
          status: 'none',
        },
        {
          createdAt: '1904-03-27T02:15:31.0Z',
          insightEvent: {
            city: 'North Darionworth',
            country: 'Northern Mariana Islands',
            ipAddress: '254 Mante Courts Apt. 861',
            latitude: 56007503.398083985,
            longitude: -64937039.789727665,
            metroCode: 'do amet laborum esse',
            postalCode: 'deserunt',
            region: 'Excepteur sed',
            regionName: 'Shannon Breitenberg-Harvey',
            sessionId: '787dfad3-c921-4035-8d6b-cff67a9087ec',
            timeZone: 'Excepteur anim incididunt',
            timestamp: '1906-12-19T22:28:07.0Z',
            userAgent: 'ex labore aliqua',
          },
          playbookId: 'a0c32f9b-fd73-425f-9dce-e7481b697d71',
          status: 'pending',
        },
        {
          createdAt: '1962-05-24T08:04:54.0Z',
          insightEvent: {
            city: 'Riverworth',
            country: 'Northern Mariana Islands',
            ipAddress: '254 Mante Courts Apt. 861',
            latitude: 86425149.8992486,
            longitude: 60113976.59500566,
            metroCode: 'quis Ut aute',
            postalCode: 'eiusmod dolor sed voluptate',
            region: 'dolor culpa aute proident Duis',
            regionName: 'Jared Schmeler',
            sessionId: '5b1168b9-bf9f-42c1-ab41-f57b4bf0cb2e',
            timeZone: 'nostrud',
            timestamp: '1951-07-28T19:56:38.0Z',
            userAgent: 'nostrud minim ex quis',
          },
          playbookId: 'c29de1a9-95ae-4e12-bd46-58b85eb02802',
          status: 'fail',
        },
      ],
    },
    props,
  ) as Entity;
export const getEntityActionResponse = (props: Partial<EntityActionResponse>) =>
  (props ?? 'Lorem deserunt occaecat') as EntityActionResponse;
export const getEntityActionsRequest = (props: Partial<EntityActionsRequest>) =>
  merge(
    {
      actions: ['clear_review', 'clear_review', 'clear_review'],
    },
    props,
  ) as EntityActionsRequest;
export const getEntityAttribute = (props: Partial<EntityAttribute>) =>
  merge(
    {
      dataKind: 'document_data',
      identifier: 'c0f86a5f-1f1d-4b68-b3d5-8db74e664a86',
      isDecryptable: false,
      source: 'ocr',
      transforms: {},
      value: 'adipisicing',
    },
    props,
  ) as EntityAttribute;
export const getEvaluateRuleRequest = (props: Partial<EvaluateRuleRequest>) =>
  merge(
    {
      add: [
        {
          isShadow: false,
          name: 'Dennis Conn',
          ruleAction: 'ad',
          ruleExpression: ['irure est ad quis', 'proident id ex', 'ea et'],
        },
        {
          isShadow: true,
          name: 'Sherman Fisher',
          ruleAction: 'incididunt ea aliquip aute',
          ruleExpression: ['ut dolore consequat in occaecat', 'et nostrud dolor', 'nisi'],
        },
        {
          isShadow: false,
          name: 'Sherman Fisher',
          ruleAction: 'magna laboris consequat',
          ruleExpression: ['ullamco consectetur dolor reprehenderit', 'enim qui sint fugiat cillum', 'ut in'],
        },
      ],
      delete: ['enim deserunt', 'in aute Duis ut', 'Duis fugiat ea aute Lorem'],
      edit: [
        {
          ruleExpression: ['cupidatat consequat commodo nostrud', 'amet minim ut occaecat sed', 'consectetur tempor'],
          ruleId: '594b6205-e63b-42cd-802d-977cf26381f7',
        },
        {
          ruleExpression: ['veniam nisi', 'veniam nulla deserunt labore ullamco', 'ea nostrud velit'],
          ruleId: '594b6205-e63b-42cd-802d-977cf26381f7',
        },
        {
          ruleExpression: ['ut in', 'id Lorem', 'voluptate in'],
          ruleId: 'bce00f7a-aa81-45c4-88b1-253afbd90e25',
        },
      ],
      endTimestamp: '1937-11-01T03:51:47.0Z',
      startTimestamp: '1928-11-06T16:56:37.0Z',
    },
    props,
  ) as EvaluateRuleRequest;
export const getGetClientTokenResponse = (props: Partial<GetClientTokenResponse>) =>
  merge(
    {
      expiresAt: '1939-08-05T22:20:03.0Z',
      tenant: {
        name: 'Manuel Stiedemann',
      },
      vaultFields: [
        'investor_profile.employment_status',
        'document.voter_identification.full_name',
        'document.passport_card.issuing_country',
      ],
    },
    props,
  ) as GetClientTokenResponse;
export const getGetFieldValidationResponse = (props: Partial<GetFieldValidationResponse>) =>
  merge(
    {
      address: {
        matchLevel: 'exact',
        signals: [
          {
            description: 'deserunt velit in laboris',
            matchLevel: 'no_match',
            note: 'nostrud aliqua tempor ut',
            reasonCode: 'ip_alert_high_risk_proxy',
            severity: 'medium',
          },
          {
            description: 'dolore laboris',
            matchLevel: 'could_not_match',
            note: 'in Ut fugiat',
            reasonCode: 'address_input_is_not_standard_uspo',
            severity: 'info',
          },
          {
            description: 'reprehenderit veniam ipsum minim',
            matchLevel: 'exact',
            note: 'Lorem',
            reasonCode: 'document_dob_crosscheck_matches',
            severity: 'high',
          },
        ],
      },
      businessAddress: {
        matchLevel: 'no_match',
        signals: [
          {
            description: 'ipsum',
            matchLevel: 'exact',
            note: 'labore id',
            reasonCode: 'ip_not_located',
            severity: 'medium',
          },
          {
            description: 'labore',
            matchLevel: 'partial',
            note: 'aute exercitation',
            reasonCode: 'document_country_code_mismatch',
            severity: 'high',
          },
          {
            description: 'exercitation Ut deserunt',
            matchLevel: 'partial',
            note: 'labore ad ut ipsum in',
            reasonCode: 'phone_located_address_does_not_match',
            severity: 'info',
          },
        ],
      },
      businessBeneficialOwners: {
        matchLevel: 'partial',
        signals: [
          {
            description: 'cillum magna do ullamco',
            matchLevel: 'exact',
            note: 'nostrud',
            reasonCode: 'attested_device_fraud_duplicate_risk_low',
            severity: 'info',
          },
          {
            description: 'Excepteur',
            matchLevel: 'partial',
            note: 'ipsum aute in reprehenderit',
            reasonCode: 'curp_not_valid',
            severity: 'high',
          },
          {
            description: 'dolor occaecat',
            matchLevel: 'could_not_match',
            note: 'labore sed reprehenderit Ut magna',
            reasonCode: 'document_selfie_mask',
            severity: 'high',
          },
        ],
      },
      businessDba: {
        matchLevel: 'no_match',
        signals: [
          {
            description: 'deserunt pariatur sint tempor',
            matchLevel: 'partial',
            note: 'exercitation',
            reasonCode: 'address_located_is_not_standard_hospital',
            severity: 'medium',
          },
          {
            description: 'ut',
            matchLevel: 'exact',
            note: 'dolor magna',
            reasonCode: 'document_collected_via_desktop',
            severity: 'medium',
          },
          {
            description: 'Duis dolor enim et',
            matchLevel: 'could_not_match',
            note: 'sint minim laborum',
            reasonCode: 'address_alert_longevity',
            severity: 'info',
          },
        ],
      },
      businessName: {
        matchLevel: 'partial',
        signals: [
          {
            description: 'ad pariatur nulla laborum',
            matchLevel: 'no_match',
            note: 'laboris ullamco aliqua',
            reasonCode: 'curp_valid',
            severity: 'low',
          },
          {
            description: 'eu cillum consequat pariatur ad',
            matchLevel: 'exact',
            note: 'aute pariatur Lorem amet',
            reasonCode: 'business_address_commercial_mail_receiving_agency',
            severity: 'low',
          },
          {
            description: 'fugiat laborum',
            matchLevel: 'no_match',
            note: 'occaecat',
            reasonCode: 'document_ocr_last_name_matches',
            severity: 'info',
          },
        ],
      },
      businessPhoneNumber: {
        matchLevel: 'partial',
        signals: [
          {
            description: 'occaecat labore',
            matchLevel: 'partial',
            note: 'dolor ut',
            reasonCode: 'ssn_potentially_belongs_to_another',
            severity: 'medium',
          },
          {
            description: 'sint do cupidatat adipisicing Duis',
            matchLevel: 'could_not_match',
            note: 'velit culpa',
            reasonCode: 'business_website_verified',
            severity: 'low',
          },
          {
            description: 'culpa mollit fugiat cillum magna',
            matchLevel: 'could_not_match',
            note: 'officia in ad',
            reasonCode: 'sos_domestic_filing_status_good_standing',
            severity: 'low',
          },
        ],
      },
      businessTin: {
        matchLevel: 'could_not_match',
        signals: [
          {
            description: 'in',
            matchLevel: 'exact',
            note: 'voluptate qui ea',
            reasonCode: 'curp_valid',
            severity: 'high',
          },
          {
            description: 'pariatur do est consectetur',
            matchLevel: 'could_not_match',
            note: 'magna',
            reasonCode: 'name_does_not_match',
            severity: 'medium',
          },
          {
            description: 'eiusmod Ut in',
            matchLevel: 'could_not_match',
            note: 'sunt',
            reasonCode: 'document_ocr_address_could_not_match',
            severity: 'low',
          },
        ],
      },
      dob: {
        matchLevel: 'could_not_match',
        signals: [
          {
            description: 'voluptate nulla amet eiusmod',
            matchLevel: 'could_not_match',
            note: 'tempor',
            reasonCode: 'document_possible_digital_fraud',
            severity: 'info',
          },
          {
            description: 'voluptate pariatur tempor fugiat',
            matchLevel: 'partial',
            note: 'exercitation',
            reasonCode: 'document_pdf417_data_is_not_valid',
            severity: 'low',
          },
          {
            description: 'non sit in cillum',
            matchLevel: 'could_not_match',
            note: 'proident aliqua quis pariatur',
            reasonCode: 'email_high_risk_country',
            severity: 'low',
          },
        ],
      },
      document: {
        matchLevel: 'no_match',
        signals: [
          {
            description: 'ex non',
            matchLevel: 'could_not_match',
            note: 'elit',
            reasonCode: 'sos_domestic_filing_status_not_provided_by_state',
            severity: 'high',
          },
          {
            description: 'nulla reprehenderit ex officia tempor',
            matchLevel: 'no_match',
            note: 'eu in enim',
            reasonCode: 'device_velocity',
            severity: 'medium',
          },
          {
            description: 'cillum nostrud ut eu consequat',
            matchLevel: 'exact',
            note: 'dolor dolore',
            reasonCode: 'browser_automation',
            severity: 'high',
          },
        ],
      },
      email: {
        matchLevel: 'partial',
        signals: [
          {
            description: 'eu occaecat consectetur aute dolore',
            matchLevel: 'could_not_match',
            note: 'pariatur deserunt sint amet ut',
            reasonCode: 'email_high_risk_fraud',
            severity: 'high',
          },
          {
            description: 'exercitation anim',
            matchLevel: 'no_match',
            note: 'quis officia velit fugiat dolore',
            reasonCode: 'email_high_risk_tumbled',
            severity: 'info',
          },
          {
            description: 'anim mollit adipisicing irure',
            matchLevel: 'no_match',
            note: 'exercitation irure minim voluptate',
            reasonCode: 'curp_valid',
            severity: 'high',
          },
        ],
      },
      name: {
        matchLevel: 'exact',
        signals: [
          {
            description: 'amet aute',
            matchLevel: 'exact',
            note: 'in amet dolor est ut',
            reasonCode: 'business_address_commercial',
            severity: 'medium',
          },
          {
            description: 'ea',
            matchLevel: 'partial',
            note: 'incididunt',
            reasonCode: 'sos_business_address_active_filing_found',
            severity: 'medium',
          },
          {
            description: 'id Duis Lorem',
            matchLevel: 'no_match',
            note: 'sed labore ad deserunt laborum',
            reasonCode: 'address_input_is_not_standard_hotel',
            severity: 'info',
          },
        ],
      },
      phone: {
        matchLevel: 'could_not_match',
        signals: [
          {
            description: 'pariatur ea occaecat',
            matchLevel: 'no_match',
            note: 'sint',
            reasonCode: 'curp_not_valid',
            severity: 'info',
          },
          {
            description: 'ad magna velit aute',
            matchLevel: 'no_match',
            note: 'in aute non commodo aliquip',
            reasonCode: 'ip_input_invalid',
            severity: 'info',
          },
          {
            description: 'ad',
            matchLevel: 'partial',
            note: 'eu',
            reasonCode: 'address_input_is_po_box',
            severity: 'low',
          },
        ],
      },
      ssn: {
        matchLevel: 'partial',
        signals: [
          {
            description: 'ut voluptate aute eiusmod anim',
            matchLevel: 'no_match',
            note: 'ut amet enim exercitation incididunt',
            reasonCode: 'document_requires_review',
            severity: 'medium',
          },
          {
            description: 'ut dolore laboris',
            matchLevel: 'no_match',
            note: 'aliqua id elit',
            reasonCode: 'ip_vpn',
            severity: 'low',
          },
          {
            description: 'exercitation cupidatat non',
            matchLevel: 'partial',
            note: 'deserunt et eu commodo elit',
            reasonCode: 'dob_could_not_match',
            severity: 'low',
          },
        ],
      },
    },
    props,
  ) as GetFieldValidationResponse;
export const getGetUserVaultResponse = (props: Partial<GetUserVaultResponse>) =>
  merge(
    {
      key: 'ea9ccefd-19a7-43dc-8938-345ba7655f13',
      value: false,
    },
    props,
  ) as GetUserVaultResponse;
export const getInProgressOnboarding = (props: Partial<InProgressOnboarding>) =>
  merge(
    {
      fpId: 'dbfb5817-5e9a-4080-a701-447f3160cf1d',
      status: 'pending',
      tenant: {
        name: 'Mr. Roy Gibson',
        websiteUrl: 'https://bruised-making.us/',
      },
      timestamp: '1932-10-12T23:03:35.0Z',
    },
    props,
  ) as InProgressOnboarding;
export const getIntegrityRequest = (props: Partial<IntegrityRequest>) =>
  merge(
    {
      fields: ['card.*.billing_address.zip', 'id.itin', 'document.passport.full_address'],
      signingKey: 'b9066b02-e682-4911-b1bd-9f2af9b73c62',
    },
    props,
  ) as IntegrityRequest;
export const getIntegrityResponse = (props: Partial<IntegrityResponse>) =>
  merge(
    {
      key: '5ec193b6-3183-499d-bdb9-1049489a78d8',
      value: {},
    },
    props,
  ) as IntegrityResponse;
export const getInvoicePreview = (props: Partial<InvoicePreview>) =>
  merge(
    {
      lastUpdatedAt: '1908-05-03T08:36:59.0Z',
      lineItems: [
        {
          description: 'Ut ex sit ullamco ea',
          id: 'b8dc8526-1fb7-4a4b-b3a5-6d9536e3bbcb',
          notionalCents: 81419804,
          quantity: -49021903,
          unitPriceCents: 'cupidatat nisi dolore velit veniam',
        },
        {
          description: 'aliquip ipsum ullamco',
          id: 'b8dc8526-1fb7-4a4b-b3a5-6d9536e3bbcb',
          notionalCents: 47150067,
          quantity: -51053677,
          unitPriceCents: 'sed et dolor Duis',
        },
        {
          description: 'laboris veniam in',
          id: 'a7bd6b08-7730-4040-87b2-0aa8f09a31bb',
          notionalCents: -1165783,
          quantity: 22326329,
          unitPriceCents: 'ut amet aliqua proident',
        },
      ],
    },
    props,
  ) as InvoicePreview;
export const getLinkAuthRequest = (props: Partial<LinkAuthRequest>) =>
  merge(
    {
      emailAddress: 'billie.gislason-huel11@gmail.com',
      redirectUrl: 'https://oddball-milestone.net/',
    },
    props,
  ) as LinkAuthRequest;
export const getList = (props: Partial<List>) =>
  merge(
    {
      actor: 'footprint',
      alias: 'Ut irure',
      createdAt: '1897-04-01T03:41:27.0Z',
      entriesCount: 2959574,
      id: 'e83c02eb-5a08-4b88-9533-da0532200bab',
      kind: 'ip_address',
      name: 'Emilio Nienow',
      usedInPlaybook: false,
    },
    props,
  ) as List;
export const getListDetails = (props: Partial<ListDetails>) =>
  merge(
    {
      actor: 'footprint',
      alias: 'quis Ut Lorem deserunt',
      createdAt: '1928-07-27T22:20:21.0Z',
      id: 'e66ef09e-fa57-4133-bda8-6aa01a847a71',
      kind: 'ssn9',
      name: 'Eric McClure',
      playbooks: [
        {
          id: '858be7c2-3f6b-4e5f-a8b4-dd85e0fa957f',
          key: '71963440-54b2-4836-a43c-850261508f3a',
          name: 'Lynn Kuhlman',
          rules: [
            {
              action: 'step_up.identity_proof_of_ssn',
              createdAt: '1910-12-03T23:15:54.0Z',
              isShadow: false,
              kind: 'Any',
              name: 'Josephine Brown',
              ruleAction: 'ex proident',
              ruleExpression: ['adipisicing', 'esse cupidatat id', 'dolor'],
              ruleId: '443272a7-5f9b-492f-a2b8-71d1f9a6cc30',
            },
            {
              action: 'step_up.identity',
              createdAt: '1940-08-04T05:03:08.0Z',
              isShadow: true,
              kind: 'Person',
              name: 'Josephine Brown',
              ruleAction: 'ad adipisicing occaecat consectetur in',
              ruleExpression: ['mollit sunt', 'irure aute do id ad', 'aute'],
              ruleId: '443272a7-5f9b-492f-a2b8-71d1f9a6cc30',
            },
            {
              action: 'step_up.custom',
              createdAt: '1948-03-02T11:42:11.0Z',
              isShadow: false,
              kind: 'Business',
              name: 'Claude Bosco-Hegmann',
              ruleAction: 'laborum in eu qui Ut',
              ruleExpression: [
                'deserunt in irure',
                'sunt reprehenderit culpa minim',
                'voluptate laboris reprehenderit',
              ],
              ruleId: '07dd132e-8fd4-4676-8585-ad11b14af4f8',
            },
          ],
        },
        {
          id: '858be7c2-3f6b-4e5f-a8b4-dd85e0fa957f',
          key: '71963440-54b2-4836-a43c-850261508f3a',
          name: 'Lynn Kuhlman',
          rules: [
            {
              action: 'step_up.identity',
              createdAt: '1949-11-07T20:42:53.0Z',
              isShadow: false,
              kind: 'Business',
              name: 'Josephine Brown',
              ruleAction: 'ipsum commodo reprehenderit',
              ruleExpression: ['consequat sit', 'dolore', 'minim'],
              ruleId: '443272a7-5f9b-492f-a2b8-71d1f9a6cc30',
            },
            {
              action: 'step_up.custom',
              createdAt: '1956-05-27T22:30:12.0Z',
              isShadow: true,
              kind: 'Any',
              name: 'Josephine Brown',
              ruleAction: 'consectetur consequat',
              ruleExpression: ['nulla in dolore esse sunt', 'culpa ut', 'magna in proident aliquip'],
              ruleId: '443272a7-5f9b-492f-a2b8-71d1f9a6cc30',
            },
            {
              action: 'fail',
              createdAt: '1961-06-29T17:34:17.0Z',
              isShadow: true,
              kind: 'Business',
              name: 'Claude Bosco-Hegmann',
              ruleAction: 'minim',
              ruleExpression: [
                'ipsum consectetur in culpa pariatur',
                'reprehenderit',
                'nostrud dolore do ullamco Excepteur',
              ],
              ruleId: '443272a7-5f9b-492f-a2b8-71d1f9a6cc30',
            },
          ],
        },
        {
          id: '858be7c2-3f6b-4e5f-a8b4-dd85e0fa957f',
          key: '71963440-54b2-4836-a43c-850261508f3a',
          name: 'Lynn Kuhlman',
          rules: [
            {
              action: 'step_up.custom',
              createdAt: '1936-10-30T21:22:44.0Z',
              isShadow: false,
              kind: 'Person',
              name: 'Josephine Brown',
              ruleAction: 'minim irure',
              ruleExpression: ['officia incididunt occaecat', 'ad consectetur do ut', 'reprehenderit'],
              ruleId: '443272a7-5f9b-492f-a2b8-71d1f9a6cc30',
            },
            {
              action: 'step_up.custom',
              createdAt: '1954-06-29T16:23:36.0Z',
              isShadow: false,
              kind: 'Business',
              name: 'Claude Bosco-Hegmann',
              ruleAction: 'deserunt dolore eiusmod',
              ruleExpression: ['tempor laboris sunt ex', 'dolor incididunt ut', 'tempor dolor sed eiusmod'],
              ruleId: '443272a7-5f9b-492f-a2b8-71d1f9a6cc30',
            },
            {
              action: 'fail',
              createdAt: '1892-04-03T14:27:50.0Z',
              isShadow: false,
              kind: 'Any',
              name: 'Claude Bosco-Hegmann',
              ruleAction: 'Excepteur',
              ruleExpression: ['fugiat sunt est', 'irure dolor', 'aliquip sit'],
              ruleId: '07dd132e-8fd4-4676-8585-ad11b14af4f8',
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
      externalId: 'df6742bb-191d-4935-b8e5-78ad9b684b78',
      hasOutstandingWorkflowRequest: true,
      kind: 'business',
      labels: ['active', 'offboard_other', 'offboard_fraud'],
      pagination: {
        cursor: 14108917,
        pageSize: -38881867,
      },
      playbookIds: [
        'sit culpa sed tempor',
        'enim Excepteur commodo cupidatat',
        'proident adipisicing quis sint exercitation',
      ],
      requiresManualReview: true,
      search: 'aliqua ullamco sint sit incididunt',
      showAll: false,
      statuses: ['none', 'fail', 'incomplete'],
      tags: ['pariatur in ut consectetur cupidatat', 'exercitation Lorem veniam in nulla', 'aliquip pariatur'],
      timestampGte: '1895-02-01T04:19:24.0Z',
      timestampLte: '1949-12-07T12:09:21.0Z',
      watchlistHit: false,
    },
    props,
  ) as ListEntitiesSearchRequest;
export const getListEntry = (props: Partial<ListEntry>) =>
  merge(
    {
      actor: 'footprint',
      createdAt: '1899-01-11T03:31:49.0Z',
      data: 'laborum sint eiusmod',
      id: '251759f0-a087-45bb-80be-1398a86fbad6',
    },
    props,
  ) as ListEntry;
export const getLivenessEvent = (props: Partial<LivenessEvent>) =>
  merge(
    {
      attributes: {
        device: 'anim',
        issuers: ['google', 'apple', 'cloudflare'],
        os: 'aute quis',
      },
      insightEvent: {
        city: 'Fort Niafort',
        country: 'Libyan Arab Jamahiriya',
        ipAddress: '57712 Beer Summit Apt. 813',
        latitude: -22186259.96473609,
        longitude: -42367834.531808324,
        metroCode: 'irure',
        postalCode: 'laborum dolore tempor adipisicing occaecat',
        region: 'consectetur cupidatat in',
        regionName: 'Dr. Jerome Watsica',
        sessionId: '22276806-369b-4bed-abe4-c29cb88ba880',
        timeZone: 'cupidatat voluptate velit laborum enim',
        timestamp: '1918-10-14T11:10:49.0Z',
        userAgent: 'dolor',
      },
      source: 'skipped',
    },
    props,
  ) as LivenessEvent;
export const getMultiUpdateRuleRequest = (props: Partial<MultiUpdateRuleRequest>) =>
  merge(
    {
      add: [
        {
          isShadow: true,
          name: 'Ms. Carmen Ortiz',
          ruleAction: 'ex',
          ruleExpression: ['pariatur amet qui', 'sit', 'mollit in in'],
        },
        {
          isShadow: true,
          name: 'Ms. Carmen Ortiz',
          ruleAction: 'irure esse fugiat ipsum voluptate',
          ruleExpression: ['dolor', 'eu', 'dolore irure cillum'],
        },
        {
          isShadow: true,
          name: 'Noah Harber',
          ruleAction: 'incididunt dolor',
          ruleExpression: ['ut', 'cillum occaecat adipisicing', 'dolore'],
        },
      ],
      delete: ['ea', 'nisi', 'labore voluptate proident enim dolore'],
      edit: [
        {
          ruleExpression: ['et commodo eiusmod anim do', 'Ut Lorem dolor dolor', 'dolore'],
          ruleId: '7d02ea10-40ea-433c-9057-0eb4fbcc99a7',
        },
        {
          ruleExpression: ['anim commodo Lorem laboris', 'Excepteur eiusmod amet', 'deserunt commodo ad culpa'],
          ruleId: '52dfb7e5-dc2e-4dd3-be38-b3ff9d956858',
        },
        {
          ruleExpression: ['consequat nostrud', 'in sed dolore', 'ut id'],
          ruleId: '52dfb7e5-dc2e-4dd3-be38-b3ff9d956858',
        },
      ],
      expectedRuleSetVersion: 59357300,
    },
    props,
  ) as MultiUpdateRuleRequest;
export const getOffsetPaginatedEntityOnboarding = (props: Partial<OffsetPaginatedEntityOnboarding>) =>
  merge(
    {
      data: [
        {
          id: '6e2cbbd5-fcad-4b2f-9b77-073fc75ea309',
          playbookKey: 'b2856c4a-ff5b-4be5-a370-1b2afb67fd54',
          ruleSetResults: [
            {
              id: '3023908c-03b2-4599-9b40-0eb88ff32b66',
              timestamp: '1892-09-05T01:36:55.0Z',
            },
            {
              id: '3023908c-03b2-4599-9b40-0eb88ff32b66',
              timestamp: '1891-10-18T02:32:19.0Z',
            },
            {
              id: '3023908c-03b2-4599-9b40-0eb88ff32b66',
              timestamp: '1903-11-22T06:35:25.0Z',
            },
          ],
          seqno: -18412475,
          status: 'incomplete',
          timestamp: '1894-10-20T10:56:51.0Z',
        },
        {
          id: '6e2cbbd5-fcad-4b2f-9b77-073fc75ea309',
          playbookKey: 'b2856c4a-ff5b-4be5-a370-1b2afb67fd54',
          ruleSetResults: [
            {
              id: '3023908c-03b2-4599-9b40-0eb88ff32b66',
              timestamp: '1942-02-27T08:12:16.0Z',
            },
            {
              id: '3023908c-03b2-4599-9b40-0eb88ff32b66',
              timestamp: '1918-04-11T01:16:17.0Z',
            },
            {
              id: '3023908c-03b2-4599-9b40-0eb88ff32b66',
              timestamp: '1950-05-26T07:17:18.0Z',
            },
          ],
          seqno: 77878530,
          status: 'none',
          timestamp: '1961-08-08T14:48:23.0Z',
        },
        {
          id: '6e2cbbd5-fcad-4b2f-9b77-073fc75ea309',
          playbookKey: 'b2856c4a-ff5b-4be5-a370-1b2afb67fd54',
          ruleSetResults: [
            {
              id: '3023908c-03b2-4599-9b40-0eb88ff32b66',
              timestamp: '1937-12-13T09:39:27.0Z',
            },
            {
              id: '3023908c-03b2-4599-9b40-0eb88ff32b66',
              timestamp: '1923-07-26T15:29:57.0Z',
            },
            {
              id: '3023908c-03b2-4599-9b40-0eb88ff32b66',
              timestamp: '1914-07-06T08:03:34.0Z',
            },
          ],
          seqno: 22033863,
          status: 'pass',
          timestamp: '1906-02-03T08:22:14.0Z',
        },
      ],
      meta: {
        nextPage: 62770087,
      },
    },
    props,
  ) as OffsetPaginatedEntityOnboarding;
export const getOffsetPaginatedList = (props: Partial<OffsetPaginatedList>) =>
  merge(
    {
      data: [
        {
          actor: 'footprint',
          alias: 'esse',
          createdAt: '1914-07-16T02:12:12.0Z',
          entriesCount: 41067626,
          id: '8548fcb6-6afd-4767-b50f-f8fd20a809f2',
          kind: 'ssn9',
          name: 'Maryann Casper',
          usedInPlaybook: true,
        },
        {
          actor: 'footprint',
          alias: 'proident reprehenderit nostrud id mollit',
          createdAt: '1946-07-20T07:36:45.0Z',
          entriesCount: -45999531,
          id: '8548fcb6-6afd-4767-b50f-f8fd20a809f2',
          kind: 'email_domain',
          name: 'Maryann Casper',
          usedInPlaybook: false,
        },
        {
          actor: 'footprint',
          alias: 'eiusmod et commodo',
          createdAt: '1897-01-29T01:42:58.0Z',
          entriesCount: -95258390,
          id: 'b069c147-9580-4b07-a711-2f7cdddffd5b',
          kind: 'phone_number',
          name: 'Lynn Boehm',
          usedInPlaybook: true,
        },
      ],
      meta: {
        count: -90157771,
        nextPage: 90111575,
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
          allowUsResidents: true,
          allowUsTerritoryResidents: true,
          author: 'footprint',
          businessDocumentsToCollect: ['ipsum eiusmod aliquip', 'anim sit', 'cillum elit'],
          canAccessData: ['Email', 'Email', 'BusinessBeneficialOwners'],
          cipKind: 'alpaca',
          createdAt: '1955-01-06T17:08:19.0Z',
          curpValidationEnabled: true,
          docScanForOptionalSsn: 'BusinessBeneficialOwners',
          documentTypesAndCountries: {
            global: ['passport_card', 'id_card', 'passport_card'],
          },
          documentsToCollect: ['consectetur', 'amet Ut ipsum non est', 'Excepteur tempor Duis ea exercitation'],
          enhancedAml: {
            adverseMedia: false,
            enhancedAml: false,
            matchKind: 'exact_name',
            ofac: false,
            pep: true,
          },
          id: '1921884b-c99d-49fe-a716-d8fc7b709ccf',
          internationalCountryRestrictions: ['SD', 'GP', 'BQ'],
          isDocFirstFlow: false,
          isLive: true,
          isNoPhoneFlow: false,
          isRulesEnabled: true,
          key: '82714e1f-71ca-4413-8d18-b9dcee2caa87',
          kind: 'kyb',
          mustCollectData: ['Ssn4', 'InvestorProfile', 'Email'],
          name: 'Patty Spencer',
          optionalData: ['FullAddress', 'Nationality', 'BusinessTin'],
          promptForPasskey: true,
          requiredAuthMethods: ['phone', 'email', 'email'],
          ruleSet: {
            version: -45804115,
          },
          skipConfirm: true,
          skipKyb: true,
          skipKyc: false,
          status: 'enabled',
          verificationChecks: ['reprehenderit elit', 'eiusmod dolor et', 'dolore'],
        },
        {
          allowInternationalResidents: false,
          allowReonboard: true,
          allowUsResidents: true,
          allowUsTerritoryResidents: false,
          author: 'firm_employee',
          businessDocumentsToCollect: ['nulla aliqua sunt dolor enim', 'sit esse elit', 'nostrud non laborum Lorem eu'],
          canAccessData: ['UsTaxId', 'Nationality', 'Ssn9'],
          cipKind: 'alpaca',
          createdAt: '1922-03-27T09:55:11.0Z',
          curpValidationEnabled: false,
          docScanForOptionalSsn: 'InvestorProfile',
          documentTypesAndCountries: {
            global: ['passport', 'drivers_license', 'drivers_license'],
          },
          documentsToCollect: ['dolore', 'occaecat pariatur ad esse', 'irure enim amet in'],
          enhancedAml: {
            adverseMedia: false,
            enhancedAml: true,
            matchKind: 'exact_name',
            ofac: true,
            pep: false,
          },
          id: '1921884b-c99d-49fe-a716-d8fc7b709ccf',
          internationalCountryRestrictions: ['PW', 'RO', 'SO'],
          isDocFirstFlow: true,
          isLive: true,
          isNoPhoneFlow: true,
          isRulesEnabled: false,
          key: '82714e1f-71ca-4413-8d18-b9dcee2caa87',
          kind: 'kyc',
          mustCollectData: ['BusinessCorporationType', 'BusinessCorporationType', 'Email'],
          name: 'Patty Spencer',
          optionalData: ['BusinessBeneficialOwners', 'BusinessKycedBeneficialOwners', 'BusinessName'],
          promptForPasskey: false,
          requiredAuthMethods: ['email', 'phone', 'email'],
          ruleSet: {
            version: 50649452,
          },
          skipConfirm: true,
          skipKyb: true,
          skipKyc: false,
          status: 'disabled',
          verificationChecks: ['amet et dolor cupidatat proident', 'veniam sunt occaecat dolor dolor', 'occaecat'],
        },
        {
          allowInternationalResidents: true,
          allowReonboard: false,
          allowUsResidents: true,
          allowUsTerritoryResidents: false,
          author: 'firm_employee',
          businessDocumentsToCollect: ['ea cillum aliquip', 'minim', 'esse dolor'],
          canAccessData: ['BusinessBeneficialOwners', 'BusinessWebsite', 'Nationality'],
          cipKind: 'apex',
          createdAt: '1916-02-04T12:17:24.0Z',
          curpValidationEnabled: true,
          docScanForOptionalSsn: 'PhoneNumber',
          documentTypesAndCountries: {
            global: ['residence_document', 'passport_card', 'visa'],
          },
          documentsToCollect: [
            'est dolor tempor enim',
            'labore ut aute et ad',
            'dolor elit adipisicing laboris reprehenderit',
          ],
          enhancedAml: {
            adverseMedia: false,
            enhancedAml: false,
            matchKind: 'fuzzy_high',
            ofac: true,
            pep: true,
          },
          id: '1921884b-c99d-49fe-a716-d8fc7b709ccf',
          internationalCountryRestrictions: ['GG', 'HK', 'BF'],
          isDocFirstFlow: true,
          isLive: false,
          isNoPhoneFlow: false,
          isRulesEnabled: true,
          key: '82714e1f-71ca-4413-8d18-b9dcee2caa87',
          kind: 'kyb',
          mustCollectData: ['BusinessKycedBeneficialOwners', 'UsLegalStatus', 'BusinessAddress'],
          name: 'Patty Spencer',
          optionalData: ['Nationality', 'UsLegalStatus', 'BusinessCorporationType'],
          promptForPasskey: true,
          requiredAuthMethods: ['email', 'phone', 'passkey'],
          ruleSet: {
            version: 27602704,
          },
          skipConfirm: true,
          skipKyb: false,
          skipKyc: true,
          status: 'disabled',
          verificationChecks: ['sint occaecat anim', 'in enim nostrud Lorem amet', 'laborum'],
        },
      ],
      meta: {
        count: -27115074,
        nextPage: -1476989,
      },
    },
    props,
  ) as OffsetPaginatedOnboardingConfiguration;
export const getOffsetPaginatedOrganizationMember = (props: Partial<OffsetPaginatedOrganizationMember>) =>
  merge(
    {
      data: [
        {
          createdAt: '1901-03-31T07:45:44.0Z',
          email: 'johathan.hayes@gmail.com',
          firstName: 'Jarrod',
          id: '9a3dda76-95ef-43ea-9bd5-63603fa6ee2a',
          isFirmEmployee: true,
          lastName: 'Goodwin',
          role: {
            createdAt: '1956-03-15T02:25:30.0Z',
            id: '6df0f2f9-e156-4960-8a05-027a44c56091',
            isImmutable: true,
            kind: 'ApiKey',
            name: 'Jo DuBuque',
            numActiveApiKeys: -80825066,
            numActiveUsers: -65273747,
            scopes: ['compliance_partner_read', 'compliance_partner_admin', 'decrypt_all'],
          },
          rolebinding: {
            lastLoginAt: '1961-12-21T17:05:11.0Z',
          },
        },
        {
          createdAt: '1967-01-15T01:08:05.0Z',
          email: 'laverna31@gmail.com',
          firstName: 'Lyric',
          id: '0ec49157-3f73-4570-a9be-7b5c8697ffae',
          isFirmEmployee: false,
          lastName: 'Schultz',
          role: {
            createdAt: '1904-10-11T13:35:52.0Z',
            id: 'ae7137ea-1cd1-432d-9c4a-4ed1cb017c8e',
            isImmutable: true,
            kind: 'CompliancePartnerDashboardUser',
            name: 'Myra Koch',
            numActiveApiKeys: -17302864,
            numActiveUsers: 23626782,
            scopes: ['manage_compliance_doc_submission', 'manage_webhooks', 'api_keys'],
          },
          rolebinding: {
            lastLoginAt: '1899-12-04T16:46:29.0Z',
          },
        },
        {
          createdAt: '1914-04-28T16:18:26.0Z',
          email: 'laverna31@gmail.com',
          firstName: 'Lyric',
          id: '0ec49157-3f73-4570-a9be-7b5c8697ffae',
          isFirmEmployee: true,
          lastName: 'Schultz',
          role: {
            createdAt: '1955-11-13T23:59:13.0Z',
            id: 'ae7137ea-1cd1-432d-9c4a-4ed1cb017c8e',
            isImmutable: false,
            kind: 'DashboardUser',
            name: 'Myra Koch',
            numActiveApiKeys: -54046514,
            numActiveUsers: -31576397,
            scopes: ['compliance_partner_admin', 'decrypt_document', 'decrypt_document_and_selfie'],
          },
          rolebinding: {
            lastLoginAt: '1963-05-04T10:58:11.0Z',
          },
        },
      ],
      meta: {
        count: 39512271,
        nextPage: -91962876,
      },
    },
    props,
  ) as OffsetPaginatedOrganizationMember;
export const getOffsetPaginatedOrganizationRole = (props: Partial<OffsetPaginatedOrganizationRole>) =>
  merge(
    {
      data: [
        {
          createdAt: '1891-10-15T09:33:03.0Z',
          id: 'ae62970b-f116-4347-a61c-1a8d4da04a08',
          isImmutable: false,
          kind: 'CompliancePartnerDashboardUser',
          name: 'Katherine Gulgowski',
          numActiveApiKeys: -57018981,
          numActiveUsers: -72182402,
          scopes: ['org_settings', 'trigger_kyc', 'compliance_partner_admin'],
        },
        {
          createdAt: '1956-05-22T07:47:21.0Z',
          id: 'ae62970b-f116-4347-a61c-1a8d4da04a08',
          isImmutable: true,
          kind: 'ApiKey',
          name: 'Katherine Gulgowski',
          numActiveApiKeys: 95723591,
          numActiveUsers: -87548789,
          scopes: ['write_lists', 'decrypt_all_except_pci_data', 'onboarding'],
        },
        {
          createdAt: '1942-06-30T19:50:48.0Z',
          id: 'ae62970b-f116-4347-a61c-1a8d4da04a08',
          isImmutable: false,
          kind: 'CompliancePartnerDashboardUser',
          name: 'Katherine Gulgowski',
          numActiveApiKeys: 96595437,
          numActiveUsers: 70963667,
          scopes: ['org_settings', 'decrypt_all', 'label_and_tag'],
        },
      ],
      meta: {
        count: -92332918,
        nextPage: -2794980,
      },
    },
    props,
  ) as OffsetPaginatedOrganizationRole;
export const getOffsetPaginatedSecretApiKey = (props: Partial<OffsetPaginatedSecretApiKey>) =>
  merge(
    {
      data: [
        {
          createdAt: '1916-11-20T02:28:14.0Z',
          id: '8bcf77ae-2eed-45b9-830b-214d75d73870',
          isLive: false,
          key: '24328626-66f3-4426-99e7-e0245038e8e4',
          lastUsedAt: '1904-08-02T12:48:05.0Z',
          name: 'Edwin Luettgen',
          role: {
            createdAt: '1925-08-10T21:29:20.0Z',
            id: 'd28c7661-376b-4df7-a95e-f4aac838eb74',
            isImmutable: false,
            kind: 'CompliancePartnerDashboardUser',
            name: 'Alexander West',
            numActiveApiKeys: -12245898,
            numActiveUsers: 73490987,
            scopes: ['trigger_kyb', 'manage_compliance_doc_submission', 'compliance_partner_read'],
          },
          scrubbedKey: '74af22b5-b555-48c8-886c-76a19255751a',
          status: 'disabled',
        },
        {
          createdAt: '1956-11-20T11:36:45.0Z',
          id: '8bcf77ae-2eed-45b9-830b-214d75d73870',
          isLive: false,
          key: '24328626-66f3-4426-99e7-e0245038e8e4',
          lastUsedAt: '1968-01-19T12:35:51.0Z',
          name: 'Edwin Luettgen',
          role: {
            createdAt: '1951-03-11T15:17:34.0Z',
            id: 'd28c7661-376b-4df7-a95e-f4aac838eb74',
            isImmutable: true,
            kind: 'DashboardUser',
            name: 'Alexander West',
            numActiveApiKeys: 67653516,
            numActiveUsers: -68738226,
            scopes: ['admin', 'write_entities', 'compliance_partner_admin'],
          },
          scrubbedKey: '74af22b5-b555-48c8-886c-76a19255751a',
          status: 'enabled',
        },
        {
          createdAt: '1959-11-09T05:45:41.0Z',
          id: '030018be-236c-4299-97a3-4ce29b6f625b',
          isLive: true,
          key: 'bc3ec628-27cf-4eab-9875-0413194ad1ec',
          lastUsedAt: '1913-04-16T03:49:32.0Z',
          name: 'Patti Stokes',
          role: {
            createdAt: '1956-07-22T10:13:02.0Z',
            id: '05dac96b-20a0-4413-acda-de8b77b66980',
            isImmutable: false,
            kind: 'DashboardUser',
            name: 'Jorge Goyette',
            numActiveApiKeys: 45244568,
            numActiveUsers: 97225312,
            scopes: ['trigger_kyb', 'manual_review', 'auth_token'],
          },
          scrubbedKey: '3bad756a-2316-482e-a6c0-96650b078485',
          status: 'disabled',
        },
      ],
      meta: {
        count: 39755126,
        nextPage: 55327404,
      },
    },
    props,
  ) as OffsetPaginatedSecretApiKey;
export const getOnboardingConfiguration = (props: Partial<OnboardingConfiguration>) =>
  merge(
    {
      allowInternationalResidents: false,
      allowReonboard: true,
      allowUsResidents: false,
      allowUsTerritoryResidents: false,
      author: 'footprint',
      businessDocumentsToCollect: ['nisi eu eiusmod in id', 'in eiusmod reprehenderit sit adipisicing', 'sunt'],
      canAccessData: ['BusinessName', 'BusinessKycedBeneficialOwners', 'BusinessAddress'],
      cipKind: 'alpaca',
      createdAt: '1941-09-12T05:42:02.0Z',
      curpValidationEnabled: false,
      docScanForOptionalSsn: 'PhoneNumber',
      documentTypesAndCountries: {
        countrySpecific: {},
        global: ['passport_card', 'permit', 'voter_identification'],
      },
      documentsToCollect: ['id in minim', 'deserunt ea enim in', 'ut laboris tempor cillum ut'],
      enhancedAml: {
        adverseMedia: true,
        enhancedAml: false,
        matchKind: 'fuzzy_low',
        ofac: true,
        pep: true,
      },
      id: '4b3ab0ad-8894-4c89-be15-f63208c9d8a7',
      internationalCountryRestrictions: ['ZW', 'GI', 'MO'],
      isDocFirstFlow: true,
      isLive: true,
      isNoPhoneFlow: false,
      isRulesEnabled: true,
      key: 'ac2023c6-8d50-454a-b72b-f7bb5bea6cbf',
      kind: 'auth',
      mustCollectData: ['FullAddress', 'Ssn9', 'Card'],
      name: 'Dave Gerlach',
      optionalData: ['Nationality', 'Name', 'PhoneNumber'],
      promptForPasskey: true,
      requiredAuthMethods: ['phone', 'passkey', 'passkey'],
      ruleSet: {
        version: -14699300,
      },
      skipConfirm: false,
      skipKyb: false,
      skipKyc: false,
      status: 'enabled',
      verificationChecks: ['eiusmod ut', 'nisi Lorem', 'laboris ex'],
    },
    props,
  ) as OnboardingConfiguration;
export const getOrgClientSecurityConfig = (props: Partial<OrgClientSecurityConfig>) =>
  merge(
    {
      allowedOrigins: ['ut culpa ea eiusmod ipsum', 'pariatur cupidatat esse exercitation nostrud', 'veniam sed et'],
      isLive: false,
    },
    props,
  ) as OrgClientSecurityConfig;
export const getOrgFrequentNote = (props: Partial<OrgFrequentNote>) =>
  merge(
    {
      content: 'occaecat ut minim sed Excepteur',
      id: '040ecff3-a97a-494e-ae93-d1b6376fa8ef',
      kind: 'manual_review',
    },
    props,
  ) as OrgFrequentNote;
export const getOrgLoginResponse = (props: Partial<OrgLoginResponse>) =>
  merge(
    {
      authToken: 'ffbb1c21-2f3f-452d-b4a2-9efa4ba30c74',
      createdNewTenant: false,
      isFirstLogin: true,
      isMissingRequestedOrg: false,
      partnerTenant: {
        allowDomainAccess: true,
        domains: ['et', 'adipisicing', 'do nulla deserunt'],
        id: '65701f52-ecbd-4cd5-9f7c-c2ee27c5d05b',
        isAuthMethodSupported: true,
        isDomainAlreadyClaimed: true,
        logoUrl: 'https://focused-saloon.com',
        name: 'Dr. Louise Flatley',
        websiteUrl: 'https://weekly-vista.net',
      },
      requiresOnboarding: false,
      tenant: {
        allowDomainAccess: true,
        allowedPreviewApis: ['client_vaulting_docs', 'onboardings_list', 'tags'],
        companySize: 's1001_plus',
        domains: ['dolor voluptate culpa', 'ex mollit labore in', 'fugiat'],
        id: 'ce6d5bc6-9f1e-4e4b-94d7-6fd82041d9fe',
        isAuthMethodSupported: false,
        isDomainAlreadyClaimed: true,
        isProdAuthPlaybookRestricted: true,
        isProdKybPlaybookRestricted: false,
        isProdKycPlaybookRestricted: true,
        isProdNeuroEnabled: true,
        isProdSentilinkEnabled: true,
        isSandboxRestricted: false,
        logoUrl: 'https://some-thyme.com',
        name: 'Nicole Connelly',
        parent: {
          id: 'b8ab461b-8079-4198-9262-7fb991dfa7e6',
          name: 'Rose Pagac',
        },
        supportEmail: 'jo2@gmail.com',
        supportPhone: '+16712410391',
        supportWebsite: 'https://comfortable-creature.org/',
        websiteUrl: 'https://stunning-runway.info/',
      },
      user: {
        createdAt: '1922-09-28T19:43:48.0Z',
        email: 'elinor84@gmail.com',
        firstName: 'Lilliana',
        id: '8bd28f98-f684-4290-abce-9f55dfa17019',
        isFirmEmployee: true,
        lastName: 'Wilderman',
        role: {
          createdAt: '1953-10-29T23:13:50.0Z',
          id: 'f4e1a426-dfd8-4bd1-8d05-7638e07ebfe5',
          isImmutable: false,
          kind: 'ApiKey',
          name: 'Jan Osinski-Schiller II',
          numActiveApiKeys: 34905455,
          numActiveUsers: -19690042,
          scopes: ['decrypt_all', 'admin', 'auth_token'],
        },
        rolebinding: {
          lastLoginAt: '1939-09-28T16:58:01.0Z',
        },
      },
    },
    props,
  ) as OrgLoginResponse;
export const getOrgMetricsResponse = (props: Partial<OrgMetricsResponse>) =>
  merge(
    {
      business: {
        failOnboardings: 84696288,
        incompleteOnboardings: -48340435,
        newVaults: 96107038,
        passOnboardings: -89607127,
        totalOnboardings: -78304603,
      },
      user: {
        failOnboardings: 83137205,
        incompleteOnboardings: -69725926,
        newVaults: 14562282,
        passOnboardings: -92843205,
        totalOnboardings: -76460373,
      },
    },
    props,
  ) as OrgMetricsResponse;
export const getOrgTenantTag = (props: Partial<OrgTenantTag>) =>
  merge(
    {
      id: '580c8802-04a4-4886-a8a4-2c6641f09426',
      kind: 'business',
      tag: 'aute sint',
    },
    props,
  ) as OrgTenantTag;
export const getOrganization = (props: Partial<Organization>) =>
  merge(
    {
      allowDomainAccess: true,
      allowedPreviewApis: ['list_business_owners', 'vault_versioning', 'liveness_list'],
      companySize: 's1001_plus',
      domains: ['eu dolore', 'ut', 'enim ex aute'],
      id: '263b1696-c7e4-4e43-8cbb-57dc8e0c62f4',
      isAuthMethodSupported: true,
      isDomainAlreadyClaimed: false,
      isProdAuthPlaybookRestricted: false,
      isProdKybPlaybookRestricted: false,
      isProdKycPlaybookRestricted: true,
      isProdNeuroEnabled: false,
      isProdSentilinkEnabled: true,
      isSandboxRestricted: false,
      logoUrl: 'https://remorseful-safe.net',
      name: 'Shelly Hickle',
      parent: {
        id: '8a209f81-9d18-4c0e-bde5-c665c96fbd2d',
        name: 'Natasha Ziemann',
      },
      supportEmail: 'jovani_bogan@gmail.com',
      supportPhone: '+19104601280',
      supportWebsite: 'https://strident-manner.name',
      websiteUrl: 'https://black-detective.com',
    },
    props,
  ) as Organization;
export const getOrganizationMember = (props: Partial<OrganizationMember>) =>
  merge(
    {
      createdAt: '1955-03-11T10:15:53.0Z',
      email: 'antone63@gmail.com',
      firstName: 'Hayley',
      id: 'dd064d94-d150-440e-99a7-44bdbca38d15',
      isFirmEmployee: false,
      lastName: 'Kertzmann',
      role: {
        createdAt: '1965-06-19T12:37:48.0Z',
        id: '039736ca-4089-41df-a4ce-ff84585d94df',
        isImmutable: true,
        kind: 'DashboardUser',
        name: 'Georgia Gutkowski',
        numActiveApiKeys: -27811803,
        numActiveUsers: 75809135,
        scopes: ['compliance_partner_manage_reviews', 'label_and_tag', 'manual_review'],
      },
      rolebinding: {
        lastLoginAt: '1923-12-11T11:49:47.0Z',
      },
    },
    props,
  ) as OrganizationMember;
export const getOrganizationRole = (props: Partial<OrganizationRole>) =>
  merge(
    {
      createdAt: '1901-12-29T03:47:25.0Z',
      id: 'b4441211-24e8-416f-b9ed-63cb08eb0dbf',
      isImmutable: true,
      kind: 'ApiKey',
      name: 'Karla Parker',
      numActiveApiKeys: -91541244,
      numActiveUsers: -13068454,
      scopes: ['write_lists', 'decrypt_document_and_selfie', 'compliance_partner_manage_reviews'],
    },
    props,
  ) as OrganizationRole;
export const getPartnerLoginRequest = (props: Partial<PartnerLoginRequest>) =>
  merge(
    {
      code: 'tempor laboris velit dolore sunt',
      requestOrgId: '6bcb6744-5887-4859-bc65-78246aef9964',
    },
    props,
  ) as PartnerLoginRequest;
export const getPartnerOrganization = (props: Partial<PartnerOrganization>) =>
  merge(
    {
      allowDomainAccess: false,
      domains: ['proident non', 'sed deserunt laboris aliquip minim', 'in do elit minim irure'],
      id: '5d2d9d57-b4d7-438f-8613-fa4f77ffa6a5',
      isAuthMethodSupported: true,
      isDomainAlreadyClaimed: false,
      logoUrl: 'https://yearly-cope.info/',
      name: 'Rogelio Littel',
      websiteUrl: 'https://honored-councilman.biz/',
    },
    props,
  ) as PartnerOrganization;
export const getPatchProxyConfigRequest = (props: Partial<PatchProxyConfigRequest>) =>
  merge(
    {
      accessReason: 'nulla',
      addSecretHeaders: [
        {
          name: 'Ms. Claire Gerhold',
          value: 'Duis',
        },
        {
          name: 'Ms. Claire Gerhold',
          value: 'laboris occaecat sint',
        },
        {
          name: 'Ms. Claire Gerhold',
          value: 'dolore dolor',
        },
      ],
      clientIdentity: {
        certificate: 'consectetur sed ad mollit',
        key: 'e48ee164-19b5-4939-a02b-375eab986830',
      },
      deleteSecretHeaders: ['non', 'sit id', 'consequat laborum esse laboris dolore'],
      headers: [
        {
          name: 'Ivan Mante',
          value: 'Lorem',
        },
        {
          name: 'Ivan Mante',
          value: 'id voluptate Duis do',
        },
        {
          name: 'Ivan Mante',
          value: 'qui aliquip et',
        },
      ],
      ingressSettings: {
        contentType: 'json',
        rules: [
          {
            target: 'quis',
            token: 'b8221ce8-71d9-4d1e-9398-ddf4f0c8c9fb',
          },
          {
            target: 'anim pariatur fugiat dolore deserunt',
            token: 'b8221ce8-71d9-4d1e-9398-ddf4f0c8c9fb',
          },
          {
            target: 'culpa Duis non aliquip reprehenderit',
            token: 'b8221ce8-71d9-4d1e-9398-ddf4f0c8c9fb',
          },
        ],
      },
      method: 'nisi aliquip commodo',
      name: 'Stella Feest',
      pinnedServerCertificates: ['in sunt adipisicing voluptate', 'anim', 'anim ad ea'],
      status: 'enabled',
      url: 'https://stunning-nudge.net/',
    },
    props,
  ) as PatchProxyConfigRequest;
export const getPrivateBusinessOwner = (props: Partial<PrivateBusinessOwner>) =>
  merge(
    {
      fpId: '3d6fd0a4-fa08-4431-938e-d4cc2858c04f',
      id: '6be30853-4437-4976-9e4f-822b903fe66e',
      kind: 'Primary',
      name: 'Levi Konopelski',
      ownershipStake: -49821559,
      ownershipStakeDi: 'business.name',
      source: 'Tenant',
      status: 'pass',
    },
    props,
  ) as PrivateBusinessOwner;
export const getPrivateBusinessOwnerKycLink = (props: Partial<PrivateBusinessOwnerKycLink>) =>
  merge(
    {
      id: '8a428328-b0ed-468f-86fb-1a05f64f0790',
      link: 'dolore labore non Duis eu',
      name: 'Dennis Moore',
      token: '43991239-6845-41d3-9c06-64ca8a18ef00',
    },
    props,
  ) as PrivateBusinessOwnerKycLink;
export const getPrivateOwnedBusiness = (props: Partial<PrivateOwnedBusiness>) =>
  merge(
    {
      id: '791e943d-2f78-46ce-9b97-b062490fbc94',
      status: 'pass',
    },
    props,
  ) as PrivateOwnedBusiness;
export const getProxyConfigBasic = (props: Partial<ProxyConfigBasic>) =>
  merge(
    {
      createdAt: '1908-11-02T05:12:45.0Z',
      deactivatedAt: '1894-10-07T01:49:18.0Z',
      id: '68a72851-b423-4c72-a248-c4e37ea076e8',
      isLive: true,
      method: 'velit aliquip Duis mollit',
      name: 'Rufus Hudson',
      status: 'enabled',
      url: 'https://which-bob.info',
    },
    props,
  ) as ProxyConfigBasic;
export const getProxyConfigDetailed = (props: Partial<ProxyConfigDetailed>) =>
  merge(
    {
      accessReason: 'consectetur',
      clientCertificate: 'aliqua',
      createdAt: '1958-06-20T05:33:12.0Z',
      deactivatedAt: '1904-10-08T03:40:06.0Z',
      headers: [
        {
          name: 'Patrick Nolan',
          value: 'non Duis',
        },
        {
          name: 'Patrick Nolan',
          value: 'sed Duis',
        },
        {
          name: 'Patrick Nolan',
          value: 'pariatur sunt id occaecat ea',
        },
      ],
      id: 'f353e0f1-5b25-45d8-a64d-a0e1b88b97aa',
      ingressContentType: 'json',
      ingressRules: [
        {
          target: 'Lorem et in',
          token: '3e59b994-dfd9-41fd-b296-988bbaab3726',
        },
        {
          target: 'ullamco amet quis in labore',
          token: '3e59b994-dfd9-41fd-b296-988bbaab3726',
        },
        {
          target: 'proident ullamco labore do',
          token: 'a72985fe-fbda-486d-9ed8-2024103a0c1f',
        },
      ],
      isLive: true,
      method: 'in eiusmod',
      name: "Tracey O'Keefe",
      pinnedServerCertificates: ['nostrud consequat in cupidatat', 'ex sint', 'tempor'],
      secretHeaders: [
        {
          id: 'e8d3a5f2-24d5-4b4d-9359-f7af3bf20ba0',
          name: 'Mrs. Dawn Rogahn',
        },
        {
          id: 'acda0776-c32a-40c1-8e3e-05dee97130c4',
          name: 'Antonia Bogisich',
        },
        {
          id: 'acda0776-c32a-40c1-8e3e-05dee97130c4',
          name: 'Antonia Bogisich',
        },
      ],
      status: 'disabled',
      url: 'https://failing-gymnast.us',
    },
    props,
  ) as ProxyConfigDetailed;
export const getRawUserDataRequest = (props: Partial<RawUserDataRequest>) =>
  merge(
    {
      key: '7dcf5610-3dd8-4323-9e34-ffd22c2a00cc',
      value: {},
    },
    props,
  ) as RawUserDataRequest;
export const getReuploadComplianceDocRequest = (props: Partial<ReuploadComplianceDocRequest>) =>
  merge(
    {
      description: 'dolore',
      name: 'Dan Kuvalis',
    },
    props,
  ) as ReuploadComplianceDocRequest;
export const getRiskSignal = (props: Partial<RiskSignal>) =>
  merge(
    {
      description: 'laborum in',
      group: 'native_device',
      id: '6138f5f6-1e6f-4ab8-afb8-0092fec8fe6e',
      note: 'elit laboris sunt',
      onboardingDecisionId: 'c38d0d63-7eac-471b-95cd-72a086fa29d1',
      reasonCode: 'ip_alert_high_risk_proxy',
      scopes: ['state', 'selfie', 'city'],
      severity: 'high',
      timestamp: '1897-08-12T04:43:31.0Z',
    },
    props,
  ) as RiskSignal;
export const getRiskSignalDetail = (props: Partial<RiskSignalDetail>) =>
  merge(
    {
      description: 'sunt',
      hasAmlHits: false,
      hasSentilinkDetail: true,
      id: '4c1cab76-7e41-4a28-9bbf-b48daf4e6dc6',
      note: 'consectetur laborum',
      onboardingDecisionId: '5387ea82-5139-4f49-a166-f27eb3f1e45e',
      reasonCode: 'document_possible_image_tampering',
      scopes: ['state', 'zip', 'business_tin'],
      severity: 'high',
      timestamp: '1966-06-16T07:25:32.0Z',
    },
    props,
  ) as RiskSignalDetail;
export const getRule = (props: Partial<Rule>) =>
  merge(
    {
      action: 'fail',
      createdAt: '1955-02-28T12:17:26.0Z',
      isShadow: false,
      kind: 'Business',
      name: 'Robin Marquardt',
      ruleAction: 'amet proident',
      ruleExpression: ['esse tempor et', 'velit sit Ut ut', 'dolore exercitation laborum ullamco'],
      ruleId: '9c3d06fb-a530-400e-aa2a-bb7d7d854280',
    },
    props,
  ) as Rule;
export const getRuleEvalResults = (props: Partial<RuleEvalResults>) =>
  merge(
    {
      results: [
        {
          backtestActionTriggered: 'fail',
          currentStatus: 'pass',
          fpId: 'e0040335-83c1-425d-997b-38103c360d25',
          historicalActionTriggered: 'pass_with_manual_review',
        },
        {
          backtestActionTriggered: 'step_up.identity_proof_of_ssn',
          currentStatus: 'fail',
          fpId: 'e0040335-83c1-425d-997b-38103c360d25',
          historicalActionTriggered: 'step_up.proof_of_address',
        },
        {
          backtestActionTriggered: 'step_up.custom',
          currentStatus: 'none',
          fpId: '8b44d72f-6ba7-4b96-9096-3feb4c0793c4',
          historicalActionTriggered: 'step_up.identity_proof_of_ssn_proof_of_address',
        },
      ],
      stats: {
        countByBacktestActionTriggered: {},
        countByHistoricalActionTriggered: {},
        countByHistoricalAndBacktestActionTriggered: {},
        total: -20716526,
      },
    },
    props,
  ) as RuleEvalResults;
export const getRuleSetResult = (props: Partial<RuleSetResult>) =>
  merge(
    {
      actionTriggered: 'step_up.identity_proof_of_ssn_proof_of_address',
      createdAt: '1956-12-22T16:01:10.0Z',
      obConfigurationId: '79d81685-e7d5-44eb-9195-400c2fdd4e89',
      ruleActionTriggered: 'consequat magna nisi ex',
      ruleResults: [
        {
          result: false,
          rule: {
            action: 'step_up.identity',
            createdAt: '1924-01-22T21:31:36.0Z',
            isShadow: true,
            kind: 'Business',
            name: 'Aaron Leffler',
            ruleAction: 'quis et',
            ruleExpression: ['irure commodo nostrud', 'dolore laborum eu Lorem ex', 'pariatur laboris proident'],
            ruleId: 'ae171bd4-4a7c-4456-af05-b49729562482',
          },
        },
        {
          result: false,
          rule: {
            action: 'step_up.identity_proof_of_ssn_proof_of_address',
            createdAt: '1962-03-26T04:22:34.0Z',
            isShadow: false,
            kind: 'Person',
            name: 'Clifford Cartwright',
            ruleAction: 'eiusmod',
            ruleExpression: ['laboris voluptate cillum est', 'consequat reprehenderit enim id voluptate', 'sit'],
            ruleId: '952b36d2-f80f-4135-8eb2-6a9664b04ebe',
          },
        },
        {
          result: false,
          rule: {
            action: 'step_up.identity',
            createdAt: '1891-09-15T16:53:55.0Z',
            isShadow: false,
            kind: 'Person',
            name: 'Clifford Cartwright',
            ruleAction: 'officia',
            ruleExpression: ['est deserunt Ut velit', 'proident', 'sed ad Lorem adipisicing amet'],
            ruleId: '952b36d2-f80f-4135-8eb2-6a9664b04ebe',
          },
        },
      ],
    },
    props,
  ) as RuleSetResult;
export const getSecretApiKey = (props: Partial<SecretApiKey>) =>
  merge(
    {
      createdAt: '1919-06-01T18:59:42.0Z',
      id: 'a63dee7d-43d7-4482-ab12-3316ceee73b8',
      isLive: false,
      key: 'b46b7f05-309c-46bc-9127-a6a0d88db037',
      lastUsedAt: '1968-09-14T19:01:13.0Z',
      name: 'Carlton Hirthe',
      role: {
        createdAt: '1949-10-06T03:01:39.0Z',
        id: 'e34d1391-d4d9-4678-9bcf-46b5e05e3578',
        isImmutable: true,
        kind: 'ApiKey',
        name: 'Kay Windler',
        numActiveApiKeys: 10176328,
        numActiveUsers: 96203873,
        scopes: ['label_and_tag', 'api_keys', 'write_entities'],
      },
      scrubbedKey: 'eafaafd3-ad07-48c2-8b4d-e17de97cce7f',
      status: 'enabled',
    },
    props,
  ) as SecretApiKey;
export const getSentilinkDetail = (props: Partial<SentilinkDetail>) =>
  merge(
    {
      idTheft: {
        reasonCodes: [
          {
            code: 'elit et in',
            direction: 'dolor',
            explanation: 'dolore aliqua',
            rank: -69481716,
          },
          {
            code: 'mollit velit qui',
            direction: 'nulla dolore Excepteur officia',
            explanation: 'non commodo',
            rank: 22507462,
          },
          {
            code: 'in ad dolor',
            direction: 'magna veniam elit sint quis',
            explanation: 'veniam',
            rank: 44072940,
          },
        ],
        score: 80404171,
        scoreBand: 'low',
      },
      synthetic: {
        reasonCodes: [
          {
            code: 'veniam et sed',
            direction: 'ullamco',
            explanation: 'amet laboris',
            rank: 86065332,
          },
          {
            code: 'ex voluptate aute eiusmod nulla',
            direction: 'eiusmod veniam et nisi',
            explanation: 'magna anim proident aliqua',
            rank: -92838039,
          },
          {
            code: 'velit commodo',
            direction: 'deserunt dolore enim',
            explanation: 'exercitation enim',
            rank: -90179937,
          },
        ],
        score: 54721210,
        scoreBand: 'high',
      },
    },
    props,
  ) as SentilinkDetail;
export const getSubmitExternalUrlRequest = (props: Partial<SubmitExternalUrlRequest>) =>
  merge(
    {
      url: 'https://tough-strategy.org/',
    },
    props,
  ) as SubmitExternalUrlRequest;
export const getTenantAndroidAppMeta = (props: Partial<TenantAndroidAppMeta>) =>
  merge(
    {
      apkCertSha256S: ['nulla', 'enim ipsum', 'nisi aliqua'],
      id: '9a8ecf24-2eda-46e6-940f-a7a195220f0c',
      integrityDecryptionKey: '73fd46a7-f898-413b-a3e5-4d586454c0c5',
      integrityVerificationKey: '1fdc5c03-9d4c-4ebe-bec9-f84d537dab4c',
      packageNames: ['labore pariatur anim sint', 'deserunt magna labore in ullamco', 'aute'],
      tenantId: '314e5435-c1f0-4b4a-b85b-e4fe7614cacd',
    },
    props,
  ) as TenantAndroidAppMeta;
export const getTenantIosAppMeta = (props: Partial<TenantIosAppMeta>) =>
  merge(
    {
      appBundleIds: ['sed ex', 'adipisicing pariatur mollit nulla', 'velit aute fugiat officia'],
      deviceCheckKeyId: 'c0996dd7-69d5-40d4-9b2b-fede001c2a3b',
      deviceCheckPrivateKey: '9a96af20-7e79-4baa-9dbb-2d1c7f1dba6c',
      id: '75eac8b5-8b02-4155-a0fa-470bf8227a7f',
      teamId: '21c13167-73f7-4c52-8492-2d4b3517e4ff',
      tenantId: 'fc0e6362-e064-409c-89ae-63642524fbee',
    },
    props,
  ) as TenantIosAppMeta;
export const getTenantLoginRequest = (props: Partial<TenantLoginRequest>) =>
  merge(
    {
      code: 'ut consectetur in Duis',
      requestOrgId: '6cb9989a-2f3b-4238-b83d-07cd6c7f7ad0',
    },
    props,
  ) as TenantLoginRequest;
export const getUpdateAnnotationRequest = (props: Partial<UpdateAnnotationRequest>) =>
  merge(
    {
      isPinned: false,
    },
    props,
  ) as UpdateAnnotationRequest;
export const getUpdateApiKeyRequest = (props: Partial<UpdateApiKeyRequest>) =>
  merge(
    {
      name: 'Mrs. Sherri Lemke',
      roleId: '6c38f937-451f-4750-9c6f-ff75e3da337c',
      status: 'disabled',
    },
    props,
  ) as UpdateApiKeyRequest;
export const getUpdateClientSecurityConfig = (props: Partial<UpdateClientSecurityConfig>) =>
  merge(
    {
      allowedOrigins: ['veniam culpa Lorem consectetur', 'in', 'nostrud ex velit'],
    },
    props,
  ) as UpdateClientSecurityConfig;
export const getUpdateComplianceDocAssignmentRequest = (props: Partial<UpdateComplianceDocAssignmentRequest>) =>
  merge(
    {
      userId: 'f15f8ebf-055e-42fe-a326-784286f49e48',
    },
    props,
  ) as UpdateComplianceDocAssignmentRequest;
export const getUpdateComplianceDocTemplateRequest = (props: Partial<UpdateComplianceDocTemplateRequest>) =>
  merge(
    {
      description: 'anim sed ex ea',
      name: 'Mrs. Madeline Stark-Rohan V',
    },
    props,
  ) as UpdateComplianceDocTemplateRequest;
export const getUpdateLabelRequest = (props: Partial<UpdateLabelRequest>) =>
  merge(
    {
      kind: 'offboard_fraud',
    },
    props,
  ) as UpdateLabelRequest;
export const getUpdateListRequest = (props: Partial<UpdateListRequest>) =>
  merge(
    {
      alias: 'in consectetur deserunt ut sit',
      name: 'Clara Bogisich',
    },
    props,
  ) as UpdateListRequest;
export const getUpdateObConfigRequest = (props: Partial<UpdateObConfigRequest>) =>
  merge(
    {
      allowReonboard: false,
      name: 'Mr. Kent Hirthe',
      promptForPasskey: true,
      skipConfirm: false,
      status: 'disabled',
    },
    props,
  ) as UpdateObConfigRequest;
export const getUpdatePartnerTenantRequest = (props: Partial<UpdatePartnerTenantRequest>) =>
  merge(
    {
      allowDomainAccess: false,
      name: 'Bobby Dicki',
      websiteUrl: 'https://unimportant-cop-out.biz',
    },
    props,
  ) as UpdatePartnerTenantRequest;
export const getUpdateTenantAndroidAppMetaRequest = (props: Partial<UpdateTenantAndroidAppMetaRequest>) =>
  merge(
    {
      apkCertSha256S: ['officia sint est tempor', 'pariatur voluptate ipsum est aliquip', 'do'],
      integrityDecryptionKey: '113953d2-77eb-4519-9bfe-27fbafd0d25b',
      integrityVerificationKey: '8463b823-9f27-402a-8ed8-81ae4c9da0e0',
      packageNames: ['dolore esse in', 'in adipisicing aliquip', 'esse sunt'],
    },
    props,
  ) as UpdateTenantAndroidAppMetaRequest;
export const getUpdateTenantIosAppMetaRequest = (props: Partial<UpdateTenantIosAppMetaRequest>) =>
  merge(
    {
      appBundleIds: ['dolor in', 'dolore irure cillum laborum aliqua', 'ut et'],
      deviceCheckKeyId: '6316adb4-27b2-44dc-8a46-5d7c0d75a95f',
      deviceCheckPrivateKey: '2c4952ff-1a3f-4e46-b3ce-e85844b0c91f',
      teamId: '48cee401-4e96-4678-88c8-85dfb5052472',
    },
    props,
  ) as UpdateTenantIosAppMetaRequest;
export const getUpdateTenantRequest = (props: Partial<UpdateTenantRequest>) =>
  merge(
    {
      allowDomainAccess: true,
      clearSupportEmail: true,
      clearSupportPhone: true,
      clearSupportWebsite: true,
      companySize: 's1001_plus',
      name: 'Clarence Pouros',
      privacyPolicyUrl: 'https://secret-deployment.info',
      supportEmail: 'yvonne71@gmail.com',
      supportPhone: '+19222252388',
      supportWebsite: 'https://key-shadowbox.info',
      websiteUrl: 'https://shy-hydrant.org/',
    },
    props,
  ) as UpdateTenantRequest;
export const getUpdateTenantRoleRequest = (props: Partial<UpdateTenantRoleRequest>) =>
  merge(
    {
      name: "Norma O'Reilly",
      scopes: ['compliance_partner_read', 'decrypt_all_except_pci_data', 'label_and_tag'],
    },
    props,
  ) as UpdateTenantRoleRequest;
export const getUpdateTenantRolebindingRequest = (props: Partial<UpdateTenantRolebindingRequest>) =>
  merge(
    {
      roleId: '84b8ed93-0db5-4191-94c9-4fe01a806ac5',
    },
    props,
  ) as UpdateTenantRolebindingRequest;
export const getUpdateTenantUserRequest = (props: Partial<UpdateTenantUserRequest>) =>
  merge(
    {
      firstName: 'Barrett',
      lastName: 'Orn',
    },
    props,
  ) as UpdateTenantUserRequest;
export const getUserAiSummary = (props: Partial<UserAiSummary>) =>
  merge(
    {
      conclusion: 'occaecat',
      detailedSummary: 'consectetur ut est',
      highLevelSummary: 'cillum laboris',
      riskSignalSummary: 'pariatur reprehenderit cupidatat laborum',
    },
    props,
  ) as UserAiSummary;
export const getUserDecryptRequest = (props: Partial<UserDecryptRequest>) =>
  merge(
    {
      fields: ['document.id_card.nationality', 'document.passport_card.clave_de_elector', 'id.email'],
      reason: 'ipsum exercitation',
      transforms: ["replace('<from>','<to>')", 'prefix(<n>)', 'suffix(<n>)'],
      versionAt: '1892-02-14T01:23:31.0Z',
    },
    props,
  ) as UserDecryptRequest;
export const getUserDecryptResponse = (props: Partial<UserDecryptResponse>) =>
  merge(
    {
      key: '5c1176e3-b801-42c4-b6d4-730e77af2e81',
      value: {},
    },
    props,
  ) as UserDecryptResponse;
export const getUserDeleteResponse = (props: Partial<UserDeleteResponse>) =>
  merge(
    {
      key: 'acfdd12a-0622-432d-9382-10690d3a69e9',
      value: true,
    },
    props,
  ) as UserDeleteResponse;
export const getUserInsight = (props: Partial<UserInsight>) =>
  merge(
    {
      description: 'Duis Ut',
      name: 'Marvin Monahan',
      scope: 'Workflow',
      unit: 'DurationMs',
      value: 'amet enim proident dolor non',
    },
    props,
  ) as UserInsight;
export const getUserLabel = (props: Partial<UserLabel>) =>
  merge(
    {
      createdAt: '1949-04-29T15:52:03.0Z',
      kind: 'active',
    },
    props,
  ) as UserLabel;
export const getUserTag = (props: Partial<UserTag>) =>
  merge(
    {
      createdAt: '1964-09-03T22:33:16.0Z',
      id: 'f9c9aeca-b103-44ad-8bd3-d8ba6b90fae8',
      tag: 'esse tempor ad',
    },
    props,
  ) as UserTag;
export const getUserTimeline = (props: Partial<UserTimeline>) =>
  merge(
    {
      event: 'consectetur culpa',
      seqno: 2498105,
      timestamp: '1897-04-05T05:06:50.0Z',
    },
    props,
  ) as UserTimeline;
export const getVaultDrAwsPreEnrollResponse = (props: Partial<VaultDrAwsPreEnrollResponse>) =>
  merge(
    {
      externalId: 'eba9d45c-cd75-41e6-84b9-5585d5ee2e6a',
    },
    props,
  ) as VaultDrAwsPreEnrollResponse;
export const getVaultDrEnrollRequest = (props: Partial<VaultDrEnrollRequest>) =>
  merge(
    {
      awsAccountId: 'cde410a2-84e0-4f38-851e-d9165717b0ed',
      awsRoleName: 'Wilbert Frami',
      orgPublicKeys: ['sed dolor nulla ea fugiat', 'ex dolore pariatur', 'consequat cillum voluptate occaecat'],
      reEnroll: false,
      s3BucketName: 'Dexter Casper',
    },
    props,
  ) as VaultDrEnrollRequest;
export const getVaultDrEnrollResponse = (props: Partial<VaultDrEnrollResponse>) =>
  merge({}, props) as VaultDrEnrollResponse;
export const getVaultDrRevealWrappedRecordKeysRequest = (props: Partial<VaultDrRevealWrappedRecordKeysRequest>) =>
  merge(
    {
      recordPaths: ['culpa in ut ad', 'minim deserunt', 'in enim'],
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
        awsAccountId: '2dcd3681-5240-4387-be25-6f17f79f1bd3',
        awsRoleName: 'Earl Powlowski-McKenzie',
        backupLagSeconds: -71298603,
        bucketPathNamespace: 'Katherine Bartell',
        enrolledAt: '1901-06-06T23:03:56.0Z',
        latestBackupRecordTimestamp: '1911-05-13T23:45:59.0Z',
        orgPublicKeys: ['nulla voluptate labore consectetur amet', 'do', 'nulla sunt'],
        s3BucketName: 'Alfonso Mueller',
      },
      isLive: true,
      orgId: '5ad2f5aa-e5e5-4419-8884-7ad44d2edf3e',
      orgName: 'Paulette Davis',
    },
    props,
  ) as VaultDrStatus;
export const getWebhookPortalResponse = (props: Partial<WebhookPortalResponse>) =>
  merge(
    {
      appId: '3372fc76-a739-4520-9689-3b5332c0c46e',
      token: '66cf6c1e-79b6-4c64-97af-595e0856ccbd',
      url: 'https://athletic-pressure.com/',
    },
    props,
  ) as WebhookPortalResponse;
