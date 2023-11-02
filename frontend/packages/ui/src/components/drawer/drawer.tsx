import type { Icon } from '@onefootprint/icons';
import { IcoClose24 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import FocusTrap from 'focus-trap-react';
import React, { useRef } from 'react';
import {
  useEventListener,
  useLockedBody,
  useOnClickOutside,
} from 'usehooks-ts';

import type { SXStyleProps, SXStyles } from '../../hooks';
import { useSX } from '../../hooks';
import { media } from '../../utils';
import IconButton from '../icon-button';
import Overlay from '../overlay';
import Portal from '../portal';
import Typography from '../typography';
import useOpenAnimation, { State } from './hooks/use-open-animation';

export type DrawerProps = {
  children?: React.ReactNode;
  headerComponent?: React.ReactNode;
  closeAriaLabel?: string;
  closeIconComponent?: Icon;
  onClose: () => void;
  onClickOutside?: () => void;
  open?: boolean;
  testID?: string;
  title: string;
  sx?: SXStyleProps;
};

const Drawer = ({
  children,
  closeAriaLabel = 'Close',
  closeIconComponent: CloseIconComponent = IcoClose24,
  onClose,
  onClickOutside,
  open,
  testID,
  title,
  headerComponent,
  sx,
}: DrawerProps) => {
  const sxStyles = useSX(sx);
  const state = useOpenAnimation(open);
  const DrawerRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(DrawerRef, onClickOutside ?? onClose);
  useLockedBody(open);
  useEventListener('keydown', event => {
    if (event.key === 'Escape') {
      onClose();
    }
  });

  return state === State.closed ? null : (
    <Portal selector="#footprint-portal">
      <FocusTrap>
        <span>
          <Overlay aria-modal isVisible={open} />
          <DrawerContainer
            className={state}
            aria-label={title}
            data-testid={testID}
            role="dialog"
            ref={DrawerRef}
            onClick={(event: React.MouseEvent<HTMLDivElement>) => {
              event.stopPropagation();
            }}
            sx={sxStyles}
          >
            <DrawerSurface>
              <Header>
                <CloseContainer>
                  <IconButton aria-label={closeAriaLabel} onClick={onClose}>
                    <CloseIconComponent />
                  </IconButton>
                </CloseContainer>
                <Typography variant="label-2" as="h2">
                  {title}
                </Typography>
              </Header>
              {headerComponent}
              <Body>{children}</Body>
            </DrawerSurface>
          </DrawerContainer>
        </span>
      </FocusTrap>
    </Portal>
  );
};

const DrawerSurface = styled.div`
  ${({ theme }) => css`
    background-color: ${theme.surfaceColor[3]};
    border-radius: ${theme.borderRadius.default};
    height: 100%;
    overflow: hidden;
    box-shadow: ${theme.elevation[2]};
  `}
`;

const DrawerContainer = styled.div<{ sx?: SXStyles }>`
  ${({ theme, sx }) => css`
    height: 100vh;
    width: calc(500px + 2 * ${theme.spacing[3]});
    position: fixed;
    right: 0;
    top: 0;
    padding: ${theme.spacing[3]};
    transition: transform 0.2s ease-in-out;
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

    ${sx};
  `}
`;

const Header = styled.header`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    border-bottom: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    justify-content: center;
    padding: 0 ${theme.spacing[10]};
    height: 52px;
    position: relative;

    h2 {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
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
    height: calc(100% - 56px);
    overflow: auto;
  `}
`;

export default Drawer;
