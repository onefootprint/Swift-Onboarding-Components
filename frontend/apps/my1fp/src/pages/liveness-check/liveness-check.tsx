import { FootprintFooter } from '@onefootprint/footprint-elements';
import { IcoClose24 } from '@onefootprint/icons';
import { IconButton } from '@onefootprint/ui';
import FocusTrap from 'focus-trap-react';
import React, { useState } from 'react';
import styled, { css } from 'styled-components';
import { useEventListener, useLockedBody } from 'usehooks-ts';

import LivenessCheckMachineProvider from './components/machine-provider';
import LivenessCheckDialogBody from './pages/liveness-check-dialog-body';

export type LivenessCheckProps = {
  onClose: () => void;
};

const LIVENESS_DIALOG_CLOSE_DELAY = 1500;

const LivenessCheck = ({ onClose }: LivenessCheckProps) => {
  const [isDialogOpen, setDialogOpen] = useState(true);
  useLockedBody(isDialogOpen);
  useEventListener('keydown', event => {
    if (event.key === 'Escape') {
      onClose();
    }
  });

  const handleDoneLiveness = () => {
    setTimeout(() => {
      setDialogOpen(false);
      onClose();
    }, LIVENESS_DIALOG_CLOSE_DELAY);
  };

  return isDialogOpen ? (
    <LivenessCheckMachineProvider>
      <FocusTrap>
        <Overlay onClick={onClose} aria-modal>
          <DialogContainer
            aria-label="Liveness Check Dialog"
            data-testid="liveness-check-test-id"
            role="dialog"
            onClick={(event: React.MouseEvent<HTMLDivElement>) => {
              event.stopPropagation();
            }}
          >
            <Header>
              <CloseContainer>
                <IconButton aria-label="Close" onClick={onClose}>
                  <IcoClose24 />
                </IconButton>
              </CloseContainer>
            </Header>
            <Body>
              <LivenessCheckDialogBody onDone={handleDoneLiveness} />
            </Body>
            <FootprintFooter />
          </DialogContainer>
        </Overlay>
      </FocusTrap>
    </LivenessCheckMachineProvider>
  ) : null;
};

const DialogContainer = styled.div`
  ${({ theme }) => css`
    background-color: ${theme.backgroundColor.primary};
    border-radius: ${theme.borderRadius.default};
    box-shadow: ${theme.elevation[3]};
    z-index: ${theme.zIndex.dialog};
    width: 650px;
  `}
`;

const Header = styled.header`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 ${theme.spacing[5]};
    height: 56px;
    position: relative;
  `}
`;

const CloseContainer = styled.div`
  ${({ theme }) => css`
    position: absolute;
    left: ${theme.spacing[5]};
  `}
`;

const Body = styled.div`
  ${({ theme }) => css`
    padding: ${theme.spacing[7]};
  `}
`;

const Overlay = styled.div`
  ${({ theme }) => css`
    align-items: center;
    background: rgba(0, 0, 0, 0.3);
    display: flex;
    height: 100%;
    justify-content: center;
    left: 0;
    position: fixed;
    top: 0;
    width: 100%;
    z-index: ${theme.zIndex.overlay};
  `}
`;

export default LivenessCheck;
