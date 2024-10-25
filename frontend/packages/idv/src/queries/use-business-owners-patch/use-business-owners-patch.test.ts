import { requestWithoutCaseConverter } from '@onefootprint/request';
import type { HostedBusinessOwner } from '@onefootprint/services';
import { patchBusinessOwnersRequest } from './use-business-owners-patch';

// Mock the request functions
jest.mock('@onefootprint/request', () => ({
  __esModule: true,
  default: jest.fn(),
  requestWithoutCaseConverter: jest.fn(),
}));

describe('patchBusinessOwnersRequest', () => {
  const mockAuthToken = 'mock-auth-token';
  const mockCurrentBos: HostedBusinessOwner[] = [
    {
      uuid: '1',
      isMutable: true,
      hasLinkedUser: false,
      ownershipStake: 50,
      decryptedData: { 'id.first_name': 'John', 'id.last_name': 'Doe' },
      isAuthedUser: false,
      populatedData: [],
    },
    {
      uuid: '2',
      isMutable: true,
      hasLinkedUser: true,
      ownershipStake: 50,
      decryptedData: { 'id.first_name': 'Jane', 'id.last_name': 'Smith' },
      isAuthedUser: true,
      populatedData: [],
    },
    {
      uuid: '3',
      isMutable: true,
      hasLinkedUser: false,
      ownershipStake: 0,
      decryptedData: { 'id.first_name': 'Bob', 'id.last_name': 'Johnson' },
      isAuthedUser: false,
      populatedData: [],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle create operation', async () => {
    const operations = [
      {
        uuid: '4',
        data: {
          'id.first_name': 'New',
          'id.last_name': 'Owner',
          'id.email': 'newowner@example.com',
          'id.phone_number': '1234567890',
        },
        ownershipStake: 25,
      },
    ];

    (requestWithoutCaseConverter as jest.Mock).mockResolvedValue({ data: [] });

    await patchBusinessOwnersRequest({ authToken: mockAuthToken, currentBos: mockCurrentBos, operations });

    expect(requestWithoutCaseConverter).toHaveBeenCalledWith({
      method: 'PATCH',
      headers: { 'X-Fp-Authorization': mockAuthToken },
      url: '/hosted/business/owners',
      data: [
        {
          op: 'create' as const,
          uuid: '4',
          data: {
            'id.first_name': 'New',
            'id.last_name': 'Owner',
            'id.email': 'newowner@example.com',
            'id.phone_number': '1234567890',
          },
          ownership_stake: 25,
        },
      ],
    });
  });

  it('should handle update operations for non-linked users', async () => {
    const operations = [{ uuid: '1', data: { 'id.first_name': 'Johnny' }, ownershipStake: 60 }];

    (requestWithoutCaseConverter as jest.Mock).mockResolvedValue({ data: [] });

    await patchBusinessOwnersRequest({ authToken: mockAuthToken, currentBos: mockCurrentBos, operations });

    expect(requestWithoutCaseConverter).toHaveBeenCalledWith({
      method: 'PATCH',
      headers: { 'X-Fp-Authorization': mockAuthToken },
      url: '/hosted/business/owners',
      data: [{ op: 'update' as const, uuid: '1', data: { 'id.first_name': 'Johnny' }, ownership_stake: 60 }],
    });
  });

  it('should update linked users when necessary', async () => {
    const operations = [
      {
        uuid: '2',
        data: { 'id.first_name': 'Janet' },
        ownershipStake: 55,
      },
    ];

    (requestWithoutCaseConverter as jest.Mock).mockResolvedValue({ data: [] });

    await patchBusinessOwnersRequest({ authToken: mockAuthToken, currentBos: mockCurrentBos, operations });

    expect(requestWithoutCaseConverter).toHaveBeenCalledTimes(2);
    expect(requestWithoutCaseConverter).toHaveBeenNthCalledWith(1, {
      method: 'PATCH',
      headers: { 'X-Fp-Authorization': mockAuthToken },
      url: '/hosted/user/vault',
      data: { 'id.first_name': 'Janet' },
    });
    expect(requestWithoutCaseConverter).toHaveBeenNthCalledWith(2, {
      method: 'PATCH',
      headers: { 'X-Fp-Authorization': mockAuthToken },
      url: '/hosted/business/owners',
      data: [{ op: 'update' as const, uuid: '2', ownership_stake: 55 }],
    });
  });

  it('should handle mixed operations', async () => {
    const operations = [
      {
        uuid: '222',
        data: {
          'id.first_name': 'New',
          'id.last_name': 'Owner',
          'id.email': 'newowner@example.com',
          'id.phone_number': '1234567890',
        },
        ownershipStake: 20,
      },
      { uuid: '1', data: { 'id.first_name': 'Johnny' }, ownershipStake: 40 },
    ];

    (requestWithoutCaseConverter as jest.Mock).mockResolvedValue({ data: [] });

    await patchBusinessOwnersRequest({ authToken: mockAuthToken, currentBos: mockCurrentBos, operations });

    expect(requestWithoutCaseConverter).toHaveBeenCalledWith({
      method: 'PATCH',
      headers: { 'X-Fp-Authorization': mockAuthToken },
      url: '/hosted/business/owners',
      data: [
        {
          op: 'create' as const,
          uuid: '222',
          data: {
            'id.first_name': 'New',
            'id.last_name': 'Owner',
            'id.email': 'newowner@example.com',
            'id.phone_number': '1234567890',
          },
          ownership_stake: 20,
        },
        { op: 'update' as const, uuid: '1', data: { 'id.first_name': 'Johnny' }, ownership_stake: 40 },
      ],
    });
  });
});
