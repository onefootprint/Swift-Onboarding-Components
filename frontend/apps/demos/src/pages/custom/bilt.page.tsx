import { FootprintComponentKind } from '@onefootprint/footprint-js';
import footprint, { FootprintVerifyButton } from '@onefootprint/footprint-react';
import Head from 'next/head';
import React from 'react';
import styled, { css } from 'styled-components';

const publicKey = process.env.NEXT_PUBLIC_TENANT_KEY as string;

const handleOpen = () => {
  const component = footprint.init({
    kind: FootprintComponentKind.Verify,
    publicKey,
    appearance: {
      fontSrc: 'https://fonts.googleapis.com/css2?family=Varta:wght@400;500;600;700&display=swap',
      variables: {
        // global
        fontFamily: 'Varta, sans-serif',
        colorAccent: '#2d3b46',
        colorError: '#F64B4C',
        colorSuccess: '#46642D',
        colorWarning: '#D06B2F',

        // label
        labelColor: '#545454',

        // button
        buttonPrimaryBg: '#2D3B46',

        // input
        inputElevation: 'none',
        inputBorderColor: '#afafaf',
        inputColor: '#000',
        inputFocusBorderColor: '#2d3b46',
        inputBorderRadius: 'initial',
        inputHeight: '40px',
        inputPlaceholderColor: '#AFAFAF',
        inputErrorElevation: 'initial',
      },
      rules: {
        input: {
          borderLeft: 'initial',
          borderRight: 'initial',
          borderTop: 'initial',
          paddingLeft: 'initial',
          paddingRight: 'initial',
        },
        pinInput: {
          gap: 'initial',
        },
      },
    },
  });

  component.render();
};

const Demo = () => (
  <>
    <Head>
      <title>Footprint and Bilt</title>
    </Head>
    <Container>
      <FootprintVerifyButton onClick={handleOpen} />
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
