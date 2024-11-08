import type {
  ActionKind,
  ApiKeyStatus,
  ApiOnboardingRequirement,
  AuthMethod,
  AuthMethodKind,
  AuthRequirementsResponse,
  AuthV1Options,
  AuthV1SdkArgs,
  AuthorizedOrg,
  BatchHostedBusinessOwnerRequest,
  BusinessDecryptResponse,
  BusinessOnboardingResponse,
  ChallengeKind,
  CheckSessionResponse,
  CollectedDataOption,
  ConsentRequest,
  CountrySpecificDocumentMapping,
  CreateDeviceAttestationRequest,
  CreateDocumentRequest,
  CreateDocumentResponse,
  CreateOnboardingTimelineRequest,
  CreateSdkArgsTokenResponse,
  CreateUserTokenRequest,
  CreateUserTokenResponse,
  CustomDocumentConfig,
  D2pGenerateRequest,
  D2pGenerateResponse,
  D2pSessionStatus,
  D2pSmsRequest,
  D2pSmsResponse,
  D2pStatusResponse,
  D2pUpdateStatusRequest,
  DataIdentifier,
  DeleteHostedBusinessOwnerRequest,
  DeviceAttestationChallengeResponse,
  DeviceAttestationType,
  DeviceType,
  DocumentAndCountryConfiguration,
  DocumentFixtureResult,
  DocumentImageError,
  DocumentKind,
  DocumentRequestConfig,
  DocumentResponse,
  DocumentSide,
  DocumentUploadSettings,
  EmailVerifyRequest,
  Empty,
  FilterFunction,
  FingerprintVisitRequest,
  FormV1Options,
  FormV1SdkArgs,
  GetDeviceAttestationChallengeRequest,
  GetSdkArgsTokenResponse,
  GetUserTokenResponse,
  HandoffMetadata,
  HostedBusiness,
  HostedBusinessDetail,
  HostedBusinessOwner,
  HostedValidateResponse,
  HostedWorkflowRequest,
  IdDocKind,
  IdentifiedUser,
  IdentifyAuthMethod,
  IdentifyChallengeResponse,
  IdentifyId,
  IdentifyRequest,
  IdentifyResponse,
  IdentifyScope,
  IdentifyVerifyRequest,
  IdentifyVerifyResponse,
  Inviter,
  Iso3166TwoDigitCountryCode,
  KbaResponse,
  L10n,
  L10nV1,
  LiteIdentifyRequest,
  LiteIdentifyResponse,
  LogBody,
  LoginChallengeRequest,
  ModernRawBusinessDataRequest,
  ModernRawUserDataRequest,
  ModernUserDecryptResponse,
  NeuroIdentityIdResponse,
  ObConfigurationKind,
  OnboardingResponse,
  OnboardingSessionResponse,
  OnboardingStatusResponse,
  PostBusinessOnboardingRequest,
  PostOnboardingRequest,
  ProcessRequest,
  PublicOnboardingConfiguration,
  RawUserDataRequest,
  RegisterPasskeyAttemptContext,
  RenderV1SdkArgs,
  RequestedTokenScope,
  SdkArgs,
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
  UserDataIdentifier,
  UserDecryptRequest,
  UserDecryptResponse,
  VerifyResultV1SdkArgs,
  VerifyV1Options,
  VerifyV1SdkArgs,
  WorkflowFixtureResult,
  WorkflowRequestConfig,
} from '@onefootprint/request-types';
import merge from 'lodash/merge';

export const getActionKind = (props: Partial<ActionKind>) => (props ?? 'add_primary') as ActionKind;
export const getApiKeyStatus = (props: Partial<ApiKeyStatus>) => (props ?? 'enabled') as ApiKeyStatus;
export const getApiOnboardingRequirement = (props: Partial<ApiOnboardingRequirement>) =>
  merge(
    {
      isMet: true,
    },
    props,
  ) as ApiOnboardingRequirement;
export const getAuthMethod = (props: Partial<AuthMethod>) =>
  merge(
    {
      canUpdate: true,
      isVerified: true,
      kind: 'passkey',
    },
    props,
  ) as AuthMethod;
export const getAuthMethodKind = (props: Partial<AuthMethodKind>) => (props ?? 'phone') as AuthMethodKind;
export const getAuthRequirementsResponse = (props: Partial<AuthRequirementsResponse>) =>
  merge(
    {
      allRequirements: [
        {
          isMet: false,
        },
        {
          isMet: true,
        },
        {
          isMet: true,
        },
      ],
    },
    props,
  ) as AuthRequirementsResponse;
export const getAuthV1Options = (props: Partial<AuthV1Options>) =>
  merge(
    {
      showLogo: true,
    },
    props,
  ) as AuthV1Options;
export const getAuthV1SdkArgs = (props: Partial<AuthV1SdkArgs>) =>
  merge(
    {
      l10N: {
        language: 'en',
        locale: 'en-US',
      },
      options: {
        showLogo: false,
      },
      publicKey: 'cf88fc25-47a2-4d6c-9b7d-723c0655326e',
      userData: {},
    },
    props,
  ) as AuthV1SdkArgs;
