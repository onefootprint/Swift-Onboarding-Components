import { IcoChevronLeftBig24 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { Box, Pressable, Typography } from '@onefootprint/ui';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const HEADER_HEIGHT = 56;

type HeaderProps = {
  children: React.ReactNode;
  onBack?: () => void;
};

const Header = ({ children, onBack }: HeaderProps) => {
  const insets = useSafeAreaInsets();
  const height = HEADER_HEIGHT;

  return (
    <>
      <StatusBar height={insets.top} />
      <Container
        alignItems="flex-end"
        flexDirection="row"
        height={height}
        justifyContent="space-between"
        top={insets.top}
      >
        <Box flex={1}>
          <Pressable onPress={onBack}>
            <IcoChevronLeftBig24 color="quinary" />
          </Pressable>
        </Box>
        <Box>
          <Typography variant="label-2" color="quinary">
            {children}
          </Typography>
        </Box>
        <Box flex={1} />
      </Container>
    </>
  );
};

const StatusBar = styled.View<{ height: number }>`
  ${({ height }) => css`
    background: rgba(0, 0, 0, 0.35);
    height: ${height}px;
    left: 0;
    position: absolute;
    top: 0;
    width: 100%;
    z-index: 1;
  `}
`;

const Container = styled.View<{ height: number; top: number }>`
  ${({ theme, height, top }) => css`
    align-items: center;
    align-items: center;
    background: rgba(0, 0, 0, 0.35);
    height: ${height}px;
    padding-horizontal: ${theme.spacing[3]};
    position: absolute;
    top: ${top}px;
    width: 100%;
    z-index: 1;
  `}
`;

export default Header;
