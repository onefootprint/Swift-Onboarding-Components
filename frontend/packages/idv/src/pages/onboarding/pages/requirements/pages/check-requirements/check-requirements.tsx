import { getErrorMessage } from '@onefootprint/request';
import type { OnboardingStatusResponse } from '@onefootprint/types';
import { useEffect } from 'react';

import { useGetOnboardingStatus } from '../../../../../../queries';
import { getLogger, trackAction } from '../../../../../../utils/logger';
import useOnboardingRequirementsMachine from '../../hooks/use-onboarding-requirements-machine';
import filterRequirementsToShow from './utils/filter-requirements-to-show';

const { logInfo, logError } = getLogger({ location: 'onboarding-check-requirements' });

const logOnboardingStatusResponse = (response: OnboardingStatusResponse) => {
  logInfo(
    `Requirements status: ${response.allRequirements
      .map(req => {
        if (req.kind === 'collect_data') {
          return `${req.kind}:${req.isMet ? 'is met' : 'is not met'} missing:[${req.missingAttributes.join(',')}] populated:[${req.populatedAttributes.join(',')}]`;
        }

        if (req.kind === 'collect_document' && req.config.kind === 'identity') {
          return `${req.kind}:${req.isMet ? 'is met' : 'is not met'} uploadSettings:${req.uploadSettings} collectConsent:${req.config.shouldCollectConsent ? 'is met' : 'is not met'} collectSelfie:${req.config.shouldCollectSelfie ? 'is met' : 'is not met'}`;
        }

        return `${req.kind}:${req.isMet ? 'is met' : 'is not met'}`;
      })
      .join(',')}`,
  );
};

const CheckRequirements = () => {
  const [state, send] = useOnboardingRequirementsMachine();
  const {
    idvContext: { authToken, isTransfer, componentsSdkContext },
    isInvestorProfileCollected,
    isKybDataCollected,
    isKycDataCollected,
    isRequirementRouterVisited,
  } = state.context;

  useEffect(() => {
    logInfo('Check requirements started');
    trackAction('checkRequirements:started');
  }, []);

  useGetOnboardingStatus({
    authToken,
    options: {
      onSuccess: (response: OnboardingStatusResponse) => {
        trackAction('checkRequirements:completed');
        logInfo('Onboarding status request completed');
        logOnboardingStatusResponse(response);

        const context = {
          isComponentsSdk: !!componentsSdkContext,
          isInvestorProfileCollected: !!isInvestorProfileCollected,
          isKybDataCollected: !!isKybDataCollected,
          isKycDataCollected: !!isKycDataCollected,
          isRequirementRouterVisited,
          isTransfer: !!isTransfer,
        };
        const payload = filterRequirementsToShow(context, response);
        logInfo(`Requirements status before filter: ${JSON.stringify(response)}`);
        logInfo(`Requirements status filtered: ${JSON.stringify(payload)}`);
        send({ type: 'onboardingRequirementsReceived', payload });
      },
      onError: (err: unknown) => {
        logError(`Error while checking requirements from onboarding status: ${getErrorMessage(err)}`, err);
        send('error');
      },
    },
  });

  // The parent machine will take care of the loading state
  return null;
};

export default CheckRequirements;
