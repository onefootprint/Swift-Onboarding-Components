import SuccessMessage from '@src/components/success-message';
import React from 'react';
import { Typography } from 'ui';

const RegistrationSuccess = () => {
  const body = (
    <>
      <Typography variant="body-1">
        You can view your personal data and the companies that have access to it
        on my.footprint.com.
      </Typography>
      <Typography variant="body-1">
        Next time, you can just sign in using Footprint with one-click!
      </Typography>
    </>
  );

  return <SuccessMessage body={body} />;
};

export default RegistrationSuccess;
