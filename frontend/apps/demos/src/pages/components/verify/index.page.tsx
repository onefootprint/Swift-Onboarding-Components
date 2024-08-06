import type { SupportedLocale } from '@onefootprint/footprint-js';
import { FootprintComponentKind } from '@onefootprint/footprint-js';
import { Button } from '@onefootprint/ui';
import Head from 'next/head';
import { useRouter } from 'next/router';
import styled, { css } from 'styled-components';

import fakeSdk from '../../../helpers/fake-sdk';
import getQueryArgs, { isString } from '../../../helpers/get-query-args';

const ENV = process.env.NEXT_PUBLIC_VERCEL_ENV;
const fallbackPKey = process.env.NEXT_PUBLIC_TENANT_KEY || 'ob_test_Gw8TsnS2xWOYazI0pugdxu';
const fallbackAppUrl = ENV === 'production' ? 'https://id.onefootprint.com' : 'http://localhost:3000';

const getVerifyArgs = (o: ReturnType<typeof getQueryArgs>) => ({
  ...o,
  publicKey: isString(o.publicKey) ? o.publicKey : fallbackPKey,
  appUrl:
    o.appUrl.startsWith('https://id') ||
    o.appUrl.startsWith('https://bifrost') ||
    o.appUrl.startsWith('http://localhost')
      ? o.appUrl
      : fallbackAppUrl,
});

const onComplete = (token: string) => {
  const el = document.querySelector('[data-testid="result"]');
  if (el && token) {
    el.innerHTML = token;
  }
};

const VerifyDemo = () => {
  const router = useRouter();
  const { appUrl, bootstrapData, locale, publicKey } = getVerifyArgs(getQueryArgs(router));

  const handleVerifyClick = () => {
    const component = fakeSdk.init({
      bootstrapData,
      kind: FootprintComponentKind.Verify,
      l10n: { locale: locale as SupportedLocale },
      onAuth: (s: string) => console.log(`${FootprintComponentKind.Verify} onAuth`, s),
      onCancel: () => console.log(`${FootprintComponentKind.Verify} onCancel`),
      onClose: () => console.log(`${FootprintComponentKind.Verify} onClose`),
      onComplete,
      options: { showLogo: false },
      publicKey,
      variant: 'modal',
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
