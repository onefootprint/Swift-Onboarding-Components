import { getErrorMessage } from '@onefootprint/request';
import { useEffectOnce } from 'usehooks-ts';

import Logger from '../../../../../../utils/logger';
import { useOnboardingRequirementsMachine } from '../../components/machine-provider';
import useOnboardingProcess from '../../hooks/use-onboarding-process';

export type ProcessProps = {
  onDone: () => void;
};

const Process = ({ onDone }: ProcessProps) => {
  const [state, send] = useOnboardingRequirementsMachine();
  const {
    onboardingContext: { authToken, overallOutcome },
  } = state.context;
  const processMutation = useOnboardingProcess();

  useEffectOnce(() => {
    if (!authToken || processMutation.isLoading) {
      return;
    }
    processMutation.mutate(
      { authToken, fixtureResult: overallOutcome },
      {
        onSuccess: onDone,
        onError: (error: unknown) => {
          Logger.error(
            `Error while processing onboarding on authorize page. ${getErrorMessage(
              error,
            )}`,
            'onboarding-process',
          );
          send('error');
        },
      },
    );
  });

  // The parent machine will take care of the loading state
  return null;
};

export default Process;
