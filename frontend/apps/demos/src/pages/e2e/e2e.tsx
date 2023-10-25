import type { SupportedLocale } from '@onefootprint/footprint-js';
import { FootprintComponentKind } from '@onefootprint/footprint-js';
import footprint, {
  FootprintVerifyButton,
} from '@onefootprint/footprint-react';
import styled, { css } from '@onefootprint/styled';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React from 'react';

const publicKeyEnv = process.env.NEXT_PUBLIC_E2E_TENANT_PK as string;

const handleOpen = (locale: SupportedLocale, publicKey: string) => {
  const component = footprint.init({
    kind: FootprintComponentKind.Verify,
    publicKey,
    l10n: { locale },
    onComplete: (validationToken: string) => {
      const el = document.querySelector('[data-testid="result"]');
      if (el && validationToken) {
        el.innerHTML = validationToken;
      }
    },
  });

  component.render();
};

// Do not change this page. It is used for E2E testing.
const Demo = () => {
  const router = useRouter();
  const { locale = 'en-US', ob_key: obKey } = router.query;
  const publicKey = typeof obKey === 'string' ? obKey : publicKeyEnv;

  return (
    <>
      <Head>
        <title>Footprint E2E</title>
      </Head>
      <Container>
        <FootprintVerifyButton
          onClick={() => handleOpen(locale as SupportedLocale, publicKey)}
          l10n={{ locale: locale as SupportedLocale }}
        />
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

export default Demo;
