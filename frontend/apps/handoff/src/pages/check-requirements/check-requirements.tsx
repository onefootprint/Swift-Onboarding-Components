import {
  NavigationHeader,
  useGetOnboardingStatus,
} from '@onefootprint/footprint-elements';
import { OnboardingStatusResponse } from '@onefootprint/types';
import { LoadingIndicator } from '@onefootprint/ui';
import React from 'react';
import useHandoffMachine from 'src/hooks/use-handoff-machine';
import convertRequirements from 'src/utils/convert-requirements';
import styled from 'styled-components';

const CheckRequirements = () => {
  const [state, send] = useHandoffMachine();
  const { authToken } = state.context;

  useGetOnboardingStatus(authToken ?? '', {
    onSuccess: (response: OnboardingStatusResponse) => {
      send({
        type: 'requirementsReceived',
        payload: convertRequirements(response.requirements),
      });
    },
  });

  return (
    <LoadingContainer>
      <NavigationHeader />
      <LoadingIndicator />
    </LoadingContainer>
  );
};

const LoadingContainer = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-content: center;
`;

export default CheckRequirements;