export const getAuthorizedOrg = (props: Partial<AuthorizedOrg>) =>
  merge(
    {
      canAccessData: ['nationality', 'investor_profile', 'phone_number'],
      logoUrl: 'https://grumpy-hawk.biz',
      orgName: 'Joseph Kautzer',
    },
    props,
  ) as AuthorizedOrg;
export const getBatchHostedBusinessOwnerRequest = (props: Partial<BatchHostedBusinessOwnerRequest>) =>
  merge(
    {
      data: {
        'id.first_name': 'John',
        'id.last_name': 'Doe',
      },
      op: 'create',
      ownershipStake: 30,
      uuid: '73b7e274-8080-44d6-b160-86cbc9877a00',
    },
    props,
  ) as BatchHostedBusinessOwnerRequest;
export const getBusinessDecryptResponse = (props: Partial<BusinessDecryptResponse>) =>
  merge(
    {
      'business.name': 'Acme Bank',
      'business.website': 'acmebank.org',
    },
    props,
  ) as BusinessDecryptResponse;
export const getBusinessOnboardingResponse = (props: Partial<BusinessOnboardingResponse>) =>
  merge(
    {
      authToken: '9aaa9593-2427-4270-b3cd-c5134af08932',
    },
    props,
  ) as BusinessOnboardingResponse;
export const getChallengeKind = (props: Partial<ChallengeKind>) => (props ?? 'sms') as ChallengeKind;
export const getCheckSessionResponse = (props: Partial<CheckSessionResponse>) =>
  (props ?? 'expired') as CheckSessionResponse;
export const getCollectedDataOption = (props: Partial<CollectedDataOption>) => (props ?? 'dob') as CollectedDataOption;
export const getConsentRequest = (props: Partial<ConsentRequest>) =>
  merge(
    {
      consentLanguageText: 'en',
      mlConsent: true,
    },
    props,
  ) as ConsentRequest;
export const getCountrySpecificDocumentMapping = (props: Partial<CountrySpecificDocumentMapping>) =>
  merge({}, props) as CountrySpecificDocumentMapping;
export const getCreateDeviceAttestationRequest = (props: Partial<CreateDeviceAttestationRequest>) =>
  merge(
    {
      attestation: 'incididunt in proident',
      state: 'New York',
    },
    props,
  ) as CreateDeviceAttestationRequest;
export const getCreateDocumentRequest = (props: Partial<CreateDocumentRequest>) =>
  merge(
    {
      countryCode: 'Mayotte',
      deviceType: 'android',
      documentType: 'custom',
      fixtureResult: 'real',
      requestId: 'd4af5c55-2ab6-4c22-8ae3-630d5c66d114',
      skipSelfie: true,
    },
    props,
  ) as CreateDocumentRequest;
export const getCreateDocumentResponse = (props: Partial<CreateDocumentResponse>) =>
  merge(
    {
      id: '148f847b-c7de-452d-9b30-cba37c7ce7cc',
    },
    props,
  ) as CreateDocumentResponse;
export const getCreateOnboardingTimelineRequest = (props: Partial<CreateOnboardingTimelineRequest>) =>
  merge(
    {
      event: 'in est eiusmod adipisicing dolor',
    },
    props,
  ) as CreateOnboardingTimelineRequest;
export const getCreateSdkArgsTokenResponse = (props: Partial<CreateSdkArgsTokenResponse>) =>
  merge(
    {
      expiresAt: '1957-03-17T05:34:51.0Z',
      token: 'a5f37685-d00a-4238-b1a8-ed26afe1edaa',
    },
    props,
  ) as CreateSdkArgsTokenResponse;
export const getCreateUserTokenRequest = (props: Partial<CreateUserTokenRequest>) =>
  merge(
    {
      requestedScope: 'my1fp',
    },
    props,
  ) as CreateUserTokenRequest;
export const getCreateUserTokenResponse = (props: Partial<CreateUserTokenResponse>) =>
  merge(
    {
      expiresAt: '1962-11-11T20:19:33.0Z',
      token: '54b2fe9a-2393-4739-9827-bcd9eba514da',
    },
    props,
  ) as CreateUserTokenResponse;
export const getCustomDocumentConfig = (props: Partial<CustomDocumentConfig>) =>
  merge(
    {
      description: 'ipsum pariatur mollit',
      identifier: 'e8ec211b-217a-49fe-93ab-e6932e26b3f2',
      name: 'Ken Nitzsche',
      requiresHumanReview: false,
      uploadSettings: 'prefer_capture',
    },
    props,
  ) as CustomDocumentConfig;
export const getD2pGenerateRequest = (props: Partial<D2pGenerateRequest>) =>
  merge(
    {
      meta: {
        l10N: {
          language: 'en',
          locale: 'en-US',
        },
        opener: 'deserunt in',
        redirectUrl: 'https://well-documented-squid.biz/',
        sandboxIdDocOutcome: '2e7236ea-67cd-49f0-a00c-97c79c95baac',
        sessionId: 'd9cd71fa-ee6b-4c8a-90a8-4eec405147d6',
        styleParams: 'non proident',
      },
    },
    props,
  ) as D2pGenerateRequest;
