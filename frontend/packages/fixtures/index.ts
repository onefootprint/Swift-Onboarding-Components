import type {
  AuthMethod,
  AuthRequirementsResponse,
  AuthorizedOrg,
  BatchHostedBusinessOwnerRequest,
  BoToken,
  BusinessDecryptResponse,
  BusinessOnboardingResponse,
  CheckSessionResponse,
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
  D2pSmsRequest,
  D2pSmsResponse,
  D2pStatusResponse,
  D2pUpdateStatusRequest,
  DeviceAttestationChallengeResponse,
  DocumentResponse,
  EmailVerifyRequest,
  Empty,
  FingerprintVisitRequest,
  GetDeviceAttestationChallengeRequest,
  GetSdkArgsTokenResponse,
  GetUserTokenResponse,
  HostedBusiness,
  HostedBusinessDetail,
  HostedBusinessOwner,
  HostedValidateResponse,
  IdentifyChallengeResponse,
  IdentifyRequest,
  IdentifyResponse,
  IdentifyVerifyRequest,
  IdentifyVerifyResponse,
  KbaResponse,
  LiteIdentifyRequest,
  LiteIdentifyResponse,
  LogBody,
  LoginChallengeRequest,
  ModernRawBusinessDataRequest,
  ModernRawUserDataRequest,
  NeuroIdentityIdResponse,
  OnboardingResponse,
  OnboardingSessionResponse,
  OnboardingStatusResponse,
  PostBusinessOnboardingRequest,
  PostOnboardingRequest,
  ProcessRequest,
  PublicOnboardingConfiguration,
  SdkArgs,
  SignupChallengeRequest,
  SkipPasskeyRegisterRequest,
  SocureDeviceSessionIdRequest,
  StytchTelemetryRequest,
  UserChallengeRequest,
  UserChallengeResponse,
  UserChallengeVerifyRequest,
  UserChallengeVerifyResponse,
  UserDecryptRequest,
  UserDecryptResponse,
} from '@onefootprint/request-types';
import merge from 'lodash/merge';

export const getAuthMethod = (props: Partial<AuthMethod>) =>
  merge(
    {
      canUpdate: true,
      isVerified: true,
      kind: 'phone',
    },
    props,
  ) as AuthMethod;
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
export const getAuthorizedOrg = (props: Partial<AuthorizedOrg>) =>
  merge(
    {
      canAccessData: ['UsTaxId', 'Ssn4'],
      logoUrl: 'https://elementary-dredger.name',
      orgName: 'Ted Sipes',
    },
    props,
  ) as AuthorizedOrg;
export const getBatchHostedBusinessOwnerRequest = (props: Partial<BatchHostedBusinessOwnerRequest>) =>
  (props ?? 'commodo eu sit') as BatchHostedBusinessOwnerRequest;
export const getBoToken = (props: Partial<BoToken>) =>
  merge(
    {
      firstName: 'Elyssa',
      lastName: 'Lakin',
      token: '2384c757-cd1a-49f3-bc1e-51100890a811',
    },
    props,
  ) as BoToken;
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
export const getCheckSessionResponse = (props: Partial<CheckSessionResponse>) =>
  (props ?? 'unknown') as CheckSessionResponse;
