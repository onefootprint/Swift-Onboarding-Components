import { RequestError } from 'request/src';
import useUserData, { UserDataObj } from 'src/hooks/use-user-data';
import { UserData, UserDataAttribute } from 'src/utils/state-machine/types';

import { UserDataResponse } from './use-user-data/use-user-data';

const dataHasName = (data: UserData) =>
  data[UserDataAttribute.firstName] || data[UserDataAttribute.lastName];

const dataHasStreetAddress = (data: UserData) =>
  data[UserDataAttribute.streetAddress] ||
  data[UserDataAttribute.streetAddress2];

const dataHasAddress = (data: UserData) =>
  dataHasStreetAddress(data) ||
  data[UserDataAttribute.city] ||
  data[UserDataAttribute.state] ||
  data[UserDataAttribute.country] ||
  data[UserDataAttribute.zip];

const useSyncData = () => {
  const mutation = useUserData();

  const syncData = (
    authToken: string,
    data: UserData,
    options: {
      speculative?: boolean;
      onSuccess?: (data: UserDataResponse) => void;
      onError?: (error: RequestError) => void;
    } = {},
  ) => {
    if (!authToken) {
      return;
    }

    // Don't include the email in this request, since it would
    // cause a 400 response. We only send the email when we
    // need to trigger a verification email.
    const requestData: UserDataObj = {
      ssn: data[UserDataAttribute.ssn],
    };

    if (dataHasName(data)) {
      requestData.name = {
        firstName: data[UserDataAttribute.firstName],
        lastName: data[UserDataAttribute.lastName],
      };
    }

    if (dataHasAddress(data)) {
      requestData.address = {
        city: data[UserDataAttribute.city],
        state: data[UserDataAttribute.state],
        country: data[UserDataAttribute.country],
        zip: data[UserDataAttribute.zip],
      };
      if (dataHasStreetAddress(data)) {
        requestData.address.address = {
          streetAddress: data[UserDataAttribute.streetAddress],
          streetAddress2: data[UserDataAttribute.streetAddress2],
        };
      }
    }

    const dobData = data[UserDataAttribute.dob];
    if (dobData) {
      const [month, day, year] = dobData
        .split('/')
        .map((dobStr: string) => parseInt(dobStr, 10));
      requestData.dob = {
        day,
        month,
        year,
      };
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
