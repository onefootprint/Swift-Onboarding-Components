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
export const getApiKeyStatus = (props: Partial<ApiKeyStatus>) => (props ?? 'disabled') as ApiKeyStatus;
export const getApiOnboardingRequirement = (props: Partial<ApiOnboardingRequirement>) =>
  merge(
    {
      isMet: false,
    },
    props,
  ) as ApiOnboardingRequirement;
export const getAuthMethod = (props: Partial<AuthMethod>) =>
  merge(
    {
      canUpdate: true,
      isVerified: true,
      kind: 'phone',
    },
    props,
  ) as AuthMethod;
export const getAuthMethodKind = (props: Partial<AuthMethodKind>) => (props ?? 'email') as AuthMethodKind;
export const getAuthRequirementsResponse = (props: Partial<AuthRequirementsResponse>) =>
  merge(
    {
      allRequirements: [
        {
          isMet: true,
        },
        {
          isMet: false,
        },
        {
          isMet: false,
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
        showLogo: true,
      },
      publicKey: '1f0b9966-a39d-499c-be1c-62994dbe3399',
      userData: {},
    },
    props,
  ) as AuthV1SdkArgs;
export const getAuthorizedOrg = (props: Partial<AuthorizedOrg>) =>
  merge(
    {
      canAccessData: ['UsTaxId', 'Ssn4', 'Name'],
      logoUrl: 'https://elementary-dredger.name',
      orgName: 'Ted Sipes',
    },
    props,
  ) as AuthorizedOrg;
export const getBatchHostedBusinessOwnerRequest = (props: Partial<BatchHostedBusinessOwnerRequest>) =>
  (props ?? 'commodo eu sit') as BatchHostedBusinessOwnerRequest;
export const getBusinessDecryptResponse = (props: Partial<BusinessDecryptResponse>) =>
  merge(
    {
      key: '3b5d4933-a6d7-4a0c-8ab0-8b86c8005434',
      value: {},
    },
    props,
  ) as BusinessDecryptResponse;
export const getBusinessOnboardingResponse = (props: Partial<BusinessOnboardingResponse>) =>
  merge(
    {
      authToken: 'f9e444cd-c04c-45cd-95bf-b84b1e4820fc',
    },
    props,
  ) as BusinessOnboardingResponse;
export const getChallengeKind = (props: Partial<ChallengeKind>) => (props ?? 'sms') as ChallengeKind;
export const getCheckSessionResponse = (props: Partial<CheckSessionResponse>) =>
  (props ?? 'unknown') as CheckSessionResponse;
export const getCollectedDataOption = (props: Partial<CollectedDataOption>) =>
  (props ?? 'business_tin') as CollectedDataOption;
export const getConsentRequest = (props: Partial<ConsentRequest>) =>
  merge(
    {
      consentLanguageText: 'en',
      mlConsent: false,
    },
    props,
  ) as ConsentRequest;
export const getCountrySpecificDocumentMapping = (props: Partial<CountrySpecificDocumentMapping>) =>
  merge({}, props) as CountrySpecificDocumentMapping;
export const getCreateDeviceAttestationRequest = (props: Partial<CreateDeviceAttestationRequest>) =>
  merge(
    {
      attestation: 'non dolore ipsum',
      state: 'Alaska',
    },
    props,
  ) as CreateDeviceAttestationRequest;
export const getCreateDocumentRequest = (props: Partial<CreateDocumentRequest>) =>
  merge(
    {
      countryCode: 'Guinea',
      deviceType: 'mobile',
      documentType: 'id_card',
      fixtureResult: 'Fail',
      requestId: 'c8d7e00a-bf44-4e01-b2b1-6f191271b1e2',
      skipSelfie: false,
    },
    props,
  ) as CreateDocumentRequest;
export const getCreateDocumentResponse = (props: Partial<CreateDocumentResponse>) =>
  merge(
    {
      id: 'd62e5351-f4ae-4c99-a8df-067e2f1b84c3',
    },
    props,
  ) as CreateDocumentResponse;
export const getCreateOnboardingTimelineRequest = (props: Partial<CreateOnboardingTimelineRequest>) =>
  merge(
    {
      event: 'sint eiusmod incididunt ipsum',
    },
    props,
  ) as CreateOnboardingTimelineRequest;
export const getCreateSdkArgsTokenResponse = (props: Partial<CreateSdkArgsTokenResponse>) =>
  merge(
    {
      expiresAt: '1915-03-04T13:38:51.0Z',
      token: 'ffc03178-a902-40af-858b-665fbf05cb54',
    },
    props,
  ) as CreateSdkArgsTokenResponse;
export const getCreateUserTokenRequest = (props: Partial<CreateUserTokenRequest>) =>
  merge(
    {
      requestedScope: 'auth',
    },
    props,
  ) as CreateUserTokenRequest;
export const getCreateUserTokenResponse = (props: Partial<CreateUserTokenResponse>) =>
  merge(
    {
      expiresAt: '1906-04-18T21:28:24.0Z',
      token: 'aba985d3-464c-4cb6-993b-b18dfee0ecc8',
    },
    props,
  ) as CreateUserTokenResponse;
export const getCustomDocumentConfig = (props: Partial<CustomDocumentConfig>) =>
  merge(
    {
      description: 'ea laborum',
      identifier: 'ff917e18-3518-48d0-a5c1-6fdcbb86c757',
      name: 'Charlie Stracke',
      requiresHumanReview: true,
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
        opener: 'officia qui Duis magna',
        redirectUrl: 'https://fuzzy-hyphenation.us',
        sandboxIdDocOutcome: 'ad35f01f-c31b-45ec-9121-44e01abe0de0',
        sessionId: '5b29113e-e300-4546-a890-7551f2e43287',
        styleParams: 'Lorem',
      },
    },
    props,
  ) as D2pGenerateRequest;
export const getD2pGenerateResponse = (props: Partial<D2pGenerateResponse>) =>
  merge(
    {
      authToken: 'ba6fb7bf-f3e2-4ce1-aafe-21e6d01a5093',
    },
    props,
  ) as D2pGenerateResponse;
export const getD2pSessionStatus = (props: Partial<D2pSessionStatus>) => (props ?? 'failed') as D2pSessionStatus;
export const getD2pSmsRequest = (props: Partial<D2pSmsRequest>) =>
  merge(
    {
      url: 'https://querulous-other.biz',
    },
    props,
  ) as D2pSmsRequest;
export const getD2pSmsResponse = (props: Partial<D2pSmsResponse>) =>
  merge(
    {
      timeBeforeRetryS: 57920246,
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
        opener: 'aliquip enim qui ullamco',
        redirectUrl: 'https://querulous-lava.net',
        sandboxIdDocOutcome: '33d2b718-0b82-4a8e-8ff1-a7252f4cd7e4',
        sessionId: 'b03e2e49-2b91-4e89-a932-8c5e868f26d6',
        styleParams: 'fugiat est cillum id',
      },
      status: 'canceled',
    },
    props,
  ) as D2pStatusResponse;
export const getD2pUpdateStatusRequest = (props: Partial<D2pUpdateStatusRequest>) =>
  merge(
    {
      status: 'in_progress',
    },
    props,
  ) as D2pUpdateStatusRequest;
export const getDataIdentifier = (props: Partial<DataIdentifier>) =>
  (props ?? 'document.voter_identification.samba_activity_history_response') as DataIdentifier;
export const getDeleteHostedBusinessOwnerRequest = (props: Partial<DeleteHostedBusinessOwnerRequest>) =>
  merge(
    {
      op: 'delete',
      uuid: '7587997d-dac1-4f16-a6ff-940cf3c04156',
    },
    props,
  ) as DeleteHostedBusinessOwnerRequest;
export const getDeviceAttestationChallengeResponse = (props: Partial<DeviceAttestationChallengeResponse>) =>
  merge(
    {
      attestationChallenge: 'cillum mollit elit adipisicing ea',
      state: 'Texas',
    },
    props,
  ) as DeviceAttestationChallengeResponse;
export const getDeviceAttestationType = (props: Partial<DeviceAttestationType>) =>
  (props ?? 'ios') as DeviceAttestationType;
export const getDeviceType = (props: Partial<DeviceType>) => (props ?? 'ios') as DeviceType;
export const getDocumentAndCountryConfiguration = (props: Partial<DocumentAndCountryConfiguration>) =>
  merge(
    {
      countrySpecific: {},
      global: ['drivers_license', 'permit', 'id_card'],
    },
    props,
  ) as DocumentAndCountryConfiguration;
export const getDocumentFixtureResult = (props: Partial<DocumentFixtureResult>) =>
  (props ?? 'fail') as DocumentFixtureResult;
export const getDocumentImageError = (props: Partial<DocumentImageError>) =>
  (props ?? 'drivers_license_permit_not_allowed') as DocumentImageError;
export const getDocumentKind = (props: Partial<DocumentKind>) => (props ?? 'id_card') as DocumentKind;
export const getDocumentRequestConfig = (props: Partial<DocumentRequestConfig>) =>
  merge(
    {
      data: {
        collectSelfie: false,
        description: 'velit veniam quis',
        documentTypesAndCountries: {
          countrySpecific: {},
          global: ['drivers_license', 'residence_document', 'permit'],
        },
        identifier: 'business.state',
        name: 'reprehenderit exercitation sunt Excepteur aliqua',
        requiresHumanReview: true,
        uploadSettings: 'prefer_upload',
      },
      kind: 'identity',
    },
    props,
  ) as DocumentRequestConfig;
export const getDocumentResponse = (props: Partial<DocumentResponse>) =>
  merge(
    {
      errors: ['image_error', 'selfie_image_orientation_incorrect', 'selfie_image_orientation_incorrect'],
      isRetryLimitExceeded: false,
      nextSideToCollect: 'fa8c31f4-34b3-4e1e-bdb4-1a1ba20f8728',
    },
    props,
  ) as DocumentResponse;
export const getDocumentSide = (props: Partial<DocumentSide>) => (props ?? 'back') as DocumentSide;
export const getDocumentUploadSettings = (props: Partial<DocumentUploadSettings>) =>
  (props ?? 'prefer_capture') as DocumentUploadSettings;
export const getEmailVerifyRequest = (props: Partial<EmailVerifyRequest>) =>
  merge(
    {
      data: 'officia Duis voluptate irure',
    },
    props,
  ) as EmailVerifyRequest;
export const getEmpty = (props: Partial<Empty>) => merge({}, props) as Empty;
export const getFilterFunction = (props: Partial<FilterFunction>) => (props ?? 'prefix(<n>)') as FilterFunction;
export const getFingerprintVisitRequest = (props: Partial<FingerprintVisitRequest>) =>
  merge(
    {
      path: 'amet ut qui nisi et',
      requestId: 'dbc865d5-d99c-4a26-88c2-ad2001705ee0',
      visitorId: '75d72fca-c326-4fc1-ba3e-5b7f82d08e81',
    },
    props,
  ) as FingerprintVisitRequest;
export const getFormV1Options = (props: Partial<FormV1Options>) =>
  merge(
    {
      hideButtons: false,
      hideCancelButton: false,
      hideFootprintLogo: false,
    },
    props,
  ) as FormV1Options;
export const getFormV1SdkArgs = (props: Partial<FormV1SdkArgs>) =>
  merge(
    {
      authToken: 'f31bf795-9214-4a59-b7eb-fd3fbbcd4114',
      l10N: {
        language: 'en',
        locale: 'en-US',
      },
      options: {
        hideButtons: false,
        hideCancelButton: true,
        hideFootprintLogo: true,
      },
      title: 'dolor nisi irure',
    },
    props,
  ) as FormV1SdkArgs;
export const getGetDeviceAttestationChallengeRequest = (props: Partial<GetDeviceAttestationChallengeRequest>) =>
  merge(
    {
      androidPackageName: 'Greg Greenholt',
      deviceType: 'android',
      iosBundleId: 'e3f8d974-1286-45eb-9324-84eae2fa85b4',
    },
    props,
  ) as GetDeviceAttestationChallengeRequest;
export const getGetSdkArgsTokenResponse = (props: Partial<GetSdkArgsTokenResponse>) =>
  merge(
    {
      args: 'sunt Ut',
    },
    props,
  ) as GetSdkArgsTokenResponse;
export const getGetUserTokenResponse = (props: Partial<GetUserTokenResponse>) =>
  merge(
    {
      expiresAt: '1928-08-07T11:24:54.0Z',
      scopes: ['explicit_auth', 'sensitive_profile', 'sign_up'],
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
      opener: 'enim voluptate',
      redirectUrl: 'https://delicious-turret.org/',
      sandboxIdDocOutcome: 'd1b3fb93-3f5c-44df-a387-2c7cdb2c5455',
      sessionId: '9a68e627-6c03-4754-b319-06f1957bfb02',
      styleParams: 'sunt incididunt',
    },
    props,
  ) as HandoffMetadata;
export const getHostedBusiness = (props: Partial<HostedBusiness>) =>
  merge(
    {
      createdAt: '1958-08-13T21:31:54.0Z',
      id: '27ef6f3c-b0b9-4bc1-bf51-f9f493eb2b33',
      isIncomplete: false,
      lastActivityAt: '1947-11-28T21:08:13.0Z',
      name: 'Christine Braun DVM',
    },
    props,
  ) as HostedBusiness;
