import styled, { css } from '@onefootprint/styled';
import { media, Typography } from '@onefootprint/ui';
import Head from 'next/head';
import React, { useState } from 'react';

import CredsForm from './components/creds-form';
import DemoForm from './components/demo-form';

const SecureFormDemo = () => {
  const [authToken, setAuthToken] = useState<string>();

  const handleSubmit = (token: string) => {
    setAuthToken(token);
  };

  return (
    <Container>
      <Inner>
        <Head>
          <title>Footprint Components Demo</title>
        </Head>
        <Typography variant="heading-2" sx={{ marginBottom: 7 }}>
          Secure Form Demo
        </Typography>
        {authToken ? (
          <DemoForm authToken={authToken} />
        ) : (
          <CredsForm onSubmit={handleSubmit} />
        )}
      </Inner>
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    align-items: center;
    background: ${theme.backgroundColor.secondary};
    display: flex;
    flex-direction: column;
    height: 100vh;
    justify-content: center;
    overflow: hidden;
    width: 100%;
  `}
`;

const Inner = styled.div`
  ${({ theme }) => css`
    background: ${theme.backgroundColor.primary};
    display: flex;
    flex-direction: column;
    text-align: center;
    width: 100%;
    height: 100%;
    padding: ${theme.spacing[9]};

    ${media.greaterThan('md')`
      border-radius: ${theme.borderRadius.compact};
      border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
      width: 90%;
      max-width: 700px;
      height: unset;
    `}
  `}
`;

export default SecureFormDemo;
