import type { SupportedLocale } from '@onefootprint/footprint-js';
import { FootprintButton } from '@onefootprint/footprint-react';
import { AnimatedLoadingSpinner } from '@onefootprint/ui';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useMemo } from 'react';
import styled, { css } from 'styled-components';

const publicKeyEnv = process.env.NEXT_PUBLIC_E2E_TENANT_PK as string;
const isString = (x: unknown): x is string => typeof x === 'string' && !!x;

// Do not change this page. It is used for E2E testing.
const Demo = () => {
  const router = useRouter();
  const { query, isReady } = router;

  const { bootstrapData, publicKey, locale } = useMemo(() => {
    if (!isReady) {
      return {
        bootstrapData: undefined,
        publicKey: undefined,
        locale: undefined,
      };
    }

    const {
      bootstrap_data: rawBootstrapData,
      locale: localeString = 'en-US',
      ob_key: obKey,
      user_data: rawUserData = {},
    } = query;
    const key = typeof obKey === 'string' ? obKey : publicKeyEnv;
    let bootstrapData = {};
    try {
      bootstrapData = isString(rawBootstrapData)
        ? JSON.parse(decodeURIComponent(rawBootstrapData))
        : isString(rawUserData)
          ? JSON.parse(decodeURIComponent(rawUserData))
          : {};
    } catch (_) {
      // do nothing
    }
    return {
      bootstrapData,
      publicKey: key,
      locale: localeString,
    };
  }, [isReady, query]);

  const onComplete = (validationToken: string) => {
    const el = document.querySelector('[data-testid="result"]');
    if (el && validationToken) {
      el.innerHTML = validationToken;
    }
  };

  return (
    <>
      <Head>
        <title>Footprint E2E</title>
      </Head>
      <Container>
        {publicKey && locale && bootstrapData ? (
          <FootprintButton
            bootstrapData={bootstrapData}
            kind="verify"
            l10n={{ locale: locale as SupportedLocale }}
            onComplete={onComplete}
            publicKey={publicKey}
          />
        ) : (
          <AnimatedLoadingSpinner animationStart />
        )}
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
