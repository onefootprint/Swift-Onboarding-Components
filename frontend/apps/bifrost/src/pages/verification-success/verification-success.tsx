import React from 'react';
import Header from 'src/components/header';
import styled, { css } from 'styled';
import { Box, LinkButton, Typography } from 'ui';

const VerificationSuccess = () => (
  <Container>
    <Box>
      <Header
        title="You&#39;re all set! 😎"
        subtitle="Identity successfully verified"
      />
    </Box>
    <Typography variant="body-1">
      Your identity was verified in 1.32 seconds. Enjoy!
    </Typography>
    <LinkButton>Return to site</LinkButton>
  </Container>
);

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    row-gap: ${theme.spacing[8]}px;
    justify-content: center;
    align-items: center;
    text-align: center;
  `}
`;

export default VerificationSuccess;
