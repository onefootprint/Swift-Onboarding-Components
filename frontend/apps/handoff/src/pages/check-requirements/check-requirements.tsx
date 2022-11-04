import {
  OnboardingRequirement,
  OnboardingRequirementKind,
  OnboardingStatusResponse,
} from '@onefootprint/types';
import { LoadingIndicator } from '@onefootprint/ui';
import { useGetOnboardingStatus } from 'footprint-elements';
import React from 'react';
import useHandoffMachine from 'src/hooks/use-handoff-machine';
import { Events } from 'src/utils/state-machine';

const CheckRequirements = () => {
  const [state, send] = useHandoffMachine();
  const { authToken, tenant } = state.context;

  useGetOnboardingStatus(authToken ?? '', tenant?.pk ?? '', {
    onSuccess: (response: OnboardingStatusResponse) => {
      const { requirements } = response;
      let missingLiveness = false;
      let missingIdDocument = false;

      requirements.forEach((req: OnboardingRequirement) => {
        if (req.kind === OnboardingRequirementKind.liveness) {
          missingLiveness = true;
        }
        if (req.kind === OnboardingRequirementKind.idDoc) {
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
