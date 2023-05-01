import { IcoCheckCircle40 } from '@onefootprint/icons';
import { Box, Button, Container, Typography } from '@onefootprint/ui';
import React from 'react';

const Success = () => {
  return (
    <Container center>
      <IcoCheckCircle40 color="success" />
      <Typography variant="heading-3" marginBottom={3} marginTop={4}>
        Success!
      </Typography>
      <Typography variant="body-3" marginBottom={9} center>
        You can now continue where you left on desktop
      </Typography>
      <Box width="100%">
        <Button variant="secondary">Done</Button>
      </Box>
    </Container>
  );
};

export default Success;
