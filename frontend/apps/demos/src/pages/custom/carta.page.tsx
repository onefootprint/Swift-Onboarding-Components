import { FootprintComponentKind } from '@onefootprint/footprint-js';
import footprint, { FootprintVerifyButton } from '@onefootprint/footprint-react';
import Head from 'next/head';
import React from 'react';
import styled, { css } from 'styled-components';

// Acme bank tenant
// With id doc
const publicKey = 'ob_test_BdkyTJgurgl8T6EHR5FDsc';

const handleOpen = () => {
  const component = footprint.init({
    kind: FootprintComponentKind.Verify,
    publicKey,
    appearance: {
      fontSrc: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
      variables: {
        // global
        fontFamily: 'Inter, sans-serif',
        colorAccent: '#000',
        colorError: '#e23333',

        // label
        labelColor: '#3c4043',

        // button
        buttonPrimaryBg: '#202124',
        buttonPrimaryHoverBg: '#176bb8',
        buttonPrimaryActiveBg: '#004678',
        buttonPrimaryColor: '#f6f6f6',
        buttonBorderRadius: '6px',

        // input
        inputElevation: 'none',
        inputBorderColor: '#d9dbdc',
        inputHoverBorderColor: '#80868b',
        inputFocusBorderColor: '#176bb8',
        inputBorderRadius: '4px',
        inputHeight: '42px',
        inputColor: '#131e29',
      },
      rules: {
        button: {
          height: '42px',
        },
        input: {
          padding: '10px',
          outline: 'none',
          transitionDuration: '60ms',
          transitionProperty: 'background-color, border-color, box-shadow, color',
          transitionTimingFunction: 'ease-in',
        },
        'input:focus': {
          borderWidth: '2px',
          paddingBottom: '9px',
          paddingLeft: '9px',
          paddingTop: '9px',
        },
        linkButton: {
          textDecoration: 'underline',
        },
      },
    },
  });

  component.render();
};

const Demo = () => (
  <>
    <Head>
      <title>Footprint and Carta</title>
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
