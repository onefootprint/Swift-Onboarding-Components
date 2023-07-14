import footprint, { FootprintButton } from '@onefootprint/footprint-react';
import styled, { css } from '@onefootprint/styled';
import Head from 'next/head';
import React from 'react';

const publicKey = process.env.NEXT_PUBLIC_TENANT_KEY as string;

const handleOpen = () => {
  footprint.open({ publicKey });
};

// Do not change this page. It is used for E2E testing.
const Demo = () => (
  <>
    <Head>
      <title>Footprint E2E</title>
    </Head>
    <Container>
      <FootprintButton onClick={handleOpen} />
    </Container>
  </>
);

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

export default Demo;
