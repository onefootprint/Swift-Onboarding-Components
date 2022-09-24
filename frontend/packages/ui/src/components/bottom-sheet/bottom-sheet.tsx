import FocusTrap from 'focus-trap-react';
import { IcoClose24 } from 'icons';
import React, { useEffect, useState } from 'react';
import styled, { css } from 'styled-components';

import IconButton from '../icon-button';
import Overlay from '../overlay';
import Typography from '../typography';

export type BottomSheetProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  testID?: string;
  closeAriaLabel?: string;
};

enum State {
  open = 'open',
  opening = 'opening',
  closed = 'closed',
  closing = 'closing',
}

const OPEN_CLOSE_DELAY = 200;

const BottomSheet = ({
  open,
  onClose,
  children,
  title,
  closeAriaLabel = 'Close',
  testID,
}: BottomSheetProps) => {
  const [visibleState, setVisibleState] = useState<State>(State.closed);
  useEffect(() => {
    setVisibleState(open ? State.open : State.closed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (visibleState === State.opening || visibleState === State.closing) {
      return;
    }

    if (visibleState === State.open && !open) {
      setVisibleState(State.closing);
      setTimeout(() => {
        setVisibleState(State.closed);
      }, OPEN_CLOSE_DELAY);
      return;
    }

    if (visibleState === State.closed && open) {
      setVisibleState(State.opening);
      setTimeout(() => {
        setVisibleState(State.open);
      }, OPEN_CLOSE_DELAY);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return visibleState === State.closed ? null : (
    <FocusTrap active={open}>
      <StyledOverlay onClick={onClose} aria-modal className={visibleState}>
        <Sheet className={visibleState} role="dialog" data-testid={testID}>
          <Header hasBorder={!!title}>
            <CloseContainer onClick={onClose}>
              <IconButton
                aria-label={closeAriaLabel}
                iconComponent={IcoClose24}
                onClick={onClose}
              />
            </CloseContainer>
            {title && <Typography variant="label-2">{title}</Typography>}
          </Header>
          <Body>{children}</Body>
        </Sheet>
      </StyledOverlay>
    </FocusTrap>
  );
};

const StyledOverlay = styled(Overlay)`
  transition: all 0.2s linear;

  &.open {
    opacity: 1;
  }

  &.closing,
  &.opening {
    opacity: 0;
  }
`;

const CloseContainer = styled.div`
  ${({ theme }) => css`
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    left: ${theme.spacing[5]}px;
  `}
`;

const Sheet = styled.div`
  ${({ theme }) => css`
    width: 100%;
    background-color: ${theme.backgroundColor.primary};
    border-radius: ${theme.borderRadius[3]}px ${theme.borderRadius[3]}px 0 0;
    z-index: ${theme.zIndex.overlay + 1};
    align-self: end;
    transition: all 0.2s linear;

    &.open {
      translateY(0%);
    }

    &.opening,
    &.closing {
      transform: translateY(100%);
    }
  `}
`;

const Header = styled.div<{ hasBorder: boolean }>`
  ${({ theme, hasBorder }) => css`
    height: 56px;
    padding: ${theme.spacing[5]}px;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;

    ${hasBorder &&
    css`
      border-bottom: 1px solid ${theme.borderColor.tertiary};
    `}
  `}
`;

const Body = styled.div`
  ${({ theme }) => css`
    padding: ${theme.spacing[5]}px;
  `}
`;

export default BottomSheet;
