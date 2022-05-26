import { useRouter } from 'next/router';
import React from 'react';
import styled, { css } from 'styled';
import { Button, Typography } from 'ui';

import LogoAndText from '../../components/logo-and-text';

const LinkSent = () => {
  const router = useRouter();

  return (
    <Container>
      <Inner>
        <LogoAndText text="Magic link sent!" />
        <Typography variant="body-2" sx={{ marginBottom: 8 }}>
          We just sent you an email to {` `}
          <Typography variant="label-2" sx={{ display: 'inline' }}>
            {router.query.email_address}
          </Typography>
          . Click that link to log in. It&apos;s secure and lightning fast!
        </Typography>
        <Button onClick={() => router.push('/login')} fullWidth>
          Back home
        </Button>
      </Inner>
    </Container>
  );
};

const Container = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  height: 100vh;
  justify-content: center;
  text-align: center;
`;

const Inner = styled.div`
  ${({ theme }) => css`
    display: flex;
    max-width: 350px;
    flex-direction: column;
    row-gap: ${theme.spacing[4]}px;
  `}
`;

export default LinkSent;
