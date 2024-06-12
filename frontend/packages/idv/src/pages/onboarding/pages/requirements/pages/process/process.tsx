import { getErrorMessage } from '@onefootprint/request';
import { useEffectOnce } from 'usehooks-ts';

import { getLogger, trackAction } from '../../../../../../utils/logger';
import { useOnboardingRequirementsMachine } from '../../components/machine-provider';
import useOnboardingProcess from '../../hooks/use-onboarding-process';

export type ProcessProps = {
  onDone: () => void;
};

const { logError } = getLogger({ location: 'onboarding-process' });

const Process = ({ onDone }: ProcessProps) => {
  const [state, send] = useOnboardingRequirementsMachine();
  const {
    idvContext: { authToken },
    onboardingContext: { overallOutcome },
  } = state.context;
  const processMutation = useOnboardingProcess();

  useEffectOnce(() => {
    if (!authToken || processMutation.isLoading) {
      return;
    }
    processMutation.mutate(
      { authToken, fixtureResult: overallOutcome },
      {
        onSuccess: () => {
          trackAction('onboarding-process:completed');
          onDone();
        },
        onError: (error: unknown) => {
          logError(`Error while processing onboarding on authorize page. ${getErrorMessage(error)}`, error);
          send('error');
        },
      },
    );
  });

  // The parent machine will take care of the loading state
  return null;
};

export default Process;
