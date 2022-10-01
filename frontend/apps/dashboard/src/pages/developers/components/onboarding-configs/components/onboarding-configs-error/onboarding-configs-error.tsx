import { Typography } from '@onefootprint/ui';
import React from 'react';

type OnboardingConfigsErrorProps = {
  message: string;
};

const OnboardingConfigsError = ({ message }: OnboardingConfigsErrorProps) => (
  <Typography color="secondary" variant="body-2">
    {message}
  </Typography>
);

export default OnboardingConfigsError;
