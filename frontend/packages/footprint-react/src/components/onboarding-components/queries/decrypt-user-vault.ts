import type { DecryptUserResponse } from '@onefootprint/types';
import type { FormValues } from '../../../types';
import request from '../utils/request';

const decryptUserVault = async ({ fields, authToken }: { fields: keyof FormValues; authToken: string }) => {
  const response = await request<DecryptUserResponse>({
    method: 'POST',
    url: '/hosted/user/vault/decrypt',
    data: { fields },
    headers: {
      'X-Fp-Authorization': authToken,
    },
  });

  return response;
};

export default decryptUserVault;
