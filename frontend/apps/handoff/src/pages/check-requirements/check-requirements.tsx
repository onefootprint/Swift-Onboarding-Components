import {
  OnboardingRequirement,
  OnboardingRequirementKind,
  OnboardingStatusResponse,
} from '@onefootprint/types';
import { LoadingIndicator } from '@onefootprint/ui';
import React from 'react';
import useHandoffMachine from 'src/hooks/use-handoff-machine';
import { Events } from 'src/utils/state-machine';

import useGetOnboardingStatus from './hooks/use-get-onboarding-status';

const CheckRequirements = () => {
  const [, send] = useHandoffMachine();

  useGetOnboardingStatus({
    onSuccess: (response: OnboardingStatusResponse) => {
      const { requirements } = response;
      let missingLiveness = false;
      let missingIdDocument = false;

      requirements.forEach((req: OnboardingRequirement) => {
        if (req.kind === OnboardingRequirementKind.liveness) {
          missingLiveness = true;
        }
        if (req.kind === OnboardingRequirementKind.collectDocument) {
          missingIdDocument = true;
        }
      });
      send({
        type: Events.requirementsReceived,
        payload: {
          missingIdDocument,
          missingLiveness,
        },
      });
    },
  });

  return <LoadingIndicator />;
};
export default CheckRequirements;
