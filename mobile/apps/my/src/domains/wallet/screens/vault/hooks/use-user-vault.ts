import request from '@onefootprint/request';
import { DecryptResponse, IdDI } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';

import AUTH_HEADER from '@/config/constants';
import useSession from '@/domains/wallet/hooks/use-session';

const getVaultData = async (authToken: string) => {
  const response = await request<DecryptResponse>({
    method: 'POST',
    url: '/hosted/user/vault/decrypt',
    data: {
      fields: [
        IdDI.addressLine1,
        IdDI.addressLine2,
        IdDI.city,
        IdDI.country,
        IdDI.dob,
        IdDI.email,
        IdDI.firstName,
        IdDI.lastName,
        IdDI.phoneNumber,
        IdDI.ssn4,
        IdDI.ssn9,
        IdDI.state,
        IdDI.zip,
      ],
    },
    headers: {
      [AUTH_HEADER]: authToken,
    },
  });
  return response.data;
};

const useUserVault = () => {
  const { data } = useSession();
  return useQuery(['user', 'vault'], () => getVaultData(data.authToken));
};

export default useUserVault;
