import { FootprintAuthButton } from '@onefootprint/footprint-react';
import styled, { css } from '@onefootprint/styled';
import Head from 'next/head';
import React from 'react';

const AuthTestDevAcme = 'ob_test_2TwubGlrWdKaJnWsQQKQYl';

const AuthButtonReact = () => (
  <Container>
    <Head>
      <title>Auth Button React</title>
    </Head>
    <FootprintAuthButton
      publicKey={AuthTestDevAcme}
      dialogVariant="modal"
      label="Auth with Footprint (modal)"
      onCancel={() => console.log('cancel')}
      onClose={() => console.log('close')}
      onComplete={(validationToken: string) =>
        console.log('complete ', validationToken)
      }
    />
  </Container>
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

export default AuthButtonReact;
