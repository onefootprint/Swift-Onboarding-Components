import { media } from '@onefootprint/ui';
import Head from 'next/head';
import { useState } from 'react';
import styled, { css } from 'styled-components';

import Form from './components/form';
import Success from './components/success';

const Demo = () => {
  const [showConfirmation, setConfirmation] = useState(false);

  const handleSuccess = () => {
    setConfirmation(true);
  };

  return (
    <>
      <Head>
        <title>Footprint Demo</title>
      </Head>
      <Container>
        <Inner>{showConfirmation ? <Success /> : <Form onSuccess={handleSuccess} />}</Inner>
      </Container>
    </>
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
    border-radius: ${theme.borderRadius.sm};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[9]};
    padding: ${theme.spacing[7]} ${theme.spacing[5]};
    text-align: center;
    width: 90%;

    ${media.greaterThan('sm')`
      max-width: 552px;
      padding: ${theme.spacing[9]};
    `}

    ${media.greaterThan('md')`
      max-width: 700px;
    `}
  `}
`;

export default Demo;
