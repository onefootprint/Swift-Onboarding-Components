import { FootprintComponentKind } from '@onefootprint/footprint-js';
import { Button } from '@onefootprint/ui';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React from 'react';
import styled, { css } from 'styled-components';

import fakeSdk from '../../../helpers/fake-sdk';
import getQueryArgs, { isString } from '../../../helpers/get-query-args';

const fallbackPKey = process.env.NEXT_PUBLIC_TENANT_KEY || 'ob_test_2TwubGlrWdKaJnWsQQKQYl';
const getAuthArgs = (o: ReturnType<typeof getQueryArgs>) => ({
  ...o,
  publicKey: isString(o.publicKey) ? o.publicKey : fallbackPKey,
  appUrl:
    o.appUrl.startsWith('https://auth-') || o.appUrl.startsWith('http://localhost')
      ? o.appUrl
      : 'http://localhost:3011',
});

const AuthDemo = () => {
  const router = useRouter();
  const { appUrl, authToken, publicKey, userData } = getAuthArgs(getQueryArgs(router));

  const handleAuthenticateClick = () => {
    const component = fakeSdk.init({
      kind: FootprintComponentKind.Auth,
      onCancel: () => console.log('demo onCancel'),
      onClose: () => console.log('demo onClose'),
      onComplete: (s: string) => console.log('demo onComplete', s),
      options: { showLogo: false },
      publicKey,
      userData,
      variant: 'modal',
    });
    component.render(appUrl);

    return () => {
      component.destroy();
    };
  };

  const handleUpdateFlowClick = () => {
    const component = fakeSdk.init({
      kind: FootprintComponentKind.Auth,
      variant: 'modal',
      authToken,
      updateLoginMethods: true,
      options: { showLogo: false },
      userData,
      onCancel: () => console.log('demo onCancel'),
      onClose: () => console.log('demo onClose'),
      onComplete: (s: string) => console.log('demo onComplete', s),
    });
    component.render(appUrl);

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
        <Button onClick={handleAuthenticateClick} variant="secondary">
          Authenticate with Footprint
        </Button>
        <br />
        <Button onClick={handleUpdateFlowClick} variant="secondary">
          Update Authentication Methods with Footprint
        </Button>
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