export const getHostedBusinessDetail = (props: Partial<HostedBusinessDetail>) =>
  merge(
    {
      invited: {
        email: 'reece_larson@gmail.com',
        phoneNumber: '+19586321836',
      },
      invitedData: {
        'bank.*.account_type': 'ea minim sed fugiat',
        'bank.*.ach_account_id': '6553eb94-f0b1-48b7-8888-79f142d9fe43',
        'bank.*.ach_account_number': 'do consectetur laborum',
        'bank.*.ach_routing_number': 'Excepteur laborum',
        'bank.*.fingerprint': 'aliqua do qui laborum',
        'bank.*.name': 'Wanda Gleason',
        'card.*.billing_address.country': '1541 William Knolls Apt. 276',
        'card.*.billing_address.zip': '8312 Quigley Shoals Suite 143',
        'card.*.cvc': 'eu in Duis adipisicing do',
        'card.*.expiration': 'proident minim sit',
        'card.*.expiration_month': 'sunt id culpa exercitation',
        'card.*.expiration_year': 'enim anim aliqua deserunt',
        'card.*.fingerprint': 'laboris labore',
        'card.*.issuer': 'in Duis consectetur aute dolor',
        'card.*.name': 'Marlene Krajcik DDS',
        'card.*.number': 'voluptate in',
        'card.*.number_last4': 'deserunt ullamco',
        'custom.*': 'laborum adipisicing Ut',
        'document.custom.*': 'dolore sunt fugiat',
        'document.drivers_license.back.image': 'qui reprehenderit dolor Ut',
        'document.drivers_license.back.mime_type': 'et',
        'document.drivers_license.classified_document_type': 'in minim Lorem proident ut',
        'document.drivers_license.clave_de_elector': 'dolor velit',
        'document.drivers_license.curp': 'non Excepteur pariatur incididunt',
        'document.drivers_license.curp_validation_response': 'f2ae8a06-aba1-4b74-bbfe-2f7b536486e4',
        'document.drivers_license.dob': 'velit',
        'document.drivers_license.document_number': 'mollit sit',
        'document.drivers_license.expires_at': 'labore sed nostrud',
        'document.drivers_license.front.image': 'sint sit qui Excepteur tempor',
        'document.drivers_license.front.mime_type': 'nulla eu',
        'document.drivers_license.full_address': '58997 Water Street Suite 531',
        'document.drivers_license.full_name': 'Eula Cronin',
        'document.drivers_license.gender': 'non cupidatat sit',
        'document.drivers_license.issued_at': 'ex',
        'document.drivers_license.issuing_country': 'Andorra',
        'document.drivers_license.issuing_state': 'Washington',
        'document.drivers_license.nationality': 'pariatur',
        'document.drivers_license.ref_number': 'cillum pariatur Duis',
        'document.drivers_license.samba_activity_history_response': 'Lorem irure ut',
        'document.drivers_license.selfie.image': 'eiusmod qui dolor pariatur nostrud',
        'document.drivers_license.selfie.mime_type': 'ullamco',
        'document.finra_compliance_letter': 'reprehenderit adipisicing',
        'document.id_card.back.image': '9a8c67e3-0051-4ab4-991b-d1d19340500b',
        'document.id_card.back.mime_type': 'f8e488b9-f593-475b-9d38-320b86412f00',
        'document.id_card.classified_document_type': 'e2c5034d-d159-485d-80c0-b9c4271fb711',
        'document.id_card.clave_de_elector': 'e61e0bc5-6a4e-41db-93cd-afebcb4a1699',
        'document.id_card.curp': 'ea27f128-e3a4-4fe9-af2f-b6ee6aa4d3cd',
        'document.id_card.curp_validation_response': '6a33c9f4-7215-44f8-8ae0-c9375a537609',
        'document.id_card.dob': '59cacd18-be0c-49cb-8834-2c203c2b316e',
        'document.id_card.document_number': '304d497c-527a-4316-8d0c-3733436461e3',
        'document.id_card.expires_at': 'f7a0090a-2002-4596-b2ad-14aa2d667958',
        'document.id_card.front.image': '2765d0d3-69c6-47c4-9dc8-fc05b883357e',
        'document.id_card.front.mime_type': '5165a03a-a68a-4c08-900c-76602bd11703',
        'document.id_card.full_address': '2324 Breitenberg Causeway Apt. 494',
        'document.id_card.full_name': 'Kate Adams MD',
        'document.id_card.gender': '5d47f441-0962-43ac-9cea-715cfd7c3bf7',
        'document.id_card.issued_at': '18bdf820-e27c-4446-a2c8-0f9c3eed22fd',
        'document.id_card.issuing_country': 'Armenia',
        'document.id_card.issuing_state': 'Ohio',
        'document.id_card.nationality': '5df95a58-0d18-437b-86cb-a5209d888b5e',
        'document.id_card.ref_number': '5ec82872-9ed9-40a2-b273-374cdd87af86',
        'document.id_card.samba_activity_history_response': '88bb73b3-4bb3-4f58-85d0-62f4660935a1',
        'document.id_card.selfie.image': '64efeced-0d95-41bf-8b0e-71bdca91d92c',
        'document.id_card.selfie.mime_type': '2a80edf3-24c4-4fc8-8760-679f1ab2ede8',
        'document.passport.back.image': 'Lorem non nisi',
        'document.passport.back.mime_type': 'cillum laboris sit officia ad',
        'document.passport.classified_document_type': 'pariatur in',
        'document.passport.clave_de_elector': 'in proident ipsum',
        'document.passport.curp': 'ea enim in proident',
        'document.passport.curp_validation_response': '178abf7d-e183-4d25-8790-f167c4e45737',
        'document.passport.dob': 'ut dolore reprehenderit',
        'document.passport.document_number': 'sit ut aliqua minim dolore',
        'document.passport.expires_at': 'veniam officia',
        'document.passport.front.image': 'cillum',
        'document.passport.front.mime_type': 'officia magna dolore ut',
        'document.passport.full_address': '612 Delphia Turnpike Apt. 544',
        'document.passport.full_name': 'Irving Collins',
        'document.passport.gender': 'id',
        'document.passport.issued_at': 'sint dolore',
        'document.passport.issuing_country': 'Taiwan',
        'document.passport.issuing_state': 'Virginia',
        'document.passport.nationality': 'dolor mollit',
        'document.passport.ref_number': 'dolore velit anim',
        'document.passport.samba_activity_history_response': 'qui dolore id dolor',
        'document.passport.selfie.image': 'quis',
        'document.passport.selfie.mime_type': 'ad eiusmod sint',
        'document.passport_card.back.image': 'dolore nostrud qui esse',
        'document.passport_card.back.mime_type': 'sit minim non dolore',
        'document.passport_card.classified_document_type': 'ea irure do sunt eiusmod',
        'document.passport_card.clave_de_elector': 'mollit esse consectetur officia ea',
        'document.passport_card.curp': 'in ut eu pariatur elit',
        'document.passport_card.curp_validation_response': '6401a856-01d0-4ab9-8577-9addc95eba13',
        'document.passport_card.dob': 'commodo nisi dolor ullamco',
        'document.passport_card.document_number': 'nostrud ea',
        'document.passport_card.expires_at': 'quis nulla',
        'document.passport_card.front.image': 'esse ad laborum cillum',
        'document.passport_card.front.mime_type': 'enim aliqua amet ullamco',
        'document.passport_card.full_address': '78952 Koelpin Loop Suite 974',
        'document.passport_card.full_name': 'Nina Koepp',
        'document.passport_card.gender': 'nulla do incididunt qui consectetur',
        'document.passport_card.issued_at': 'et',
        'document.passport_card.issuing_country': 'Vanuatu',
        'document.passport_card.issuing_state': 'Delaware',
        'document.passport_card.nationality': 'nisi ad',
        'document.passport_card.ref_number': 'adipisicing',
        'document.passport_card.samba_activity_history_response': 'dolor',
        'document.passport_card.selfie.image': 'sed ipsum',
        'document.passport_card.selfie.mime_type': 'sit aliquip tempor',
        'document.permit.back.image': 'aliquip',
        'document.permit.back.mime_type': 'occaecat dolor ex non',
        'document.permit.classified_document_type': 'reprehenderit',
        'document.permit.clave_de_elector': 'qui',
        'document.permit.curp': 'nisi et',
        'document.permit.curp_validation_response': 'ec289cd5-0f4a-451e-b8c1-2490b96ba871',
        'document.permit.dob': 'sit',
        'document.permit.document_number': 'ex aliquip dolore veniam reprehenderit',
        'document.permit.expires_at': 'do ipsum commodo et magna',
        'document.permit.front.image': 'est',
        'document.permit.front.mime_type': 'Lorem',
        'document.permit.full_address': '595 Braun Gateway Suite 373',
        'document.permit.full_name': 'Miss Cathy Wisoky',
        'document.permit.gender': 'mollit dolor et Ut',
        'document.permit.issued_at': 'nostrud aliquip occaecat ut exercitation',
        'document.permit.issuing_country': 'Cayman Islands',
        'document.permit.issuing_state': 'Michigan',
        'document.permit.nationality': 'ipsum Lorem',
        'document.permit.ref_number': 'in elit ad amet',
        'document.permit.samba_activity_history_response': 'amet sed elit aute',
        'document.permit.selfie.image': 'sunt irure',
        'document.permit.selfie.mime_type': 'ut aliqua dolor',
        'document.proof_of_address.image': '4308 Schamberger Fields Suite 163',
        'document.residence_document.back.image': 'c86f5c3b-c8c9-4206-a442-871d0b1672eb',
        'document.residence_document.back.mime_type': 'af0c6b2d-8bf4-4a8c-9826-2c40a10f9fe4',
        'document.residence_document.classified_document_type': '66793c16-d150-449c-95ca-0566fb350f66',
        'document.residence_document.clave_de_elector': '6bc96a17-21d1-433d-b75c-d5d3604922ba',
        'document.residence_document.curp': 'e1e31d19-2a9c-4cad-b67c-4af995de7d00',
        'document.residence_document.curp_validation_response': 'aa6d013c-11a0-4b27-8867-e7898dd6aad1',
        'document.residence_document.dob': 'cc62190b-5ed6-4f6e-8a9f-e8ec1705a8cb',
        'document.residence_document.document_number': '8c5b6da6-4c55-4f13-bc3f-7e1c1d748da4',
        'document.residence_document.expires_at': '4b36f48d-52b0-4650-b160-a11141d1eadb',
        'document.residence_document.front.image': '9b450417-1280-445e-b740-ab7ab8782a24',
        'document.residence_document.front.mime_type': '3c4d73c7-af6e-443a-af80-9967e44052d7',
        'document.residence_document.full_address': '8476 Haylee Harbors Apt. 481',
        'document.residence_document.full_name': 'Casey White',
        'document.residence_document.gender': '04b9b7a0-08f6-4853-9cc0-88fcf5c40c08',
        'document.residence_document.issued_at': 'b23158ba-38a1-42f9-b43a-3d47176a5471',
        'document.residence_document.issuing_country': 'Turkey',
        'document.residence_document.issuing_state': 'Maine',
        'document.residence_document.nationality': '6bbe763e-e45d-413c-90c8-eb4e6f44ac9c',
        'document.residence_document.ref_number': 'e87d4977-cfbe-406f-b739-f1b5bdae0702',
        'document.residence_document.samba_activity_history_response': '795b0dff-5cf1-4db9-b550-24a084202559',
        'document.residence_document.selfie.image': 'c831fb23-e158-42f8-9003-4d27d798e5a2',
        'document.residence_document.selfie.mime_type': '34175032-08e4-4f3d-a8df-b23fa7bbaa74',
        'document.ssn_card.image': 'nulla dolore',
        'document.visa.back.image': 'qui minim occaecat ea',
        'document.visa.back.mime_type': 'cillum',
        'document.visa.classified_document_type': 'dolore esse eiusmod Excepteur velit',
        'document.visa.clave_de_elector': 'cillum',
        'document.visa.curp': 'eiusmod sint',
        'document.visa.curp_validation_response': 'c1a6749c-626d-4069-a722-351b279d8703',
        'document.visa.dob': 'velit elit est',
        'document.visa.document_number': 'ut elit id velit dolore',
        'document.visa.expires_at': 'ut',
        'document.visa.front.image': 'sed sunt velit',
        'document.visa.front.mime_type': 'adipisicing',
        'document.visa.full_address': '45954 Rodriguez Valleys Suite 467',
        'document.visa.full_name': 'Tommy Hirthe',
        'document.visa.gender': 'reprehenderit ullamco',
        'document.visa.issued_at': 'irure consectetur sit',
        'document.visa.issuing_country': 'British Indian Ocean Territory (Chagos Archipelago)',
        'document.visa.issuing_state': 'Hawaii',
        'document.visa.nationality': 'Duis commodo Excepteur dolor minim',
        'document.visa.ref_number': 'officia enim',
        'document.visa.samba_activity_history_response': 'amet nulla',
        'document.visa.selfie.image': 'tempor dolore',
        'document.visa.selfie.mime_type': 'exercitation nulla et sunt',
        'document.voter_identification.back.image': '9e8b933b-de4c-4fad-815b-87432e42f8ca',
        'document.voter_identification.back.mime_type': 'f42e87d5-f1fd-43cf-957b-652e69bdd537',
        'document.voter_identification.classified_document_type': '8b008eec-61be-4524-948a-c055e2bec384',
        'document.voter_identification.clave_de_elector': 'b5279424-c73d-4237-8dd7-daee0cfb48b3',
        'document.voter_identification.curp': 'ab3d3015-d440-4409-8db4-6156ce8fd022',
        'document.voter_identification.curp_validation_response': '03b47ef1-7f06-42b7-a2e5-0f4b6ada9334',
        'document.voter_identification.dob': '7cb2b351-191d-4af8-8b13-dcb66ebbcbd8',
        'document.voter_identification.document_number': '35a25322-181b-4429-b682-a83882336c6e',
        'document.voter_identification.expires_at': '350a5efa-4dbd-41af-8618-333b4b5e1b61',
        'document.voter_identification.front.image': '8ab8ffc8-0697-4e6e-809a-cd0769f58110',
        'document.voter_identification.front.mime_type': '38d25918-e6cc-407f-9612-300f51f9d404',
        'document.voter_identification.full_address': '948 Kaley Fords Apt. 305',
        'document.voter_identification.full_name': 'Rachel Larson',
        'document.voter_identification.gender': '226c6227-68d3-45cd-a69d-f61c6f677501',
        'document.voter_identification.issued_at': 'e1e37d2b-d0c7-4a2b-b7ce-dedd55db85cb',
        'document.voter_identification.issuing_country': 'Bangladesh',
        'document.voter_identification.issuing_state': 'North Dakota',
        'document.voter_identification.nationality': 'bf0fd55d-7e22-4adb-9073-fe5aea9dd94a',
        'document.voter_identification.ref_number': '87e14ffd-2008-4e5d-96ef-d2a6083b8485',
        'document.voter_identification.samba_activity_history_response': '181aa71a-ae79-4617-a541-9c8b428faf86',
        'document.voter_identification.selfie.image': 'a6729e8f-305b-4d1f-90be-da1115496cab',
        'document.voter_identification.selfie.mime_type': 'fc2aa053-6aa9-4fd5-aba8-6cc22c159260',
        'id.address_line1': '354 Holden Junction Apt. 460',
        'id.address_line2': '85162 Magdalena Radial Apt. 559',
        'id.citizenships': '7b3dfeee-2b1e-4bd2-8446-fc694f6c3163',
        'id.city': 'Verliebury',
        'id.country': 'Belarus',
        'id.dob': 'aac2d945-2ac7-4e83-b994-84c2cee2d6a0',
        'id.drivers_license_number': 'c77268f5-b57d-4134-a987-0f0c7e6ad0f5',
        'id.drivers_license_state': 'Nevada',
        'id.email': 'loraine_mann0@gmail.com',
        'id.first_name': 'Emil',
        'id.itin': 'adbb3c6d-7e8d-4cb5-9470-239835f41317',
        'id.last_name': 'Wehner',
        'id.middle_name': 'Travis Murray',
        'id.nationality': 'de2a4444-2eea-4f4e-b27d-21d810736e55',
        'id.phone_number': '+17395673509',
        'id.ssn4': '3bc2d795-b676-4f6c-a487-d5c8cad5bb6c',
        'id.ssn9': 'b2e8fd11-71cc-4950-83a0-ef25ce936b5b',
        'id.state': 'Missouri',
        'id.us_legal_status': '330f32a8-7ff1-4a35-8ee9-b46e4828cabd',
        'id.us_tax_id': '3a59dd99-9bee-41e8-b515-e4aa45145952',
        'id.visa_expiration_date': '98c36467-c5e0-4034-895a-5faab6979eec',
        'id.visa_kind': '5e4823b8-6523-474c-b253-48fbc6edb3da',
        'id.zip': '78814',
        'investor_profile.annual_income': 'elit quis ut',
        'investor_profile.brokerage_firm_employer': 'labore',
        'investor_profile.declarations': 'proident consequat sunt non',
        'investor_profile.employer': 'Ut',
        'investor_profile.employment_status': 'do nulla minim quis',
        'investor_profile.family_member_names': 'Bernadette Beahan',
        'investor_profile.funding_sources': 'Excepteur',
        'investor_profile.investment_goals': 'aliqua Duis in aute consequat',
        'investor_profile.net_worth': 'laborum et',
        'investor_profile.occupation': 'ut',
        'investor_profile.political_organization': 'anim et',
        'investor_profile.risk_tolerance': 'fugiat laborum in tempor',
        'investor_profile.senior_executive_symbols': 'aliqua enim ut cillum',
      },
      inviter: {
        firstName: 'Alford',
        lastName: 'Denesik',
      },
      name: 'Helen Strosin',
    },
    props,
  ) as HostedBusinessDetail;
