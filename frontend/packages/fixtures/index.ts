import type {
  ActionKind,
  ApiKeyStatus,
  ApiOnboardingRequirement,
  AuthMethod,
  AuthMethodKind,
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
  DeviceAttestationChallengeResponse,
  DeviceAttestationType,
  DeviceType,
  DocumentAndCountryConfiguration,
  DocumentFixtureResult,
  DocumentImageError,
  DocumentKind,
  DocumentRequestConfig,
  DocumentRequestConfigCustom,
  DocumentRequestConfigIdentity,
  DocumentRequestConfigProofOfAddress,
  DocumentRequestConfigProofOfSsn,
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
  GetVerifyContactInfoResponse,
  HandoffMetadata,
  HostedBusiness,
  HostedBusinessDetail,
  HostedBusinessOwner,
  HostedUserDecryptRequest,
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
  InsightEvent,
  InvestorProfileDeclaration,
  InvestorProfileFundingSource,
  InvestorProfileInvestmentGoal,
  Inviter,
  Iso3166TwoDigitCountryCode,
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
  ObConfigurationKind,
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
  UserAuthScope,
  UserChallengeData,
  UserChallengeRequest,
  UserChallengeResponse,
  UserChallengeVerifyRequest,
  UserChallengeVerifyResponse,
  UserDataIdentifier,
  UserDecryptRequest,
  VerifyResultV1SdkArgs,
  VerifyV1Options,
  VerifyV1SdkArgs,
  WorkflowFixtureResult,
  WorkflowRequestConfig,
  WorkflowRequestConfigDocument,
  WorkflowRequestConfigOnboard,
} from '@onefootprint/request-types';
import deepmerge from 'deepmerge';

export const getActionKind = (props: ActionKind): ActionKind => props ?? 'replace';
export const getApiKeyStatus = (props: ApiKeyStatus): ApiKeyStatus => props ?? 'disabled';

