import { FootprintComponentKind } from '@onefootprint/footprint-js';
import { Button } from '@onefootprint/ui';
import Head from 'next/head';
import { useRouter } from 'next/router';
import styled, { css } from 'styled-components';

import fakeSdk from '../../../helpers/fake-sdk';
import getQueryArgs, { isString } from '../../../helpers/get-query-args';

const ENV = process.env.NEXT_PUBLIC_VERCEL_ENV;
const fallbackPKey = process.env.NEXT_PUBLIC_TENANT_KEY || 'ob_test_2TwubGlrWdKaJnWsQQKQYl';
const fallbackAppUrl = ENV === 'production' ? 'https://auth.onefootprint.com' : 'http://localhost:3011';

const getAuthArgs = (o: ReturnType<typeof getQueryArgs>) => ({
  ...o,
  publicKey: isString(o.publicKey) ? o.publicKey : fallbackPKey,
  appUrl: o.appUrl.startsWith('https://auth') || o.appUrl.startsWith('http://localhost') ? o.appUrl : fallbackAppUrl,
});

const AuthDemo = () => {
  const router = useRouter();
  const { appUrl, authToken, bootstrapData, publicKey } = getAuthArgs(getQueryArgs(router));
  if (!authToken && !publicKey) {
    console.error('No authToken or publicKey provided');
    return null;
  }

  const authProps = {
    ...(isString(authToken) ? { authToken } : { publicKey }),
    bootstrapData,
    kind: FootprintComponentKind.Auth,
    onCancel: () => console.log('demo onCancel'),
    onClose: () => console.log('demo onClose'),
    onComplete: (s: string) => console.log('demo onComplete', s),
    options: { showLogo: false },
    variant: 'modal',
  };

  const handleAuthenticateClick = () => {
    // @ts-expect-error: enum vs string match
    const component = fakeSdk.init(authProps);
    component.render(appUrl);

    return () => {
      component.destroy();
    };
  };

  const handleAuthenticateOldClick = () => {
    const { bootstrapData, ...rest } = authProps;
    // @ts-expect-error: enum vs string match
    const component = fakeSdk.init({ ...rest, userData: bootstrapData }); /** userData deprecated after 3.11.0 */
    component.render(appUrl);

    return () => {
      component.destroy();
    };
  };

  const handleUpdateFlowClick = () => {
    const component = fakeSdk.init({
      authToken,
      bootstrapData,
      kind: FootprintComponentKind.Auth,
      onCancel: () => console.log('demo onCancel'),
      onClose: () => console.log('demo onClose'),
      onComplete: (s: string) => console.log('demo onComplete', s),
      options: { showLogo: false },
      updateLoginMethods: true,
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
        <title>Footprint Auth Demo</title>
      </Head>
      <Container>
        <Button onClick={handleAuthenticateClick} variant="secondary">
          Authenticate with Footprint
        </Button>
        <br />
        <Button onClick={handleAuthenticateOldClick} variant="secondary">
          Authenticate with Footprint (via userData)
        </Button>
        <br />
        <Button onClick={handleUpdateFlowClick} variant="secondary">
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