export const getHostedBusinessOwner = (props: Partial<HostedBusinessOwner>) =>
  merge(
    {
      createdAt: '1959-10-13T12:56:50.0Z',
      decryptedData: {
        'bank.*.account_type': 'mollit ut sed magna',
        'bank.*.ach_account_id': '88192bfb-d55f-466d-b882-b48eb26f36f7',
        'bank.*.ach_account_number': 'consequat ipsum',
        'bank.*.ach_routing_number': 'in in',
        'bank.*.fingerprint': 'ut',
        'bank.*.name': 'Wade Kling',
        'card.*.billing_address.country': '537 Goodwin Spur Suite 505',
        'card.*.billing_address.zip': '218 Israel Parkway Apt. 466',
        'card.*.cvc': 'sed elit et qui',
        'card.*.expiration': 'veniam ut exercitation in dolor',
        'card.*.expiration_month': 'tempor pariatur officia',
        'card.*.expiration_year': 'Excepteur aliquip dolor cupidatat',
        'card.*.fingerprint': 'cillum laborum',
        'card.*.issuer': 'sed ad officia in non',
        'card.*.name': 'Lauren Olson I',
        'card.*.number': 'sit est laborum irure minim',
        'card.*.number_last4': 'Ut ad irure exercitation',
        'custom.*': 'cillum',
        'document.custom.*': 'est magna reprehenderit qui sunt',
        'document.drivers_license.back.image': 'labore veniam in ad',
        'document.drivers_license.back.mime_type': 'voluptate qui reprehenderit ea consequat',
        'document.drivers_license.classified_document_type': 'minim ut',
        'document.drivers_license.clave_de_elector': 'eu veniam fugiat',
        'document.drivers_license.curp': 'dolor deserunt in magna dolore',
        'document.drivers_license.curp_validation_response': '3f5e4021-6f9b-4cb0-8df4-959f0ef027e6',
        'document.drivers_license.dob': 'fugiat irure exercitation',
        'document.drivers_license.document_number': 'minim reprehenderit',
        'document.drivers_license.expires_at': 'laborum ipsum ex nisi',
        'document.drivers_license.front.image': 'cillum exercitation',
        'document.drivers_license.front.mime_type': 'Excepteur do dolor',
        'document.drivers_license.full_address': '89492 Marvin Dale Suite 844',
        'document.drivers_license.full_name': 'Hilda Terry',
        'document.drivers_license.gender': 'tempor in anim nulla',
        'document.drivers_license.issued_at': 'et',
        'document.drivers_license.issuing_country': 'Papua New Guinea',
        'document.drivers_license.issuing_state': 'Iowa',
        'document.drivers_license.nationality': 'velit elit',
        'document.drivers_license.ref_number': 'non ut sint mollit ullamco',
        'document.drivers_license.samba_activity_history_response': 'exercitation laborum non',
        'document.drivers_license.selfie.image': 'cupidatat consectetur',
        'document.drivers_license.selfie.mime_type': 'dolor ex et',
        'document.finra_compliance_letter': 'id deserunt proident',
        'document.id_card.back.image': 'd029eb7d-867e-4d6a-bc9d-0d55abd9e63e',
        'document.id_card.back.mime_type': '5237744f-ca3b-4533-8eba-f40c68f3c9f6',
        'document.id_card.classified_document_type': '5fc36f9f-1355-4d14-b345-f294129f8d51',
        'document.id_card.clave_de_elector': '48bd1135-8b03-43dd-889d-a624eaaaf063',
        'document.id_card.curp': 'ec7644b5-73df-42fc-b6ac-7bf2c8272f6a',
        'document.id_card.curp_validation_response': '06005171-8156-492b-ac93-45168d01c0fb',
        'document.id_card.dob': 'fa6f3fcb-0ff8-444d-9796-3f4aa318eb92',
        'document.id_card.document_number': 'd6b51dbf-e9db-4481-bf0d-30a5109da0ad',
        'document.id_card.expires_at': 'd799ba7e-ec70-400f-8101-357e8aa2d1dc',
        'document.id_card.front.image': 'aa7231ff-d908-4cee-81db-fa14f27a5fff',
        'document.id_card.front.mime_type': '1872fa9f-6936-4b0a-975d-24e9e97190d8',
        'document.id_card.full_address': '39307 Daugherty Key Apt. 717',
        'document.id_card.full_name': 'Cedric Cartwright',
        'document.id_card.gender': '64b3e82c-c26f-4fe9-9ea8-39626c16a05c',
        'document.id_card.issued_at': 'a6e9642a-e9e7-45a8-b231-5f317ab24a06',
        'document.id_card.issuing_country': 'Guinea-Bissau',
        'document.id_card.issuing_state': 'Alabama',
        'document.id_card.nationality': 'dcc958ab-c089-476c-882d-c9659e26dd9d',
        'document.id_card.ref_number': '9aafb125-91ff-4727-b5af-90e44b5d7a7f',
        'document.id_card.samba_activity_history_response': 'ecaeebff-e642-46af-b59a-0855764da7da',
        'document.id_card.selfie.image': '002697aa-a3f6-4c44-9968-2eb98994422e',
        'document.id_card.selfie.mime_type': 'e50dd86b-3701-48e1-8ef3-2225265aebd0',
        'document.passport.back.image': 'dolore irure occaecat dolor',
        'document.passport.back.mime_type': 'labore qui ut ea occaecat',
        'document.passport.classified_document_type': 'qui',
        'document.passport.clave_de_elector': 'aliqua est exercitation amet sint',
        'document.passport.curp': 'culpa laboris laborum',
        'document.passport.curp_validation_response': '052f1547-3aec-4940-9670-2062badbcf8c',
        'document.passport.dob': 'dolore tempor consequat Excepteur',
        'document.passport.document_number': 'mollit eu',
        'document.passport.expires_at': 'amet ea ullamco Excepteur',
        'document.passport.front.image': 'tempor sunt ut',
        'document.passport.front.mime_type': 'ad pariatur dolor esse',
        'document.passport.full_address': '58569 N 5th Street Suite 871',
        'document.passport.full_name': 'Mr. Jeremiah Lemke',
        'document.passport.gender': 'ipsum aliquip',
        'document.passport.issued_at': 'Excepteur magna anim aliquip dolore',
        'document.passport.issuing_country': 'Antigua and Barbuda',
        'document.passport.issuing_state': 'Alabama',
        'document.passport.nationality': 'esse mollit anim',
        'document.passport.ref_number': 'et magna aliqua',
        'document.passport.samba_activity_history_response': 'irure quis ea',
        'document.passport.selfie.image': 'reprehenderit incididunt ad magna',
        'document.passport.selfie.mime_type': 'consequat enim ipsum',
        'document.passport_card.back.image': 'Duis do tempor Ut Lorem',
        'document.passport_card.back.mime_type': 'in fugiat Duis Ut',
        'document.passport_card.classified_document_type': 'nostrud',
        'document.passport_card.clave_de_elector': 'nostrud Lorem',
        'document.passport_card.curp': 'ut ipsum consectetur',
        'document.passport_card.curp_validation_response': '9ef68a5e-e717-42c2-a9ed-2b4a77525809',
        'document.passport_card.dob': 'nostrud consectetur sed',
        'document.passport_card.document_number': 'qui labore magna commodo',
        'document.passport_card.expires_at': 'aliquip id',
        'document.passport_card.front.image': 'occaecat voluptate tempor magna dolore',
        'document.passport_card.front.mime_type': 'nostrud',
        'document.passport_card.full_address': '8193 S Railroad Street Apt. 493',
        'document.passport_card.full_name': 'Christopher McGlynn',
        'document.passport_card.gender': 'eiusmod nulla sed aliqua',
        'document.passport_card.issued_at': 'laborum Lorem sed adipisicing',
        'document.passport_card.issuing_country': 'Armenia',
        'document.passport_card.issuing_state': 'Mississippi',
        'document.passport_card.nationality': 'Duis irure',
        'document.passport_card.ref_number': 'anim sint officia exercitation',
        'document.passport_card.samba_activity_history_response': 'Excepteur deserunt',
        'document.passport_card.selfie.image': 'magna aliquip Lorem et ipsum',
        'document.passport_card.selfie.mime_type': 'ad velit proident',
        'document.permit.back.image': 'officia aliqua tempor',
        'document.permit.back.mime_type': 'reprehenderit',
        'document.permit.classified_document_type': 'eu sed',
        'document.permit.clave_de_elector': 'dolore laboris exercitation veniam ut',
        'document.permit.curp': 'laborum in irure dolor',
        'document.permit.curp_validation_response': '98b77bd4-5b52-4cf1-a091-a8ff2e2e5d72',
        'document.permit.dob': 'reprehenderit',
        'document.permit.document_number': 'laborum et Excepteur cillum pariatur',
        'document.permit.expires_at': 'occaecat culpa sunt',
        'document.permit.front.image': 'in nisi',
        'document.permit.front.mime_type': 'occaecat sed enim labore minim',
        'document.permit.full_address': '1750 Elsa Glen Apt. 964',
        'document.permit.full_name': 'Steven Dooley',
        'document.permit.gender': 'tempor laborum ad deserunt est',
        'document.permit.issued_at': 'id sint qui exercitation sed',
        'document.permit.issuing_country': 'Antigua and Barbuda',
        'document.permit.issuing_state': 'Arkansas',
        'document.permit.nationality': 'id',
        'document.permit.ref_number': 'sit reprehenderit Ut est',
        'document.permit.samba_activity_history_response': 'reprehenderit quis minim enim',
        'document.permit.selfie.image': 'ullamco',
        'document.permit.selfie.mime_type': 'Ut anim',
        'document.proof_of_address.image': '1824 Broad Street Apt. 318',
        'document.residence_document.back.image': '8f3d9265-f5e7-4655-9317-b215a6136c97',
        'document.residence_document.back.mime_type': '250e1a8d-d3a7-4840-9c6c-2db4a48f7726',
        'document.residence_document.classified_document_type': '6f1f934f-38bf-433e-b38b-6d6ee88b6d6c',
        'document.residence_document.clave_de_elector': '18b1465e-38ea-496b-8940-7d5688fe91d9',
        'document.residence_document.curp': 'd61622fd-505f-4ed8-9b56-81af5d3f3847',
        'document.residence_document.curp_validation_response': 'c4fa9033-9537-4cd6-8099-9233816ec527',
        'document.residence_document.dob': 'f1579b06-3083-4e87-8277-9c56203ab03b',
        'document.residence_document.document_number': '151af7ee-e8db-4357-9d9e-bfa88aba27f2',
        'document.residence_document.expires_at': 'ac19d521-4d7e-4e07-b00e-ea5f9eaf6407',
        'document.residence_document.front.image': '6e20eb41-a446-460a-b420-8facc8ffbb8c',
        'document.residence_document.front.mime_type': '65c0c7b6-4fd5-40a6-8144-8164875456ca',
        'document.residence_document.full_address': '7084 Beahan Overpass Suite 902',
        'document.residence_document.full_name': 'Betsy Muller III',
        'document.residence_document.gender': '35baa2c0-2c46-4168-bcb3-24feced07c01',
        'document.residence_document.issued_at': '3c30a88e-0bd4-4147-8a47-485952cd839d',
        'document.residence_document.issuing_country': 'Greenland',
        'document.residence_document.issuing_state': 'Colorado',
        'document.residence_document.nationality': '9d12e739-bcd9-41b3-b219-dd98f3fe875f',
        'document.residence_document.ref_number': '2d88cc1a-41a4-4cf2-9c01-07ab08e450df',
        'document.residence_document.samba_activity_history_response': '81fb363e-af20-486c-9970-d673a4ddd08c',
        'document.residence_document.selfie.image': '880471b2-020e-4282-9b9e-85989efcbb7d',
        'document.residence_document.selfie.mime_type': 'b311f2c2-a06f-4769-b74f-fa65c11615a4',
        'document.ssn_card.image': 'id tempor nulla reprehenderit',
        'document.visa.back.image': 'veniam sit minim est',
        'document.visa.back.mime_type': 'ut',
        'document.visa.classified_document_type': 'aliquip in',
        'document.visa.clave_de_elector': 'Duis qui pariatur enim',
        'document.visa.curp': 'minim eiusmod ipsum et',
        'document.visa.curp_validation_response': 'f8d4346f-1f0a-40ad-b077-e2e878cc93c9',
        'document.visa.dob': 'tempor consequat',
        'document.visa.document_number': 'ad',
        'document.visa.expires_at': 'laboris deserunt do',
        'document.visa.front.image': 'eu tempor Excepteur laboris',
        'document.visa.front.mime_type': 'Excepteur et aute minim dolore',
        'document.visa.full_address': '33011 Abshire Ramp Apt. 854',
        'document.visa.full_name': 'Ms. Gertrude Morar',
        'document.visa.gender': 'officia ut id culpa reprehenderit',
        'document.visa.issued_at': 'nostrud',
        'document.visa.issuing_country': 'Zimbabwe',
        'document.visa.issuing_state': 'Colorado',
        'document.visa.nationality': 'adipisicing reprehenderit',
        'document.visa.ref_number': 'tempor est laborum',
        'document.visa.samba_activity_history_response': 'sit cillum eu',
        'document.visa.selfie.image': 'esse aliquip anim mollit',
        'document.visa.selfie.mime_type': 'et dolore',
        'document.voter_identification.back.image': 'e1eb9b7c-cb1e-440b-bba6-dc922956e5e8',
        'document.voter_identification.back.mime_type': '50cd5bda-a0fa-4d44-a8f3-6b3e60f8585e',
        'document.voter_identification.classified_document_type': 'a9fced8e-7399-4731-b145-a133edc1e746',
        'document.voter_identification.clave_de_elector': '0c942207-60cf-4686-8818-4f6497d7d778',
        'document.voter_identification.curp': 'f2bcc5d5-200c-46ea-b928-808ab0d8314d',
        'document.voter_identification.curp_validation_response': '149a4ac9-a8da-4116-a5ae-bcc8d23bf9bb',
        'document.voter_identification.dob': 'af53b0af-2ad6-4c3e-84d6-67806e6214d7',
        'document.voter_identification.document_number': 'f0076921-4c1d-4097-aa5b-4b550982c3c7',
        'document.voter_identification.expires_at': '39aad8d0-d63b-4ef7-ba6c-bbde2007c5a8',
        'document.voter_identification.front.image': '29b830c9-44a0-44b5-9f16-b530131553fa',
        'document.voter_identification.front.mime_type': '5d3a46b8-d2e6-408f-aca7-fe8eef4fbba3',
        'document.voter_identification.full_address': '91801 Jayme Lane Apt. 251',
        'document.voter_identification.full_name': 'Kimberly Thiel-Corwin',
        'document.voter_identification.gender': '50c135da-adde-4e98-9f81-f1867ad9c570',
        'document.voter_identification.issued_at': '6a73659a-c08b-4622-bb49-c8b04da208bb',
        'document.voter_identification.issuing_country': 'Tuvalu',
        'document.voter_identification.issuing_state': 'Utah',
        'document.voter_identification.nationality': 'da68b81c-3c6b-41e7-895f-ce7e64614410',
        'document.voter_identification.ref_number': '860f9ae0-9edb-4b2f-aaa2-511642b05c80',
        'document.voter_identification.samba_activity_history_response': '76043976-ea65-4ffd-9f91-8222455d7ce4',
        'document.voter_identification.selfie.image': 'c4a4662b-8d62-4817-9647-2112402f91a2',
        'document.voter_identification.selfie.mime_type': 'a30cede5-a6df-453c-9dd5-7bc6fecbd6a9',
        'id.address_line1': '569 Sarah Mountain Suite 447',
        'id.address_line2': '80602 Lera Ridges Suite 218',
        'id.citizenships': '18cbb45d-6a54-4e17-a9b7-4baaeab04cdd',
        'id.city': 'Murazikboro',
        'id.country': 'Guinea-Bissau',
        'id.dob': '5c3ad91c-530d-4bde-8264-0c8c6bc5e9a1',
        'id.drivers_license_number': 'f94eaf0c-d556-4cf1-9eef-d4ed0f08fae2',
        'id.drivers_license_state': 'Wisconsin',
        'id.email': 'shea.bailey28@gmail.com',
        'id.first_name': 'Jermey',
        'id.itin': '286ab895-59b7-45a4-a5d0-14b3ce740730',
        'id.last_name': 'Fadel',
        'id.middle_name': 'Spencer Altenwerth',
        'id.nationality': '27ff7384-6393-41df-885a-cf04388642a8',
        'id.phone_number': '+19289933208',
        'id.ssn4': '4c2b07cd-7640-4af3-9e29-6a3892d8162e',
        'id.ssn9': 'e5e15b02-7207-432d-a1f5-d4c8bf20fa5d',
        'id.state': 'Vermont',
        'id.us_legal_status': '6c7c66d2-d506-45da-acc3-6b6107d55100',
        'id.us_tax_id': 'e4eda44d-1260-4533-9b0a-a69c558b0b09',
        'id.visa_expiration_date': '674d83ca-49eb-4252-ab86-aa5e789e195c',
        'id.visa_kind': 'dc4be68f-9b62-4ab5-88c7-b0033ef593d4',
        'id.zip': '18510',
        'investor_profile.annual_income': 'nisi occaecat ex',
        'investor_profile.brokerage_firm_employer': 'minim Excepteur',
        'investor_profile.declarations': 'Lorem',
        'investor_profile.employer': 'occaecat sint cillum amet magna',
        'investor_profile.employment_status': 'aute in magna Duis voluptate',
        'investor_profile.family_member_names': 'Irma Hartmann',
        'investor_profile.funding_sources': 'in aute id aliqua dolore',
        'investor_profile.investment_goals': 'sunt eu cupidatat',
        'investor_profile.net_worth': 'proident sed ipsum enim',
        'investor_profile.occupation': 'proident dolore voluptate aute reprehenderit',
        'investor_profile.political_organization': 'cupidatat ut Ut Excepteur',
        'investor_profile.risk_tolerance': 'ipsum voluptate irure',
        'investor_profile.senior_executive_symbols': 'eiusmod quis pariatur aute',
      },
      hasLinkedUser: true,
      isAuthedUser: false,
      isMutable: false,
      linkId: '8ae139b0-3d85-4a22-a6bf-70448a80c36b',
      ownershipStake: -95728893,
      populatedData: ['document.visa.selfie.mime_type', 'document.id_card.full_name', 'business.tin'],
      uuid: '660055ab-e617-44a7-ac80-a570bb2a022a',
    },
    props,
  ) as HostedBusinessOwner;
