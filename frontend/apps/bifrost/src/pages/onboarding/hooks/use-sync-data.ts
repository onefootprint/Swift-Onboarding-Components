import { useFootprintJs } from 'footprint-provider';
import useOnboardingComplete from 'src/hooks/use-onboarding-complete';
import { hasMissingAttributes } from 'src/utils/state-machine/onboarding/utils/missing-attributes';
import { UserData } from 'src/utils/state-machine/types';

import useOnboardingMachine from './use-onboarding-machine';
import useUserData from './use-user-data';

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
            footprint.onCompleted(footprintUserId);
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

  return (data: UserData) => {
    const { authToken } = state.context;
    if (!authToken) {
      return;
    }
    userDataMutation.mutate(
      {
        data: {
          ...state.context.data,
          ...data,
        },
        authToken,
      },
      {
        onSuccess: handleSyncDataSucceeded,
      },
    );
  };
};

export default useSyncData;
