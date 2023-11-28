import themes from '@onefootprint/design-tokens';
import styled, { css } from 'styled-components/native';
import { DesignSystemProvider } from '@onefootprint/ui';
import React from 'react';

import Router from '../router';

type WalletProps = {
  onLoad: () => void;
};

const Wallet = ({ onLoad }: WalletProps) => {
  return (
    <DesignSystemProvider theme={themes.light}>
      <Container onLayout={onLoad}>
        <Router />
      </Container>
    </DesignSystemProvider>
  );
};

const Container = styled.View`
  ${({ theme }) => css`
    flex: 1;
    background: ${theme.backgroundColor.primary};
  `}
`;

export default Wallet;