export const getApiOnboardingRequirement = (
  props: Partial<ApiOnboardingRequirement>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): ApiOnboardingRequirement =>
  deepmerge<ApiOnboardingRequirement>(
    {
      isMet: false,
      requirement: {
        authMethodKind: 'passkey',
        kind: 'register_auth_method',
      },
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getAuthMethod = (
  props: Partial<AuthMethod>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): AuthMethod =>
  deepmerge<AuthMethod>(
    {
      canUpdate: true,
      isVerified: false,
      kind: 'phone',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );
export const getAuthMethodKind = (props: AuthMethodKind): AuthMethodKind => props ?? 'email';

export const getAuthRequirementsResponse = (
  props: Partial<AuthRequirementsResponse>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): AuthRequirementsResponse =>
  deepmerge<AuthRequirementsResponse>(
    {
      allRequirements: [
        {
          isMet: true,
          requirement: {
            kind: 'process',
          },
        },
        {
          isMet: true,
          requirement: {
            kind: 'process',
          },
        },
        {
          isMet: true,
          requirement: {
            kind: 'process',
          },
        },
      ],
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getAuthV1Options = (
  props: Partial<AuthV1Options>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): AuthV1Options =>
  deepmerge<AuthV1Options>(
    {
      showLogo: true,
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getAuthV1SdkArgs = (
  props: Partial<AuthV1SdkArgs>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): AuthV1SdkArgs =>
  deepmerge<AuthV1SdkArgs>(
    {
      l10N: {
        language: 'en',
        locale: 'en-US',
      },
      options: {
        showLogo: false,
      },
      publicKey: '7c1e3afb-b864-49ee-b5fa-18d31c9bf77b',
      userData: {},
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getAuthorizeFields = (
  props: Partial<AuthorizeFields>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): AuthorizeFields =>
  deepmerge<AuthorizeFields>(
    {
      collectedData: ['phone_number', 'bank', 'name'],
      documentTypes: ['ssn_card', 'permit', 'custom'],
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getAuthorizedOrg = (
  props: Partial<AuthorizedOrg>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): AuthorizedOrg =>
  deepmerge<AuthorizedOrg>(
    {
      canAccessData: ['card', 'investor_profile', 'ssn9'],
      logoUrl: 'https://whimsical-hoof.net/',
      orgName: 'Fredrick Dare',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getBatchHostedBusinessOwnerRequest = (
  props: Partial<BatchHostedBusinessOwnerRequest>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): BatchHostedBusinessOwnerRequest =>
  deepmerge<BatchHostedBusinessOwnerRequest>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getBatchHostedBusinessOwnerRequestCreate = (
  props: Partial<BatchHostedBusinessOwnerRequestCreate>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): BatchHostedBusinessOwnerRequestCreate =>
  deepmerge<BatchHostedBusinessOwnerRequestCreate>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getBatchHostedBusinessOwnerRequestDelete = (
  props: Partial<BatchHostedBusinessOwnerRequestDelete>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): BatchHostedBusinessOwnerRequestDelete =>
  deepmerge<BatchHostedBusinessOwnerRequestDelete>(
    {
      op: 'delete',
      uuid: '239d47ea-9137-4702-9c4b-e0c0c8883741',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getBatchHostedBusinessOwnerRequestUpdate = (
  props: Partial<BatchHostedBusinessOwnerRequestUpdate>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): BatchHostedBusinessOwnerRequestUpdate =>
  deepmerge<BatchHostedBusinessOwnerRequestUpdate>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getBusinessOnboardingResponse = (
  props: Partial<BusinessOnboardingResponse>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): BusinessOnboardingResponse =>
  deepmerge<BusinessOnboardingResponse>(
    {
      authToken: '41785484-4c34-4619-ab8c-7f7e496b5779',
      isNewBusiness: false,
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );
export const getChallengeKind = (props: ChallengeKind): ChallengeKind => props ?? 'email';
export const getCheckSessionResponse = (props: CheckSessionResponse): CheckSessionResponse => props ?? 'active';

export const getCollectDocumentConfig = (
  props: Partial<CollectDocumentConfig>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): CollectDocumentConfig =>
  deepmerge<CollectDocumentConfig>(
    {
      kind: 'identity',
      shouldCollectConsent: false,
      shouldCollectSelfie: false,
      supportedCountryAndDocTypes: {},
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getCollectDocumentConfigCustom = (
  props: Partial<CollectDocumentConfigCustom>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): CollectDocumentConfigCustom =>
  deepmerge<CollectDocumentConfigCustom>(
    {
      description: 'velit sint adipisicing tempor',
      identifier: 'document.permit.front.mime_type',
      kind: 'custom',
      name: 'Reginald Gleichner',
      requiresHumanReview: true,
      uploadSettings: 'prefer_capture',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getCollectDocumentConfigIdentity = (
  props: Partial<CollectDocumentConfigIdentity>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): CollectDocumentConfigIdentity =>
  deepmerge<CollectDocumentConfigIdentity>(
    {
      kind: 'identity',
      shouldCollectConsent: false,
      shouldCollectSelfie: false,
      supportedCountryAndDocTypes: {},
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getCollectDocumentConfigProofOfAddress = (
  props: Partial<CollectDocumentConfigProofOfAddress>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): CollectDocumentConfigProofOfAddress =>
  deepmerge<CollectDocumentConfigProofOfAddress>(
    {
      kind: 'proof_of_address',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getCollectDocumentConfigProofOfSsn = (
  props: Partial<CollectDocumentConfigProofOfSsn>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): CollectDocumentConfigProofOfSsn =>
  deepmerge<CollectDocumentConfigProofOfSsn>(
    {
      kind: 'proof_of_ssn',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );
export const getCollectedDataOption = (props: CollectedDataOption): CollectedDataOption =>
  props ?? 'business_kyced_beneficial_owners';

export const getConsentRequest = (
  props: Partial<ConsentRequest>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): ConsentRequest =>
  deepmerge<ConsentRequest>(
    {
      consentLanguageText: 'en',
      mlConsent: false,
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

export const getCreateDeviceAttestationRequest = (
  props: Partial<CreateDeviceAttestationRequest>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): CreateDeviceAttestationRequest =>
  deepmerge<CreateDeviceAttestationRequest>(
    {
      attestation: 'nostrud occaecat culpa',
      state: 'Kentucky',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getCreateDocumentRequest = (
  props: Partial<CreateDocumentRequest>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): CreateDocumentRequest =>
  deepmerge<CreateDocumentRequest>(
    {
      countryCode: 'GP',
      deviceType: 'android',
      documentType: 'drivers_license',
      fixtureResult: 'fail',
      requestId: 'ab9d1a23-39a7-4d37-bcd6-59d972912880',
      skipSelfie: true,
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getCreateDocumentResponse = (
  props: Partial<CreateDocumentResponse>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): CreateDocumentResponse =>
  deepmerge<CreateDocumentResponse>(
    {
      id: '2d0074de-10c4-44df-8ea8-95a4d9725b47',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getCreateOnboardingTimelineRequest = (
  props: Partial<CreateOnboardingTimelineRequest>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): CreateOnboardingTimelineRequest =>
  deepmerge<CreateOnboardingTimelineRequest>(
    {
      event: 'ut pariatur elit',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getCreateSdkArgsTokenResponse = (
  props: Partial<CreateSdkArgsTokenResponse>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): CreateSdkArgsTokenResponse =>
  deepmerge<CreateSdkArgsTokenResponse>(
    {
      expiresAt: '1918-04-23T06:50:23.0Z',
      token: '5f08de9a-9b2a-4c48-9b09-7a80d2fe3cb7',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getCreateUserTokenRequest = (
  props: Partial<CreateUserTokenRequest>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): CreateUserTokenRequest =>
  deepmerge<CreateUserTokenRequest>(
    {
      requestedScope: 'onboarding',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getCreateUserTokenResponse = (
  props: Partial<CreateUserTokenResponse>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): CreateUserTokenResponse =>
  deepmerge<CreateUserTokenResponse>(
    {
      expiresAt: '1946-03-19T23:52:55.0Z',
      token: 'b5dee4ae-53af-42ea-9fd1-0642caad37f2',
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
      description: 'dolore fugiat',
      identifier: 'document.passport.nationality',
      name: 'Lynda Klein',
      requiresHumanReview: false,
      uploadSettings: 'capture_only_on_mobile',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getD2pGenerateRequest = (
  props: Partial<D2pGenerateRequest>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): D2pGenerateRequest =>
  deepmerge<D2pGenerateRequest>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getD2pGenerateResponse = (
  props: Partial<D2pGenerateResponse>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): D2pGenerateResponse =>
  deepmerge<D2pGenerateResponse>(
    {
      authToken: '9abeea8e-46db-4336-9c7e-40cd78bf1205',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );
export const getD2pSessionStatus = (props: D2pSessionStatus): D2pSessionStatus => props ?? 'waiting';

export const getD2pSmsRequest = (
  props: Partial<D2pSmsRequest>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): D2pSmsRequest =>
  deepmerge<D2pSmsRequest>(
    {
      url: 'https://empty-outlaw.name',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getD2pSmsResponse = (
  props: Partial<D2pSmsResponse>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): D2pSmsResponse =>
  deepmerge<D2pSmsResponse>(
    {
      timeBeforeRetryS: 58425194,
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getD2pStatusResponse = (
  props: Partial<D2pStatusResponse>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): D2pStatusResponse =>
  deepmerge<D2pStatusResponse>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getD2pUpdateStatusRequest = (
  props: Partial<D2pUpdateStatusRequest>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): D2pUpdateStatusRequest =>
  deepmerge<D2pUpdateStatusRequest>(
    {
      status: 'waiting',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );
export const getDataIdentifier = (props: DataIdentifier): DataIdentifier =>
  props ?? 'document.passport.curp_validation_response';

export const getDeviceAttestationChallengeResponse = (
  props: Partial<DeviceAttestationChallengeResponse>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): DeviceAttestationChallengeResponse =>
  deepmerge<DeviceAttestationChallengeResponse>(
    {
      attestationChallenge: 'proident laboris',
      state: 'Maryland',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );
export const getDeviceAttestationType = (props: DeviceAttestationType): DeviceAttestationType => props ?? 'android';
export const getDeviceType = (props: DeviceType): DeviceType => props ?? 'ios';

export const getDocumentAndCountryConfiguration = (
  props: Partial<DocumentAndCountryConfiguration>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): DocumentAndCountryConfiguration =>
  deepmerge<DocumentAndCountryConfiguration>(
    {
      countrySpecific: {},
      global: ['id_card', 'id_card', 'id_card'],
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );
export const getDocumentFixtureResult = (props: DocumentFixtureResult): DocumentFixtureResult => props ?? 'pass';
export const getDocumentImageError = (props: DocumentImageError): DocumentImageError => props ?? 'image_too_small';
export const getDocumentKind = (props: DocumentKind): DocumentKind => props ?? 'visa';

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
          global: ['permit', 'visa', 'voter_identification'],
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
        description: 'qui commodo Duis ut',
        identifier: 'investor_profile.employer',
        name: 'Juanita Krajcik',
        requiresHumanReview: false,
        uploadSettings: 'prefer_capture',
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
          global: ['passport', 'residence_document', 'passport_card'],
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
        requiresHumanReview: false,
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

export const getDocumentResponse = (
  props: Partial<DocumentResponse>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): DocumentResponse =>
  deepmerge<DocumentResponse>(
    {
      errors: ['selfie_face_not_found', 'face_not_found', 'selfie_image_orientation_incorrect'],
      isRetryLimitExceeded: true,
      nextSideToCollect: 'front',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );
export const getDocumentSide = (props: DocumentSide): DocumentSide => props ?? 'front';
export const getDocumentUploadSettings = (props: DocumentUploadSettings): DocumentUploadSettings =>
  props ?? 'capture_only_on_mobile';

export const getEmailVerifyRequest = (
  props: Partial<EmailVerifyRequest>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): EmailVerifyRequest =>
  deepmerge<EmailVerifyRequest>(
    {
      data: 'dolor sed',
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
export const getFilterFunction = (props: FilterFunction): FilterFunction => props ?? "hmac_sha256('<key>')";

export const getFingerprintVisitRequest = (
  props: Partial<FingerprintVisitRequest>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): FingerprintVisitRequest =>
  deepmerge<FingerprintVisitRequest>(
    {
      path: 'incididunt laboris eu',
      requestId: 'e2013841-bcda-4905-a9bf-20d30f169824',
      visitorId: 'ad01bc50-8fd4-46b4-9509-2a9127b92eb2',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getFormV1Options = (
  props: Partial<FormV1Options>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): FormV1Options =>
  deepmerge<FormV1Options>(
    {
      hideButtons: true,
      hideCancelButton: true,
      hideFootprintLogo: false,
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getFormV1SdkArgs = (
  props: Partial<FormV1SdkArgs>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): FormV1SdkArgs =>
  deepmerge<FormV1SdkArgs>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getGetDeviceAttestationChallengeRequest = (
  props: Partial<GetDeviceAttestationChallengeRequest>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): GetDeviceAttestationChallengeRequest =>
  deepmerge<GetDeviceAttestationChallengeRequest>(
    {
      androidPackageName: 'Brandon Mraz PhD',
      deviceType: 'ios',
      iosBundleId: '57de139d-f281-4e4a-b3ab-7a2eea39ab4f',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getGetSdkArgsTokenResponse = (
  props: Partial<GetSdkArgsTokenResponse>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): GetSdkArgsTokenResponse =>
  deepmerge<GetSdkArgsTokenResponse>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getGetUserTokenResponse = (
  props: Partial<GetUserTokenResponse>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): GetUserTokenResponse =>
  deepmerge<GetUserTokenResponse>(
    {
      expiresAt: '1938-03-18T10:30:50.0Z',
      scopes: ['handoff', 'explicit_auth', 'explicit_auth'],
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getGetVerifyContactInfoResponse = (
  props: Partial<GetVerifyContactInfoResponse>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): GetVerifyContactInfoResponse =>
  deepmerge<GetVerifyContactInfoResponse>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getHandoffMetadata = (
  props: Partial<HandoffMetadata>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): HandoffMetadata =>
  deepmerge<HandoffMetadata>(
    {
      l10N: {
        language: 'en',
        locale: 'en-US',
      },
      opener: 'sint consectetur cupidatat pariatur',
      redirectUrl: 'https://crafty-testimonial.net',
      sandboxIdDocOutcome: '80c9ac6c-a57a-4ad3-9562-6364d6b12dc5',
      sessionId: 'd9a74f03-0fe7-4ade-ba82-2e02abcf5cff',
      styleParams: 'dolore amet et eu',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getHostedBusiness = (
  props: Partial<HostedBusiness>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): HostedBusiness =>
  deepmerge<HostedBusiness>(
    {
      createdAt: '1923-01-19T01:20:20.0Z',
      id: 'f803f6f3-08f4-4115-8e9c-ccd6621cf58a',
      isIncomplete: false,
      lastActivityAt: '1943-06-28T17:22:04.0Z',
      name: 'Marilyn Bogisich',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getHostedBusinessDetail = (
  props: Partial<HostedBusinessDetail>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): HostedBusinessDetail =>
  deepmerge<HostedBusinessDetail>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getHostedBusinessOwner = (
  props: Partial<HostedBusinessOwner>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): HostedBusinessOwner =>
  deepmerge<HostedBusinessOwner>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getHostedUserDecryptRequest = (
  props: Partial<HostedUserDecryptRequest>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): HostedUserDecryptRequest =>
  deepmerge<HostedUserDecryptRequest>(
    {
      fields: [
        'document.residence_document.front.mime_type',
        'document.id_card.issued_at',
        'document.voter_identification.samba_activity_history_response',
      ],
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getHostedValidateResponse = (
  props: Partial<HostedValidateResponse>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): HostedValidateResponse =>
  deepmerge<HostedValidateResponse>(
    {
      validationToken: 'd13d31d5-5e9d-47c0-bf2d-56f7f0cdb569',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getHostedWorkflowRequest = (
  props: Partial<HostedWorkflowRequest>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): HostedWorkflowRequest =>
  deepmerge<HostedWorkflowRequest>(
    {
      config: {
        data: {
          playbookId: '9b547635-0bf1-4f83-9b08-85eca1161dad',
          recollectAttributes: ['dob', 'business_address', 'email'],
          reuseExistingBoKyc: false,
        },
        kind: 'onboard',
      },
      note: 'occaecat ullamco aliqua magna ipsum',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );
export const getIdDocKind = (props: IdDocKind): IdDocKind => props ?? 'visa';

export const getIdentifiedUser = (
  props: Partial<IdentifiedUser>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): IdentifiedUser =>
  deepmerge<IdentifiedUser>(
    {
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
      matchingFps: [
        'document.residence_document.issuing_country',
        'document.visa.front.image',
        'document.visa.issued_at',
      ],
      scrubbedEmail: 'kyler.kub54@gmail.com',
      scrubbedPhone: '+14805566942',
      token: '7152c554-bf1c-4004-b943-d6af35c7978e',
      tokenScopes: ['sensitive_profile', 'vault_data', 'handoff'],
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getIdentifyAuthMethod = (
  props: Partial<IdentifyAuthMethod>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): IdentifyAuthMethod =>
  deepmerge<IdentifyAuthMethod>(
    {
      isVerified: false,
      kind: 'email',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getIdentifyChallengeResponse = (
  props: Partial<IdentifyChallengeResponse>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): IdentifyChallengeResponse =>
  deepmerge<IdentifyChallengeResponse>(
    {
      challengeData: {
        biometricChallengeJson: 'elit nulla',
        challengeKind: 'sms',
        challengeToken: '3b6445b8-f53d-45bc-a625-6df2900086ed',
        timeBeforeRetryS: 69478703,
        token: 'ec45b926-2295-4734-a86c-3ce1058d30e6',
      },
      error: 'consectetur exercitation ad',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getIdentifyId = (
  props: Partial<IdentifyId>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): IdentifyId =>
  deepmerge<IdentifyId>(
    {
      email: 'karlie69@gmail.com',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getIdentifyRequest = (
  props: Partial<IdentifyRequest>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): IdentifyRequest =>
  deepmerge<IdentifyRequest>(
    {
      email: 'blanche_williamson15@gmail.com',
      identifier: {
        email: 'zella88@gmail.com',
      },
      phoneNumber: '+17578683740',
      scope: 'onboarding',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getIdentifyResponse = (
  props: Partial<IdentifyResponse>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): IdentifyResponse =>
  deepmerge<IdentifyResponse>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );
export const getIdentifyScope = (props: IdentifyScope): IdentifyScope => props ?? 'onboarding';

export const getIdentifyVerifyRequest = (
  props: Partial<IdentifyVerifyRequest>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): IdentifyVerifyRequest =>
  deepmerge<IdentifyVerifyRequest>(
    {
      challengeResponse: 'pariatur Lorem occaecat',
      challengeToken: '44adf55d-c5d3-4789-8ec5-63f5e3a2385e',
      scope: 'auth',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getIdentifyVerifyResponse = (
  props: Partial<IdentifyVerifyResponse>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): IdentifyVerifyResponse =>
  deepmerge<IdentifyVerifyResponse>(
    {
      authToken: 'b84bc949-4e0e-4b97-b44d-4159c6b8b20f',
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );
export const getInvestorProfileDeclaration = (props: InvestorProfileDeclaration): InvestorProfileDeclaration =>
  props ?? 'senior_executive';
export const getInvestorProfileFundingSource = (props: InvestorProfileFundingSource): InvestorProfileFundingSource =>
  props ?? 'business_income';
export const getInvestorProfileInvestmentGoal = (props: InvestorProfileInvestmentGoal): InvestorProfileInvestmentGoal =>
  props ?? 'diversification';

export const getInviter = (
  props: Partial<Inviter>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): Inviter =>
  deepmerge<Inviter>(
    {
      firstName: 'Trudie',
      lastName: 'Rodriguez',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );
export const getIso3166TwoDigitCountryCode = (props: Iso3166TwoDigitCountryCode): Iso3166TwoDigitCountryCode =>
  props ?? 'IS';

export const getKbaResponse = (
  props: Partial<KbaResponse>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): KbaResponse =>
  deepmerge<KbaResponse>(
    {
      token: 'ee243a48-29c4-4f59-915b-25166ac6b608',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getL10n = (props: Partial<L10n>, options: { overwriteArray: boolean } = { overwriteArray: true }): L10n =>
  deepmerge<L10n>(
    {
      language: 'en',
      locale: 'en-US',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getL10nV1 = (
  props: Partial<L10nV1>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): L10nV1 =>
  deepmerge<L10nV1>(
    {
      language: 'en',
      locale: 'en-US',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getLiteIdentifyRequest = (
  props: Partial<LiteIdentifyRequest>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): LiteIdentifyRequest =>
  deepmerge<LiteIdentifyRequest>(
    {
      email: 'alize49@gmail.com',
      phoneNumber: '+13176501326',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getLiteIdentifyResponse = (
  props: Partial<LiteIdentifyResponse>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): LiteIdentifyResponse =>
  deepmerge<LiteIdentifyResponse>(
    {
      userFound: true,
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getLogBody = (
  props: Partial<LogBody>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): LogBody =>
  deepmerge<LogBody>(
    {
      logLevel: 'incididunt sunt do magna',
      logMessage: 'est tempor labore magna ut',
      sdkKind: 'ad dolore',
      sdkName: 'Mrs. Beth Rice I',
      sdkVersion: 'quis',
      sessionId: 'f01f580e-0fcc-465b-881c-b73136beba05',
      tenantDomain: 'Excepteur irure veniam culpa',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getLoginChallengeRequest = (
  props: Partial<LoginChallengeRequest>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): LoginChallengeRequest =>
  deepmerge<LoginChallengeRequest>(
    {
      challengeKind: 'email',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getModernBusinessDecryptResponse = (
  props: Partial<ModernBusinessDecryptResponse>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): ModernBusinessDecryptResponse =>
  deepmerge<ModernBusinessDecryptResponse>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getModernRawBusinessDataRequest = (
  props: Partial<ModernRawBusinessDataRequest>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): ModernRawBusinessDataRequest =>
  deepmerge<ModernRawBusinessDataRequest>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getModernRawUserDataRequest = (
  props: Partial<ModernRawUserDataRequest>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): ModernRawUserDataRequest =>
  deepmerge<ModernRawUserDataRequest>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getModernUserDecryptResponse = (
  props: Partial<ModernUserDecryptResponse>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): ModernUserDecryptResponse =>
  deepmerge<ModernUserDecryptResponse>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getNeuroIdentityIdResponse = (
  props: Partial<NeuroIdentityIdResponse>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): NeuroIdentityIdResponse =>
  deepmerge<NeuroIdentityIdResponse>(
    {
      id: '2aac561e-b62a-4362-9120-92c3d84dcb6f',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );
export const getObConfigurationKind = (props: ObConfigurationKind): ObConfigurationKind => props ?? 'document';

export const getOnboardingRequirement = (
  props: Partial<OnboardingRequirement>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): OnboardingRequirement =>
  deepmerge<OnboardingRequirement>(
    {
      authMethodKind: 'email',
      kind: 'register_auth_method',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getOnboardingRequirementAuthorize = (
  props: Partial<OnboardingRequirementAuthorize>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): OnboardingRequirementAuthorize =>
  deepmerge<OnboardingRequirementAuthorize>(
    {
      authorizedAt: '1942-02-21T01:33:48.0Z',
      fieldsToAuthorize: {
        collectedData: ['dob', 'nationality', 'business_phone_number'],
        documentTypes: ['proof_of_address', 'visa', 'residence_document'],
      },
      kind: 'authorize',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getOnboardingRequirementCollectBusinessData = (
  props: Partial<OnboardingRequirementCollectBusinessData>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): OnboardingRequirementCollectBusinessData =>
  deepmerge<OnboardingRequirementCollectBusinessData>(
    {
      kind: 'collect_business_data',
      missingAttributes: ['nationality', 'business_phone_number', 'nationality'],
      populatedAttributes: ['ssn4', 'business_website', 'email'],
      recollectAttributes: ['business_name', 'us_legal_status', 'ssn4'],
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getOnboardingRequirementCollectData = (
  props: Partial<OnboardingRequirementCollectData>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): OnboardingRequirementCollectData =>
  deepmerge<OnboardingRequirementCollectData>(
    {
      kind: 'collect_data',
      missingAttributes: ['phone_number', 'business_name', 'email'],
      optionalAttributes: ['dob', 'us_legal_status', 'business_website'],
      populatedAttributes: ['business_name', 'phone_number', 'us_legal_status'],
      recollectAttributes: ['business_address', 'phone_number', 'us_legal_status'],
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getOnboardingRequirementCollectDocument = (
  props: Partial<OnboardingRequirementCollectDocument>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): OnboardingRequirementCollectDocument =>
  deepmerge<OnboardingRequirementCollectDocument>(
    {
      config: {
        kind: 'identity',
        shouldCollectConsent: false,
        shouldCollectSelfie: false,
        supportedCountryAndDocTypes: {},
      },
      documentRequestId: '25527580-8e93-4f41-be3b-0d840cf2060a',
      kind: 'collect_document',
      uploadSettings: 'prefer_capture',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getOnboardingRequirementCollectInvestorProfile = (
  props: Partial<OnboardingRequirementCollectInvestorProfile>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): OnboardingRequirementCollectInvestorProfile =>
  deepmerge<OnboardingRequirementCollectInvestorProfile>(
    {
      kind: 'collect_investor_profile',
      missingAttributes: ['business_kyced_beneficial_owners', 'business_phone_number', 'dob'],
      missingDocument: false,
      populatedAttributes: ['name', 'us_tax_id', 'investor_profile'],
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getOnboardingRequirementCreateBusinessOnboarding = (
  props: Partial<OnboardingRequirementCreateBusinessOnboarding>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): OnboardingRequirementCreateBusinessOnboarding =>
  deepmerge<OnboardingRequirementCreateBusinessOnboarding>(
    {
      kind: 'create_business_onboarding',
      requiresBusinessSelection: true,
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getOnboardingRequirementProcess = (
  props: Partial<OnboardingRequirementProcess>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): OnboardingRequirementProcess =>
  deepmerge<OnboardingRequirementProcess>(
    {
      kind: 'process',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getOnboardingRequirementRegisterAuthMethod = (
  props: Partial<OnboardingRequirementRegisterAuthMethod>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): OnboardingRequirementRegisterAuthMethod =>
  deepmerge<OnboardingRequirementRegisterAuthMethod>(
    {
      authMethodKind: 'email',
      kind: 'register_auth_method',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getOnboardingRequirementRegisterPasskey = (
  props: Partial<OnboardingRequirementRegisterPasskey>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): OnboardingRequirementRegisterPasskey =>
  deepmerge<OnboardingRequirementRegisterPasskey>(
    {
      kind: 'liveness',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getOnboardingResponse = (
  props: Partial<OnboardingResponse>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): OnboardingResponse =>
  deepmerge<OnboardingResponse>(
    {
      authToken: '47a04282-eeab-4b1b-8620-2201f48afa8f',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getOnboardingSessionResponse = (
  props: Partial<OnboardingSessionResponse>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): OnboardingSessionResponse =>
  deepmerge<OnboardingSessionResponse>(
    {
      bootstrapData: {},
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getOnboardingStatusResponse = (
  props: Partial<OnboardingStatusResponse>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): OnboardingStatusResponse =>
  deepmerge<OnboardingStatusResponse>(
    {
      allRequirements: [
        {
          isMet: false,
          requirement: {
            kind: 'process',
          },
        },
        {
          isMet: true,
          requirement: {
            kind: 'process',
          },
        },
        {
          isMet: false,
          requirement: {
            kind: 'process',
          },
        },
      ],
      canUpdateUserData: true,
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getPostBusinessOnboardingRequest = (
  props: Partial<PostBusinessOnboardingRequest>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): PostBusinessOnboardingRequest =>
  deepmerge<PostBusinessOnboardingRequest>(
    {
      inheritBusinessId: 'f6863402-d987-4c0d-bb28-6f65d008a1ef',
      kybFixtureResult: 'manual_review',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getPostOnboardingRequest = (
  props: Partial<PostOnboardingRequest>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): PostOnboardingRequest =>
  deepmerge<PostOnboardingRequest>(
    {
      fixtureResult: 'manual_review',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getProcessRequest = (
  props: Partial<ProcessRequest>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): ProcessRequest =>
  deepmerge<ProcessRequest>(
    {
      fixtureResult: 'pass',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getPublicOnboardingConfiguration = (
  props: Partial<PublicOnboardingConfiguration>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): PublicOnboardingConfiguration =>
  deepmerge<PublicOnboardingConfiguration>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getRegisterPasskeyAttemptContext = (
  props: Partial<RegisterPasskeyAttemptContext>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): RegisterPasskeyAttemptContext =>
  deepmerge<RegisterPasskeyAttemptContext>(
    {
      elapsedTimeInOsPromptMs: 50920410,
      errorMessage: 'ipsum enim',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getRenderV1SdkArgs = (
  props: Partial<RenderV1SdkArgs>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): RenderV1SdkArgs =>
  deepmerge<RenderV1SdkArgs>(
    {
      authToken: '20ab2344-79b9-4157-864f-6a2d827c4cdb',
      canCopy: false,
      defaultHidden: true,
      id: 'document.passport.back.image',
      label: 'anim ad',
      showHiddenToggle: true,
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );
export const getRequestedTokenScope = (props: RequestedTokenScope): RequestedTokenScope => props ?? 'auth';

export const getSdkArgs = (
  props: Partial<SdkArgs>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): SdkArgs =>
  deepmerge<SdkArgs>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getSdkArgsAuthV1 = (
  props: Partial<SdkArgsAuthV1>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): SdkArgsAuthV1 =>
  deepmerge<SdkArgsAuthV1>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getSdkArgsFormV1 = (
  props: Partial<SdkArgsFormV1>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): SdkArgsFormV1 =>
  deepmerge<SdkArgsFormV1>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getSdkArgsRenderV1 = (
  props: Partial<SdkArgsRenderV1>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): SdkArgsRenderV1 =>
  deepmerge<SdkArgsRenderV1>(
    {
      data: {
        authToken: '6bc8ffde-ab80-4517-ac75-32967bde8b97',
        canCopy: true,
        defaultHidden: true,
        id: 'document.visa.curp_validation_response',
        label: 'in enim sunt Duis culpa',
        showHiddenToggle: true,
      },
      kind: 'render_v1',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getSdkArgsUpdateAuthMethodsV1 = (
  props: Partial<SdkArgsUpdateAuthMethodsV1>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): SdkArgsUpdateAuthMethodsV1 =>
  deepmerge<SdkArgsUpdateAuthMethodsV1>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getSdkArgsVerifyResultV1 = (
  props: Partial<SdkArgsVerifyResultV1>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): SdkArgsVerifyResultV1 =>
  deepmerge<SdkArgsVerifyResultV1>(
    {
      data: {
        authToken: 'df86c475-af04-48eb-ae48-61c34b74850b',
        deviceResponse: 'Duis sint et mollit cupidatat',
      },
      kind: 'verify_result_v1',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getSdkArgsVerifyV1 = (
  props: Partial<SdkArgsVerifyV1>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): SdkArgsVerifyV1 =>
  deepmerge<SdkArgsVerifyV1>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getSignupChallengeRequest = (
  props: Partial<SignupChallengeRequest>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): SignupChallengeRequest =>
  deepmerge<SignupChallengeRequest>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );
export const getSkipLivenessClientType = (props: SkipLivenessClientType): SkipLivenessClientType => props ?? 'mobile';

export const getSkipLivenessContext = (
  props: Partial<SkipLivenessContext>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): SkipLivenessContext =>
  deepmerge<SkipLivenessContext>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getSkipPasskeyRegisterRequest = (
  props: Partial<SkipPasskeyRegisterRequest>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): SkipPasskeyRegisterRequest =>
  deepmerge<SkipPasskeyRegisterRequest>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getSocureDeviceSessionIdRequest = (
  props: Partial<SocureDeviceSessionIdRequest>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): SocureDeviceSessionIdRequest =>
  deepmerge<SocureDeviceSessionIdRequest>(
    {
      deviceSessionId: 'aabc0131-5d76-4f0b-9592-6ff8f90596b0',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getStytchTelemetryRequest = (
  props: Partial<StytchTelemetryRequest>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): StytchTelemetryRequest =>
  deepmerge<StytchTelemetryRequest>(
    {
      telemetryId: '7fab7c7a-7b8f-4b18-9d88-9c7afd4623ff',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getUpdateAuthMethodsV1SdkArgs = (
  props: Partial<UpdateAuthMethodsV1SdkArgs>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): UpdateAuthMethodsV1SdkArgs =>
  deepmerge<UpdateAuthMethodsV1SdkArgs>(
    {
      authToken: '85699da6-181e-4da0-97a4-df1ebe0a6499',
      l10N: {
        language: 'en',
        locale: 'en-US',
      },
      options: {
        showLogo: true,
      },
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );
export const getUserAuthScope = (props: UserAuthScope): UserAuthScope => props ?? 'explicit_auth';

export const getUserChallengeData = (
  props: Partial<UserChallengeData>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): UserChallengeData =>
  deepmerge<UserChallengeData>(
    {
      biometricChallengeJson: 'quis id dolore fugiat mollit',
      challengeKind: 'sms',
      challengeToken: '5cd67c7b-e409-4322-8088-c0605fdb2cff',
      timeBeforeRetryS: 99732452,
      token: 'b5471bda-9197-42d3-8509-e830179cf3f1',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getUserChallengeRequest = (
  props: Partial<UserChallengeRequest>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): UserChallengeRequest =>
  deepmerge<UserChallengeRequest>(
    {
      actionKind: 'replace',
      email: 'natalia.dicki@gmail.com',
      kind: 'passkey',
      phoneNumber: '+16262204670',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getUserChallengeResponse = (
  props: Partial<UserChallengeResponse>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): UserChallengeResponse =>
  deepmerge<UserChallengeResponse>(
    {
      biometricChallengeJson: 'in',
      challengeToken: '8d76e550-2547-4fb3-b49e-1446f09fd22f',
      timeBeforeRetryS: 81762098,
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getUserChallengeVerifyRequest = (
  props: Partial<UserChallengeVerifyRequest>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): UserChallengeVerifyRequest =>
  deepmerge<UserChallengeVerifyRequest>(
    {
      challengeResponse: 'amet consequat in',
      challengeToken: 'ae283eed-992f-469c-ae7a-5efceee26a77',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getUserChallengeVerifyResponse = (
  props: Partial<UserChallengeVerifyResponse>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): UserChallengeVerifyResponse =>
  deepmerge<UserChallengeVerifyResponse>(
    {
      authToken: '624998ae-34ed-496b-89df-d67ff0734dd5',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );
export const getUserDataIdentifier = (props: UserDataIdentifier): UserDataIdentifier => props ?? 'card.*.expiration';

export const getUserDecryptRequest = (
  props: Partial<UserDecryptRequest>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): UserDecryptRequest =>
  deepmerge<UserDecryptRequest>(
    {
      fields: ['id.address_line1', 'document.passport_card.nationality', 'document.drivers_license.full_name'],
      reason: 'sunt adipisicing deserunt',
      transforms: ['prefix(<n>)', 'to_lowercase', 'prefix(<n>)'],
      versionAt: '1911-08-13T18:10:09.0Z',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getVerifyResultV1SdkArgs = (
  props: Partial<VerifyResultV1SdkArgs>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): VerifyResultV1SdkArgs =>
  deepmerge<VerifyResultV1SdkArgs>(
    {
      authToken: '79b3047d-ce81-4bb3-b509-e39bc26fa006',
      deviceResponse: 'dolor mollit et laborum',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getVerifyV1Options = (
  props: Partial<VerifyV1Options>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): VerifyV1Options =>
  deepmerge<VerifyV1Options>(
    {
      showCompletionPage: false,
      showLogo: false,
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );

export const getVerifyV1SdkArgs = (
  props: Partial<VerifyV1SdkArgs>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): VerifyV1SdkArgs =>
  deepmerge<VerifyV1SdkArgs>(
    {
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
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );
export const getWorkflowFixtureResult = (props: WorkflowFixtureResult): WorkflowFixtureResult => props ?? 'pass';

export const getWorkflowRequestConfig = (
  props: Partial<WorkflowRequestConfig>,
  options: { overwriteArray: boolean } = { overwriteArray: true },
): WorkflowRequestConfig =>
  deepmerge<WorkflowRequestConfig>(
    {
      data: {
        playbookId: '44a4e9db-810e-460c-843b-c148ba5b40a7',
        recollectAttributes: ['bank', 'business_website', 'us_legal_status'],
        reuseExistingBoKyc: false,
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
        playbookId: '5b5573bd-f9e8-4997-91f6-8d73aa6418a8',
        recollectAttributes: ['full_address', 'card', 'card'],
        reuseExistingBoKyc: false,
      },
      kind: 'onboard',
    },
    props,
    { ...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {}) },
  );
