import { IcoClose24 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import FocusTrap from 'focus-trap-react';
import React, { useEffect, useRef, useState } from 'react';

import { useOnClickOutside } from '../../hooks';
import IconButton from '../icon-button';
import Overlay from '../overlay';
import ScrollArea from '../scroll-area';
import Stack from '../stack/stack';
import Typography from '../typography';

export type BottomSheetProps = {
  open: boolean;
  onClose?: () => void;
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
  const bottomSheetRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(bottomSheetRef, () => {
    if (open) {
      onClose?.();
    }
  });

  const [visibleState, setVisibleState] = useState<State>(State.closed);
  useEffect(() => {
    setVisibleState(open ? State.open : State.closed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // TODO: Move to react-transition-group
  // https://linear.app/footprint/issue/FP-1516/add-react-transition-group
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

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
  };

  return visibleState === State.closed ? null : (
    <FocusTrap active={open}>
      <span>
        <Sheet
          onClick={handleClick}
          className={visibleState}
          role="dialog"
          data-testid={testID}
          ref={bottomSheetRef}
          direction="column"
        >
          <Header hasBorder={!!title} flexGrow={0}>
            <CloseContainer onClick={onClose}>
              <IconButton aria-label={closeAriaLabel} onClick={onClose}>
                <IcoClose24 />
              </IconButton>
            </CloseContainer>
            {title && <Typography variant="label-2">{title}</Typography>}
          </Header>
          <Body>{children}</Body>
        </Sheet>
        <Overlay aria-modal isVisible={open} />
      </span>
    </FocusTrap>
  );
};

const CloseContainer = styled.div`
  ${({ theme }) => css`
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    left: ${theme.spacing[5]};
  `}
`;

const Sheet = styled(Stack)<{
  customBottom?: string;
}>`
  ${({ theme }) => css`
    position: fixed;
    left: 0;
    bottom: 0;
    width: 100%;
    background-color: ${theme.backgroundColor.primary};
    border-radius: ${theme.borderRadius.large} ${theme.borderRadius.large} 0 0;
    z-index: ${theme.zIndex.bottomSheet};
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

const Header = styled(Stack)<{ hasBorder: boolean }>`
  ${({ theme, hasBorder }) => css`
    height: 52px;
    padding: ${theme.spacing[5]};
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

const Body = styled(ScrollArea)`
  ${({ theme }) => css`
    padding: ${theme.spacing[5]};
  `}
`;

export default BottomSheet;
