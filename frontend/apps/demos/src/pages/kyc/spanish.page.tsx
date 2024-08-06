import { FootprintComponentKind } from '@onefootprint/footprint-js';
import footprint from '@onefootprint/footprint-react';
import { Button } from '@onefootprint/ui';
import Head from 'next/head';
import styled, { css } from 'styled-components';

const publicKey = process.env.NEXT_PUBLIC_KYC_KEY as string;

const handleOpen = () => {
  const component = footprint.init({
    kind: FootprintComponentKind.Verify,
    publicKey,
    l10n: {
      locale: 'es-MX',
      language: 'es',
    },
  });

  component.render();
};

const Spanish = () => (
  <>
    <Head>
      <title>Footprint Spanish</title>
    </Head>
    <Container>
      <Button onClick={handleOpen} size="large">
        Verificar com Footprint
      </Button>
    </Container>
  </>
);

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

export default Spanish;
