import IcoCheckCircle40 from 'icons/ico/ico-check-circle-40';
import React from 'react';
import { Typography } from 'ui';

const Success = () => (
  <>
    <IcoCheckCircle40 color="success" />
    <Typography variant="label-3" color="success">
      Phone verified
    </Typography>
  </>
);

export default Success;
