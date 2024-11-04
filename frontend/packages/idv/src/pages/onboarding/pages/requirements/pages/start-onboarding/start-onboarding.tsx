import { getErrorMessage } from '@onefootprint/request';
import { useEffectOnce } from 'usehooks-ts';

import { Logger } from '@/idv/utils';
import nid from '@/idv/utils/neuro-id';
import useOnboardingRequirementsMachine from '../../hooks/use-onboarding-requirements-machine';
import useOnboarding from './hooks/use-onboarding';

const StartOnboarding = () => {
  const [state, send] = useOnboardingRequirementsMachine();
  const {
    idvContext: { authToken },
    onboardingContext: { config, overallOutcome },
  } = state.context;
  const onboardingMutation = useOnboarding();

  useEffectOnce(() => {
    onboardingMutation.mutate(
      { authToken, fixtureResult: overallOutcome, playbookKey: config.key },
      {
        onSuccess: () => {
          nid.identify(authToken);
          send('initialized');
        },
        onError: (error: unknown) => {
          Logger.error(`Error while initiating onboarding. ${getErrorMessage(error)}`, {
            location: 'onboarding-check-requirements',
          });
          send('error', { error });
        },
      },
    );
  });

  // The parent machine will take care of the loading state
  return null;
};

export default StartOnboarding;