export const getD2pGenerateResponse = (props: Partial<D2pGenerateResponse>) =>
  merge(
    {
      authToken: 'f09a5845-0954-46ac-a419-60f118e9ff6a',
    },
    props,
  ) as D2pGenerateResponse;
export const getD2pSessionStatus = (props: Partial<D2pSessionStatus>) => (props ?? 'waiting') as D2pSessionStatus;
export const getD2pSmsRequest = (props: Partial<D2pSmsRequest>) =>
  merge(
    {
      url: 'https://enchanted-lift.name/',
    },
    props,
  ) as D2pSmsRequest;
export const getD2pSmsResponse = (props: Partial<D2pSmsResponse>) =>
  merge(
    {
      timeBeforeRetryS: 57241023,
    },
    props,
  ) as D2pSmsResponse;
export const getD2pStatusResponse = (props: Partial<D2pStatusResponse>) =>
  merge(
    {
      meta: {
        l10N: {
          language: 'en',
          locale: 'en-US',
        },
        opener: 'voluptate sint est veniam',
        redirectUrl: 'https://accomplished-tail.biz/',
        sandboxIdDocOutcome: 'dd8bac4c-ec91-4b40-b5a3-0bcfca079731',
        sessionId: '55b42d8c-a6ce-42bd-9867-f6eb9d24323b',
        styleParams: 'et cupidatat voluptate magna Lorem',
      },
      status: 'completed',
    },
    props,
  ) as D2pStatusResponse;
export const getD2pUpdateStatusRequest = (props: Partial<D2pUpdateStatusRequest>) =>
  merge(
    {
      status: 'canceled',
    },
    props,
  ) as D2pUpdateStatusRequest;
export const getDataIdentifier = (props: Partial<DataIdentifier>) =>
  (props ?? 'investor_profile.employer') as DataIdentifier;
export const getDeleteHostedBusinessOwnerRequest = (props: Partial<DeleteHostedBusinessOwnerRequest>) =>
  merge(
    {
      op: 'delete',
      uuid: '53440edf-c576-43af-81d9-ee4688d3cefc',
    },
    props,
  ) as DeleteHostedBusinessOwnerRequest;
export const getDeviceAttestationChallengeResponse = (props: Partial<DeviceAttestationChallengeResponse>) =>
  merge(
    {
      attestationChallenge: 'elit eiusmod quis Excepteur pariatur',
      state: 'Oklahoma',
    },
    props,
  ) as DeviceAttestationChallengeResponse;
export const getDeviceAttestationType = (props: Partial<DeviceAttestationType>) =>
  (props ?? 'android') as DeviceAttestationType;
export const getDeviceType = (props: Partial<DeviceType>) => (props ?? 'android') as DeviceType;
export const getDocumentAndCountryConfiguration = (props: Partial<DocumentAndCountryConfiguration>) =>
  merge(
    {
      countrySpecific: {},
      global: ['passport', 'drivers_license', 'voter_identification'],
    },
    props,
  ) as DocumentAndCountryConfiguration;
export const getDocumentFixtureResult = (props: Partial<DocumentFixtureResult>) =>
  (props ?? 'real') as DocumentFixtureResult;
export const getDocumentImageError = (props: Partial<DocumentImageError>) =>
  (props ?? 'selfie_face_not_found') as DocumentImageError;
export const getDocumentKind = (props: Partial<DocumentKind>) => (props ?? 'passport') as DocumentKind;
export const getDocumentRequestConfig = (props: Partial<DocumentRequestConfig>) =>
  merge(
    {
      data: {
        collectSelfie: false,
        documentTypesAndCountries: {
          countrySpecific: {},
          global: ['visa', 'permit', 'visa'],
        },
      },
      kind: 'identity',
    },
    props,
  ) as DocumentRequestConfig;
export const getDocumentResponse = (props: Partial<DocumentResponse>) =>
  merge(
    {
      errors: ['wrong_one_sided_document', 'invalid_jpeg', 'unknown_error'],
      isRetryLimitExceeded: false,
      nextSideToCollect: '9ae2a7a0-9c28-4df9-a485-d5676ddfb02b',
    },
    props,
  ) as DocumentResponse;
export const getDocumentSide = (props: Partial<DocumentSide>) => (props ?? 'back') as DocumentSide;
export const getDocumentUploadSettings = (props: Partial<DocumentUploadSettings>) =>
  (props ?? 'prefer_capture') as DocumentUploadSettings;
export const getEmailVerifyRequest = (props: Partial<EmailVerifyRequest>) =>
  merge(
    {
      data: 'commodo',
    },
    props,
  ) as EmailVerifyRequest;
export const getEmpty = (props: Partial<Empty>) => merge({}, props) as Empty;
export const getFilterFunction = (props: Partial<FilterFunction>) => (props ?? 'suffix(<n>)') as FilterFunction;
export const getFingerprintVisitRequest = (props: Partial<FingerprintVisitRequest>) =>
  merge(
    {
      path: 'velit Lorem',
      requestId: 'e0895b0b-1af9-4b62-80ec-89f9cf8118ab',
      visitorId: '4e399455-b307-449f-a762-bb3457098e4d',
    },
    props,
  ) as FingerprintVisitRequest;
