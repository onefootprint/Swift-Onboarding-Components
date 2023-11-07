import footprint, { FootprintComponentKind } from '@onefootprint/footprint-js';
import styled, { css } from '@onefootprint/styled';
import { FootprintButton } from '@onefootprint/ui';
import Head from 'next/head';
import React from 'react';

const AcmeDevAuthKey = 'ob_test_2TwubGlrWdKaJnWsQQKQYl';
const AcmePropLiveKey = 'pb_live_qULwuLO9VARXqBG1tbd0yM';

const AuthDemo = () => {
  const handleClick = () => {
    const component = footprint.init({
      kind: FootprintComponentKind.Auth,
      variant: 'modal',
      onCancel: () => console.log('demo onCancel'),
      onClose: () => console.log('demo onClose'),
      onComplete: (validationToken: string) => console.log(validationToken),
      options: { showLogo: true },
      publicKey: AcmeDevAuthKey || AcmePropLiveKey,
      userData: {},
      l10n: { locale: 'en-US' },
    });
    component.render();

    return () => {
      component.destroy();
    };
  };

  return (
    <>
      <Head>
        <title>Footprint Auth Demo</title>
      </Head>
      <Container>
        <FootprintButton text="Sign in with Footprint" onClick={handleClick} />
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

export default AuthDemo;
