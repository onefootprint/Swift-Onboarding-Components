import { getErrorMessage } from '@onefootprint/request';
import { useEffectOnce } from 'usehooks-ts';

import { getLogger, trackAction } from '@/idv/utils';
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
  } = state.context;
  const processMutation = useOnboardingProcess();

  useEffectOnce(() => {
    if (!authToken || processMutation.isPending) {
      return;
    }
    processMutation.mutate(
      { authToken },
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
