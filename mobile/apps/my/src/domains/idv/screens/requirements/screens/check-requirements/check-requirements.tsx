import { Container, LoadingIndicator } from '@onefootprint/ui';
import React from 'react';

import type { RemainingRequirements } from '../../requirement.types';
import useGetOnboardingStatus from './hooks/use-onboarding-status';
import getRemainingRequirements from './utils/get-remaining-requirements';

type CheckRequirementsProps = {
  authToken: string;
  onSuccess: (remainingRequirements: RemainingRequirements) => void;
};

const CheckRequirements = ({ authToken, onSuccess }: CheckRequirementsProps) => {
  useGetOnboardingStatus(authToken, {
    onSuccess: ({ allRequirements }) => {
      const remainingRequirements = getRemainingRequirements(allRequirements);
      onSuccess(remainingRequirements);
    },
  });

  return (
    <Container center>
      <LoadingIndicator />
    </Container>
  );
};

export default CheckRequirements;
