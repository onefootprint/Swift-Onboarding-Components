import footprint from '@onefootprint/footprint-js';
import { Button } from '@onefootprint/ui';
import Head from 'next/head';
import { useRouter } from 'next/router';
import styled, { css } from 'styled-components';

const Footprint = () => {
  const router = useRouter();

  const getAuthToken = () => {
    const authToken = router.query.auth_token;
    if (!authToken || typeof authToken !== 'string') {
      throw new Error('Invalid auth token');
    }
    return authToken;
  };

  const launchFootprint = () => {
    const authToken = getAuthToken();
    const component = footprint.init({
      kind: 'verify',
      authToken,
    });

    component.render();
  };

  return router.isReady ? (
    <>
      <Head>
        <title>Footprint</title>
      </Head>
      <Container>
        <Button size="large" onClick={launchFootprint}>
          Verify with Footprint
        </Button>
      </Container>
    </>
  ) : null;
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

export default Footprint;
