import { getErrorMessage } from '@onefootprint/request';
import type { OnboardingStatusResponse } from '@onefootprint/types';

import { useGetOnboardingStatus } from '../../../../../../hooks/api';
import Logger from '../../../../../../utils/logger';
import useOnboardingRequirementsMachine from '../../hooks/use-onboarding-requirements-machine';
import computeRequirementsToShow from './utils/compute-requirements-to-show';

const CheckRequirements = () => {
  const [state, send] = useOnboardingRequirementsMachine();
  const {
    startedDataCollection,
    idvContext: { authToken, isTransfer, componentsSdkContext },
    collectedKycData,
  } = state.context;

  useGetOnboardingStatus({
    authToken,
    options: {
      onSuccess: (response: OnboardingStatusResponse) => {
        Logger.info(`Onboarding requirements: ${JSON.stringify(response)}`);

        const context = {
          isTransfer: !!isTransfer,
          startedDataCollection,
          hasRunCollectedKycData: !!collectedKycData,
          isComponentsSdk: !!componentsSdkContext,
        };
        const payload = computeRequirementsToShow(context, response);

        send({
          type: 'onboardingRequirementsReceived',
          payload,
        });
      },
      onError: (err: unknown) => {
        Logger.error(
          `Error while checking requirements from onboarding status: ${getErrorMessage(
            err,
          )}`,
          'onboarding-check-requirements',
        );
        send('error');
      },
    },
  });

  // The parent machine will take care of the loading state
  return null;
};

export default CheckRequirements;
