import request from '@onefootprint/request';
import type { GetSharingResponse } from '@onefootprint/types';
import { CollectedKycDataOption } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';

import type { AuthHeaders } from '@/domains/wallet/hooks/use-session';
import useSession from '@/domains/wallet/hooks/use-session';

const getSharing = async (authHeaders: AuthHeaders, isApple: boolean) => {
  if (isApple) {
    return [
      {
        orgName: 'Acme Bank',
        logoUrl: 'https://i.imgur.com/8TjdZ4I.png',
        canAccessData: [
          CollectedKycDataOption.dob,
          CollectedKycDataOption.email,
          CollectedKycDataOption.fullAddress,
          CollectedKycDataOption.name,
          CollectedKycDataOption.phoneNumber,
          CollectedKycDataOption.ssn4,
          CollectedKycDataOption.ssn9,
        ],
      },
    ];
  }
  const response = await request<GetSharingResponse>({
    method: 'GET',
    url: '/hosted/user/authorized_orgs',
    headers: authHeaders,
  });
  return response.data;
};

const useSharing = () => {
  const { authHeaders, data } = useSession();
  return useQuery(['user', 'sharing'], () => getSharing(authHeaders, data.isApple));
};

export default useSharing;
