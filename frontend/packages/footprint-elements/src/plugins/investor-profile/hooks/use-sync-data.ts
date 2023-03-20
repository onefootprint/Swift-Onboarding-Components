import { InvestorProfileData, UserDataResponse } from '@onefootprint/types';

import { useInvestorProfileData } from '../../../hooks';

type SyncDataArgs = {
  authToken?: string;
  data: InvestorProfileData;
  speculative?: boolean;
  onSuccess?: (data: UserDataResponse) => void;
  onError?: (error: unknown) => void;
};

const useSyncData = () => {
  const investorProfileDataMutation = useInvestorProfileData();

  const syncData = ({
    authToken,
    data,
    speculative,
    onSuccess,
    onError,
  }: SyncDataArgs) => {
    if (!authToken) {
      console.error(
        'Found empty auth token while syncing investor profile data fields.',
      );
      return;
    }

    investorProfileDataMutation.mutate(
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

  return { mutation: investorProfileDataMutation, syncData };
};

export default useSyncData;
