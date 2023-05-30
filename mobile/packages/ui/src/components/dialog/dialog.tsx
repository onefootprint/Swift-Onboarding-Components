import { IcoClose32 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import React from 'react';
import Modal from 'react-native-modal';

import { Box } from '../box';
import { IconButton } from '../icon-button';
import { Typography } from '../typography';

export type DialogProps = {
  open?: boolean;
  onClose?: () => void;
  title: string;
  children: React.ReactNode;
};

const Dialog = ({ open, onClose, title, children }: DialogProps) => {
  return (
    <StyledModal
      backdropOpacity={0.3}
      isVisible={open}
      onBackdropPress={onClose}
      onSwipeComplete={onClose}
      swipeDirection={['down']}
      useNativeDriverForBackdrop
    >
      <Box backgroundColor="primary" borderRadius="large">
        <Box
          alignItems="flex-end"
          marginBottom={2}
          marginHorizontal={5}
          marginTop={4}
        >
          <IconButton aria-label="Close" onPress={onClose}>
            <IcoClose32 />
          </IconButton>
        </Box>
        <Box marginHorizontal={5} gap={3} marginBottom={6}>
          <Typography variant="heading-3" center>
            {title}
          </Typography>
          <Typography variant="body-3" center>
            {children}
          </Typography>
        </Box>
      </Box>
    </StyledModal>
  );
};

const StyledModal = styled(Modal)`
  ${({ theme }) => css`
    justify-content: flex-end;
    margin-bottom: ${theme.spacing[8]};
    margin-horizontal: ${theme.spacing[3]};
  `}
`;

export default Dialog;