export const getHostedValidateResponse = (props: Partial<HostedValidateResponse>) =>
  merge(
    {
      validationToken: 'b295d55d-514a-4b67-9e7f-d8d4148f48d8',
    },
    props,
  ) as HostedValidateResponse;
export const getHostedWorkflowRequest = (props: Partial<HostedWorkflowRequest>) =>
  merge(
    {
      config: {
        data: {
          businessConfigs: [
            {
              data: {
                requiresHumanReview: false,
              },
              kind: 'proof_of_address',
            },
            {
              data: {
                collectSelfie: false,
              },
              kind: 'identity',
            },
            {
              data: {
                description: 'enim minim consequat aliqua pariatur',
                identifier: 'document.passport.full_address',
                name: 'quis irure reprehenderit',
                requiresHumanReview: true,
                uploadSettings: 'prefer_capture',
              },
              kind: 'custom',
            },
          ],
          configs: [
            {
              data: {
                requiresHumanReview: true,
              },
              kind: 'proof_of_address',
            },
            {
              data: {
                requiresHumanReview: true,
              },
              kind: 'proof_of_ssn',
            },
            {
              data: {
                description: 'aliquip consectetur Duis',
                identifier: 'id.first_name',
                name: 'ut elit deserunt amet ea',
                requiresHumanReview: true,
                uploadSettings: 'capture_only_on_mobile',
              },
              kind: 'custom',
            },
          ],
          playbookId: 'mollit ea dolor id Excepteur',
          recollectAttributes: ['name', 'full_address', 'bank'],
          reuseExistingBoKyc: false,
        },
        kind: 'document',
      },
      note: 'do',
    },
    props,
  ) as HostedWorkflowRequest;
export const getIdDocKind = (props: Partial<IdDocKind>) => (props ?? 'voter_identification') as IdDocKind;
export const getIdentifiedUser = (props: Partial<IdentifiedUser>) =>
  merge(
    {
      authMethods: [
        {
          isVerified: true,
          kind: 'email',
        },
        {
          isVerified: true,
          kind: 'phone',
        },
        {
          isVerified: false,
          kind: 'phone',
        },
      ],
      availableChallengeKinds: ['sms', 'email', 'sms'],
      canInitiateSignupChallenge: true,
      hasSyncablePasskey: true,
      isUnverified: true,
      matchingFps: [
        'document.drivers_license.back.mime_type',
        'document.visa.classified_document_type',
        'document.voter_identification.curp_validation_response',
      ],
      scrubbedEmail: 'ramon_spencer@gmail.com',
      scrubbedPhone: '+18502507286',
      token: 'bf54cc30-c1c5-4b7c-9531-4dc8278ec19c',
      tokenScopes: ['explicit_auth', 'vault_data', 'auth'],
    },
    props,
  ) as IdentifiedUser;
export const getIdentifyAuthMethod = (props: Partial<IdentifyAuthMethod>) =>
  merge(
    {
      isVerified: false,
      kind: 'phone',
    },
    props,
  ) as IdentifyAuthMethod;
export const getIdentifyChallengeResponse = (props: Partial<IdentifyChallengeResponse>) =>
  merge(
    {
      challengeData: {
        biometricChallengeJson: 'tempor est deserunt',
        challengeKind: 'sms',
        challengeToken: '705e4980-3195-4879-a041-f4d3ef60b434',
        timeBeforeRetryS: -12616709,
        token: '92bbc0c5-6f40-41bd-a5d2-5566992fb514',
      },
      error: 'occaecat',
    },
    props,
  ) as IdentifyChallengeResponse;
export const getIdentifyId = (props: Partial<IdentifyId>) =>
  merge(
    {
      email: 'consequat',
      phoneNumber: 'qui irure dolor do dolor',
    },
    props,
  ) as IdentifyId;
export const getIdentifyRequest = (props: Partial<IdentifyRequest>) =>
  merge(
    {
      email: 'viola.mante53@gmail.com',
      identifier: '9bb28265-1c6a-4a55-b2c2-a11d7434671a',
      phoneNumber: '+14115098573',
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
            isVerified: true,
            kind: 'passkey',
          },
          {
            isVerified: false,
            kind: 'email',
          },
          {
            isVerified: false,
            kind: 'phone',
          },
        ],
        availableChallengeKinds: ['sms', 'sms', 'biometric'],
        canInitiateSignupChallenge: false,
        hasSyncablePasskey: true,
        isUnverified: false,
        matchingFps: ['document.drivers_license.ref_number', 'document.id_card.dob', 'document.visa.back.mime_type'],
        scrubbedEmail: 'noe.lebsack@gmail.com',
        scrubbedPhone: '+18728931811',
        token: '76e85ee4-60ba-4354-abac-01289d0c4a2b',
        tokenScopes: ['sign_up', 'auth', 'vault_data'],
      },
    },
    props,
  ) as IdentifyResponse;
