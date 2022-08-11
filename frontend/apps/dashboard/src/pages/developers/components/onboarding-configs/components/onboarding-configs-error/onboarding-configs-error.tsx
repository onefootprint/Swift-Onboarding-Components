import React from 'react';
import { Typography } from 'ui';

type OnboardingConfigsErrorProps = {
  message: string;
};

const OnboardingConfigsError = ({ message }: OnboardingConfigsErrorProps) => (
  <Typography color="secondary" variant="body-2">
    {message}
  </Typography>
);

export default OnboardingConfigsError;
