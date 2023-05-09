import { mockRequest } from '@onefootprint/test-utils';
import {
  BusinessDI,
  Entity,
  EntityKind,
  EntityStatus,
  OnboardingStatus,
  RoleScope,
} from '@onefootprint/types';

export const entityFixture: Entity = {
  id: 'fp_bid_VXND11zUVRYQKKUxbUN3KD',
  isPortable: true,
  kind: EntityKind.business,
  attributes: [
    BusinessDI.addressLine1,
    BusinessDI.beneficialOwners,
    BusinessDI.city,
    BusinessDI.country,
    BusinessDI.name,
    BusinessDI.phoneNumber,
    BusinessDI.state,
    BusinessDI.tin,
    BusinessDI.tin,
    BusinessDI.website,
    BusinessDI.zip,
  ],
  startTimestamp: '2023-03-27T14:43:47.444716Z',
  onboarding: {
    id: 'ob_Y3gPIFuPyhqK4f9w2f8QF7',
    isAuthorized: true,
    name: '[Test] Business',
    configId: 'ob_config_id_RccCUPbZVaarmtjfNwM9vo',
    requiresManualReview: false,
    status: OnboardingStatus.pass,
    timestamp: '2023-03-27T14:43:47.446874Z',
    insightEvent: {
      timestamp: '2023-04-03T17:42:30.799202Z',
      ipAddress: '67.243.21.56',
      city: 'New York',
      country: 'United States',
      region: 'NY',
      regionName: 'New York',
      latitude: 40.7365,
      longitude: -74.0055,
      metroCode: '501',
      postalCode: '10014',
      timeZone: 'America/New_York',
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.2 Safari/605.1.15',
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
      RoleScope.decryptBusinessBeneficialOwners,
    ],
  },
  requiresManualReview: false,
  status: EntityStatus.pass,
  decryptedAttributes: {
    [BusinessDI.name]: 'Acme Inc.',
  },
  watchlistCheck: null,
};

export const withBusinessOwnersError = (entity = entityFixture) =>
  mockRequest({
    method: 'get',
    path: `/businesses/${entity.id}/owners`,
    statusCode: 400,
    response: {
      error: {
        message: 'Something went wrong',
      },
    },
  });