export const getIdentifyScope = (props: Partial<IdentifyScope>) => (props ?? 'onboarding') as IdentifyScope;
export const getIdentifyVerifyRequest = (props: Partial<IdentifyVerifyRequest>) =>
  merge(
    {
      challengeResponse: 'qui consectetur',
      challengeToken: 'c2aee28d-b08d-4de7-9272-79c2344ff393',
      scope: 'onboarding',
    },
    props,
  ) as IdentifyVerifyRequest;
export const getIdentifyVerifyResponse = (props: Partial<IdentifyVerifyResponse>) =>
  merge(
    {
      authToken: '69b6b608-fe0f-425d-a8a1-8865a1f32fc8',
    },
    props,
  ) as IdentifyVerifyResponse;
export const getInviter = (props: Partial<Inviter>) =>
  merge(
    {
      firstName: 'Rhea',
      lastName: 'Reinger',
    },
    props,
  ) as Inviter;
export const getIso3166TwoDigitCountryCode = (props: Partial<Iso3166TwoDigitCountryCode>) =>
  (props ?? 'PH') as Iso3166TwoDigitCountryCode;
export const getKbaResponse = (props: Partial<KbaResponse>) =>
  merge(
    {
      token: 'de3c7a52-470a-49c8-a22a-56e3401d2db5',
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
      email: 'andreanne33@gmail.com',
      phoneNumber: '+16293618738',
    },
    props,
  ) as LiteIdentifyRequest;
export const getLiteIdentifyResponse = (props: Partial<LiteIdentifyResponse>) =>
  merge(
    {
      userFound: false,
    },
    props,
  ) as LiteIdentifyResponse;
export const getLogBody = (props: Partial<LogBody>) =>
  merge(
    {
      logLevel: 'reprehenderit sint elit dolor aliquip',
      logMessage: 'Lorem dolore Duis',
      sdkKind: 'sit aliqua',
      sdkName: 'Patti Towne',
      sdkVersion: 'nostrud ad exercitation consequat reprehenderit',
      sessionId: 'ca49cd48-ada6-4de6-b242-5463366172ad',
      tenantDomain: 'amet esse',
    },
    props,
  ) as LogBody;
export const getLoginChallengeRequest = (props: Partial<LoginChallengeRequest>) =>
  merge(
    {
      challengeKind: 'biometric',
    },
    props,
  ) as LoginChallengeRequest;
export const getModernRawBusinessDataRequest = (props: Partial<ModernRawBusinessDataRequest>) =>
  merge(
    {
      'business.address_line1': '38499 Terry Forest Apt. 231',
      'business.address_line2': '6962 N 6th Street Suite 954',
      'business.city': 'Alexandroville',
      'business.corporation_type': 'fugiat veniam nostrud',
      'business.country': 'Djibouti',
      'business.dba': 'in',
      'business.formation_date': 'laboris',
      'business.formation_state': 'Mississippi',
      'business.name': 'Francisco Bailey II',
      'business.phone_number': '+19308250426',
      'business.state': 'Texas',
      'business.tin': 'ullamco',
      'business.website': 'https://cumbersome-polyester.com/',
      'business.zip': '67640',
      'custom.*': 'eu dolor in',
    },
    props,
  ) as ModernRawBusinessDataRequest;
export const getModernRawUserDataRequest = (props: Partial<ModernRawUserDataRequest>) =>
  merge(
    {
      'bank.*.account_type': 'nostrud',
      'bank.*.ach_account_id': '97107ba6-4c97-4059-be1e-054ac498aef2',
      'bank.*.ach_account_number': 'commodo',
      'bank.*.ach_routing_number': 'et cillum eiusmod qui consectetur',
      'bank.*.fingerprint': 'aliquip in sit aute',
      'bank.*.name': 'Adrian DuBuque',
      'card.*.billing_address.country': '173 E Broad Street Suite 895',
      'card.*.billing_address.zip': '9731 N Cedar Street Apt. 164',
      'card.*.cvc': 'dolor labore aute amet cupidatat',
      'card.*.expiration': 'mollit',
      'card.*.expiration_month': 'dolore sint',
      'card.*.expiration_year': 'culpa',
      'card.*.fingerprint': 'laboris pariatur eiusmod ut',
      'card.*.issuer': 'sed velit',
      'card.*.name': 'Ms. Tracey Ruecker',
      'card.*.number': 'minim Duis',
      'card.*.number_last4': 'ex anim aute Duis',
      'custom.*': 'culpa Excepteur laboris fugiat',
      'document.custom.*': 'Excepteur in',
      'document.drivers_license.back.image': 'non aute elit Lorem',
      'document.drivers_license.back.mime_type': 'mollit',
      'document.drivers_license.classified_document_type': 'aute aliquip',
      'document.drivers_license.clave_de_elector': 'cillum non',
      'document.drivers_license.curp': 'ea',
      'document.drivers_license.curp_validation_response': '4d0d94e7-a4c5-4361-9d9a-b74f856c27ec',
      'document.drivers_license.dob': 'sed ut in',
      'document.drivers_license.document_number': 'incididunt',
      'document.drivers_license.expires_at': 'ut',
      'document.drivers_license.front.image': 'do dolor nostrud proident adipisicing',
      'document.drivers_license.front.mime_type': 'ut sit',
      'document.drivers_license.full_address': '10932 Springfield Road Suite 561',
      'document.drivers_license.full_name': 'Olga Jacobs MD',
      'document.drivers_license.gender': 'amet dolor tempor laborum',
      'document.drivers_license.issued_at': 'Ut ut pariatur',
      'document.drivers_license.issuing_country': 'Monaco',
      'document.drivers_license.issuing_state': 'Nevada',
      'document.drivers_license.nationality': 'ea deserunt esse consectetur Duis',
      'document.drivers_license.ref_number': 'pariatur',
      'document.drivers_license.samba_activity_history_response': 'nulla dolor ipsum',
      'document.drivers_license.selfie.image': 'exercitation occaecat',
      'document.drivers_license.selfie.mime_type': 'eu in cupidatat proident',
      'document.finra_compliance_letter': 'dolor ipsum',
      'document.id_card.back.image': 'bdef6d15-9216-4613-aa3e-92771abed309',
      'document.id_card.back.mime_type': '4248f588-85a9-4210-833d-e5f4466d7b6c',
      'document.id_card.classified_document_type': '7782ade3-54f4-4935-a5e5-b66ccf6a238f',
      'document.id_card.clave_de_elector': '7b3d996a-4251-4f8a-a197-93817aabcba8',
      'document.id_card.curp': '67574c4c-b1e6-4074-a9d8-8c996dac4c3f',
      'document.id_card.curp_validation_response': '27a8c157-c205-438e-9e2a-2d69cd596ed2',
      'document.id_card.dob': '8858b570-a643-43ce-87fb-231041909546',
      'document.id_card.document_number': '901b754c-c9b6-4f36-af17-1a281b3eac03',
      'document.id_card.expires_at': '71b9b517-7ae0-4c31-8fdd-056b8b8fa1ce',
      'document.id_card.front.image': '23582365-1607-4a61-ab12-eb6fe4d57990',
      'document.id_card.front.mime_type': '73808840-a165-43ea-b02a-b66188568158',
      'document.id_card.full_address': '94934 E 12th Street Suite 499',
      'document.id_card.full_name': 'Miss Delores Jacobs',
      'document.id_card.gender': '0e8966a2-fce3-4f88-992f-d7ad770c37f0',
      'document.id_card.issued_at': '7058c224-7bfe-4183-a27d-974da074dc65',
      'document.id_card.issuing_country': 'Costa Rica',
      'document.id_card.issuing_state': 'New Jersey',
      'document.id_card.nationality': '4440ef7e-fba1-4186-86b6-65c0c5e26b9a',
      'document.id_card.ref_number': '743d59db-5afe-4e2c-a3bf-8699d84ee458',
      'document.id_card.samba_activity_history_response': '8995c2b4-f4d4-404a-b0c7-303ae4d31328',
      'document.id_card.selfie.image': 'fdaeb7e2-75ce-4c30-b25b-dad79d4fe3a0',
      'document.id_card.selfie.mime_type': '429b4c1c-f645-41aa-95b3-5e24dc677680',
      'document.passport.back.image': 'voluptate laborum',
      'document.passport.back.mime_type': 'sint Duis dolor labore est',
      'document.passport.classified_document_type': 'dolor labore ipsum deserunt anim',
      'document.passport.clave_de_elector': 'amet in tempor minim',
      'document.passport.curp': 'laborum magna dolor sit',
      'document.passport.curp_validation_response': 'fbbf83a1-5c8d-4bd4-bd30-a9a3f16f2ceb',
      'document.passport.dob': 'sunt',
      'document.passport.document_number': 'cupidatat non et incididunt',
      'document.passport.expires_at': 'aute',
      'document.passport.front.image': 'consectetur ullamco qui dolore',
      'document.passport.front.mime_type': 'esse incididunt Excepteur exercitation aute',
      'document.passport.full_address': '51931 S Grand Avenue Suite 849',
      'document.passport.full_name': 'Mrs. Shelley Cronin',
      'document.passport.gender': 'elit eu enim sed aliqua',
      'document.passport.issued_at': 'ea',
      'document.passport.issuing_country': 'Poland',
      'document.passport.issuing_state': 'Iowa',
      'document.passport.nationality': 'dolor consectetur',
      'document.passport.ref_number': 'adipisicing',
      'document.passport.samba_activity_history_response': 'proident deserunt ipsum cupidatat',
      'document.passport.selfie.image': 'dolore Duis ea sit',
      'document.passport.selfie.mime_type': 'ex ut Ut voluptate',
      'document.passport_card.back.image': 'pariatur sed tempor consequat',
      'document.passport_card.back.mime_type': 'occaecat',
      'document.passport_card.classified_document_type': 'voluptate',
      'document.passport_card.clave_de_elector': 'consectetur ea in do',
      'document.passport_card.curp': 'dolor ut id pariatur Excepteur',
      'document.passport_card.curp_validation_response': 'f4f3ea80-1661-4be3-a9b8-ab70c4b9eee1',
      'document.passport_card.dob': 'magna',
      'document.passport_card.document_number': 'laborum Lorem ullamco',
      'document.passport_card.expires_at': 'culpa',
      'document.passport_card.front.image': 'eiusmod',
      'document.passport_card.front.mime_type': 'nulla veniam sit',
      'document.passport_card.full_address': '232 Water Street Apt. 530',
      'document.passport_card.full_name': 'Sherry Prosacco',
      'document.passport_card.gender': 'Lorem',
      'document.passport_card.issued_at': 'Duis laboris veniam non sit',
      'document.passport_card.issuing_country': 'Slovenia',
      'document.passport_card.issuing_state': 'Rhode Island',
      'document.passport_card.nationality': 'ut dolor amet',
      'document.passport_card.ref_number': 'voluptate Excepteur ea sint amet',
      'document.passport_card.samba_activity_history_response': 'id',
      'document.passport_card.selfie.image': 'non ad',
      'document.passport_card.selfie.mime_type': 'pariatur dolore elit',
      'document.permit.back.image': 'velit officia pariatur in',
      'document.permit.back.mime_type': 'tempor nulla est et Excepteur',
      'document.permit.classified_document_type': 'esse elit id',
      'document.permit.clave_de_elector': 'deserunt laborum Excepteur magna',
      'document.permit.curp': 'in anim',
      'document.permit.curp_validation_response': 'b6d308c1-5607-4a5a-add1-60ce86ca5410',
      'document.permit.dob': 'sint sunt ut sit consectetur',
      'document.permit.document_number': 'in velit ipsum',
      'document.permit.expires_at': 'laboris nulla mollit voluptate',
      'document.permit.front.image': 'sint sunt in',
      'document.permit.front.mime_type': 'dolor sed minim',
      'document.permit.full_address': '295 Brando Summit Apt. 332',
      'document.permit.full_name': 'Sharon Bayer',
      'document.permit.gender': 'qui',
      'document.permit.issued_at': 'eu non sed reprehenderit do',
      'document.permit.issuing_country': 'Anguilla',
      'document.permit.issuing_state': 'West Virginia',
      'document.permit.nationality': 'voluptate dolore',
      'document.permit.ref_number': 'fugiat aliquip sint nostrud sit',
      'document.permit.samba_activity_history_response': 'velit proident',
      'document.permit.selfie.image': 'laboris in consectetur non',
      'document.permit.selfie.mime_type': 'Duis ut elit cillum reprehenderit',
      'document.proof_of_address.image': '752 Boyle Trace Apt. 261',
      'document.residence_document.back.image': '56294918-8efd-40d5-a33f-5cb11c5eeeff',
      'document.residence_document.back.mime_type': 'ac507bca-f778-4332-a437-1a3de331d2e3',
      'document.residence_document.classified_document_type': 'a2f5f168-4fe8-4639-897d-c5a6704a7461',
      'document.residence_document.clave_de_elector': '626914e6-1817-4165-8d7c-360d3d4796a7',
      'document.residence_document.curp': '1dd58a51-1508-4474-84e7-e2c013e81ace',
      'document.residence_document.curp_validation_response': 'e91bb95c-bb1d-4fa6-856c-e29d2d0e6af9',
      'document.residence_document.dob': 'd3e75ed1-fe3b-4077-af77-92d739722e89',
      'document.residence_document.document_number': 'ab140d9e-fc2e-4def-918b-d5234fef69c1',
      'document.residence_document.expires_at': 'a31a2a76-b168-4462-8dbe-3c1fc96b2c5c',
      'document.residence_document.front.image': 'c75603bf-6374-4a17-9699-3811eabf4856',
      'document.residence_document.front.mime_type': '6846c2b6-50bf-48ed-a0a5-ef98419e6019',
      'document.residence_document.full_address': '6425 Glenda Underpass Apt. 437',
      'document.residence_document.full_name': 'Johanna Torp',
      'document.residence_document.gender': 'c20b4545-ae90-4bae-b729-c1ab9097e078',
      'document.residence_document.issued_at': 'c68c89c9-0095-476e-b5de-c42ac27045db',
      'document.residence_document.issuing_country': 'Macao',
      'document.residence_document.issuing_state': 'Maine',
      'document.residence_document.nationality': 'cc5ad914-988e-4df4-a919-2a5a61d2dde9',
      'document.residence_document.ref_number': '0421ae3f-5901-41e2-a155-50bffdc0a6b8',
      'document.residence_document.samba_activity_history_response': '2386f58d-15cf-46b3-a2e4-af49c6697f4f',
      'document.residence_document.selfie.image': '02773f0d-716f-47b5-aca1-97b24e86fdc0',
      'document.residence_document.selfie.mime_type': 'd2a96bae-6b3c-4b44-8c64-981701735c8f',
      'document.ssn_card.image': 'pariatur dolore laborum nostrud sunt',
      'document.visa.back.image': 'commodo incididunt dolore in ut',
      'document.visa.back.mime_type': 'non reprehenderit voluptate',
      'document.visa.classified_document_type': 'occaecat sunt dolor amet',
      'document.visa.clave_de_elector': 'amet in fugiat sint minim',
      'document.visa.curp': 'sint mollit occaecat officia',
      'document.visa.curp_validation_response': '7b92a9a0-fa79-44f5-8f30-6d647d2f006f',
      'document.visa.dob': 'ex labore esse Excepteur',
      'document.visa.document_number': 'sunt',
      'document.visa.expires_at': 'tempor nisi laboris pariatur',
      'document.visa.front.image': 'incididunt in',
      'document.visa.front.mime_type': 'occaecat',
      'document.visa.full_address': '7456 Kuhic Club Suite 966',
      'document.visa.full_name': 'Wendell Hirthe',
      'document.visa.gender': 'qui',
      'document.visa.issued_at': 'nostrud aliqua anim ullamco non',
      'document.visa.issuing_country': 'Nigeria',
      'document.visa.issuing_state': 'New York',
      'document.visa.nationality': 'eu',
      'document.visa.ref_number': 'id deserunt aute',
      'document.visa.samba_activity_history_response': 'pariatur',
      'document.visa.selfie.image': 'voluptate in aliqua in',
      'document.visa.selfie.mime_type': 'proident in est cupidatat',
      'document.voter_identification.back.image': 'c70348ca-15fe-44ae-8a62-ee41814c94c2',
      'document.voter_identification.back.mime_type': 'd57c0f27-e13b-476f-a0e3-33b6a7d8c2b8',
      'document.voter_identification.classified_document_type': '4daeeda5-809a-4006-8c27-b255312bda8f',
      'document.voter_identification.clave_de_elector': '63989bf8-474e-4861-9b60-428a4997808f',
      'document.voter_identification.curp': 'cd73da23-49f7-43f4-b500-a1dee240f9ce',
      'document.voter_identification.curp_validation_response': '5d4ea79a-4781-4400-af62-2ac36d75acdf',
      'document.voter_identification.dob': '0a4e67eb-a2f0-4def-97bd-318788e5a204',
      'document.voter_identification.document_number': '3a899bf5-afb2-47e0-9c11-88774462706b',
      'document.voter_identification.expires_at': '51981510-0913-4740-9253-51855580dc86',
      'document.voter_identification.front.image': '9a3aef27-8b3c-4111-ab04-3823950acf9d',
      'document.voter_identification.front.mime_type': '78df07f1-91c9-4e52-bbc7-f46a025c3982',
      'document.voter_identification.full_address': '56886 Kessler Heights Apt. 467',
      'document.voter_identification.full_name': 'Miss Casey Pollich',
      'document.voter_identification.gender': '6c163cae-158e-4869-ba1f-ad29e2abeb81',
      'document.voter_identification.issued_at': '9e847f37-ef22-4f98-a991-abe2934c5a9b',
      'document.voter_identification.issuing_country': 'Norway',
      'document.voter_identification.issuing_state': 'Wyoming',
      'document.voter_identification.nationality': 'aedeca19-72da-458a-895c-a357f3cedadd',
      'document.voter_identification.ref_number': 'e050acea-149f-49a1-8378-e5bdacb7b676',
      'document.voter_identification.samba_activity_history_response': '2d346d9a-ec34-4a08-bf6c-7ab058d7e119',
      'document.voter_identification.selfie.image': 'af119a06-baa8-494d-99c1-2cdce4ad3e6f',
      'document.voter_identification.selfie.mime_type': '1cd8449c-2d4f-4568-b205-737831588f20',
      'id.address_line1': '63443 McKenzie Rue Suite 740',
      'id.address_line2': '503 Brennan Unions Suite 549',
      'id.citizenships': '3c10a945-8ee5-4dbc-ace6-24565f2c8e3d',
      'id.city': 'Beahanborough',
      'id.country': 'Thailand',
      'id.dob': 'c609523e-fef6-4f09-8e72-f1e68cbcc7de',
      'id.drivers_license_number': '2cd5d322-291c-48b3-b6af-4400acc4c569',
      'id.drivers_license_state': 'Hawaii',
      'id.email': 'ulices.reynolds@gmail.com',
      'id.first_name': 'Ellsworth',
      'id.itin': '84a1845d-b696-4571-99f5-f77fe7b290ee',
      'id.last_name': 'Reynolds',
      'id.middle_name': 'Melvin Lebsack PhD',
      'id.nationality': '9b163f91-54bd-40c1-a6b4-a2affce300b0',
      'id.phone_number': '+15318479751',
      'id.ssn4': '0921edd8-1418-4fd3-ace0-c4946041d8b7',
      'id.ssn9': '9d4ed16e-481d-4caa-ac51-00e72b2a5a84',
      'id.state': 'Massachusetts',
      'id.us_legal_status': 'b1d4c57e-876f-447b-b51b-10c965f2cccf',
      'id.us_tax_id': '47bf1c89-af0f-4c1a-898d-857515b5250c',
      'id.visa_expiration_date': 'dd51b67d-6a56-4f64-8aca-dfa0bf342d9e',
      'id.visa_kind': '06900b73-fafa-4e22-931c-4770571fce33',
      'id.zip': '02756-5231',
      'investor_profile.annual_income': 'in magna',
      'investor_profile.brokerage_firm_employer': 'consectetur ut occaecat pariatur',
      'investor_profile.declarations': 'officia in ullamco minim ipsum',
      'investor_profile.employer': 'aliqua sed velit non in',
      'investor_profile.employment_status': 'commodo consequat',
      'investor_profile.family_member_names': 'Edward Zemlak',
      'investor_profile.funding_sources': 'ut ex do',
      'investor_profile.investment_goals': 'ipsum aliquip aute',
      'investor_profile.net_worth': 'deserunt minim',
      'investor_profile.occupation': 'elit anim veniam velit dolor',
      'investor_profile.political_organization': 'amet anim cupidatat quis',
      'investor_profile.risk_tolerance': 'fugiat ea minim',
      'investor_profile.senior_executive_symbols': 'mollit laborum',
    },
    props,
  ) as ModernRawUserDataRequest;
