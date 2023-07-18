import footprint, { FootprintButton } from '@onefootprint/footprint-react';
import styled, { css } from '@onefootprint/styled';
import Head from 'next/head';
import React from 'react';

// Retro bank tenant
// With id doc
const publicKey = 'ob_test_0uHOuBqL4BX4WRzJOtbNyq';

const handleOpen = () => {
  footprint.open({
    publicKey,
    appearance: {
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
    },
  });
};

const Demo = () => (
  <>
    <Head>
      <title>Footprint and Mercury</title>
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
