import { requestWithoutCaseConverter } from '@onefootprint/request';
import type { HostedBusinessOwner } from '@onefootprint/request-types';
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
      linkId: '',
    },
    {
      uuid: '2',
      isMutable: true,
      hasLinkedUser: true,
      ownershipStake: 50,
      decryptedData: { 'id.first_name': 'Jane', 'id.last_name': 'Smith' },
      isAuthedUser: true,
      populatedData: [],
      linkId: '',
    },
    {
      uuid: '3',
      isMutable: true,
      hasLinkedUser: false,
      ownershipStake: 0,
      decryptedData: { 'id.first_name': 'Bob', 'id.last_name': 'Johnson' },
      isAuthedUser: false,
      populatedData: [],
      linkId: '',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle create and delete operation', async () => {
    const updateOrCreateOperations = [
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
    const deleteOperations = ['7'];

    (requestWithoutCaseConverter as jest.Mock).mockResolvedValue({ data: [] });

    await patchBusinessOwnersRequest({
      authToken: mockAuthToken,
      currentBos: mockCurrentBos,
      updateOrCreateOperations,
      deleteOperations,
    });

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
        {
          op: 'delete' as const,
          uuid: '7',
        },
      ],
    });
  });

  it('should handle update updateOrCreateOperations for non-linked users', async () => {
    const updateOrCreateOperations = [{ uuid: '1', data: { 'id.first_name': 'Johnny' }, ownershipStake: 60 }];

    (requestWithoutCaseConverter as jest.Mock).mockResolvedValue({ data: [] });

    await patchBusinessOwnersRequest({
      authToken: mockAuthToken,
      currentBos: mockCurrentBos,
      updateOrCreateOperations,
      deleteOperations: [],
    });

    expect(requestWithoutCaseConverter).toHaveBeenCalledWith({
      method: 'PATCH',
      headers: { 'X-Fp-Authorization': mockAuthToken },
      url: '/hosted/business/owners',
      data: [{ op: 'update' as const, uuid: '1', data: { 'id.first_name': 'Johnny' }, ownership_stake: 60 }],
    });
  });

  it('should update linked users when necessary', async () => {
    const updateOrCreateOperations = [
      {
        uuid: '2',
        data: { 'id.first_name': 'Janet' },
        ownershipStake: 55,
      },
    ];

    (requestWithoutCaseConverter as jest.Mock).mockResolvedValue({ data: [] });

    await patchBusinessOwnersRequest({
      authToken: mockAuthToken,
      currentBos: mockCurrentBos,
      updateOrCreateOperations,
      deleteOperations: [],
    });

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

  it('should handle mixed updateOrCreateOperations', async () => {
    const updateOrCreateOperations = [
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

    await patchBusinessOwnersRequest({
      authToken: mockAuthToken,
      currentBos: mockCurrentBos,
      updateOrCreateOperations,
      deleteOperations: [],
    });

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
