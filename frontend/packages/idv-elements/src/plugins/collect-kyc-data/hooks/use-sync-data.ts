import {
  UserData,
  UserDataAttribute,
  UserDataResponse,
} from '@onefootprint/types';

import { useUserData } from '../../../hooks';

type SyncDataArgs = {
  authToken?: string;
  data: UserData;
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

    const requestData = { ...data };
    // DOB is accepted by the backend in a different format
    const dobData = data[UserDataAttribute.dob];
    if (dobData) {
      const [month, day, year] = dobData.split('/');
      requestData[UserDataAttribute.dob] = `${year}-${month}-${day}`;
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
