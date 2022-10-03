import { IcoClose24, Icon } from '@onefootprint/icons';
import FocusTrap from 'focus-trap-react';
import React from 'react';
import styled, { css } from 'styled-components';
import { useEventListener, useLockedBody } from 'usehooks-ts';

import { media } from '../../utils';
import IconButton from '../icon-button';
import Overlay from '../overlay';
import Portal from '../portal';
import Typography from '../typography';
import useOpenAnimation, { State } from './hooks/use-open-animation';

export type DrawerProps = {
  children?: React.ReactNode;
  closeAriaLabel?: string;
  closeIconComponent?: Icon;
  onClose: () => void;
  open?: boolean;
  testID?: string;
  title: string;
};

const Dialog = ({
  children,
  closeAriaLabel = 'Close',
  closeIconComponent = IcoClose24,
  onClose,
  open,
  testID,
  title,
}: DrawerProps) => {
  const state = useOpenAnimation(open);
  useLockedBody(open);
  useEventListener('keydown', event => {
    if (event.key === 'Escape') {
      onClose();
    }
  });

  return state === State.closed ? null : (
    <Portal selector="#footprint-portal">
      <FocusTrap>
        <StyledOverlay onClick={onClose} aria-modal className={state}>
          <DrawerContainer
            className={state}
            aria-label={title}
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
                  iconComponent={closeIconComponent}
                  onClick={onClose}
                />
              </CloseContainer>
              <Typography variant="label-2">{title}</Typography>
            </Header>
            <Body>{children}</Body>
          </DrawerContainer>
        </StyledOverlay>
      </FocusTrap>
    </Portal>
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

const DrawerContainer = styled.div`
  ${({ theme }) => css`
    background-color: ${theme.backgroundColor.primary};
    box-shadow: ${theme.elevation[3]};
    height: 100vh;
    position: fixed;
    right: 0;
    width: 500px;
    transition: all 0.2s ease-in-out;
    z-index: ${theme.zIndex.drawer};

    ${media.lessThan('sm')`
      width: 100vw;
      height: 100vh;
      border-radius: 0;
    `}

    &.open {
      transform: translateX(0%);
    }

    &.opening,
    &.closing {
      transform: translateX(100%);
    }
  `}
`;

const Header = styled.header`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    border-bottom: ${theme.borderWidth[1]}px solid ${theme.borderColor.tertiary};
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

export default Dialog;
