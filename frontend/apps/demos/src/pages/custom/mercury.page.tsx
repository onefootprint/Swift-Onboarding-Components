import { FootprintVerifyButton } from '@onefootprint/footprint-react';
import styled, { css } from '@onefootprint/styled';
import Head from 'next/head';
import React from 'react';

// Acme bank tenant
// With id doc
const publicKey = 'ob_test_BdkyTJgurgl8T6EHR5FDsc';

const Demo = () => (
  <>
    <Head>
      <title>Footprint and Mercury</title>
    </Head>
    <Container>
      <FootprintVerifyButton
        publicKey={publicKey}
        appearance={{
          variables: {
            // global
            colorAccent: '#465ed1',
            colorError: '#c21877',

            // label
            labelColor: '#545454',

            // button
            buttonPrimaryBg: '#465ed1',
            buttonPrimaryHoverBg: '#1835c1',
          },
        }}
      />
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
