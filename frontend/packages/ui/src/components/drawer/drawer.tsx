import type { Icon } from '@onefootprint/icons';
import { IcoClose24 } from '@onefootprint/icons';
import * as DrawerPrimitive from '@radix-ui/react-dialog';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css, keyframes } from 'styled-components';

import type { SXStyles } from '../../hooks';
import { media } from '../../utils';
import Box from '../box';
import Overlay from '../overlay';
import Header from './components/header';

export type DrawerProps = {
  children?: React.ReactNode;
  headerComponent?: React.ReactNode;
  closeAriaLabel?: string;
  open?: boolean;
  title: string;
  closeIconComponent?: Icon;
  onClose: () => void;
  onClickOutside?: () => void;
};

const Drawer = ({
  children,
  closeAriaLabel,
  open,
  title,
  headerComponent,
  closeIconComponent: CloseIconComponent = IcoClose24,
  onClickOutside,
  onClose,
}: DrawerProps) => {
  const { t } = useTranslation('ui');
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      onClose();
    }
  };

  return (
    <DrawerPrimitive.Root open={open} onOpenChange={handleOpenChange}>
      <DrawerContainer onEscapeKeyDown={onClose} onPointerDownOutside={onClickOutside} role="dialog">
        <DrawerSurface>
          <Header
            closeAriaLabel={closeAriaLabel ?? t('components.drawer.close-aria-label-default')}
            closeIconComponent={CloseIconComponent}
            onClose={onClose}
          >
            {title}
          </Header>
          {headerComponent}
          <Body>{children}</Body>
        </DrawerSurface>
      </DrawerContainer>
      <DrawerPrimitive.Overlay asChild>
        <Overlay isVisible={open} />
      </DrawerPrimitive.Overlay>
    </DrawerPrimitive.Root>
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

const DrawerSurface = styled(Box)`
  ${({ theme }) => css`
    background-color: ${theme.backgroundColor.primary};
    border-radius: ${theme.borderRadius.default};
    height: 100%;
    overflow: hidden;
    box-shadow: ${theme.elevation[2]};
  `}
`;

const DrawerContainer = styled(DrawerPrimitive.Content)<{ sx?: SXStyles }>`
  ${({ theme, sx }) => css`
    height: 100vh;
    width: calc(500px + 2 * ${theme.spacing[3]});
    position: fixed;
    right: 0;
    top: 0;
    padding: ${theme.spacing[3]};
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

const Body = styled.div`
  ${({ theme }) => css`
    padding: ${theme.spacing[7]};
    height: calc(100% - 56px);
    overflow: auto;
  `}
`;

export default Drawer;
