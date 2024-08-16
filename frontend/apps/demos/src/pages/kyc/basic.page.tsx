import footprint from '@onefootprint/footprint-js';
import { Button } from '@onefootprint/ui';
import Head from 'next/head';
import styled, { css } from 'styled-components';

const publicKey = process.env.NEXT_PUBLIC_KYC_KEY as string;

const Footprint = () => {
  const launchFootprint = () => {
    const component = footprint.init({
      kind: 'verify',
      publicKey,
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
          Verify with Footprint
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