export const getModernUserDecryptResponse = (props: Partial<ModernUserDecryptResponse>) =>
  merge(
    {
      'bank.*.account_type': 'ut exercitation aliqua in enim',
      'bank.*.ach_account_id': '295b698f-51aa-4b05-a64e-5f042a939806',
      'bank.*.ach_account_number': 'reprehenderit Lorem et sed',
      'bank.*.ach_routing_number': 'laborum ut fugiat',
      'bank.*.fingerprint': 'anim dolore mollit in dolor',
      'bank.*.name': 'Crystal Dickens',
      'card.*.billing_address.country': '76614 South Street Apt. 459',
      'card.*.billing_address.zip': '27666 McCullough Circles Suite 470',
      'card.*.cvc': 'minim adipisicing Lorem ex cupidatat',
      'card.*.expiration': 'veniam enim',
      'card.*.expiration_month': 'culpa',
      'card.*.expiration_year': 'aliqua cupidatat aute reprehenderit',
      'card.*.fingerprint': 'sint',
      'card.*.issuer': 'sit magna non',
      'card.*.name': 'Lisa Wyman',
      'card.*.number': 'tempor enim',
      'card.*.number_last4': 'adipisicing anim',
      'custom.*': 'enim in irure laborum veniam',
      'document.custom.*': 'in voluptate sed anim quis',
      'document.drivers_license.back.image': 'veniam in ad qui aute',
      'document.drivers_license.back.mime_type': 'non laboris id nulla fugiat',
      'document.drivers_license.classified_document_type': 'ea',
      'document.drivers_license.clave_de_elector': 'exercitation laboris',
      'document.drivers_license.curp': 'ea eiusmod in velit pariatur',
      'document.drivers_license.curp_validation_response': '5ece6be7-164d-4640-a947-d3072a6034f7',
      'document.drivers_license.dob': 'ut enim ullamco eu amet',
      'document.drivers_license.document_number': 'Duis incididunt in veniam',
      'document.drivers_license.expires_at': 'nulla officia ea eu amet',
      'document.drivers_license.front.image': 'voluptate',
      'document.drivers_license.front.mime_type': 'deserunt officia ullamco Excepteur',
      'document.drivers_license.full_address': '2421 Thiel-Rempel Wells Suite 469',
      'document.drivers_license.full_name': 'Ben Bashirian',
      'document.drivers_license.gender': 'incididunt anim Duis aute',
      'document.drivers_license.issued_at': 'aliqua',
      'document.drivers_license.issuing_country': 'Liberia',
      'document.drivers_license.issuing_state': 'Oklahoma',
      'document.drivers_license.nationality': 'occaecat quis',
      'document.drivers_license.ref_number': 'ex officia',
      'document.drivers_license.samba_activity_history_response': 'ex proident',
      'document.drivers_license.selfie.image': 'ipsum',
      'document.drivers_license.selfie.mime_type': 'Excepteur',
      'document.finra_compliance_letter': 'reprehenderit',
      'document.id_card.back.image': 'a7234a77-a736-49d9-805a-699329be61fa',
      'document.id_card.back.mime_type': '5d3a9ce1-ca73-47aa-9ed8-88550c4973e0',
      'document.id_card.classified_document_type': 'ca34022a-951a-44ff-b1d5-367f343cdc92',
      'document.id_card.clave_de_elector': '94316ee5-7814-4060-b140-0e316380471b',
      'document.id_card.curp': '35de796a-c0c4-4811-97a1-6b8532e2e845',
      'document.id_card.curp_validation_response': '254d22ad-8875-4350-85ae-ccdc9762272f',
      'document.id_card.dob': '40677ea3-f629-440c-a5b0-375f48e04f2b',
      'document.id_card.document_number': '7d49f207-aad4-4e65-bb84-311cdd118261',
      'document.id_card.expires_at': '15f42442-65fb-4965-90c5-55fbe83cb81c',
      'document.id_card.front.image': '190e2eb7-829e-49c1-af07-bf5a649b7c60',
      'document.id_card.front.mime_type': 'bf50ec04-adc8-4419-a937-c6d9d1b6a7c7',
      'document.id_card.full_address': '7052 Jeffery Curve Suite 517',
      'document.id_card.full_name': 'Mrs. Janis Stehr',
      'document.id_card.gender': '70970c02-c442-46bf-8dd6-2356ad895d54',
      'document.id_card.issued_at': 'bde1a62b-07c5-4bac-8cdf-936f36f47147',
      'document.id_card.issuing_country': 'Togo',
      'document.id_card.issuing_state': 'Nebraska',
      'document.id_card.nationality': 'd1d3948c-728a-4a43-b396-3dab904419b6',
      'document.id_card.ref_number': 'e06caece-e9f0-411a-b0ec-45337274f486',
      'document.id_card.samba_activity_history_response': 'd54cab3d-6cf2-40d8-b94a-5e15cfb132ab',
      'document.id_card.selfie.image': 'd86ed480-b18b-42ad-973c-53a6c8dd8ec5',
      'document.id_card.selfie.mime_type': '70fb1b1d-8cd2-4a7e-951e-983815ea1b0a',
      'document.passport.back.image': 'dolor dolore est pariatur sit',
      'document.passport.back.mime_type': 'nisi adipisicing commodo',
      'document.passport.classified_document_type': 'dolor amet Excepteur qui',
      'document.passport.clave_de_elector': 'exercitation consectetur sunt minim commodo',
      'document.passport.curp': 'irure labore minim cillum enim',
      'document.passport.curp_validation_response': '3588a037-fa0e-4745-b9ae-ca0ecc5a32cb',
      'document.passport.dob': 'aute enim veniam',
      'document.passport.document_number': 'consequat',
      'document.passport.expires_at': 'ex',
      'document.passport.front.image': 'id ut dolore in mollit',
      'document.passport.front.mime_type': 'ad quis',
      'document.passport.full_address': '4403 Alysa Gardens Apt. 527',
      'document.passport.full_name': 'Dixie Schoen',
      'document.passport.gender': 'sed',
      'document.passport.issued_at': 'Excepteur',
      'document.passport.issuing_country': 'Germany',
      'document.passport.issuing_state': 'Tennessee',
      'document.passport.nationality': 'nostrud in',
      'document.passport.ref_number': 'id pariatur fugiat',
      'document.passport.samba_activity_history_response': 'dolore non magna do velit',
      'document.passport.selfie.image': 'dolore consectetur dolor ad Duis',
      'document.passport.selfie.mime_type': 'voluptate ut',
      'document.passport_card.back.image': 'aute et eiusmod cupidatat',
      'document.passport_card.back.mime_type': 'incididunt dolor sunt labore',
      'document.passport_card.classified_document_type': 'adipisicing officia',
      'document.passport_card.clave_de_elector': 'dolor reprehenderit officia qui',
      'document.passport_card.curp': 'nisi amet aliqua dolor',
      'document.passport_card.curp_validation_response': 'f5797ee2-b80c-4e9f-a055-f0c0b68d7909',
      'document.passport_card.dob': 'sint anim dolore ex eiusmod',
      'document.passport_card.document_number': 'pariatur eiusmod cupidatat non',
      'document.passport_card.expires_at': 'ad reprehenderit',
      'document.passport_card.front.image': 'et sunt enim eiusmod',
      'document.passport_card.front.mime_type': 'Duis incididunt irure non',
      'document.passport_card.full_address': '8503 Gleichner Row Suite 604',
      'document.passport_card.full_name': 'Mr. Arnold Zemlak',
      'document.passport_card.gender': 'elit',
      'document.passport_card.issued_at': 'consequat',
      'document.passport_card.issuing_country': 'Iran',
      'document.passport_card.issuing_state': 'Wyoming',
      'document.passport_card.nationality': 'quis ad exercitation',
      'document.passport_card.ref_number': 'esse aute nostrud sit',
      'document.passport_card.samba_activity_history_response': 'cillum aliquip laborum sint ipsum',
      'document.passport_card.selfie.image': 'veniam aute Excepteur enim fugiat',
      'document.passport_card.selfie.mime_type': 'eu commodo non esse',
      'document.permit.back.image': 'elit eu velit',
      'document.permit.back.mime_type': 'aute',
      'document.permit.classified_document_type': 'ut Excepteur anim aliquip deserunt',
      'document.permit.clave_de_elector': 'ea culpa aute consectetur',
      'document.permit.curp': 'sint',
      'document.permit.curp_validation_response': 'f196e39c-24ce-4049-9003-20d705974ec2',
      'document.permit.dob': 'magna sit Duis in ut',
      'document.permit.document_number': 'eiusmod ea sit esse pariatur',
      'document.permit.expires_at': 'elit sint cillum',
      'document.permit.front.image': 'in',
      'document.permit.front.mime_type': 'non mollit in',
      'document.permit.full_address': '8232 Wilhelm Light Suite 744',
      'document.permit.full_name': 'Steve Hagenes',
      'document.permit.gender': 'sit elit reprehenderit',
      'document.permit.issued_at': 'Duis non est anim',
      'document.permit.issuing_country': 'Belize',
      'document.permit.issuing_state': 'Vermont',
      'document.permit.nationality': 'cupidatat sunt esse',
      'document.permit.ref_number': 'Duis fugiat do',
      'document.permit.samba_activity_history_response': 'eu ipsum aute dolor sit',
      'document.permit.selfie.image': 'aute in veniam',
      'document.permit.selfie.mime_type': 'laboris',
      'document.proof_of_address.image': '43725 Hamill Junctions Apt. 238',
      'document.residence_document.back.image': '9c1187b5-a314-4c83-ac51-e3b83cbbaa9f',
      'document.residence_document.back.mime_type': '9f77e8c8-f79e-4314-930e-10c84814a83d',
      'document.residence_document.classified_document_type': 'e738cefb-b309-4e13-8d98-1a488cfeafee',
      'document.residence_document.clave_de_elector': 'eec6f333-d94f-46af-99ea-0a5b3afc46e1',
      'document.residence_document.curp': 'ac477a28-4678-4bda-88e9-fc37fb421c9b',
      'document.residence_document.curp_validation_response': '64b01a8a-8551-4f1c-8c25-b84bafc17599',
      'document.residence_document.dob': 'ab8dc46f-aaf0-4dd7-bde4-13de559c0434',
      'document.residence_document.document_number': 'acfbc8d7-f2b2-4e7c-9b1c-db9b3d280dc5',
      'document.residence_document.expires_at': 'ba2e6afb-999e-4952-8905-36d949682c83',
      'document.residence_document.front.image': '88c09080-af0b-45c1-8519-d40e4b9632f9',
      'document.residence_document.front.mime_type': '881ab079-aac9-4583-bb38-ad43f0c285dc',
      'document.residence_document.full_address': '76343 King Street Apt. 284',
      'document.residence_document.full_name': 'Ed Batz',
      'document.residence_document.gender': 'cd26c5c2-d1c1-4cfc-b81f-61dd98562997',
      'document.residence_document.issued_at': '3e5c6cd1-33a9-4968-96c8-d30931c38723',
      'document.residence_document.issuing_country': 'Barbados',
      'document.residence_document.issuing_state': 'Hawaii',
      'document.residence_document.nationality': '0e80e387-2056-4de6-9168-c84e46fbef05',
      'document.residence_document.ref_number': '455839c2-b7f6-40fd-b62c-af528daaa086',
      'document.residence_document.samba_activity_history_response': '9f6c282a-c8cb-4cc3-9ffb-738bacffe30e',
      'document.residence_document.selfie.image': '733ca25c-c9e7-49bf-8686-590a60928b76',
      'document.residence_document.selfie.mime_type': 'd4acaeab-cad9-4906-8608-113e684e2c10',
      'document.ssn_card.image': 'et ut reprehenderit',
      'document.visa.back.image': 'id dolor',
      'document.visa.back.mime_type': 'est eu anim',
      'document.visa.classified_document_type': 'mollit sunt nulla irure',
      'document.visa.clave_de_elector': 'consectetur anim irure',
      'document.visa.curp': 'dolor anim elit',
      'document.visa.curp_validation_response': 'f2482745-6d6c-4d8a-9057-f84093bfc5fa',
      'document.visa.dob': 'eiusmod dolore sint culpa aliqua',
      'document.visa.document_number': 'ut sed',
      'document.visa.expires_at': 'incididunt aliqua cillum ad Ut',
      'document.visa.front.image': 'Ut ad cupidatat',
      'document.visa.front.mime_type': 'in ad sint in dolor',
      'document.visa.full_address': '356 Tiara Crossroad Suite 667',
      'document.visa.full_name': 'Jean Weissnat',
      'document.visa.gender': 'labore',
      'document.visa.issued_at': 'commodo sunt Lorem laborum',
      'document.visa.issuing_country': 'Guernsey',
      'document.visa.issuing_state': 'Illinois',
      'document.visa.nationality': 'est cillum consectetur id in',
      'document.visa.ref_number': 'eiusmod ullamco ad Ut',
      'document.visa.samba_activity_history_response': 'enim voluptate dolor',
      'document.visa.selfie.image': 'ut sunt Lorem et amet',
      'document.visa.selfie.mime_type': 'dolor ullamco',
      'document.voter_identification.back.image': '2d93e6ce-cd32-4783-868a-7d89a1f244cb',
      'document.voter_identification.back.mime_type': '0ed1726e-fc7f-4d00-82e3-2da165f4600a',
      'document.voter_identification.classified_document_type': 'a16d0540-5f0d-4e0b-94ab-911e5f8ab4e5',
      'document.voter_identification.clave_de_elector': '4c20f640-acb5-4b00-a7d7-c7aef1d42f75',
      'document.voter_identification.curp': 'db442504-f728-450a-9056-4e56c4de129a',
      'document.voter_identification.curp_validation_response': 'f046b975-9b7c-4685-8ef8-1c7616f9f86f',
      'document.voter_identification.dob': '9e0990ab-fc0e-4719-8bc7-a7f92ffda90f',
      'document.voter_identification.document_number': '679b630c-3782-4ebc-8b49-84eb07640805',
      'document.voter_identification.expires_at': '1f6b6e8c-a751-4c13-a303-df89756ab8ff',
      'document.voter_identification.front.image': '1c6f700d-ef77-4849-8894-388f23d8511f',
      'document.voter_identification.front.mime_type': '0ad89212-a447-4df8-aaaa-24e7f4072ee4',
      'document.voter_identification.full_address': '848 Carleton Spurs Apt. 677',
      'document.voter_identification.full_name': 'Betty Mertz PhD',
      'document.voter_identification.gender': '2c973f42-bce2-4fbb-941a-8ed8ccd291e7',
      'document.voter_identification.issued_at': 'a96a9bf7-734a-4b06-b6bc-6e464e57c104',
      'document.voter_identification.issuing_country': 'Kazakhstan',
      'document.voter_identification.issuing_state': 'Michigan',
      'document.voter_identification.nationality': '7c8570e1-e913-4e17-9565-6d48de0f5134',
      'document.voter_identification.ref_number': '1ea92b0c-12cb-4087-b94a-eb32252039a0',
      'document.voter_identification.samba_activity_history_response': 'ff8397d6-ef23-41a7-bd9c-d736237a49ee',
      'document.voter_identification.selfie.image': 'd9a54337-bb36-48ef-938c-ace9d3c9874a',
      'document.voter_identification.selfie.mime_type': 'f0426c44-1ce5-4b30-a87c-45289b745823',
      'id.address_line1': '1687 Rosanna Court Suite 535',
      'id.address_line2': '52588 Haag Terrace Apt. 902',
      'id.citizenships': 'fc75dcc8-3252-429d-b444-f0095b99c044',
      'id.city': 'Kleinville',
      'id.country': 'Saint Pierre and Miquelon',
      'id.dob': 'dd86e844-8647-4846-9c96-61804139ca55',
      'id.drivers_license_number': '67ecd57e-a574-406c-9352-06724bc348a8',
      'id.drivers_license_state': 'Washington',
      'id.email': 'magnolia.legros@gmail.com',
      'id.first_name': 'Aurore',
      'id.itin': '62538ffe-f8a2-4456-9747-7febcbdf1937',
      'id.last_name': 'Ernser',
      'id.middle_name': 'Roberto Hane',
      'id.nationality': 'f1007704-762d-40c8-96c2-02ae56567c66',
      'id.phone_number': '+19376259883',
      'id.ssn4': '6f17b588-2a6a-4757-b873-af3686dcbd54',
      'id.ssn9': 'a4e4a029-5baf-462e-8ff8-77d5d4ca87b7',
      'id.state': 'North Dakota',
      'id.us_legal_status': 'e32a0563-579c-42ea-8e78-3ded30310392',
      'id.us_tax_id': '14511ed9-7a65-47ae-89da-b4bbcf84dc2a',
      'id.visa_expiration_date': '6819364a-827f-4a91-b96b-3706a85fe03b',
      'id.visa_kind': '975e6ca8-8d5a-4ea7-af92-5cfb31807dd2',
      'id.zip': '37442',
      'investor_profile.annual_income': 'qui proident tempor aute exercitation',
      'investor_profile.brokerage_firm_employer': 'qui fugiat ex magna minim',
      'investor_profile.declarations': 'nostrud Duis',
      'investor_profile.employer': 'anim sit sed dolore',
      'investor_profile.employment_status': 'qui anim velit',
      'investor_profile.family_member_names': 'Jodi Bogisich',
      'investor_profile.funding_sources': 'incididunt labore ullamco ad',
      'investor_profile.investment_goals': 'incididunt eu amet ullamco ea',
      'investor_profile.net_worth': 'pariatur qui amet Excepteur ad',
      'investor_profile.occupation': 'magna tempor',
      'investor_profile.political_organization': 'non',
      'investor_profile.risk_tolerance': 'sint veniam',
      'investor_profile.senior_executive_symbols': 'ut tempor',
    },
    props,
  ) as ModernUserDecryptResponse;
