import { IdDI, IdDIData, UserDataResponse } from '@onefootprint/types';

import useUserData from '../../../hooks/api/hosted/user/vault/use-user-data';
import { KycData } from '../utils/data-types';

type SyncDataArgs = {
  authToken?: string;
  data: KycData;
  speculative?: boolean;
  onSuccess?: (data: UserDataResponse) => void;
  onError?: (error: unknown) => void;
};

const useSyncData = () => {
  const userDataMutation = useUserData();

  const syncData = ({
    authToken,
    data,
    speculative,
    onSuccess,
    onError,
  }: SyncDataArgs) => {
    if (!authToken) {
      console.error('Found empty auth token while syncing kyc data fields.');
      return;
    }

    const keyValuePairs: [IdDI, string][] = Object.entries(data).map(
      ([key, value]) => [key as IdDI, value.value],
    );
    const requestData: IdDIData = Object.fromEntries(keyValuePairs);
    // DOB is accepted by the backend in a different format
    const dobData = requestData[IdDI.dob];
    if (dobData) {
      const [month, day, year] = dobData.split('/');
      requestData[IdDI.dob] = `${year}-${month}-${day}`;
    }

    userDataMutation.mutate(
      {
        data: requestData,
        authToken,
        speculative,
      },
      {
        onSuccess,
        onError,
      },
    );
  };

  return { mutation: userDataMutation, syncData };
};

export default useSyncData;
