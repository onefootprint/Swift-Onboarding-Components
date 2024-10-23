import request from '@onefootprint/request';
import type { DataIdentifier } from '@onefootprint/types';
import { AUTH_HEADER } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import type { VaultData } from '../../client/types.gen';

export type HostedBusinessOwner = {
  uuid: string;
  decryptedData: Partial<VaultData>;
  hasLinkedUser: boolean;
  isAuthedUser: boolean;
  isMutable: boolean;
  ownershipStake?: number;
  populatedData: `${DataIdentifier}`[];
};
type Request = { authToken: string };
type Response = HostedBusinessOwner[];

const getBusinessOwnersRequest = async ({ authToken }: Request) => {
  const { data } = await request<Response>({
    method: 'GET',
    url: '/hosted/business/owners',
    headers: { [AUTH_HEADER]: authToken },
  });

  return data;
};

const useBusinessOwners = (payload: Request) => {
  const query = useQuery({
    queryKey: ['business-owners', payload],
    queryFn: () => getBusinessOwnersRequest(payload),
    enabled: !!payload.authToken,
  });

  return query;
};

export default useBusinessOwners;
