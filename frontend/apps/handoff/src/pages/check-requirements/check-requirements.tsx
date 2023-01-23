import { useGetOnboardingStatus } from '@onefootprint/footprint-elements';
import {
  OnboardingRequirement,
  OnboardingRequirementKind,
  OnboardingStatusResponse,
} from '@onefootprint/types';
import { LoadingIndicator } from '@onefootprint/ui';
import React from 'react';
import useHandoffMachine from 'src/hooks/use-handoff-machine';
import { Events } from 'src/utils/state-machine';

const CheckRequirements = () => {
  const [state, send] = useHandoffMachine();
  const { authToken } = state.context;

  useGetOnboardingStatus(authToken ?? '', {
    onSuccess: (response: OnboardingStatusResponse) => {
      const { requirements } = response;
      let missingLiveness = false;
      let missingIdDoc = false;
      let missingSelfie = false;
      let missingConsent = false;

      requirements.forEach((req: OnboardingRequirement) => {
        if (req.kind === OnboardingRequirementKind.liveness) {
          missingLiveness = true;
        }
        if (req.kind === OnboardingRequirementKind.idDoc) {
          missingIdDoc = true;
          missingSelfie = req.shouldCollectSelfie;
          missingConsent = req.shouldCollectConsent;
        }
      });

      send({
        type: Events.requirementsReceived,
        payload: {
          missingIdDoc,
          missingSelfie,
          missingLiveness,
          missingConsent,
        },
      });
    },
  });

  return <LoadingIndicator />;
};
export default CheckRequirements;