export const getConsentRequest = (props: Partial<ConsentRequest>) =>
  merge(
    {
      consentLanguageText: 'en',
      mlConsent: false,
    },
    props,
  ) as ConsentRequest;
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
      documentType: 'id_card',
      fixtureResult: 'Fail',
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
export const getD2pGenerateRequest = (props: Partial<D2pGenerateRequest>) =>
  merge(
    {
      meta: {
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
        redirectUrl: 'https://querulous-lava.net',
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
export const getDeviceAttestationChallengeResponse = (props: Partial<DeviceAttestationChallengeResponse>) =>
  merge(
    {
      attestationChallenge: 'cillum mollit elit adipisicing ea',
      state: 'Texas',
    },
    props,
  ) as DeviceAttestationChallengeResponse;
export const getDocumentResponse = (props: Partial<DocumentResponse>) =>
  merge(
    {
      errors: ['image_error', 'selfie_image_orientation_incorrect', 'selfie_image_orientation_incorrect'],
      isRetryLimitExceeded: false,
    },
    props,
  ) as DocumentResponse;
export const getEmailVerifyRequest = (props: Partial<EmailVerifyRequest>) =>
  merge(
    {
      data: 'officia Duis voluptate irure',
    },
    props,
  ) as EmailVerifyRequest;
export const getEmpty = (props: Partial<Empty>) => merge({}, props) as Empty;
export const getFingerprintVisitRequest = (props: Partial<FingerprintVisitRequest>) =>
  merge(
    {
      path: 'amet ut qui nisi et',
      requestId: 'dbc865d5-d99c-4a26-88c2-ad2001705ee0',
      visitorId: '75d72fca-c326-4fc1-ba3e-5b7f82d08e81',
    },
    props,
  ) as FingerprintVisitRequest;
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
        'bank.*.ach_routing_number': 'in in',
        'bank.*.fingerprint': 'ut',
        'card.*.billing_address.zip': '218 Israel Parkway Apt. 466',
        'card.*.expiration': 'veniam ut exercitation in dolor',
        'card.*.expiration_year': 'Excepteur aliquip dolor cupidatat',
        'card.*.fingerprint': 'cillum laborum',
        'card.*.name': 'Lauren Olson I',
        'card.*.number': 'sit est laborum irure minim',
        'card.*.number_last4': 'Ut ad irure exercitation',
        'custom.*': 'cillum',
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
        'document.drivers_license.issued_at': 'et',
        'document.drivers_license.issuing_state': 'Iowa',
        'document.drivers_license.nationality': 'velit elit',
        'document.drivers_license.ref_number': 'non ut sint mollit ullamco',
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
        'document.passport_card.back.image': 'Duis do tempor Ut Lorem',
        'document.passport_card.back.mime_type': 'in fugiat Duis Ut',
        'document.passport_card.clave_de_elector': 'nostrud Lorem',
        'document.passport_card.curp': 'ut ipsum consectetur',
        'document.passport_card.curp_validation_response': '9ef68a5e-e717-42c2-a9ed-2b4a77525809',
        'document.passport_card.dob': 'nostrud consectetur sed',
        'document.passport_card.expires_at': 'aliquip id',
        'document.passport_card.front.image': 'occaecat voluptate tempor magna dolore',
        'document.passport_card.front.mime_type': 'nostrud',
        'document.passport_card.full_address': '8193 S Railroad Street Apt. 493',
        'document.passport_card.issuing_state': 'Mississippi',
        'document.passport_card.nationality': 'Duis irure',
        'document.passport_card.ref_number': 'anim sint officia exercitation',
        'document.passport_card.selfie.image': 'magna aliquip Lorem et ipsum',
        'document.passport_card.selfie.mime_type': 'ad velit proident',
        'document.permit.back.image': 'officia aliqua tempor',
        'document.permit.classified_document_type': 'eu sed',
        'document.permit.clave_de_elector': 'dolore laboris exercitation veniam ut',
        'document.permit.curp_validation_response': '98b77bd4-5b52-4cf1-a091-a8ff2e2e5d72',
        'document.permit.dob': 'reprehenderit',
        'document.permit.document_number': 'laborum et Excepteur cillum pariatur',
        'document.permit.expires_at': 'occaecat culpa sunt',
        'document.permit.full_name': 'Steven Dooley',
        'document.permit.gender': 'tempor laborum ad deserunt est',
        'document.permit.issued_at': 'id sint qui exercitation sed',
        'document.permit.issuing_country': 'Antigua and Barbuda',
        'document.permit.issuing_state': 'Arkansas',
        'document.permit.nationality': 'id',
        'document.permit.ref_number': 'sit reprehenderit Ut est',
        'document.permit.selfie.image': 'ullamco',
        'document.permit.selfie.mime_type': 'Ut anim',
        'document.proof_of_address.image': '1824 Broad Street Apt. 318',
        'document.residence_document.back.image': '8f3d9265-f5e7-4655-9317-b215a6136c97',
        'document.residence_document.back.mime_type': '250e1a8d-d3a7-4840-9c6c-2db4a48f7726',
        'document.residence_document.classified_document_type': '6f1f934f-38bf-433e-b38b-6d6ee88b6d6c',
        'document.residence_document.clave_de_elector': '18b1465e-38ea-496b-8940-7d5688fe91d9',
        'document.residence_document.curp': 'd61622fd-505f-4ed8-9b56-81af5d3f3847',
        'document.residence_document.curp_validation_response': 'c4fa9033-9537-4cd6-8099-9233816ec527',
        'document.residence_document.document_number': '151af7ee-e8db-4357-9d9e-bfa88aba27f2',
        'document.residence_document.front.image': '6e20eb41-a446-460a-b420-8facc8ffbb8c',
        'document.residence_document.front.mime_type': '65c0c7b6-4fd5-40a6-8144-8164875456ca',
        'document.residence_document.full_address': '7084 Beahan Overpass Suite 902',
        'document.residence_document.full_name': 'Betsy Muller III',
        'document.residence_document.issuing_country': 'Greenland',
        'document.residence_document.issuing_state': 'Colorado',
        'document.residence_document.nationality': '9d12e739-bcd9-41b3-b219-dd98f3fe875f',
        'document.residence_document.selfie.image': '880471b2-020e-4282-9b9e-85989efcbb7d',
        'document.residence_document.selfie.mime_type': 'b311f2c2-a06f-4769-b74f-fa65c11615a4',
        'document.ssn_card.image': 'id tempor nulla reprehenderit',
        'document.visa.back.mime_type': 'ut',
        'document.visa.classified_document_type': 'aliquip in',
        'document.visa.clave_de_elector': 'Duis qui pariatur enim',
        'document.visa.curp': 'minim eiusmod ipsum et',
        'document.visa.curp_validation_response': 'f8d4346f-1f0a-40ad-b077-e2e878cc93c9',
        'document.visa.dob': 'tempor consequat',
        'document.visa.expires_at': 'laboris deserunt do',
        'document.visa.front.image': 'eu tempor Excepteur laboris',
        'document.visa.full_address': '33011 Abshire Ramp Apt. 854',
        'document.visa.full_name': 'Ms. Gertrude Morar',
        'document.visa.gender': 'officia ut id culpa reprehenderit',
        'document.visa.issued_at': 'nostrud',
        'document.visa.issuing_country': 'Zimbabwe',
        'document.visa.issuing_state': 'Colorado',
        'document.visa.nationality': 'adipisicing reprehenderit',
        'document.visa.ref_number': 'tempor est laborum',
        'document.visa.selfie.image': 'esse aliquip anim mollit',
        'document.visa.selfie.mime_type': 'et dolore',
        'document.voter_identification.back.image': 'e1eb9b7c-cb1e-440b-bba6-dc922956e5e8',
        'document.voter_identification.back.mime_type': '50cd5bda-a0fa-4d44-a8f3-6b3e60f8585e',
        'document.voter_identification.clave_de_elector': '0c942207-60cf-4686-8818-4f6497d7d778',
        'document.voter_identification.curp': 'f2bcc5d5-200c-46ea-b928-808ab0d8314d',
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
        'id.first_name': 'Jermey',
        'id.itin': '286ab895-59b7-45a4-a5d0-14b3ce740730',
        'id.last_name': 'Fadel',
        'id.middle_name': 'Spencer Altenwerth',
        'id.nationality': '27ff7384-6393-41df-885a-cf04388642a8',
        'id.phone_number': '+19289933208',
        'id.ssn4': '4c2b07cd-7640-4af3-9e29-6a3892d8162e',
        'id.ssn9': 'e5e15b02-7207-432d-a1f5-d4c8bf20fa5d',
        'id.state': 'Vermont',
        'id.us_tax_id': 'e4eda44d-1260-4533-9b0a-a69c558b0b09',
        'id.visa_expiration_date': '674d83ca-49eb-4252-ab86-aa5e789e195c',
        'id.visa_kind': 'dc4be68f-9b62-4ab5-88c7-b0033ef593d4',
        'id.zip': '18510',
        'investor_profile.employer': 'occaecat sint cillum amet magna',
        'investor_profile.employment_status': 'aute in magna Duis voluptate',
        'investor_profile.family_member_names': 'Irma Hartmann',
        'investor_profile.funding_sources': 'in aute id aliqua dolore',
        'investor_profile.investment_goals': 'sunt eu cupidatat',
        'investor_profile.net_worth': 'proident sed ipsum enim',
        'investor_profile.political_organization': 'cupidatat ut Ut Excepteur',
        'investor_profile.risk_tolerance': 'ipsum voluptate irure',
        'investor_profile.senior_executive_symbols': 'eiusmod quis pariatur aute',
      },
      hasLinkedUser: true,
      isAuthedUser: false,
      isMutable: false,
      linkId: '8ae139b0-3d85-4a22-a6bf-70448a80c36b',
      ownershipStake: -95728893,
      populatedData: ['document.visa.selfie.mime_type', 'document.id_card.full_name'],
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
export const getIdentifyRequest = (props: Partial<IdentifyRequest>) =>
  merge(
    {
      email: 'viola.mante53@gmail.com',
      identifier: '9bb28265-1c6a-4a55-b2c2-a11d7434671a',
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
        availableChallengeKinds: ['sms'],
        canInitiateSignupChallenge: false,
        hasSyncablePasskey: true,
        isUnverified: false,
        matchingFps: ['document.drivers_license.ref_number'],
        scrubbedEmail: 'noe.lebsack@gmail.com',
        scrubbedPhone: '+18728931811',
        token: '76e85ee4-60ba-4354-abac-01289d0c4a2b',
        tokenScopes: ['sign_up', 'auth'],
      },
    },
    props,
  ) as IdentifyResponse;
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
export const getKbaResponse = (props: Partial<KbaResponse>) =>
  merge(
    {
      token: 'de3c7a52-470a-49c8-a22a-56e3401d2db5',
    },
    props,
  ) as KbaResponse;
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
      sdkKind: 'sit aliqua',
      sdkName: 'Patti Towne',
      sdkVersion: 'nostrud ad exercitation consequat reprehenderit',
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
      'business.corporation_type': 'fugiat veniam nostrud',
      'business.country': 'Djibouti',
      'business.dba': 'in',
      'business.formation_state': 'Mississippi',
      'business.name': 'Francisco Bailey II',
      'business.phone_number': '+19308250426',
      'business.website': 'https://cumbersome-polyester.com/',
      'custom.*': 'eu dolor in',
    },
    props,
  ) as ModernRawBusinessDataRequest;
