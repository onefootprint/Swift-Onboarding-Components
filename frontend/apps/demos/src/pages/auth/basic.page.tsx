import footprint from '@onefootprint/footprint-js';
import { Button } from '@onefootprint/ui';
import Head from 'next/head';
import styled, { css } from 'styled-components';

const Footprint = () => {
  const launchFootprint = () => {
    const component = footprint.init({
      kind: 'auth',
      publicKey: 'pb_test_8kX4OkY8b9acjzdNaZbVsr',
    });

    component.render();
  };

  return (
    <>
      <Head>
        <title>Footprint</title>
      </Head>
      <Container>
        <Button size="large" onClick={launchFootprint}>
          Authenticate with Footprint
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

export default Footprint;
