import footprint, { FootprintComponentKind } from '@onefootprint/footprint-js';
import styled, { css } from '@onefootprint/styled';
import { Typography } from '@onefootprint/ui';
import Head from 'next/head';
import React from 'react';
import { useEffectOnce } from 'usehooks-ts';

const AcmeDevAuthKey = 'ob_test_2TwubGlrWdKaJnWsQQKQYl';
const AcmePropLiveKey = 'pb_live_qULwuLO9VARXqBG1tbd0yM';

const AuthDevAcme = () => {
  useEffectOnce(() => {
    const component = footprint.init({
      kind: FootprintComponentKind.Auth,
      variant: 'modal',
      appearance: { variant: 'inline' },
      containerId: 'footprint-auth-form',
      onCancel: () => console.log('demo onCancel'),
      onClose: () => console.log('demo onClose'),
      onComplete: (x: unknown) => console.log('demo onComplete', x),
      options: { showLogo: true, showCompletionPage: true },
      publicKey: AcmeDevAuthKey || AcmePropLiveKey,
      userData: {},
      l10n: { locale: 'en-US' },
    });
    component.render();

    return () => {
      component.destroy();
    };
  });

  return <div id="footprint-auth-form" style={{ height: '100%' }} />;
};

const AuthDemo = () => (
  <Container>
    <Inner>
      <Head>
        <title>Footprint Components Demo</title>
      </Head>
      <Typography variant="heading-2" sx={{ marginBottom: 7 }}>
        Auth Demo
      </Typography>
      <AuthDevAcme />
    </Inner>
  </Container>
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

const Inner = styled.div`
  ${({ theme }) => css`
    background: ${theme.backgroundColor.primary};
    display: flex;
    flex-direction: column;
    text-align: center;
    width: 100%;
    height: 100%;
  `}
`;

export default AuthDemo;
