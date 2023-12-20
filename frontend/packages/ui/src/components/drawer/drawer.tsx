import type { Icon } from '@onefootprint/icons';
import { IcoClose24 } from '@onefootprint/icons';
import styled, { css, keyframes } from '@onefootprint/styled';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import React, { useRef } from 'react';

import { type SXStyleProps, type SXStyles, useSX } from '../../hooks';
import { media } from '../../utils';
import IconButton from '../icon-button';
import Overlay from '../overlay';
import Typography from '../typography';

export type DrawerProps = {
  children?: React.ReactNode;
  headerComponent?: React.ReactNode;
  closeAriaLabel?: string;
  closeIconComponent?: Icon;
  onClickOutside?: () => void;
  onClose: () => void;
  open?: boolean;
  title: string;
  sx?: SXStyleProps;
};

const Drawer = ({
  children,
  closeAriaLabel = 'Close',
  closeIconComponent: CloseIconComponent = IcoClose24,
  onClickOutside,
  onClose,
  open,
  title,
  headerComponent,
  sx,
}: DrawerProps) => {
  const sxStyles = useSX(sx);
  const DrawerRef = useRef<HTMLDivElement>(null);

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={newOpen => {
        if (!newOpen) {
          onClose();
        }
      }}
      defaultOpen
    >
      <DrawerContainer
        aria-label={title}
        role="dialog"
        ref={DrawerRef}
        onPointerDownOutside={onClickOutside}
        onClick={(event: React.MouseEvent<HTMLDivElement>) => {
          event.stopPropagation();
        }}
        onEscapeKeyDown={onClose}
        sx={sxStyles}
      >
        <DrawerSurface>
          <Header>
            <CloseContainer>
              <IconButton aria-label={closeAriaLabel} onClick={onClose}>
                <CloseIconComponent />
              </IconButton>
            </CloseContainer>
            <DialogPrimitive.Title asChild>
              <Typography variant="label-2" as="h2">
                {title}
              </Typography>
            </DialogPrimitive.Title>
          </Header>
          {headerComponent}
          <Body>{children}</Body>
        </DrawerSurface>
      </DrawerContainer>
      <DialogPrimitive.Overlay asChild>
        <Overlay aria-modal isVisible={open} />
      </DialogPrimitive.Overlay>
    </DialogPrimitive.Root>
  );
};

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const slideOut = keyframes`
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(100%);
    
  }
`;

const DrawerSurface = styled.div`
  ${({ theme }) => css`
    background-color: ${theme.surfaceColor[3]};
    border-radius: ${theme.borderRadius.default};
    height: 100%;
    overflow: hidden;
    box-shadow: ${theme.elevation[2]};
  `}
`;

const DrawerContainer = styled(DialogPrimitive.Content)<{ sx?: SXStyles }>`
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

    &[data-state='open'] {
      animation: ${slideIn} 0.2s ease-in;
    }

    &[data-state='closed'] {
      animation: ${slideOut} 0.2s ease-out;
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
