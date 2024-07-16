import request from '@onefootprint/request';
import type { DecryptResponse } from '@onefootprint/types';
import { ChallengeKind, IdDI } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';

import type { AuthHeaders } from '@/domains/wallet/hooks/use-session';
import useSession from '@/domains/wallet/hooks/use-session';

const getVaultData = async (authHeaders: AuthHeaders, fields: IdDI[], isApple: boolean) => {
  if (isApple) {
    return {
      [IdDI.city]: 'San Francisco',
      [IdDI.state]: 'CA',
      [IdDI.country]: 'US',
      [IdDI.zip]: '94103',
      [IdDI.addressLine1]: '14 Linda street',
      [IdDI.addressLine2]: 'Apt 2',
      [IdDI.firstName]: 'Jane',
      [IdDI.lastName]: 'Appleseed',
      [IdDI.phoneNumber]: '+1 415-555-5555',
      [IdDI.dob]: '1990-01-01',
      [IdDI.email]: 'jane@apple.com',
      [IdDI.ssn4]: '1234',
      [IdDI.ssn9]: '123456789',
    };
  }

  const response = await request<DecryptResponse>({
    method: 'POST',
    url: '/hosted/user/vault/decrypt',
    data: { fields },
    headers: authHeaders,
  });
  return response.data;
};

const basicProfile = [IdDI.city, IdDI.state, IdDI.country, IdDI.zip, IdDI.firstName, IdDI.lastName];

const completeProfile = [
  ...basicProfile,
  IdDI.addressLine1,
  IdDI.addressLine2,
  IdDI.dob,
  IdDI.email,
  IdDI.phoneNumber,
  IdDI.ssn4,
  IdDI.ssn9,
  IdDI.state,
];

const useUserVault = () => {
  const { data, authHeaders } = useSession();
  const isSms = data?.challengeKind === ChallengeKind.sms;
  const fields = isSms ? basicProfile : completeProfile;
  return useQuery(['user', 'vault'], () => getVaultData(authHeaders, fields, data.isApple));
};

export default useUserVault;
