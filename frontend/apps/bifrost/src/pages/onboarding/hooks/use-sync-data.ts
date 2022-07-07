import { useFootprintJs } from 'footprint-provider';
import useOnboardingComplete from 'src/hooks/use-onboarding-complete';
import useUserData, { UserDataObj } from 'src/hooks/use-user-data';
import { hasMissingAttributes } from 'src/utils/state-machine/onboarding/utils/missing-attributes';
import { UserData, UserDataAttribute } from 'src/utils/state-machine/types';

import useOnboardingMachine from './use-onboarding-machine';

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
  const [state] = useOnboardingMachine();
  const userDataMutation = useUserData();
  const onboardingCompleteMutation = useOnboardingComplete();
  const footprint = useFootprintJs();

  const completeOnboarding = () => {
    const { authToken, tenant } = state.context;
    if (authToken) {
      onboardingCompleteMutation.mutate(
        { authToken, tenantPk: tenant.pk },
        {
          onSuccess: ({ footprintUserId }) => {
            footprint.onComplete(footprintUserId);
          },
        },
      );
    }
  };

  const handleSyncDataSucceeded = () => {
    const { missingAttributes, data } = state.context;
    if (!hasMissingAttributes(missingAttributes, data)) {
      completeOnboarding();
    }
  };

  return (userData: UserData) => {
    const { authToken } = state.context;
    if (!authToken) {
      return;
    }

    const data: UserDataObj = {
      email: userData[UserDataAttribute.email],
      ssn: userData[UserDataAttribute.ssn],
    };

    if (dataHasName(userData)) {
      data.name = {
        firstName: userData[UserDataAttribute.firstName],
        lastName: userData[UserDataAttribute.lastName],
      };
    }

    if (dataHasAddress(userData)) {
      data.address = {
        city: userData[UserDataAttribute.city],
        state: userData[UserDataAttribute.state],
        country: userData[UserDataAttribute.country],
        zip: userData[UserDataAttribute.zip],
      };
      if (dataHasStreetAddress(userData)) {
        data.address.address = {
          streetAddress: userData[UserDataAttribute.streetAddress],
          streetAddress2: userData[UserDataAttribute.streetAddress2],
        };
      }
    }

    const dobData = userData[UserDataAttribute.dob];
    if (dobData) {
      const [month, day, year] = dobData
        .split('/')
        .map((dobStr: string) => parseInt(dobStr, 10));
      data.dob = {
        day,
        month,
        year,
      };
    }

    userDataMutation.mutate(
      {
        data,
        authToken,
      },
      {
        onSuccess: handleSyncDataSucceeded,
      },
    );
  };
};

export default useSyncData;
