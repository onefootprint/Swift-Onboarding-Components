import { IdDocType, UserDataAttribute } from '@onefootprint/types';
import useUser from 'src/pages/users/pages/user-details/hooks/use-user';
import useUserId from 'src/pages/users/pages/user-details/hooks/use-user-id';
import useUserVaultData from 'src/pages/users/pages/user-details/hooks/use-user-vault';
import { UserVaultData } from 'src/pages/users/users.types';

import useDecryptVaultData from './hooks/use-decrypt-vault-data';
import syncVaultWithDecryptedData from './utils/sync-vault-with-decrypted-data';

const useDecryptUser = () => {
  const userId = useUserId();
  const userQuery = useUser(userId);
  const userVaultDataQuery = useUserVaultData(userId);
  const decryptVaultData = useDecryptVaultData(userId);

  // TODO: Allow to decrypt investor profile data
  // https://linear.app/footprint/issue/FP-3135/allow-to-decrypt-investor-profile
  const decrypt = (
    data: {
      kycData: UserDataAttribute[];
      idDoc: IdDocType[];
      reason: string;
    },
    options?: {
      onSuccess?: () => void;
      onError?: (error: unknown) => void;
    },
  ) => {
    if (!userQuery.data || !userVaultDataQuery.data) {
      return;
    }
    const user = userQuery.data;
    const vaultData = userVaultDataQuery.data;

    const { reason } = data;
    // Don't decrypt fields that are already decrypted
    // Filter out fields that the user doesn't have
    const kycData = data.kycData.filter(
      attr =>
        user.identityDataAttributes.includes(attr) &&
        (vaultData.kycData[attr] === null ||
          vaultData.kycData[attr] === undefined),
    );

    const docTypes = user.identityDocumentInfo.map(info => info.type);
    const idDoc = data.idDoc.filter(
      attr =>
        docTypes.includes(attr) &&
        (vaultData.idDoc[attr] === null || vaultData.idDoc[attr] === undefined),
    );
    decryptVaultData(
      {
        kycData,
        idDoc,
        reason,
      },
      {
        onSuccess: (decryptedVaultData: UserVaultData) => {
          const newVaultData = syncVaultWithDecryptedData(
            decryptedVaultData,
            vaultData,
          );
          userVaultDataQuery.update(newVaultData);
          options?.onSuccess?.();
        },
        onError: error => {
          options?.onError?.(error);
        },
      },
    );
  };

  return decrypt;
};

export default useDecryptUser;
