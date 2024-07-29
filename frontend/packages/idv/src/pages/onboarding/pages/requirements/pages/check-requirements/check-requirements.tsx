import { getErrorMessage } from '@onefootprint/request';
import type { OnboardingStatusResponse } from '@onefootprint/types';

import { useGetOnboardingStatus } from '../../../../../../queries';
import { getLogger } from '../../../../../../utils/logger';
import useOnboardingRequirementsMachine from '../../hooks/use-onboarding-requirements-machine';
import filterRequirementsToShow from './utils/filter-requirements-to-show';

const { logInfo, logError } = getLogger({ location: 'onboarding-check-requirements' });

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
    idvContext: { authToken, isTransfer, componentsSdkContext },
    isInvestorProfileCollected,
    isKybDataCollected,
    isKycDataCollected,
    isRequirementRouterVisited,
  } = state.context;

  useGetOnboardingStatus({
    authToken,
    options: {
      onSuccess: (response: OnboardingStatusResponse) => {
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
