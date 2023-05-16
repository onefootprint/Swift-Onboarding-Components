import request from '@onefootprint/request';
import { ChallengeKind, DecryptResponse, IdDI } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';

import useSession, { AuthHeaders } from '@/domains/wallet/hooks/use-session';

const getVaultData = async (authHeaders: AuthHeaders, fields: IdDI[]) => {
  const response = await request<DecryptResponse>({
    method: 'POST',
    url: '/hosted/user/vault/decrypt',
    data: { fields },
    headers: authHeaders,
  });
  return response.data;
};

const basicProfile = [
  IdDI.city,
  IdDI.state,
  IdDI.country,
  IdDI.zip,
  IdDI.firstName,
  IdDI.lastName,
];

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
  return useQuery(['user', 'vault'], () => getVaultData(authHeaders, fields));
};

export default useUserVault;