export const getFormV1Options = (props: Partial<FormV1Options>) =>
  merge(
    {
      hideButtons: true,
      hideCancelButton: true,
      hideFootprintLogo: false,
    },
    props,
  ) as FormV1Options;
export const getFormV1SdkArgs = (props: Partial<FormV1SdkArgs>) =>
  merge(
    {
      authToken: 'e6cbefa6-828f-441a-a880-c2913e425328',
      l10N: {
        language: 'en',
        locale: 'en-US',
      },
      options: {
        hideButtons: false,
        hideCancelButton: false,
        hideFootprintLogo: true,
      },
      title: 'pariatur irure ex laboris occaecat',
    },
    props,
  ) as FormV1SdkArgs;
export const getGetDeviceAttestationChallengeRequest = (props: Partial<GetDeviceAttestationChallengeRequest>) =>
  merge(
    {
      androidPackageName: 'Denise Sawayn',
      deviceType: 'android',
      iosBundleId: '2e7c7587-3fc3-49f4-98be-8eddbd86ced6',
    },
    props,
  ) as GetDeviceAttestationChallengeRequest;
export const getGetSdkArgsTokenResponse = (props: Partial<GetSdkArgsTokenResponse>) =>
  merge(
    {
      args: {
        data: {
          authToken: 'a50a4e7d-290e-435d-bd0a-510f284e3450',
          documentFixtureResult: 'fail',
          fixtureResult: 'manual_review',
          isComponentsSdk: true,
          l10N: {
            language: 'en',
            locale: 'en-US',
          },
          options: {
            showCompletionPage: false,
            showLogo: false,
          },
          publicKey: 'a5361a14-6fab-46a3-b11b-5a3b699106a2',
          sandboxId: '10d19097-e160-4e6a-8986-6abefcf9097c',
          shouldRelayToComponents: false,
          userData: {},
        },
        kind: 'verify_v1',
      },
    },
    props,
  ) as GetSdkArgsTokenResponse;
export const getGetUserTokenResponse = (props: Partial<GetUserTokenResponse>) =>
  merge(
    {
      expiresAt: '1890-10-30T21:54:57.0Z',
      scopes: ['sensitive_profile', 'handoff', 'sensitive_profile'],
    },
    props,
  ) as GetUserTokenResponse;
export const getHandoffMetadata = (props: Partial<HandoffMetadata>) =>
  merge(
    {
      l10N: {
        language: 'en',
        locale: 'en-US',
      },
      opener: 'esse est dolor',
      redirectUrl: 'https://jaunty-compromise.com',
      sandboxIdDocOutcome: '624d2a6b-d0b6-42c1-a188-a7d61872bd16',
      sessionId: 'e2fe7bd5-57a3-4930-816d-7e819df13781',
      styleParams: 'culpa',
    },
    props,
  ) as HandoffMetadata;
export const getHostedBusiness = (props: Partial<HostedBusiness>) =>
  merge(
    {
      createdAt: '1907-01-07T20:58:08.0Z',
      id: '0df915d8-6baa-486c-a15b-a0ea433b8c9d',
      isIncomplete: false,
      lastActivityAt: '1932-02-05T12:12:33.0Z',
      name: 'Sabrina Mertz',
    },
    props,
  ) as HostedBusiness;
export const getHostedBusinessDetail = (props: Partial<HostedBusinessDetail>) =>
  merge(
    {
      invitedData: {
        'id.first_name': 'Jane',
        'id.last_name': 'Doe',
      },
      inviter: {
        firstName: 'Luz',
        lastName: 'Kutch',
      },
      name: 'Johnnie Russel IV',
    },
    props,
  ) as HostedBusinessDetail;
export const getHostedBusinessOwner = (props: Partial<HostedBusinessOwner>) =>
  merge(
    {
      createdAt: '1898-01-01T06:02:03.0Z',
      decryptedData: {
        'id.first_name': 'Jane',
        'id.last_name': 'Doe',
      },
      hasLinkedUser: false,
      isAuthedUser: true,
      isMutable: false,
      linkId: 'f92bf243-f201-4e00-ad6f-609afcd25d66',
      ownershipStake: -18949686,
      populatedData: [
        'document.id_card.selfie.image',
        'document.permit.samba_activity_history_response',
        'document.passport_card.postal_code',
      ],
      uuid: '87e42004-b234-4bc3-bb9b-d547960cee9e',
    },
    props,
  ) as HostedBusinessOwner;
export const getHostedValidateResponse = (props: Partial<HostedValidateResponse>) =>
  merge(
    {
      validationToken: '2a9d60db-58dc-46e5-8d9f-325277989696',
    },
    props,
  ) as HostedValidateResponse;
export const getHostedWorkflowRequest = (props: Partial<HostedWorkflowRequest>) =>
  merge(
    {
      config: {
        data: {
          playbookId: '945fd699-b1d3-4192-8fb4-f3e7eea3eebe',
          recollectAttributes: ['us_legal_status', 'full_address', 'bank'],
          reuseExistingBoKyc: true,
        },
        kind: 'onboard',
      },
      note: 'enim veniam',
    },
    props,
  ) as HostedWorkflowRequest;