export const getModernRawUserDataRequest = (props: Partial<ModernRawUserDataRequest>) =>
  merge(
    {
      'bank.*.account_type': 'nostrud',
      'bank.*.ach_routing_number': 'et cillum eiusmod qui consectetur',
      'bank.*.fingerprint': 'aliquip in sit aute',
      'bank.*.name': 'Adrian DuBuque',
      'card.*.billing_address.country': '173 E Broad Street Suite 895',
      'card.*.cvc': 'dolor labore aute amet cupidatat',
      'card.*.expiration': 'mollit',
      'card.*.expiration_month': 'dolore sint',
      'card.*.expiration_year': 'culpa',
      'card.*.issuer': 'sed velit',
      'card.*.number_last4': 'ex anim aute Duis',
      'document.custom.*': 'Excepteur in',
      'document.drivers_license.back.image': 'non aute elit Lorem',
      'document.drivers_license.back.mime_type': 'mollit',
      'document.drivers_license.clave_de_elector': 'cillum non',
      'document.drivers_license.curp_validation_response': '4d0d94e7-a4c5-4361-9d9a-b74f856c27ec',
      'document.drivers_license.dob': 'sed ut in',
      'document.drivers_license.expires_at': 'ut',
      'document.drivers_license.front.image': 'do dolor nostrud proident adipisicing',
      'document.drivers_license.front.mime_type': 'ut sit',
      'document.drivers_license.full_address': '10932 Springfield Road Suite 561',
      'document.drivers_license.full_name': 'Olga Jacobs MD',
      'document.drivers_license.issued_at': 'Ut ut pariatur',
      'document.drivers_license.issuing_state': 'Nevada',
      'document.drivers_license.ref_number': 'pariatur',
      'document.drivers_license.selfie.image': 'exercitation occaecat',
      'document.drivers_license.selfie.mime_type': 'eu in cupidatat proident',
      'document.finra_compliance_letter': 'dolor ipsum',
      'document.id_card.classified_document_type': '7782ade3-54f4-4935-a5e5-b66ccf6a238f',
      'document.id_card.curp': '67574c4c-b1e6-4074-a9d8-8c996dac4c3f',
      'document.id_card.curp_validation_response': '27a8c157-c205-438e-9e2a-2d69cd596ed2',
      'document.id_card.dob': '8858b570-a643-43ce-87fb-231041909546',
      'document.id_card.document_number': '901b754c-c9b6-4f36-af17-1a281b3eac03',
      'document.id_card.expires_at': '71b9b517-7ae0-4c31-8fdd-056b8b8fa1ce',
      'document.id_card.front.image': '23582365-1607-4a61-ab12-eb6fe4d57990',
      'document.id_card.front.mime_type': '73808840-a165-43ea-b02a-b66188568158',
      'document.id_card.gender': '0e8966a2-fce3-4f88-992f-d7ad770c37f0',
      'document.id_card.nationality': '4440ef7e-fba1-4186-86b6-65c0c5e26b9a',
      'document.id_card.ref_number': '743d59db-5afe-4e2c-a3bf-8699d84ee458',
      'document.id_card.selfie.image': 'fdaeb7e2-75ce-4c30-b25b-dad79d4fe3a0',
      'document.passport.back.mime_type': 'sint Duis dolor labore est',
      'document.passport.classified_document_type': 'dolor labore ipsum deserunt anim',
      'document.passport.clave_de_elector': 'amet in tempor minim',
      'document.passport.curp': 'laborum magna dolor sit',
      'document.passport.document_number': 'cupidatat non et incididunt',
      'document.passport.expires_at': 'aute',
      'document.passport.front.image': 'consectetur ullamco qui dolore',
      'document.passport.front.mime_type': 'esse incididunt Excepteur exercitation aute',
      'document.passport.full_address': '51931 S Grand Avenue Suite 849',
      'document.passport.issued_at': 'ea',
      'document.passport.nationality': 'dolor consectetur',
      'document.passport.selfie.image': 'dolore Duis ea sit',
      'document.passport_card.back.mime_type': 'occaecat',
      'document.passport_card.classified_document_type': 'voluptate',
      'document.passport_card.clave_de_elector': 'consectetur ea in do',
      'document.passport_card.curp': 'dolor ut id pariatur Excepteur',
      'document.passport_card.curp_validation_response': 'f4f3ea80-1661-4be3-a9b8-ab70c4b9eee1',
      'document.passport_card.dob': 'magna',
      'document.passport_card.document_number': 'laborum Lorem ullamco',
      'document.passport_card.expires_at': 'culpa',
      'document.passport_card.front.image': 'eiusmod',
      'document.passport_card.full_address': '232 Water Street Apt. 530',
      'document.passport_card.full_name': 'Sherry Prosacco',
      'document.passport_card.issued_at': 'Duis laboris veniam non sit',
      'document.passport_card.issuing_country': 'Slovenia',
      'document.passport_card.nationality': 'ut dolor amet',
      'document.passport_card.selfie.image': 'non ad',
      'document.permit.clave_de_elector': 'deserunt laborum Excepteur magna',
      'document.permit.curp': 'in anim',
      'document.permit.curp_validation_response': 'b6d308c1-5607-4a5a-add1-60ce86ca5410',
      'document.permit.dob': 'sint sunt ut sit consectetur',
      'document.permit.full_address': '295 Brando Summit Apt. 332',
      'document.permit.gender': 'qui',
      'document.permit.issuing_country': 'Anguilla',
      'document.permit.issuing_state': 'West Virginia',
      'document.permit.nationality': 'voluptate dolore',
      'document.permit.ref_number': 'fugiat aliquip sint nostrud sit',
      'document.permit.selfie.mime_type': 'Duis ut elit cillum reprehenderit',
      'document.proof_of_address.image': '752 Boyle Trace Apt. 261',
      'document.residence_document.back.image': '56294918-8efd-40d5-a33f-5cb11c5eeeff',
      'document.residence_document.classified_document_type': 'a2f5f168-4fe8-4639-897d-c5a6704a7461',
      'document.residence_document.clave_de_elector': '626914e6-1817-4165-8d7c-360d3d4796a7',
      'document.residence_document.curp': '1dd58a51-1508-4474-84e7-e2c013e81ace',
      'document.residence_document.curp_validation_response': 'e91bb95c-bb1d-4fa6-856c-e29d2d0e6af9',
      'document.residence_document.dob': 'd3e75ed1-fe3b-4077-af77-92d739722e89',
      'document.residence_document.document_number': 'ab140d9e-fc2e-4def-918b-d5234fef69c1',
      'document.residence_document.expires_at': 'a31a2a76-b168-4462-8dbe-3c1fc96b2c5c',
      'document.residence_document.front.image': 'c75603bf-6374-4a17-9699-3811eabf4856',
      'document.residence_document.full_address': '6425 Glenda Underpass Apt. 437',
      'document.residence_document.gender': 'c20b4545-ae90-4bae-b729-c1ab9097e078',
      'document.residence_document.issued_at': 'c68c89c9-0095-476e-b5de-c42ac27045db',
      'document.residence_document.issuing_country': 'Macao',
      'document.residence_document.issuing_state': 'Maine',
      'document.residence_document.ref_number': '0421ae3f-5901-41e2-a155-50bffdc0a6b8',
      'document.residence_document.selfie.image': '02773f0d-716f-47b5-aca1-97b24e86fdc0',
      'document.residence_document.selfie.mime_type': 'd2a96bae-6b3c-4b44-8c64-981701735c8f',
      'document.ssn_card.image': 'pariatur dolore laborum nostrud sunt',
      'document.visa.back.image': 'commodo incididunt dolore in ut',
      'document.visa.back.mime_type': 'non reprehenderit voluptate',
      'document.visa.clave_de_elector': 'amet in fugiat sint minim',
      'document.visa.curp_validation_response': '7b92a9a0-fa79-44f5-8f30-6d647d2f006f',
      'document.visa.dob': 'ex labore esse Excepteur',
      'document.visa.document_number': 'sunt',
      'document.visa.expires_at': 'tempor nisi laboris pariatur',
      'document.visa.full_name': 'Wendell Hirthe',
      'document.visa.issued_at': 'nostrud aliqua anim ullamco non',
      'document.visa.issuing_state': 'New York',
      'document.visa.nationality': 'eu',
      'document.visa.selfie.image': 'voluptate in aliqua in',
      'document.visa.selfie.mime_type': 'proident in est cupidatat',
      'document.voter_identification.back.image': 'c70348ca-15fe-44ae-8a62-ee41814c94c2',
      'document.voter_identification.back.mime_type': 'd57c0f27-e13b-476f-a0e3-33b6a7d8c2b8',
      'document.voter_identification.classified_document_type': '4daeeda5-809a-4006-8c27-b255312bda8f',
      'document.voter_identification.dob': '0a4e67eb-a2f0-4def-97bd-318788e5a204',
      'document.voter_identification.document_number': '3a899bf5-afb2-47e0-9c11-88774462706b',
      'document.voter_identification.expires_at': '51981510-0913-4740-9253-51855580dc86',
      'document.voter_identification.front.mime_type': '78df07f1-91c9-4e52-bbc7-f46a025c3982',
      'document.voter_identification.full_name': 'Miss Casey Pollich',
      'document.voter_identification.issued_at': '9e847f37-ef22-4f98-a991-abe2934c5a9b',
      'document.voter_identification.issuing_country': 'Norway',
      'document.voter_identification.issuing_state': 'Wyoming',
      'document.voter_identification.nationality': 'aedeca19-72da-458a-895c-a357f3cedadd',
      'document.voter_identification.ref_number': 'e050acea-149f-49a1-8378-e5bdacb7b676',
      'document.voter_identification.selfie.image': 'af119a06-baa8-494d-99c1-2cdce4ad3e6f',
      'id.address_line2': '503 Brennan Unions Suite 549',
      'id.country': 'Thailand',
      'id.dob': 'c609523e-fef6-4f09-8e72-f1e68cbcc7de',
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
      'investor_profile.annual_income': 'in magna',
      'investor_profile.brokerage_firm_employer': 'consectetur ut occaecat pariatur',
      'investor_profile.investment_goals': 'ipsum aliquip aute',
      'investor_profile.net_worth': 'deserunt minim',
      'investor_profile.occupation': 'elit anim veniam velit dolor',
      'investor_profile.risk_tolerance': 'fugiat ea minim',
      'investor_profile.senior_executive_symbols': 'mollit laborum',
    },
    props,
  ) as ModernRawUserDataRequest;
