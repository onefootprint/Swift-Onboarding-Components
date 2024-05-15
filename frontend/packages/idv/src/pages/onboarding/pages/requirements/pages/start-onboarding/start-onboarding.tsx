import { getErrorMessage } from '@onefootprint/request';
import { useEffectOnce } from 'usehooks-ts';

import Logger from '../../../../../../utils/logger';
import nid from '../../../../../../utils/neuro-id';
import useOnboardingRequirementsMachine from '../../hooks/use-onboarding-requirements-machine';
import useOnboarding from './hooks/use-onboarding';

const StartOnboarding = () => {
  const [state, send] = useOnboardingRequirementsMachine();
  const {
    idvContext: { authToken },
  } = state.context;
  const onboardingMutation = useOnboarding();

  useEffectOnce(() => {
    onboardingMutation.mutate(
      { authToken },
      {
        onSuccess: () => {
          nid.identify(authToken);
          send('initialized');
        },
        onError: (err: unknown) => {
          Logger.error(
            `Error while initiating onboarding. ${getErrorMessage(err)}`,
            { location: 'onboarding-check-requirements' },
          );
          send('error');
        },
      },
    );
  });

  // The parent machine will take care of the loading state
  return null;
};

export default StartOnboarding;