export const getIdDocKind = (props: Partial<IdDocKind>) => (props ?? 'passport_card') as IdDocKind;
export const getIdentifiedUser = (props: Partial<IdentifiedUser>) =>
  merge(
    {
      authMethods: [
        {
          isVerified: false,
          kind: 'passkey',
        },
        {
          isVerified: false,
          kind: 'email',
        },
        {
          isVerified: false,
          kind: 'email',
        },
      ],
      availableChallengeKinds: ['sms', 'sms', 'email'],
      canInitiateSignupChallenge: true,
      hasSyncablePasskey: false,
      isUnverified: false,
      matchingFps: ['bank.*.ach_account_number', 'id.drivers_license_number', 'document.passport_card.expires_at'],
      scrubbedEmail: 'brice72@gmail.com',
      scrubbedPhone: '+15349993776',
      token: 'ea56a699-f5b3-43f9-b766-3eb0d0ecc009',
      tokenScopes: ['auth', 'handoff', 'handoff'],
    },
    props,
  ) as IdentifiedUser;
export const getIdentifyAuthMethod = (props: Partial<IdentifyAuthMethod>) =>
  merge(
    {
      isVerified: false,
      kind: 'passkey',
    },
    props,
  ) as IdentifyAuthMethod;
export const getIdentifyChallengeResponse = (props: Partial<IdentifyChallengeResponse>) =>
  merge(
    {
      challengeData: {
        biometricChallengeJson: 'sunt',
        challengeKind: 'biometric',
        challengeToken: '6cc10f2e-8d85-44a6-adbd-729867904d90',
        timeBeforeRetryS: -60711916,
        token: 'ffe5951f-1d97-4621-8094-df64af17f6aa',
      },
      error: 'do esse magna pariatur qui',
    },
    props,
  ) as IdentifyChallengeResponse;
export const getIdentifyId = (props: Partial<IdentifyId>) =>
  merge(
    {
      email: 'mayra37@gmail.com',
    },
    props,
  ) as IdentifyId;
export const getIdentifyRequest = (props: Partial<IdentifyRequest>) =>
  merge(
    {
      email: 'kaylin.wiza49@gmail.com',
      identifier: {
        email: 'easton_ebert@gmail.com',
      },
      phoneNumber: '+12995328882',
      scope: 'my1fp',
    },
    props,
  ) as IdentifyRequest;
export const getIdentifyResponse = (props: Partial<IdentifyResponse>) =>
  merge(
    {
      user: {
        authMethods: [
          {
            isVerified: false,
            kind: 'email',
          },
          {
            isVerified: false,
            kind: 'phone',
          },
          {
            isVerified: true,
            kind: 'email',
          },
        ],
        availableChallengeKinds: ['sms', 'email', 'biometric'],
        canInitiateSignupChallenge: true,
        hasSyncablePasskey: false,
        isUnverified: true,
        matchingFps: [
          'document.permit.state',
          'document.voter_identification.front.mime_type',
          'document.drivers_license.dob',
        ],
        scrubbedEmail: 'brianne_strosin86@gmail.com',
        scrubbedPhone: '+13092277571',
        token: '1b001e6e-9963-4db3-bd9d-70e9c5c30c71',
        tokenScopes: ['sign_up', 'sensitive_profile', 'auth'],
      },
    },
    props,
  ) as IdentifyResponse;
export const getIdentifyScope = (props: Partial<IdentifyScope>) => (props ?? 'my1fp') as IdentifyScope;
export const getIdentifyVerifyRequest = (props: Partial<IdentifyVerifyRequest>) =>
  merge(
    {
      challengeResponse: 'laboris tempor officia ex',
      challengeToken: '3e92f283-f21f-41a2-ab1d-4069a4f41e74',
      scope: 'auth',
    },
    props,
  ) as IdentifyVerifyRequest;
export const getIdentifyVerifyResponse = (props: Partial<IdentifyVerifyResponse>) =>
  merge(
    {
      authToken: '009e3f43-7379-4cef-beb5-a4176228874a',
    },
    props,
  ) as IdentifyVerifyResponse;
export const getInviter = (props: Partial<Inviter>) =>
  merge(
    {
      firstName: 'Violette',
      lastName: 'Welch',
    },
    props,
  ) as Inviter;
export const getIso3166TwoDigitCountryCode = (props: Partial<Iso3166TwoDigitCountryCode>) =>
  (props ?? 'BW') as Iso3166TwoDigitCountryCode;
export const getKbaResponse = (props: Partial<KbaResponse>) =>
  merge(
    {
      token: 'b9e2babd-e591-4678-bbed-d16d5d714852',
    },
    props,
  ) as KbaResponse;
export const getL10n = (props: Partial<L10n>) =>
  merge(
    {
      language: 'en',
      locale: 'en-US',
    },
    props,
  ) as L10n;
export const getL10nV1 = (props: Partial<L10nV1>) =>
  merge(
    {
      language: 'en',
      locale: 'en-US',
    },
    props,
  ) as L10nV1;
