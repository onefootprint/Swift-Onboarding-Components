import type { SupportedLocale } from '@onefootprint/footprint-js';
import { FootprintComponentKind } from '@onefootprint/footprint-js';
import { Button } from '@onefootprint/ui';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React from 'react';
import styled, { css } from 'styled-components';

import fakeSdk from '../../../helpers/fake-sdk';
import getQueryArgs, { isString } from '../../../helpers/get-query-args';

const fallbackPKey = process.env.NEXT_PUBLIC_TENANT_KEY || 'ob_test_Gw8TsnS2xWOYazI0pugdxu';

const getVerifyArgs = (o: ReturnType<typeof getQueryArgs>) => ({
  ...o,
  publicKey: isString(o.publicKey) ? o.publicKey : fallbackPKey,
  appUrl:
    o.appUrl.startsWith('https://bifrost-') || o.appUrl.startsWith('http://localhost')
      ? o.appUrl
      : 'http://localhost:3000',
});

const onComplete = (token: string) => {
  const el = document.querySelector('[data-testid="result"]');
  if (el && token) {
    el.innerHTML = token;
  }
};

const VerifyDemo = () => {
  const router = useRouter();
  const { appUrl, locale, publicKey, userData } = getVerifyArgs(getQueryArgs(router));

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
    component.render(appUrl);

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
