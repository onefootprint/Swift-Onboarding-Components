import footprint, { FootprintButton } from '@onefootprint/footprint-react';
import styled, { css } from '@onefootprint/styled';
import Head from 'next/head';
import React from 'react';

// findigs pk
const publicKey = 'ob_test_KYA0PU0awxnHKjzh9M849Y';

const handleOpen = () => {
  footprint.open({
    publicKey,
    options: {
      showCompletionPage: true,
    },
    appearance: {
      fontSrc:
        'https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;700&display=swap',
      variables: {
        fontFamily: 'Open Sans, sans-serif',
        linkColor: '#000000',
        colorError: '#db2700',
        colorAccent: '#295ff2',

        buttonPrimaryBg: '#295ff2',
        buttonPrimaryHoverBg: '#3a6df3',
        buttonPrimaryActiveBg: '#144ff0',
        buttonPrimaryColor: '#FFF',
        buttonBorderRadius: '7.5rem',

        inputHeight: '48px',
        inputBg: '#f1f3f5',
        inputBorderWidth: 0,
        inputHoverElevation: 'rgb(41, 96, 242) 0px 0px 0px 0.150rem inset',
        inputFocusElevation: 'rgb(41, 96, 242) 0px 0px 0px 0.125rem inset',
        inputColor: '#212529',

        inputErrorBg: '#fff2f0',
        inputErrorElevation: 'rgb(219, 39, 0) 0px 0px 0px 0.0625rem inset',
        inputErrorHoverElevation: 'rgb(219, 39, 0) 0px 0px 0px 0.150rem inset',

        radioSelectSelectedBg: 'rgba(41, 95, 242, 0.08)',
      },
      rules: {
        input: {
          transition: 'box-shadow 0.2s cubic-bezier(0.4, 0, 0.25, 1) 0s',
        },
      },
    },
  });
};

const Demo = () => (
  <>
    <Head>
      <title>Footprint and Findigs</title>
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
