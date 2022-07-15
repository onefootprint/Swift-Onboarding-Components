import FocusTrap from 'focus-trap-react';
import { FootprintFooter } from 'footprint-ui';
import IcoClose24 from 'icons/ico/ico-close-16';
import React from 'react';
import { useKey, useLockBodyScroll } from 'react-use';
import styled, { css } from 'styled-components';
import { IconButton, Portal } from 'ui';

export type LivenessCheckDialogProps = {
  children?: React.ReactNode;
  closeAriaLabel?: string;
  dialogAriaLabel?: string;
  onClose: () => void;
  testID?: string;
  open?: boolean;
};

const LivenessCheckDialog = ({
  children,
  closeAriaLabel = 'Close',
  dialogAriaLabel = 'Liveness Check Dialog',
  onClose,
  testID,
  open,
}: LivenessCheckDialogProps) => {
  useLockBodyScroll(open);
  useKey('Escape', onClose);

  return open ? (
    <Portal selector="#footprint-portal">
      <FocusTrap>
        <Overlay onClick={onClose} aria-modal>
          <DialogContainer
            aria-label={dialogAriaLabel}
            data-testid={testID}
            role="dialog"
            onClick={(event: React.MouseEvent<HTMLDivElement>) => {
              event.stopPropagation();
            }}
          >
            <Header>
              <CloseContainer>
                <IconButton
                  aria-label={closeAriaLabel}
                  iconComponent={IcoClose24}
                  onClick={onClose}
                />
              </CloseContainer>
            </Header>
            <Body>{children}</Body>
            <FootprintFooter />
          </DialogContainer>
        </Overlay>
      </FocusTrap>
    </Portal>
  ) : null;
};

const DialogContainer = styled.div`
  ${({ theme }) => css`
    background-color: ${theme.backgroundColor.primary};
    border-radius: ${theme.borderRadius[2]}px;
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
    padding: 0 ${theme.spacing[5]}px;
    height: 56px;
    position: relative;
  `}
`;

const CloseContainer = styled.div`
  ${({ theme }) => css`
    position: absolute;
    left: ${theme.spacing[5]}px;
  `}
`;

const Body = styled.div`
  ${({ theme }) => css`
    padding: ${theme.spacing[7]}px;
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

export default LivenessCheckDialog;
