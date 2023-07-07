import styled, { css } from '@onefootprint/styled';
import { Typography } from '@onefootprint/ui';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const HEADER_HEIGHT = 56;

type HeaderProps = {
  children: React.ReactNode;
};

const Header = ({ children }: HeaderProps) => {
  const insets = useSafeAreaInsets();
  const height = HEADER_HEIGHT + insets.top;

  return (
    <Container height={height}>
      <Typography variant="label-2" color="quinary">
        {children}
      </Typography>
    </Container>
  );
};

const Container = styled.View<{ height }>`
  ${({ theme, height }) => css`
    align-items: center;
    background: rgba(0, 0, 0, 0.35);
    height: ${height}px;
    justify-content: flex-end;
    padding-bottom: ${theme.spacing[4]};
    position: absolute;
    width: 100%;
    z-index: 1;
  `}
`;

export default Header;
