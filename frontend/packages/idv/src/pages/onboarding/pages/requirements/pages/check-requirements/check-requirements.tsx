import { getErrorMessage } from '@onefootprint/request';
import type { OnboardingStatusResponse } from '@onefootprint/types';

import { useGetOnboardingStatus } from '../../../../../../hooks/api';
import { Logger, getLogger } from '../../../../../../utils/logger';
import useOnboardingRequirementsMachine from '../../hooks/use-onboarding-requirements-machine';
import computeRequirementsToShow from './utils/compute-requirements-to-show';

const { logInfo } = getLogger({ location: 'onboarding-check-requirements' });

const logOnboardingStatusResponse = (response: OnboardingStatusResponse) => {
  logInfo(
    `requirements status: ${response.allRequirements
      .map(req => {
        if (req.kind === 'collect_data') {
          return `${req.kind}:${req.isMet ? 1 : 0} missing:[${req.missingAttributes.join(',')}] populated:[${req.populatedAttributes.join(',')}]`;
        }

        if (req.kind === 'collect_document' && req.config.kind === 'identity') {
          return `${req.kind}:${req.isMet ? 1 : 0} uploadMode:${req.uploadMode} collectConsent:${req.config.shouldCollectConsent ? 1 : 0} collectSelfie:${req.config.shouldCollectSelfie ? 1 : 0}`;
        }

        return `${req.kind}:${req.isMet ? 1 : 0}`;
      })
      .join(',')}`,
  );
};

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
        logOnboardingStatusResponse(response);

        const context = {
          isTransfer: !!isTransfer,
          startedDataCollection,
          hasRunCollectedKycData: !!collectedKycData,
          isComponentsSdk: !!componentsSdkContext,
        };
        const payload = computeRequirementsToShow(context, response);

        send({ type: 'onboardingRequirementsReceived', payload });
      },
      onError: (err: unknown) => {
        Logger.error(`Error while checking requirements from onboarding status: ${getErrorMessage(err)}`, {
          location: 'onboarding-check-requirements',
        });
        send('error');
      },
    },
  });

  // The parent machine will take care of the loading state
  return null;
};

export default CheckRequirements;
