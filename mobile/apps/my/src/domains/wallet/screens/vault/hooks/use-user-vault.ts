import request from '@onefootprint/request';
import { DecryptResponse, IdDI } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';

const getVaultData = async () => {
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
  });
  return response.data;
};

const useUserVault = () => {
  return useQuery(['user', 'vault'], () => getVaultData());
};

export default useUserVault;
