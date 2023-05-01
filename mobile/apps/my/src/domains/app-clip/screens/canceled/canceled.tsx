import { Container, Typography } from '@onefootprint/ui';
import React from 'react';

const Canceled = () => {
  return (
    <Container center>
      <Typography variant="heading-3" marginBottom={3} marginTop={4}>
        Session canceled
      </Typography>
      <Typography variant="body-3" marginBottom={9} center>
        Please return to the previous page.
      </Typography>
    </Container>
  );
};

export default Canceled;
