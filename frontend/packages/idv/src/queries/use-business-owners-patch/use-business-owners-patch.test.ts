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
      isAuthedUser: false,
      populatedData: [],
    },
    {
      uuid: '3',
      isMutable: false,
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

  it('should handle create and delete operations', async () => {
    const operations = [
      { op: 'delete' as const, uuid: '1' },
      {
        op: 'create' as const,
        uuid: '2',
        data: {
          'id.first_name': 'New',
          'id.last_name': 'Owner',
          'id.email': 'newowner@example.com',
          'id.phone_number': '1234567890',
        },
        ownership_stake: 25,
      },
    ];

    (requestWithoutCaseConverter as jest.Mock).mockResolvedValue({ data: [] });

    await patchBusinessOwnersRequest({ authToken: mockAuthToken, currentBos: mockCurrentBos, operations });

    expect(requestWithoutCaseConverter).toHaveBeenCalledWith({
      method: 'PATCH',
      headers: { 'X-Fp-Authorization': mockAuthToken },
      url: '/hosted/business/owners',
      data: operations,
    });
  });

  it('should handle update operations for non-linked users', async () => {
    const operations = [{ op: 'update' as const, uuid: '1', data: { 'id.first_name': 'Johnny' }, ownership_stake: 60 }];

    (requestWithoutCaseConverter as jest.Mock).mockResolvedValue({ data: [] });

    await patchBusinessOwnersRequest({ authToken: mockAuthToken, currentBos: mockCurrentBos, operations });

    expect(requestWithoutCaseConverter).toHaveBeenCalledWith({
      method: 'PATCH',
      headers: { 'X-Fp-Authorization': mockAuthToken },
      url: '/hosted/business/owners',
      data: operations,
    });
  });

  it('should update linked users when necessary', async () => {
    const operations = [
      {
        op: 'update' as const,
        uuid: '2',
        data: { 'id.first_name': 'Janet' },
        ownership_stake: 55,
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

  it('should not update immutable owners', async () => {
    const operations = [{ op: 'update' as const, uuid: '3', data: { 'id.first_name': 'Robert' }, ownership_stake: 10 }];

    (requestWithoutCaseConverter as jest.Mock).mockResolvedValue({ data: [] });

    await patchBusinessOwnersRequest({ authToken: mockAuthToken, currentBos: mockCurrentBos, operations });

    expect(requestWithoutCaseConverter).toHaveBeenCalledTimes(0);
  });

  it('should throw an error when trying to update multiple linked users', async () => {
    const operations = [
      { op: 'update' as const, uuid: '2', data: { 'id.first_name': 'Janet' }, ownership_stake: 55 },
      { op: 'update' as const, uuid: '4', data: { 'id.first_name': 'Mike' }, ownership_stake: 45 },
    ];

    const mockCurrentBosMultipleLinked: HostedBusinessOwner[] = [
      ...mockCurrentBos,
      {
        uuid: '4',
        isMutable: true,
        hasLinkedUser: true,
        ownershipStake: 0,
        decryptedData: { 'id.first_name': 'Michael', 'id.last_name': 'Brown' },
        isAuthedUser: false,
        populatedData: [],
      },
    ];

    await expect(
      patchBusinessOwnersRequest({ authToken: mockAuthToken, currentBos: mockCurrentBosMultipleLinked, operations }),
    ).rejects.toThrow('Cannot update multiple linked users at once');
  });

  it('should handle mixed operations', async () => {
    const operations = [
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
      { op: 'delete' as const, uuid: '3' },
      { op: 'update' as const, uuid: '1', data: { 'id.first_name': 'Johnny' }, ownership_stake: 40 },
    ];

    (requestWithoutCaseConverter as jest.Mock).mockResolvedValue({ data: [] });

    await patchBusinessOwnersRequest({ authToken: mockAuthToken, currentBos: mockCurrentBos, operations });

    expect(requestWithoutCaseConverter).toHaveBeenCalledWith({
      method: 'PATCH',
      headers: { 'X-Fp-Authorization': mockAuthToken },
      url: '/hosted/business/owners',
      data: operations,
    });
  });
});