export const getLiteIdentifyRequest = (props: Partial<LiteIdentifyRequest>) =>
  merge(
    {
      email: 'elenor.vandervort@gmail.com',
      phoneNumber: '+12339044984',
    },
    props,
  ) as LiteIdentifyRequest;
export const getLiteIdentifyResponse = (props: Partial<LiteIdentifyResponse>) =>
  merge(
    {
      userFound: true,
    },
    props,
  ) as LiteIdentifyResponse;
export const getLogBody = (props: Partial<LogBody>) =>
  merge(
    {
      logLevel: 'labore',
      logMessage: 'in',
      sdkKind: 'officia sed dolore Lorem',
      sdkName: 'Dr. Delores Langworth',
      sdkVersion: 'ea',
      sessionId: 'cba3f4a5-5c15-4757-8b40-ff7835728f95',
      tenantDomain: 'laboris eiusmod dolor laborum reprehenderit',
    },
    props,
  ) as LogBody;
export const getLoginChallengeRequest = (props: Partial<LoginChallengeRequest>) =>
  merge(
    {
      challengeKind: 'sms',
    },
    props,
  ) as LoginChallengeRequest;
export const getModernRawBusinessDataRequest = (props: Partial<ModernRawBusinessDataRequest>) =>
  merge(
    {
      'business.name': 'Acme Bank',
      'business.website': 'acmebank.org',
      customAccountId: 'd0af81fc-41c2-46ca-8a8d-797b8e4d3146',
    },
    props,
  ) as ModernRawBusinessDataRequest;
export const getModernRawUserDataRequest = (props: Partial<ModernRawUserDataRequest>) =>
  merge(
    {
      customUserId: '7c50e2bc-c31f-42e3-b2b0-9852010cfd58',
      'id.first_name': 'Jane',
      'id.last_name': 'Doe',
    },
    props,
  ) as ModernRawUserDataRequest;
export const getModernUserDecryptResponse = (props: Partial<ModernUserDecryptResponse>) =>
  merge(
    {
      'id.first_name': 'Jane',
      'id.last_name': 'Doe',
    },
    props,
  ) as ModernUserDecryptResponse;
export const getNeuroIdentityIdResponse = (props: Partial<NeuroIdentityIdResponse>) =>
  merge(
    {
      id: '7e3ff214-3d4a-474c-b44b-ca217430706e',
    },
    props,
  ) as NeuroIdentityIdResponse;
export const getObConfigurationKind = (props: Partial<ObConfigurationKind>) => (props ?? 'auth') as ObConfigurationKind;
export const getOnboardingResponse = (props: Partial<OnboardingResponse>) =>
  merge(
    {
      authToken: '4b7e3ebe-7881-4e14-ac86-8e85fe90f5fe',
    },
    props,
  ) as OnboardingResponse;
export const getOnboardingSessionResponse = (props: Partial<OnboardingSessionResponse>) =>
  merge(
    {
      bootstrapData: {},
    },
    props,
  ) as OnboardingSessionResponse;
export const getOnboardingStatusResponse = (props: Partial<OnboardingStatusResponse>) =>
  merge(
    {
      allRequirements: [
        {
          isMet: false,
        },
        {
          isMet: true,
        },
        {
          isMet: true,
        },
      ],
    },
    props,
  ) as OnboardingStatusResponse;
export const getPostBusinessOnboardingRequest = (props: Partial<PostBusinessOnboardingRequest>) =>
  merge(
    {
      inheritBusinessId: '4073d73e-a332-4d58-a3cc-58a3f5e3f358',
      kybFixtureResult: 'step_up',
    },
    props,
  ) as PostBusinessOnboardingRequest;
export const getPostOnboardingRequest = (props: Partial<PostOnboardingRequest>) =>
  merge(
    {
      fixtureResult: 'pass',
    },
    props,
  ) as PostOnboardingRequest;
export const getProcessRequest = (props: Partial<ProcessRequest>) =>
  merge(
    {
      fixtureResult: 'manual_review',
    },
    props,
  ) as ProcessRequest;
export const getPublicOnboardingConfiguration = (props: Partial<PublicOnboardingConfiguration>) =>
  merge(
    {
      allowInternationalResidents: false,
      allowedOrigins: ['voluptate officia', 'eu laboris ut eiusmod', 'nisi enim voluptate'],
      appClipExperienceId: '95361e9d-cde9-45fe-a4b9-7d86c3b344b6',
      appearance: {},
      canMakeRealDocScanCallsInSandbox: true,
      isAppClipEnabled: true,
      isInstantAppEnabled: false,
      isKyb: true,
      isLive: true,
      isNoPhoneFlow: true,
      isStepupEnabled: true,
      key: '9bea5353-14fa-406d-86ef-bf03e1f84f2f',
      kind: 'kyb',
      logoUrl: 'https://delicious-injunction.biz/',
      name: 'Jaime Harvey V',
      nidEnabled: true,
      orgId: '373d5cd0-a5e1-4118-a814-da9ed75e6f6e',
      orgName: 'Penny Barrows',
      privacyPolicyUrl: 'https://close-ostrich.com',
      requiredAuthMethods: ['passkey', 'email', 'passkey'],
      requiresIdDoc: true,
      skipConfirm: true,
      status: 'disabled',
      supportEmail: 'lucy22@gmail.com',
      supportPhone: '+15507516797',
      supportWebsite: 'https://shady-pillow.us/',
      supportedCountries: ['HM', 'SM', 'ML'],
      workflowRequest: {
        config: {
          data: {
            playbookId: '39b93be9-b9b1-4061-b4c0-4ea33aa7b280',
            recollectAttributes: ['ssn9', 'dob', 'business_tin'],
            reuseExistingBoKyc: true,
          },
          kind: 'onboard',
        },
        note: 'elit sunt incididunt nostrud',
      },
    },
    props,
  ) as PublicOnboardingConfiguration;
