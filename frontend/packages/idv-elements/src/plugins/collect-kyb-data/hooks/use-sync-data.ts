import type { BusinessDataResponse, BusinessDIData } from '@onefootprint/types';

import { useBusinessData } from '../../../hooks';

type SyncDataArgs = {
  authToken?: string;
  data: BusinessDIData;
  speculative?: boolean;
  onSuccess?: (data: BusinessDataResponse) => void;
  onError?: (error: unknown) => void;
};

const useSyncData = () => {
  const businessDataMutation = useBusinessData();

  const syncData = ({
    authToken,
    data,
    speculative,
    onSuccess,
    onError,
  }: SyncDataArgs) => {
    if (!authToken) {
      console.error('Found empty auth token while syncing kyb data fields.');
      return;
    }

    businessDataMutation.mutate(
      {
        data,
        authToken,
        speculative,
      },
      {
        onSuccess,
        onError,
      },
    );
  };

  return { mutation: businessDataMutation, syncData };
};

export default useSyncData;
