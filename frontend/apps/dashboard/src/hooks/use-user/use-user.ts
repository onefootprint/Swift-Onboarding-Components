import { RequestError } from '@onefootprint/request';
import { IdDocDataAttribute, UserDataAttribute } from '@onefootprint/types';
import useUserStore from 'src/hooks/use-user-store';

import useGetPinnedAnnotations from './hooks/annotations/use-get-pinned-annotations';
import useGetLiveness from './hooks/liveness/use-get-liveness';
import useGetMetadata from './hooks/metadata/use-get-metadata';
import useGetRiskSignals from './hooks/risk-signals/use-get-risk-signals';
import useGetTimeline from './hooks/timeline/use-get-timeline';
import useDecryptKycData from './hooks/vault-data/use-decrypt-kyc-data';
import { UserErrors, UserLoadingStates } from './types';

type DecryptCallbackArgs = {
  data: {
    kycData: UserDataAttribute[];
    idDoc: IdDocDataAttribute[];
    reason: string;
  };
  options: {
    onSuccess: () => void;
    onError: (error: RequestError) => void;
  };
};

const useUser = (userId: string) => {
  const usersStore = useUserStore();
  const decryptKycData = useDecryptKycData();
  const getMetadata = useGetMetadata(userId);
  const getTimeline = useGetTimeline(userId);
  const getPinnedAnnotations = useGetPinnedAnnotations(userId);
  const getRiskSignals = useGetRiskSignals(userId);
  const getLiveness = useGetLiveness(userId);

  const decrypt = (args: DecryptCallbackArgs) => {
    const {
      data: { kycData, reason },
    } = args;
    decryptKycData.mutate({ userId, fields: kycData, reason });
    return decryptKycData;
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
    vaultData: decryptKycData.isLoading,
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
    vaultData: decryptKycData.error,
  };

  return {
    user: usersStore.get(userId) || {},
    decrypt,
    refresh,
    loadingStates,
    errors,
  };
};

export default useUser;
