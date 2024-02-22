import footprint, { FootprintComponentKind } from '@onefootprint/footprint-js';
import { Button } from '@onefootprint/ui';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React from 'react';
import styled, { css } from 'styled-components';

type RouterReturn = ReturnType<typeof useRouter>;

const AcmeDevAuthKey = 'ob_test_2TwubGlrWdKaJnWsQQKQYl';
const publicKeyEnv = process.env.NEXT_PUBLIC_TENANT_KEY || AcmeDevAuthKey;

const isValidTokenFormat = (str: string): boolean =>
  Boolean(str) && /tok_/.test(str);

const getSdkArgsToken = (str: string): string =>
  isValidTokenFormat(str) ? str : '';

const getQueryArgs = (router: RouterReturn) => {
  const { query, asPath } = router;
  const { ob_key: obKey, user_data: rawUserData } = query;
  const authToken = getSdkArgsToken(asPath.split('#')[1]) ?? '';
  const publicKey = typeof obKey === 'string' ? obKey : publicKeyEnv;
  let userData = {};

  try {
    userData =
      typeof rawUserData === 'string'
        ? JSON.parse(decodeURIComponent(rawUserData))
        : {};
  } catch (_) {
    // do nothing
  }
  return { authToken, publicKey, userData };
};

const AuthDemo = () => {
  const router = useRouter();
  const { authToken, publicKey, userData } = getQueryArgs(router);

  const handleAuthenticateClick = () => {
    const component = footprint.init({
      kind: FootprintComponentKind.Auth,
      onCancel: () => console.log('demo onCancel'),
      onClose: () => console.log('demo onClose'),
      onComplete: (s: string) => console.log('demo onComplete', s),
      options: { showLogo: false },
      publicKey,
      userData,
      variant: 'modal',
    });
    component.render();

    return () => {
      component.destroy();
    };
  };

  const handleUpdateFlowClick = () => {
    const component = footprint.init({
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
        <Button
          onClick={handleAuthenticateClick}
          size="compact"
          variant="secondary"
        >
          Authenticate with Footprint
        </Button>
        <br />
        <Button
          onClick={handleUpdateFlowClick}
          size="compact"
          variant="secondary"
        >
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
