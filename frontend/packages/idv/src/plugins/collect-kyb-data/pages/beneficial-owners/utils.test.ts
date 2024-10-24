import type { HostedBusinessOwner } from '@onefootprint/services';
import type { BeneficialOwnerWithMetadata } from './components/form/types';
import { getBusinessOwnerPatchOperations } from './utils';

jest.mock('@onefootprint/dev-tools', () => ({
  uuidv4: jest.fn(() => 'mocked-uuid'),
}));

const mockCurrentOwners: HostedBusinessOwner[] = [
  {
    uuid: '1',
    decryptedData: {
      'id.email': 'owner1@example.com',
      'id.phone_number': '1234567890',
    },
    hasLinkedUser: false,
    isAuthedUser: false,
    isMutable: true,
    ownershipStake: 5,
    populatedData: [],
  },
  {
    uuid: '2',
    decryptedData: {
      'id.email': 'owner2@example.com',
      'id.phone_number': '0987654321',
    },
    hasLinkedUser: false,
    isAuthedUser: false,
    isMutable: true,
    ownershipStake: 3,
    populatedData: [],
  },
];

describe('getBusinessOwnerPatchOperations', () => {
  it('should update existing owners', () => {
    const formOwners: BeneficialOwnerWithMetadata[] = [
      {
        _uuid: '1',
        first_name: 'John',
        last_name: 'Doe',
        email: 'owner1@example.com',
        phone_number: '1111111111',
        ownership_stake: 60,
      },
      {
        _uuid: '2',
        first_name: 'Jane',
        last_name: 'Doe',
        email: 'jane@example.com',
        phone_number: '0987654321',
        ownership_stake: 30,
      },
    ];

    const result = getBusinessOwnerPatchOperations(mockCurrentOwners, formOwners);

    expect(result).toEqual([
      {
        data: {
          'id.first_name': 'John',
          'id.last_name': 'Doe',
          'id.phone_number': '1111111111',
        },
        uuid: '1',
        op: 'update',
        ownershipStake: 60,
      },
      {
        data: {
          'id.email': 'jane@example.com',
          'id.first_name': 'Jane',
          'id.last_name': 'Doe',
        },
        uuid: '2',
        op: 'update',
        ownershipStake: 30,
      },
    ]);
  });

  it('should delete owners not present in form data', () => {
    const formOwners: BeneficialOwnerWithMetadata[] = [
      {
        _uuid: '1',
        first_name: 'John',
        last_name: 'Doe',
        ownership_stake: 100,
        email: 'owner1@example.com',
        phone_number: '1234567890',
      },
    ];

    const result = getBusinessOwnerPatchOperations(mockCurrentOwners, formOwners);
    expect(result).toEqual([
      {
        data: {
          'id.first_name': 'John',
          'id.last_name': 'Doe',
        },
        uuid: '1',
        op: 'update',
        ownershipStake: 100,
      },
      {
        uuid: '2',
        op: 'delete',
      },
    ]);
  });

  it('should add new owners', () => {
    const formOwners: BeneficialOwnerWithMetadata[] = [
      ...mockCurrentOwners.map(owner => ({
        _uuid: owner.uuid,
        first_name: (owner.decryptedData['id.first_name'] as string) || 'First',
        last_name: (owner.decryptedData['id.last_name'] as string) || 'Last',
        email: (owner.decryptedData['id.email'] as string) || '',
        phone_number: (owner.decryptedData['id.phone_number'] as string) || '',
        ownership_stake: owner.ownershipStake || 0,
      })),
      {
        _uuid: 'newuuid',
        first_name: 'New',
        last_name: 'Owner',
        email: 'newowner@example.com',
        phone_number: '5555555555',
        ownership_stake: 20,
      },
    ];

    const result = getBusinessOwnerPatchOperations(mockCurrentOwners, formOwners);

    expect(result).toEqual([
      {
        data: {
          'id.first_name': 'First',
          'id.last_name': 'Last',
        },
        uuid: '1',
        op: 'update',
        ownershipStake: 5,
      },
      {
        data: {
          'id.first_name': 'First',
          'id.last_name': 'Last',
        },
        uuid: '2',
        op: 'update',
        ownershipStake: 3,
      },
      {
        data: {
          'id.email': 'newowner@example.com',
          'id.first_name': 'New',
          'id.last_name': 'Owner',
          'id.phone_number': '5555555555',
        },
        uuid: 'newuuid',
        op: 'create',
        ownershipStake: 20,
      },
    ]);
  });

  it('should handle multiple operations in a single call', () => {
    const formOwners: BeneficialOwnerWithMetadata[] = [
      {
        _uuid: '1',
        ownership_stake: 40,
        email: 'owner1_updated@example.com',
        phone_number: '1234567890',
        first_name: 'First',
        last_name: 'Last',
      },
      {
        _uuid: 'newuuid',
        ownership_stake: 60,
        email: 'newowner@example.com',
        phone_number: '5555555555',
        first_name: 'New',
        last_name: 'Owner',
      },
    ];

    const result = getBusinessOwnerPatchOperations(mockCurrentOwners, formOwners);

    expect(result).toEqual([
      {
        data: {
          'id.email': 'owner1_updated@example.com',
          'id.first_name': 'First',
          'id.last_name': 'Last',
        },
        uuid: '1',
        op: 'update',
        ownershipStake: 40,
      },
      {
        data: {
          'id.email': 'newowner@example.com',
          'id.first_name': 'New',
          'id.last_name': 'Owner',
          'id.phone_number': '5555555555',
        },
        uuid: 'newuuid',
        op: 'create',
        ownershipStake: 60,
      },
      {
        uuid: '2',
        op: 'delete',
      },
    ]);
  });

  // TODO: remove skip once we implement _uuid
  it.skip('should return an empty when no changes are needed', () => {
    const formOwners: BeneficialOwnerWithMetadata[] = mockCurrentOwners.map(owner => ({
      _uuid: owner.uuid,
      first_name: (owner.decryptedData['id.first_name'] as string) || '',
      last_name: (owner.decryptedData['id.last_name'] as string) || '',
      email: (owner.decryptedData['id.email'] as string) || '',
      phone_number: (owner.decryptedData['id.phone_number'] as string) || '',
      ownership_stake: owner.ownershipStake || 0,
    }));

    const result = getBusinessOwnerPatchOperations(mockCurrentOwners, formOwners);

    expect(result).toEqual([]);
  });

  it('should update authed user', () => {
    const result = getBusinessOwnerPatchOperations(
      [
        {
          // linkId: 'bo_link_primary',
          uuid: '9a4157f3-b597-4065-a678-949cc55894c0',
          hasLinkedUser: true,
          isAuthedUser: true,
          isMutable: true,
          decryptedData: {
            'id.phone_number': '+15555550100',
            'id.email': 'sandbox@onefootprint.com',
          },
          populatedData: ['id.email', 'id.phone_number'],
          ownershipStake: 0,
        },
      ],
      [
        {
          email: 'sandbox@onefootprint.com',
          phone_number: '+15555550100',
          ownership_stake: 11,
          _uuid: '9a4157f3-b597-4065-a678-949cc55894c0',
          first_name: 'Mike',
          middle_name: 'M',
          last_name: 'Moe',
        },
      ],
    );

    expect(result).toEqual([
      {
        data: {
          'id.first_name': 'Mike',
          'id.last_name': 'Moe',
          'id.middle_name': 'M',
        },
        op: 'update',
        ownershipStake: 11,
        uuid: '9a4157f3-b597-4065-a678-949cc55894c0',
      },
    ]);
  });

  it('should create secondary owners', () => {
    const result = getBusinessOwnerPatchOperations(
      [
        {
          // link_id: 'bo_link_primary',
          uuid: 'f70e5bad-d9d8-4390-8813-ad0e0b8f5489',
          hasLinkedUser: true,
          isAuthedUser: true,
          isMutable: true,
          decryptedData: {
            'id.email': 'sandbox@onefootprint.com',
            'id.phone_number': '+15555550100',
          },
          populatedData: ['id.phone_number', 'id.email'],
          ownershipStake: 0,
        },
      ],
      [
        {
          first_name: 'Skip',
          last_name: 'KYB',
          email: 'sandbox@onefootprint.com',
          phone_number: '+15555550100',
          ownership_stake: 44,
          _uuid: 'f70e5bad-d9d8-4390-8813-ad0e0b8f5489',
          // id: 'c199f8a2-b2eb-4d50-9608-aaf4228d4d79',
        },
        {
          first_name: 'Secondary-a',
          last_name: 'Last-name-a',
          email: 'sandbox@onefootprint.com',
          phone_number: '+15555550100',
          ownership_stake: 10,
          _uuid: 'f70e5bad-d9d8-4390-8813-ad0e0b8f5490',
          // id: 'a15e75ab-0dfa-4ba6-b123-b0b8615a0d3a',
        },
        {
          first_name: 'Secondary-b',
          last_name: 'Last-name-b',
          email: 'sandbox@onefootprint.com',
          phone_number: '+15555550100',
          ownership_stake: 11,
          _uuid: 'f70e5bad-d9d8-4390-8813-ad0e0b8f5491',
          // id: '8554baa8-2a81-4674-a5d9-37ce4479caf6',
        },
      ],
    );

    expect(result).toEqual([
      {
        data: { 'id.first_name': 'Skip', 'id.last_name': 'KYB' },
        op: 'update',
        ownershipStake: 44,
        uuid: 'f70e5bad-d9d8-4390-8813-ad0e0b8f5489',
      },
      {
        data: {
          'id.email': 'sandbox@onefootprint.com',
          'id.first_name': 'Secondary-a',
          'id.last_name': 'Last-name-a',
          'id.phone_number': '+15555550100',
        },
        op: 'create',
        ownershipStake: 10,
        uuid: 'f70e5bad-d9d8-4390-8813-ad0e0b8f5490',
      },
      {
        data: {
          'id.email': 'sandbox@onefootprint.com',
          'id.first_name': 'Secondary-b',
          'id.last_name': 'Last-name-b',
          'id.phone_number': '+15555550100',
        },
        op: 'create',
        ownershipStake: 11,
        uuid: 'f70e5bad-d9d8-4390-8813-ad0e0b8f5491',
      },
    ]);
  });
});
