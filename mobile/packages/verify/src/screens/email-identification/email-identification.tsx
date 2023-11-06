import {
  Box,
  Button,
  Container,
  TextInput,
  Typography,
} from '@onefootprint/ui';
import React from 'react';

const EmailIdentification = () => {
  return (
    <Container>
      <Box gap={3} marginBottom={7}>
        <Typography color="primary" variant="heading-3" center>
          Hey there! 👋
        </Typography>
        <Typography color="primary" variant="body-2" center>
          Enter your email to get started.
        </Typography>
      </Box>
      <Box marginBottom={7}>
        <TextInput label="Email" placeholder="your.email@email.com" />
      </Box>
      <Button variant="primary">Hello</Button>
    </Container>
  );
};

export default EmailIdentification;