export const getNeuroIdentityIdResponse = (props: Partial<NeuroIdentityIdResponse>) =>
  merge(
    {
      id: 'c649b1b7-5107-44f5-98ab-b53bdf037e18',
    },
    props,
  ) as NeuroIdentityIdResponse;
export const getObConfigurationKind = (props: Partial<ObConfigurationKind>) => (props ?? 'kyc') as ObConfigurationKind;
export const getOnboardingResponse = (props: Partial<OnboardingResponse>) =>
  merge(
    {
      authToken: '2c662728-a589-4815-a38c-231cfd2f12c5',
      onboardingConfig: {
        allowInternationalResidents: false,
        allowedOrigins: ['commodo deserunt dolor culpa', 'ullamco do tempor', 'commodo'],
        appClipExperienceId: '4127d0a0-4dc2-4fb7-a61f-daa76b0faf8e',
        canMakeRealDocScanCallsInSandbox: false,
        docScanRequiredIfSsnSkipped: false,
        isAppClipEnabled: false,
        isInstantAppEnabled: true,
        isKyb: false,
        isLive: true,
        isNoPhoneFlow: true,
        isStepupEnabled: false,
        key: '870ba55c-6c1e-47a2-bcdf-5f2611dab651',
        kind: 'kyc',
        logoUrl: 'https://suburban-rationale.info/',
        name: 'Miss Kelli Jakubowski',
        nidEnabled: true,
        orgId: '1c4309b6-c543-4fe7-a9ab-8c6cd45f7509',
        orgName: 'Dominic Bartell',
        privacyPolicyUrl: 'https://unwritten-valentine.us/',
        requiredAuthMethods: ['email', 'email', 'passkey'],
        requiresIdDoc: false,
        skipConfirm: false,
        status: 'enabled',
        supportEmail: 'belle_powlowski@gmail.com',
        supportPhone: '+12603056163',
        supportWebsite: 'https://outstanding-hunger.com',
        supportedCountries: ['JP', 'BT', 'JE'],
      },
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
          isMet: true,
        },
        {
          isMet: false,
        },
        {
          isMet: false,
        },
      ],
      obConfiguration: {
        allowInternationalResidents: true,
        allowedOrigins: ['amet velit ad occaecat', 'aliquip aute', 'consequat irure consectetur nostrud'],
        appClipExperienceId: '48468046-c9d4-47e5-90c9-44664a9b70b8',
        canMakeRealDocScanCallsInSandbox: false,
        docScanRequiredIfSsnSkipped: false,
        isAppClipEnabled: true,
        isInstantAppEnabled: false,
        isKyb: false,
        isLive: false,
        isNoPhoneFlow: false,
        isStepupEnabled: true,
        key: '91d75256-0fc0-4535-9445-74ff2f3f7daf',
        kind: 'auth',
        logoUrl: 'https://unaware-horst.us/',
        name: 'Oliver Rohan',
        nidEnabled: true,
        orgId: '78a39827-622d-4a91-a235-9737f578c41f',
        orgName: 'Santiago Ullrich-Zieme',
        privacyPolicyUrl: 'https://dramatic-ferret.name',
        requiredAuthMethods: ['phone', 'phone', 'passkey'],
        requiresIdDoc: false,
        skipConfirm: false,
        status: 'enabled',
        supportEmail: 'scot.doyle46@gmail.com',
        supportPhone: '+16487919688',
        supportWebsite: 'https://teeming-gift.us',
        supportedCountries: ['VA', 'AE', 'EC'],
      },
    },
    props,
  ) as OnboardingStatusResponse;
