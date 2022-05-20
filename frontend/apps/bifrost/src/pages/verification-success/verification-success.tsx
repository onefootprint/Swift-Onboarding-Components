import SuccessMessage from '@src/components/success-message';
import React from 'react';
import { Typography } from 'ui';

const VerificationSuccess = () => {
  const body = (
    <Typography variant="body-1">
      Your identity was verified in 1.32 seconds. Enjoy!
    </Typography>
  );

  return <SuccessMessage body={body} />;
};

export default VerificationSuccess;
