import footprint, { FootprintComponentKind } from '@onefootprint/footprint-js';
import styled, { css } from '@onefootprint/styled';
import { FootprintButton } from '@onefootprint/ui';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React from 'react';

type RouterReturn = ReturnType<typeof useRouter>;

const AcmeDevAuthKey = 'ob_test_2TwubGlrWdKaJnWsQQKQYl';
const publicKeyEnv = process.env.NEXT_PUBLIC_TENANT_KEY || AcmeDevAuthKey;

const getQueryArgs = (query: RouterReturn['query']) => {
  const { ob_key: obKey, user_data: rawUserData } = query;
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

const AuthDemo = () => {
  const router = useRouter();
  const { userData, publicKey } = getQueryArgs(router.query);

  const handleClick = () => {
    const component = footprint.init({
      kind: FootprintComponentKind.Auth,
      variant: 'modal',
      onCancel: () => console.log('demo onCancel'),
      onClose: () => console.log('demo onClose'),
      onComplete: (validationToken: string) => console.log(validationToken),
      options: { showLogo: false },
      publicKey,
      userData,
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
        <FootprintButton text="Sign in with Footprint" onClick={handleClick} />
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
