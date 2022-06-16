import useBifrostMachine from 'src/hooks/use-bifrost-machine';
import { hasMissingAttributes } from 'src/utils/state-machine/onboarding/utils/missing-attributes';
import { UserData } from 'src/utils/state-machine/types';

import useOnboardingComplete from './use-onboarding-complete';
import useUserData from './use-user-data';

// Calls use-user-data to send new data to backend
// Calls use-onboarding-complete if all of the missingAttributes are now filled
const useSyncData = () => {
  const [state] = useBifrostMachine();
  const userDataMutation = useUserData();
  const onboardingCompleteMutation = useOnboardingComplete();

  const completeOnboarding = () => {
    const { authToken } = state.context;
    const { missingAttributes, data } = state.context.onboarding;
    if (hasMissingAttributes(missingAttributes, data) || !authToken) {
      return;
    }
    onboardingCompleteMutation.mutate({ authToken });
  };

  return (data: UserData) => {
    const { authToken } = state.context;
    if (!authToken) {
      return;
    }
    userDataMutation.mutate(
      {
        data: {
          ...state.context.onboarding.data,
          ...data,
        },
        authToken,
      },
      { onSuccess: completeOnboarding },
    );
  };
};

export default useSyncData;
