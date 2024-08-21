import { useOnClickOutside } from '@onefootprint/hooks';
import { IcoClose24 } from '@onefootprint/icons';
import { Button, Divider, IconButton, Overlay } from '@onefootprint/ui';
import FocusTrap from 'focus-trap-react';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';
import { useEffectOnce } from 'usehooks-ts';

export type ConsentBottomSheetProps = {
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
  children: React.ReactNode;
  isLoading: boolean;
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
const DEFAULT_CONTENT_HEIGHT = 400;
const SCROLL_OFFSET = 10; // We enable the button is the user scrolled with the 10px of the bottom of the content

const getContentHeight = () =>
  typeof window === 'undefined'
    ? DEFAULT_CONTENT_HEIGHT
    : Math.min(DEFAULT_CONTENT_HEIGHT, (window?.innerHeight ?? 0) * 0.6); // If the window height is smaller than 540px, we will use 80% of the window height

const ConsentBottomSheet = ({
  open,
  onClose,
  onComplete,
  isLoading,
  children,
  closeAriaLabel = 'Close',
  testID,
}: ConsentBottomSheetProps) => {
  const { t } = useTranslation('idv', {
    keyPrefix: 'document-flow.id-doc.components.id-doc-photo-prompt.consent-mobile.consent-bottomsheet',
  });
  const bottomSheetRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(bottomSheetRef, () => {
    if (open) {
      onClose?.();
    }
  });
  const [fullyScrolled, setFullyScrolled] = useState(false);

  const [visibleState, setVisibleState] = useState<State>(State.closed);
  useEffectOnce(() => {
    setVisibleState(open ? State.open : State.closed);
  });

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

  const CONTENT_HEIGHT = getContentHeight();

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
  };

  const handleScroll = (e: React.UIEvent<HTMLElement>) => {
    const target = e.target as HTMLElement;
    const isBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + SCROLL_OFFSET; // 10px allowed offset
    if (!fullyScrolled) setFullyScrolled(isBottom);
  };

  return visibleState === State.closed ? null : (
    <FocusTrap active={open}>
      <span>
        <Sheet onClick={handleClick} className={visibleState} role="dialog" data-testid={testID} ref={bottomSheetRef}>
          <Header>
            <CloseContainer onClick={onClose}>
              <IconButton aria-label={closeAriaLabel} onClick={onClose}>
                <IcoClose24 />
              </IconButton>
            </CloseContainer>
          </Header>
          <Body onScroll={handleScroll} height={CONTENT_HEIGHT}>
            {children}
          </Body>
          <Divider />
          <SubmitButtonContainer>
            <Button fullWidth onClick={onComplete} loading={isLoading} disabled={!fullyScrolled} size="large">
              {fullyScrolled ? t('submit-button.enabled-title') : t('submit-button.disabled-title')}
            </Button>
          </SubmitButtonContainer>
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

const Sheet = styled.div`
  ${({ theme }) => css`
    position: fixed;
    left: 0;
    bottom: 0;
    width: 100%;
    background-color: ${theme.backgroundColor.primary};
    border-radius: ${theme.borderRadius.xl} ${theme.borderRadius.xl} 0 0;
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

const Header = styled.div`
  ${({ theme }) => css`
    height: 52px;
    padding: ${theme.spacing[5]};
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
  `}
`;

const Body = styled.div<{ height: number }>`
  ${({ theme, height }) => css`
    padding: ${theme.spacing[5]};
    height: ${height}px;
    overflow-y: auto;
  `}
`;

const SubmitButtonContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    margin: ${theme.spacing[5]};
  `}
`;

export default ConsentBottomSheet;
