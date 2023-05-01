import { Container, Typography } from '@onefootprint/ui';
import React from 'react';

const Expired = () => {
  return (
    <Container center>
      <Typography variant="heading-3" marginBottom={3} marginTop={4}>
        Session expired
      </Typography>
      <Typography variant="body-3" marginBottom={9} center>
        For security reasons, this session has timed out. Please go back to the
        previous page.
      </Typography>
    </Container>
  );
};

export default Expired;
