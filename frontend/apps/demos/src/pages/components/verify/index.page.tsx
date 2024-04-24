import type { SupportedLocale } from '@onefootprint/footprint-js';
import { FootprintComponentKind } from '@onefootprint/footprint-js';
import { Button } from '@onefootprint/ui';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React from 'react';
import styled, { css } from 'styled-components';

import fakeSdk from '../../../helpers/fake-sdk';

type RouterReturn = ReturnType<typeof useRouter>;

const AcmeDevAuthKey = 'ob_test_2TwubGlrWdKaJnWsQQKQYl';
const publicKeyEnv = process.env.NEXT_PUBLIC_TENANT_KEY || AcmeDevAuthKey;

const isValidTokenFormat = (str: string): boolean =>
  Boolean(str) && /tok_/.test(str);

const getSdkArgsToken = (str: string): string =>
  isValidTokenFormat(str) ? str : '';

const getQueryArgs = (router: RouterReturn) => {
  const { query, asPath } = router;
  const {
    app_url: appUrl,
    ob_key: obKey,
    user_data: rawUserData,
    locale = 'en-US',
  } = query;
  const authToken = getSdkArgsToken(asPath.split('#')[1]) ?? '';
  const publicKey = typeof obKey === 'string' ? obKey : publicKeyEnv;
  const appUrlStr = String(appUrl);
  let userData = {};

  try {
    userData =
      typeof rawUserData === 'string'
        ? JSON.parse(decodeURIComponent(rawUserData))
        : {};
  } catch (_) {
    // do nothing
  }
  return {
    authToken,
    appUrl:
      appUrlStr.startsWith('https://bifrost-') ||
      appUrlStr.startsWith('http://localhost')
        ? appUrlStr
        : 'http://localhost:3000',
    publicKey,
    userData,
    locale,
  };
};

const onComplete = (token: string) => {
  console.log('# token', token); // eslint-disable-line no-console
  const el = document.querySelector('[data-testid="result"]');
  if (el && token) {
    el.innerHTML = token;
  }
};

const VerifyDemo = () => {
  const router = useRouter();
  const {
    appUrl: bifrostUrl,
    locale,
    publicKey,
    userData,
  } = getQueryArgs(router);

  const handleVerifyClick = () => {
    const component = fakeSdk.init({
      kind: FootprintComponentKind.Verify,
      variant: 'modal',
      onAuth: (s: string) => console.log('demo onAuth', s),
      onCancel: () => console.log('demo onCancel'),
      onClose: () => console.log('demo onClose'),
      onComplete,
      l10n: { locale: locale as SupportedLocale },
      options: { showLogo: false },
      publicKey,
      userData,
    });
    component.render(bifrostUrl);

    return () => {
      component.destroy();
    };
  };

  return (
    <>
      <Head>
        <title>Footprint Verify Demo</title>
      </Head>
      <Container>
        <Button onClick={handleVerifyClick} variant="secondary">
          Verify with Footprint
        </Button>
        <div data-testid="result" />
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

export default VerifyDemo;
