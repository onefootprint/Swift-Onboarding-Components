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
  const { authToken, tenant } = state.context;

  useGetOnboardingStatus(authToken ?? '', tenant?.pk ?? '', {
    onSuccess: (response: OnboardingStatusResponse) => {
      const { requirements } = response;
      let missingLiveness = false;
      let idDocRequestId;

      requirements.forEach((req: OnboardingRequirement) => {
        if (req.kind === OnboardingRequirementKind.liveness) {
          missingLiveness = true;
        }
        if (req.kind === OnboardingRequirementKind.idDoc) {
          idDocRequestId = req.documentRequestId;
        }
      });
      send({
        type: Events.requirementsReceived,
        payload: {
          idDocRequestId,
          missingLiveness,
        },
      });
    },
  });

  return <LoadingIndicator />;
};
export default CheckRequirements;