export const getPostBusinessOnboardingRequest = (props: Partial<PostBusinessOnboardingRequest>) =>
  merge(
    {
      inheritBusinessId: '8add410e-5821-4dd9-9749-44846f8aeb55',
      kybFixtureResult: 'pass',
      useLegacyInheritLogic: false,
    },
    props,
  ) as PostBusinessOnboardingRequest;
export const getPostOnboardingRequest = (props: Partial<PostOnboardingRequest>) =>
  merge(
    {
      fixtureResult: 'fail',
      kybFixtureResult: 'manual_review',
      omitBusinessCreation: true,
    },
    props,
  ) as PostOnboardingRequest;
export const getProcessRequest = (props: Partial<ProcessRequest>) =>
  merge(
    {
      fixtureResult: 'step_up',
    },
    props,
  ) as ProcessRequest;
export const getPublicOnboardingConfiguration = (props: Partial<PublicOnboardingConfiguration>) =>
  merge(
    {
      allowInternationalResidents: true,
      allowedOrigins: ['minim', 'enim aute ut', 'est'],
      appClipExperienceId: 'e14bdf08-add0-4c58-97c8-98ed199bb9a0',
      appearance: {},
      canMakeRealDocScanCallsInSandbox: false,
      docScanRequiredIfSsnSkipped: false,
      isAppClipEnabled: true,
      isInstantAppEnabled: true,
      isKyb: false,
      isLive: false,
      isNoPhoneFlow: false,
      isStepupEnabled: true,
      key: '5681fc2f-9dc1-4cc6-baed-23663d42c740',
      kind: 'auth',
      logoUrl: 'https://deafening-airman.info/',
      name: 'Thomas Russel',
      nidEnabled: false,
      orgId: 'ba7bf1b0-9cfb-4964-863a-1f889b3d9310',
      orgName: 'Jasmine Stoltenberg Sr.',
      privacyPolicyUrl: 'https://orange-optimal.org',
      requiredAuthMethods: ['phone', 'phone', 'email'],
      requiresIdDoc: true,
      skipConfirm: true,
      status: 'enabled',
      supportEmail: 'alf_erdman44@gmail.com',
      supportPhone: '+18674459587',
      supportWebsite: 'https://aged-vicinity.com/',
      supportedCountries: ['AI', 'MX', 'KG'],
      workflowRequest: {
        config: {
          data: {
            businessConfigs: [
              {
                data: {
                  description: 'consequat dolore ea anim occaecat',
                  identifier: 'document.permit.ref_number',
                  name: 'nisi ut exercitation qui quis',
                  requiresHumanReview: true,
                  uploadSettings: 'prefer_capture',
                },
                kind: 'proof_of_ssn',
              },
              {
                data: {
                  collectSelfie: false,
                  requiresHumanReview: true,
                },
                kind: 'identity',
              },
              {
                data: {
                  description: 'exercitation irure occaecat est',
                  identifier: 'document.voter_identification.issuing_country',
                  name: 'adipisicing',
                  requiresHumanReview: false,
                  uploadSettings: 'prefer_upload',
                },
                kind: 'proof_of_address',
              },
            ],
            configs: [
              {
                data: {
                  collectSelfie: true,
                  documentTypesAndCountries: {
                    global: ['residence_document', 'drivers_license', 'passport'],
                  },
                  requiresHumanReview: true,
                },
                kind: 'identity',
              },
              {
                data: {
                  description: 'pariatur nostrud proident nisi do',
                  identifier: 'document.visa.full_name',
                  name: 'laboris aliqua',
                  requiresHumanReview: true,
                  uploadSettings: 'capture_only_on_mobile',
                },
                kind: 'proof_of_address',
              },
              {
                data: {
                  collectSelfie: true,
                  documentTypesAndCountries: {
                    global: ['drivers_license', 'voter_identification', 'passport'],
                  },
                  requiresHumanReview: true,
                },
                kind: 'identity',
              },
            ],
            playbookId: 'aliqua magna dolor enim',
            recollectAttributes: ['business_website', 'business_address', 'business_corporation_type'],
            reuseExistingBoKyc: false,
          },
          kind: 'document',
        },
        note: 'sint ad officia Duis',
      },
    },
    props,
  ) as PublicOnboardingConfiguration;
export const getRawUserDataRequest = (props: Partial<RawUserDataRequest>) =>
  merge(
    {
      key: 'ff2158c6-2ada-4a61-a26d-aebe02ec76f2',
      value: {},
    },
    props,
  ) as RawUserDataRequest;
export const getRegisterPasskeyAttemptContext = (props: Partial<RegisterPasskeyAttemptContext>) =>
  merge(
    {
      elapsedTimeInOsPromptMs: 50865702,
      errorMessage: 'nostrud esse sed Excepteur in',
    },
    props,
  ) as RegisterPasskeyAttemptContext;
export const getRenderV1SdkArgs = (props: Partial<RenderV1SdkArgs>) =>
  merge(
    {
      authToken: 'e79cabae-e1cc-4c15-a03e-44236b034fed',
      canCopy: true,
      defaultHidden: false,
      id: '107d8cc9-2bd2-47d5-b066-0b815c25935b',
      label: 'labore aute pariatur',
      showHiddenToggle: false,
    },
    props,
  ) as RenderV1SdkArgs;
export const getRequestedTokenScope = (props: Partial<RequestedTokenScope>) =>
  (props ?? 'onboarding_components') as RequestedTokenScope;
export const getSdkArgs = (props: Partial<SdkArgs>) => (props ?? 'magna exercitation aute minim incididunt') as SdkArgs;
export const getSignupChallengeRequest = (props: Partial<SignupChallengeRequest>) =>
  merge(
    {
      challengeKind: 'biometric',
      email: {
        isBootstrap: true,
        value: 'sed ea',
      },
      phoneNumber: {
        isBootstrap: false,
        value: 'veniam ullamco',
      },
      scope: 'my1fp',
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
          elapsedTimeInOsPromptMs: -47743671,
          errorMessage: 'dolore fugiat ut',
        },
        {
          elapsedTimeInOsPromptMs: -42968746,
          errorMessage: 'dolor voluptate exercitation minim',
        },
        {
          elapsedTimeInOsPromptMs: -38283446,
          errorMessage: 'velit',
        },
      ],
      clientType: 'mobile',
      numAttempts: -91200870,
      reason: 'labore voluptate dolore',
    },
    props,
  ) as SkipLivenessContext;
export const getSkipPasskeyRegisterRequest = (props: Partial<SkipPasskeyRegisterRequest>) =>
  merge(
    {
      context: {
        attempts: [
          {
            elapsedTimeInOsPromptMs: -26473504,
            errorMessage: 'sunt cupidatat',
          },
          {
            elapsedTimeInOsPromptMs: 66991571,
            errorMessage: 'incididunt',
          },
          {
            elapsedTimeInOsPromptMs: 94053859,
            errorMessage: 'aliquip Excepteur',
          },
        ],
        clientType: 'web',
        numAttempts: -71266514,
        reason: 'sed do veniam',
      },
    },
    props,
  ) as SkipPasskeyRegisterRequest;
export const getSocureDeviceSessionIdRequest = (props: Partial<SocureDeviceSessionIdRequest>) =>
  merge(
    {
      deviceSessionId: 'fbeceae6-e164-40e8-969f-0116bc5b8afa',
    },
    props,
  ) as SocureDeviceSessionIdRequest;
export const getStytchTelemetryRequest = (props: Partial<StytchTelemetryRequest>) =>
  merge(
    {
      telemetryId: '129cebec-cf19-4244-868e-8db1abe4b938',
    },
    props,
  ) as StytchTelemetryRequest;
export const getUpdateAuthMethodsV1SdkArgs = (props: Partial<UpdateAuthMethodsV1SdkArgs>) =>
  merge(
    {
      authToken: '7f839499-cf03-4427-9b7a-7c83da57628a',
      l10N: {
        language: 'en',
        locale: 'en-US',
      },
      options: {
        showLogo: true,
      },
    },
    props,
  ) as UpdateAuthMethodsV1SdkArgs;
export const getUpdateOrCreateHostedBusinessOwnerRequest = (props: Partial<UpdateOrCreateHostedBusinessOwnerRequest>) =>
  merge(
    {
      data: {
        key: 'eaa36991-dc2a-4c88-9da3-fc13f38ad7a7',
        value: {},
      },
      op: 'create',
      ownershipStake: 68693524,
      uuid: 'fc3126dc-ba49-4c5f-9c4f-ba36b3886552',
    },
    props,
  ) as UpdateOrCreateHostedBusinessOwnerRequest;
export const getUserAuthScope = (props: Partial<UserAuthScope>) => (props ?? 'explicit_auth') as UserAuthScope;
export const getUserChallengeData = (props: Partial<UserChallengeData>) =>
  merge(
    {
      biometricChallengeJson: 'laborum anim mollit reprehenderit',
      challengeKind: 'biometric',
      challengeToken: '4344f6d5-1b5b-4d1b-9527-bebb36614842',
      timeBeforeRetryS: -26627198,
      token: '670d1e95-5739-4ed5-a6b4-25ca661add5b',
    },
    props,
  ) as UserChallengeData;
export const getUserChallengeRequest = (props: Partial<UserChallengeRequest>) =>
  merge(
    {
      actionKind: 'replace',
      email: 'dominic68@gmail.com',
      kind: 'passkey',
      phoneNumber: '+19907430891',
    },
    props,
  ) as UserChallengeRequest;
export const getUserChallengeResponse = (props: Partial<UserChallengeResponse>) =>
  merge(
    {
      biometricChallengeJson: 'Duis ipsum',
      challengeToken: '723d9235-fda8-4f53-9b41-b5f7bab9915f',
      timeBeforeRetryS: 12190709,
    },
    props,
  ) as UserChallengeResponse;
export const getUserChallengeVerifyRequest = (props: Partial<UserChallengeVerifyRequest>) =>
  merge(
    {
      challengeResponse: 'sint irure aliquip',
      challengeToken: 'c19d3fcf-e0ad-46dd-9a54-383752b95275',
    },
    props,
  ) as UserChallengeVerifyRequest;
export const getUserChallengeVerifyResponse = (props: Partial<UserChallengeVerifyResponse>) =>
  merge(
    {
      authToken: 'e4bafe3e-73a7-450f-965a-3422d08ea38a',
    },
    props,
  ) as UserChallengeVerifyResponse;
export const getUserDataIdentifier = (props: Partial<UserDataIdentifier>) =>
  (props ?? 'document.drivers_license.back.mime_type') as UserDataIdentifier;
export const getUserDecryptRequest = (props: Partial<UserDecryptRequest>) =>
  merge(
    {
      fields: [
        'document.id_card.expires_at',
        'document.voter_identification.back.image',
        'document.passport_card.document_number',
      ],
      reason: 'dolor labore',
      transforms: ["replace('<from>','<to>')", 'to_ascii', 'to_uppercase'],
      versionAt: '1895-08-22T19:04:45.0Z',
    },
    props,
  ) as UserDecryptRequest;
export const getUserDecryptResponse = (props: Partial<UserDecryptResponse>) =>
  merge(
    {
      key: 'b97707d6-2834-457d-b2f0-bfe69d2c057a',
      value: {},
    },
    props,
  ) as UserDecryptResponse;
export const getVerifyResultV1SdkArgs = (props: Partial<VerifyResultV1SdkArgs>) =>
  merge(
    {
      authToken: 'be6eefd1-0ce1-4d7e-9fdb-22c3bfd0a6c3',
      deviceResponse: 'dolore nostrud et',
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
      authToken: 'fd24a3b1-e41c-4813-b842-1ebcf762025f',
      documentFixtureResult: 'fail',
      fixtureResult: 'step_up',
      isComponentsSdk: false,
      l10N: {
        language: 'en',
        locale: 'en-US',
      },
      options: {
        showCompletionPage: true,
        showLogo: true,
      },
      publicKey: '9591877f-b68f-4196-86c7-a4ea3bf1a735',
      sandboxId: '0f3f9b78-224c-4cf3-82ed-c4bcc70da5c7',
      shouldRelayToComponents: true,
      userData: {},
    },
    props,
  ) as VerifyV1SdkArgs;
export const getWorkflowFixtureResult = (props: Partial<WorkflowFixtureResult>) =>
  (props ?? 'fail') as WorkflowFixtureResult;
export const getWorkflowRequestConfig = (props: Partial<WorkflowRequestConfig>) =>
  merge(
    {
      data: {
        playbookId: 'velit officia esse pariatur eiusmod',
        recollectAttributes: ['ssn4', 'business_tin', 'business_website'],
        reuseExistingBoKyc: false,
      },
      kind: 'onboard',
    },
    props,
  ) as WorkflowRequestConfig;
