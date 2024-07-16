import { IcoChevronLeftBig24, IcoInfo24 } from '@onefootprint/icons';
import { Box, Pressable, Typography } from '@onefootprint/ui';
import React, { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import styled, { css } from 'styled-components/native';

import InstructionsModal from './components/instructions-modal';

const HEADER_HEIGHT = 56;

type HeaderProps = {
  children: React.ReactNode;
  onBack?: () => void;
};

const Header = ({ children, onBack }: HeaderProps) => {
  const insets = useSafeAreaInsets();
  const [showInstructions, setShowInstructions] = useState(false);
  const height = HEADER_HEIGHT;

  const handleToggleInstructions = () => {
    setShowInstructions(prevValue => !prevValue);
  };

  return (
    <>
      <StatusBar height={insets.top} />
      <Container height={height} top={insets.top}>
        <Box>
          {onBack ? (
            <Pressable onPress={onBack}>
              <IcoChevronLeftBig24 />
            </Pressable>
          ) : null}
        </Box>
        <Box>
          <Typography variant="label-2" color="primary">
            {children}
          </Typography>
        </Box>
        <Box>
          <Pressable onPress={handleToggleInstructions}>
            <IcoInfo24 />
          </Pressable>
        </Box>
      </Container>
      <InstructionsModal visible={showInstructions} onClose={handleToggleInstructions} />
    </>
  );
};

const StatusBar = styled.View<{ height: number }>`
  ${({ theme, height }) => css`
    background: ${theme.backgroundColor.primary};
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
    background: ${theme.backgroundColor.primary};
    flex-direction: row;
    height: ${height}px;
    justify-content: space-between;
    padding-horizontal: ${theme.spacing[3]};
    position: absolute;
    top: ${top}px;
    width: 100%;
    z-index: 1;
  `}
`;

export default Header;