export const getNeuroIdentityIdResponse = (props: Partial<NeuroIdentityIdResponse>) =>
  merge(
    {
      id: 'c649b1b7-5107-44f5-98ab-b53bdf037e18',
    },
    props,
  ) as NeuroIdentityIdResponse;
export const getOnboardingResponse = (props: Partial<OnboardingResponse>) =>
  merge(
    {
      authToken: '2c662728-a589-4815-a38c-231cfd2f12c5',
      onboardingConfig: {
        allowInternationalResidents: false,
        allowedOrigins: ['commodo deserunt dolor culpa'],
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
        requiredAuthMethods: ['email'],
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
      ],
      obConfiguration: {
        allowInternationalResidents: true,
        allowedOrigins: ['amet velit ad occaecat', 'aliquip aute'],
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
        supportedCountries: ['VA', 'AE'],
      },
    },
    props,
  ) as OnboardingStatusResponse;
export const getPostBusinessOnboardingRequest = (props: Partial<PostBusinessOnboardingRequest>) =>
  merge(
    {
      inheritBusinessId: '8add410e-5821-4dd9-9749-44846f8aeb55',
      kybFixtureResult: 'pass',
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
      allowedOrigins: ['minim', 'enim aute ut'],
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
      requiredAuthMethods: ['phone'],
      requiresIdDoc: true,
      skipConfirm: true,
      status: 'enabled',
      supportEmail: 'alf_erdman44@gmail.com',
      supportPhone: '+18674459587',
      supportWebsite: 'https://aged-vicinity.com/',
      supportedCountries: ['AI', 'MX', 'KG'],
    },
    props,
  ) as PublicOnboardingConfiguration;
export const getSdkArgs = (props: Partial<SdkArgs>) => (props ?? 'magna exercitation aute minim incididunt') as SdkArgs;
export const getSignupChallengeRequest = (props: Partial<SignupChallengeRequest>) =>
  merge(
    {
      challengeKind: 'biometric',
      scope: 'my1fp',
    },
    props,
  ) as SignupChallengeRequest;
export const getSkipPasskeyRegisterRequest = (props: Partial<SkipPasskeyRegisterRequest>) =>
  merge(
    {
      context: {
        attempts: [
          {
            elapsedTimeInOsPromptMs: -26473504,
            errorMessage: 'sunt cupidatat',
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
export const getUserDecryptRequest = (props: Partial<UserDecryptRequest>) =>
  merge(
    {
      fields: ['document.id_card.expires_at'],
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
