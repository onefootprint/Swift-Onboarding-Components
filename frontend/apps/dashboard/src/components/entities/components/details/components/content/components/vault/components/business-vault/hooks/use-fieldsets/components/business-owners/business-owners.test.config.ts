import { getEntity, getPrivateBusinessOwner } from '@onefootprint/fixtures/dashboard';
import { mockRequest } from '@onefootprint/test-utils';

export const entityFixture = getEntity({
  id: 'fp_bid_VXND11zUVRYQKKUxbUN3KD',
  kind: 'business',
  data: [
    {
      source: 'client_tenant',
      dataKind: 'vault_data',
      transforms: {},
      // @ts-expect-error fix once we migrate to the new entity types
      identifier: 'business.beneficial_owner_explanation_message',
      isDecryptable: true,
      value:
        "The other 5% is split among 10 small angel investors, so I didn't think it was relevant to add them all here.",
    },
  ],
  status: 'pass',
});

export const withBusinessOwnersError = (entity = entityFixture) => {
  return mockRequest({
    method: 'get',
    path: `/entities/${entity.id}/business_owners`,
    statusCode: 400,
    response: {
      message: 'Something went wrong',
    },
  });
};

export const withBusinessOwners = (entity = entityFixture) => {
  return mockRequest({
    method: 'get',
    path: `/entities/${entity.id}/business_owners`,
    statusCode: 200,
    response: [
      getPrivateBusinessOwner({
        fpId: 'fp_id_test_4Cuir5AKf9Hdaxyjay3fMZ',
        status: 'incomplete',
        ownershipStake: 24,
        // @ts-expect-error fix once we migrate to the new entity types
        ownershipStakeDi: 'business.beneficial_owners.bo_link_primary.ownership_stake',
        kind: 'primary',
        source: 'hosted',
        name: 'John Smith',
      }),
      getPrivateBusinessOwner({
        fpId: 'fp_id_test_5Duir6BLg0Iebxzkbz4gNa',
        status: 'incomplete',
        ownershipStake: 35,
        // @ts-expect-error fix once we migrate to the new entity types
        ownershipStakeDi: 'business.beneficial_owners.bo_link_primary.ownership_stake',
        kind: 'secondary',
        source: 'hosted',
        name: 'Sarah Johnson',
      }),
      getPrivateBusinessOwner({
        fpId: 'fp_id_test_6Euir7CMh1Jfcyalc05hOb',
        status: 'incomplete',
        ownershipStake: 41,
        // @ts-expect-error fix once we migrate to the new entity types
        ownershipStakeDi: 'business.beneficial_owners.bo_link_primary.ownership_stake',
        kind: 'secondary',
        source: 'hosted',
        name: 'Michael Brown',
      }),
    ],
  });
};
