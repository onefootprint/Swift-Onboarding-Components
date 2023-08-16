import { IcoClose32 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import React from 'react';
import Modal from 'react-native-modal';

import { Box } from '../box';
import { Button } from '../button';
import { IconButton } from '../icon-button';
import { StatusBar } from '../status-bar';
import { Typography } from '../typography';

export type DialogProps = {
  children: React.ReactNode;
  cta?: {
    loading?: boolean;
    label: string;
    onPress: () => void;
  };
  onClose?: () => void;
  open?: boolean;
  title: string;
  disableClose?: boolean;
};

const Dialog = ({
  children,
  cta,
  onClose,
  open,
  title,
  disableClose,
}: DialogProps) => {
  return (
    <>
      <StatusBar variant={open ? 'on-dialog' : 'default'} />
      <StyledModal
        backdropOpacity={0.3}
        isVisible={open}
        onBackdropPress={disableClose ? undefined : onClose}
        onSwipeComplete={disableClose ? undefined : onClose}
        swipeDirection={['down']}
        useNativeDriverForBackdrop
      >
        <Box backgroundColor="primary" borderRadius="large">
          <Box
            alignItems="flex-end"
            marginBottom={2}
            marginHorizontal={5}
            marginTop={4}
            height={32}
          >
            {disableClose ? null : (
              <IconButton aria-label="Close" onPress={onClose}>
                <IcoClose32 />
              </IconButton>
            )}
          </Box>
          <Box marginHorizontal={5} gap={3} marginBottom={6}>
            <Typography variant="heading-3" center>
              {title}
            </Typography>
            <Box>{children}</Box>
            {cta && (
              <Button onPress={cta.onPress} marginTop={7} loading={cta.loading}>
                {cta.label}
              </Button>
            )}
          </Box>
        </Box>
      </StyledModal>
    </>
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
