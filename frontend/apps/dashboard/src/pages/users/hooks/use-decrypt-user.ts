import { RequestError } from '@onefootprint/request';
import { DecryptUserResponse, UserDataAttribute } from '@onefootprint/types';

import { IdDocDataAttribute } from '../types/vault-data.types';
import useUserData from './use-user-data';
import useUserVaultDecrypt from './use-user-vault-decrypt';

const useDecryptUser = () => {
  const { userVaults: decryptedUsers, updateUserVault } = useUserData();
  const userVaultDecryptMutation = useUserVaultDecrypt();
  const decryptUser = (
    payload: {
      userId: string;
      kyc: UserDataAttribute[];
      idDoc: IdDocDataAttribute[];
      reason: string;
    },
    options: {
      onSuccess?: (data: DecryptUserResponse) => void;
      onError?: (error: RequestError) => void;
    } = {},
  ) => {
    const { userId, kyc, reason } = payload;
    userVaultDecryptMutation.mutate(
      {
        footprintUserId: userId,
        fields: kyc,
        reason,
      },
      {
        onSuccess: (data: DecryptUserResponse) => {
          updateUserVault(userId, { kycData: data });
          options.onSuccess?.(data);
        },
        onError: options.onError,
      },
    );
    return userVaultDecryptMutation;
  };

  return {
    decryptedUsers,
    decryptUser,
  };
};

export default useDecryptUser;
