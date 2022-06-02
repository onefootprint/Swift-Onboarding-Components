import useBifrostMachine from 'src/hooks/bifrost-machine';

import { UserData } from '../../../bifrost-machine/types';
import useOnboardingComplete from './use-onboarding-complete';
import useUserData from './use-user-data';

// Calls use-user-data to send new data to backend
// Calls use-onboarding-complete if all of the missingAttributes are now filled
const useSyncData = () => {
  const [state] = useBifrostMachine();
  const userDataMutation = useUserData();
  const onboardingCompleteMutation = useOnboardingComplete();

  const hasMissingAttributes = () => {
    const { missingAttributes } = state.context.onboarding;
    return missingAttributes.length > 0;
  };

  const getAuthToken = () => state.context.authToken;

  const completeOnboarding = () => {
    const authToken = getAuthToken();
    if (!hasMissingAttributes() || !authToken) {
      return;
    }
    onboardingCompleteMutation.mutate({ authToken });
  };

  return (data: UserData) => {
    const authToken = getAuthToken();
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
