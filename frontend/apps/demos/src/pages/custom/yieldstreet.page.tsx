import footprint from '@onefootprint/footprint-js';
import Head from 'next/head';
import Image from 'next/image';
import React from 'react';
import styled, { css } from 'styled-components';

const publicKey = process.env.NEXT_PUBLIC_TENANT_KEY as string;

const handleOpen = () => {
  footprint.open({
    publicKey,
    appearance: {
      fontSrc:
        'https://fonts.googleapis.com/css2?family=Raleway:wght@400;600;700&display=swap',
      variables: {
        fontFamily: 'Raleway',

        linkColor: '#000000',
        colorError: '#C13515',

        buttonPrimaryBg: '#E51D52',
        buttonPrimaryActiveBg: '#EB4C60',
        buttonPrimaryColor: '#FFF',
        buttonPrimaryLoadingColor: '#FFF',

        inputFocusElevation: 'none',
        inputBorderColor: '#B0B0B0',

        inputHoverBorderColor: '#000',
      },
      rules: {
        button: {
          transition: 'transform 0.1s ease',
          backgroundImage:
            'linear-gradient(to right,#E61E4D 0%,#E31C5F 50%,#D70466 100%)',
        },
        'button:active': {
          transform: 'scale(0.96)',
        },
      },
    },
  });
};

const Demo = () => (
  <>
    <Head>
      <title>Footprint and Airbnb</title>
    </Head>
    <Container>
      <Image
        alt="airbnb"
        src="/airbnb.png"
        width={0}
        height={0}
        sizes="100vw"
        style={{ width: '100%', height: 'auto' }}
        onClick={handleOpen}
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