export const getRawUserDataRequest = (props: Partial<RawUserDataRequest>) =>
  merge(
    {
      customUserId: '7c50e2bc-c31f-42e3-b2b0-9852010cfd58',
      'id.first_name': 'Jane',
      'id.last_name': 'Doe',
    },
    props,
  ) as RawUserDataRequest;
export const getRegisterPasskeyAttemptContext = (props: Partial<RegisterPasskeyAttemptContext>) =>
  merge(
    {
      elapsedTimeInOsPromptMs: 934319,
      errorMessage: 'nulla aliqua Excepteur Duis aute',
    },
    props,
  ) as RegisterPasskeyAttemptContext;
export const getRenderV1SdkArgs = (props: Partial<RenderV1SdkArgs>) =>
  merge(
    {
      authToken: '5e63603a-2368-4a90-841b-ace7d3b0fa6b',
      canCopy: false,
      defaultHidden: false,
      id: '7b0bbf21-e1f4-4103-8d63-65709693b197',
      label: 'quis exercitation velit ipsum commodo',
      showHiddenToggle: true,
    },
    props,
  ) as RenderV1SdkArgs;
export const getRequestedTokenScope = (props: Partial<RequestedTokenScope>) =>
  (props ?? 'onboarding_components') as RequestedTokenScope;
export const getSdkArgs = (props: Partial<SdkArgs>) =>
  merge(
    {
      data: {
        authToken: '97cc2471-6a61-462d-b427-4a84e21b93aa',
        documentFixtureResult: 'pass',
        fixtureResult: 'pass',
        isComponentsSdk: true,
        l10N: {
          language: 'en',
          locale: 'en-US',
        },
        options: {
          showCompletionPage: false,
          showLogo: false,
        },
        publicKey: 'b9db826d-1725-44a1-a08a-1e0961b62814',
        sandboxId: 'fb68ec32-49fc-433f-84bd-86ac74afa566',
        shouldRelayToComponents: false,
        userData: {},
      },
      kind: 'verify_v1',
    },
    props,
  ) as SdkArgs;
export const getSignupChallengeRequest = (props: Partial<SignupChallengeRequest>) =>
  merge(
    {
      challengeKind: 'biometric',
      email: {
        isBootstrap: true,
        value: 'tempor',
      },
      phoneNumber: {
        isBootstrap: true,
        value: 'reprehenderit esse culpa fugiat incididunt',
      },
      scope: 'auth',
    },
    props,
  ) as SignupChallengeRequest;
export const getSkipLivenessClientType = (props: Partial<SkipLivenessClientType>) =>
  (props ?? 'web') as SkipLivenessClientType;
export const getSkipLivenessContext = (props: Partial<SkipLivenessContext>) =>
  merge(
    {
      attempts: [
        {
          elapsedTimeInOsPromptMs: -23610738,
          errorMessage: 'velit dolore aliqua tempor anim',
        },
        {
          elapsedTimeInOsPromptMs: 38602297,
          errorMessage: 'cupidatat',
        },
        {
          elapsedTimeInOsPromptMs: 67384042,
          errorMessage: 'reprehenderit in in consequat culpa',
        },
      ],
      clientType: 'mobile',
      numAttempts: 66696031,
      reason: 'pariatur cillum officia',
    },
    props,
  ) as SkipLivenessContext;
export const getSkipPasskeyRegisterRequest = (props: Partial<SkipPasskeyRegisterRequest>) =>
  merge(
    {
      context: {
        attempts: [
          {
            elapsedTimeInOsPromptMs: -16203914,
            errorMessage: 'est occaecat cupidatat',
          },
          {
            elapsedTimeInOsPromptMs: 34142437,
            errorMessage: 'nostrud minim tempor consequat',
          },
          {
            elapsedTimeInOsPromptMs: -29503222,
            errorMessage: 'magna deserunt ex sit',
          },
        ],
        clientType: 'web',
        numAttempts: -32489082,
        reason: 'ullamco eu ipsum',
      },
    },
    props,
  ) as SkipPasskeyRegisterRequest;
export const getSocureDeviceSessionIdRequest = (props: Partial<SocureDeviceSessionIdRequest>) =>
  merge(
    {
      deviceSessionId: '12e690e8-9c2e-43fa-b786-ed37819bc649',
    },
    props,
  ) as SocureDeviceSessionIdRequest;
export const getStytchTelemetryRequest = (props: Partial<StytchTelemetryRequest>) =>
  merge(
    {
      telemetryId: '51086c58-2bba-4855-a43f-cc0001e4e37b',
    },
    props,
  ) as StytchTelemetryRequest;
