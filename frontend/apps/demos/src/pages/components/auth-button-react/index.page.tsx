import { FootprintAuthButton } from '@onefootprint/footprint-react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React from 'react';
import styled, { css } from 'styled-components';

type RouterReturn = ReturnType<typeof useRouter>;

const isString = (x: unknown): x is string => typeof x === 'string' && !!x;
const AcmeDevAuthKey = 'ob_test_2TwubGlrWdKaJnWsQQKQYl';
const envPublicKey = process.env.NEXT_PUBLIC_TENANT_KEY || AcmeDevAuthKey;

const getQueryArgs = (query: RouterReturn['query']) => {
  const { bootstrap_data: rawBootstrapData, ob_key: obKey, user_data: rawUserData } = query;
  const publicKey = typeof obKey === 'string' ? obKey : envPublicKey;
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
  return { bootstrapData, publicKey };
};

const AuthButtonReact = () => {
  const router = useRouter();
  const { bootstrapData, publicKey } = getQueryArgs(router.query);

  return (
    <Container>
      <Head>
        <title>Auth Button React</title>
      </Head>
      <FootprintAuthButton
        bootstrapData={bootstrapData}
        dialogVariant="modal"
        label="Auth with Footprint (modal)"
        onCancel={() => console.log('cancel')}
        onClose={() => console.log('close')}
        onComplete={(validationToken: string) => console.log('complete ', validationToken)}
        publicKey={publicKey}
      />
    </Container>
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

export default AuthButtonReact;
