import { RequestError } from '@onefootprint/request';
import {
  UserData,
  UserDataAttribute,
  UserDataObj,
  UserDataResponse,
} from '@onefootprint/types';

import { useUserData } from '../../../hooks';

const dataHasName = (data: UserData) =>
  data[UserDataAttribute.firstName] || data[UserDataAttribute.lastName];

const dataHasAddress = (data: UserData) =>
  data[UserDataAttribute.addressLine1] &&
  data[UserDataAttribute.city] &&
  data[UserDataAttribute.state] &&
  data[UserDataAttribute.country] &&
  data[UserDataAttribute.zip];

const dataHasZipCountry = (data: UserData) =>
  data[UserDataAttribute.country] && data[UserDataAttribute.zip];

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

    // Only one of ssn9 and ssn4 can ever be included in the request
    const requestData: UserDataObj = {};

    if (data[UserDataAttribute.ssn9]) {
      requestData.ssn9 = data[UserDataAttribute.ssn9];
    } else if (data[UserDataAttribute.ssn4]) {
      requestData.ssn4 = data[UserDataAttribute.ssn4];
    }

    if (dataHasName(data)) {
      requestData.name = {
        firstName: data[UserDataAttribute.firstName],
        lastName: data[UserDataAttribute.lastName],
      };
    }

    if (dataHasAddress(data)) {
      requestData.address = {
        line1: data[UserDataAttribute.addressLine1],
        line2: data[UserDataAttribute.addressLine2],
        city: data[UserDataAttribute.city],
        state: data[UserDataAttribute.state],
        country: data[UserDataAttribute.country],
        zip: data[UserDataAttribute.zip],
      };
    } else if (dataHasZipCountry(data)) {
      requestData.zip_address = {
        country: data[UserDataAttribute.country],
        zip: data[UserDataAttribute.zip],
      };
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
