import {
  UserData,
  UserDataAttribute,
  UserDataResponse,
} from '@onefootprint/types';

import { useUserData } from '../../../hooks';

const useSyncData = () => {
  const mutation = useUserData();

  const syncData = (
    authToken: string,
    data: UserData,
    options: {
      speculative?: boolean;
      onSuccess?: (data: UserDataResponse) => void;
      onError?: (error: unknown) => void;
    } = {},
  ) => {
    if (!authToken) {
      return;
    }

    const requestData = { ...data };
    // DOB is accepted by the backend in a different format
    const dobData = data[UserDataAttribute.dob];
    if (dobData) {
      const [month, day, year] = dobData.split('/');
      requestData[UserDataAttribute.dob] = `${year}-${month}-${day}`;
    }

    mutation.mutate(
      {
        data: requestData,
        authToken,
        speculative: options.speculative,
      },
      {
        onSuccess: options.onSuccess,
        onError: options?.onError,
      },
    );
  };

  return { mutation, syncData };
};

export default useSyncData;
