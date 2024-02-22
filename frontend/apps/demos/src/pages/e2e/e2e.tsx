import type { SupportedLocale } from '@onefootprint/footprint-js';
import { FootprintVerifyButton } from '@onefootprint/footprint-react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React from 'react';
import styled, { css } from 'styled-components';

const publicKeyEnv = process.env.NEXT_PUBLIC_E2E_TENANT_PK as string;

// Do not change this page. It is used for E2E testing.
const Demo = () => {
  const router = useRouter();
  const {
    locale = 'en-US',
    ob_key: obKey,
    user_data: rawUserData,
  } = router.query;

  const getArgs = () => {
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
    return { userData, publicKey };
  };

  const { userData, publicKey } = getArgs();

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
        <FootprintVerifyButton
          userData={userData}
          publicKey={publicKey}
          l10n={{ locale: locale as SupportedLocale }}
          onComplete={onComplete}
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
