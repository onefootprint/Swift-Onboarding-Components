import type { SupportedLocale } from '@onefootprint/footprint-js';
import { FootprintVerifyButton } from '@onefootprint/footprint-react';
import { AnimatedLoadingSpinner } from '@onefootprint/ui';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useMemo } from 'react';
import styled, { css } from 'styled-components';

const publicKeyEnv = process.env.NEXT_PUBLIC_E2E_TENANT_PK as string;

// Do not change this page. It is used for E2E testing.
const Demo = () => {
  const router = useRouter();
  const { query, isReady } = router;

  const { userData, publicKey, locale } = useMemo(() => {
    if (!isReady) {
      return {
        userData: undefined,
        publicKey: undefined,
        locale: undefined,
      };
    }

    const { locale: localeString = 'en-US', ob_key: obKey, user_data: rawUserData = {} } = query;
    const key = typeof obKey === 'string' ? obKey : publicKeyEnv;
    let data = {};
    try {
      data = typeof rawUserData === 'string' ? JSON.parse(decodeURIComponent(rawUserData)) : {};
    } catch (_) {
      // do nothing
    }
    return {
      userData: data,
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
        {publicKey && locale && userData ? (
          <FootprintVerifyButton
            userData={userData}
            publicKey={publicKey}
            l10n={{ locale: locale as SupportedLocale }}
            onComplete={onComplete}
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
