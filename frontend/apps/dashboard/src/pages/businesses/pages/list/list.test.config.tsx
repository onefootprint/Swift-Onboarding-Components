import { mockRequest } from '@onefootprint/test-utils';
import {
  BusinessDI,
  CollectedKybDataOption,
  CollectedKycDataOption,
  Entity,
  EntityKind,
  EntityStatus,
  OnboardingStatus,
  RoleScope,
} from '@onefootprint/types';
import { asAdminUser, resetUser } from 'src/config/tests';

beforeEach(() => {
  asAdminUser();
});

afterAll(() => {
  resetUser();
});

export const entitiesFixture: Entity[] = [
  {
    id: 'fp_bid_VXND11zUVRYQKKUxbUN3KD',
    isPortable: true,
    kind: EntityKind.business,
    attributes: [
      BusinessDI.city,
      BusinessDI.name,
      BusinessDI.website,
      BusinessDI.addressLine1,
      BusinessDI.phoneNumber,
      BusinessDI.zip,
      BusinessDI.country,
      BusinessDI.state,
      BusinessDI.tin,
    ],
    startTimestamp: '2023-03-27T14:43:47.444716Z',
    onboarding: {
      id: 'ob_Y3gPIFuPyhqK4f9w2f8QF7',
      isAuthorized: true,
      name: '[Test] Business',
      configId: 'ob_config_id_RccCUPbZVaarmtjfNwM9vo',
      requiresManualReview: false,
      status: OnboardingStatus.verified,
      timestamp: '2023-03-27T14:43:47.446874Z',
      isLivenessSkipped: false,
      insightEvent: {
        timestamp: '2023-03-27T14:43:47.418406Z',
        ipAddress: '191.251.92.92',
        city: 'Florian%C3%B3polis',
        country: 'Brazil',
        region: 'SC',
        regionName: 'Santa Catarina',
        latitude: -27.6147,
        longitude: -48.4976,
        postalCode: '88000',
        timeZone: 'America/Sao_Paulo',
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36',
      },
      canAccessPermissions: [
        RoleScope.decryptName,
        RoleScope.decryptDob,
        RoleScope.decryptSsn9,
        RoleScope.decryptFullAddress,
        RoleScope.decryptEmail,
        RoleScope.decryptPhoneNumber,
        RoleScope.decryptBusinessName,
        RoleScope.decryptBusinessTin,
        RoleScope.decryptBusinessAddress,
        RoleScope.decryptBusinessPhoneNumber,
        RoleScope.decryptBusinessWebsite,
      ],
      canAccessData: [
        CollectedKycDataOption.name,
        CollectedKycDataOption.dob,
        CollectedKycDataOption.ssn9,
        CollectedKycDataOption.fullAddress,
        CollectedKycDataOption.email,
        CollectedKycDataOption.phoneNumber,
        CollectedKybDataOption.name,
        CollectedKybDataOption.tin,
        CollectedKybDataOption.address,
        CollectedKybDataOption.phoneNumber,
        CollectedKybDataOption.website,
      ],
      canAccessAttributes: [],
    },
    requiresManualReview: false,
    status: EntityStatus.pass,
    decryptedAttributes: {
      [BusinessDI.name]: 'Acme Inc.',
    },
  },
];

export const entitiesFormattedFixture = [
  {
    status: 'Verified',
    startTimestamp: '3/27/23, 2:43 PM',
  },
];

export const withEntities = (businesses: Entity[] = entitiesFixture) =>
  mockRequest({
    method: 'get',
    path: '/entities',
    response: {
      data: businesses,
      meta: {},
    },
  });

export const withEntitiesError = () =>
  mockRequest({
    method: 'get',
    path: '/entities',
    statusCode: 400,
    response: {
      error: {
        message: 'Something went wrong',
      },
    },
  });
