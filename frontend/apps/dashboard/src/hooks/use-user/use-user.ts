import { IdDocType, UserDataAttribute } from '@onefootprint/types';
import useUserStore from 'src/hooks/use-user-store';

import useGetPinnedAnnotations from './hooks/annotations/use-get-pinned-annotations';
import useGetLiveness from './hooks/liveness/use-get-liveness';
import useGetMetadata from './hooks/metadata/use-get-metadata';
import useGetRiskSignals from './hooks/risk-signals/use-get-risk-signals';
import useGetTimeline from './hooks/timeline/use-get-timeline';
import useDecryptVaultData from './hooks/vault-data/use-decrypt-vault-data';
import { UserErrors, UserLoadingStates, UserVaultData } from './types';
import syncVaultWithDecryptedData from './utils/sync-vault-with-decrypted-data/sync-vault-with-decrypted-data';

const useUser = (userId: string) => {
  const userStore = useUserStore();
  const user = userStore.get(userId) || {};

  const decryptVaultData = useDecryptVaultData(userId);
  const getMetadata = useGetMetadata(userId);
  const getTimeline = useGetTimeline(userId);
  const getPinnedAnnotations = useGetPinnedAnnotations(userId);
  const getRiskSignals = useGetRiskSignals(userId);
  const getLiveness = useGetLiveness(userId);

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
    const { reason } = data;
    // Don't decrypt fields that are already decrypted
    // Filter out fields that the user doesn't have
    const kycData = data.kycData.filter(
      attr =>
        user.metadata?.identityDataAttributes.includes(attr) &&
        (user.vaultData?.kycData[attr] === null ||
          user.vaultData?.kycData[attr] === undefined),
    );
    const idDoc = data.idDoc.filter(
      attr =>
        user.metadata?.identityDocumentTypes.includes(attr) &&
        (user.vaultData?.idDoc[attr] === null ||
          user.vaultData?.idDoc[attr] === undefined),
    );

    decryptVaultData(
      {
        kycData,
        idDoc,
        reason,
      },
      {
        onSuccess: (decryptedVaultData: UserVaultData) => {
          const vaultData = syncVaultWithDecryptedData(
            decryptedVaultData,
            user.vaultData,
          );
          userStore.merge({ userId, data: { vaultData } });
          options?.onSuccess?.();
        },
        onError: error => {
          options?.onError?.(error);
        },
      },
    );
  };

  const refresh = () => {
    getMetadata.refetch();
    getTimeline.refetch();
    getPinnedAnnotations.refetch();
    getRiskSignals.refetch();
    getLiveness.refetch();
  };

  const loadingStates: UserLoadingStates = {
    metadata: getMetadata.isLoading,
    timeline: getTimeline.isLoading,
    annotations: getPinnedAnnotations.isLoading,
    riskSignals: getRiskSignals.isLoading,
    liveness: getLiveness.isLoading,
  };

  const errors: UserErrors = {
    metadata: getMetadata.error,
    timeline: getTimeline.error,
    annotations: getPinnedAnnotations.error,
    riskSignals: getRiskSignals.error,
    liveness: getLiveness.error,
  };

  return {
    user,
    decrypt,
    refresh,
    loadingStates,
    errors,
  };
};

export default useUser;
