import { useGetOnboardingStatus } from '@onefootprint/footprint-elements';
import { OnboardingStatusResponse } from '@onefootprint/types';
import { LoadingIndicator } from '@onefootprint/ui';
import React from 'react';
import useHandoffMachine from 'src/hooks/use-handoff-machine';
import convertRequirements from 'src/utils/convert-requirements';
import { Events } from 'src/utils/state-machine';

const CheckRequirements = () => {
  const [state, send] = useHandoffMachine();
  const { authToken } = state.context;

  useGetOnboardingStatus(authToken ?? '', {
    onSuccess: (response: OnboardingStatusResponse) => {
      send({
        type: Events.requirementsReceived,
        payload: convertRequirements(response.requirements),
      });
    },
  });

  return <LoadingIndicator />;
};
export default CheckRequirements;