export const getUpdateAuthMethodsV1SdkArgs = (props: Partial<UpdateAuthMethodsV1SdkArgs>) =>
  merge(
    {
      authToken: 'ae10a24b-0d1d-461d-9de5-ad0fd4f8cbfd',
      l10N: {
        language: 'en',
        locale: 'en-US',
      },
      options: {
        showLogo: false,
      },
    },
    props,
  ) as UpdateAuthMethodsV1SdkArgs;
export const getUpdateOrCreateHostedBusinessOwnerRequest = (props: Partial<UpdateOrCreateHostedBusinessOwnerRequest>) =>
  merge(
    {
      data: {
        customUserId: '7c50e2bc-c31f-42e3-b2b0-9852010cfd58',
        'id.first_name': 'Jane',
        'id.last_name': 'Doe',
      },
      op: 'create',
      ownershipStake: -12874911,
      uuid: '0948b0f3-444c-4b75-abe0-6e9b6bef21eb',
    },
    props,
  ) as UpdateOrCreateHostedBusinessOwnerRequest;
export const getUserAuthScope = (props: Partial<UserAuthScope>) => (props ?? 'sign_up') as UserAuthScope;
export const getUserChallengeData = (props: Partial<UserChallengeData>) =>
  merge(
    {
      biometricChallengeJson: 'fugiat deserunt eu laborum',
      challengeKind: 'biometric',
      challengeToken: 'e4bb8bcc-75d3-4791-84d5-1c3fc7a3cc8e',
      timeBeforeRetryS: 86817343,
      token: 'f1d840da-837e-4c02-9cde-3c34b1c68fb2',
    },
    props,
  ) as UserChallengeData;
export const getUserChallengeRequest = (props: Partial<UserChallengeRequest>) =>
  merge(
    {
      actionKind: 'add_primary',
      email: 'jillian_kovacek@gmail.com',
      kind: 'email',
      phoneNumber: '+12403856728',
    },
    props,
  ) as UserChallengeRequest;
export const getUserChallengeResponse = (props: Partial<UserChallengeResponse>) =>
  merge(
    {
      biometricChallengeJson: 'cupidatat eiusmod dolor',
      challengeToken: 'd79d9064-bb3b-4d36-afc4-405e9d6f923e',
      timeBeforeRetryS: -26370578,
    },
    props,
  ) as UserChallengeResponse;
export const getUserChallengeVerifyRequest = (props: Partial<UserChallengeVerifyRequest>) =>
  merge(
    {
      challengeResponse: 'est pariatur Excepteur enim',
      challengeToken: '263d7baf-37af-4e67-ac3b-44445889a6ea',
    },
    props,
  ) as UserChallengeVerifyRequest;
export const getUserChallengeVerifyResponse = (props: Partial<UserChallengeVerifyResponse>) =>
  merge(
    {
      authToken: '1bb1eea1-7b1e-4223-b0c4-4f016fbb7ac0',
    },
    props,
  ) as UserChallengeVerifyResponse;
export const getUserDataIdentifier = (props: Partial<UserDataIdentifier>) =>
  (props ?? 'document.visa.dob') as UserDataIdentifier;
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
export const getVerifyResultV1SdkArgs = (props: Partial<VerifyResultV1SdkArgs>) =>
  merge(
    {
      authToken: 'b817de0e-f13f-4dc5-92f8-b1892a7692ae',
      deviceResponse: 'commodo cillum non dolore nulla',
    },
    props,
  ) as VerifyResultV1SdkArgs;
export const getVerifyV1Options = (props: Partial<VerifyV1Options>) =>
  merge(
    {
      showCompletionPage: false,
      showLogo: true,
    },
    props,
  ) as VerifyV1Options;
export const getVerifyV1SdkArgs = (props: Partial<VerifyV1SdkArgs>) =>
  merge(
    {
      authToken: '2e49aca6-05ba-49b8-8d26-0717c7dbe1a0',
      documentFixtureResult: 'pass',
      fixtureResult: 'manual_review',
      isComponentsSdk: true,
      l10N: {
        language: 'en',
        locale: 'en-US',
      },
      options: {
        showCompletionPage: false,
        showLogo: false,
      },
      publicKey: '9b197793-6390-4aae-8dd7-b5b43e64b51c',
      sandboxId: '9c91717e-f673-43f4-8260-4b1cdcdeb251',
      shouldRelayToComponents: true,
      userData: {},
    },
    props,
  ) as VerifyV1SdkArgs;
export const getWorkflowFixtureResult = (props: Partial<WorkflowFixtureResult>) =>
  (props ?? 'pass') as WorkflowFixtureResult;
export const getWorkflowRequestConfig = (props: Partial<WorkflowRequestConfig>) =>
  merge(
    {
      data: {
        playbookId: 'a039b76f-97fc-4423-b8c2-1cb34c19c9af',
        recollectAttributes: ['business_tin', 'business_tin', 'business_beneficial_owners'],
        reuseExistingBoKyc: true,
      },
      kind: 'onboard',
    },
    props,
  ) as WorkflowRequestConfig;
